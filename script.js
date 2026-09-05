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

let exo3Button = document.querySelector("#exo3Button");
let exo3Timer = document.querySelector("#Exo3Timer");
let exo3Prompt = document.querySelector("#exo3Prompt");
let exo3Descending = document.querySelector("#exo3Descending");
let exo3Range = document.querySelector("#exo3Range");
let exo3RangeValue = document.querySelector("#exo3RangeValue");
let exo3RangeOctaves = document.querySelector("#exo3RangeOctaves");
let exo3Replay = document.querySelector("#exo3Replay");
let exo3Piano = document.querySelector("#exo3Piano");
let exo3Secret = document.querySelector("#exo3Secret");
let exo3Feedback = document.querySelector("#exo3Feedback");
let exo3HighScoreEl = document.querySelector("#exo3HighScore");
let exo3StreakEl = document.querySelector("#exo3Streak");
let exo3BestStreakEl = document.querySelector("#exo3BestStreak");
let exo3HistoryEl = document.querySelector("#exo3History");

let exo3Interval = null;
let exo3Timeout = null;
let exo3StartTime = 0;
let exo3Ref = 0;        // demi-tons depuis Do4
let exo3Target = 0;
let exo3Answering = false;

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

const exo3Stats = createStatsTracker("exo3", {
  highScore: exo3HighScoreEl,
  streak: exo3StreakEl,
  bestStreak: exo3BestStreakEl,
  history: exo3HistoryEl,
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
  playFrequency(NOTE_FREQUENCIES[note]);
}

function playFrequency(freq) {
  const ctx = getAudioContext();
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

  const nyquist = ctx.sampleRate / 2;

  PIANO_PARTIALS.forEach(partial => {
    // Inharmonicité d'une corde tendue : f(n) = n·f0·√(1 + B·n²).
    // B doit rester petit (~1e-4 dans le médium d'un piano) : au-delà, les partiels
    // aigus tirent la hauteur perçue vers l'aigu et un accordeur détecte la note trop haute.
    const n = partial.ratio;
    const partialFreq = freq * n * Math.sqrt(1 + PIANO_INHARMONICITY * n * n);

    // Au-dessus de Nyquist un partiel ne s'entend pas : il se replie en craquements
    if (partialFreq >= nyquist) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = partialFreq;

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

// Relue à chaque appel plutôt que figée : on peut donc revenir corriger la
// montée après coup, la dernière lecture faisant foi au moment de valider.
function validateExo1Ascending() {
  const answerIndex = gamme.indexOf(exo1RNote.innerHTML);
  if (answerIndex === -1) return;

  const expected = calculateExo1Answer(answerIndex).ascending;
  exo1AscendingCorrect = notesMatch(exo1AnswerUp.value, expected);
  exo1AnswerUp.className = exo1AscendingCorrect ? "correct" : "incorrect";
}

// 0 = pas encore relevé, valeur remise à zéro au début de chaque manche
function markExo1Split() {
  if (exo1SplitTime === 0) exo1SplitTime = performance.now() - exo1StartTime;
}

exo1AnswerUp.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || exo1Interval === null) return;

  markExo1Split();
  validateExo1Ascending();
  exo1AnswerDown.focus();
});

// Quitter le champ à la souris ou au Tab doit valoir validation : sans ça, cliquer
// directement dans le second champ laissait la montée jamais évaluée, donc comptée
// fausse, et le temps de montée à zéro.
exo1AnswerUp.addEventListener("blur", () => {
  if (exo1Interval === null) return;

  markExo1Split();
  validateExo1Ascending();
});

exo1AnswerDown.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || exo1Interval === null) return;

  const answerIndex = gamme.indexOf(exo1RNote.innerHTML);
  if (answerIndex === -1) return;

  clearInterval(exo1Interval);
  exo1Interval = null;

  // Relecture de la montée : elle a pu être corrigée depuis sa première évaluation
  validateExo1Ascending();

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

