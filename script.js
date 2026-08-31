// Registre des exercices : chaque exercice a un id et une fonction render(container)
const exercises = {
  'arpeggio-updown': {
    label: 'Arpège montant / descendant (do mi sol si ré fa la do)',
    notes: ['Do', 'Mi', 'Sol', 'Si', 'Ré', 'Fa', 'La', 'Do'],
    render(container) {
      const sequence = [...this.notes, ...this.notes.slice(0, -1).reverse()];

      container.innerHTML = `
        <p>Joue la séquence dans l'ordre, montant puis descendant :</p>
        <div class="note-sequence">
          ${sequence.map((note, i) => `<span class="note" data-index="${i}">${note}</span>`).join('')}
        </div>
        <button id="start-btn">Démarrer</button>
      `;

      const notesEls = container.querySelectorAll('.note');
      const startBtn = container.querySelector('#start-btn');
      let current = -1;

      startBtn.addEventListener('click', () => {
        notesEls.forEach(el => el.classList.remove('active'));
        current = 0;
        notesEls[current].classList.add('active');
      });

      container.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' || current === -1) return;
        notesEls[current].classList.remove('active');
        current = (current + 1) % notesEls.length;
        notesEls[current].classList.add('active');
      });
    },
  },
};

function loadExercise(id) {
  const exercise = exercises[id];
  const display = document.getElementById('exercise-display');
  exercise.render(display);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getNote(previousNote) {
  const newNote = gamme[getRandomInt(gamme.length)];

  return newNote === previousNote ? getNote(previousNote) : newNote;
}

// Les altérations ne concernent que l'exercice au clavier : l'exercice de tierce
// raisonne en degrés de la gamme (±2 index), pas en demi-tons.
const gammeChromatique = [
  "do", "do#", "ré", "ré#", "mi", "fa", "fa#", "sol", "sol#", "la", "la#", "si",
];

// Deuxième nom possible d'une touche. Les noires ont leur couple dièse/bémol ;
// mi-fa et si-do n'étant séparés que d'un demi-ton, quatre touches blanches
// portent elles aussi un nom altéré (Fa♭ = Mi, Mi♯ = Fa, Do♭ = Si, Si♯ = Do).
// Ré, Sol et La n'en ont pas — il faudrait des doubles altérations.
const ENHARMONIC_NAMES = {
  "do": ["Do", "Si♯"],
  "do#": ["Do♯", "Ré♭"],
  "ré#": ["Ré♯", "Mi♭"],
  "mi": ["Mi", "Fa♭"],
  "fa": ["Fa", "Mi♯"],
  "fa#": ["Fa♯", "Sol♭"],
  "sol#": ["Sol♯", "La♭"],
  "la#": ["La♯", "Si♭"],
  "si": ["Si", "Do♭"],
};

function noteLabel(note) {
  return note.endsWith("#")
    ? note.charAt(0).toUpperCase() + note.slice(1, -1) + "♯"
    : note.charAt(0).toUpperCase() + note.slice(1);
}

// Tire une touche (équiprobable sur les 12 ou les 7), puis choisit au hasard
// l'une de ses graphies quand elle en a deux.
function drawExo2Prompt(withAccidentals, previousKey) {
  const keys = withAccidentals ? gammeChromatique : gamme;
  const key = keys[getRandomInt(keys.length)];

  if (key === previousKey) return drawExo2Prompt(withAccidentals, previousKey);

  // Sans les altérations, une blanche garde toujours son nom simple
  const names = withAccidentals ? ENHARMONIC_NAMES[key] : null;
  return { key, label: names ? names[getRandomInt(names.length)] : noteLabel(key) };
}

function normalizeNote(str) {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function noteAt(index, offset) {
  const len = gamme.length;
  return gamme[((index + offset) % len + len) % len];
}

function calculateExo1Answer(index) {
  return {
    ascending: [noteAt(index, 0), noteAt(index, 2), noteAt(index, 4)],
    descending: [noteAt(index, 0), noteAt(index, -2), noteAt(index, -4)],
  };
}

function notesMatch(typed, expected) {
  const given = typed.trim().split(/\s+/).map(normalizeNote);
  const wanted = expected.map(normalizeNote);
  return given.length === wanted.length && given.every((n, i) => n === wanted[i]);
}

/*const select = document.getElementById('exercise-select');
select.addEventListener('change', (e) => loadExercise(e.target.value));

loadExercise(select.value);*/



let tabs = document.querySelectorAll(".info-box li a");
let panels = document.querySelectorAll(".info-box article");
let exo1Button = document.querySelector("#Arpege1 button");
let exo1Timer = document.querySelector("#Arpege1 div label");
let exo1AnswerUp = document.querySelector("#arpegeAnswerUp");
let exo1AnswerDown = document.querySelector("#arpegeAnswerDown");
let exo1RNote = document.querySelector("#Arpege1 #RandomNote");
let exo1Feedback = document.querySelector("#exo1Feedback");
let exo1HighScoreEl = document.querySelector("#exo1HighScore");
let exo1StreakEl = document.querySelector("#exo1Streak");
let exo1BestStreakEl = document.querySelector("#exo1BestStreak");
let exo1HistoryEl = document.querySelector("#exo1History");
let gamme = ["do","ré","mi","fa","sol","la","si"]
let exo1previousNote = null;
let exo1actualNote= null
let exo1SplitTime = 0;
let exo1AscendingCorrect = false;

let exo2Button = document.querySelector("#exo2Button");
let exo2Timer = document.querySelector("#Exo2Timer");
let exo2Prompt = document.querySelector("#exo2Prompt");
let exo2SoundToggle = document.querySelector("#exo2SoundToggle");
let exo2HardMode = document.querySelector("#exo2HardMode");
let exo2Replay = document.querySelector("#exo2Replay");
let exo2Accidentals = document.querySelector("#exo2Accidentals");
let exo2Keys = document.querySelectorAll("#exo2Piano .piano-key, #exo2Piano .piano-black");
let exo2Feedback = document.querySelector("#exo2Feedback");
let exo2HighScoreEl = document.querySelector("#exo2HighScore");
let exo2StreakEl = document.querySelector("#exo2Streak");
let exo2BestStreakEl = document.querySelector("#exo2BestStreak");
let exo2HistoryEl = document.querySelector("#exo2History");

let exo2Interval = null;
let exo2StartTime = 0;
let exo2CurrentNote = null;  // la touche attendue
let exo2CurrentLabel = "";   // le nom sous lequel elle a été demandée

const EXO_HISTORY_LIMIT = 5;

function createStatsTracker(prefix, els) {
  const KEYS = {
    best: `musicTrain_${prefix}_bestTime`,
    history: `musicTrain_${prefix}_history`,
    streak: `musicTrain_${prefix}_streak`,
    bestStreak: `musicTrain_${prefix}_bestStreak`,
  };

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.history)) || [];
    } catch {
      return [];
    }
  }

  function renderAll() {
    const bestTime = localStorage.getItem(KEYS.best);
    els.highScore.textContent = bestTime ? formatElapsed(Number(bestTime)) : "—";

    els.streak.textContent = localStorage.getItem(KEYS.streak) || "0";
    els.bestStreak.textContent = localStorage.getItem(KEYS.bestStreak) || "0";

    els.history.innerHTML = loadHistory().map(entry => `
      <li class="history-item ${entry.correct ? "correct" : "incorrect"}">
        <span>${entry.time} · ${entry.note}</span>
        <span class="history-time">${entry.correct ? formatElapsed(entry.totalMs) : "Faux"}</span>
      </li>
    `).join("");
  }

  function record(totalMs, isCorrect, note) {
    const history = loadHistory();
    history.unshift({
      totalMs,
      correct: isCorrect,
      note, // déjà mis en forme par l'appelant
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    localStorage.setItem(KEYS.history, JSON.stringify(history.slice(0, EXO_HISTORY_LIMIT)));

    if (isCorrect) {
      const bestTime = Number(localStorage.getItem(KEYS.best));
      if (!bestTime || totalMs < bestTime) {
        localStorage.setItem(KEYS.best, String(totalMs));
      }
    }

    const currentStreak = isCorrect ? (Number(localStorage.getItem(KEYS.streak)) || 0) + 1 : 0;
    localStorage.setItem(KEYS.streak, String(currentStreak));

    const bestStreak = Number(localStorage.getItem(KEYS.bestStreak)) || 0;
    if (currentStreak > bestStreak) {
      localStorage.setItem(KEYS.bestStreak, String(currentStreak));
    }

    renderAll();
  }

  renderAll();

  return { record };
}

const exo1Stats = createStatsTracker("exo1", {
  highScore: exo1HighScoreEl,
  streak: exo1StreakEl,
  bestStreak: exo1BestStreakEl,
  history: exo1HistoryEl,
});

const exo2Stats = createStatsTracker("exo2", {
  highScore: exo2HighScoreEl,
  streak: exo2StreakEl,
  bestStreak: exo2BestStreakEl,
  history: exo2HistoryEl,
});

const NOTE_FREQUENCIES = {
  do: 261.63,
  "do#": 277.18,
  "ré": 293.66,
  "ré#": 311.13,
  mi: 329.63,
  fa: 349.23,
  "fa#": 369.99,
  sol: 392.00,
  "sol#": 415.30,
  la: 440.00,
  "la#": 466.16,
  si: 493.88,
};

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Les navigateurs suspendent le contexte tant qu'il n'y a pas eu de geste utilisateur
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Partiels harmoniques d'une corde frappée : les aigus s'éteignent bien plus vite
// que le fondamental, c'est ce qui distingue un piano d'un simple bip sinusoïdal.
const PIANO_INHARMONICITY = 0.0001;

const PIANO_PARTIALS = [
  { ratio: 1, gain: 1.00, decay: 1.00 },
  { ratio: 2, gain: 0.42, decay: 0.70 },
  { ratio: 3, gain: 0.22, decay: 0.52 },
  { ratio: 4, gain: 0.12, decay: 0.40 },
  { ratio: 5, gain: 0.07, decay: 0.30 },
  { ratio: 6, gain: 0.04, decay: 0.24 },
];

function playNote(note) {
  const ctx = getAudioContext();
  const freq = NOTE_FREQUENCIES[note];
  const now = ctx.currentTime;
  const duration = 2.2;

  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);

  // Le timbre s'assombrit en s'éteignant, comme la résonance d'une vraie corde
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(5500, now);
  filter.frequency.exponentialRampToValueAtTime(1100, now + duration);
  filter.connect(master);

  PIANO_PARTIALS.forEach(partial => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Inharmonicité d'une corde tendue : f(n) = n·f0·√(1 + B·n²).
    // B doit rester petit (~1e-4 dans le médium d'un piano) : au-delà, les partiels
    // aigus tirent la hauteur perçue vers l'aigu et un accordeur détecte la note trop haute.
    const n = partial.ratio;
    osc.frequency.value = freq * n * Math.sqrt(1 + PIANO_INHARMONICITY * n * n);

    const peak = partial.gain * 0.3;
    const end = now + duration * partial.decay;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.006);        // attaque percussive
    gain.gain.exponentialRampToValueAtTime(peak * 0.3, now + 0.12);   // chute initiale rapide
    gain.gain.exponentialRampToValueAtTime(0.0001, end);              // longue résonance

    osc.connect(gain);
    gain.connect(filter);
    osc.start(now);
    osc.stop(end);
  });

  // Bruit très bref à l'attaque : le "clac" du marteau sur la corde
  const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = freq * 3;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.05, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now);
}

