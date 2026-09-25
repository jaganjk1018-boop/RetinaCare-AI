// RetinaCare AI Clinical & Program Data Store

export const SAMPLE_CASES = [
  {
    id: "RC-2026-891",
    patientName: "Kamala Devi",
    age: 58,
    gender: "Female",
    phone: "+91 98452 11092",
    aadhaarHash: "a7f9...3b21",
    phcLocation: "PHC Heggadadevankote, Mysore District",
    diabetesYears: 12,
    hba1c: 9.4,
    fastingSugar: 210,
    eye: "OD (Right Eye)",
    capturedAt: "2026-09-25 09:42 IST",
    imageSrc: "/assets/moderate_dr_fundus.jpg",
    qaStatus: "pass",
    qaScore: {
      focus: 94.2,
      illumination: 91.5,
      fov: 96.0,
      glare: 1.2
    },
    icdrGrade: 2,
    icdrLabel: "Moderate NPDR",
    referable: true,
    urgency: "high", // high, critical, routine
    rawConfidence: 0.942,
    calibratedConfidence: 0.886, // Platt scaled
    temperature: 1.45,
    lesions: {
      microaneurysms: 18,
      hardExudates: 7,
      hemorrhages: 12,
      neovascularization: 0,
      macularEdemaRisk: "Moderate (Exudates within 1DD of FAZ)"
    },
    // Bounding boxes normalized [x%, y%, w%, h%]
    lesionBoxes: [
      { type: "exudate", x: 62, y: 22, w: 9, h: 8, label: "Hard Exudate cluster" },
      { type: "exudate", x: 74, y: 32, w: 8, h: 9, label: "Circinate Exudate" },
      { type: "exudate", x: 58, y: 64, w: 10, h: 9, label: "Inferior Exudate ring" },
      { type: "exudate", x: 70, y: 70, w: 8, h: 7, label: "Perimacular Exudate" },
      { type: "hemorrhage", x: 18, y: 20, w: 7, h: 8, label: "Dot-blot Hemorrhage" },
      { type: "hemorrhage", x: 19, y: 52, w: 8, h: 7, label: "Deep retinal Hemorrhage" },
      { type: "hemorrhage", x: 23, y: 73, w: 12, h: 10, label: "Inferior Flame Hemorrhage" },
      { type: "hemorrhage", x: 78, y: 54, w: 9, h: 8, label: "Temporal Hemorrhage" },
      { type: "ma", x: 41, y: 36, w: 3, h: 3, label: "Sub-pixel MA #1" },
      { type: "ma", x: 61, y: 49, w: 3, h: 3, label: "Sub-pixel MA #2" },
      { type: "ma", x: 72, y: 26, w: 3, h: 3, label: "Sub-pixel MA #3" },
      { type: "ma", x: 44, y: 62, w: 3, h: 3, label: "Sub-pixel MA #4" }
    ],
    gradcamCenter: { x: 66, y: 45, radius: 38 },
    reviewStatus: "pending",
    reviewer: null,
    reviewNotes: ""
  },
  {
    id: "RC-2026-892",
    patientName: "Rameshwar Patel",
    age: 64,
    gender: "Male",
    phone: "+91 94231 88412",
    aadhaarHash: "4c1e...90d2",
    phcLocation: "PHC Sirsi, Uttara Kannada",
    diabetesYears: 18,
    hba1c: 11.2,
    fastingSugar: 265,
    eye: "OS (Left Eye)",
    capturedAt: "2026-09-25 10:15 IST",
    imageSrc: "/assets/moderate_dr_fundus.jpg",
    qaStatus: "pass",
    qaScore: {
      focus: 89.8,
      illumination: 88.0,
      fov: 93.4,
      glare: 3.1
    },
    icdrGrade: 4,
    icdrLabel: "Proliferative DR (PDR)",
    referable: true,
    urgency: "critical",
    rawConfidence: 0.985,
    calibratedConfidence: 0.948,
    temperature: 1.45,
    lesions: {
      microaneurysms: 34,
      hardExudates: 15,
      hemorrhages: 28,
      neovascularization: 3,
      macularEdemaRisk: "High (Severe central macular thickening)"
    },
    lesionBoxes: [
      { type: "nv", x: 25, y: 46, w: 12, h: 14, label: "Neovascularization at Disc (NVD)" },
      { type: "hemorrhage", x: 23, y: 70, w: 15, h: 12, label: "Preretinal Hemorrhage" },
      { type: "exudate", x: 65, y: 30, w: 12, h: 12, label: "Dense Lipid Plaque" },
      { type: "ma", x: 50, y: 40, w: 4, h: 4, label: "MA cluster" }
    ],
    gradcamCenter: { x: 30, y: 48, radius: 42 },
    reviewStatus: "pending",
    reviewer: null,
    reviewNotes: ""
  },
  {
    id: "RC-2026-893",
    patientName: "Ananya Sundaram",
    age: 46,
    gender: "Female",
    phone: "+91 97890 44102",
    aadhaarHash: "8b2a...e71c",
    phcLocation: "PHC Chamarajanagar",
    diabetesYears: 4,
    hba1c: 6.8,
    fastingSugar: 135,
    eye: "OD (Right Eye)",
    capturedAt: "2026-09-25 11:02 IST",
    imageSrc: "/assets/normal_fundus.jpg",
    qaStatus: "pass",
    qaScore: {
      focus: 98.1,
      illumination: 96.5,
      fov: 99.0,
      glare: 0.4
    },
    icdrGrade: 0,
    icdrLabel: "No Apparent DR",
    referable: false,
    urgency: "routine",
    rawConfidence: 0.991,
    calibratedConfidence: 0.975,
    temperature: 1.45,
    lesions: {
      microaneurysms: 0,
      hardExudates: 0,
      hemorrhages: 0,
      neovascularization: 0,
      macularEdemaRisk: "None"
    },
    lesionBoxes: [],
    gradcamCenter: { x: 50, y: 50, radius: 10 },
    reviewStatus: "pending",
    reviewer: null,
    reviewNotes: ""
  },
  {
    id: "RC-2026-894",
    patientName: "Basavaraj Gowda",
    age: 52,
    gender: "Male",
    phone: "+91 94801 32984",
    aadhaarHash: "1e55...d901",
    phcLocation: "PHC Bagalkot North",
    diabetesYears: 8,
    hba1c: 8.5,
    fastingSugar: 182,
    eye: "OS (Left Eye)",
    capturedAt: "2026-09-25 11:30 IST",
    imageSrc: "/assets/poor_quality_fundus.jpg",
    qaStatus: "rejected",
    qaScore: {
      focus: 54.0, // Low focus
      illumination: 42.0,
      fov: 78.0,
      glare: 28.4 // High glare!
    },
    icdrGrade: null,
    icdrLabel: "Unusable - Glare/Blur",
    referable: false,
    urgency: "recapture",
    rawConfidence: 0.0,
    calibratedConfidence: 0.0,
    temperature: 1.45,
    lesions: {
      microaneurysms: 0,
      hardExudates: 0,
      hemorrhages: 0,
      neovascularization: 0,
      macularEdemaRisk: "Indeterminate due to glare"
    },
    lesionBoxes: [],
    gradcamCenter: { x: 50, y: 50, radius: 0 },
    reviewStatus: "rejected_at_edge",
    qaGuidance: "Severe corneal reflection glare detected in quadrant 2. Angle illumination source 15° laterally and shield ambient sunlight from the PHC window.",
    reviewer: null,
    reviewNotes: ""
  }
];

