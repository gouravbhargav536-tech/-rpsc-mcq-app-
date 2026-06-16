import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import crypto from "crypto";

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

  let appInstance;
  if (!getApps().length) {
    try {
      appInstance = initializeApp({
        projectId: firebaseConfig.projectId
      });
      console.log("Firebase Admin initialized for project:", firebaseConfig.projectId);
    } catch (e) {
      console.error("Failed to initialize Firebase Admin:", e);
    }
  } else {
    appInstance = getApps()[0];
  }
  
  // Try to determine the effective database ID
  const effectiveDbId = firebaseConfig.firestoreDatabaseId || '(default)';
  console.log("Targeting Firestore Database:", effectiveDbId);
  
  const db = getFirestore(appInstance, effectiveDbId);
  const serverTimestamp = FieldValue.serverTimestamp();

  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  const IV_LENGTH = 16;
  
  function encrypt(text: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex').slice(0,32), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }
  
  function decrypt(text: string) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex').slice(0,32), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  const getProviderKey = async (provider: string) => {
    const keysSnap = await db.collection("api_keys")
      .where("provider", "==", provider)
      .where("enabled", "==", true)
      .get();
    
    if (keysSnap.docs.length > 0) {
      const keyDoc = keysSnap.docs[0];
      return decrypt(keyDoc.data().key);
    }
    
    if (provider === 'gemini') return process.env.GEMINI_API_KEY;
    return null;
  };

  // API Key Endpoints
  app.post("/api/keys", adminAuth, async (req, res) => {
    const { provider, key } = req.body;
    await db.collection("api_keys").add({
      provider,
      key: encrypt(key),
      enabled: true,
      status: 'pending',
      lastTested: null,
      createdAt: serverTimestamp
    });
    res.json({ success: true });
  });

  app.get("/api/keys", adminAuth, async (req, res) => {
    const keysSnap = await db.collection("api_keys").get();
    const keys = keysSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      key: '****' // Don't send the decrypted key!
    }));
    res.json(keys);
  });


  // Example of using the new custom API key if needed elsewhere
  const customApiKey = process.env.MY_CUSTOM_API_KEY;
  if (customApiKey) {
    console.log("Custom API key is available for use.");
  }

  let aiInstance: GoogleGenAI | null = null;
  const getAI = () => {
    if (!aiInstance) {
      if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set.");
        return null;
      }
      aiInstance = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiInstance;
  };

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
      console.error("Failed to log error to Firestore:", {
        message: error?.message,
        code: error?.code,
        details: error?.details
      });
      
      const isApiDisabled = error?.code === 7 || 
                            error?.message?.includes("not been used in project") || 
                            error?.message?.includes("has not been used in project") ||
                            error?.message?.includes("API has not been used");
      
      const isPermissionDenied = error?.code === 7 || error?.message?.includes("Missing or insufficient permissions");

      if (isApiDisabled) {
        console.error("CRITICAL: Cloud Firestore API is NOT ENABLED in project:", firebaseConfig.projectId);
        console.error("Action Required: Enable it at https://console.cloud.google.com/apis/library/firestore.googleapis.com");
        
        return res.status(503).json({ 
          error: "Database configuration incomplete", 
          message: "The Cloud Firestore API must be enabled in the Google Cloud Console for this project.",
          apiLink: `https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=${firebaseConfig.projectId}`
        });
      }

      if (isPermissionDenied) {
        console.error("CRITICAL: Permission Denied for project:", firebaseConfig.projectId);
        console.error("Database ID:", firebaseConfig.firestoreDatabaseId);
        console.error("This usually means the Service Account doesn't have roles/datastore.user or the rules are too restrictive (though admin usually bypasses them).");
        
        return res.status(403).json({
          error: "Permission Denied",
          message: "The service account does not have sufficient permissions to write to this database instance.",
          projectId: firebaseConfig.projectId,
          databaseId: firebaseConfig.firestoreDatabaseId
        });
      }
      
      res.status(500).json({ error: "Internal logging error" });
    }
  });

  // Public Health Check Endpoint
  app.get("/api/health-check", async (req, res) => {
    const startTime = Date.now();
    const activeModel = "gemini-1.5-flash";
    try {
      const ai = getAI();
      if (!ai) {
        throw new Error("Gemini API key is not configured.");
      }
      const response = await ai.models.generateContent({
        model: activeModel,
        contents: "Say OK",
      });
      
      const duration = Date.now() - startTime;
      
      // Check Firebase Connectivity
      let firebaseStatus = "✅ Connected";
      try {
        await db.collection('health_check').doc('ping').get();
      } catch (e: any) {
        console.error("Firebase Health Check Detail:", e.message, "Code:", e.code);
        if (e?.message?.includes("not been used in project") || e?.message?.includes("API has not been used")) {
          firebaseStatus = "❌ API Disabled";
        } else if (e?.code === 7 || e?.message?.includes("Missing or insufficient permissions")) {
          firebaseStatus = "🚫 Permission Denied";
        } else if (e?.code === 5) {
          firebaseStatus = "❓ DB Not Found";
        } else {
          firebaseStatus = `⚠️ Issue: ${e.code || 'Unknown'}`;
        }
      }
      
      res.json({ 
        gemini: "✅ Working",
        firebase: firebaseStatus,
        customApiKey: process.env.MY_CUSTOM_API_KEY ? "✅ Configured" : "⚠️ Missing",
        model: activeModel,
        responseTime: `${duration}ms`,
        apiKeyStatus: "Configured",
        timestamp: new Date().toISOString(),
        projectId: firebaseConfig.projectId
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

  // API key status check
  app.get("/api/check-keys", async (req, res) => {
    res.json({
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "✅ Configured" : "⚠️ Missing",
      MY_CUSTOM_API_KEY: process.env.MY_CUSTOM_API_KEY ? "✅ Configured" : "⚠️ Missing",
      ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY ? "✅ Configured" : "⚠️ Missing"
    });
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
        const ai = getAI();
        if (!ai) throw new Error("Gemini API not configured");
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
    const { config } = req.body;
    
    // Providers to try in order
    const providers = ['gemini', 'openai', 'anthropic', 'groq', 'openrouter'];
    
    let lastError: any = null;

    for (const provider of providers) {
      const apiKey = await getProviderKey(provider);
      if (!apiKey) continue;

      try {
        console.log(`Attempting quiz generation with ${provider}...`);
        
        let ai: any;
        if (provider === 'gemini') {
          ai = new GoogleGenAI({ apiKey });
        } else {
             throw new Error(`Provider ${provider} not fully integrated yet.`);
        }

        const prompt = `Generate a quiz with exactly ${config.questionCount} multiple-choice questions about "${config.subject}" ${config.topic ? `focusing on ${config.topic}` : ''}.
  The difficulty level should be ${config.difficulty}. The questions should be in ${config.language}. ALWAYS provide the explanation, teacherInsight, and extraFacts in Hindi.
  Return the output STRICTLY as a JSON array. Do not include markdown or conversational text.
  Schema: [{"id": "unique-uuid", "question": "string", "options": {"A": "string", "B": "string", "C": "string", "D": "string"}, "correctAnswer": "A", "explanation": "Detailed explanation in Hindi", "teacherInsight": "Helpful tip in Hindi", "extraFacts": ["fact 1 in Hindi", "fact 2 in Hindi"], "wrongOptionsAnalysis": {"A": "why wrong in Hindi", "B": "why wrong in Hindi", "C": "why wrong in Hindi", "D": "why wrong in Hindi"}}]`;
        
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
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
        console.error(`${provider} attempt failed:`, error.message);
        // Log failure to Firestore
      }
    }
    
    // All failed
    res.status(500).json({ error: "All AI providers failed.", technicalDetails: lastError?.message });
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
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
