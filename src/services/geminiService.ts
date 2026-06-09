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
  const { subject, difficulty, language, questionCount, topic, pattern } = config;
  const ai = getAI();

  const isCurrentAffairs = subject === 'Rajasthan Current Affairs' || subject === 'National Current Affairs' || subject === 'Daily Live Quiz';
  const isLiveQuiz = subject === 'Daily Live Quiz';
  
  const patternScope = pattern === '2012-2020' 
    ? 'Old Pattern (2012–2020): Direct factual questions, simple recall-based.' 
    : 'New Pattern (2021–2026): Statement-based, confusing options, analytical, modern exam style.';

  const prompt = isLiveQuiz 
    ? `
    Persona: You are a real-time Current Affairs analyst.
    Task: Search for today's top headlines from Google News, BBC News, and major Indian sources (like Utkarsh classes updates if available).
    Number of Questions: ${questionCount}
    Requested Language: ${language}
    
    INSTRUCTIONS:
    1. USE GOOGLE SEARCH: Find real news from the last 24-48 hours.
    2. SOURCES: Prioritize Google News, BBC, and official Indian govt releases for global/national context.
    3. FORMAT: Create tricky RPSC/SSC style questions. Follow the expert paper setter persona.
    4. VARIETY: Mix sports, politics, awards, and major global events.
    5. QUALITY: Ensure strict factual accuracy and clear single-choice options.
    `
    : `
    Persona: You are an expert RPSC exam paper setter and AI tutor. Your mission is to generate ${questionCount} high-quality MCQs that strictly follow the RPSC exam pattern.
    Subject: ${subject}
    ${topic ? `Focus Topic: ${topic}` : ''}
    Difficulty: ${difficulty} (Easy / Medium / Hard)
    Language: ${language} (Hindi / English / Hinglish)
    Pattern Strategy: ${patternScope}

    EXAM SETTER RULES:
    1. OPTIONS: Each question MUST have exactly 4 options (A, B, C, D) with only ONE correct answer.
    2. DISTRACTORS: Use strong distractors (wrong options must look realistic and trap the unprepared).
    3. LANGUAGE: Use clear, formal, and exam-oriented language.
    4. SUBJECT-SPECIFIC DEPTH:
       - Reasoning: Include series, analogy, puzzles, and logical sequences.
       - Mathematics: Ensure questions are solvable and involve RPSC-level logic (algebra, arithmetic, etc.).
       - Science: Focus on concept-based and application-based questions.
       - Rajasthan GK: Deep dive into history, culture, geography, and current administrative data of Rajasthan.
       - Current Affairs: Must include latest events (2024-2026), govt schemes, awards, and major science/tech updates.
    5. AVOID REPETITION: Every question must be unique.
    6. TEACHER LOGIC: Provide a "Guruji" style insight (Hinglish) with mnemonics or logical shortcuts.
    `;

  const commonSchemaPart = `
    STRICT JSON OUTPUT FORMAT:
    The response must be a JSON array of objects. Each object must strictly follow this schema:
    - 'question': The MCQ question text.
    - 'options': Object with keys A, B, C, D.
    - 'correctAnswer': "A", "B", "C", or "D".
    - 'explanation': Expert factual explanation.
    - 'teacherInsight': A clever "Guruji" tip or mnemonic in Hinglish.
    - 'wrongOptionsAnalysis': A mapping of each incorrect option to a brief reason why it's a distractor.
    - 'extraFacts': 2-3 additional facts related to the topic.
    - 'videoUrl': YouTube search query for an educational video.
    - 'imageUrl': Image search query for visual context.
    - 'patternYear': Reference to the exam year or "Live update".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt + commonSchemaPart,
      config: {
        tools: isLiveQuiz ? [{ googleSearch: {} }] : [],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.STRING },
                  B: { type: Type.STRING },
                  C: { type: Type.STRING },
                  D: { type: Type.STRING },
                },
                required: ["A", "B", "C", "D"],
              },
              correctAnswer: { type: Type.STRING, enum: ["A", "B", "C", "D"] },
              explanation: { type: Type.STRING },
              teacherInsight: { type: Type.STRING },
              wrongOptionsAnalysis: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.STRING },
                  B: { type: Type.STRING },
                  C: { type: Type.STRING },
                  D: { type: Type.STRING },
                },
                required: ["A", "B", "C", "D"],
              },
              extraFacts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              videoUrl: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              patternYear: { type: Type.STRING },
            },
            required: ["question", "options", "correctAnswer", "explanation", "teacherInsight", "wrongOptionsAnalysis", "extraFacts"],
          },
        },
      },
    });

    const questions: Question[] = JSON.parse(response.text || '[]').map((q: any, index: number) => ({
      ...q,
      id: `q-${index}-${Date.now()}`
    }));

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
