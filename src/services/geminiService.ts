import { QuizConfig, Question } from '../types';

export const generateQuizQuestions = async (config: QuizConfig): Promise<Question[]> => {
  const response = await fetch("/api/generate-quiz", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to contact proxy API cleanly.");
  }

  const data = await response.json();
  return data;
};
