export interface Question {
  id: number;
  q: string;
  o: string[];
  a: number;
  section: string;
  sectionKey: 'science' | 'math' | 'reasoning' | 'current_affairs';
  explanation?: string;
}

export const RRB_GROUP_D_QUESTIONS: Question[] = [
  // SECTION 1: General Science (Q1-Q15)
  {
    id: 1,
    q: "प्रकाश वर्ष किसकी इकाई है?",
    o: ["समय", "दूरी", "चमक", "ऊर्जा"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "'वर्ष' शब्द से समय समझने की गलती मत करो — यह प्रकाश द्वारा एक वर्ष में तय की गई दूरी है।"
  },
  {
    id: 2,
    q: "मानव शरीर में सबसे बड़ी ग्रंथि कौन सी है?",
    o: ["वृक्क", "यकृत (Liver)", "अग्न्याशय", "थायरॉइड"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "यकृत (Liver) मानव शरीर की सबसे बड़ी ग्रंथि है।"
  },
  {
    id: 3,
    q: "pH स्केल की रेंज कितनी होती है?",
    o: ["0-7", "0-14", "1-10", "0-100"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "pH स्केल 0 से 14 तक होता है (7 उदासीन, 7 से कम अम्लीय, 7 से अधिक क्षारीय)।"
  },
  {
    id: 4,
    q: "निम्न में कौन विद्युत का सुचालक नहीं है?",
    o: ["ग्रेफाइट", "तांबा", "रबर", "चांदी"],
    a: 2,
    section: "General Science",
    sectionKey: "science",
    explanation: "धातुएं (तांबा, चांदी) हमेशा सुचालक होती हैं; अपवाद ग्रेफाइट (अधातु फिर भी सुचालक) है। रबर कुचालक है।"
  },
  {
    id: 5,
    q: "सूर्य से निकटतम ग्रह कौन सा है?",
    o: ["शुक्र (Venus)", "बुध (Mercury)", "मंगल (Mars)", "बृहस्पति (Jupiter)"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "बुध (Mercury) सूर्य का सबसे नजदीकी ग्रह है।"
  },
  {
    id: 6,
    q: "मानव रक्त में RBC कहाँ बनती है?",
    o: ["यकृत", "अस्थि मज्जा (Bone Marrow)", "प्लीहा", "हृदय"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "लाल रक्त कोशिकाएं (RBC) अस्थि मज्जा (Bone Marrow) में बनती हैं।"
  },
  {
    id: 7,
    q: "ओम का नियम (Ohm's Law) किसके बीच संबंध बताता है?",
    o: ["वोल्टेज, धारा और प्रतिरोध (V = IR)", "द्रव्यमान, त्वरण और बल", "कार्य, शक्ति और ऊर्जा", "आवृत्ति, तरंगदैर्ध्य और वेग"],
    a: 0,
    section: "General Science",
    sectionKey: "science",
    explanation: "Ohm's Law: V = I × R (वोल्टेज, धारा और प्रतिरोध का संबंध)।"
  },
  {
    id: 8,
    q: "विटामिन C की कमी से कौन सा रोग होता है?",
    o: ["रिकेट्स", "स्कर्वी", "बेरी-बेरी", "रतौंधी"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "विटामिन C (एस्कॉर्बिक एसिड) की कमी से स्कर्वी रोग होता है।"
  },
  {
    id: 9,
    q: "ध्वनि निर्वात में क्यों नहीं चलती?",
    o: ["प्रकाश की तीव्रता के कारण", "माध्यम (Matter) की अनुपस्थिति के कारण", "गुरुत्वाकर्षण के कारण", "उच्च तापमान के कारण"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "ध्वनि अनुदैर्ध्य तरंग है जिसे संचरण के लिए भौतिक माध्यम की आवश्यकता होती है।"
  },
  {
    id: 10,
    q: "भारी जल (Heavy Water) का रासायनिक सूत्र क्या है?",
    o: ["H₂O", "D₂O", "H₂O₂", "CO₂"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "भारी जल को ड्यूटेरियम ऑक्साइड (D₂O) कहा जाता है।"
  },
  {
    id: 11,
    q: "पौधों में प्रकाश संश्लेषण किस भाग में होता है?",
    o: ["पर्णहरित (Chlorophyll) युक्त कोशिकाओं में", "जड़ों में", "तने की छाल में", "फूल की पंखुड़ियों में"],
    a: 0,
    section: "General Science",
    sectionKey: "science",
    explanation: "प्रकाश संश्लेषण मुख्य रूप से पत्तियों की हरितलवक (Chloroplast) कोशिकाओं में होता है।"
  },
  {
    id: 12,
    q: "न्यूटन का प्रथम नियम किससे संबंधित है?",
    o: ["संवेग", "जड़त्व (Inertia)", "त्वरण", "क्रिया-प्रतिक्रिया"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "प्रथम नियम को 'जड़त्व का नियम' (Law of Inertia) भी कहा जाता है।"
  },
  {
    id: 13,
    q: "सामान्य मानव शरीर का तापमान कितना होता है (°F)?",
    o: ["96.4°F", "98.6°F", "100.2°F", "102.4°F"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "सामान्य मानव शरीर का तापमान 98.6°F (37°C) होता है।"
  },
  {
    id: 14,
    q: "अम्ल और क्षार की अभिक्रिया से क्या बनता है?",
    o: ["केवल अम्ल", "लवण और जल", "केवल गैस", "प्लाज्मा"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "Acid + Base → Salt + Water (उदासीनीकरण अभिक्रिया)।"
  },
  {
    id: 15,
    q: "पृथ्वी का प्राकृतिक उपग्रह कौन सा है?",
    o: ["सूर्य", "चंद्रमा", "फोबोस", "टाइटन"],
    a: 1,
    section: "General Science",
    sectionKey: "science",
    explanation: "चंद्रमा पृथ्वी का एकमात्र प्राकृतिक उपग्रह है।"
  },

  // SECTION 2: Mathematics (Q16-Q25)
  {
    id: 16,
    q: "एक संख्या का 25% = 40, तो वह संख्या ज्ञात करें।",
    o: ["120", "140", "160", "200"],
    a: 2,
    section: "Mathematics",
    sectionKey: "math",
    explanation: "Trick: x × 0.25 = 40 → x = 40 / 0.25 = 160."
  },
  {
    id: 17,
    q: "₹6000 पर 2 साल के लिए 10% वार्षिक चक्रवृद्धि ब्याज ज्ञात करें।",
    o: ["₹1200", "₹1260", "₹1300", "₹1400"],
    a: 1,
    section: "Mathematics",
    sectionKey: "math",
    explanation: "CI = 6000[(1.1)² - 1] = 6000 × 0.21 = ₹1260."
  },
  {
    id: 18,
    q: "दो संख्याओं का LCM 120, HCF 10 है। एक संख्या 20 हो तो दूसरी संख्या क्या होगी?",
    o: ["40", "50", "60", "80"],
    a: 2,
    section: "Mathematics",
    sectionKey: "math",
    explanation: "सूत्र: प्रथम × द्वितीय = LCM × HCF → 20 × X = 120 × 10 = 1200 → X = 60."
  },
  {
    id: 19,
    q: "एक ट्रेन 90 km/hr की चाल से चल रही है, इसे m/s में बदलें।",
    o: ["15 m/s", "20 m/s", "25 m/s", "30 m/s"],
    a: 2,
    section: "Mathematics",
    sectionKey: "math",
    explanation: "Trick: km/hr को m/s में बदलने के लिए 5/18 से गुणा करें → 90 × (5/18) = 25 m/s."
  },
  {
    id: 20,
    q: "15 आदमी किसी काम को 12 दिन में करते हैं। 20 आदमी उसी काम को कितने दिन में करेंगे?",
    o: ["8 दिन", "9 दिन", "10 दिन", "11 दिन"],
    a: 1,
    section: "Mathematics",
    sectionKey: "math",
    explanation: "M₁D₁ = M₂D₂ → 15 × 12 = 20 × D₂ → D₂ = 180 / 20 = 9 दिन।"
  },
  {
    id: 21,
    q: "एक वस्तु का क्रय मूल्य (CP) ₹800, विक्रय मूल्य (SP) ₹920 है — लाभ प्रतिशत ज्ञात करें।",
    o: ["10%", "12%", "15%", "20%"],
    a: 2,
    section: "Mathematics",
    sectionKey: "math",
    explanation: "लाभ = 920 - 800 = 120. लाभ % = (120 / 800) × 100 = 15%."
  },
  {
    id: 22,
    q: "समकोण त्रिभुज की आधार और लंब भुजाएँ 7 और 24 हैं, कर्ण (Hypotenuse) ज्ञात करें।",
    o: ["25", "26", "28", "30"],
    a: 0,
    section: "Mathematics",
    sectionKey: "math",
    explanation: "Pythagorean Triplet (7, 24, 25) → √(7² + 24²) = √(49 + 576) = √625 = 25."
  },
  {
    id: 23,
    q: "एक वृत्त की त्रिज्या 14cm है, परिधि ज्ञात करें (π = 22/7)।",
    o: ["44 cm", "88 cm", "132 cm", "176 cm"],
    a: 1,
    section: "Mathematics",
    sectionKey: "math",
    explanation: "परिधि = 2 × π × r = 2 × (22/7) × 14 = 88 cm."
  },
  {
    id: 24,
    q: "5 क्रमागत संख्याओं का औसत 20 है, सबसे बड़ी संख्या ज्ञात करें।",
    o: ["20", "21", "22", "24"],
    a: 2,
    section: "Mathematics",
    sectionKey: "math",
    explanation: "औसत = मध्य संख्या = 20. पाँच संख्याएं: 18, 19, 20, 21, 22. सबसे बड़ी संख्या = 22."
  },
  {
    id: 25,
    q: "A और B की उम्र का अनुपात 4:5 है, उनकी उम्र का योग 54 है — A की उम्र ज्ञात करें।",
    o: ["20 वर्ष", "24 वर्ष", "30 वर्ष", "36 वर्ष"],
    a: 1,
    section: "Mathematics",
    sectionKey: "math",
    explanation: "अनुपात योग = 4 + 5 = 9 इकाई. 1 इकाई = 54 / 9 = 6. A की उम्र = 4 × 6 = 24 वर्ष."
  },

  // SECTION 3: General Intelligence & Reasoning (Q26-Q35)
  {
    id: 26,
    q: "संख्या श्रृंखला पूर्ण करें: 5, 10, 20, 40, ?",
    o: ["50", "60", "80", "100"],
    a: 2,
    section: "General Intelligence & Reasoning",
    sectionKey: "reasoning",
    explanation: "प्रत्येक संख्या में ×2 हो रहा है → 40 × 2 = 80."
  },
  {
    id: 27,
    q: "यदि CAT को 3120 लिखा जाए, तो DOG को कैसे लिखेंगे?",
    o: ["41507", "41508", "31507", "41407"],
    a: 0,
    section: "General Intelligence & Reasoning",
    sectionKey: "reasoning",
    explanation: "अक्षरों के वर्णमाला स्थान: C(3), A(1), T(20) → 3120. उसी प्रकार D(4), O(15), G(7) → 41507."
  },
  {
    id: 28,
    q: "विषम चुनें (Odd one out): Triangle, Square, Circle, Speed",
    o: ["Triangle", "Square", "Circle", "Speed"],
    a: 3,
    section: "General Intelligence & Reasoning",
    sectionKey: "reasoning",
    explanation: "Speed (चाल) भौतिक राशि है, जबकि बाकी सभी ज्यामितीय आकृतियां हैं।"
  },
  {
    id: 29,
    q: "यदि उत्तर की ओर मुख करके 90° दक्षिणावर्त (Clockwise) घूमें, तो अब मुख किस दिशा में होगा?",
    o: ["पश्चिम", "पूर्व", "दक्षिण", "उत्तर-पूर्व"],
    a: 1,
    section: "General Intelligence & Reasoning",
    sectionKey: "reasoning",
    explanation: "उत्तर दिशा से 90° दक्षिणावर्त (दायीं ओर) घूमने पर दिशा 'पूर्व' होगी।"
  },
  {
    id: 30,
    q: "श्रृंखला पूर्ण करें: 2, 6, 12, 20, 30, ?",
    o: ["36", "40", "42", "48"],
    a: 2,
    section: "General Intelligence & Reasoning",
    sectionKey: "reasoning",
    explanation: "अंतर का पैटर्न: +4, +6, +8, +10, अगला +12 होगा → 30 + 12 = 42 (या n(n+1) 패턴: 6×7 = 42)।"
  },
  {
    id: 31,
    q: "A, B का भाई है। B, C की माँ है। A का C से क्या संबंध है?",
    o: ["पिता", "मामा", "चाचा", "भाई"],
    a: 1,
    section: "General Intelligence & Reasoning",
    sectionKey: "reasoning",
    explanation: "माँ का भाई 'मामा' होता है → A, C का मामा है।"
  },
  {
    id: 32,
    q: "दर्पण छवि (Mirror Image) में 'b' अक्षर कैसा दिखेगा?",
    o: ["p", "q", "d", "b"],
    a: 2,
    section: "General Intelligence & Reasoning",
    sectionKey: "reasoning",
    explanation: "दर्पण में बाएं-दाएं का परिवर्तन होता है, इसलिए 'b' पलटकर 'd' जैसा दिखता है।"
  },
  {
    id: 33,
    q: "यदि सोमवार आज से 3 दिन पहले था, तो आज कौन सा दिन है?",
    o: ["बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
    a: 1,
    section: "General Intelligence & Reasoning",
    sectionKey: "reasoning",
    explanation: "सोमवार + 3 दिन = मंगलवार(1), बुधवार(2), गुरुवार(3) → आज गुरुवार है।"
  },
  {
    id: 34,
    q: "सादृश्यता पूर्ण करें (Analogy): Book : Read :: Song : ?",
    o: ["Sing/Listen", "Write", "Dance", "Book"],
    a: 0,
    section: "General Intelligence & Reasoning",
    sectionKey: "reasoning",
    explanation: "किताब को पढ़ा जाता है, और गाने को गाया या सुना (Sing/Listen) जाता है।"
  },
  {
    id: 35,
    q: "श्रृंखला पूर्ण करें: 1, 4, 9, 16, 25, ?",
    o: ["30", "36", "40", "49"],
    a: 1,
    section: "General Intelligence & Reasoning",
    sectionKey: "reasoning",
    explanation: "पूर्ण वर्ग संख्याएं: 1², 2², 3², 4², 5², अगला 6² = 36."
  },

  // SECTION 4: General Awareness & Current Affairs — 2026 (Q36-Q75)
  {
    id: 36,
    q: "अप्रैल 2026 में कैबिनेट ने प्रधानमंत्री ग्राम सड़क योजना-III को कब तक बढ़ाया, कुल कितने आउटले के साथ?",
    o: ["2027, ₹65,000 करोड़", "2028, ₹83,977 करोड़", "2029, ₹90,000 करोड़", "2028, ₹75,000 करोड़"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "कैबिनेट ने प्रधानमंत्री ग्राम सड़क योजना-III को ₹83,977 करोड़ के आउटले के साथ 2028 तक बढ़ाया।"
  },
  {
    id: 37,
    q: "अप्रैल 2026 में उच्च शिक्षा में भारतीय भाषाओं के प्रयोग को मज़बूत करने हेतु कौन सी योजना लॉन्च हुई?",
    o: ["AICTE-VAANI 2.0", "AICTE-VAANI 3.0", "भाषा संगम योजना", "मातृभाषा मिशन"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "AICTE-VAANI 3.0 योजना उच्च शिक्षा में भारतीय भाषाओं के प्रयोग को मज़बूत करने के लिए लॉन्च की गई।"
  },
  {
    id: 38,
    q: "अप्रैल 2026 में पश्चिम एशिया तनाव के बीच निर्यातकों की मदद के लिए भारत ने किस योजना का विस्तार किया?",
    o: ["RELIEF योजना", "EXPORT योजना", "PM-SWANIDHI", "MEIS योजना"],
    a: 0,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "निर्यातकों की सहायता के लिए भारत सरकार ने RELIEF योजना का विस्तार किया।"
  },
  {
    id: 39,
    q: "दिल्ली सरकार ने अप्रैल 2026 में किस योजना की शुरुआत की?",
    o: ["लखपति दीदी योजना", "लखपति बिटिया योजना", "बेटी बचाओ योजना", "कन्या समृद्धि योजना"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "दिल्ली सरकार ने अप्रैल 2026 में 'लखपति बिटिया योजना' की शुरुआत की।"
  },
  {
    id: 40,
    q: "मार्च 2026 में EV incentives किस वर्ष तक बढ़ाए गए (PM E-DRIVE नीति के तहत)?",
    o: ["2026", "2027", "2028", "2030"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "PM E-DRIVE नीति के अंतर्गत EV इंसेंटिव्स को वर्ष 2028 तक बढ़ाया गया।"
  },
  {
    id: 41,
    q: "जुलाई 2026 में केंद्र सरकार ने भारत का पहला अपतटीय (Offshore) हवाई अड्डा प्रोजेक्ट किस जिले में मंज़ूर किया?",
    o: ["रायगढ़, महाराष्ट्र", "पालघर, महाराष्ट्र", "ठाणे, महाराष्ट्र", "सूरत, गुजरात"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "केंद्र सरकार ने महाराष्ट्र के पालघर जिले में भारत के पहले अपतटीय हवाई अड्डा प्रोजेक्ट को मंज़ूरी दी।"
  },
  {
    id: 42,
    q: "जुलाई 2026 में स्वास्थ्य मंत्री ने कौन सा WhatsApp-आधारित AI असिस्टेंट लॉन्च किया?",
    o: ["आयुष्मान भारत ऐप", "आयुष्मान सारथी PM-JAY चैटबॉट", "स्वास्थ्य मित्र AI", "आरोग्य साथी"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "आयुष्मान सारथी PM-JAY चैटबॉट — एक WhatsApp आधारित 24x7 AI सहायक लॉन्च किया गया।"
  },
  {
    id: 43,
    q: "जुलाई 2026 में केंद्रीय कैबिनेट ने किस योजना को 10 साल के लिए मंज़ूरी दी, जो टियर-2/3 शहरों को हवाई मार्ग से जोड़ती है?",
    o: ["उड़े देश का आम नागरिक (मूल UDAN)", "संशोधित UDAN योजना", "रीजनल एयर कनेक्ट योजना", "भारत माला हवाई योजना"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "केंद्रीय कैबिनेट ने संशोधित UDAN योजना को 10 साल की अवधि के लिए मंज़ूरी दी।"
  },
  {
    id: 44,
    q: "जुलाई 2026 में किस शहर में नए टर्मिनल भवन का उद्घाटन हुआ?",
    o: ["जयपुर", "उदयपुर", "जोधपुर", "बीकानेर"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "4 जुलाई 2026 को जोधपुर हवाई अड्डे पर नए टर्मिनल भवन का उद्घाटन हुआ।"
  },
  {
    id: 45,
    q: "T20 विश्व कप 2026 का फाइनल कहाँ खेला गया और भारत ने किसे हराया?",
    o: ["वानखेड़े स्टेडियम, न्यूज़ीलैंड को", "नरेंद्र मोदी स्टेडियम, न्यूज़ीलैंड को", "ईडन गार्डन्स, ऑस्ट्रेलिया को", "लॉर्ड्स, इंग्लैंड को"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "भारत ने 8 मार्च 2026 को नरेंद्र मोदी स्टेडियम में न्यूज़ीलैंड को हराकर T20 विश्व कप जीता।"
  },
  {
    id: 46,
    q: "T20 वर्ल्ड कप 2026 में भारत की कप्तानी किसने की?",
    o: ["रोहित शर्मा", "सूर्यकुमार यादव", "हार्दिक पांड्या", "विराट कोहली"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "टी20 विश्व कप 2026 में भारतीय टीम के कप्तान सूर्यकुमार यादव थे।"
  },
  {
    id: 47,
    q: "T20 वर्ल्ड कप 2026 में किस भारतीय गेंदबाज़ ने विश्व कप में सबसे ज़्यादा विकेट लेने वाले तेज़ गेंदबाज़ का रिकॉर्ड बनाया?",
    o: ["मोहम्मद शमी", "जसप्रीत बुमराह", "मोहम्मद सिराज", "अर्शदीप सिंह"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "जसप्रीत बुमराह ने मलिंगा को पीछे छोड़कर विश्व कप में तेज़ गेंदबाज़ द्वारा सर्वाधिक विकेट लेने का रिकॉर्ड बनाया।"
  },
  {
    id: 48,
    q: "पद्म पुरस्कार 2026 में किस पूर्व टेनिस खिलाड़ी को पद्म भूषण दिया गया?",
    o: ["लिएंडर पेस", "महेश भूपति", "विजय अमृतराज", "सोमदेव देववर्मन"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "विजय अमृतराज को पद्म भूषण से सम्मानित किया गया।"
  },
  {
    id: 49,
    q: "पद्म पुरस्कार 2026 में किस विदेशी कोच को मरणोपरांत पद्म श्री दिया गया, जो पहले विदेशी कोच बने?",
    o: ["गैरी कर्स्टन", "व्लादिमीर मेस्तविरिश्विली", "टॉम मूडी", "डैनियल विटोरी"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "जॉर्जियाई कुश्ती कोच व्लादिमीर मेस्तविरिश्विली पद्म श्री पाने वाले पहले विदेशी कोच बने।"
  },
  {
    id: 50,
    q: "जनवरी 2026 में नेशनल बॉक्सिंग चैंपियनशिप में महिलाओं के 52kg वर्ग में किसने खिताब जीता?",
    o: ["लवलीना बोरगोहेन", "निकहत ज़रीन", "मैरी कॉम", "साक्षी चौधरी"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "निकहत ज़रीन ने राष्ट्रीय बॉक्सिंग चैंपियनशिप 2026 में 52kg वर्ग में स्वर्ण जीता।"
  },
  {
    id: 51,
    q: "जनवरी 2026 में फीफा वर्ल्ड कप 2026 की ट्रॉफी का भारत दौरा कितने दिनों का था?",
    o: ["एक दिन", "दो दिन", "तीन दिन", "पांच दिन"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "फीफा वर्ल्ड कप 2026 ट्रॉफी टूर भारत में 3 दिनों का था।"
  },
  {
    id: 52,
    q: "जुलाई 2026 में रक्षा मंत्री राजनाथ सिंह ने भारत का पहला 'Department of Military Medicine' कहाँ स्थापित किया?",
    o: ["दिल्ली", "लखनऊ", "पुणे", "चंडीगढ़"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "लखनऊ के कमांड हॉस्पिटल में भारत का पहला dedicated Department of Military Medicine स्थापित हुआ।"
  },
  {
    id: 53,
    q: "जुलाई 2026 में सेनाध्यक्ष जनरल धीरज सेठ ने कौन सा नया सैन्य ईंधन लॉन्च किया?",
    o: ["Bio-Diesel Alpha", "Xtreme Weather Grade (XWG) डीज़ल", "High-Altitude Jet Fuel", "Green Armor Fuel"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "Xtreme Weather Grade (XWG) डीज़ल अत्यधिक ठंड व ऊंचाई वाले क्षेत्रों हेतु विकसित किया गया है।"
  },
  {
    id: 54,
    q: "जुलाई 2026 में HAL ने Astra Microwave Products Ltd को कितने करोड़ का ठेका दिया (AESA रडार एंटीना निर्माण हेतु)?",
    o: ["₹1,200.50 करोड़", "₹2,205.23 करोड़", "₹3,500.00 करोड़", "₹500.00 करोड़"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "HAL ने Astra Microwave को ₹2,205.23 करोड़ का AESA रडार एरे निर्माण का ठेका दिया।"
  },
  {
    id: 55,
    q: "जुलाई 2026 में इंजन फैक्ट्री अवाडी ने किस स्वदेशी इंजन का 500-घंटे का एंड्योरेंस टेस्ट पूरा किया?",
    o: ["UTD-20 इंजन", "Kaveri Engine", "V12 Bharat Engine", "Arjun Powerpack"],
    a: 0,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "इंजन फैक्ट्री अवाडी ने स्वदेशी UTD-20 इंजन का 500 घंटे का एंड्योरेंस टेस्ट सफलतापूर्वक पूरा किया।"
  },
  {
    id: 56,
    q: "जुलाई 2026 में भारतीय नौसेना ने कितने अरब डॉलर की लागत से 4 अगली पीढ़ी के जहाज़ लॉन्च करने की घोषणा की?",
    o: ["$2.5 अरब", "$3.8 अरब", "$5.2 अरब", "$10 अरब"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "भारतीय नौसेना ने $5.2 अरब की लागत वाले 4 अगली पीढ़ी के सतह युद्धपोत प्रोजेक्ट्स घोषित किए।"
  },
  {
    id: 57,
    q: "जुलाई 2026 में भारतीय नौसेना ने कौन से तीन स्वदेशी युद्धपोत प्रोजेक्ट लॉन्च करने की योजना बनाई?",
    o: ["Project 15C, Project 17B, Project 18A", "Project Alpha, Beta, Gamma", "Project Vikrant, Vikramaditya, Viraat", "Project Nilgiri, Shivalik, Talwar"],
    a: 0,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "Project 15C (डिस्ट्रॉयर), Project 17B (फ्रिगेट), और Project 18A (बड़े युद्धपोत)।"
  },
  {
    id: 58,
    q: "मार्च 2026 में INS Dunagiri (F36) किस श्रेणी का युद्धपोत है और इसे नौसेना में कब सौंपा गया?",
    o: ["कोलकाता-श्रेणी, 15 जनवरी", "निलगिरि-श्रेणी का गाइडेड-मिसाइल फ्रिगेट, 30 मार्च 2026", "विशाखापटनम-श्रेणी, 10 फरवरी", "स्कॉर्पीन-श्रेणी, 1 अप्रैल"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "INS Dunagiri निलगिरि-श्रेणी का गाइडेड-मिसाइल फ्रिगेट है जिसे 30 मार्च 2026 को नौसेना को सौंपा गया।"
  },
  {
    id: 59,
    q: "जुलाई 2026 में भारत और सऊदी अरब ने किस विषय पर MoU साइन किया?",
    o: ["रक्षा सहयोग", "जल संसाधन प्रबंधन", "शिक्षा आदान-प्रदान", "व्यापार समझौता"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "भारत व सऊदी अरब ने जल संसाधन प्रबंधन, सीवेज रीसाइक्लिंग व विलवणीकरण हेतु ऐतिहासिक समझौता किया।"
  },
  {
    id: 60,
    q: "जुलाई 2026 में जर्मनी के भारत में राजदूत ने किस पनडुब्बी परियोजना पर बातचीत की पुष्टि की?",
    o: ["Project-75I", "Project-76", "Project-Sea Dragon", "Project-Submarine Alpha"],
    a: 0,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "भारत और जर्मनी €8 अरब (₹90,000+ करोड़) की Project-75I पनडुब्बी डील को अंतिम रूप दे रहे हैं।"
  },
  {
    id: 61,
    q: "जुलाई 2026 में अमेरिकी सीनेट में पास हुए 'Lindsey O Graham Sanctioning Russia Act of 2026' को कितने वोटों से पारित किया गया?",
    o: ["51-49 वोट से", "60-40 वोट से", "86-12 वोट से", "100-0 वोट से"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "अमेरिकी सीनेट में यह विधेयक 86-12 के भारी बहुमत से पारित हुआ।"
  },
  {
    id: 62,
    q: "मार्च 2026 में पीएम मुद्रा योजना ने कितने वर्ष पूरे किए?",
    o: ["5 वर्ष", "8 वर्ष", "11 वर्ष", "15 वर्ष"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "पीएम मुद्रा योजना ने एमएसएमई व सूक्ष्म उद्यमियों को ऋण देने के 11 वर्ष पूरे किए।"
  },
  {
    id: 63,
    q: "जुलाई 2026 में राजस्थान में RajNivesh पोर्टल पर अप्रैल-जून तिमाही में कितने आवेदन मिले?",
    o: ["10,000", "20,000", "30,000 से अधिक", "50,000"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "RajNivesh पोर्टल पर 30,000 से अधिक आवेदन प्राप्त हुए जिनमें से 17,000 से अधिक स्वीकृत हुए।"
  },
  {
    id: 64,
    q: "जुलाई 2026 में राजस्थान में जून माह में किस क्षेत्र में सबसे ज़्यादा निवेश रुचि (₹1.03 लाख करोड़) दर्ज हुई?",
    o: ["केवल आईटी", "रियल एस्टेट, नवीकरणीय ऊर्जा, टेक्सटाइल्स, पर्यटन, जेम्स", "कृषि उत्पाद", "भारी वाहन"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "रियल एस्टेट, रिन्यूएबल एनर्जी, टेक्सटाइल्स, पर्यटन एवं जेम्स एंड ज्वेलरी में ₹1.03 लाख करोड़+ निवेश प्रस्ताव मिले।"
  },
  {
    id: 65,
    q: "जुलाई 2026 में राजस्थान सरकार ने सरकारी कर्मचारियों के लिए नई सैलरी अकाउंट योजना हेतु कितने सार्वजनिक क्षेत्र के बैंकों को चुना?",
    o: ["5 बैंक", "8 बैंक", "12 बैंक", "15 बैंक"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "राजस्थान सरकार ने नई कर्मचारी सैलरी अकाउंट स्कीम के लिए 12 PSB बैंकों का चयन किया।"
  },
  {
    id: 66,
    q: "जुलाई-सितंबर 2026 तिमाही के लिए पोस्ट ऑफिस सीनियर सिटीज़न सेविंग स्कीम पर ब्याज दर कितनी है?",
    o: ["7.1%", "7.5%", "8.2% वार्षिक", "9.0%"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "सीनियर सिटीजन सेविंग स्कीम पर 8.2% वार्षिक ब्याज दर निर्धारित है।"
  },
  {
    id: 67,
    q: "राजस्थान सरकार ने कब 25 केंद्रीय व राज्य स्तरीय योजनाओं को फ्लैगशिप कार्यक्रम घोषित किया?",
    o: ["जनवरी 2024", "अप्रैल 2025", "मार्च 2026", "जून 2026"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "अप्रैल 2025 में राजस्थान सरकार ने 25 योजनाओं को CMO की सीधी निगरानी वाले फ्लैगशिप कार्यक्रम घोषित किया।"
  },
  {
    id: 68,
    q: "राजस्थान में मुख्यमंत्री किसान सम्मान निधि योजना के चौथे किस्त हस्तांतरण में कितनी राशि किसानों को भेजी गई?",
    o: ["₹500 करोड़", "₹717.96 करोड़", "₹1000 करोड़", "₹1200 करोड़"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "CM भजनलाल शर्मा ने किसानों के खातों में ₹717.96 करोड़ सीधे ट्रांसफर किए।"
  },
  {
    id: 69,
    q: "राजस्थान ग्रामीण ओलंपिक खेल का नया रूप किस नाम से घोषित किया गया?",
    o: ["खेलो राजस्थान यूथ गेम्स 2025", "राजस्थान स्पोर्ट्स लीग", "युवा ग्रामीण खेल", "राजस्थान चैंपियन कप"],
    a: 0,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "खेलो राजस्थान यूथ गेम्स 2025 ग्रामीण ओलंपिक खेल का नया नाम व स्वरूप है।"
  },
  {
    id: 70,
    q: "राजस्थान आपकी बेटी योजना 2026 में आवेदन किस पोर्टल के माध्यम से किया जा सकता है?",
    o: ["ई-मित्र पोर्टल", "शाला दर्पण पोर्टल", "जन सूचना पोर्टल", "राजस्थान सेवा पोर्टल"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "BPL परिवारों की बेटियां शाला दर्पण पोर्टल से ऑनलाइन आवेदन कर सकती हैं।"
  },
  {
    id: 71,
    q: "जुलाई 2026 में कौन सा नया नियम भारतीय टेलीग्राफ अधिनियम 1885 की जगह लेगा?",
    o: ["डिजिटल इंडिया नियम", "टेलीकॉम प्राधिकरण नियम 2026", "सूचना एवं संचार नियम 2025", "नवीन 5G अधिनियम"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "टेलीकॉम प्राधिकरण नियम 2026 (दूरसंचार अधिनियम 2023 के तहत) 1885 के भारतीय टेलीग्राफ अधिनियम की जगह लेगा।"
  },
  {
    id: 72,
    q: "जुलाई 2026 में 28.25 लाख महिलाओं को पहली किस्त मिलने के बाद अन्नपूर्णा योजना की दूसरी किस्त कितनी राशि की जमा हुई?",
    o: ["₹1,000", "₹2,000", "₹3,000", "₹5,000"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "1 जुलाई 2026 से अन्नपूर्णा योजना की दूसरी किस्त के रूप में ₹3,000 जमा किए गए।"
  },
  {
    id: 73,
    q: "जुलाई 2026 में स्वास्थ्य एवं परिवार कल्याण केंद्रीय परिषद (CCHFW) की कौन सी कॉन्फ्रेंस आयोजित हुई?",
    o: ["10वीं", "12वीं", "16वीं कॉन्फ्रेंस", "20वीं"],
    a: 2,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "स्वास्थ्य मंत्री जे.पी. नड्डा ने CCHFW की 16वीं कॉन्फ्रेंस की अध्यक्षता विज्ञान भवन, दिल्ली में की।"
  },
  {
    id: 74,
    q: "जुलाई 2026 में हिमाचल प्रदेश ने किस योजना के तहत बकाया कृषि ऋण पर 50% ब्याज सब्सिडी देने की घोषणा की?",
    o: ["हिमाचल कृषि ऋण ब्याज सबवेंशन योजना", "किसान राहत योजना", "ऋण माफी 2026", "कृषि प्रोत्साहन योजना"],
    a: 0,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "हिमाचल कृषि ऋण ब्याज सबवेंशन योजना के तहत बकाया कृषि ऋणों पर 50% ब्याज सब्सिडी दी जाएगी।"
  },
  {
    id: 75,
    q: "तमिलनाडु की नई स्वास्थ्य बीमा योजना (पेंशनरों के लिए, 2026) में कवरेज और प्रीमियम कितना है?",
    o: ["₹5 लाख कवर, ₹500 प्रीमियम", "₹7.5 लाख कवर, ₹644 प्रीमियम", "₹10 लाख कवर, ₹1000 प्रीमियम", "₹2 लाख कवर, ₹100 प्रीमियम"],
    a: 1,
    section: "General Awareness & Current Affairs",
    sectionKey: "current_affairs",
    explanation: "तमिलनाडु की पेंशनर स्वास्थ्य बीमा योजना में ₹7.5 लाख का स्वास्थ्य कवर एवं ₹644 का प्रीमियम है।"
  }
];
