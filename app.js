/**
 * Smart Bharat AI - Core Application Shell Logic
 * Handles Routing, Accessibility, Theme, LocalStorage Initialization, and Toasts.
 */

// Global State
const AppState = {
  activeTab: 'dashboard',
  theme: 'light', // light, dark
  contrast: 'normal', // normal, high
  fontScale: 1.0, // 0.8 to 1.6
  dyslexiaFont: false,
  speechEnabled: false,
  speechRate: 1.0,
  speechSynth: window.speechSynthesis,
  speechUtterance: null
};

// Seeding Initial Mock Data in LocalStorage
const INITIAL_COMPLAINTS = [
  {
    id: "COMP-2026-001",
    department: "Municipal Corporation",
    type: "Garbage Collection",
    title: "Overflowing commercial garbage bins near metro gate 2",
    description: "The garbage containers at Metro Gate 2 have been overflowing for 3 days. It is causing severe odor issues and blocking the pedestrian pathway.",
    photo: null,
    coords: "120,80",
    status: "Resolved",
    date: "2026-07-04",
    history: [
      { status: "Submitted", date: "2026-07-04 09:30 AM", notes: "Complaint received on portal." },
      { status: "Assigned", date: "2026-07-04 11:15 AM", notes: "Assigned to Ward Inspector Rajesh Kumar." },
      { status: "In Progress", date: "2026-07-04 02:00 PM", notes: "Sanitation truck deployed to clear trash bins." },
      { status: "Resolved", date: "2026-07-05 10:00 AM", notes: "Waste cleared. Bins disinfected. Photo verification attached in internal logs." }
    ]
  },
  {
    id: "COMP-2026-002",
    department: "PWD",
    type: "Road Damage",
    title: "Large pothole after flyover exit ramp",
    description: "A hazardous pothole has developed right at the descent of the Sector 12 flyover. Extremely dangerous for two-wheelers at night.",
    photo: null,
    coords: "340,150",
    status: "In Progress",
    date: "2026-07-05",
    history: [
      { status: "Submitted", date: "2026-07-05 08:45 AM", notes: "Complaint received." },
      { status: "Assigned", date: "2026-07-05 10:00 AM", notes: "Assigned to PWD Sub-division road division." },
      { status: "In Progress", date: "2026-07-06 09:00 AM", notes: "Work crew deployed with bituminous cold-mix. Filling in progress." }
    ]
  },
  {
    id: "COMP-2026-003",
    department: "Water Department",
    type: "Water Leakage",
    title: "Drinking water pipe rupture near civic park",
    description: "Substantial drinking water volume is leaking from the main line rupture near the community park gate, flooding the adjacent road.",
    photo: null,
    coords: "210,260",
    status: "Assigned",
    date: "2026-07-06",
    history: [
      { status: "Submitted", date: "2026-07-06 11:00 AM", notes: "Complaint registered." },
      { status: "Assigned", date: "2026-07-06 01:30 PM", notes: "Assigned to Jal Board Engineer Team." }
    ]
  },
  {
    id: "COMP-2026-004",
    department: "Electricity Board",
    type: "Street Light",
    title: "Entire row of street lights dark in Block C lane",
    description: "Street lights from pole C1 to C12 are completely inactive for the last 5 days. Raises safety concerns for evening walkers.",
    photo: null,
    coords: "480,180",
    status: "Submitted",
    date: "2026-07-07",
    history: [
      { status: "Submitted", date: "2026-07-07 07:15 AM", notes: "Complaint registered online." }
    ]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  initLocalStorage();
  initRouter();
  initTheme();
  initAccessibility();
  initHotkeys();
  
  // Visual page load transition complete
  showToast("Welcome to Smart Bharat AI Portal", "success");
});

// Initialize LocalStorage with mock data if empty
function initLocalStorage() {
  if (!localStorage.getItem("sb_complaints")) {
    localStorage.setItem("sb_complaints", JSON.stringify(INITIAL_COMPLAINTS));
  }
}

