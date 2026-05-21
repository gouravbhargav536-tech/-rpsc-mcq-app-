import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizConfig } from "../types";

// १. आपकी नई वर्किंग API Key यहाँ डाल दी गई है
const HARDCODED_GEMINI_KEY = "AIzaSyB25-Xw-aAFboli6Ld0X0Mjj89crv22fjc";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    // अगर पर्यावरण चर नहीं मिलता है तो हार्डकोडेड कुंजी का उपयोग करें
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

  const isCurrentAffairs = subject === 'Rajasthan Current Affairs' || subject === 'National Current Affairs' || subject === 'Daily Live Quiz';
  const isLiveQuiz = subject === 'Daily Live Quiz';
  const isDailyChallenge = mode === 'daily';
  
  // Partition questions into small parallel batches of size 5 or 10
  let chunkSizes: number[] = [];
  if (isDailyChallenge) {
    chunkSizes = [10]; // Daily challenge is always 10 questions
  } else {
    let remaining = questionCount;
    // Prefer size 5 for smaller quizzes, size 10 for larger quizzes to minimize parallel overhead
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
    "Statement-based: Give 2-3 detailed clauses/statements, and ask the candidate to determine which ones are correct (e.g., Options: A. Only 1, B. 1 and 2, C. 2 and 3, D. All are correct). Very realistic for RAS.",
    "Assertion & Reason: Specify an Assertion (A) and Reason (R), with classic options: A. Both A and R are true and R is correct explanation of A; B. Both A and R are true but R is not the correct explanation of A; C. A is true but R is false; D. A is false but R is true.",
    "Chronology: List 4-5 historical events, rulers, treaties, or government schemes, and ask the user to choose the correct chronological sequence in the options.",
    "Match the Column: Present two columns (Column I and Column II) mapping districts to features, authors to books, schemes to years, and ask the user to choose the correct mapping matrix from options."
  ];

  const generateBatch = async (batchCount: number, batchIndex: number, totalBatches: number): Promise<any[]> => {
    const selectedStyle = examStyles[batchIndex % examStyles.length];
    
    let prompt = "";
    if (isDailyChallenge) {
      prompt = `
      Persona: You are an advanced AI Quiz Engine for RPSC, REET, RAS, SSC, UPSC, and competitive exams.
      TASK: Generate ${batchCount} high-quality MCQs for "Daily 10 Challenge" mode.
      This is Batch ${batchIndex + 1} of ${totalBatches}.
      
      CHALLENGE RULES:
      1. Generate EXACTLY ${batchCount} questions.
      2. Difficulty Curve: Q1-Q3 (Easy), Q4-Q7 (Medium), Q8-Q10 (Hard).
      3. Mix of subjects: Rajasthan GK, Indian GK, Current Affairs (2025-2026), Science, Math, History, Geography, Reasoning, English/Hindi Grammar.
      4. Language Support: ${language}. 
         - If language is 'Hindi', generate only Hindi fields.
         - If language is 'English', generate only English fields.
         - If language is 'Bilingual', generate BOTH Hindi and English fields.
      
      MOBILE UI RULES:
      - Keep questions compact, clear and highly readable on small screens.
      - Short line widths, avoid giant paragraphs.
      - Keep options clearly separated.
      `;
    } else if (isLiveQuiz) {
      prompt = `
      Persona: You are a real-time Current Affairs analyst.
      Task: Search for today's top headlines from Google News, BBC News, and major Indian sources.
      Number of Questions to Generate: ${batchCount}
      This is Batch ${batchIndex + 1} of ${totalBatches}.
      Requested Language: ${language}
      
      INSTRUCTIONS:
      1. USE GOOGLE SEARCH: Find real news from the last 24-48 hours.
      2. SOURCES: Prioritize official Indian govt releases and trusted news.
      3. QUALITY: Ensure strict factual accuracy. Use high competitive difficulty.
      4. MOBILE UI/UX: Keep questions and options concise. Limit line lengths so text is super readable on small mobile screens.
      `;
    } else {
      prompt = `
      Persona: You are an expert RPSC exam paper setter and AI tutor. 
      Number of Questions to Generate in this batch: ${batchCount}
      This is Batch ${batchIndex + 1} of ${totalBatches}.
      Subject: ${subject}
      ${topic ? `Focus Topic: ${topic}` : ''}
      Difficulty: ${difficulty}
      Language: ${language}
      Pattern Strategy: ${patternScope}
      Question Format focus: ${selectedStyle}

      EXAM SETTER RULES:
      1. OPTIONS: Exactly 4 options (A, B, C, D).
      2. DISTRACTORS: Use strong, realistic distractors.
      3. LANGUAGE: Clear, formal, exam-oriented.
      4. AVOID REPETITION: Focus on different aspects, concepts, and areas of the syllabus. Do NOT repeat or leak information from any other questions.
      5. MOBILE ADAPTABILITY: Do NOT write giant paragraphs for questions or options. Keep text compact, normal size, and easy to read quickly on mobile screens. Choose shorter sentence structures.
      `;
    }

    const commonSchemaPart = `
      STRICT JSON OUTPUT FORMAT:
      The response must be a JSON array of exactly ${batchCount} objects.
    `;

    try {
      // ऐप्लिकेशन क्रैश से बचने के लिए सिर्फ़ नवीनतम मान्यता प्राप्त जेमिनी मॉडल नेम का उपयोग करें
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

      if (!response.text) {
        throw new Error("Empty response text received");
      }
      return JSON.parse(response.text());
    } catch (batchError) {
      console.error("Error generating batch:", batchError);
      // फ़ालबैक बैकअप ताकि यूजर को ब्लैंक स्क्रीन न दिखे
      return [{
        question: "सफलतापूर्वक डेटा लोड नहीं हो सका। कृपया पुनः प्रयास करें।",
        question_hindi: "सफलतापूर्वक डेटा लोड नहीं हो सका। कृपया पुनः प्रयास करें।",
        question_english: "Data could not be loaded successfully. Please try again.",
        options: { A: "पुनः प्रयास करें", B: "बैक जाएं", C: "होम पेज", D: "सपोर्ट" },
        correctAnswer: "A",
        explanation: "सर्वर कनेक्टिविटी या एपीआई लिमिट की जांच करें।"
      }];
    }
  };

  try {
    const promises = chunkSizes.map((size, index) => generateBatch(size, index, chunkSizes.length));
    const results = await Promise.all(promises);
    return results.flat().slice(0, questionCount);
  } catch (error) {
    console.error("Global generation failed:", error);
    throw error;
  }
}
