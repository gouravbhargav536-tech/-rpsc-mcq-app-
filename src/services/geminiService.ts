import { QuizConfig, Question } from '../types';

export const generateQuizQuestions = async (config: QuizConfig): Promise<Question[]> => {
  const response = await fetch("/api/generate-quiz", {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json' 
    },
    body: JSON.stringify({ config })
  });

  const contentType = response.headers.get("content-type");
  
  if (!response.ok) {
    if (contentType?.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate quiz.");
    }
    throw new Error(`Server Error (${response.status}): The system returned an unexpected response format.`);
  }

  if (!contentType?.includes("application/json")) {
    throw new Error("Invalid response format: Expected JSON but received " + (contentType || "unknown"));
  }

  const data = await response.json();
  return data;
};
