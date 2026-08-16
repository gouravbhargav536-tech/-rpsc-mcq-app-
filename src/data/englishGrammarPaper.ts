export interface Question {
  q: string;
  o: string[];
  a: number;
  explanation?: string;
  section?: string;
  sectionKey?: string;
}

export const ENGLISH_GRAMMAR_QUESTIONS: Question[] = [
  {
    q: "The ________ city was affected by the storm.",
    o: ["whole", "every", "each", "all"],
    a: 0,
    explanation: "रिक्त स्थान से ठीक पहले 'The' आर्टिकल लगा हुआ है। 'The + whole + Singular Noun' एक सही संरचना होती है। 'The every city' या 'The each city' व्याकरण के अनुसार गलत हैं। 'All' के साथ प्रायः 'All the cities' आता है।",
    section: "English Grammar",
    sectionKey: "english"
  },
  {
    q: "Neither of the suspects ________ admitted to the crime despite intense interrogation.",
    o: ["has", "have", "were", "are"],
    a: 0,
    explanation: "सही! 'Neither of' या 'Either of' के बाद भले ही संज्ञा बहुवचन (plural noun) हो, लेकिन व्याकरण के नियम के अनुसार इनके साथ आने वाली क्रिया हमेशा एकवचन (singular verb - has) होती है।",
    section: "English Grammar",
    sectionKey: "english"
  },
  {
    q: "A significant ________ of complaints were received regarding the new billing system.",
    o: ["amount", "quantity", "number", "total"],
    a: 2,
    explanation: "सही! 'Complaints' (शिकायतें) एक गणनीय बहुवचन संज्ञा (plural countable noun) है, जिसके लिए 'number' का प्रयोग होता है, जबकि 'amount' का प्रयोग अगणनीय (uncountable) के लिए होता है।",
    section: "English Grammar",
    sectionKey: "english"
  }
];
