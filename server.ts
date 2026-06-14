import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as adminApp from 'firebase-admin/app';
import * as adminFirestore from 'firebase-admin/firestore';
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

  if (!adminApp.getApps().length) {
    adminApp.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
  
  // Use specific database ID for Enterprise tier if provided
  const db = adminFirestore.getFirestore(firebaseConfig.firestoreDatabaseId || undefined);

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

  const serverTimestamp = adminFirestore.FieldValue.serverTimestamp();

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
    } catch (error) {
      console.error("Failed to log error to Firestore:", error);
      res.status(500).json({ error: "Internal error" });
    }
  });

  // Public Health Check Endpoint
  app.get("/api/health-check", async (req, res) => {
    try {
      const geminiModel = ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: "Say OK",
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 10000)
      );

      await Promise.race([geminiModel, timeoutPromise]);
      
      res.json({ 
        gemini: "✅ Working",
        firebase: "✅ Connected",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(503).json({ 
        gemini: "❌ Failed",
        firebase: "✅ Connected", // If we got here, server is up
        error: error.message
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
          model: "gemini-3.5-flash",
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
        appVersion: "1.2.1",
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
    const models = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.5-flash"]; 
    
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
        
        const generatePromise = ai.models.generateContent({
          model: activeModel,
          contents: prompt,
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Gemini Request Timeout")), 45000)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
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
