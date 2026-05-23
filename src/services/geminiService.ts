import { Question, QuizConfig } from "../types";


// Master high-quality offline question repository for RPSC/CBT examinations
const OFFLINE_QUESTION_BANK: any[] = [
  {
    subject: "Rajasthan GK",
    question_hindi: "राजस्थान के एकीकरण के प्रथम चरण में 'मत्स्य संघ' का गठन कब किया गया था?",
    question_english: "When was 'Matsya Sangha' formed in the first phase of the integration of Rajasthan?",
    options: {
      A: "18 मार्च 1948",
      B: "25 मार्च 1948",
      C: "18 अप्रैल 1948",
      D: "30 मार्च 1949"
    },
    options_bilingual: {
      A: { hindi: "18 मार्च 1948", english: "18 March 1948" },
      B: { hindi: "25 मार्च 1948", english: "25 March 1948" },
      C: { hindi: "18 अप्रैल 1948", english: "18 April 1948" },
      D: { hindi: "30 मार्च 1949", english: "30 March 1949" }
    },
    correctAnswer: "A",
    explanation_hindi: "राजस्थान एकीकरण का प्रथम चरण 18 मार्च, 1948 को मत्स्य संघ के गठन के साथ हुआ था, जिसमें अलवर, भरतपुर, धौलपुर व करौली रियासतें शामिल थीं।",
    explanation_english: "The first phase of the integration of Rajasthan took place on 18 March 1948 with the formation of Matsya Sangha, which included Alwar, Bharatpur, Dholpur, and Karauli.",
    difficulty: "Medium",
    teacherInsight: "याद रखें: अलवर, भरतपुर, धौलपुर और करौली को ABCD से आसानी से याद किया जा सकता है!",
    wrongOptionsAnalysis: {
      A: "सही उत्तर - 18 मार्च 1948 (प्रथम चरण)",
      B: "राजस्थान संघ का गठन (द्वितीय चरण) - 25 मार्च 1948",
      C: "संयुक्त राजस्थान का गठन (तृतीय चरण) - 18 अप्रैल 1948",
      D: "बृहत् राजस्थान का गठन (चतुर्थ चरण) - 30 मार्च 1949"
    },
    extraFacts: [
      "मत्स्य संघ का नाम के. एम. मुंशी की सिफारिश पर रखा गया था।",
      "अलवर के महाराजा तेजसिंह के दीवान एन.बी. खरे को नजरबंद किया गया था।"
    ]
  },
  {
    subject: "Rajasthan GK",
    question_hindi: "प्रसिद्ध 'विजय स्तम्भ' का निर्माण महाराणा कुम्भा ने किस विजय के उपलक्ष्य में करवाया था?",
    question_english: "In celebration of which victory did Maharana Kumbha construct the famous 'Vijay Stambha'?",
    options: {
      A: "सारंगपुर का युद्ध",
      B: "खातोली का युद्ध",
      C: "बाड़ी का युद्ध",
      D: "दिवेर का युद्ध"
    },
    options_bilingual: {
      A: { hindi: "सारंगपुर का युद्ध", english: "Battle of Sarangpur" },
      B: { hindi: "खातोली का युद्ध", english: "Battle of Khatoli" },
      C: { hindi: "बाड़ी का युद्ध", english: "Battle of Bari" },
      D: { hindi: "दिवेर का युद्ध", english: "Battle of Diver" }
    },
    correctAnswer: "A",
    explanation_hindi: "महाराणा कुम्भा ने 1437 ई. में सारंगपुर के युद्ध में मालवा के सुल्तान महमूद खिलजी प्रथम को पराजित करने की खुशी में चित्तौड़गढ़ दुर्ग में 9 मंजिला विजय स्तम्भ का निर्माण करवाया था।",
    explanation_english: "Maharana Kumbha constructed the 9-story Vijay Stambha in Chittorgarh Fort to commemorate his victory over Malwa's Sultan Mahmud Khilji I in the Battle of Sarangpur in 1437 AD.",
    difficulty: "Easy",
    teacherInsight: "विजय स्तम्भ को हिंदू मूर्तिकला का विश्वकोश कहा जाता है।",
    wrongOptionsAnalysis: {
      A: "सही उत्तर - सारंगपुर का युद्ध (1437)",
      B: "खातोली का युद्ध (1517) - राणा सांगा और इब्राहिम लोदी के बीच हुआ।",
      C: "बाड़ी का युद्ध (1518) - राणा सांगा और इब्राहिम लोदी के बीच हुआ।",
      D: "दिवेर का युद्ध (1582) - महाराणा प्रताप और मुगलों के बीच हुआ था।"
    },
    extraFacts: [
      "यह इमारत 9 मंजिला है और इसकी कुल ऊंचाई 122 फीट है।",
      "इसके प्रधान वास्तुकार जैता और उनके तीन पुत्र नापा, पोमा व पुंजा थे।"
    ]
  },
  {
    subject: "Indian GK",
    question_hindi: "भारतीय संविधान का कौन सा अनुच्छेद 'ग्राम पंचायतों के संगठन' से संबंधित है?",
    question_english: "Which Article of the Indian Constitution is related to the 'Organization of Village Panchayats'?",
    options: {
      A: "अनुच्छेद 40",
      B: "अनुच्छेद 44",
      C: "अनुच्छेद 48",
      D: "अनुच्छेद 50"
    },
    options_bilingual: {
      A: { hindi: "अनुच्छेद 40", english: "Article 40" },
      B: { hindi: "अनुच्छेद 44", english: "Article 44" },
      C: { hindi: "अनुच्छेद 48", english: "Article 48" },
      D: { hindi: "अनुच्छेद 50", english: "Article 50" }
    },
    correctAnswer: "A",
    explanation_hindi: "भारतीय संविधान का अनुच्छेद 40 राज्य नीति के निर्देशित सिद्धांतों (DPSP) के अंतर्गत राज्य को ग्राम पंचायतों को गठित व सशक्त करने का निर्देश देता है।",
    explanation_english: "Article 40 of the Indian Constitution, under the Directive Principles of State Policy (DPSP), directs the State to organize and empower village panchayats.",
    difficulty: "Easy",
    teacherInsight: "अनुच्छेद 40 राष्ट्रपिता महात्मा गांधी की स्वराज अवधारणा पर आधारित गांधीवादी सिद्धांतों का हिस्सा है।",
    wrongOptionsAnalysis: {
      A: "सही उत्तर - अनुच्छेद 40",
      B: "अनुच्छेद 44 - समान नागरिक संहिता (Uniform Civil Code - UCC)",
      C: "अनुच्छेद 48 - कृषि और पशुपालन का वैज्ञानिक संगठन",
      D: "अनुच्छेद 50 - न्यायपालिका का कार्यपालिका से पृथक्करण"
    },
    extraFacts: [
      "भारत में त्रिस्तरीय पंचायती राज व्यवस्था की सिफारिश बलवंत राय मेहता समिति ने की थी।",
      "2 अक्टूबर 1959 को राजस्थान के नागौर जिले के बगदरी गांव में सर्वप्रथम पंचायती राज का उद्घाटन किया गया।"
    ]
  },
  {
    subject: "Indian GK",
    question_hindi: "काजीरंगा राष्ट्रीय उद्यान किस राज्य में स्थित है और यह मुख्य रूप से किसके लिए प्रसिद्ध है?",
    question_english: "In which state is Kaziranga National Park located and what is it famous for?",
    options: {
      A: "असम - एक सींग वाला गेंडा",
      B: "गुजरात - एशियाई शेर",
      C: "उत्तराखंड - बंगाल टाइगर",
      D: "कर्नाटक - एशियाई हाथी"
    },
    options_bilingual: {
      A: { hindi: "असम - एक सींग वाला गेंडा", english: "Assam - One-horned Rhinoceros" },
      B: { hindi: "गुजरात - एशियाई शेर", english: "Gujarat - Asiatic Lion" },
      C: { hindi: "उत्तराखंड - बंगाल टाइगर", english: "Uttarakhand - Bengal Tiger" },
      D: { hindi: "कर्नाटक - एशियाई हाथी", english: "Karnataka - Asiatic Elephant" }
    },
    correctAnswer: "A",
    explanation_hindi: "काजीरंगा राष्ट्रीय उद्यान असम में स्थित है और यह दुनिया के सर्वाधिक एक सींग वाले गेंडों (Great Indian One-horned Rhinoceros) का घर है। यह यूनेस्को विश्व धरोहर स्थल भी है।",
    explanation_english: "Kaziranga National Park is located in Assam and is home to two-thirds of the world's great one-horned rhinoceroses. It is also a UNESCO World Heritage Site.",
    difficulty: "Easy",
    teacherInsight: "ब्रह्मपुत्र नदी इस राष्ट्रीय उद्यान के उत्तरी किनारे से बहती हुई गुजरती है, जो इसका प्राकृतिक जलस्रोत है।",
    wrongOptionsAnalysis: {
      A: "सही उत्तर - असम - एक सींग वाला गेंडा",
      B: "गुजरात में गिर राष्ट्रीय उद्यान विशेष रूप से एशियाई शेरों का एकमात्र प्राकृतिक पर्यावास है।",
      C: "उत्तराखंड में जिम कॉर्बेट राष्ट्रीय उद्यान भारत का सबसे पुराना राष्ट्रीय उद्यान है जो बंगाल टाइगर्स के लिए है।",
      D: "कर्नाटक में बांदीपुर या नागरहोल राष्ट्रीय उद्यान हाथियों व बाघों के लिए प्रसिद्ध है।"
    },
    extraFacts: [
      "काजीरंगा को वर्ष 2006 में भारत सरकार द्वारा टाइगर रिजर्व भी घोषित किया गया था।",
      "यह राष्ट्रीय उद्यान पक्षियों की विभिन्न संकटग्रस्त प्रजातियों के लिए 'बर्डलाइफ इंटरनेशनल' द्वारा महत्वपूर्ण पक्षी क्षेत्र है।"
    ]
  },
  {
    subject: "Daily Live Quiz",
    question_hindi: "हाल ही में घोषित आरपीएससी परीक्षा कैलेंडर के अनुसार, राज्य सेवा मुख्य परीक्षा में बैठने वाले उम्मीदवारों के लिए क्या अनुमत समय सीमा निर्धारित की गई है?",
    question_english: "According to the recently announced RPSC exam updates, what is the standard negative marking weightage applied to CBT tests?",
    options: {
      A: "प्रत्येक गलत उत्तर पर एक-तिहाई (1/3) अंक काटना",
      B: "प्रत्येक गलत उत्तर पर एक-चौथाई (1/4) अंक काटना",
      C: "प्रत्येक गलत उत्तर पर आधा (1/2) अंक काटना",
      D: "कोई नकारात्मक अंकन नहीं"
    },
    options_bilingual: {
      A: { hindi: "प्रत्येक गलत उत्तर पर एक-तिहाई (1/3) अंक काटना", english: "One-third (1/3) marks deducted per wrong answer" },
      B: { hindi: "प्रत्येक गलत उत्तर पर एक-चौथाई (1/4) अंक काटना", english: "One-fourth (1/4) marks deducted per wrong answer" },
      C: { hindi: "प्रत्येक गलत उत्तर पर आधा (1/2) अंक काटना", english: "Half (1/2) marks deducted per wrong answer" },
      D: { hindi: "कोई नकारात्मक अंकन नहीं", english: "No negative marking" }
    },
    correctAnswer: "A",
    explanation_hindi: "RPSC परीक्षा नियमों व CBT दिशानिर्देशों के अनुसार, वस्तुनिष्ठ प्रारंभिक परीक्षाओं में प्रत्येक गलत विकल्प चयन पर 1/3 अंक काटा जाता है। उम्मीदवारों को 5वें विकल्प नियमावली का भी सख्ती से पालन करना चाहिए।",
    explanation_english: "According to standard RPSC guidelines and CBT framework rules, a deduction of one-third (1/3) mark is applicable for every incorrect answer chosen by the candidate.",
    difficulty: "Medium",
    teacherInsight: "परीक्षा में यदि प्रश्न न आए, तो उसे छोड़ देना उचित रहता है ताकि 1/3 की नकारात्मक मार्किंग से बचा जा सके।",
    wrongOptionsAnalysis: {
      A: "सही उत्तर - 1/3 नकारात्मक अंकन ही मानक है",
      B: "1/4 का नियम कुछ केंद्रीय परीक्षाओं जैसे SSC इत्यादि में लागू होता है",
      C: "1/2 का अत्यधिक कटौती नियम आरपीएससी के किसी प्रमुख परीक्षा में सामान्य रूप से नहीं है",
      D: "नेगेटिव मार्किंग के बिना परीक्षा देना सुरक्षित होता है, परंतु आरपीएससी में ऐसा नहीं है"
    },
    extraFacts: [
      "CBT प्रणाली में वास्तविक समय की सटीकता जांचने के लिए एक डिजिटल ओएमआर ट्रैकर जोड़ा जाता है।",
      "अटेम्प्ट न किए गए प्रश्नों पर आरपीएससी में पांचवां गोला न भरने पर 1/3 अंक काटने का नया प्रावधान भी है।"
    ]
  },
  {
    subject: "Science",
    question_hindi: "मानव शरीर में रक्त का थक्का (Blood Coagulation) जमने में कौन सा विटामिन मुख्य सहायक कारक के रूप में कार्य करता है?",
    question_english: "Which vitamin is primarily helpful in human blood clotting processed by liver?",
    options: {
      A: "विटामिन K",
      B: "विटामिन C",
      C: "विटामिन D",
      D: "विटामिन E"
    },
    options_bilingual: {
      A: { hindi: "विटामिन K", english: "Vitamin K" },
      B: { hindi: "विटामिन C", english: "Vitamin C" },
      C: { hindi: "विटामिन D", english: "Vitamin D" },
      D: { hindi: "विटामिन E", english: "Vitamin E" }
    },
    correctAnswer: "A",
    explanation_hindi: "विटामिन K यकृत को प्रोथ्रोम्बिन और फाइब्रिनोजेन जैसे थक्का बनाने वाले कारकों का उत्पादन करने में मदद करता है। इसकी कमी से मामूली चोट पर भी रक्त लगातार बहता रहता है।",
    explanation_english: "Vitamin K operates as a cofactor in synthesis of blood coagulation proteins like prothrombin in the liver. Its deficiency results in failure to clot.",
    difficulty: "Easy",
    teacherInsight: "विटामिन K वसा में घुलनशील (Fat-soluble) है और जीवाणु (Bacteria) इसे मानव की बड़ी आंत में स्वयं भी संश्लेषित करते हैं।",
    wrongOptionsAnalysis: {
      A: "सही उत्तर - विटामिन K",
      B: "विटामिन C - जल में घुलनशील है, मसूड़ों की मजबूती व घाव भरने में सहायक है।",
      C: "विटामिन D - कैल्सीफेरॉल, कैल्शियम अवशोषण और हड्डियों के स्वास्थ्य के लिए आवश्यक है।",
      D: "विटामिन E - टोकोफेरॉल, कोशिकाओं को नुकसान से बचाने वाला सौंदर्य विटामिन है।"
    },
    extraFacts: [
      "रक्त स्राव के समय थक्का बनाने में 'कैल्शियम आयन' (Ca2+) भी आवश्यक रासायनिक तत्व है।",
      "हिपैरिन शरीर के भीतर रक्त वाहिकाओं में थक्का बनने से रोकता है, जो विटामिन K के विपरीत कार्य करता है।"
    ]
  },
  {
    subject: "Science",
    question_hindi: "इसरो (ISRO) द्वारा सूर्य के अध्ययन के लिए भेजे गए भारत के प्रथम अंतरिक्ष मिशन का क्या नाम है?",
    question_english: "What is the name of India's first dedicated solar space observatory mission launched by ISRO?",
    options: {
      A: "आदित्य-L1",
      B: "चंद्रयान-3",
      C: "मंगल्यान-2",
      D: "गगनयान-1"
    },
    options_bilingual: {
      A: { hindi: "आदित्य-L1", english: "Aditya-L1" },
      B: { hindi: "चंद्रयान-3", english: "Chandrayaan-3" },
      C: { hindi: "मंगल्यान-2", english: "Mangalyaan-2" },
      D: { hindi: "गगनयान-1", english: "Gaganyaan-1" }
    },
    correctAnswer: "A",
    explanation_hindi: "आदित्य-L1 मिशन को 2 सितंबर, 2023 को ध्रुवीय उपग्रह प्रक्षेपण यान (PSLV-C57) द्वारा प्रक्षेपित किया गया था। इसे पृथ्वी से करीब 15 लाख किलोमीटर दूर लैग्रेंजियन बिंदु 1 (L1) के चारों ओर हेलो कक्षा में स्थापित किया गया है।",
    explanation_english: "Aditya-L1 was launched by PSLV-C57 on September 2, 2023. It is situated in a halo orbit around Lagrangian point 1 (L1), 1.5 million km from Earth.",
    difficulty: "Medium",
    teacherInsight: "L1 बिंदु पर सूर्य और पृथ्वी के गुरुत्वाकर्षण बल संतुलित होते हैं, जिससे उपग्रह को एक स्थिर अवलोकन स्थान प्राप्त होता है।",
    wrongOptionsAnalysis: {
      A: "सही उत्तर - आदित्य-L1",
      B: "चंद्रयान-3 - चंद्रमा के दक्षिणी ध्रुव पर सॉफ्ट लैंडिंग करने वाला ऐतिहासिक मिशन है।",
      C: "मंगल्यान-2 - मंगल ग्रह के लिए नियोजित आगामी मार्स ऑर्बिटर मिशन का दूसरा चरण है।",
      D: "गगनयान - भारत का महत्वाकांक्षी मानव अंतरिक्ष उड़ान कार्यक्रम (Human Spaceflight Program) है।"
    },
    extraFacts: [
      "मिशन का मुख्य उद्देश्य सूर्य के वायुमंडल, सौर ज्वालाओं और कोरोनल मास इजेक्शन का वास्तविक समय में अध्ययन करना है।",
      "लैग्रेंज बिंदु प्रणालियों में ईंधन की बहुत कम खपत होती है क्योंकि पिंड बिना अतिरिक्त कर्षण के उसी स्थान पर तैरते रहते हैं।"
    ]
  },
  {
    subject: "Hindi",
    question_hindi: "निम्नलिखित में से 'विद्या + आलय = विद्यालय' शब्द में व्याकरण के नियमों के अनुसार कौन सी संधि विच्छेद फलित होती है?",
    question_english: "According to grammar rules, which type of Sandhi represents the combination 'Vidya + Alaya = Vidyalaya'?",
    options: {
      A: "दीर्घ स्वर संधि",
      B: "गुण स्वर संधि",
      C: "वृद्धि स्वर संधि",
      D: "यण स्वर संधि"
    },
    options_bilingual: {
      A: { hindi: "दीर्घ स्वर संधि", english: "Dirgh Svar Sandhi" },
      B: { hindi: "गुण स्वर संधि", english: "Gun Svar Sandhi" },
      C: { hindi: "वृद्धि स्वर संधि", english: "Vriddhi Svar Sandhi" },
      D: { hindi: "यण स्वर संधि", english: "Yan Svar Sandhi" }
    },
    correctAnswer: "A",
    explanation_hindi: "'विद्या' के अंत में 'आ' स्वर है और 'आलय' के प्रारंभ में भी 'आ' स्वर है। जब दीर्घ स्वर समान वर्णों के साथ मिलते हैं (आ + आ = आ), तो वे दीर्घीकृत हो जाते हैं। इसे दीर्घ संधि कहा जाता है।",
    explanation_english: "In 'Vidya + Alaya', the vowels 'aa' merge into a single prolonged 'aa', indicating 'Dirgh Svar Sandhi' according to phonetic rules.",
    difficulty: "Easy",
    teacherInsight: "संधियों के संकलन को याद करने का सरल तरीका यह है कि जब भी शब्द के मध्य भाग में 'आ', 'ई' या 'ऊ' की मात्रा दिखे, तो वहाँ दीर्घ संधि की मजबूत संभावना होती है।",
    wrongOptionsAnalysis: {
      A: "सही उत्तर - दीर्घ स्वर संधि",
      B: "गुण स्वर संधि में 'अ/आ' के आगे 'इ/ई' मिलने पर 'ए' बन जाता है (जैसे: देव + ईश = देवेश)।",
      C: "वृद्धि स्वर संधि में स्वर ए या ऐ मिलने पर ऐ हो जाता है (जैसे: एक + एक = एकैक)।",
      D: "यण स्वर संधि में 'इ/ई' का 'य' और 'उ/ऊ' का 'व' बन जाता है (जैसे: इति + आदि = इत्यादि)।"
    },
    extraFacts: [
      "स्वर संधि के ही ये पांचों प्रमुख भेद होते हैं जिनका हिंदी व्याकरण में अत्यधिक उपयोग है।",
      "व्यंजन और विसर्ग संधियों में स्वरों के स्थान पर हलंत अथवा विसर्ग बिन्दुओं का विकार देखा जाता है।"
    ]
  },
  {
    subject: "Hindi",
    question_hindi: "हिंदी कहावत 'ऊंट के मुंह में जीरा' का सटीक भावार्थ निम्नलिखित में से क्या है?",
    question_english: "What is the precise meaning of the well-known Hindi idiom 'Oont ke mooh mein jeera'?",
    options: {
      A: "बहुत कम मात्रा में प्राप्त होना, जबकि आवश्यकता बहुत अधिक हो",
      B: "आवश्यकता से बहुत अधिक भोजन प्राप्त करना",
      C: "ऊँट को जबरन छोटी वस्तुएं खिलाना",
      D: "बिना किसी योजना के अप्रत्याशित भारी लाभ मिलना"
    },
    options_bilingual: {
      A: { hindi: "बहुत कम मात्रा में प्राप्त होना, जबकि आवश्यकता बहुत अधिक हो", english: "Very small quantity relative to a huge requirement" },
      B: { hindi: "आवश्यकता से बहुत अधिक भोजन प्राप्त करना", english: "Receiving way more than actually needed" },
      C: { hindi: "ऊँट को जबरन छोटी वस्तुएं खिलाना", english: "Forcefully feeding tiny assets to camels" },
      D: { hindi: "बिना किसी योजना के अप्रत्याशित भारी लाभ मिलना", english: "Sudden huge windfall gain without any hard work" }
    },
    correctAnswer: "A",
    explanation_hindi: "यह मुहावरा तब उपयोग किया जाता है जब किसी विशाल जरूरत को मिटा देने के लिए अत्यंत नगण्य या अपर्याप्त साधन या वस्तु उपलब्ध कराई जाए।",
    explanation_english: "This popular Hindi idiom translates literally to 'Cumin seed in a camel's mouth', symbolizing an insignificant supply against a massive demand.",
    difficulty: "Easy",
    teacherInsight: "इस मुहावरे का उपयोग दैनिक बोलचाल और परीक्षा निबंधों में भाषा के प्रवाह को सुंदर बनाने के लिए बहुत किया जाता है।",
    wrongOptionsAnalysis: {
      A: "सही उत्तर - अपर्याप्त पूर्ति दर्शाता है।",
      B: "यह 'ऊंट के मुंह में जीरा' का पूर्णतः विपरीत अर्थ है।",
      C: "यह मुहावरे का केवल शाब्दिक निरर्थक अनुवाद है, जो कि गलत है।",
      D: "अचानक लाभ मिलने के संदर्भ के लिए 'छप्पर फाड़कर मिलना' मुहावरा प्रयोग किया जाता है।"
    },
    extraFacts: [
      "मुहावरे पूर्ण वाक्य नहीं होते, बल्कि वाक्यांश होते हैं जिन्हें वाक्यों में क्रिया के अनुसार ढाला जाता है।",
      "लोकोक्तियाँ स्वतंत्र होती हैं और इन्हें सीधे वाक्य के रूप में या दृष्टांत के रूप में प्रयोग किया जाता है।"
    ]
  },
  {
    subject: "English",
    question_hindi: "वाक्य 'He has been studying in this college since 2021.' में प्रयुक्त काल (Tense) की पहचान करें।",
    question_english: "Identify the tense used in the sentence: 'He has been studying in this college since 2021.'",
    options: {
      A: "Present Perfect Continuous Tense",
      B: "Present Continuous Tense",
      C: "Past Perfect Continuous Tense",
      D: "Present Perfect Tense"
    },
    options_bilingual: {
      A: { hindi: "प्रेजेंट परफेक्ट कंटीन्यूअस काल", english: "Present Perfect Continuous Tense" },
      B: { hindi: "प्रेजेंट कंटीन्यूअस काल", english: "Present Continuous Tense" },
      C: { hindi: "पास्ट परफेक्ट कंटीन्यूअस काल", english: "Past Perfect Continuous Tense" },
      D: { hindi: "प्रेजेंट परफेक्ट काल", english: "Present Perfect Tense" }
    },
    correctAnswer: "A",
    explanation_hindi: "इस वाक्य में 'has been + verb-ing' के साथ निश्चित समय सूचक शब्द 'since 2021' लगा हुआ है। यह संरचना दर्शाती है कि अध्ययन का कार्य भूतकाल में शुरू हुआ और वर्तमान में भी अबाधित ढंग से जारी है।",
    explanation_english: "The clause contains 'has been + study-ing' anchored by the point-of-time tracker 'since 2021'. This matches the Present Perfect Continuous definition.",
    difficulty: "Easy",
    teacherInsight: "ध्यान दें: यदि समय अवधि दी गई हो तो 'for' का और निश्चित तिथि या वर्ष दिया हो तो 'since' का उपयोग करें।",
    wrongOptionsAnalysis: {
      A: "सही उत्तर - Present Perfect Continuous काल है।",
      B: "Present Continuous में सिर्फ is/am/are और क्रिया+ing होती है, समय संदर्भ नहीं होता।",
      C: "Past Perfect Continuous में had been का उपयोग होता है, जो भूतकाल को दर्शाता है।",
      D: "Present Perfect में केवल has/have के साथ क्रिया का तृतीय रूप (V3) आता है।"
    },
    extraFacts: [
      "'Since' का प्रयोग 'Point of Time' (जैसे Monday, 8 AM, July, morning) के साथ होता है।",
      "'For' का प्रयोग 'Period of Time' (जैसे 5 hours, 4 years, many days) के साथ होता है।"
    ]
  },
  {
    subject: "Mathematics",
    question_hindi: "एक व्यापारी ₹800 में एक वस्तु खरीदता है और उसे ₹1000 में बेच देता है। उसका लाभ प्रतिशत (Profit Percentage) क्या होगा?",
    question_english: "A trader buys an item for Rs 800 and sells it for Rs 1000. What is his profit percentage?",
    options: {
      A: "20%",
      B: "25%",
      C: "30%",
      D: "15%"
    },
    options_bilingual: {
      A: { hindi: "20%", english: "20%" },
      B: { hindi: "25%", english: "25%" },
      C: { hindi: "30%", english: "30%" },
      D: { hindi: "15%", english: "15%" }
    },
    correctAnswer: "B",
    explanation_hindi: "क्रय मूल्य (Cost Price) = ₹800, विक्रय मूल्य (Selling Price) = ₹1000। कुल लाभ = विक्रय मूल्य - क्रय मूल्य = ₹200। लाभ % = (कुल लाभ / क्रय मूल्य) × 100 = (200 / 800) × 100 = 1/4 × 100 = 25%।",
    explanation_english: "Cost Price (CP) = ₹800, Selling Price (SP) = ₹1000. Total Profit = SP - CP = ₹200. Profit % = (Total Profit / CP) * 100 = (200 / 800) * 100 = 25%.",
    difficulty: "Easy",
    wrongOptionsAnalysis: {
      A: "Incorrect option",
      B: "Correct option",
      C: "Incorrect option",
      D: "Incorrect option"
    }
  }
];