// Le mode difficile impose le son, puisque c'est le seul indice disponible
function exo2SoundEnabled() {
  return exo2SoundToggle.checked || exo2HardMode.checked;
}

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

  exo2Prompt.textContent = exo2HardMode.checked ? "🔊" : exo2CurrentLabel;

  if (exo2SoundEnabled()) {
    playNote(exo2CurrentNote);
  }
});

exo2Replay.addEventListener("click", () => {
  if (exo2CurrentNote) playNote(exo2CurrentNote);
});

exo2Keys.forEach(key => {
  key.addEventListener("click", () => {
    // Hors partie, le clavier sert d'instrument libre — sous réserve du son activé
    if (exo2SoundEnabled()) {
      playNote(key.dataset.note);
    }

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

/* ---------- Exercice 3 : oreille relative ---------- */

// Notes repérées en numérotation MIDI (Do4 = 60, La4 = 69 = 440 Hz), ce qui permet
// de générer n'importe quelle tranche de clavier sans casser le motif noir/blanc.
const MIDI_MIDDLE_C = 60;
const MIDI_A4 = 69;
const MIDI_LOWEST_PIANO = 21;  // La0
const MIDI_HIGHEST_USEFUL = 132; // ~16,7 kHz : au-delà, plus personne n'entend la cible

// Doit correspondre au texte d'attente écrit dans index.html
const PROMPT_IDLE = "——";

// La référence doit pouvoir tomber sur n'importe quel degré d'une octave
const EXO3_REF_SPAN = 13;
const EXO3_GAP_DELAY = 900; // ms entre les deux notes

// 3 octaves : l'oreille relative va jusque-là, 2 étant déjà courant
const EXO3_SANE_MAX = 36;

// Plafond du clavier : tout ce qui reste audible entre La0 et ~16,7 kHz.
// Vaut 112, soit exactement EXO3_REF_SPAN + l'écart max du mode déraisonnable,
// donc la référence garde toujours ses 13 positions possibles.
const EXO3_MAX_KEYS = MIDI_HIGHEST_USEFUL - MIDI_LOWEST_PIANO + 1;

const WHITE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];

let exo3StartMidi = MIDI_MIDDLE_C;
let exo3KeyCount = EXO3_REF_SPAN;

function isWhiteKey(midi) {
  return WHITE_OFFSETS.includes(midi % 12);
}

function midiFrequency(midi) {
  return 440 * Math.pow(2, (midi - MIDI_A4) / 12);
}

function midiLabel(midi) {
  return noteLabel(gammeChromatique[midi % 12]);
}

function exo3KeyAt(midi) {
  return exo3Piano.querySelector(`[data-midi="${midi}"]`);
}

// Le clavier n'a besoin de couvrir que l'octave des références, élargie de
// l'écart max de chaque côté utilisé. Il grandit donc avec la difficulté.
// forcedCount sert à l'emballement : le clavier grossit alors sans passer par le curseur
function buildExo3Keyboard(forcedCount) {
  if (forcedCount) {
    exo3KeyCount = forcedCount;
  } else {
    const maxGap = Number(exo3Range.value);
    const span = EXO3_REF_SPAN + (exo3Descending.checked ? 2 * maxGap : maxGap);
    exo3KeyCount = Math.min(span, EXO3_MAX_KEYS);
  }

  // On garde Do4 au centre pour que le registre ne dérive pas quand le clavier s'élargit,
  // mais jamais sous le La0 d'un vrai piano : en mode déraisonnable, la moitié basse
  // deviendrait un grondement inaudible au lieu de monter dans les aigus.
  exo3StartMidi = Math.max(
    MIDI_LOWEST_PIANO,
    MIDI_MIDDLE_C - Math.floor((exo3KeyCount - 1) / 2)
  );

  const whites = [];
  const blacks = [];
  for (let i = 0; i < exo3KeyCount; i++) {
    const midi = exo3StartMidi + i;
    (isWhiteKey(midi) ? whites : blacks).push(midi);
  }

  const blackWidth = 0.6 * (100 / whites.length);

  const whiteHtml = whites
    .map(midi => `<button type="button" class="piano-key" data-midi="${midi}"></button>`)
    .join("");

  // Une touche noire se pose sur la frontière entre la blanche du dessous et la suivante.
  // Pour ces degrés, la note juste en dessous est toujours blanche.
  const blackHtml = blacks.map(midi => {
    const boundary = ((whites.indexOf(midi - 1) + 1) / whites.length) * 100;
    const left = boundary - blackWidth / 2;
    return `<button type="button" class="piano-black" data-midi="${midi}"
              style="left:${left.toFixed(3)}%;width:${blackWidth.toFixed(3)}%"></button>`;
  }).join("");

  exo3Piano.innerHTML = `${whiteHtml}<div class="piano-blacks">${blackHtml}</div>`;
}

// Écart réellement praticable : en mode déraisonnable le clavier est plafonné,
// il peut donc être plus étroit que ce que demande le curseur.
function exo3MaxGap() {
  const margin = exo3KeyCount - EXO3_REF_SPAN;
  return Math.max(1, exo3Descending.checked ? Math.floor(margin / 2) : margin);
}

// Changer la difficulté redimensionne le clavier : la manche en cours n'a plus de sens
function resetExo3(rebuild) {
  clearInterval(exo3Interval);
  exo3Interval = null;
  clearTimeout(exo3Timeout);
  exo3Answering = false;

  if (rebuild) buildExo3Keyboard();

  exo3Prompt.textContent = PROMPT_IDLE;
  exo3Feedback.className = "feedback";
  exo3Feedback.textContent = "";
  exo3Timer.textContent = formatElapsed(0);
}

function playExo3Pair() {
  clearTimeout(exo3Timeout);
  playFrequency(midiFrequency(exo3Ref));

  exo3Timeout = setTimeout(() => {
    playFrequency(midiFrequency(exo3Target));

    // Le chrono ne démarre qu'une fois la 2e note jouée : avant, il n'y a rien à chercher.
    if (!exo3Answering) {
      exo3Answering = true;
      exo3StartTime = performance.now();
      exo3Interval = setInterval(() => {
        exo3Timer.textContent = formatElapsed(performance.now() - exo3StartTime);
      }, 10);
    }
  }, EXO3_GAP_DELAY);
}

// Repère en octaves quand l'écart tombe juste : on raisonne plus volontiers ainsi
function refreshExo3Range() {
  const gap = Number(exo3Range.value);
  exo3RangeValue.textContent = gap;
  exo3RangeOctaves.textContent =
    gap % 12 === 0 ? ` · ${gap / 12} octave${gap > 12 ? "s" : ""}` : "";
}

exo3Range.addEventListener("input", () => {
  refreshExo3Range();
  resetExo3(true);
  refreshExo3Secret();
});

// Le sens descendant double la largeur du clavier : la remarque doit suivre
exo3Descending.addEventListener("change", () => {
  resetExo3(true);
  refreshExo3Secret();
});

exo3Button.addEventListener("click", () => {
  resetExo3(false);

  const maxGap = exo3MaxGap();
  const gap = 1 + getRandomInt(maxGap);
  const descending = exo3Descending.checked && getRandomInt(2) === 0;
  const signedGap = descending ? -gap : gap;

  // La référence est tirée dans une bande fixe, qui laisse toujours l'écart maximum
  // disponible de chaque côté utilisé. Sans ça, une référence près d'un bord ne
  // pourrait sortir qu'avec un petit écart et sa position trahirait la réponse.
  const bandStart = exo3StartMidi + (exo3Descending.checked ? maxGap : 0);
  exo3Ref = bandStart + getRandomInt(EXO3_REF_SPAN);
  exo3Target = exo3Ref + signedGap;

  exo3Piano.querySelectorAll("[data-midi]").forEach(key => {
    key.classList.remove("correct", "incorrect", "reference");
  });
  exo3KeyAt(exo3Ref).classList.add("reference");

  exo3Prompt.textContent = midiLabel(exo3Ref);

  playExo3Pair();
});

exo3Replay.addEventListener("click", () => {
  if (exo3Ref !== exo3Target) playExo3Pair();
});

// Délégation : le clavier est régénéré, donc pas d'écouteur par touche
exo3Piano.addEventListener("click", (e) => {
  const key = e.target.closest("[data-midi]");
  if (!key) return;

  const midi = Number(key.dataset.midi);
  playFrequency(midiFrequency(midi));

  if (!exo3Answering) return; // hors manche, le clavier reste jouable librement

  exo3Answering = false;
  clearInterval(exo3Interval);
  exo3Interval = null;

  const isCorrect = midi === exo3Target;
  key.classList.add(isCorrect ? "correct" : "incorrect");
  if (!isCorrect) exo3KeyAt(exo3Target).classList.add("correct");

  const totalTime = performance.now() - exo3StartTime;
  const signedGap = exo3Target - exo3Ref;
  const gapLabel = `${signedGap > 0 ? "+" : ""}${signedGap}`;

  exo3Feedback.textContent = isCorrect
    ? `Correct ! ${gapLabel} demi-tons (${formatElapsed(totalTime)})`
    : `Faux, c'était ${midiLabel(exo3Target)} (${gapLabel} demi-tons)`;
  exo3Feedback.className = `feedback show ${isCorrect ? "correct" : "incorrect"}`;

  exo3Stats.record(totalTime, isCorrect, `${midiLabel(exo3Ref)} ${gapLabel}`);

  key.blur();
});

/* ---------- Mode déraisonnable (code Konami) ---------- */

const EXO3_ABSURD_MAX = 99;

// Paliers indexés sur le NOMBRE DE TOUCHES, pas sur le curseur : avec le sens
// descendant, le même réglage donne un clavier deux fois plus large. Se vanter de
// la taille avant 88 touches n'aurait aucun sens — un piano droit fait mieux.
const PIANO_DE_CONCERT = 88;

const ABSURD_REMARKS = [
  { from: 50, text: "Quatre octaves d'écart. Ce n'est plus de l'oreille relative, c'est de la géographie." },
  { from: PIANO_DE_CONCERT + 1, text: "88 touches dépassées." },
  { from: 100, text: "Ca fait beaucoup là non?." },
  { from: 108, text: "13 kHz. Le chien te déteste." },
  { from: EXO3_MAX_KEYS, text: "16,7 kHz, 112 touches. Le clavier refuse d'aller plus loin." },
];

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
];

let konamiProgress = 0;
let absurdMode = false;

// Lit exo3KeyCount : à appeler après la reconstruction du clavier, pas avant
function refreshExo3Secret() {
  if (!absurdMode) {
    exo3Secret.textContent = "";
    return;
  }
  const match = ABSURD_REMARKS.filter(r => exo3KeyCount >= r.from).pop();
  exo3Secret.textContent = match
    ? match.text
    : "Turbo mode enclenché. Potentiel du curseur : MAXIMUM.";
}

function toggleAbsurdMode() {
  absurdMode = !absurdMode;
  exo3Range.max = absurdMode ? EXO3_ABSURD_MAX : EXO3_SANE_MAX;

  // En repassant en mode sage, un écart hors bornes resterait sinon collé au curseur
  if (!absurdMode && Number(exo3Range.value) > EXO3_SANE_MAX) {
    exo3Range.value = EXO3_SANE_MAX;
  }
  refreshExo3Range();
  resetExo3(true);
  refreshExo3Secret();

  // L'easter egg n'a aucun intérêt si on n'est pas sur le bon onglet
  if (absurdMode) tabs[2].click();
}

document.addEventListener("keydown", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

  if (key === KONAMI[konamiProgress]) {
    konamiProgress++;
    if (konamiProgress === KONAMI.length) {
      konamiProgress = 0;
      toggleAbsurdMode();
    }
  } else {
    // Une frappe ratée peut quand même être le début d'une nouvelle tentative
    konamiProgress = key === KONAMI[0] ? 1 : 0;
  }
});

exo3Range.max = EXO3_SANE_MAX;
refreshExo3Range();
buildExo3Keyboard();
/* ---------- Effondrement du clavier : forcer le curseur au-delà de sa butée ---------- */

const FORCE_DISTANCE = 140;       // px à tirer au-delà du rail pour tout casser
const MELTDOWN_MAX_KEYS = 260;    // au-delà, le DOM rame sans que ça se voie mieux
const MELTDOWN_GROWTH_MS = 1800;

const appMain = document.querySelector("main");
const pianoOverflow = document.querySelector("#Exo3 .piano-overflow");

let exo3ForcePointer = null;
let exo3Force = 0;
let exo3Destroyed = false;

// --force pilote à la fois le tremblement du curseur et la secousse de la page
function setForce(value) {
  exo3Force = Math.max(0, Math.min(2, value));
  document.documentElement.style.setProperty("--force", exo3Force.toFixed(3));
  exo3Range.classList.toggle("forcing", exo3Force > 0.02);

  // Le sifflement n'accompagne que l'effort sur un curseur encore entier
  if (exo3Destroyed) return;

  if (exo3Force > 0.02) {
    startPressure();
    updatePressure(exo3Force);
  } else {
    stopPressure();
  }
}

function sliderAtMax() {
  return Number(exo3Range.value) >= Number(exo3Range.max);
}

// Distance à parcourir au-delà du rail. Sur un téléphone il n'y a pas 140 px
// entre le bout du curseur et le bord de l'écran : le seuil suit la place réelle,
// sans descendre si bas que le geste deviendrait accidentel.
function forceDistance() {
  const room = window.innerWidth - exo3Range.getBoundingClientRect().right - 16;
  return Math.max(60, Math.min(FORCE_DISTANCE, room));
}

function canForce() {
  return absurdMode && !exo3Destroyed;
}

exo3Range.addEventListener("pointerdown", (e) => {
  if (canForce()) exo3ForcePointer = e.pointerId;
});

window.addEventListener("pointermove", (e) => {
  if (exo3ForcePointer !== e.pointerId || exo3Destroyed) return;

  // Une fois la butée atteinte, le curseur n'émet plus d'événement : c'est la
  // distance du pointeur au-delà du rail qui mesure l'acharnement.
  const overshoot = e.clientX - exo3Range.getBoundingClientRect().right;
  setForce(sliderAtMax() && overshoot > 0 ? overshoot / forceDistance() : 0);

  if (exo3Force >= 1) startMeltdown();
});

window.addEventListener("pointerup", () => {
  exo3ForcePointer = null;
  if (!exo3Destroyed) setForce(0);
});

// Au clavier, insister sur la flèche droite produit le même effet
exo3Range.addEventListener("keydown", (e) => {
  if (!canForce() || !sliderAtMax()) return;
  if (e.key !== "ArrowRight" && e.key !== "ArrowUp") return;

  setForce(exo3Force + 0.18);
  if (exo3Force >= 1) startMeltdown();
});

function breakSliderEnd() {
  const rect = exo3Range.getBoundingClientRect();
  const shard = document.createElement("span");
  shard.className = "range-shard";
  shard.style.left = `${rect.right - 20}px`;
  shard.style.top = `${rect.top + rect.height / 2 - 3}px`;
  document.body.appendChild(shard);
  setTimeout(() => shard.remove(), 1200);

  // Le curseur ne répond plus : il part tout seul
  exo3Range.max = 999;
  exo3Range.style.pointerEvents = "none";
}

function startMeltdown() {
  if (exo3Destroyed) return;
  exo3Destroyed = true;
  exo3ForcePointer = null;

  clearInterval(exo3Interval);
  exo3Interval = null;
  clearTimeout(exo3Timeout);
  exo3Answering = false;

  // La pression s'évacue d'un coup : le sifflement cesse, la butée claque
  stopPressure();
  playPop();

  exo3Secret.textContent = "Le rail a cédé.";
  breakSliderEnd();
  pianoOverflow.classList.add("meltdown");
  appMain.classList.add("meltdown-shake");

  runawayGrowth();
}

function runawayGrowth() {
  const startCount = exo3KeyCount;
  const startedAt = performance.now();

  playRumble(MELTDOWN_GROWTH_MS);

  function frame(now) {
    const t = Math.min(1, (now - startedAt) / MELTDOWN_GROWTH_MS);
    const eased = t * t; // l'emballement accélère

    // Aucun son ici : ces notes ne sont plus jouables, seulement spectaculaires
    buildExo3Keyboard(Math.round(startCount + (MELTDOWN_MAX_KEYS - startCount) * eased));

    exo3Range.value = Math.round(EXO3_ABSURD_MAX + (999 - EXO3_ABSURD_MAX) * eased);
    exo3RangeValue.textContent = exo3Range.value;
    exo3RangeOctaves.textContent = "";
    setForce(0.4 + eased * 1.5);

    if (t < 1) requestAnimationFrame(frame);
    else explodePiano();
  }

  requestAnimationFrame(frame);
}

// Pression pendant que l'on force sur le curseur encore intact. Le graphe reste
// ouvert et suit --force en direct : impossible de le jouer sur une durée fixe,
// puisque c'est la main de l'utilisateur qui décide combien de temps ça dure.
let pressureAudio = null;

function startPressure() {
  if (pressureAudio) return;

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.connect(ctx.destination);

  const length = Math.floor(ctx.sampleRate);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 4;
  band.frequency.setValueAtTime(200, now);

  const whistle = ctx.createOscillator();
  const whistleGain = ctx.createGain();
  whistle.type = "sawtooth";
  whistle.frequency.setValueAtTime(60, now);
  whistleGain.gain.value = 0.25;

  noise.connect(band);
  band.connect(master);
  whistle.connect(whistleGain);
  whistleGain.connect(master);

  noise.start(now);
  whistle.start(now);

  pressureAudio = { ctx, master, band, noise, whistle };
}

// setTargetAtTime plutôt qu'une affectation directe : sinon chaque mouvement de
// souris produirait un saut de valeur, donc un craquement.
function updatePressure(force) {
  if (!pressureAudio) return;

  const { ctx, master, band, whistle } = pressureAudio;
  const now = ctx.currentTime;

  master.gain.setTargetAtTime(0.04 + force * 0.42, now, 0.04);
  band.frequency.setTargetAtTime(200 + force * 2800, now, 0.04);
  whistle.frequency.setTargetAtTime(60 + force * 760, now, 0.04);
}

function stopPressure() {
  if (!pressureAudio) return;

  const { ctx, master, noise, whistle } = pressureAudio;
  const now = ctx.currentTime;

  master.gain.cancelScheduledValues(now);
  master.gain.setTargetAtTime(0.0001, now, 0.03);
  noise.stop(now + 0.25);
  whistle.stop(now + 0.25);

  pressureAudio = null;
}

// La butée qui lâche
function playPop() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.75, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
  gain.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(920, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.18);
}