// Router - Handle views
function initRouter() {
  const navItems = document.querySelectorAll(".nav-item");
  const tabPanels = document.querySelectorAll(".tab-panel");

  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  // Watch links within announcements to transition to simplifier
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".simplify-trigger");
    if (trigger) {
      e.preventDefault();
      const type = trigger.getAttribute("data-simplifier-type");
      switchTab("document-simplifier");
      
      // Auto fill simplifier text
      setTimeout(() => {
        const simplifierArea = document.getElementById("simplifier-text");
        if (simplifierArea) {
          if (type === "ayushman") {
            simplifierArea.value = `GOVERNMENT CIRCULAR NO. AB-PMJAY-2026-SENIOR-CITIZENS: Eligibility Extension and Enrolment Protocols for Elder Citizens. Under section 14(a)(iii) of the National Health Protection Framework, hereby read with the directives of the Ministry of Health and Family Welfare, all senior citizens residing in Indian territories who have attained the chronological age of 70 (seventy) years or above, irrespective of household income bracket, are declared eligible to receive cashless, secondary and tertiary medical treatments up to an upper fiscal ceiling of INR 5,00,000 (Five Lakh Rupees) per family per annum. Applicants must furnish valid Aadhaar biometric credentials alongside age proof (such as matriculation certificates, birth registration indices, or passport records) for initial e-KYC. Processing charges stand completely waived at all government-notified CSC outlets. Timelines for authorization processing are capped at 7 working days from physical or electronic upload verification. Note: Dual benefits under state-level schemes or employer-sponsored medical allowances must be declared upon submission.`;
          } else if (type === "digilocker") {
            simplifierArea.value = `NOTIFICATION REGULATORY AMENDMENT TO MOTOR VEHICLES ACT, SECTION 139 (RULES OF ROAD CLARIFICATION). In conformity with electronic standards under the Information Technology Act 2000, Section 4, the Ministry of Road Transport and Highways notifies that all enforcement officers, including traffic police inspectors and transport authority checkers, are legally bound to accept digital representations of Driving Licences, Registration Certificates, and Vehicle Insurance Policies presented via the authorized DigiLocker Application. Biometric signatures and secure QR codes issued via the Ministry's central database shall satisfy legal inspection parameters. Verification of physical originals shall not be summarily demanded except in cases where immediate license suspension under section 19 is active. Fines collected under refusal of digital certificates shall be deemed ultra vires and subjected to internal departmental audit. Zero processing fee is applicable. Immediate compliance is mandated.`;
          }
          // Trigger simplify button simulation
          document.getElementById("btn-simplify-submit").click();
        }
      }, 100);
    }
  });
}

function switchTab(tabId) {
  AppState.activeTab = tabId;
  
  // Stop speaking on transition
  stopSpeaking();
  
  // Navigation button highlights
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(btn => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    }
  });

  // Section panels display
  const tabPanels = document.querySelectorAll(".tab-panel");
  tabPanels.forEach(panel => {
    if (panel.id === `tab-${tabId}`) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });

  // Trigger sub-view updates when routing
  if (tabId === 'dashboard' && typeof updateDashboardStats === 'function') {
    updateDashboardStats();
  } else if (tabId === 'track-complaints' && typeof renderTrackerGrid === 'function') {
    renderTrackerGrid();
  }
  
  // Focus main content for screen readers
  const mainContent = document.getElementById("main-content");
  mainContent.focus();
  
  // Announce page change to screen reader if TTS active
  if (AppState.speechEnabled) {
    speak(`Navigated to ${tabId.replace('-', ' ')} page`);
  }
}

// Dark/Light Theme Switching
function initTheme() {
  const savedTheme = localStorage.getItem("sb_theme") || "light";
  setTheme(savedTheme);

  const themeBtn = document.getElementById("btn-theme");
  themeBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });
}

function setTheme(theme) {
  AppState.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("sb_theme", theme);
  
  const themeBtn = document.getElementById("btn-theme");
  const icon = themeBtn.querySelector("i");
  if (theme === "dark") {
    icon.className = "fa-solid fa-sun";
    themeBtn.setAttribute("title", "Toggle Light Mode");
    themeBtn.setAttribute("aria-label", "Switch to light theme");
  } else {
    icon.className = "fa-solid fa-moon";
    themeBtn.setAttribute("title", "Toggle Dark Mode");
    themeBtn.setAttribute("aria-label", "Switch to dark theme");
  }
}

