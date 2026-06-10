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
  teacherInsight?: string;
  videoUrl?: string;
  imageUrl?: string;
  patternYear?: string;
  extraFacts?: string[];
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
export type Language = 'Hindi' | 'English' | 'Hinglish';
export type QuizMode = 'instant' | 'exam';

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

export type ThemeType = 'geometric' | 'rajasthan';

export interface LogEntry {
  timestamp: string;
  type: string;
  message: string;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
}

export interface StepStatus {
  id: number;
  label: string;
  status: 'PENDING' | 'SUCCESS' | 'ERROR' | 'IN_PROGRESS';
  error?: string;
}

export interface SystemStatus {
  quizEngine: boolean;
  apiKeyStatus: 'Connected' | 'Invalid Key' | 'Quota Exceeded' | 'Rate Limited' | 'Disconnected' | 'Network Error';
  firebaseStatus: boolean;
  apiLatency: number;
  firebaseReadSpeed: number;
  firebaseWriteSpeed: number;
  flowSteps: StepStatus[];
  collectionCounts: {
    questions: number;
    users: number;
    subjects: number;
    currentAffairs: number;
    dbTotal: number;
  };
  questionAvailability: {
    [key: string]: number;
  };
}
