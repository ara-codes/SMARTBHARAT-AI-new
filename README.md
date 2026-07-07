# Smart Bharat AI - Citizen Civic Platform

Smart Bharat AI is a modern, responsive Single Page Application (SPA) designed to empower Indian citizens in accessing government services, reporting local civic issues, checking welfare program eligibility, and translating complex bureaucratic documents into simple plain language using generative AI simulation.

Built under the **Digital India Initiative**, this platform prioritizes digital inclusion, transparency, and accessibility.

---

## 🌟 Key Features

### 1. Smart Bharat AI Assistant
* **Multilingual Chat**: Conversation support in both **English** and **Hindi**.
* **Intent Recognition**: Intelligent query routing for topics like Aadhaar, PAN Card, Passports, DigiLocker, Ayushman Bharat, PM-Kisan, and more.
* **Suggestion Chips**: One-click queries for easy discovery.
* **Voice Capabilities**: Simulates voice input and uses the Web Speech API for dynamic speech synthesis/text-to-speech output.

### 2. Issue Reporting & Complaint Tracker
* **Department Routing**: Grievances are routed automatically to Municipal Corporations, PWD, Water Departments, Electricity Boards, or Transport Departments.
* **Evidence Validation**: Upload photographs with strict front-end validation (file size < 2MB, formats limited to JPG/PNG/WEBP).
* **Interactive Grid Map**: Click or use arrow keys to pin the exact coordinate of the issue.
* **Live Stepper Timeline**: Track complaints through their lifecycle (`Submitted` → `Assigned` → `In Progress` → `Resolved`).
* **Workflow Simulator**: Simulates a background worker dispatch system that updates complaint status dynamically in the background.

### 3. Services Eligibility Wizard
* **Questionnaire Profiling**: Evaluates age, income, occupation, and social group criteria.
* **Personalized Recommendations**: Recommends eligible schemes and updates checklists instantly.
* **AI Document Verification Assistant**: Simulates drag-and-drop document reviews (e.g. checks file name patterns like "aadhaar" or "bill" and returns e-KYC results).

### 4. Government Document Legalese Simplifier
* **Plain Language Translation**: Paste complex notifications or circular text and simplify them into bulleted points (Summary, Eligibility, Documents, Fees, Timeline, Notes).
* **Text-to-Speech Output**: Read simplified translations aloud.

### 5. Transparency & Accessibility Dashboard
* **Dynamic Analytics**: Powered by live-generated SVG charts showing department-wise complaint distributions.
* **Citizen Satisfaction index**: Semicircle radial gauge rendering overall satisfaction rating updates.
* **Comprehensive Accessibility Controls**:
  - High Contrast mode (contrast-focused dark layout).
  - Font scaling (from 0.8x up to 1.5x sizing).
  - Dyslexia-Friendly font overrides.
  - Keyboard navigation and landmarks support.
  - Hotkey triggers: `Alt+T` (TTS), `Alt+C` (Contrast), `Alt+D` (Dyslexia font).

---

## 📂 File Directory

```text
hackathon/
│
├── index.html            # Main entry point (SPA Shell & templates)
│
├── css/
│   ├── variables.css     # Global HSL color variables, light/dark tokens, font scales
│   ├── main.css          # Layout styling, headers, sidebar menu, toast popups
│   ├── chatbot.css       # Chat bubbles, languages selectors, suggestions chips
│   ├── dashboard.css     # SVG charts, radial dials, and list items
│   ├── issues.css        # Interactive maps, file dropzones, tracker grids
│   └── services.css      # Wizard stepper steps, checklists, legalese split view
│
└── js/
    ├── app.js            # Router states, dark mode, accessibility engine, TTS hooks
    ├── ai.js             # Multilingual intent mappings and responses database
    ├── issues.js         # Coordinates pickers, status history updates, progress loops
    ├── services.js       # Score checkers, document validation mock, legalese simplify parser
    └── dashboard.js      # Responsive SVG chart rendering and live counting counters
```

---

## 🚀 How to Run Locally

Since this is a client-side SPA written in vanilla HTML/CSS/JS, no compilation or bundlers are required.

### Option A: Serve with Python (Recommended)
Open your terminal inside the project directory and run:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

### Option B: Serve with Node.js
If you have Node installed, run:
```bash
npx http-server ./
```

### Option C: Direct File Opening
You can double-click `index.html` to open it in a browser, though some features like XML/File uploads or specific Speech APIs perform best when loaded via local servers.

---

## 🛡️ Security & Integrity Implementations
* **XSS Prevention**: Safe text rendering patterns utilizing `textContent` and HTML entity escaping functions for user-supplied input (Titles, Descriptions, search parameters).
* **Upload Sanitization**: Validates MIME types and limits size capacity to 2MB.
* **State Isolation**: Sandboxed state management utilizing isolated scopes per module.
* **Input Restrictions**: Character limits dynamically enforced on text fields.
