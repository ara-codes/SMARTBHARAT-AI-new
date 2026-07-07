/**
 * Smart Bharat AI - Civic Issue Reporting and Tracker Logic (js/issues.js)
 * Implements form validation, interactive grid mapping, storage synchronization,
 * filtering, status updates, and worker progress simulation.
 */

// Mapping of Departments to their specific Issue Categories
const DEPT_CATEGORIES = {
  "Municipal Corporation": ["Garbage Collection", "Street Light", "Drainage", "Illegal Construction"],
  "PWD": ["Road Damage", "Drainage"],
  "Water Department": ["Water Leakage", "Drainage"],
  "Electricity Board": ["Electricity", "Street Light"],
  "Transport Department": ["Public Transport", "Government Office Complaint"]
};

document.addEventListener("DOMContentLoaded", () => {
  initFormDynamics();
  initMapPicker();
  initDropzone();
  initTrackerBoard();
  
  // Start simulation of public work lifecycle
  setInterval(simulateWorkflowProgress, 12000); // Check every 12 seconds
});

// Sync department selections with specific categories
function initFormDynamics() {
  const deptSelect = document.getElementById("issue-department");
  const typeSelect = document.getElementById("issue-type");
  const descArea = document.getElementById("issue-description");
  const charCounter = document.getElementById("desc-char-count");
  const form = document.getElementById("issue-form");

  if (deptSelect && typeSelect) {
    deptSelect.addEventListener("change", () => {
      const selectedDept = deptSelect.value;
      typeSelect.innerHTML = `<option value="" disabled selected>Select Category</option>`;
      typeSelect.disabled = false;

      if (DEPT_CATEGORIES[selectedDept]) {
        DEPT_CATEGORIES[selectedDept].forEach(cat => {
          const opt = document.createElement("option");
          opt.value = cat;
          opt.textContent = cat;
          typeSelect.appendChild(opt);
        });
      }
    });
  }

  // Character limit warning feedback
  if (descArea && charCounter) {
    descArea.addEventListener("input", () => {
      const len = descArea.value.length;
      charCounter.textContent = `${len} / 500 characters`;
      if (len > 500) {
        descArea.value = descArea.value.substring(0, 500);
        charCounter.textContent = `500 / 500 characters`;
        charCounter.style.color = "#ef4444";
      } else {
        charCounter.style.color = "var(--text-muted)";
      }
    });
  }

  // Form submission handler
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (validateForm()) {
        saveComplaint();
      }
    });
  }
}

// Map picker positioning
function initMapPicker() {
  const mapContainer = document.getElementById("grid-map-container");
  const pin = document.getElementById("map-pin");
  const coordInput = document.getElementById("issue-coords");

  if (mapContainer && pin && coordInput) {
    mapContainer.addEventListener("click", (e) => {
      // Get click relative coordinate inside map container
      const rect = mapContainer.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      // Render pin
      pin.style.left = `${x}px`;
      pin.style.top = `${y}px`;
      pin.classList.remove("hidden");

      // Save coordinate
      coordInput.value = `${x},${y}`;
      document.getElementById("err-coords").textContent = ""; // clear err
      
      if (AppState.speechEnabled) {
        speak(`Coordinate pinned at X ${x} and Y ${y}`);
      }
    });

    // Keyboard support: accessibility arrow keys navigation
    mapContainer.addEventListener("keydown", (e) => {
      let x = parseInt(pin.style.left) || 150;
      let y = parseInt(pin.style.top) || 120;
      const step = 10;
      let moved = false;

      if (e.key === "ArrowLeft") { x = Math.max(0, x - step); moved = true; }
      else if (e.key === "ArrowRight") { x = Math.min(mapContainer.clientWidth, x + step); moved = true; }
      else if (e.key === "ArrowUp") { y = Math.max(0, y - step); moved = true; }
      else if (e.key === "ArrowDown") { y = Math.min(mapContainer.clientHeight, y + step); moved = true; }

      if (moved) {
        e.preventDefault();
        pin.style.left = `${x}px`;
        pin.style.top = `${y}px`;
        pin.classList.remove("hidden");
        coordInput.value = `${x},${y}`;
        document.getElementById("err-coords").textContent = "";
      }
    });
  }
}

