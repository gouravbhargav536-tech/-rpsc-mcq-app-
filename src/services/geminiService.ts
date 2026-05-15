import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizConfig } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

export async function generateQuizQuestions(config: QuizConfig): Promise<Question[]> {
  const { subject, difficulty, language, questionCount, topic, pattern, mode } = config;
  const ai = getAI();

  const isCurrentAffairs = subject === 'Rajasthan Current Affairs' || subject === 'National Current Affairs' || subject === 'Daily Live Quiz';
  const isLiveQuiz = subject === 'Daily Live Quiz';
  const isDailyChallenge = mode === 'daily';
  
  const patternScope = pattern === '2012-2020' 
    ? 'Old Pattern (2012–2020): Direct factual questions, simple recall-based.' 
    : 'New Pattern (2021–2026): Statement-based, confusing options, analytical, modern exam style.';

  let prompt = "";

  if (isDailyChallenge) {
    prompt = `
    Persona: You are an advanced AI Quiz Engine for RPSC, REET, RAS, SSC, UPSC, and competitive exams.
    TASK: Generate 10 high-quality MCQs for "Daily 10 Challenge" mode.
    
    CHALLENGE RULES:
    1. Exactly 10 questions.
    2. Difficulty Curve: Q1-Q3 (Easy), Q4-Q7 (Medium), Q8-Q10 (Hard).
    3. Mix of subjects: Rajasthan GK, Indian GK, Current Affairs (2025-2026), Science, Math, History, Geography, Reasoning, English/Hindi Grammar.
    4. Language Support: ${language}. 
       - If language is 'Hindi', generate only Hindi fields.
       - If language is 'English', generate only English fields.
       - If language is 'Bilingual', generate BOTH Hindi and English fields.
    
    MOBILE UI RULES:
    - Short readable lines.
    - Large touch-friendly options.
    - Clear formatting.
    `;
  } else if (isLiveQuiz) {
    prompt = `
    Persona: You are a real-time Current Affairs analyst.
    Task: Search for today's top headlines from Google News, BBC News, and major Indian sources.
    Number of Questions: ${questionCount}
    Requested Language: ${language}
    
    INSTRUCTIONS:
    1. USE GOOGLE SEARCH: Find real news from the last 24-48 hours.
    2. SOURCES: Prioritize official Indian govt releases and trusted news.
    3. QUALITY: Ensure strict factual accuracy.
    4. MOBILE UI/UX: Keep questions and options concise.
    `;
  } else {
    prompt = `
    Persona: You are an expert RPSC exam paper setter and AI tutor. 
    Number of Questions: ${questionCount}
    Subject: ${subject}
    ${topic ? `Focus Topic: ${topic}` : ''}
    Difficulty: ${difficulty}
    Language: ${language}
    Pattern Strategy: ${patternScope}

    EXAM SETTER RULES:
    1. OPTIONS: Exactly 4 options (A, B, C, D).
    2. DISTRACTORS: Use strong, realistic distractors.
    3. LANGUAGE: Clear, formal, exam-oriented.
    4. AVOID REPETITION.
    `;
  }

  const commonSchemaPart = `
    STRICT JSON OUTPUT FORMAT:
    The response must be a JSON array of objects.
    Each object MUST have:
    - 'question': The MCQ question text (If bilingual, this should be the primary language or a reasonable combination).
    - 'question_hindi': Question in Hindi (Mandatory if language is 'Hindi' or 'Bilingual').
    - 'question_english': Question in English (Mandatory if language is 'English' or 'Bilingual').
    - 'options': Object with keys A, B, C, D. Values are strings.
    - 'options_bilingual': Object with keys A, B, C, D. Each value is an object { hindi: string, english: string }. (Mandatory if language is 'Bilingual').
    - 'correctAnswer': "A", "B", "C", or "D".
    - 'explanation': Expert factual explanation.
    - 'explanation_hindi': Explanation in Hindi.
    - 'explanation_english': Explanation in English.
    - 'difficulty': 'Easy' | 'Medium' | 'Hard'.
    - 'teacherInsight': A clever "Guruji" tip or mnemonic.
    - 'wrongOptionsAnalysis': Mapping of each incorrect option.
    - 'extraFacts': 2-3 additional facts.
    - 'videoUrl': YouTube search query.
    - 'imageUrl': Image search query.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
                }
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
              correctAnswer: { type: Type.STRING, enum: ["A", "B", "C", "D"] },
              explanation: { type: Type.STRING },
              explanation_hindi: { type: Type.STRING },
              explanation_english: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              teacherInsight: { type: Type.STRING },
              wrongOptionsAnalysis: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.STRING },
                  B: { type: Type.STRING },
                  C: { type: Type.STRING },
                  D: { type: Type.STRING },
                }
              },
              extraFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
              videoUrl: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
            },
            required: ["question", "correctAnswer", "options"],
          },
        },
      },
    });

    const rawQuestions = JSON.parse(response.text || '[]');
    const questions: Question[] = rawQuestions.map((q: any, index: number) => {
      // Adapt to standard Question interface
      let finalQuestion = q.question;
      let finalOptions = q.options;
      let finalExplanation = q.explanation;

      if (language === 'Bilingual') {
        finalQuestion = q.question_hindi && q.question_english ? `${q.question_hindi}\n\n${q.question_english}` : (q.question_hindi || q.question_english || q.question);
        if (q.options_bilingual) {
          finalOptions = {
            A: `${q.options_bilingual.A.hindi} / ${q.options_bilingual.A.english}`,
            B: `${q.options_bilingual.B.hindi} / ${q.options_bilingual.B.english}`,
            C: `${q.options_bilingual.C.hindi} / ${q.options_bilingual.C.english}`,
            D: `${q.options_bilingual.D.hindi} / ${q.options_bilingual.D.english}`,
          };
        }
        finalExplanation = q.explanation_hindi && q.explanation_english ? `${q.explanation_hindi}\n\n${q.explanation_english}` : (q.explanation_hindi || q.explanation_english || q.explanation);
      } else if (language === 'Hindi') {
        finalQuestion = q.question_hindi || q.question;
        finalExplanation = q.explanation_hindi || q.explanation;
      } else if (language === 'English') {
        finalQuestion = q.question_english || q.question;
        finalExplanation = q.explanation_english || q.explanation;
      }

      return {
        ...q,
        id: `q-${index}-${Date.now()}`,
        question: finalQuestion,
        options: finalOptions,
        explanation: finalExplanation,
        explanationHindi: q.explanation_hindi,
        explanationEnglish: q.explanation_english,
      };
    });

    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions. Please try again.");
  }
}

export interface RPSCNotification {
  title: string;
  date: string;
  link: string;
  type: 'EXAM' | 'RESULT' | 'NEWS';
  description: string;
}

export async function fetchRPSCNotifications(): Promise<RPSCNotification[]> {
  const ai = getAI();
  const prompt = `
    Persona: You are a reliable academic assistant.
    Task: Use Google Search to find the 5 most recent and relevant notifications from the RPSC (Rajasthan Public Service Commission) official website or trusted news sources.
    Requirements: Include upcoming exam dates for RAS, First Grade, Second Grade, and other major exams planned for 2024-2026.
    
    Output Format: A JSON array of objects with exactly these keys:
    - title: Short descriptive title.
    - date: String formatted date (e.g. "May 05, 2026").
    - link: URL to the official notice or news source.
    - type: One of "EXAM", "RESULT", or "NEWS".
    - description: One-sentence summary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function analyzeVideoContent(video: any): Promise<any> {
  const ai = getAI();
  const prompt = `
    Persona: You are a Video Learning Analyst for RPSC exams. 
    Video Title: ${video.title}
    Channel: ${video.channelTitle}
    Description: ${video.description}

    TASK:
    1. Summarize the core educational concepts of this video.
    2. Identify 3-5 key topics covered.
    3. Generate a 3-question mini quiz (MCQ) to test the user after watching.
    4. Propose 2 "Review Segments" with estimated timestamps (e.g., 05:30) and WHY the student should focus on that part.

    OUTPUT FORMAT: 
    Return exactly a JSON object:
    {
      "summary": "...",
      "keyTopics": ["...", "..."],
      "miniQuiz": [
        { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..." }
      ],
      "reviewSegments": [
        { "title": "...", "timestamp": "MM:SS", "seconds": 330, "reason": "..." }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Failed to analyze video:", error);
    throw error;
  }
}
