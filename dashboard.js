/**
 * Smart Bharat AI - Transparency & Analytics Dashboard SVG Renderings (js/dashboard.js)
 * Implements SVG Bar Chart, Satisfaction Gauge, live counters, and storage bindings.
 */

document.addEventListener("DOMContentLoaded", () => {
  updateDashboardStats();
  
  // Set up resize listener to adjust SVG layout on window resizing
  window.addEventListener("resize", () => {
    if (AppState.activeTab === 'dashboard') {
      renderDepartmentChart();
      renderSatisfactionGauge();
    }
  });
});

// Update live counts and trigger SVGs rendering
function updateDashboardStats() {
  const complaints = JSON.parse(localStorage.getItem("sb_complaints")) || [];
  
  // 1. Calculate metrics
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = complaints.filter(c => c.date === todayStr).length;
  
  const pendingCount = complaints.filter(c => c.status !== "Resolved").length;
  const resolvedCount = complaints.filter(c => c.status === "Resolved").length;
  
  // Update UI values
  animateNumberCounter("stat-today-complaints", todayCount);
  animateNumberCounter("stat-pending-complaints", pendingCount);
  animateNumberCounter("stat-resolved-complaints", resolvedCount);
  
  // Resolution Time metric (mock calculation based on average)
  const timeEl = document.getElementById("stat-resolution-time");
  if (timeEl) {
    if (resolvedCount > 0) {
      timeEl.textContent = "18 hours";
    } else {
      timeEl.textContent = "24 hours";
    }
  }

  // Calculate dynamic satisfaction index
  let satScore = 82; // Baseline
  if (resolvedCount > 0) {
    const ratio = resolvedCount / complaints.length;
    satScore = Math.min(98, Math.round(80 + (ratio * 18)));
  }
  document.getElementById("satisfaction-score").textContent = `${satScore}%`;
  
  // 2. Render SVG Charts
  renderDepartmentChart(complaints);
  renderSatisfactionGauge(satScore);
}

// Animate counting numbers on page load
function animateNumberCounter(elemId, targetVal) {
  const el = document.getElementById(elemId);
  if (!el) return;
  
  const startVal = parseInt(el.textContent) || 0;
  if (startVal === targetVal) {
    el.textContent = targetVal;
    return;
  }
  
  const duration = 800; // ms
  const stepTime = 30;
  const steps = Math.ceil(duration / stepTime);
  const increment = (targetVal - startVal) / steps;
  
  let currentStep = 0;
  let currentVal = startVal;
  
  const timer = setInterval(() => {
    currentStep++;
    currentVal += increment;
    el.textContent = Math.round(currentVal);
    
    if (currentStep >= steps) {
      clearInterval(timer);
      el.textContent = targetVal;
    }
  }, stepTime);
}

