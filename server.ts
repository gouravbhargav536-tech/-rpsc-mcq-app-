import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

// 1. Firebase Admin SDK को शुरू करें
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    }),
  });
}
const db = admin.firestore();

// 2. Upgraded Gemini AI को सेटअप करें
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 3. मुख्य क्विज़ एपीआई रूट (Route)
app.get('/api/quiz', async (req, res) => {
  const topic = (req.query.topic as string || "rajasthan gk").toLowerCase().trim();

  try {
    // स्टेप A: पहले Firebase डेटाबेस में क्विज़ चेक करें
    const docRef = db.collection("quizzes").doc(topic);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return res.json(docSnap.data()); // डेटाबेस में सेव क्विज़ तुरंत भेजें (खर्च ₹0)
    }

    // स्टेप B: अगर डेटाबेस खाली है, तो अपग्रेड जेमिनी से क्विज़ बनवाएं
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `You are a Quiz Generator. Generate a complete 15-question unique multiple-choice quiz about '${topic}' in Hindi language. 
      Return ONLY a raw valid JSON object matching this structure:
      {
        "quiz_title": "Quiz Title",
        "questions": [
          {
            "id": 1,
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "Exact text of correct option"
          }
        ]
      }`,
      config: {
        temperature: 0.5,
        maxOutputTokens: 4000,
        responseMimeType: "application/json"
      }
    });

    const quizData = JSON.parse(aiResponse.text.trim());

    // स्टेप C: भविष्य के लिए इस नई क्विज़ को डेटाबेस में सेव करें
    await docRef.set(quizData);

    return res.json(quizData);

  } catch (error: any) {
    console.error("Quiz Server Error:", error);
    return res.status(500).json({ error: "Unable to generate quiz.", details: error.toString() });
  }
});

// सर्वर को लाइव करें
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Quiz server running on port ${PORT}`);
});