// File dropzone preview and validations
let base64Photo = null; // Global photo store
function initDropzone() {
  const dropzone = document.getElementById("file-dropzone");
  const fileInput = document.getElementById("issue-photo");
  const previewContainer = document.getElementById("file-preview-container");
  const previewImg = document.getElementById("file-preview-img");
  const removeBtn = document.getElementById("btn-remove-photo");

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length) {
      validateAndPreviewPhoto(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      validateAndPreviewPhoto(fileInput.files[0]);
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      base64Photo = null;
      fileInput.value = "";
      previewContainer.classList.add("hidden");
      dropzone.classList.remove("hidden");
    });
  }
}

function validateAndPreviewPhoto(file) {
  const errPhoto = document.getElementById("err-photo");
  errPhoto.textContent = "";

  // 1. Validation: File Type
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    errPhoto.textContent = "Error: Invalid image file type. Please upload JPG, PNG or WEBP.";
    return;
  }

  // 2. Validation: File Size (< 2MB)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    errPhoto.textContent = "Error: Photograph size exceeds 2MB limit.";
    return;
  }

  // Preview display
  const reader = new FileReader();
  reader.onload = (e) => {
    base64Photo = e.target.result;
    const previewImg = document.getElementById("file-preview-img");
    const previewContainer = document.getElementById("file-preview-container");
    const dropzone = document.getElementById("file-dropzone");

    previewImg.src = base64Photo;
    previewContainer.classList.remove("hidden");
    dropzone.classList.add("hidden");
  };
  reader.readAsDataURL(file);
}

// Form validation
function validateForm() {
  let isValid = true;
  
  const dept = document.getElementById("issue-department");
  const type = document.getElementById("issue-type");
  const title = document.getElementById("issue-title");
  const desc = document.getElementById("issue-description");
  const coords = document.getElementById("issue-coords");

  // Clear errors
  document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");

  if (!dept.value) {
    document.getElementById("err-department").textContent = "Department is required.";
    isValid = false;
  }
  if (!type.value) {
    document.getElementById("err-type").textContent = "Category is required.";
    isValid = false;
  }
  if (!title.value.trim()) {
    document.getElementById("err-title").textContent = "Title is required.";
    isValid = false;
  } else if (title.value.trim().length < 8) {
    document.getElementById("err-title").textContent = "Title must be at least 8 characters.";
    isValid = false;
  }
  if (!desc.value.trim()) {
    document.getElementById("err-description").textContent = "Detailed description is required.";
    isValid = false;
  } else if (desc.value.trim().length < 20) {
    document.getElementById("err-description").textContent = "Please provide more details (minimum 20 characters).";
    isValid = false;
  }
  if (!coords.value) {
    document.getElementById("err-coords").textContent = "You must select a location coordinate on the map grid.";
    isValid = false;
  }

  if (!isValid && AppState.speechEnabled) {
    speak("Please correct the form errors before submitting.");
  }

  return isValid;
}