// Render dynamic SVG bar charts representing department statistics
function renderDepartmentChart(complaintsList) {
  const container = document.getElementById("dept-chart-container");
  if (!container) return;

  const complaints = complaintsList || JSON.parse(localStorage.getItem("sb_complaints")) || [];
  
  // Calculate counts per department
  const depts = ["Municipal Corporation", "PWD", "Water Department", "Electricity Board", "Transport Department"];
  const counts = {};
  depts.forEach(d => counts[d] = 0);
  
  complaints.forEach(c => {
    if (counts[c.department] !== undefined) {
      counts[c.department]++;
    }
  });

  const maxVal = Math.max(1, ...Object.values(counts));
  
  // Get width dynamically from layout
  const w = container.clientWidth || 450;
  const h = 200;
  const paddingLeft = 140;
  const paddingRight = 40;
  const paddingTop = 10;
  const paddingBottom = 20;
  
  const chartWidth = w - paddingLeft - paddingRight;
  const chartHeight = h - paddingTop - paddingBottom;
  
  const barHeight = 20;
  const barSpacing = 12;

  // Build SVG content
  let svgContent = `<svg width="${w}" height="${h}" aria-label="Horizontal Bar Chart showing complaints count per department">`;
  
  // Vertical Axis line
  svgContent += `<line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${h - paddingBottom}" class="chart-axis-line" />`;
  
  depts.forEach((dept, idx) => {
    const count = counts[dept];
    const barWidth = Math.round((count / maxVal) * chartWidth);
    const y = paddingTop + idx * (barHeight + barSpacing) + 5;

    // Saffron gradient for high-contrast visibility
    const fillHex = AppState.contrast === "high" ? "#ffff00" : (AppState.theme === "dark" ? "#3b82f6" : "#0033a0");

    // Y-axis Label text (shorten if necessary, safe HTML characters)
    let displayName = dept;
    if (w < 400 && dept.length > 15) {
      displayName = dept.substring(0, 12) + "...";
    }
    
    // Y-Axis labels
    svgContent += `
      <text x="${paddingLeft - 10}" y="${y + 14}" text-anchor="end" class="chart-text" style="font-weight:600;">
        ${escapeHTML(displayName)}
      </text>
    `;
    
    // Data Bar Rect
    svgContent += `
      <rect x="${paddingLeft}" y="${y}" width="${barWidth}" height="${barHeight}" 
            class="bar-chart-rect" style="fill: ${fillHex};" />
    `;
    
    // Value Label
    svgContent += `
      <text x="${paddingLeft + barWidth + 8}" y="${y + 15}" text-anchor="start" class="chart-text" style="font-weight:700;">
        ${count}
      </text>
    `;
  });
  
  svgContent += `</svg>`;
  container.innerHTML = svgContent;
}

// Render dynamic semi-circle speed index gauge
function renderSatisfactionGauge(scoreVal) {
  const container = document.getElementById("satisfaction-gauge-container");
  if (!container) return;

  const score = scoreVal !== undefined ? scoreVal : 87;
  
  const w = 240;
  const h = 130;
  const cx = w / 2;
  const cy = h - 10;
  const radius = 80;

  // Semicircle paths calculations: SVG Arc
  // Path description for a semi-circle from left to right:
  // Move to (cx - R, cy), Arc to (cx + R, cy) with radius R, direction clockwise.
  const pathD = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;
  
  // Circumference of semi circle = PI * R = 3.14159 * 80 = 251.3
  const semiCircumference = Math.PI * radius;
  
  // Calculate dashOffset: (1 - percentage) * circumference
  const percent = score / 100;
  const dashOffset = semiCircumference * (1 - percent);

  // SVG Gauge Rendering
  let svgContent = `
    <svg width="${w}" height="${h}" aria-label="Radial Speedometer showing Citizen Satisfaction at ${score}%">
      <!-- Background Arc -->
      <path d="${pathD}" class="gauge-bg-path" />
      
      <!-- Colored Fill Arc -->
      <path d="${pathD}" class="gauge-fill-path" 
            style="stroke-dasharray: ${semiCircumference}; stroke-dashoffset: ${semiCircumference};" />
            
      <!-- Styled pointer indicator -->
      <circle cx="${cx}" cy="${cy}" r="6" style="fill:var(--text-primary);" />
    </svg>
  `;

  container.innerHTML = svgContent;

  // Let browser layout render, then animate the dashoffset for neat visual transition
  setTimeout(() => {
    const fillArc = container.querySelector(".gauge-fill-path");
    if (fillArc) {
      fillArc.style.strokeDashoffset = dashOffset;
      
      // Dynamic color depending on rating
      if (AppState.contrast === "high") {
        fillArc.style.stroke = "#ffff00";
      } else if (score >= 85) {
        fillArc.style.stroke = "var(--accent-green)";
      } else if (score >= 60) {
        fillArc.style.stroke = "var(--accent-saffron)";
      } else {
        fillArc.style.stroke = "#ef4444";
      }
    }
  }, 100);
}