// Multilingual translations for "Explain Like I'm the Patient"
export const PATIENT_EXPLANATIONS = {
  en: {
    language: "English",
    title: "Your Retina Screening Report Summary",
    greeting: "Dear patient,",
    summaryGrade0: "Great news! Your retina check shows no damage from diabetes right now. Your eye blood vessels are healthy.",
    summaryReferable: "We noticed small signs that diabetes has affected the tiny blood vessels in the back of your eye (retina). This is common and highly treatable if cared for early.",
    actionTitle: "Recommended Next Steps:",
    actionStep1: "Visit the District Hospital Eye Specialist (Ophthalmologist) within 2 to 4 weeks.",
    actionStep2: "Continue taking your prescribed diabetes medications and monitor blood sugar daily.",
    actionStep3: "Bring this printed referral slip with you to the hospital to receive priority Ayushman Bharat consultation.",
    note: "Early treatment prevents vision loss. 90% of severe diabetes-related vision problems can be stopped with timely care."
  },
  hi: {
    language: "हिन्दी (Hindi)",
    title: "आपकी आँख की रेटिना जाँच रिपोर्ट का सारांश",
    greeting: "प्रिय मरीज़,",
    summaryGrade0: "अच्छी खबर! आपकी आँखों के पर्दे (रेटिना) में शुगर (डायबिटीज़) से कोई नुकसान नहीं पाया गया है। आपकी रक्त नलिकाएं पूरी तरह स्वस्थ हैं।",
    summaryReferable: "जाँच में पाया गया है कि डायबिटीज़ के कारण आपकी आँख के पर्दे की नसों में हल्का बदलाव आया है। समय पर इलाज कराने से इसे पूरी तरह ठीक रखा जा सकता है।",
    actionTitle: "ज़रूरी सलाह और अगले कदम:",
    actionStep1: "अगले 2 से 4 सप्ताह के भीतर ज़िला अस्पताल के नेत्र विशेषज्ञ (आई डॉक्टर) से परामर्श लें।",
    actionStep2: "अपनी शुगर की दवाइयाँ नियमित रूप से लेते रहें और खान-पान का ध्यान रखें।",
    actionStep3: "इस पर्ची को अपने साथ ज़िला अस्पताल ले जाएँ, जहाँ आयुष्मान भारत के तहत आपको प्राथमिकता से देखा जाएगा।",
    note: "समय पर जाँच और इलाज से आँखों की रोशनी को 90% तक सुरक्षित रखा जा सकता है।"
  },
  ta: {
    language: "தமிழ் (Tamil)",
    title: "உங்கள் கண் விழித்திரை பரிசோதனை அறிக்கை",
    greeting: "அன்புள்ள நோயாளி,",
    summaryGrade0: "நற்செய்தி! சர்க்கரை நோயினால் உங்கள் கண் விழித்திரையில் எந்தப் பாதிப்பும் ஏற்படவில்லை. உங்கள் நரம்புகள் ஆரோக்கியமாக உள்ளன.",
    summaryReferable: "சர்க்கரை நோய் காரணமாக உங்கள் கண் விழித்திரையின் நுண் இரத்த நாளங்களில் சில மாற்றங்கள் ஏற்பட்டுள்ளன. ஆரம்பத்திலேயே கவனித்தால் பார்வையை முழுமையாக பாதுகாக்கலாம்.",
    actionTitle: "அடுத்த கட்ட நடவடிக்கைகள்:",
    actionStep1: "அடுத்த 2 முதல் 4 வாரங்களுக்குள் மாவட்ட கண் மருத்துவரிடம் ஆலோசனை பெறவும்.",
    actionStep2: "சர்க்கரை நோய்க்கான மாத்திரைகளை தவறாமல் உட்கொண்டு இரத்த சர்க்கரை அளவைக் கட்டுப்படுத்தவும்.",
    actionStep3: "இந்த பரிந்துரைச் சீட்டை மருத்துவமனைக்கு எடுத்துச் செல்லவும்.",
    note: "ஆரம்பகால பரிசோதனை மூலம் 90% பார்வை இழப்பை தடுத்து நிறுத்த முடியும்."
  },
  te: {
    language: "తెలుగు (Telugu)",
    title: "మీ కంటి రెటీనా స్క్రీనింగ్ నివేదిక సారాంశం",
    greeting: "ప్రియమైన రోగికి,",
    summaryGrade0: "శుభవార్త! చక్కెర వ్యాధి వలన మీ కంటి రెటీనాకు ఎలాంటి నష్టం జరగలేదు. మీ రక్తనాళాలు ఆరోగ్యంగా ఉన్నాయి.",
    summaryReferable: "డయాబెటిస్ కారణంగా మీ కంటి నరాలలో చిన్న మార్పులు కనిపించాయి. సకాలంలో చికిత్స తీసుకుంటే మీ కంటి చూపును సురక్షితంగా కాపాడుకోవచ్చు.",
    actionTitle: "సూచించిన తదుపరి చర్యలు:",
    actionStep1: "రాబోయే 2 నుండి 4 వారాలలోపు జిల్లా ఆసుపత్రిలోని కంటి వైద్యుడిని సంప్రదించండి.",
    actionStep2: "మీ మధుమేహం మందులను రోజూ సమయానికి వేసుకోండి.",
    actionStep3: "ఆయుష్మాన్ భారత్ ప్రాధాన్యతా పరిశీలన కోసం ఈ రిఫరల్ కాగితాన్ని వెంట తీసుకెళ్లండి.",
    note: "ముందస్తు చికిత్సతో 90% కంటి చూపు సమస్యలను పూర్తిగా నివారించవచ్చు."
  },
  bn: {
    language: "বাংলা (Bengali)",
    title: "আপনার চোখের রেটিনা পরীক্ষার সারসংক্ষেপ",
    greeting: "শ্রদ্ধেয় রোগী,",
    summaryGrade0: "খুশির খবর! ডায়াবেটিসজনিত কারণে আপনার চোখের রেটিনায় কোনো ক্ষতি হয়নি। রক্তনালীগুলি সম্পূর্ণ সুস্থ আছে।",
    summaryReferable: "পরীক্ষায় দেখা গেছে যে রক্তের শর্করার কারণে চোখের পেছনের সূক্ষ্ম রক্তনালীতে কিছু পরিবর্তন ঘটেছে। সময়মতো চিকিৎসা করালে চোখ ভালো থাকবে।",
    actionTitle: "জরুরি পরামর্শ ও পরবর্তী পদক্ষেপ:",
    actionStep1: "আগামী ২ থেকে ৪ সপ্তাহের মধ্যে জেলা হাসপাতালের চক্ষু বিশেষজ্ঞের সাথে দেখা করুন।",
    actionStep2: "নিয়মিত ডায়াবেটিসের ওষুধ সেবন করুন এবং শর্করার মাত্রা নিয়ন্ত্রণে রাখুন।",
    actionStep3: "হাসপাতালে বিনামূল্যে বা অগ্রাধিকার ভিত্তিক পরিষেবার জন্য এই রেফারেল কাগজটি সঙ্গে রাখুন।",
    note: "সময়মতো চিকিৎসা করালে ৯০% দৃষ্টিশক্তি হ্রাস প্রতিরোধ করা সম্ভব।"
  }
};