// Grondement du clavier qui s'emballe, jusqu'à la détonation
function playRumble(durationMs) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const duration = durationMs / 1000;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.5, now + duration);
  master.connect(ctx.destination);

  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(90, now);
  lowpass.frequency.exponentialRampToValueAtTime(900, now + duration);

  noise.connect(lowpass);
  lowpass.connect(master);
  noise.start(now);
  noise.stop(now + duration);

  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = "sawtooth";
  sub.frequency.setValueAtTime(26, now);
  sub.frequency.exponentialRampToValueAtTime(70, now + duration);
  subGain.gain.value = 0.3;

  sub.connect(subGain);
  subGain.connect(master);
  sub.start(now);
  sub.stop(now + duration);
}

function playExplosion() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.9, now);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
  master.connect(ctx.destination);

  // Souffle : bruit blanc qui s'assourdit
  const length = Math.floor(ctx.sampleRate * 1.2);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(1800, now);
  lowpass.frequency.exponentialRampToValueAtTime(120, now + 1.2);

  noise.connect(lowpass);
  lowpass.connect(master);
  noise.start(now);

  // Détonation : sinus grave qui plonge
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + 0.7);
  oscGain.gain.setValueAtTime(0.8, now);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

  osc.connect(oscGain);
  oscGain.connect(master);
  osc.start(now);
  osc.stop(now + 0.9);
}

