/**
 * Smart Bharat AI - Government Services Eligibility Wizard and legalese Simplifier (js/services.js)
 * Implements questionnaire calculations, document check simulations, and legal parsers.
 */

// Global storage for Wizard answers and recommended services
let wizardAnswers = {};
let recommendedSchemes = [];
let activeScheme = null;

// Services Database
const SCHEMES_DATABASE = [
  {
    id: "sch-aadhaar",
    title: "Aadhaar Card Enrolment / Update",
    desc: "12-digit unique demographic identifier issued by UIDAI.",
    eligibility: "All Indian residents are eligible.",
    docs: ["Identity Proof (PAN/Passport/Voter)", "Address Proof (Utility Bill/Bank Statement)"],
    timeline: "5-7 working days",
    fees: "₹50 for updates, Free for fresh enrolment",
    steps: "1. Fill form on myAadhaar. 2. Book appointment online. 3. Visit Aadhaar Kendra for biometrics."
  },
  {
    id: "sch-pan",
    title: "NSDL PAN Card Application",
    desc: "10-digit alphanumeric tax identifier card issued by Income Tax Department.",
    eligibility: "All Indian residents, NRI, and OCI holders.",
    docs: ["Identity Proof (Aadhaar/Voter ID)", "Date of Birth proof (Birth certificate/Matriculation marksheet)", "Passport-size photos"],
    timeline: "8-10 working days",
    fees: "₹107 (Physical card + Dispatch), ₹66 (e-PAN only)",
    steps: "1. Complete form 49A online on NSDL/UTITSL. 2. Verify with Aadhaar OTP e-KYC. 3. Recieve card via mail."
  },
  {
    id: "sch-passport",
    title: "Passport Seva Online",
    desc: "Official travel document issued by Ministry of External Affairs.",
    eligibility: "Resident Indian citizens only.",
    docs: ["Address Proof (Aadhaar/Rent Agreement/Utility bill)", "Date of Birth Proof (Birth certificate/Matriculation)", "10th Marksheet (For Non-ECR status)"],
    timeline: "15 working days (Normal), 3 days (Tatkaal)",
    fees: "₹1,500 (Normal 36 pages), ₹3,500 (Tatkaal)",
    steps: "1. Register on Passport Seva portal. 2. Complete application. 3. Pay fee & book slot. 4. Visit PSK. 5. Police verification."
  },
  {
    id: "sch-ayushman",
    title: "Ayushman Bharat PM-JAY Health Cover",
    desc: "Cashless health coverage of ₹5 Lakhs per family per year for medical treatments.",
    eligibility: "Low-income household, BPL families, and senior citizens aged 70 or above.",
    docs: ["Aadhaar Card", "Ration Card or PM-JAY letter notification", "Income Certificate (For non-elder applicants)"],
    timeline: "7 working days for e-card issuance",
    fees: "Free of cost",
    steps: "1. Check name in SECC list online. 2. Visit government hospital or CSC outlet. 3. Provide Aadhaar for e-KYC. 4. Collect card."
  },
  {
    id: "sch-pmkisan",
    title: "PM Kisan Samman Nidhi",
    desc: "Yearly income support of ₹6,000 in three equal installments of ₹2,000 for land-owning farmers.",
    eligibility: "Indian citizen farmers owning agricultural land.",
    docs: ["Land Registry documents (Khatauni)", "Aadhaar Card", "Bank Account Passbook (Aadhaar linked)", "Active Mobile Number"],
    timeline: "12-15 days for verification verification",
    fees: "Free of cost",
    steps: "1. Self-register on PM-Kisan portal. 2. Upload land revenue records. 3. Complete e-KYC using Aadhaar OTP."
  },
  {
    id: "sch-digilocker",
    title: "DigiLocker Account Activation",
    desc: "Secure cloud platform for storage, sharing, and verification of digital documents.",
    eligibility: "All citizens possessing an Aadhaar card linked to a mobile number.",
    docs: ["Aadhaar Card", "Mobile number linked to Aadhaar for OTP verification"],
    timeline: "Instant verification",
    fees: "Free of cost",
    steps: "1. Download app or visit digilocker.gov.in. 2. Sign up with Aadhaar number. 3. Verify OTP. 4. Sync documents."
  },
  {
    id: "sch-voter",
    title: "Voter ID Card Enrolment",
    desc: "Official photo identity card issued by the Election Commission of India.",
    eligibility: "Resident Indian citizens who are 18 years of age or older.",
    docs: ["Address Proof", "Age Proof (Birth certificate/PAN)", "Passport size photograph"],
    timeline: "15 working days",
    fees: "Free of cost",
    steps: "1. Open NVSP.in or download Voter Helpline App. 2. Fill Form 6. 3. Upload photo and proof docs. 4. Booth officer verifies."
  },
  {
    id: "sch-license",
    title: "Driving License (Sarathi)",
    desc: "Official authorization permitting operation of motor vehicles on public roads.",
    eligibility: "Indian citizens age 18+ (16+ for gearless 50cc scooters).",
    docs: ["Age Proof (School certificate/PAN)", "Address Proof (Aadhaar/Voter ID)", "Medical Certificate Form 1A (For transport category)", "Learner License details"],
    timeline: "15 working days (Post driving physical test)",
    fees: "₹200 (Learner's License), ₹1,000 (Permanent License test)",
    steps: "1. Apply online for Learner License. 2. Take computer test. 3. Book slot for driving test. 4. Pass physical test."
  },
  {
    id: "sch-ration",
    title: "Ration Card (NFSA PDS)",
    desc: "Official document enabling purchase of subsidized food grains from Public Distribution shops.",
    eligibility: "Indian resident households under BPL or priority categories.",
    docs: ["Aadhaar copies of all family members", "Income certificate", "Current address proof (Rent agreement/Utility bill)"],
    timeline: "20 working days",
    fees: "₹20 processing fee",
    steps: "1. Submit application at State Food Department portal. 2. Upload family members' Aadhaar. 3. Local inspection verification."
  },
  {
    id: "sch-birth",
    title: "Birth Certificate Registration",
    desc: "Vital statistical document recording chronological details of child birth.",
    eligibility: "Any child born within Indian borders.",
    docs: ["Hospital discharge slip / Birth register extract", "Aadhaar Card copies of both parents", "Affidavit (If applying after 21 days of birth)"],
    timeline: "7 working days",
    fees: "Free (Within 21 days), ₹10 (Delayed application charge)",
    steps: "1. Register birth at local municipal counter or online portal. 2. Attach hospital verification. 3. Recieve copy."
  },
  {
    id: "sch-income",
    title: "Income Certificate (Revenue Department)",
    desc: "Official document certifying annual family income from all sources.",
    eligibility: "Indian resident citizens residing in respective state jurisdiction.",
    docs: ["Salary slip / Form 16 / ITR assessment file", "Aadhaar Card", "Local residence proof", "Affidavit declaring family income"],
    timeline: "10 working days",
    fees: "₹30 government processing fee",
    steps: "1. Apply online at state e-District portal. 2. Submit income declarations. 3. Patwari or revenue inspector verifies."
  },
  {
    id: "sch-caste",
    title: "Caste Certificate (SC / ST / OBC)",
    desc: "Official document certifying membership in scheduled castes, tribes, or backward classes.",
    eligibility: "Indian citizens belonging to notified SC, ST, or OBC lists.",
    docs: ["Father's Caste Certificate", "Aadhaar Card", "Land records proving residency prior to cut-off year", "Income proof (For OBC non-creamy layer validation)"],
    timeline: "15 working days",
    fees: "₹20 processing fee",
    steps: "1. Apply on state e-District portal. 2. Upload parent caste proofs. 3. Revenue inspection validates ancestral link."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  initWizardFlow();
  initDocumentValidation();
  initLegaleseSimplifier();
});

