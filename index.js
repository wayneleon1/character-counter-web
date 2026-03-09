const textarea = document.querySelector(".input-textarea");
const checkBoxes = document.querySelectorAll(
  ".options-container input[type='checkbox']",
);

const optionsContainerText = document.querySelectorAll(
  ".options-container label",
);

const letterDensityContainer = document.querySelectorAll(
  "#letter-density-container h2",
);

const letterLabel = document.querySelector(".letter-label");
const letterPercentage = document.querySelector(".letter-percentage");
const progressBarContainer = document.querySelector(".progress-bar-container");
const excludeSpacesCB = document.getElementById("exclude-spaces");
const setLimitCB = document.getElementById("set-character-limit");
const limitInput = document.getElementById("character-limit-input");
const readingTimeEl = document.querySelector(".options-container > p");
const charCountEl = document.querySelector(
  ".stat-card-container > div:nth-child(1) p:first-child",
);
const wordCountEl = document.querySelector(
  ".stat-card-container > div:nth-child(2) p:first-child",
);
const sentenceCountEl = document.querySelector(
  ".stat-card-container > div:nth-child(3) p:first-child",
);
const listContainer = document.querySelector(".list-container");
const seeMoreBtn = document.getElementById("see-more-btn");
const seeMoreText = seeMoreBtn.querySelector("p");
const seeMoreIcon = seeMoreBtn.querySelector(".see-more-icon");
const mainSection = document.getElementById("main-section-container");

// Warning Banner
const warningEl = document.createElement("div");
warningEl.style.cssText = `
  display: none;
  align-items: center;
  gap: 8px;
  color: var(--color-orange-500);
  font-size: 16px;
  line-height: 130%;
  letter-spacing: -0.6px;
`;
warningEl.innerHTML = `
  <img src="./assets/images/icon-info.svg" alt="warning" />
  <p id="warning-text">Limit reached! Your text exceeds the character limit.</p>
`;

mainSection.querySelector("div").appendChild(warningEl);

// State
let showAll = false;
const VISIBLE_ROWS = 5;

// Helpers Functions
function getCharCount(text) {
  return excludeSpacesCB.checked ? text.replace(/\s/g, "").length : text.length;
}

function getWordCount(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function getSentenceCount(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?]*[.!?]+/g);
  return matches ? matches.length : trimmed.length > 0 ? 1 : 0;
}

function getReadingTime(wordCount) {
  // Avg reading speed: ~200 wpm
  const minutes = wordCount / 200;
  if (minutes < 1) return "less than a minute";
  const rounded = Math.round(minutes);
  return `${rounded} minute${rounded !== 1 ? "s" : ""}`;
}

function getLetterDensity(text) {
  const letters = text.toLowerCase().replace(/[^a-z]/g, "");
  if (!letters.length) return [];

  const freq = {};
  for (const char of letters) {
    freq[char] = (freq[char] || 0) + 1;
  }

  return Object.entries(freq)
    .map(([letter, count]) => ({
      letter: letter.toUpperCase(),
      count,
      percentage: ((count / letters.length) * 100).toFixed(2),
    }))
    .sort((a, b) => b.count - a.count);
}

//  Render Letter Density
function renderLetterDensity(densityData) {
  const visible = showAll ? densityData : densityData.slice(0, VISIBLE_ROWS);

  listContainer.innerHTML = visible
    .map(
      ({ letter, count, percentage }) => `
        <div class="list-item">
          <div class="letter-label">${letter}</div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="letter-percentage">${count} (${percentage}%)</div>
        </div>
      `,
    )
    .join("");

  // Show/hide the "See more / See less" btn
  if (densityData.length > VISIBLE_ROWS) {
    seeMoreBtn.style.display = "flex";
    seeMoreText.textContent = showAll ? "See less" : "See more";
    seeMoreIcon.style.transform = showAll ? "rotate(180deg)" : "rotate(0deg)";
    seeMoreIcon.style.transition = "transform 0.25s ease";
  } else {
    seeMoreBtn.style.display = "none";
  }
}