function explodePiano() {
  playExplosion();

  const flash = document.createElement("div");
  flash.className = "explosion-flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);

  // Trajectoire propre à chaque touche, lue par les keyframes
  exo3Piano.querySelectorAll("[data-midi]").forEach(key => {
    key.style.setProperty("--dx", `${getRandomInt(2400) - 1200}px`);
    key.style.setProperty("--dy", `${getRandomInt(500) - 420}px`);
    key.style.setProperty("--rot", `${getRandomInt(1440) - 720}deg`);
    key.classList.add("piano-shard");
  });

  // Le cratère est posé dans le même souffle : flash et éclats couvrent son
  // apparition, il est donc déjà en place quand la lumière retombe.
  placeCrater();

  setTimeout(() => {
    appMain.classList.remove("meltdown-shake");
    setForce(0);
  }, 400);

  setTimeout(clearPianoRemains, 1300);
}

function clearPianoRemains() {
  exo3Piano.style.display = "none";
  exo3Secret.textContent = "";
  exo3Button.disabled = true;
  exo3Replay.disabled = true;

  // La consigne pointerait un clavier qui n'existe plus
  const hint = document.querySelector("#Exo3 .piano-hint");
  if (hint) hint.style.display = "none";
}

function placeCrater() {
  const crater = document.createElement("div");
  crater.className = "crater";
  crater.innerHTML = `
    <svg viewBox="0 0 400 210" role="img" aria-label="Cratère fumant">
      <defs>
        <radialGradient id="craterFill" cx="50%" cy="45%">
          <stop offset="0%" stop-color="#05050a"/>
          <stop offset="55%" stop-color="#13131f"/>
          <stop offset="100%" stop-color="#2c2c3d"/>
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="115" rx="178" ry="72" fill="url(#craterFill)"/>
      <ellipse cx="200" cy="108" rx="138" ry="50" fill="#07070d" opacity="0.92"/>
      <g stroke="#3a3a4e" stroke-width="2.5" fill="none" stroke-linecap="round">
        <path d="M62 98 L16 68"/>
        <path d="M124 64 L104 24"/>
        <path d="M216 56 L230 14"/>
        <path d="M302 76 L344 44"/>
        <path d="M348 122 L394 116"/>
        <path d="M256 166 L282 200"/>
        <path d="M142 166 L120 200"/>
      </g>
    </svg>
    <p>J'espère que tu es fier, tu as cassé mon exercice.</p>
  `;

  // Ancré là où était le clavier, pas sur l'écran : il doit défiler avec l'exercice
  pianoOverflow.appendChild(crater);
}