for (let i = 0; i < tabs.length; i++) {
  let tab = tabs[i];
  setTabHandler(tab, i);
}

function setTabHandler(tab, tabPos) {
  tab.onclick = function () {
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].className = "";
    }

    tab.className = "active";

    for (let i = 0; i < panels.length; i++) {
      panels[i].className = "";
    }

    panels[tabPos].className = "active-panel";
  };
}

let exo1Interval = null;
let exo1StartTime = 0;

function formatElapsed(ms) {
  const totalCentiseconds = Math.floor(ms / 10);
  const seconds = Math.floor(totalCentiseconds / 100);
  const centiseconds = totalCentiseconds % 100;
  return `${seconds}.${String(centiseconds).padStart(2, "0")}s`;
}

exo1Button.addEventListener("click", () => {
  if (exo1Interval !== null) {
    clearInterval(exo1Interval);
  }

  exo1StartTime = performance.now();
  exo1Timer.innerHTML = formatElapsed(0);

  exo1Interval = setInterval(() => {
    exo1Timer.innerHTML = formatElapsed(performance.now() - exo1StartTime);
  }, 10);
  
  exo1actualNote = getNote(exo1RNote.innerHTML)

  exo1RNote.innerHTML = exo1actualNote;
  exo1previousNote = exo1previousNote;

  exo1AnswerUp.value = "";
  exo1AnswerDown.value = "";
  exo1AnswerUp.className = "";
  exo1AnswerDown.className = "";
  exo1Feedback.className = "feedback";
  exo1Feedback.textContent = "";
  exo1SplitTime = 0;
  exo1AscendingCorrect = false;

  exo1AnswerUp.focus()
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.target.tagName === "INPUT") return;

  const activePanel = document.querySelector(".panels .active-panel");
  const startBtn = activePanel && activePanel.querySelector(".start-btn");
  if (startBtn) startBtn.click();
});

