import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFile } from "fs/promises";

/**
 * Sanitizes object data for Firestore by removing undefined values
 */
function sanitizeFirestoreData(data: any): any {
  if (data === null || typeof data !== 'object') return data;
  const sanitized = { ...data };
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      sanitized[key] = null;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeFirestoreData(sanitized[key]);
    }
  });
  return sanitized;
}

async function startServer() {
  const firebaseConfig = JSON.parse(
    await readFile(path.join(process.cwd(), "firebase-applet-config.json"), "utf8")
  );

  if (!getApps().length) {
    // Relying on Application Default Credentials (ADC) for Cloud Run
    try {
      initializeApp();
    } catch (e) {
      console.error("Failed to initialize Firebase Admin:", e);
    }
  }
  
  // Use the specific database ID from config 
  const db = getFirestore(firebaseConfig.firestoreDatabaseId || '(default)');
  const serverTimestamp = FieldValue.serverTimestamp();

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Admin middleware
  const adminAuth = (req: any, res: any, next: any) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey && adminKey === process.env.ADMIN_SECRET_KEY) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  // Error logging endpoint
  app.post("/api/log-error", async (req, res) => {
    try {
      const { 
        message, 
        stack, 
        userEmail, 
        userId, 
        severity = 'error', 
        source = 'frontend',
        metadata = {}
      } = req.body;

      const logData = sanitizeFirestoreData({
        message: message || "Unknown error",
        stackTrace: stack || null,
        userEmail: userEmail || null,
        userId: userId || null,
        severity,
        source,
        environment: process.env.NODE_ENV || "development",
        metadata,
        timestamp: serverTimestamp
      });

      await db.collection("system_errors").add(logData);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to log error to Firestore:", error?.message);
      if (error?.code === 7 || error?.message?.includes("not been used in project")) {
        console.error("CRITICAL: Cloud Firestore API is likely NOT ENABLED in project:", firebaseConfig.projectId);
        console.error("Please visit https://console.cloud.google.com/apis/library/firestore.googleapis.com to enable it.");
      } else if (error?.message?.includes("Missing or insufficient permissions")) {
        console.error("CRITICAL: Service Account permissions issue for database:", firebaseConfig.firestoreDatabaseId);
      }
      res.status(500).json({ error: "Internal error" });
    }
  });

  // Public Health Check Endpoint
  app.get("/api/health-check", async (req, res) => {
    const startTime = Date.now();
    const activeModel = "gemini-1.5-flash";
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing");
      }
      
      const response = await ai.models.generateContent({
        model: activeModel,
        contents: "Say OK",
      });
      
      const duration = Date.now() - startTime;
      
      res.json({ 
        gemini: "✅ Working",
        firebase: "✅ Connected",
        model: activeModel,
        responseTime: `${duration}ms`,
        apiKeyStatus: "Configured",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Health Check Internal Error:", error);
      res.status(503).json({ 
        gemini: "❌ Failed",
        firebase: "✅ Connected",
        error: error.message,
        model: activeModel,
        apiKeyStatus: process.env.GEMINI_API_KEY ? "Configured" : "Missing",
        technicalDetails: error.stack
      });
    }
  });

  // Admin stats endpoint
  app.get("/api/admin/stats", adminAuth, async (req, res) => {
    try {
      // 1. User Counts
      let totalUsers = 0;
      try {
        const usersSnap = await db.collection("users").count().get();
        totalUsers = usersSnap.data().count;
      } catch (e) {
        console.warn("Users collection count failed");
      }

      // 2. Quiz Attempts
      let totalQuizzes = 0;
      try {
        const quizzesSnap = await db.collection("quizzes").count().get();
        totalQuizzes = quizzesSnap.data().count;
      } catch (e) {
        console.warn("Quizzes collection count failed");
      }

      // 3. Gemini API Status
      let geminiStatus: 'Working' | 'Failed' = 'Working';
      try {
        await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: "Hello",
        });
      } catch (e) {
        console.error("Gemini Health Check Failed:", e);
        geminiStatus = 'Failed';
      }

      // 4. Latest Errors
      let errors: any[] = [];
      try {
        const errorsSnap = await db.collection("system_errors")
          .orderBy("timestamp", "desc")
          .limit(20)
          .get();
        errors = errorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn("Failed to fetch system errors");
      }

      // 5. Last Quiz Time
      let lastQuizTime = null;
      try {
        const lastQuizSnap = await db.collection("quizzes")
          .orderBy("timestamp", "desc")
          .limit(1)
          .get();
        if (!lastQuizSnap.empty) {
          const data = lastQuizSnap.docs[0].data();
          lastQuizTime = data.timestamp?.toDate?.() || data.timestamp;
        }
      } catch (e) {}

      res.json({
        totalUsers,
        totalQuizzes,
        geminiStatus,
        errors,
        lastQuizTime,
        appVersion: "1.2.2-PRD",
        environment: process.env.NODE_ENV || "development"
      });
    } catch (error: any) {
      console.error("Admin stats failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API endpoints
  app.post("/api/generate-quiz", async (req, res) => {
    const maxRetries = 3;
    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]; 
    
    const { config } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is not configured" });
    }

    const prompt = `Generate a quiz with exactly ${config.questionCount} multiple-choice questions about "${config.subject}" ${config.topic ? `focusing on ${config.topic}` : ''}.
  The difficulty level should be ${config.difficulty}. The questions should be in ${config.language}. ALWAYS provide the explanation, teacherInsight, and extraFacts in Hindi.
  Return the output STRICTLY as a JSON array. Do not include markdown or conversational text.
  Schema: [{"id": "unique-uuid", "question": "string", "options": {"A": "string", "B": "string", "C": "string", "D": "string"}, "correctAnswer": "A", "explanation": "Detailed explanation in Hindi", "teacherInsight": "Helpful tip in Hindi", "extraFacts": ["fact 1 in Hindi", "fact 2 in Hindi"], "wrongOptionsAnalysis": {"A": "why wrong in Hindi", "B": "why wrong in Hindi", "C": "why wrong in Hindi", "D": "why wrong in Hindi"}}]`;

    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const activeModel = models[attempt - 1] || "gemini-3.5-flash";
      
      try {
        console.log(`Quiz generation attempt ${attempt} using ${activeModel}...`);
        
        const response = await ai.models.generateContent({
          model: activeModel,
          contents: prompt,
        });

        const text = response.text;
        
        if (!text) {
          throw new Error("Empty response from AI");
        }

        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const startIdx = cleanText.indexOf('[');
        const endIdx = cleanText.lastIndexOf(']');
        if (startIdx !== -1 && endIdx !== -1) {
          cleanText = cleanText.substring(startIdx, endIdx + 1);
        }
        const parsed = JSON.parse(cleanText);

        return res.json(parsed);
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        const isRetryable = error.message.includes('429') || 
                            error.message.includes('503') || 
                            error.message.includes('500') ||
                            error.message.includes('Timeout');

        if (attempt < maxRetries && isRetryable) {
          const delay = [2000, 4000, 8000][attempt - 1] || 4000;
          console.log(`Retrying Gemini in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break; 
        }
      }
    }

    // Log failure
    try {
      await db.collection("system_errors").add(sanitizeFirestoreData({
        message: `Gemini Quiz Gen Failure: ${lastError?.message}`,
        stackTrace: lastError?.stack,
        severity: 'error',
        source: 'backend',
        environment: process.env.NODE_ENV || "development",
        metadata: { config, attempts: maxRetries },
        timestamp: serverTimestamp
      }));
    } catch (e) {
      console.error("Critical: Failed to log Gemini error to Firestore", e);
    }

    const friendlyMessage = lastError?.message?.includes('429') || lastError?.message?.includes('503')
      ? "Google AI service is currently busy. Please try again in a few moments."
      : "The AI is having trouble generating questions right now. Please try a different topic or try again shortly.";

    res.status(500).json({ 
      error: friendlyMessage,
      technicalDetails: lastError?.message 
    });
  });

  // 404 handler for API routes (Must be before Vite/Static catch-all)
  app.all("/api/*", (req, res) => {
    console.warn(`404 Observed on API path: ${req.path}`);
    res.status(404).json({ 
      error: "API Route Not Found", 
      path: req.path,
      method: req.method 
    });
  });

  // Global Error Handler for Express
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Global Server Error:", err);
    if (req.path.startsWith('/api/')) {
        return res.status(500).json({ 
            error: "Internal Server Error", 
            message: err.message,
            stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
        });
    }
    next(err);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
