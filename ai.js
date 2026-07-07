/**
 * Smart Bharat AI - Dialog Engine (js/ai.js)
 * Implements intent matching, multi-lingual knowledge base, and responses.
 */

// Multilingual Knowledge Base
const KNOWLEDGE_BASE = {
  en: {
    greeting: "Namaste! I am your Smart Bharat AI companion. How can I assist you with Indian Government Services today?",
    no_match: "I'm sorry, I couldn't find details on that specific query. Please ask about Aadhaar, Passport, Ayushman Bharat, PM-Kisan, PAN Card, DigiLocker, or filing a civic complaint.",
    typing: "Smart Bharat AI is typing...",
    
    // Topics
    aadhaar: {
      title: "Aadhaar Card (UIDAI)",
      text: "Aadhaar is a 12-digit unique identity issued by UIDAI.<br><br>" +
            "<strong>Address Update:</strong> You can update your address online via the myAadhaar portal if you have a mobile number linked. Upload proof of address (utility bill, bank statement, rent agreement) and pay a ₹50 fee. Processing takes 5-7 days.<br>" +
            "<strong>Biometrics & Phone Link:</strong> Must be done physically at an Aadhaar Seva Kendra. Book an appointment online to avoid queues. Mobile update fee is ₹50; Biometrics update is ₹100."
    },
    pan: {
      title: "PAN Card (Permanent Account Number)",
      text: "PAN is a 10-digit alphanumeric identifier issued by the Income Tax Department.<br><br>" +
            "<strong>New Card:</strong> Apply online via NSDL or UTITSL portals. Fees are ₹107 for physical cards. Required documents: ID Proof (Aadhaar/Voter), Address Proof, and Date of Birth proof.<br>" +
            "<strong>Aadhaar Link:</strong> It is mandatory to link PAN with Aadhaar. You can check linking status online on the Income Tax e-filing portal."
    },
    passport: {
      title: "Passport Seva Online",
      text: "Passports are issued by the Ministry of External Affairs.<br><br>" +
            "<strong>Application Process:</strong> Register on the Passport Seva website, fill Form, pay ₹1,500 online booking fee, and schedule an appointment at your local PSK (Passport Seva Kendra).<br>" +
            "<strong>Required Documents:</strong> Proof of Address (Aadhaar, Utility bill), Proof of DOB (Birth certificate, PAN, Matriculation). Non-ECR status requires matriculation certificate verification.<br>" +
            "<strong>Verification:</strong> Police verification will follow after the physical PSK appointment."
    },
    digilocker: {
      title: "DigiLocker Digital Wallet",
      text: "DigiLocker is a secure cloud document wallet by Digital India.<br><br>" +
            "<strong>Legality:</strong> Issued documents inside DigiLocker are legally equivalent to physical originals under Rule 9A of the IT Rules.<br>" +
            "<strong>Usage:</strong> Sign in with Aadhaar to automatically pull verified certificates from issuers (Driving Licenses, Insurance, CBSE marks cards, Caste certificates). Free of cost."
    },
    ayushman: {
      title: "Ayushman Bharat (PM-JAY)",
      text: "Provides cashless medical cover of up to ₹5 Lakhs per family per year for secondary and tertiary care hospitalization.<br><br>" +
            "<strong>Eligibility:</strong> Families listed under SECC-2011 data, and all senior citizens aged 70+ (newly expanded).<br>" +
            "<strong>Documents Needed:</strong> Aadhaar Card, Ration Card, or PM-JAY letter. Enrolment is free at Government hospitals or CSC outlets."
    },
    pmkisan: {
      title: "PM-Kisan Samman Nidhi",
      text: "Income support scheme for landholding farmers providing ₹6,000 per year in three equal installments of ₹2,000 directly to bank accounts.<br><br>" +
            "<strong>Documents Required:</strong> Land ownership papers (Khatauni), Aadhaar Card, Bank account details, and Mobile number linked to Aadhaar.<br>" +
            "<strong>E-KYC:</strong> Periodic OTP-based or biometric e-KYC is mandatory to receive installments."
    },
    license: {
      title: "Driving License (RTO)",
      text: "Issued by State Road Transport Authorities via Sarathi portal.<br><br>" +
            "<strong>Learner License:</strong> Apply online on Sarathi, upload Aadhaar, pay ₹150-200 fee, and take the online computer test from home in most states.<br>" +
            "<strong>Permanent License:</strong> Apply after 30 days of Learner License issuance. Pay ₹1,000 driving test fee and book slot at the RTO to undergo the physical driving test."
    },
    voter: {
      title: "Voter ID (Election Commission)",
      text: "Voter ID cards are managed by the Election Commission of India (ECI).<br><br>" +
      "<strong>New Voter:</strong> Apply online via NVSP portal or Voter Helpline App by completing Form 6. Must be an Indian citizen and 18+ years old.<br>" +
      "<strong>Documents:</strong> Photo, Address Proof, Age proof."
    },
    ration: {
      title: "Ration Card (PDS)",
      text: "Issued by State Food & Civil Supplies departments.<br><br>" +
            "<strong>Types:</strong> AAY (Poorest), PHH (Priority households), NPHH (Non-priority).<br>" +
            "<strong>Details:</strong> Standard documents needed include Aadhaar card copies of all family members, income proof, and local address verification. Apply online at your state portal or visit local food inspector office."
    },
    complaint: {
      title: "Filing Civic Complaints",
      text: "You can file public issue complaints directly on our platform!<br><br>" +
            "1. Switch to the <strong>'Report Civic Issue'</strong> tab in the sidebar.<br>" +
            "2. Select the Department (PWD, Municipal, Water, Electricity) and type of issue.<br>" +
            "3. Fill details, pin the location on our grid map, upload a photo, and submit.<br>" +
            "4. Track live resolution progress in the <strong>'Complaint Tracker'</strong> tab using your generated ID."
    }
  },
  hi: {
    greeting: "नमस्ते! मैं आपका स्मार्ट भारत एआई सहायक हूँ। आज मैं भारतीय सरकारी सेवाओं के बारे में आपकी क्या मदद कर सकता हूँ?",
    no_match: "क्षमा करें, मुझे इस प्रश्न के बारे में जानकारी नहीं मिली। कृपया आधार, पासपोर्ट, आयुष्मान भारत, पीएम-किसान, पैन कार्ड, डिजिलॉकर, या शिकायत दर्ज करने के बारे में पूछें।",
    typing: "स्मार्ट भारत एआई टाइप कर रहा है...",
    
    aadhaar: {
      title: "आधार कार्ड (UIDAI)",
      text: "आधार यूआईडीएआई (UIDAI) द्वारा जारी 12 अंकों की विशिष्ट पहचान है।<br><br>" +
            "<strong>पता अपडेट:</strong> यदि आपका मोबाइल नंबर लिंक है, तो आप myAadhaar पोर्टल पर ऑनलाइन पता बदल सकते हैं। पता प्रमाण पत्र (बिजली बिल, बैंक स्टेटमेंट, रेंट एग्रीमेंट) अपलोड करें और ₹50 शुल्क भुगतान करें। समय: 5-7 कार्य दिवस।<br>" +
            "<strong>बायोमेट्रिक्स और फोन लिंक:</strong> इसके लिए आपको आधार सेवा केंद्र पर स्वयं जाना होगा। ऑनलाइन अपॉइंटमेंट बुक करें। मोबाइल नंबर अपडेट शुल्क ₹50 है, बायोमेट्रिक अपडेट ₹100 है।"
    },
    pan: {
      title: "पैन कार्ड (स्थायी खाता संख्या)",
      text: "पैन आयकर विभाग द्वारा जारी 10 अंकों का अल्फ़ान्यूमेरिक पहचान पत्र है।<br><br>" +
            "<strong>नया कार्ड:</strong> NSDL या UTITSL पोर्टल पर ऑनलाइन आवेदन करें। भौतिक कार्ड के लिए ₹107 शुल्क है। आवश्यक दस्तावेज: पहचान प्रमाण (आधार/वोटर आईडी), पता प्रमाण, और जन्म तिथि प्रमाण।<br>" +
            "<strong>आधार लिंक:</strong> पैन को आधार से जोड़ना अनिवार्य है। आप आयकर ई-फाइलिंग पोर्टल पर लिंक की स्थिति की जांच कर सकते हैं।"
    },
    passport: {
      title: "पासपोर्ट सेवा ऑनलाइन",
      text: "पासपोर्ट विदेश मंत्रालय द्वारा जारी किए जाते हैं।<br><br>" +
            "<strong>आवेदन प्रक्रिया:</strong> पासपोर्ट सेवा वेबसाइट पर पंजीकरण करें, फॉर्म भरें, ₹1,500 ऑनलाइन बुकिंग शुल्क का भुगतान करें और अपने नजदीकी पासपोर्ट सेवा केंद्र (PSK) पर अपॉइंटमेंट लें।<br>" +
            "<strong>आवश्यक दस्तावेज:</strong> पता प्रमाण (आधार, बिजली बिल), जन्म तिथि प्रमाण (जन्म प्रमाण पत्र, पैन, 10वीं की मार्कशीट)। गैर-ईसीआर (Non-ECR) श्रेणी के लिए 10वीं पास प्रमाणपत्र आवश्यक है।"
    },
    digilocker: {
      title: "डिजिलॉकर (DigiLocker)",
      text: "डिजिलॉकर डिजिटल इंडिया के तहत एक सुरक्षित क्लाउड दस्तावेज़ वॉलेट है।<br><br>" +
            "<strong>कानूनी मान्यता:</strong> आईटी नियम के नियम 9ए के तहत डिजिलॉकर में उपलब्ध डिजिटल दस्तावेज मूल भौतिक दस्तावेजों के समान ही मान्य हैं।<br>" +
            "<strong>उपयोग:</strong> आधार से लॉग-इन करें और ड्राइविंग लाइसेंस, वाहन बीमा, मार्कशीट, जाति प्रमाण पत्र सीधे जारीकर्ताओं से प्राप्त करें। यह पूरी तरह से निःशुल्क है।"
    },
    ayushman: {
      title: "आयुष्मान भारत (PM-JAY)",
      text: "यह योजना प्रति वर्ष प्रति परिवार ₹5 लाख तक का कैशलेस स्वास्थ्य बीमा प्रदान करती है।<br><br>" +
            "<strong>पात्रता:</strong> SECC-2011 डेटा सूची में शामिल परिवार और 70 वर्ष से अधिक आयु के सभी वरिष्ठ नागरिक।<br>" +
            "<strong>आवश्यक दस्तावेज:</strong> आधार कार्ड, राशन कार्ड, या पीएम-जय पत्र। नामांकन सरकारी अस्पतालों या सीएससी केंद्रों पर निःशुल्क है।"
    },
    pmkisan: {
      title: "पीएम-किसान सम्मान निधि",
      text: "भूमिधारक किसानों के लिए प्रति वर्ष ₹6,000 की वित्तीय सहायता, जो ₹2,000 की तीन समान किश्तों में सीधे बैंक खातों में दी जाती है।<br><br>" +
            "<strong>दस्तावेज:</strong> भूमि के कागज (खतौनी), आधार कार्ड, बैंक खाता विवरण और आधार से लिंक मोबाइल नंबर।<br>" +
            "<strong>ई-केवाईसी:</strong> किश्तें प्राप्त करने के लिए ओटीपी-आधारित या बायोमेट्रिक ई-केवाईसी अनिवार्य है।"
    },
    license: {
      title: "ड्राइविंग लाइसेंस (RTO)",
      text: "सारथी पोर्टल के माध्यम से राज्य परिवहन प्राधिकरणों द्वारा जारी किया जाता है।<br><br>" +
            "<strong>लर्नर लाइसेंस:</strong> सारथी पोर्टल पर ऑनलाइन आवेदन करें, आधार जमा करें, ₹150-200 शुल्क दें और घर बैठे ऑनलाइन परीक्षा दें।<br>" +
            "<strong>स्थायी लाइसेंस:</strong> लर्नर लाइसेंस के 30 दिनों के बाद आवेदन करें। ₹1,000 टेस्ट शुल्क देकर आरटीओ (RTO) में वाहन चलाने की परीक्षा दें।"
    },
    voter: {
      title: "वोटर आईडी (मतदाता पहचान पत्र)",
      text: "मतदाता पहचान पत्र भारत निर्वाचन आयोग (ECI) द्वारा प्रबंधित किए जाते हैं।<br><br>" +
            "<strong>नया पंजीकरण:</strong> NVSP पोर्टल या वोटर हेल्पलाइन ऐप पर ऑनलाइन फॉर्म 6 भरें। इसके लिए भारतीय नागरिक होना और आयु 18+ वर्ष होना आवश्यक है।<br>" +
            "<strong>दस्तावेज:</strong> फोटो, पता प्रमाण, आयु प्रमाण।"
    },
    ration: {
      title: "राशन कार्ड (PDS)",
      text: "राज्य खाद्य एवं नागरिक आपूर्ति विभागों द्वारा जारी किया जाता है।<br><br>" +
            "<strong>दस्तावेज:</strong> परिवार के सभी सदस्यों के आधार कार्ड की प्रतियां, आय प्रमाण पत्र और पते का प्रमाण। राज्य खाद्य सुरक्षा पोर्टल पर ऑनलाइन आवेदन करें।"
    },
    complaint: {
      title: "शिकायत कैसे दर्ज करें?",
      text: "आप इस पोर्टल पर नागरिक समस्याओं की शिकायत दर्ज कर सकते हैं!<br><br>" +
            "1. साइडबार में <strong>'Report Civic Issue'</strong> टैब पर जाएं।<br>" +
            "2. संबंधित विभाग (नगर निगम, पीडब्ल्यूडी, जल विभाग, बिजली विभाग) और शिकायत का प्रकार चुनें।<br>" +
            "3. विवरण भरें, मैप ग्रिड पर समस्या वाली जगह पर क्लिक करें, फोटो डालें और सबमिट करें।<br>" +
            "4. जनरेट की गई आईडी से <strong>'Complaint Tracker'</strong> टैब में लाइव स्थिति देखें।"
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("chat-btn-send");
  const voiceBtn = document.getElementById("chat-btn-voice");
  const chatInput = document.getElementById("chat-input");
  const chatLang = document.getElementById("chat-lang");
  
  if (sendBtn) {
    sendBtn.addEventListener("click", () => handleUserMessage());
  }
  
  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleUserMessage();
      }
    });
  }

  if (chatLang) {
    chatLang.addEventListener("change", () => {
      const selectedLang = chatLang.value;
      clearChat();
      
      // Inject new system greeting based on language
      injectBotMessage(KNOWLEDGE_BASE[selectedLang].greeting);
      
      // Update suggestion chips
      updateSuggestionChips(selectedLang);
    });
  }

  // Suggestion chips listeners
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip && chip.closest("#suggestion-chips")) {
      const query = chip.getAttribute("data-query");
      if (chatInput) {
        chatInput.value = query;
        handleUserMessage();
      }
    }
  });

  // Voice Speech Recognition Simulation (Accessibility Support)
  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      toggleVoiceInput();
    });
  }
});