/* ---------- Déclencheur tactile : 7 tapes rapides sur le titre ---------- */

// Le code Konami suppose un clavier physique. Les glissés seraient thématiques
// mais entreraient en conflit avec le défilement de la page, et l'accéléromètre
// réclame une autorisation explicite sur iOS. La tape sur le titre marche partout.
const TITLE_TAPS_NEEDED = 7;
const TITLE_TAP_WINDOW = 900; // ms au-delà desquelles la série repart de zéro

const appTitle = document.querySelector(".app-header h1");
let titleTaps = 0;
let titleTapTimer = null;

function resetTitleTaps() {
  titleTaps = 0;
  appTitle.classList.remove("title-nudge");
}

// pointerdown plutôt que click : il part dès le contact, avant que le navigateur
// n'enclenche sélection ou menu contextuel, et preventDefault coupe court à ceux-ci.
appTitle.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  titleTaps++;

  clearTimeout(titleTapTimer);
  titleTapTimer = setTimeout(resetTitleTaps, TITLE_TAP_WINDOW);

  if (titleTaps >= TITLE_TAPS_NEEDED) {
    resetTitleTaps();
    toggleAbsurdMode();
    return;
  }

  // Indice discret à mi-parcours : le titre frémit, sans rien dévoiler
  if (titleTaps >= 4) {
    appTitle.classList.remove("title-nudge");
    void appTitle.offsetWidth; // force le redémarrage de l'animation
    appTitle.classList.add("title-nudge");
  }
});