exo1AnswerUp.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || exo1Interval === null) return;

  const answerIndex = gamme.indexOf(exo1RNote.innerHTML);
  if (answerIndex === -1) return;

  const answerWanted = calculateExo1Answer(answerIndex);
  exo1AscendingCorrect = notesMatch(exo1AnswerUp.value, answerWanted.ascending);
  exo1AnswerUp.className = exo1AscendingCorrect ? "correct" : "incorrect";
  exo1SplitTime = performance.now() - exo1StartTime;

  exo1AnswerDown.focus();
});

exo1AnswerDown.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || exo1Interval === null) return;

  const answerIndex = gamme.indexOf(exo1RNote.innerHTML);
  if (answerIndex === -1) return;

  clearInterval(exo1Interval);
  exo1Interval = null;

  const answerWanted = calculateExo1Answer(answerIndex);
  const descendingCorrect = notesMatch(exo1AnswerDown.value, answerWanted.descending);
  exo1AnswerDown.className = descendingCorrect ? "correct" : "incorrect";

  const isCorrect = exo1AscendingCorrect && descendingCorrect;
  const totalTime = performance.now() - exo1StartTime;
  const descentTime = totalTime - exo1SplitTime;

  exo1Feedback.textContent = isCorrect
    ? `Correct ! (Montée: ${formatElapsed(exo1SplitTime)} / Descente: ${formatElapsed(descentTime)})`
    : `Faux, la réponse était : ${answerWanted.ascending.join(" ")} / ${answerWanted.descending.join(" ")}`;
  exo1Feedback.className = `feedback show ${isCorrect ? "correct" : "incorrect"}`;

  exo1Stats.record(totalTime, isCorrect, noteLabel(exo1RNote.innerHTML));

  exo1AnswerDown.blur();
});

