import { Question } from "../types";

// यह फंक्शन आपके नए नेटलिफ़ाई बैकएंड इंजन से क्विज़ डेटा लाएगा
export const generateQuizFromAI = async (topic: string): Promise<any> => {
  try {
    // नेटलिफ़ाई फंक्शन का लोकल एंडपॉइंट (यह प्रोडक्शन और लोकल दोनों जगह काम करेगा)
    const response = await fetch(`/.netlify/functions/quiz-engine?topic=${encodeURIComponent(topic)}`);
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch quiz from Netlify backend:", error);
    throw error;
  }
};
