const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");

// 1. मुफ़्त Firebase Admin SDK को सुरक्षित रूप से शुरू करें
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      // नेटलिफ़ाई की सीक्रेट की से न्यू-लाइन कैरेक्टर्स (\n) को ठीक करना ज़रूरी है
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// 2. Gemini AI को अपनी अपग्रेड की (Key) के साथ सेटअप करें
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.handler = async (event) => {
  // CORS प्री-फ़्लाइट रिक्वेस्ट को संभालना (ताकि फ्रंटएंड ब्लॉक न हो)
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

  // यूज़र ने ऐप में जो भी टॉपिक (जैसे: ranthambore) खोजा है, उसे पढ़ें
  const topic = (event.queryStringParameters.topic || "rajasthan gk").toLowerCase().trim();

  try {
    // स्टेप A: सबसे पहले मुफ़्त डेटाबेस (Firebase) में क्विज़ चेक करें
    const docRef = db.collection("quizzes").doc(topic);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      // क्विज़ मौजूद है! इसे तुरंत मुफ़्त में (FREE) यूज़र को भेजें
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(docSnap.data()),
      };
    }

    // स्टेप B: अगर डेटाबेस में नहीं है, तो अपग्रेड Gemini AI को कॉल करके 15 प्रश्नों की अनूठी क्विज़ बनाएं
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Generate a complete 15-question unique multiple-choice quiz about ${topic} in Hindi language. Every question must have distinct choices.`,
      config: {
        temperature: 0.6,
        maxOutputTokens: 4000,
        responseMimeType: "application/json"
      }
    });

    const quizData = JSON.parse(aiResponse.text);

    // स्टेप C: इस नई क्विज़ को अगली बार के लिए मुफ़्त डेटाबेस में हमेशा के लिए सेव करें
    await docRef.set(quizData);

    // यूज़र को नई बनी हुई क्विज़ वापस भेजें
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(quizData),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "System failed", details: error.toString() }),
    };
  }
};