// Cryptographic hash-chained audit log blocks
export const INITIAL_AUDIT_LOGS = [
  {
    index: 1041,
    timestamp: "2026-09-25 09:42:18 IST",
    patientId: "RC-2026-891",
    actor: "Edge Worker: Asha Worker Sudha (PHC Heggadadevankote)",
    action: "IMAGE_CAPTURED_QA_PASS",
    details: "OD image passed edge QA (Focus: 94.2, Illum: 91.5). Encrypted blob queued to IndexedDB.",
    prevHash: "8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    selfHash: "c4f92d81a7b05e32189d2c4b81093f4e912a5c68b730192e4857d19a023b7e41"
  },
  {
    index: 1042,
    timestamp: "2026-09-25 09:42:24 IST",
    patientId: "RC-2026-891",
    actor: "MATLAB Production Server (Node #DL-042)",
    action: "AI_INFERENCE_COMPLETED",
    details: "ResNet-50 grading: Grade 2 (Mod NPDR). Platt-scaled confidence: 88.6%. Grad-CAM & 4-class lesion mask generated in 410ms.",
    prevHash: "c4f92d81a7b05e32189d2c4b81093f4e912a5c68b730192e4857d19a023b7e41",
    selfHash: "e10842a9b37c56910482da7f81b239048a1c8903e421098b671c504a912e734d"
  },
  {
    index: 1043,
    timestamp: "2026-09-25 10:15:30 IST",
    patientId: "RC-2026-892",
    actor: "Triage Engine (Redis Cluster)",
    action: "PRIORITY_ESCALATION",
    details: "Urgency escalated to CRITICAL: Case RC-2026-892 flagged as Proliferative DR with NVD. Moved to top of reviewer queue.",
    prevHash: "e10842a9b37c56910482da7f81b239048a1c8903e421098b671c504a912e734d",
    selfHash: "3f901824a7bc81029348e10293847561a0293847561029384756102938475610"
  },
  {
    index: 1044,
    timestamp: "2026-09-25 11:30:12 IST",
    patientId: "RC-2026-894",
    actor: "Edge Worker: ANM Kavitha (PHC Bagalkot)",
    action: "EDGE_QA_REJECT_GUIDED",
    details: "Glare artifact detected (28.4%). Image rejected at source. Recapture guidance delivered in 1.4s.",
    prevHash: "3f901824a7bc81029348e10293847561a0293847561029384756102938475610",
    selfHash: "7b102948c7e61a2938475610293847561a029384756102938475610293847561"
  }
];

