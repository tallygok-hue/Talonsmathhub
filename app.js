const state = {
  score: 0,
  timeLeft: 45,
  running: false,
  answer: null,
  timerId: null,
};

const el = {
  problem: document.getElementById("problem"),
  answer: document.getElementById("answer"),
  submit: document.getElementById("submit"),
  start: document.getElementById("start"),
  reset: document.getElementById("reset"),
  score: document.getElementById("score"),
  timer: document.getElementById("timer"),
  feedback: document.getElementById("feedback"),
  search: document.getElementById("search"),
  cards: Array.from(document.querySelectorAll(".card")),
  filters: Array.from(document.querySelectorAll(".filter")),
};

function newProblem() {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const operator = Math.random() < 0.5 ? "+" : "-";
  state.answer = operator === "+" ? a + b : a - b;
  el.problem.textContent = `${a} ${operator} ${b} = ?`;
}

function setFeedback(message, tone = "") {
  el.feedback.textContent = message;
  el.feedback.className = `feedback ${tone}`.trim();
}

function updateStats() {
  el.score.textContent = `Score: ${state.score}`;
  el.timer.textContent = `Time: ${state.timeLeft}s`;
}

function stopRound() {
  state.running = false;
  clearInterval(state.timerId);
  state.timerId = null;
  setFeedback(`Round complete. Final score: ${state.score}`);
}

function startRound() {
  if (state.running) return;
  state.running = true;
  state.score = 0;
  state.timeLeft = 45;
  updateStats();
  setFeedback("Go!", "good");
  newProblem();
  el.answer.value = "";
  el.answer.focus();

  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    updateStats();
    if (state.timeLeft <= 0) {
      stopRound();
    }
  }, 1000);
}

function resetRound() {
  clearInterval(state.timerId);
  state.running = false;
  state.score = 0;
  state.timeLeft = 45;
  state.answer = null;
  el.problem.textContent = "Press start to generate a question.";
  el.answer.value = "";
  setFeedback("Round reset.");
  updateStats();
}

function submitAnswer() {
  if (!state.running) {
    setFeedback("Press Start Round first.", "bad");
    return;
  }

  const value = Number(el.answer.value);
  if (!Number.isFinite(value)) {
    setFeedback("Enter a number.", "bad");
    return;
  }

  if (value === state.answer) {
    state.score += 1;
    setFeedback("Correct!", "good");
    updateStats();
    newProblem();
    el.answer.value = "";
  } else {
    setFeedback("Not quite, try the next one.", "bad");
    newProblem();
    el.answer.value = "";
  }
}

function applyFilters() {
  const active = el.filters.find((btn) => btn.classList.contains("active"));
  const filter = active ? active.dataset.filter : "all";
  const search = el.search.value.trim().toLowerCase();

  el.cards.forEach((card) => {
    const typeOk = filter === "all" || card.dataset.type === filter;
    const searchOk = card.dataset.name.toLowerCase().includes(search);
    card.classList.toggle("hidden", !(typeOk && searchOk));
  });
}

el.start.addEventListener("click", startRound);
el.reset.addEventListener("click", resetRound);
el.submit.addEventListener("click", submitAnswer);
el.answer.addEventListener("keydown", (event) => {
  if (event.key === "Enter") submitAnswer();
});

el.search.addEventListener("input", applyFilters);
el.filters.forEach((button) => {
  button.addEventListener("click", () => {
    el.filters.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    applyFilters();
  });
});

updateStats();