exo2HardMode.addEventListener("change", () => {
  exo2SoundToggle.disabled = exo2HardMode.checked;
  if (exo2HardMode.checked) {
    exo2SoundToggle.checked = true;
  }
});

exo2Button.addEventListener("click", () => {
  if (exo2Interval !== null) {
    clearInterval(exo2Interval);
  }

  exo2StartTime = performance.now();
  exo2Timer.innerHTML = formatElapsed(0);
  exo2Interval = setInterval(() => {
    exo2Timer.innerHTML = formatElapsed(performance.now() - exo2StartTime);
  }, 10);

  const prompt = drawExo2Prompt(exo2Accidentals.checked, exo2CurrentNote);
  exo2CurrentNote = prompt.key;
  exo2CurrentLabel = prompt.label;

  // classList plutôt que className : les touches noires ont leur propre classe de base
  exo2Keys.forEach(key => key.classList.remove("correct", "incorrect"));
  exo2Feedback.className = "feedback";
  exo2Feedback.textContent = "";

  const isHard = exo2HardMode.checked;
  exo2Prompt.textContent = isHard ? "🔊" : exo2CurrentLabel;

  if (isHard || exo2SoundToggle.checked) {
    playNote(exo2CurrentNote);
  }
});

exo2Replay.addEventListener("click", () => {
  if (exo2CurrentNote) playNote(exo2CurrentNote);
});

exo2Keys.forEach(key => {
  key.addEventListener("click", () => {
    // Le clavier sonne toujours : hors partie, c'est un mode libre.
    playNote(key.dataset.note);

    if (exo2Interval === null) return;

    clearInterval(exo2Interval);
    exo2Interval = null;

    const isCorrect = key.dataset.note === exo2CurrentNote;

    key.classList.add(isCorrect ? "correct" : "incorrect");

    if (!isCorrect) {
      const correctKey = Array.from(exo2Keys).find(k => k.dataset.note === exo2CurrentNote);
      if (correctKey) correctKey.classList.add("correct");
    }

    const totalTime = performance.now() - exo2StartTime;

    // La réponse est révélée dans tous les cas, y compris en mode difficile
    exo2Prompt.textContent = exo2CurrentLabel;

    exo2Feedback.textContent = isCorrect
      ? `Correct ! (${formatElapsed(totalTime)})`
      : `Faux, c'était : ${exo2CurrentLabel}`;
    exo2Feedback.className = `feedback show ${isCorrect ? "correct" : "incorrect"}`;

    exo2Stats.record(totalTime, isCorrect, exo2CurrentLabel);

    key.blur();
  });
});