function clearChat() {
  const chatBox = document.getElementById("chat-messages");
  chatBox.innerHTML = "";
}

function updateSuggestionChips(lang) {
  const chipsContainer = document.getElementById("suggestion-chips");
  if (!chipsContainer) return;
  
  const chipsData = {
    en: [
      { text: "Aadhaar Address Update", query: "How to update Aadhaar Address?" },
      { text: "Ayushman Bharat Eligibility", query: "Ayushman Bharat card eligibility check" },
      { text: "Fresh Passport Checklist", query: "Documents needed for fresh Passport?" },
      { text: "File a Complaint", query: "How to file a civic complaint?" }
    ],
    hi: [
      { text: "आधार पता बदलना", query: "आधार में पता कैसे बदलें?" },
      { text: "आयुष्मान भारत पात्रता", query: "आयुष्मान भारत कार्ड पात्रता जांच" },
      { text: "पासपोर्ट आवश्यक दस्तावेज", query: "नया पासपोर्ट बनाने के लिए क्या चाहिए?" },
      { text: "शिकायत दर्ज करें", query: "कम्पलेंट कैसे दर्ज करें?" }
    ]
  };

  chipsContainer.innerHTML = "";
  chipsData[lang].forEach(item => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.setAttribute("data-query", item.query);
    btn.textContent = item.text;
    chipsContainer.appendChild(btn);
  });
}