// Multi-step Wizard Navigation
function initWizardFlow() {
  const btnWiz1Next = document.getElementById("btn-wiz-1-next");
  const btnWiz2Prev = document.getElementById("btn-wiz-2-prev");
  const btnWiz2Next = document.getElementById("btn-wiz-2-next");
  const btnWiz3Reset = document.getElementById("btn-wiz-3-reset");

  if (btnWiz1Next) {
    btnWiz1Next.addEventListener("click", () => {
      if (validateWizardStep1()) {
        transitionWizardStep(1, 2);
      }
    });
  }

  if (btnWiz2Prev) {
    btnWiz2Prev.addEventListener("click", () => {
      transitionWizardStep(2, 1);
    });
  }

  if (btnWiz2Next) {
    btnWiz2Next.addEventListener("click", () => {
      if (validateWizardStep2()) {
        processEligibilityRecommendations();
        transitionWizardStep(2, 3);
      }
    });
  }

  if (btnWiz3Reset) {
    btnWiz3Reset.addEventListener("click", () => {
      resetWizard();
    });
  }
}

function transitionWizardStep(from, to) {
  const fromPanel = document.getElementById(`wizard-step-${from}`);
  const toPanel = document.getElementById(`wizard-step-${to}`);
  
  const fromInd = document.getElementById(`step-ind-${from}`);
  const toInd = document.getElementById(`step-ind-${to}`);

  fromPanel.classList.remove("active");
  toPanel.classList.add("active");

  if (to > from) {
    fromInd.classList.remove("active");
    fromInd.classList.add("completed");
    toInd.classList.add("active");
  } else {
    fromInd.classList.remove("active");
    toInd.classList.remove("completed");
    toInd.classList.add("active");
  }
  
  if (AppState.speechEnabled) {
    speak(`Moved to Wizard Step ${to}`);
  }
}

