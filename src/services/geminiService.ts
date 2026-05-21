import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizConfig } from "../types";

const HARDCODED_GEMINI_KEY = "AIzaSyB25-Xw-aAFboli6Ld0X0Mjj89crv22fjc";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || HARDCODED_GEMINI_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined.");
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey });
  }
  return aiInstance;
}

export async function generateQuizQuestions(config: QuizConfig): Promise<Question[]> {
  const { subject, difficulty, language, questionCount, topic, pattern, mode } = config;
  const ai = getAI();

  const isLiveQuiz = subject === 'Daily Live Quiz';
  const isDailyChallenge = mode === 'daily';
  
  // 🎯 इम्प्रूव्ड: बैचिंग लॉजिक को फुलप्रूफ और सटीक बनाया गया है
  let chunkSizes: number[] = [];
  if (isDailyChallenge) {
    chunkSizes.push(10); 
  } else {
    let remaining = questionCount;
    const maxChunkSize = questionCount >= 30 ? 10 : 5;
    while (remaining > 0) {
      const take = Math.min(maxChunkSize, remaining);
      chunkSizes.push(take);
      remaining -= take;
    }
  }

  const patternScope = pattern === '2012-2020' 
    ? 'Old Pattern (2012–2020): Direct factual questions, simple recall-based.' 
    : 'New Pattern (2021–2026): Statement-based, confusing options, analytical, modern exam style.';

  const examStyles = [
    "Standard MCQ: Direct, hard factual question with 4 complex but distinct options based on official government records.",
    "Statement-based: Give 2-3 detailed clauses/statements, and ask the candidate to determine which ones are correct.",
    "Assertion & Reason: Specify an Assertion (A) and Reason (R).",
    "Chronology: List 4-5 historical events and ask for correct chronological sequence.",
    "Match the Column: Present two columns mapping districts to features or schemes to years."
  ];

  const generateBatch = async (batchCount: number, batchIndex: number, totalBatches: number): Promise<any[]> => {
    const selectedStyle = examStyles[batchIndex % examStyles.length];
    
    let prompt = "";
    if (isDailyChallenge) {
      prompt = `Generate ${batchCount} MCQs for "Daily 10 Challenge". Subject context: ${subject}. Difficulty: ${difficulty}. Language: ${language}.`;
    } else if (isLiveQuiz) {
      prompt = `Search today's top headlines. Generate ${batchCount} questions. Language: ${language}.`;
    } else {
      prompt = `Generate ${batchCount} questions. Subject: ${subject}. Topic: ${topic || 'General'}. Difficulty: ${difficulty}. Language: ${language}. Strategy: ${patternScope}. Style: ${selectedStyle}.`;
    }

    const commonSchemaPart = `
      STRICT JSON OUTPUT FORMAT:
      The response must be a JSON array of exactly ${batchCount} objects matching the requested schema. Do not include markdown code block wrapper.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt + commonSchemaPart,
        config: {
          tools: (isLiveQuiz || isDailyChallenge) ? [{ googleSearch: {} }] : [],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                question_hindi: { type: Type.STRING },
                question_english: { type: Type.STRING },
                options: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING },
                  },
                  required: ["A", "B", "C", "D"]
                },
                options_bilingual: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.OBJECT, properties: { hindi: { type: Type.STRING }, english: { type: Type.STRING } } },
                    B: { type: Type.OBJECT, properties: { hindi: { type: Type.STRING }, english: { type: Type.STRING } } },
                    C: { type: Type.OBJECT, properties: { hindi: { type: Type.STRING }, english: { type: Type.STRING } } },
                    D: { type: Type.OBJECT, properties: { hindi: { type: Type.STRING }, english: { type: Type.STRING } } },
                  }
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                explanation_hindi: { type: Type.STRING },
                explanation_english: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                teacherInsight: { type: Type.STRING },
                wrongOptionsAnalysis: { type: Type.STRING },
                extraFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
                videoUrl: { type: Type.STRING },
                imageUrl: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });

      if (!response || !response.text) {
        throw new Error("Empty response text from Gemini API");
      }
      return JSON.parse(response.text());
    } catch (batchError) {
      console.error("Error generating batch:", batchError);
      // बैकअप सुरक्षित डेटा ताकि यूजर का फ्रंटएंड कभी अटके नहीं
      return Array(batchCount).fill(null).map((_, i) => ({
        question: `प्रश्न लोड करने में समस्या हुई (बैच ${batchIndex + 1}, प्रश्न ${i + 1})। कृपया पुनः प्रयास करें।`,
        question_hindi: "डेटा लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।",
        question_english: "Issue loading data. Please try again.",
        options: { A: "पुनः प्रयास करें", B: "होम", C: "सपोर्ट", D: "बैक" },
        correctAnswer: "A",
        explanation: "एपीआई कनेक्टिविटी या लिमिट खत्म होने की जांच करें।"
      }));
    }
  };

  try {
    const promises = chunkSizes.map((size, index) => generateBatch(size, index, chunkSizes.length));
    const results = await Promise.all(promises);
    const flattenedQuestions = results.flat().filter(Boolean);
    return flattenedQuestions.slice(0, questionCount);
  } catch (error) {
    console.error("Global generation failed:", error);
    throw error;
  }
}

export async function analyzeVideoContent(videoUrl: string, prompt?: string): Promise<any> {
  console.log("Fallback video analysis triggered for:", videoUrl);
  return {
    summary: "वीडियो विश्लेषण अभी लोड हो रहा है...",
    keyPoints: ["कृपया कुछ समय बाद पुनः प्रयास करें"]
  };
}