function handleUserMessage() {
  const chatInput = document.getElementById("chat-input");
  const queryText = chatInput.value.trim();
  if (!queryText) return;

  // Clear Input
  chatInput.value = "";

  // Inject User bubble
  injectUserMessage(queryText);

  // Show typing loader
  const chatLang = document.getElementById("chat-lang").value;
  const loaderId = injectTypingIndicator(KNOWLEDGE_BASE[chatLang].typing);

  // Simulate AI latency
  setTimeout(() => {
    removeTypingIndicator(loaderId);
    const aiResponse = matchResponse(queryText, chatLang);
    injectBotMessage(aiResponse);
  }, 1000);
}

function injectUserMessage(text) {
  const chatBox = document.getElementById("chat-messages");
  const msgDiv = document.createElement("div");
  msgDiv.className = "message user";
  
  // Prevent XSS
  const safeText = escapeHTML(text);
  
  msgDiv.innerHTML = `
    <div class="message-content">${safeText}</div>
    <span class="message-time">${getCurrentTimeStr()}</span>
  `;
  chatBox.appendChild(msgDiv);
  scrollToBottom(chatBox);
}

function injectBotMessage(htmlContent) {
  const chatBox = document.getElementById("chat-messages");
  const msgDiv = document.createElement("div");
  msgDiv.className = "message bot";
  
  msgDiv.innerHTML = `
    <div class="message-content">${htmlContent}</div>
    <span class="message-time">${getCurrentTimeStr()}</span>
  `;
  chatBox.appendChild(msgDiv);
  scrollToBottom(chatBox);
  
  // If Accessibility Screen Reader is active, read the text
  if (AppState.speechEnabled) {
    // Strip HTML for speech
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    speak(tempDiv.innerText || tempDiv.textContent);
  }
}