// Benchmark validation matrix
export const BENCHMARK_METRICS = [
  {
    metric: "Sensitivity (Referable DR)",
    retinaCare: "92.4% (95% CI: 89.8 - 94.6)",
    plainResNet: "84.1% (95% CI: 80.2 - 87.5)",
    thresholding: "68.3% (95% CI: 63.5 - 72.8)",
    clinicalTarget: "≥ 90.0% (WHO/ICO Standard)",
    status: "PASS"
  },
  {
    metric: "Specificity (Non-Referable)",
    retinaCare: "88.7% (95% CI: 85.3 - 91.5)",
    plainResNet: "79.2% (95% CI: 75.1 - 83.0)",
    thresholding: "71.4% (95% CI: 66.8 - 75.6)",
    clinicalTarget: "≥ 85.0% (WHO/ICO Standard)",
    status: "PASS"
  },
  {
    metric: "Area Under Curve (AUC-ROC)",
    retinaCare: "0.961",
    plainResNet: "0.894",
    thresholding: "0.742",
    clinicalTarget: "≥ 0.900",
    status: "PASS"
  },
  {
    metric: "Expected Calibration Error (ECE)",
    retinaCare: "0.031 (Platt Scaled)",
    plainResNet: "0.142 (Raw Softmax)",
    thresholding: "N/A",
    clinicalTarget: "< 0.050",
    status: "PASS"
  },
  {
    metric: "Microaneurysm F1-Score (IDRiD)",
    retinaCare: "0.784 (Sub-pixel Matched)",
    plainResNet: "0.512",
    thresholding: "0.380",
    clinicalTarget: "≥ 0.700",
    status: "PASS"
  },
  {
    metric: "Clinician Verification Time",
    retinaCare: "21.4 seconds (Fusion Slider)",
    plainResNet: "85.0 seconds (Raw Image)",
    thresholding: "110.0 seconds",
    clinicalTarget: "< 30.0 seconds",
    status: "PASS"
  }
];