// Save Complaint in LocalStorage
function saveComplaint() {
  const dept = document.getElementById("issue-department").value;
  const type = document.getElementById("issue-type").value;
  const title = document.getElementById("issue-title").value;
  const desc = document.getElementById("issue-description").value;
  const coords = document.getElementById("issue-coords").value;

  const currentList = JSON.parse(localStorage.getItem("sb_complaints")) || [];
  
  // ID generation
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const compId = `COMP-2026-${randNum}`;

  const todayStr = new Date().toISOString().split("T")[0];

  const newGrievance = {
    id: compId,
    department: dept,
    type: type,
    title: title,
    description: desc,
    photo: base64Photo,
    coords: coords,
    status: "Submitted",
    date: todayStr,
    history: [
      { status: "Submitted", date: getCurrentTimestampStr(), notes: "Complaint registered successfully on citizen portal." }
    ]
  };

  currentList.unshift(newGrievance);
  localStorage.setItem("sb_complaints", JSON.stringify(currentList));

  // Visual success triggers
  showToast(`Complaint filed! Your ID is: ${compId}`, "success");
  
  // Reset Form
  document.getElementById("issue-form").reset();
  base64Photo = null;
  document.getElementById("file-preview-container").classList.add("hidden");
  document.getElementById("file-dropzone").classList.remove("hidden");
  document.getElementById("map-pin").classList.add("hidden");
  document.getElementById("issue-coords").value = "";
  document.getElementById("desc-char-count").textContent = "0 / 500 characters";

  // Rerender tracker lists
  renderTrackerGrid();

  // Redirect to Tracker panel
  setTimeout(() => {
    switchTab("track-complaints");
  }, 1000);
}

// Initialize tracker searching and filtering boards
function initTrackerBoard() {
  const searchInput = document.getElementById("tracker-search");
  const filterBtns = document.querySelectorAll(".filter-btn");

  if (searchInput) {
    searchInput.addEventListener("input", renderTrackerGrid);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTrackerGrid();
    });
  });

  renderTrackerGrid();
}