function injectTypingIndicator(text) {
  const chatBox = document.getElementById("chat-messages");
  const msgDiv = document.createElement("div");
  const uniqueId = "typing-" + Date.now();
  msgDiv.id = uniqueId;
  msgDiv.className = "message bot";
  
  msgDiv.innerHTML = `
    <div class="message-content">
      <div class="typing-indicator" aria-label="${text}">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  chatBox.appendChild(msgDiv);
  scrollToBottom(chatBox);
  return uniqueId;
}

function removeTypingIndicator(id) {
  const indicator = document.getElementById(id);
  if (indicator) {
    indicator.remove();
  }
}

function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight;
}

function getCurrentTimeStr() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
}

// Keyword Match and Response Generator
function matchResponse(text, lang) {
  const cleanText = text.toLowerCase().trim();
  const db = KNOWLEDGE_BASE[lang];

  // Helper matching lists
  const keywords = {
    aadhaar: ["aadhaar", "adhar", "uidai", "आधार", "यूआईडीएआई"],
    pan: ["pan", "pancard", "पैन"],
    passport: ["passport", "pass port", "पासपोर्ट"],
    digilocker: ["digilocker", "digital locker", "डिजिलॉकर", "डिजी लॉकर"],
    ayushman: ["ayushman", "pmjay", "pm-jay", "health card", "आयुष्मान", "स्वास्थ्य कार्ड"],
    pmkisan: ["pmkisan", "pm kisan", "farmer", "किसान"],
    license: ["license", "driving", "licence", "sarathi", "लाइसेंस", "ड्राइविंग"],
    voter: ["voter", "voting", "nvsp", "चुनाव", "मतदाता"],
    ration: ["ration", "pds", "राशन", "कोटदार"],
    complaint: ["complaint", "issue", "report", "road", "pothole", "garbage", "शिकायत", "कम्पलेंट", "सड़क"]
  };

  for (const [key, list] of Object.entries(keywords)) {
    if (list.some(word => cleanText.includes(word))) {
      const topicObj = db[key];
      return `<strong>${topicObj.title}</strong><br><br>${topicObj.text}`;
    }
  }

  return db.no_match;
}

// Speech Recognition simulation for Voice Input button (Alt accessibility feature)
let recognitionInstance = null;
function toggleVoiceInput() {
  const voiceBtn = document.getElementById("chat-btn-voice");
  const chatInput = document.getElementById("chat-input");
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    showToast("Speech Recognition not supported on this browser.", "error");
    return;
  }

  if (voiceBtn.classList.contains("recording")) {
    // Stop recording
    if (recognitionInstance) {
      recognitionInstance.stop();
    }
    voiceBtn.classList.remove("recording");
    return;
  }

  const selectedLang = document.getElementById("chat-lang").value;
  recognitionInstance = new SpeechRecognition();
  recognitionInstance.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
  recognitionInstance.interimResults = false;
  recognitionInstance.maxAlternatives = 1;

  recognitionInstance.onstart = () => {
    voiceBtn.classList.add("recording");
    showToast(selectedLang === 'hi' ? "बोलिए..." : "Listening...", "info");
    stopSpeaking(); // Shut down TTS while listening
  };

  recognitionInstance.onresult = (e) => {
    const speechResult = e.results[0][0].transcript;
    if (chatInput) {
      chatInput.value = speechResult;
      showToast("Speech recognized: " + speechResult, "success");
      // Optionally submit automatically
      setTimeout(() => {
        handleUserMessage();
      }, 500);
    }
  };

  recognitionInstance.onerror = (e) => {
    console.error("Speech Recognition Error", e);
    voiceBtn.classList.remove("recording");
    showToast("Voice input error: " + e.error, "error");
  };

  recognitionInstance.onend = () => {
    voiceBtn.classList.remove("recording");
  };

  recognitionInstance.start();
}
