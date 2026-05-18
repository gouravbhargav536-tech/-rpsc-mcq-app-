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
  const { subject, difficulty, language, questionCount, topic } = config;

  try {
    const response = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        difficulty,
        language,
        topic,
        count: questionCount,
        mode: config.mode
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Map new ultra-fast format to internal Question interface
    return data.questions.map((q: any, index: number) => ({
      id: `q-${index}-${Date.now()}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty || data.difficulty || difficulty,
      teacherInsight: "Focus on this key concept for your RPSC preparation.",
      wrongOptionsAnalysis: {
        A: "Distractor based on common misconceptions.",
        B: "Distractor based on common misconceptions.",
        C: "Distractor based on common misconceptions.",
        D: "Distractor based on common misconceptions."
      },
      extraFacts: [],
    }));
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions instantly. Please try again.");
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