// Render filtered card outputs
function renderTrackerGrid() {
  const container = document.getElementById("complaints-list");
  if (!container) return;

  const complaints = JSON.parse(localStorage.getItem("sb_complaints")) || [];
  const searchQuery = document.getElementById("tracker-search").value.toLowerCase();
  
  let activeFilter = "all";
  const activeFilterBtn = document.querySelector(".filter-btn.active");
  if (activeFilterBtn) {
    activeFilter = activeFilterBtn.getAttribute("data-filter");
  }

  // Filter items
  const filtered = complaints.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchQuery) || item.title.toLowerCase().includes(searchQuery);
    const matchesStatus = (activeFilter === "all" || item.status === activeFilter);
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-records-card text-center glass">
        <i class="fa-solid fa-folder-open empty-icon"></i>
        <h3>No matching complaints found</h3>
        <p>Try resetting the search query or applying a different status filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "complaint-card glass";
    card.style.borderLeftColor = getBorderColorForStatus(item.status);

    const safeTitle = escapeHTML(item.title);
    const safeDesc = escapeHTML(item.description);

    card.innerHTML = `
      <div class="complaint-card-header">
        <span class="complaint-id">${item.id}</span>
        <span class="status-badge status-${item.status.toLowerCase().replace(' ', '')}">${item.status}</span>
      </div>
      <h4 class="complaint-title">${safeTitle}</h4>
      <p class="complaint-desc">${safeDesc}</p>
      
      ${item.photo ? `
        <div style="margin-bottom:12px;">
          <img src="${item.photo}" alt="Attached Evidence" style="max-height: 120px; border-radius: 4px; object-fit: contain;">
        </div>
      ` : ''}

      <div class="complaint-meta">
        <span><i class="fa-solid fa-building"></i> ${item.department}</span>
        <span><i class="fa-solid fa-tag"></i> ${item.type}</span>
        <span><i class="fa-solid fa-map-location-dot"></i> Coordinates: [${item.coords}]</span>
        <span><i class="fa-solid fa-calendar-day"></i> Filed: ${item.date}</span>
      </div>
      
      <button class="complaint-tracker-link" data-id="${item.id}" aria-expanded="false">
        <i class="fa-solid fa-timeline"></i> Track Work Progress <i class="fa-solid fa-chevron-down toggle-arrow"></i>
      </button>
      <div class="timeline-container hidden" id="timeline-${item.id}">
        <div class="timeline-wrapper">
          ${renderStepperTimelineHTML(item.history, item.status)}
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach timeline toggle triggers
  container.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".complaint-tracker-link");
    if (toggleBtn) {
      const compId = toggleBtn.getAttribute("data-id");
      const wrapper = document.getElementById(`timeline-${compId}`);
      const isHidden = wrapper.classList.contains("hidden");
      const arrow = toggleBtn.querySelector(".toggle-arrow");

      if (isHidden) {
        wrapper.classList.remove("hidden");
        toggleBtn.setAttribute("aria-expanded", "true");
        arrow.className = "fa-solid fa-chevron-up toggle-arrow";
        
        if (AppState.speechEnabled) {
          speak("Showing complaint tracking timeline history");
        }
      } else {
        wrapper.classList.add("hidden");
        toggleBtn.setAttribute("aria-expanded", "false");
        arrow.className = "fa-solid fa-chevron-down toggle-arrow";
      }
    }
  });
}

function getBorderColorForStatus(status) {
  switch (status) {
    case "Submitted": return "#3b82f6";
    case "Assigned": return "#d97706";
    case "In Progress": return "#7c3aed";
    case "Resolved": return "#10b981";
    default: return "var(--border-color)";
  }
}

function renderStepperTimelineHTML(history, currentStatus) {
  const steps = ["Submitted", "Assigned", "In Progress", "Resolved"];
  let html = "";
  
  steps.forEach((step, idx) => {
    const historyItem = history.find(h => h.status === step);
    const isCompleted = steps.indexOf(currentStatus) >= idx;
    const isCurrent = currentStatus === step;

    let stepClass = "";
    if (isCompleted) stepClass = "completed";
    if (isCurrent) stepClass = "current";

    html += `
      <div class="timeline-step ${stepClass}">
        <div class="timeline-circle">
          ${isCompleted && !isCurrent ? '<i class="fa-solid fa-check"></i>' : idx + 1}
        </div>
        <div class="timeline-info">
          <span class="timeline-status">${step}</span>
          ${historyItem ? `
            <span class="timeline-date">${historyItem.date}</span>
            <span class="timeline-notes">${historyItem.notes}</span>
          ` : `
            <span class="timeline-date muted-text">Pending action</span>
          `}
        </div>
      </div>
    `;
  });

  return html;
}

// Background Simulated Public Work Tracker updates (Simulates active resolution workflows)
function simulateWorkflowProgress() {
  const list = JSON.parse(localStorage.getItem("sb_complaints")) || [];
  let updated = false;

  // Search list starting from the back (oldest first)
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];
    if (item.status === "Resolved") continue;

    // Advance state
    if (item.status === "Submitted") {
      item.status = "Assigned";
      item.history.push({
        status: "Assigned",
        date: getCurrentTimestampStr(),
        notes: `Assigned to Ward Engineer Division. Inspection scheduled.`
      });
      updated = true;
      showToast(`Complaint ${item.id} assigned to field worker`, "info");
    } 
    else if (item.status === "Assigned") {
      item.status = "In Progress";
      item.history.push({
        status: "In Progress",
        date: getCurrentTimestampStr(),
        notes: `Field repairs initiated. Work crew deployed at site coordinates.`
      });
      updated = true;
      showToast(`Work started on complaint ${item.id}`, "info");
    }
    else if (item.status === "In Progress") {
      item.status = "Resolved";
      item.history.push({
        status: "Resolved",
        date: getCurrentTimestampStr(),
        notes: `Issue resolved completely. Final site inspection verified.`
      });
      updated = true;
      showToast(`Complaint ${item.id} has been RESOLVED!`, "success");
    }

    if (updated) break; // update one item at a time to prevent logs flood
  }

  if (updated) {
    localStorage.setItem("sb_complaints", JSON.stringify(list));
    // Refresh grids dynamically if visible
    if (AppState.activeTab === 'track-complaints') {
      renderTrackerGrid();
    }
    if (AppState.activeTab === 'dashboard' && typeof updateDashboardStats === 'function') {
      updateDashboardStats();
    }
  }
}

function getCurrentTimestampStr() {
  const d = new Date();
  const yr = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hr = String(hours).padStart(2, '0');

  return `${yr}-${m}-${day} ${hr}:${minutes} ${ampm}`;
}