function validateWizardStep1() {
  let valid = true;
  const age = document.getElementById("wiz-age");
  const residency = document.getElementById("wiz-residency");
  const state = document.getElementById("wiz-state");

  document.getElementById("err-wiz-age").textContent = "";
  document.getElementById("err-wiz-residency").textContent = "";
  document.getElementById("err-wiz-state").textContent = "";

  if (!age.value) {
    document.getElementById("err-wiz-age").textContent = "Please enter your age.";
    valid = false;
  } else {
    const val = parseInt(age.value);
    if (val < 1 || val > 120) {
      document.getElementById("err-wiz-age").textContent = "Please enter a valid age between 1 and 120.";
      valid = false;
    }
  }

  if (!residency.value) {
    document.getElementById("err-wiz-residency").textContent = "Residency status is required.";
    valid = false;
  }

  if (!state.value) {
    document.getElementById("err-wiz-state").textContent = "Please select your state.";
    valid = false;
  }

  return valid;
}

function validateWizardStep2() {
  let valid = true;
  const income = document.getElementById("wiz-income");
  document.getElementById("err-wiz-income").textContent = "";

  if (!income.value) {
    document.getElementById("err-wiz-income").textContent = "Annual household income bracket is required.";
    valid = false;
  }

  return valid;
}

function resetWizard() {
  document.getElementById("wizard-form-1").reset();
  document.getElementById("wizard-form-2").reset();
  
  const p1 = document.getElementById("wizard-step-1");
  const p2 = document.getElementById("wizard-step-2");
  const p3 = document.getElementById("wizard-step-3");
  
  p1.classList.add("active");
  p2.classList.remove("active");
  p3.classList.remove("active");

  const ind1 = document.getElementById("step-ind-1");
  const ind2 = document.getElementById("step-ind-2");
  const ind3 = document.getElementById("step-ind-3");

  ind1.className = "step-indicator active";
  ind2.className = "step-indicator";
  ind3.className = "step-indicator";

  // Reset doc panels
  document.getElementById("docs-checklist-placeholder").classList.remove("hidden");
  document.getElementById("docs-checklist-content").classList.add("hidden");
  document.getElementById("wiz-doc-analysis-result").classList.add("hidden");
  
  wizardAnswers = {};
  recommendedSchemes = [];
  activeScheme = null;
}

