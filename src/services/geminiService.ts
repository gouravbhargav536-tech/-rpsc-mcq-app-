export const OFFLINE_QUESTION_BANK: any[] = [];

// यह आपके एक्सप्रेस सर्वर के एंडपॉइंट से बात करेगा
export const generateQuizQuestions = async (topic: string): Promise<any> => {
  try {
    const response = await fetch(`/api/quiz?topic=${encodeURIComponent(topic)}`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Express Backend Quiz Fetch Failed:", error);
    throw error;
  }
};

export const analyzeVideoContent = async (videoUrl: string): Promise<any> => {
  return { status: "success", analysis: "Video analysis feature ready." };
};
