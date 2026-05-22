// ========================= ADVANCED GOOGLE GROUNDED QUIZ ENGINE =========================
import { Question, QuizConfig } from "../types";

const MAX_RETRIES = 3;

// ========================= SAFE JSON PARSER =========================
function safeJSONParse(text: string): any {
  try {
    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\n/g, " ")
      .trim();

    const first = cleaned.indexOf("[");
    const last = cleaned.lastIndexOf("]");

    if (first !== -1 && last !== -1) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }
    return null;
  } catch (err) {
    console.error("JSON Parsing failed:", err);
    return null;
  }
}

// ========================= NORMALIZER =========================
function normalizeQuestion(q: any, language: string): Question {
  let finalQuestion = q.question || "Question Text Missing";
  let finalExplanation = q.explanation || "";
  let finalOptions = q.options || { A: "", B: "", C: "", D: "" };

  if (language === "Bilingual") {
    finalQuestion = `${q.question_hindi || ""}\n${q.question_english || ""}`;
    finalOptions = {
      A: `${q.options_bilingual?.A?.hindi || q.options?.A || ""} / ${q.options_bilingual?.A?.english || q.options?.A || ""}`,
      B: `${q.options_bilingual?.B?.hindi || q.options?.B || ""} / ${q.options_bilingual?.B?.english || q.options?.B || ""}`,
      C: `${q.options_bilingual?.C?.hindi || q.options?.C || ""} / ${q.options_bilingual?.C?.english || q.options?.C || ""}`,
      D: `${q.options_bilingual?.D?.hindi || q.options?.D || ""} / ${q.options_bilingual?.D?.english || q.options?.D || ""}`,
    };
    finalExplanation = `हिन्दी व्याख्या: ${q.explanation_hindi || ""}\nEnglish Exp: ${q.explanation_english || ""}`;
  } else if (language === "Hindi") {
    finalQuestion = q.question_hindi || q.question;
    finalExplanation = q.explanation_hindi || q.explanation || "";
  } else if (language === "English") {
    finalQuestion = q.question_english || q.question;
    finalExplanation = q.explanation_english || q.explanation || "";
  }

  return {
    id: crypto.randomUUID(),
    question: finalQuestion,
    options: finalOptions,
    correctAnswer: q.correctAnswer || "A",
    explanation: finalExplanation,
    explanationHindi: q.explanation_hindi || "",
    explanationEnglish: q.explanation_english || "",
    teacherInsight: q.teacherInsight || "",
    wrongOptionsAnalysis: q.wrongOptionsAnalysis || {},
    extraFacts: q.extraFacts || [],
    subject: q.subject || "General",
  };
}

// ========================= DIRECT GOOGLE AI STUDIO SEARCH CALL =========================
async function fetchGroundedQuestionsFromGoogle(prompt: string): Promise<any[]> {
  try {
    // आपकी गुप्त API Key जो .env और Netlify में सेव होनी चाहिए
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("VITE_GEMINI_API_KEY is missing! Using local proxy fallback.");
      // यदि .env काम नहीं कर रहा तो पुराना नेटलिफ़ फंक्शन बैकअप की तरह चलेगा
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      return safeJSONParse(data.text || "[]");
    }

    // सीधे गूगल के सर्वर (Gemini 1.5 Pro) को लाइव सर्च के निर्देशों के साथ कॉल करना
    const response = await fetch(`https://googleapis.com{apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // 🔍 लाइव गूगल सर्च टूल चालू करना (Google Search Grounding)
        tools: [{ googleSearchRetrieval: {} }], 
        generationConfig: {
          temperature: 0.85, // विविधता बढ़ाने के लिए टेम्परेचर ज्यादा रखा गया है
          maxOutputTokens: 8192,
          responseMimeType: "application/json" // सीधा JSON आउटपुट की मांग
        }
      })
    });

    if (!response.ok) throw new Error(`Google API Cloud status: ${response.status}`);

    const result = await response.json();
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    return safeJSONParse(rawText);

  } catch (err) {
    console.error("Direct Google AI Studio Connection Failed:", err);
    return [];
  }
}

// ========================= DYNAMIC MAIN GENERATOR =========================
export async function generateQuizQuestions(config: QuizConfig): Promise<Question[]> {
  const {
    subject = "General Knowledge",
    topic = "Random High Yield",
    language = "Bilingual",
    difficulty = "Medium",
    questionCount = 10,
  } = config;

  const finalQuestionsList: Question[] = [];
  const duplicatePreventionSet = new Set<string>();
  let loopTracker = 0;

  while (finalQuestionsList.length < questionCount && loopTracker < MAX_RETRIES) {
    loopTracker++;
    const remainingCount = questionCount - finalQuestionsList.length;
    
    // 🎲 एन्टी-रिपीटीशन मैकेनिज्म: हर मिलीसेकंड में एक नया रैंडम कोड जेनरेट करना
    const uniqueEntropySeed = `${Date.now()}-${Math.random()}`;

    const advancedPrompt = `
      You are India's leading civil services examination question setter for RPSC RAS, SSC, and state exams.
      
      CORE MANDATE:
      Use your integrated Google Search tool to browse current notifications, authentic historical papers, current affairs, and wikipedia records to compile exactly ${remainingCount} unique and fresh questions.
      
      SPECIFICATION DETAILS:
      - Primary Field/Subject: ${subject}
      - Focused Chapter/Topic: ${topic}
      - Difficulty Benchmark: ${difficulty}
      - UI Output Language Mode: ${language}
      - Random Entropy Reference Seed: ${uniqueEntropySeed}
      
      CRITICAL INSTRUCTIONS:
      1. Every single question must target a completely independent concept. Do not repeat facts.
      2. Base explanations on authentic facts retrieved from live government or board sources.
      
      Return strictly as a clean JSON array structure:
      [
        {
          "question": "Base question context",
          "question_hindi": "प्रश्न हिन्दी में",
          "question_english": "Question in clear English",
          "options": { "A": "Ans 1", "B": "Ans 2", "C": "Ans 3", "D": "Ans 4" },
          "options_bilingual": {
            "A": { "hindi": "", "english": "" },
            "B": { "hindi": "", "english": "" },
            "C": { "hindi": "", "english": "" },
            "D": { "hindi": "", "english": "" }
          },
          "correctAnswer": "B",
          "explanation_hindi": "पूर्ण हिन्दी व्याख्या",
          "explanation_english": "Complete English detailed explanation",
          "teacherInsight": "Strategic tip for student",
          "wrongOptionsAnalysis": { "A": "Why false", "B": "Why true", "C": "Why false", "D": "Why false" },
          "extraFacts": ["Verified related bullet point 1"]
        }
      ]
    `;

    const rawResponseArray = await fetchGroundedQuestionsFromGoogle(advancedPrompt);

    if (Array.isArray(rawResponseArray)) {
      for (const rawObject of rawResponseArray) {
        const uniqueKeyString = (rawObject.question_english || rawObject.question || "").trim().toLowerCase();

        if (!duplicatePreventionSet.has(uniqueKeyString) && finalQuestionsList.length < questionCount) {
          duplicatePreventionSet.add(uniqueKeyString);
          finalQuestionsList.push(normalizeQuestion(rawObject, language));
        }
      }
    }
  }

  return finalQuestionsList;
}

// (फाइल को टूटने से बचाने के लिए पुराने अतिरिक्त फंक्शन्स को नीचे बनाए रखा गया है)
export async function fetchRPSCNotifications() { return []; }
export async function analyzeVideoContent(video: any) { return {}; }