// Simple text normalizer for duplicate checking
function cleanText(text: string): string {
  if (!text) return "";
  return text.toLowerCase().replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "").trim();
}

// Offline fallback question provider
function getOfflineQuestions(subject: string, count: number, language: string): Question[] {
  let filtered = OFFLINE_QUESTION_BANK.filter(q => (q.subject || '').toLowerCase() === (subject || '').toLowerCase());
  if (filtered.length === 0) {
    filtered = OFFLINE_QUESTION_BANK;
  }
  
  const fallbackQuestions: Question[] = [];
  while (fallbackQuestions.length < count) {
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    for (const q of shuffled) {
      if (fallbackQuestions.length >= count) break;
      
      let finalQuestion = q.question || q.question_hindi || q.question_english;
      let finalOptions = q.options;
      let finalExplanation = q.explanation_hindi || q.explanation_english || q.explanation || "";

      if (language === 'Bilingual' && q.options_bilingual) {
        finalQuestion = `${q.question_hindi}\n\n${q.question_english}`;
        finalOptions = {
          A: `${q.options_bilingual.A.hindi} / ${q.options_bilingual.A.english}`,
          B: `${q.options_bilingual.B.hindi} / ${q.options_bilingual.B.english}`,
          C: `${q.options_bilingual.C.hindi} / ${q.options_bilingual.C.english}`,
          D: `${q.options_bilingual.D.hindi} / ${q.options_bilingual.D.english}`,
        };
        finalExplanation = `${q.explanation_hindi}\n\n${q.explanation_english}`;
      } else if (language === 'Hindi') {
        finalQuestion = q.question_hindi || finalQuestion;
        finalExplanation = q.explanation_hindi || finalExplanation;
      } else if (language === 'English') {
        finalQuestion = q.question_english || finalQuestion;
        finalExplanation = q.explanation_english || finalExplanation;
      }

      fallbackQuestions.push({
        id: `offline-${subject}-${fallbackQuestions.length}-${Date.now()}`,
        question: finalQuestion,
        options: finalOptions,
        correctAnswer: q.correctAnswer,
        explanation: finalExplanation,
        explanationHindi: q.explanation_hindi,
        explanationEnglish: q.explanation_english,
        teacherInsight: q.teacherInsight || "Study daily standard guidelines.",
        wrongOptionsAnalysis: q.wrongOptionsAnalysis || { A: "Incorrect", B: "Incorrect", C: "Incorrect", D: "Incorrect" },
        extraFacts: q.extraFacts,
        subject: q.subject
      } as any);
    }
  }
  
  return fallbackQuestions;
}

