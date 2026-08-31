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

function getNote(Note) {
  newNote = gamme[getRandomInt(7)];

  return newNote == Note ? getNote(Note) : newNote; 
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
let exo1HistoryEl = document.querySelector("#exo1History");
let gamme = ["do","ré","mi","fa","sol","la","si"]
let exo1previousNote = null;
let exo1actualNote= null
let exo1SplitTime = 0;
let exo1AscendingCorrect = false;

const EXO1_BEST_TIME_KEY = "musicTrain_exo1_bestTime";
const EXO1_HISTORY_KEY = "musicTrain_exo1_history";
const EXO1_HISTORY_LIMIT = 5;

function loadExo1History() {
  try {
    return JSON.parse(localStorage.getItem(EXO1_HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function renderExo1HighScore() {
  const bestTime = localStorage.getItem(EXO1_BEST_TIME_KEY);
  exo1HighScoreEl.textContent = bestTime ? formatElapsed(Number(bestTime)) : "—";
}

function renderExo1History() {
  const history = loadExo1History();

  exo1HistoryEl.innerHTML = history.map(entry => `
    <li class="history-item ${entry.correct ? "correct" : "incorrect"}">
      <span>${entry.time} · ${entry.note}</span>
      <span class="history-time">${entry.correct ? formatElapsed(entry.totalMs) : "Faux"}</span>
    </li>
  `).join("");
}

function recordExo1Session(totalMs, isCorrect, note) {
  const history = loadExo1History();
  history.unshift({
    totalMs,
    correct: isCorrect,
    note: note.charAt(0).toUpperCase() + note.slice(1),
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });
  localStorage.setItem(EXO1_HISTORY_KEY, JSON.stringify(history.slice(0, EXO1_HISTORY_LIMIT)));

  if (isCorrect) {
    const bestTime = Number(localStorage.getItem(EXO1_BEST_TIME_KEY));
    if (!bestTime || totalMs < bestTime) {
      localStorage.setItem(EXO1_BEST_TIME_KEY, String(totalMs));
    }
  }

  renderExo1HighScore();
  renderExo1History();
}

renderExo1HighScore();
renderExo1History();

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
  if (e.key !== "Enter") return;
  if (e.target === exo1AnswerUp || e.target === exo1AnswerDown) return;
  if (!document.getElementById("Arpege1").classList.contains("active-panel")) return;

  exo1Button.click();
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

  recordExo1Session(totalTime, isCorrect, exo1RNote.innerHTML);

  exo1AnswerDown.blur();
});