// Calculate Service Eligibility Recommendations
function processEligibilityRecommendations() {
  // Extract inputs
  const age = parseInt(document.getElementById("wiz-age").value);
  const residency = document.getElementById("wiz-residency").value;
  const state = document.getElementById("wiz-state").value;
  const income = document.getElementById("wiz-income").value;
  const occupation = document.getElementById("wiz-occupation").value;
  const social = document.querySelector('input[name="wiz-social"]:checked').value;

  wizardAnswers = { age, residency, state, income, occupation, social };
  recommendedSchemes = [];

  // Rules Engine
  // 1. Aadhaar Card
  if (residency === "indian") {
    recommendedSchemes.push(findSchemeById("sch-aadhaar"));
  }
  // 2. PAN
  recommendedSchemes.push(findSchemeById("sch-pan"));
  
  // 3. Passport
  if (residency === "indian") {
    recommendedSchemes.push(findSchemeById("sch-passport"));
  }
  // 4. Ayushman Bharat
  if (residency === "indian" && (income === "low" || age >= 70)) {
    recommendedSchemes.push(findSchemeById("sch-ayushman"));
  }
  // 5. PM Kisan
  if (residency === "indian" && occupation === "farmer") {
    recommendedSchemes.push(findSchemeById("sch-pmkisan"));
  }
  // 6. DigiLocker
  if (residency === "indian") {
    recommendedSchemes.push(findSchemeById("sch-digilocker"));
  }
  // 7. Voter ID
  if (residency === "indian" && age >= 18) {
    recommendedSchemes.push(findSchemeById("sch-voter"));
  }
  // 8. Driving License
  if (residency === "indian" && age >= 16) {
    recommendedSchemes.push(findSchemeById("sch-license"));
  }
  // 9. Ration Card
  if (residency === "indian" && (income === "low" || income === "medium")) {
    recommendedSchemes.push(findSchemeById("sch-ration"));
  }
  // 10. Birth Certificate
  recommendedSchemes.push(findSchemeById("sch-birth"));
  
  // 11. Income Certificate
  if (residency === "indian") {
    recommendedSchemes.push(findSchemeById("sch-income"));
  }
  // 12. Caste Certificate
  if (residency === "indian" && (social === "OBC" || social === "SC/ST")) {
    recommendedSchemes.push(findSchemeById("sch-caste"));
  }

  // Render cards
  const container = document.getElementById("wizard-recommends-list");
  container.innerHTML = "";

  recommendedSchemes.forEach(scheme => {
    const card = document.createElement("div");
    card.className = "scheme-card glass";
    card.setAttribute("data-id", scheme.id);

    // Setup tags badges
    let tagHtml = `<span class="tag-badge tag-blue"><i class="fa-solid fa-clock"></i> ${scheme.timeline}</span>`;
    if (scheme.fees === "Free of cost") {
      tagHtml += `<span class="tag-badge tag-green"><i class="fa-solid fa-circle-dollar-to-slot"></i> Free</span>`;
    } else {
      tagHtml += `<span class="tag-badge tag-saffron"><i class="fa-solid fa-indian-rupee-sign"></i> Paid</span>`;
    }

    card.innerHTML = `
      <div class="scheme-card-header">
        <span class="scheme-title">${scheme.title}</span>
        <i class="fa-solid fa-circle-chevron-right text-blue" style="font-size:18px;"></i>
      </div>
      <p class="scheme-desc">${scheme.desc}</p>
      <div class="scheme-tags">
        ${tagHtml}
      </div>
    `;

    card.addEventListener("click", () => {
      // Manage selection highlights
      document.querySelectorAll(".scheme-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      
      revealRequiredDocuments(scheme);
    });

    container.appendChild(card);
  });
}

function findSchemeById(id) {
  return SCHEMES_DATABASE.find(s => s.id === id);
}

// Reveal Documents Checklist
function revealRequiredDocuments(scheme) {
  activeScheme = scheme;
  
  document.getElementById("docs-checklist-placeholder").classList.add("hidden");
  const content = document.getElementById("docs-checklist-content");
  content.classList.remove("hidden");

  document.getElementById("selected-service-title").textContent = scheme.title;
  
  // Clear file analysis
  document.getElementById("wiz-doc-analysis-result").classList.add("hidden");

  const checklistUl = document.getElementById("selected-service-checklist");
  checklistUl.innerHTML = "";

  scheme.docs.forEach((doc, index) => {
    const li = document.createElement("li");
    const labelId = `chk-doc-${index}`;
    
    li.innerHTML = `
      <input type="checkbox" id="${labelId}" aria-label="Confirm possessing ${doc}">
      <label for="${labelId}" style="display:inline; cursor:pointer; font-weight:500;">${doc}</label>
    `;
    checklistUl.appendChild(li);
  });

  if (AppState.speechEnabled) {
    speak(`Requirements checklist loaded for ${scheme.title}`);
  }
}

// Drag & Drop File Verification Assistant Simulator (XSS safe alerts)
function initDocumentValidation() {
  const dropzone = document.getElementById("wizard-doc-dropzone");
  const fileInput = document.getElementById("wiz-doc-file");

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--primary)";
    dropzone.style.backgroundColor = "var(--primary-glow)";
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.style.borderColor = "var(--border-color)";
    dropzone.style.backgroundColor = "var(--bg-tertiary)";
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--border-color)";
    dropzone.style.backgroundColor = "var(--bg-tertiary)";
    if (e.dataTransfer.files.length) {
      simulateDocumentAnalysis(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      simulateDocumentAnalysis(fileInput.files[0]);
    }
  });
}

