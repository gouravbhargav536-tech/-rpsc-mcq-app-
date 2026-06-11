import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { config } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Generate a quiz with exactly ${config.questionCount} multiple-choice questions about "${config.subject}" ${config.topic ? `focusing on ${config.topic}` : ''}.
  The difficulty level should be ${config.difficulty}. The questions should be in ${config.language}. ALWAYS provide the explanation, teacherInsight, and extraFacts in Hindi.
  Return the output STRICTLY as a JSON array. Do not include markdown or conversational text.
  Schema: [{"id": "unique-uuid", "question": "string", "options": {"A": "string", "B": "string", "C": "string", "D": "string"}, "correctAnswer": "A", "explanation": "Detailed explanation in Hindi", "teacherInsight": "Helpful tip in Hindi", "extraFacts": ["fact 1 in Hindi", "fact 2 in Hindi"], "wrongOptionsAnalysis": {"A": "why wrong in Hindi", "B": "why wrong in Hindi", "C": "why wrong in Hindi", "D": "why wrong in Hindi"}}]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const startIdx = cleanText.indexOf('[');
      const endIdx = cleanText.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1) {
        cleanText = cleanText.substring(startIdx, endIdx + 1);
      }
      const parsed = JSON.parse(cleanText);

      res.json(parsed);
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ error: error.message || "Failed to generate quiz" });
    }
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
