export interface Question {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  explanationHindi?: string;
  explanationEnglish?: string;
  teacherInsight?: string;
  videoUrl?: string;
  imageUrl?: string;
  patternYear?: string;
  extraFacts?: string[];
  difficulty?: string;
  wrongOptionsAnalysis?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export type Subject = 
  | 'Rajasthan GK'
  | 'Indian GK'
  | 'Mathematics'
  | 'Science'
  | 'Hindi'
  | 'English'
  | 'Reasoning'
  | 'Rajasthan Current Affairs'
  | 'National Current Affairs'
  | 'Daily Live Quiz';

export type ExamPattern = '2012-2020' | '2021-Present';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Language = 'Hindi' | 'English' | 'Hinglish' | 'Bilingual';
export type VideoCategory = 'shorts' | 'lectures' | 'strategy' | 'trending';

export interface YTVideo {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  publishDate: string;
  channelTitle: string;
  category: VideoCategory;
  duration?: string;
  viewCount?: string;
  recommendationReason?: string;
}

export type QuizMode = 'instant' | 'exam' | 'daily';

export interface QuizConfig {
  subject: Subject;
  difficulty: Difficulty;
  language: Language;
  questionCount: number;
  pattern: ExamPattern;
  mode: QuizMode;
  topic?: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  questions: Question[];
  userAnswers: (string | null)[];
}

export interface VideoAnalysis {
  videoId: string;
  keyTopics: string[];
  summary: string;
  miniQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  reviewSegments: {
    title: string;
    timestamp: string;
    seconds: number;
    reason: string;
  }[];
}

export interface ExamAnalysis {
  examStyle: string;
  difficultyPattern: string;
  frequentTopics: string[];
  questionStyle: string;
}

export interface FullQuizData {
  examName: string;
  analysis?: ExamAnalysis;
  questions: Question[];
}

export type ThemeType = 'geometric' | 'rajasthan';

export interface User {
  name: string;
  email: string;
  isAdmin?: boolean;
}