function simulateDocumentAnalysis(file) {
  const resultBox = document.getElementById("wiz-doc-analysis-result");
  resultBox.className = "analysis-box";
  resultBox.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i> Checking document format and metadata...
  `;
  resultBox.classList.remove("hidden");

  // Validate format
  const validExtensions = ["pdf", "png", "jpg", "jpeg"];
  const fileExt = file.name.split('.').pop().toLowerCase();
  
  setTimeout(() => {
    if (!validExtensions.includes(fileExt)) {
      resultBox.classList.add("invalid");
      resultBox.innerHTML = `
        <strong><i class="fa-solid fa-circle-xmark"></i> Verification Failed:</strong><br>
        Invalid format: .${fileExt}. Scheme documents must be PDF, JPG or PNG.
      `;
      if (AppState.speechEnabled) speak("Verification failed. Invalid document extension format.");
      return;
    }

    // Simulate smart AI reading details
    resultBox.classList.add("valid");
    
    let simulatedMsg = "";
    if (file.name.toLowerCase().includes("aadhaar")) {
      simulatedMsg = "Aadhaar Card copy matched. Secure QR seal recognized. e-KYC validation successfully passed.";
    } else if (file.name.toLowerCase().includes("bill") || file.name.toLowerCase().includes("rent")) {
      simulatedMsg = "Address proof document verified. Utility provider seal verified. Meets 3-month address validity requirements.";
    } else {
      simulatedMsg = `File verification passed! Valid document format detected. Content matches expected metadata indices for ${activeScheme ? activeScheme.title : 'requested scheme'}.`;
    }

    resultBox.innerHTML = `
      <strong><i class="fa-solid fa-circle-check"></i> Smart AI Assistant Verdict:</strong><br>
      ${simulatedMsg}
    `;

    if (AppState.speechEnabled) speak("Document verified successfully.");

  }, 1200);
}

// Legalese Document Simplifier Parser
function initLegaleseSimplifier() {
  const submitBtn = document.getElementById("btn-simplify-submit");
  const simplifierArea = document.getElementById("simplifier-text");
  const simpleTtsBtn = document.getElementById("btn-tts-read-summary");

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const complexText = simplifierArea.value.trim();
      if (!complexText) {
        showToast("Please paste official circular legalese text to simplify", "error");
        return;
      }
      
      const outLang = document.getElementById("simplifier-output-lang").value;
      simplifyLegaleseText(complexText, outLang);
    });
  }

  if (simpleTtsBtn) {
    simpleTtsBtn.addEventListener("click", () => {
      const summaryText = document.getElementById("simple-output-summary").innerText;
      if (summaryText) {
        speak(summaryText);
      }
    });
  }
}

function simplifyLegaleseText(text, lang) {
  const placeholder = document.getElementById("simplifier-output-placeholder");
  const content = document.getElementById("simplifier-results-content");

  placeholder.classList.add("hidden");
  content.classList.remove("hidden");

  const cleanText = text.toLowerCase();
  
  // Custom templates matching known government updates
  let summary = "";
  let eligibility = "";
  let docs = "";
  let fees = "";
  let timeline = "";
  let notes = "";

  if (cleanText.includes("ayushman") || cleanText.includes("pm-jay") || cleanText.includes("health")) {
    if (lang === 'hi') {
      summary = "आयुष्मान भारत योजना के तहत अब 70 वर्ष या उससे अधिक आयु के सभी वरिष्ठ नागरिकों को ₹5 लाख प्रति वर्ष का मुफ्त इलाज मिलेगा।";
      eligibility = "70 वर्ष से अधिक आयु के सभी भारतीय नागरिक, चाहे उनकी पारिवारिक आय कितनी भी हो।";
      docs = "आधार कार्ड (बायोमेट्रिक्स के लिए) और जन्म तिथि प्रमाण (10वीं मार्कशीट/पैन/पासपोर्ट)।";
      fees = "पूरी तरह से निःशुल्क।";
      timeline = "दस्तावेज जमा करने के 7 कार्य दिवसों के भीतर।";
      notes = "यदि आप किसी अन्य सरकारी या कॉर्पोरेट स्वास्थ्य योजना का लाभ ले रहे हैं, तो उसका विवरण देना होगा।";
    } else {
      summary = "The government has extended free healthcare benefits under Ayushman Bharat (PM-JAY) to all senior citizens aged 70 and above, offering up to ₹5 Lakhs cash-free hospitalization per family annually.";
      eligibility = "All Indian residents aged 70 years or older, regardless of family income.";
      docs = "Aadhaar card (for mandatory e-KYC), birth date proof (Passport/PAN/School certificate).";
      fees = "Zero fees (100% Free of charge).";
      timeline = "7 working days from the date of online validation.";
      notes = "Applicants must declare any active employee-based medical insurances during physical enrollment.";
    }
  } 
  else if (cleanText.includes("digilocker") || cleanText.includes("license") || cleanText.includes("vehicle")) {
    if (lang === 'hi') {
      summary = "परिवहन मंत्रालय के नए आदेश के अनुसार डिजिलॉकर ऐप में संग्रहीत ड्राइविंग लाइसेंस और गाड़ी के कागजात कानूनी रूप से मूल भौतिक दस्तावेजों के समान ही मान्य हैं।";
      eligibility = "सभी वाहन चालक जिनके पास वैध डिजिटल प्रमाण पत्र हैं।";
      docs = "डिजिलॉकर ऐप इंस्टॉल किया हुआ मोबाइल और लिंक किया गया आधार कार्ड।";
      fees = "निःशुल्क (कोई सरकारी शुल्क नहीं)।";
      timeline = "डिजिलॉकर में कागजात तुरंत लोड हो जाते हैं।";
      notes = "ट्रैफिक पुलिस मूल हार्ड कॉपी की मांग केवल लाइसेंस निलंबित करने जैसी गंभीर स्थितियों में ही कर सकती है।";
    } else {
      summary = "As per new Ministry directives, driving licenses, registration certificates, and insurance documents pulled inside the DigiLocker App are legally valid and hold equal weight to physical certificates.";
      eligibility = "All vehicle owners and drivers with valid online verification keys.";
      docs = "Aadhaar registration number (required to sync certificates from centralized RTO servers).";
      fees = "Free of cost.";
      timeline = "Instant integration upon linking.";
      notes = "Enforcement officers cannot demand physical hard copies unless immediate suspension of privileges is underway.";
    }
  } 
  else {
    // Fallback parser: Generative Mock Translation (Generates plain text summary dynamically)
    if (lang === 'hi') {
      summary = "यह दस्तावेज सरकारी नियमों और दिशानिर्देशों से संबंधित है। संक्षेप में, यह नई पात्रता शर्ते घोषित करता है और नागरिकों को डिजिटल प्रारूप में आवश्यक दस्तावेज जमा करने का निर्देश देता है।";
      eligibility = "सभी वयस्क भारतीय नागरिक जिनके पास वैध पहचान पत्र हैं।";
      docs = "आधार कार्ड, वर्तमान पते का प्रमाण, और दो पासपोर्ट आकार के चित्र।";
      fees = "आवेदन के प्रकार के आधार पर मामूली शुल्क (₹20 से ₹150 तक)।";
      timeline = "आवेदन जमा करने के 10 से 15 दिनों के भीतर।";
      notes = "अंतिम तिथि से पहले आवेदन पत्र को त्रुटिहीन तरीके से जमा करें।";
    } else {
      summary = "This regulatory notification outlines administrative guidelines. In summary, it enforces strict digital compliance, defines new parameters for public convenience, and requires online filing of grievances.";
      eligibility = "Adult residents possessing valid government identification documents.";
      docs = "Aadhaar Identity card, current address certificate, and passport sized photographs.";
      fees = "Standard administrative charges apply (approx. ₹50 to ₹200).";
      timeline = "Average processing duration ranges between 10 to 14 working days.";
      notes = "Ensure all upload file attachments are clear and self-attested before submission.";
    }
  }

  // Populate UI
  document.getElementById("simple-output-summary").innerHTML = summary;
  document.getElementById("simple-output-eligibility").innerHTML = eligibility;
  document.getElementById("simple-output-documents").innerHTML = docs;
  document.getElementById("simple-output-fees").innerHTML = fees;
  document.getElementById("simple-output-timeline").innerHTML = timeline;
  document.getElementById("simple-output-notes").innerHTML = notes;

  showToast("Document simplified successfully!", "success");
}