// Accessibility features (Contrast, font sizes, dyslexia mode, Text-to-speech)
function initAccessibility() {
  // High Contrast
  const savedContrast = localStorage.getItem("sb_contrast") || "normal";
  setContrast(savedContrast);
  
  document.getElementById("btn-contrast").addEventListener("click", () => {
    const currentContrast = document.documentElement.getAttribute("data-contrast") || "normal";
    const nextContrast = currentContrast === "high" ? "normal" : "high";
    setContrast(nextContrast);
  });

  // Font Magnifier
  const savedFontScale = parseFloat(localStorage.getItem("sb_font_scale")) || 1.0;
  setFontScale(savedFontScale);

  document.getElementById("btn-font-dec").addEventListener("click", () => {
    if (AppState.fontScale > 0.8) {
      setFontScale(AppState.fontScale - 0.1);
    }
  });

  document.getElementById("btn-font-inc").addEventListener("click", () => {
    if (AppState.fontScale < 1.5) {
      setFontScale(AppState.fontScale + 0.1);
    }
  });

  // Dyslexia-Friendly Font
  const savedDyslexia = localStorage.getItem("sb_dyslexia") === "true";
  setDyslexiaFont(savedDyslexia);

  document.getElementById("btn-dyslexia").addEventListener("click", () => {
    setDyslexiaFont(!AppState.dyslexiaFont);
  });

  // Text-To-Speech (Screen Reader Assistant)
  document.getElementById("btn-tts").addEventListener("click", () => {
    toggleTTS();
  });

  // Text-to-Speech Hover/Focus Trigger
  document.addEventListener("focusin", (e) => {
    if (AppState.speechEnabled) {
      const target = e.target;
      if (shouldReadElement(target)) {
        speak(target.innerText || target.value || target.placeholder);
      }
    }
  });

  // Add click to speak for major structural labels when TTS enabled
  document.addEventListener("click", (e) => {
    if (AppState.speechEnabled) {
      const target = e.target;
      // Do not interrupt if they clicked a TTS toggle or form elements inputs that they're editing
      if (target.closest(".accessibility-toolbar") || target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      
      const readableText = getReadableContentOfElement(target);
      if (readableText) {
        speak(readableText);
      }
    }
  });
}

function setContrast(contrast) {
  AppState.contrast = contrast;
  if (contrast === "high") {
    document.documentElement.setAttribute("data-contrast", "high");
    document.getElementById("btn-contrast").classList.add("active");
  } else {
    document.documentElement.removeAttribute("data-contrast");
    document.getElementById("btn-contrast").classList.remove("active");
  }
  localStorage.setItem("sb_contrast", contrast);
}

function setFontScale(scale) {
  AppState.fontScale = Math.round(scale * 10) / 10;
  document.documentElement.style.setProperty("--font-scale", AppState.fontScale);
  localStorage.setItem("sb_font_scale", AppState.fontScale);
}

function setDyslexiaFont(enabled) {
  AppState.dyslexiaFont = enabled;
  if (enabled) {
    document.documentElement.setAttribute("data-font", "dyslexic");
    document.getElementById("btn-dyslexia").classList.add("active");
  } else {
    document.documentElement.removeAttribute("data-font");
    document.getElementById("btn-dyslexia").classList.remove("active");
  }
  localStorage.setItem("sb_dyslexia", enabled);
}

// Text-to-speech engine wrapper
function toggleTTS() {
  AppState.speechEnabled = !AppState.speechEnabled;
  const btn = document.getElementById("btn-tts");
  
  if (AppState.speechEnabled) {
    btn.classList.add("active");
    btn.setAttribute("title", "Disable Screen Reader");
    showToast("Screen Reader Activated. Click or Tab elements to hear them read.", "info");
    speak("Screen reader voice assistant activated. क्लिक या टैब करें सुनने के लिए।");
  } else {
    btn.classList.remove("active");
    btn.setAttribute("title", "Enable Screen Reader");
    stopSpeaking();
    showToast("Screen Reader Deactivated", "info");
  }
}

function speak(text) {
  if (!text || !AppState.speechSynth) return;
  
  stopSpeaking(); // Interrupt previous audio
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = AppState.speechRate;
  
  // Try to detect language Hindi vs English
  const isHindi = /[\u0900-\u097F]/.test(text);
  if (isHindi) {
    utterance.lang = 'hi-IN';
  } else {
    utterance.lang = 'en-IN';
  }
  
  AppState.speechUtterance = utterance;
  AppState.speechSynth.speak(utterance);
}

function stopSpeaking() {
  if (AppState.speechSynth && AppState.speechSynth.speaking) {
    AppState.speechSynth.cancel();
  }
}

function shouldReadElement(el) {
  const tags = ["BUTTON", "A", "H2", "H3", "H4", "H5", "LABEL", "P"];
  return tags.includes(el.tagName) || el.classList.contains("nav-item") || el.classList.contains("chip");
}

function getReadableContentOfElement(el) {
  // If user clicked inside a block container, prefer its general text content
  const item = el.closest("p, h2, h3, h4, h5, button, a, label, li, td");
  if (item) {
    return item.innerText || item.textContent;
  }
  return el.innerText || el.textContent;
}

// Hotkey access logic
function initHotkeys() {
  window.addEventListener("keydown", (e) => {
    // Alt + T: Toggle TTS voice
    if (e.altKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      document.getElementById("btn-tts").click();
    }
    // Alt + C: Toggle Contrast
    if (e.altKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      document.getElementById("btn-contrast").click();
    }
    // Alt + D: Toggle Dyslexia Font
    if (e.altKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      document.getElementById("btn-dyslexia").click();
    }
  });
}

// Global Toast notification utility
function showToast(message, type = 'info') {
  const toast = document.getElementById("toast");
  const toastIcon = document.getElementById("toast-icon");
  const toastMsg = document.getElementById("toast-message");
  
  // Set icons classes
  toastIcon.className = "fa-solid";
  if (type === 'success') {
    toastIcon.classList.add("fa-circle-check", "text-green");
    toast.className = "toast toast-success";
  } else if (type === 'error') {
    toastIcon.classList.add("fa-circle-xmark", "text-red");
    toast.className = "toast toast-error";
  } else {
    toastIcon.classList.add("fa-circle-info", "text-blue");
    toast.className = "toast toast-info";
  }
  
  toastMsg.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");
  
  // Speak toast message if TTS enabled
  if (AppState.speechEnabled) {
    speak(message);
  }

  // Clear timer
  if (toast.timeoutId) {
    clearTimeout(toast.timeoutId);
  }
  
  toast.timeoutId = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 300);
  }, 4000);
}

// Helper to escape HTML and prevent XSS
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, function(match) {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });
}