// Character Limit Logic
function applyCharacterLimit() {
  if (!setLimitCB.checked) {
    warningEl.style.display = "none";
    textarea.style.borderColor = "";
    return;
  }

  const limit = parseInt(limitInput.value, 10);
  if (isNaN(limit) || limit <= 0) return;

  const currentLength = textarea.value.length;

  if (currentLength > limit) {
    // Trim text to the limit
    textarea.value = textarea.value.slice(0, limit);

    // Show warning
    textarea.style.cssText +=
      " border-color: var(--color-orange-500); box-shadow: 0 0 10px 3px rgba(255, 140, 0, 0.2);";

    warningEl.style.display = "flex";
    document.getElementById("warning-text").textContent =
      `Limit reached! Your text exceeds ${limit} characters.`;
    textarea.style.borderColor = "var(--color-orange-500)";
  } else {
    warningEl.style.display = "none";
    textarea.style.borderColor = "";
  }
}

//  Main Update Function
function updateStats() {
  applyCharacterLimit();

  const text = textarea.value;

  // Counts
  const charCount = getCharCount(text);
  const wordCount = getWordCount(text);
  const sentenceCount = getSentenceCount(text);

  // Update stat cards
  charCountEl.textContent = charCount;
  wordCountEl.textContent = wordCount;
  sentenceCountEl.textContent = String(sentenceCount).padStart(2, "0");

  // Reading time
  readingTimeEl.textContent = `Approx. reading time: ${getReadingTime(wordCount)}`;

  // Letter density
  const density = getLetterDensity(text);
  if (density.length === 0) {
    listContainer.innerHTML = `<p class="density-empty-msg" style="font-size: 16px;">No characters found. Start typing to see letter density.</p>`;
    seeMoreBtn.style.display = "none";
  } else {
    renderLetterDensity(density);
  }
}

// Event Listeners
textarea.addEventListener("input", updateStats);

excludeSpacesCB.addEventListener("change", updateStats);

setLimitCB.addEventListener("change", () => {
  limitInput.style.display = setLimitCB.checked ? "block" : "none";
  if (!setLimitCB.checked) {
    warningEl.style.display = "none";
    textarea.style.borderColor = "";
  }
  updateStats();
});

limitInput.addEventListener("input", updateStats);

seeMoreBtn.addEventListener("click", () => {
  showAll = !showAll;
  const density = getLetterDensity(textarea.value);
  renderLetterDensity(density);
});

// Theme Toggle
const themeToggleBtn = document.querySelector(".btn-theme-toggle");
const themeToggleIcon = document.querySelector(".theme-toggle_icon");
const navLogo = document.querySelector(".nav-logo");
const body = document.body;

const headerTitle = document.querySelector("#header-container > h1");

let isDark = true;

themeToggleBtn.addEventListener("click", () => {
  isDark = !isDark;
  document.body.classList.toggle("light-theme", !isDark);

  themeToggleIcon.src = isDark
    ? "./assets/images/icon-sun.svg"
    : "./assets/images/icon-moon.svg";

  themeToggleBtn.style.backgroundColor = isDark
    ? "var(--color-neutral-700)"
    : "var(--color-neutral-100)";

  navLogo.src = isDark
    ? "./assets/images/logo-dark-theme.svg"
    : "./assets/images/logo-light-theme.svg";

  body.style.backgroundImage = isDark
    ? "url('./assets/images/bg-dark-theme.png')"
    : "url('./assets/images/bg-light-theme.png')";

  headerTitle.style.color = isDark
    ? "var(--color-neutral-100)"
    : "var(--color-neutral-900)";

  letterDensityContainer.forEach((el) => {
    el.style.color = isDark ? "" : "var(--color-neutral-900)";
  });

  limitInput.style.cssText = isDark
    ? ""
    : "background-color: transparent; border-color: var(--color-neutral-200); color: var(--color-neutral-700);}";

  textarea.style.cssText = isDark
    ? ""
    : "background-color: var(--color-neutral-100); border-color: var(--color-neutral-200); color: var(--color-neutral-700);}";

  textarea.classList.toggle("light-textarea", !isDark);

  checkBoxes.forEach((cb) => {
    cb.style.cssText = isDark
      ? ""
      : "background-color: transparent; border: 1px solid var(--color-neutral-900);";
  });

  readingTimeEl.style.color = isDark ? "" : "var(--color-neutral-900)";

  optionsContainerText.forEach((label) => {
    label.style.color = isDark ? "" : "var(--color-neutral-900)";
  });
});

// Hide limit input until checkbox is ticked
limitInput.style.display = "none";

updateStats();