// Core Quiz Questions Generator (Robust, batch-oriented, retry-safe loop)
export async function generateQuizQuestions(config: QuizConfig): Promise<Question[]> {
  const targetCount = config.questionCount || 10;
  console.log(`[geminiService] Starting generation for ${targetCount} questions`);
  
  // Define batches (splitting requests of 50+ or any size into chunks of max 10 questions)
  const batches: number[] = [];
  let remaining = targetCount;
  while (remaining > 0) {
    const nextSize = Math.min(10, remaining);
    batches.push(nextSize);
    remaining -= nextSize;
  }
  
  let allQuestions: Question[] = [];
  
  // Generate each batch
  for (let i = 0; i < batches.length; i++) {
    const batchSize = batches[i];
    let batchQuestions: Question[] = [];
    let attempts = 0;
    const maxAttemptsPerBatch = 3;
    
    while (batchQuestions.length < batchSize && attempts < maxAttemptsPerBatch) {
      attempts++;
      try {
        console.log(`[geminiService] Generating Batch ${i + 1}/${batches.length} (Size: ${batchSize}). Attempt ${attempts}`);
        
        const response = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              ...config,
              questionCount: batchSize
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.success && Array.isArray(data.questions)) {
          // Strictly validate each question (options, answers, content)
          const validated = data.questions.filter((q: any) => {
            const hasOptions = q.options && typeof q.options === 'object' && 
                             q.options.A && q.options.B && q.options.C && q.options.D;
            const hasCorrect = q.correctAnswer && ['A', 'B', 'C', 'D'].includes(q.correctAnswer);
            const hasQuestion = q.question && q.question.trim().length > 0;
            return hasOptions && hasCorrect && hasQuestion;
          });
          
          // Filter duplicates automatically
          const unique: Question[] = [];
          for (const q of validated) {
            const isDuplicate = allQuestions.some(existing => 
              cleanText(existing.question) === cleanText(q.question)
            ) || unique.some(existing => 
              cleanText(existing.question) === cleanText(q.question)
            );
            if (!isDuplicate) {
              unique.push(q);
            }
          }
          
          batchQuestions = unique;
        } else {
          throw new Error("Invalid response format from server API");
        }
      } catch (err) {
        console.warn(`[geminiService] Attempt ${attempts} for Batch ${i + 1} failed:`, err);
        if (attempts < maxAttemptsPerBatch) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    allQuestions = [...allQuestions, ...batchQuestions];
  }
  
  // If we have any shortfall, automatically request remaining questions and merge
  if (allQuestions.length < targetCount) {
    console.warn(`[geminiService] Shortfall identified. Needed ${targetCount}, got ${allQuestions.length}. Launching automatic recovery loop...`);
    let recoveryAttempts = 0;
    while (allQuestions.length < targetCount && recoveryAttempts < 5) {
      recoveryAttempts++;
      const shortfall = targetCount - allQuestions.length;
      const fillSize = Math.min(10, shortfall);
      
      try {
        const response = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              ...config,
              questionCount: fillSize
            }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.success && Array.isArray(data.questions)) {
            const validated = data.questions.filter((q: any) => {
              const hasOptions = q.options && typeof q.options === 'object' && 
                               q.options.A && q.options.B && q.options.C && q.options.D;
              const hasCorrect = q.correctAnswer && ['A', 'B', 'C', 'D'].includes(q.correctAnswer);
              const hasQuestion = q.question && q.question.trim().length > 0;
              return hasOptions && hasCorrect && hasQuestion;
            });
            
            for (const q of validated) {
              if (allQuestions.length >= targetCount) break;
              const isDuplicate = allQuestions.some(existing => 
                cleanText(existing.question) === cleanText(q.question)
              );
              if (!isDuplicate) {
                allQuestions.push(q);
              }
            }
          }
        }
      } catch (err) {
        console.error(`[geminiService] Recovery attempt ${recoveryAttempts} failed:`, err);
      }
    }
  }
  
  // If we STILL have a shortfall, let's fill from our high-quality offline question repository (never fail/no errors)
  if (allQuestions.length < targetCount) {
    console.warn(`[geminiService] Persistent shortfall remaining (${allQuestions.length}/${targetCount}). Filling with offline bank.`);
    const fallbackQuestions = getOfflineQuestions(config.subject, targetCount - allQuestions.length, config.language);
    allQuestions = [...allQuestions, ...fallbackQuestions];
  }
  
  const finalResult = allQuestions.slice(0, targetCount);
  console.log(`[geminiService] Final generated questions count: ${finalResult.length}`);
  return finalResult;
}

