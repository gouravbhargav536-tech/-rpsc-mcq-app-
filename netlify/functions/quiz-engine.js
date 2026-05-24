const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");

// 1. Firebase Admin SDK को सुरक्षित रूप से शुरू करें
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    }),
  });
}

const db = admin.firestore();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.handler = async (event) => {
  // CORS प्री-फ़्लाइट हैंडलर (ताकि फ्रंटएंड ब्लॉक न हो)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: "",
    };
  }

  const topic = (event.queryStringParameters.topic || "rajasthan gk").toLowerCase().trim();

  try {
    // स्टेप A: पहले Firebase डेटाबेस में क्विज़ चेक करें
    const docRef = db.collection("quizzes").doc(topic);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(docSnap.data()),
      };
    }

    // स्टेप B: सख्त सिस्टम प्रॉम्ट के साथ अपग्रेड जेमिनी को कॉल करें
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `You are a Quiz Generator API. Generate a complete 15-question unique multiple-choice quiz about '${topic}' in Hindi language. 
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
        responseMimeType: "application/json" // शुद्ध JSON आउटपुट
      }
    });

    // एआई के टेक्स्ट को पार्स करें
    const cleanText = aiResponse.text.trim();
    const quizData = JSON.parse(cleanText);

    // स्टेप C: भविष्य के लिए डेटाबेस में सेव करें
    await docRef.set(quizData);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(quizData),
    };

  } catch (error) {
    console.error("Quiz Engine Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Unable to generate quiz. Please try again.", details: error.toString() }),
    };
  }
};