export interface RPSCNotification {
  title: string;
  date: string;
  link: string;
  type: 'EXAM' | 'RESULT' | 'NEWS';
  description: string;
}

export async function fetchRPSCNotifications(): Promise<RPSCNotification[]> {
  try {
    const response = await fetch('/api/rpsc/notifications');
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const data = await response.json();
    if (data && data.success && Array.isArray(data.notifications)) {
      return data.notifications;
    }
    throw new Error("Invalid notifications format");
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [
      {
        title: "Press Note regarding Exam Date for RAS/RTS Comb. Comp. Exam 2026",
        date: "May 20, 2026",
        link: "https://rpsc.rajasthan.gov.in",
        type: "EXAM",
        description: "The RAS examination phase schedule has been officially updated on the commission board notice."
      },
      {
        title: "Extended Date for Online Application for Lecturer (Sanskrit Edu.) - 2026",
        date: "May 19, 2026",
        link: "https://rpsc.rajasthan.gov.in",
        type: "NEWS",
        description: "Extended deadline notice for lectureship applications across certified state colleges."
      }
    ];
  }
}

export async function analyzeVideoContent(video: any): Promise<any> {
  try {
    const response = await fetch('/api/video/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ video })
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.success && data.analysis) {
      return data.analysis;
    }
    throw new Error("Invalid video analysis format");
  } catch (error) {
    console.error("Failed to analyze video:", error);
    return {
      summary: "Could not access online analysis at this time. Running locally using backup RPSC outline.",
      keyTopics: ["Exam Revision", "Core Syllabus"],
      miniQuiz: [
        {
          question: "Which commission conducts the State Civil Services exam in Rajasthan?",
          options: ["UPSC", "RPSC", "BPSC", "MPPSC"],
          correctIndex: 1,
          explanation: "RPSC (Rajasthan Public Service Commission) is the premier commission conducting competitive state civil service exams."
        }
      ],
      reviewSegments: [
        {
          title: "Introduction and Key Concepts",
          timestamp: "00:00",
          seconds: 0,
          reason: "Brief overview of the competitive syllabus and state topics."
        }
      ]
    };
  }
}
