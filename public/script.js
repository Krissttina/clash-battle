const btnA = document.getElementById("btnA");
const btnB = document.getElementById("btnB");
const message = document.getElementById("message");
const results = document.getElementById("results");

// Disable if already voted
if (localStorage.getItem("voted")) {
  disableButtons();
  message.textContent = "You already voted.";
}

btnA.addEventListener("click", () => vote("A"));
btnB.addEventListener("click", () => vote("B"));

function vote(option) {
  if (localStorage.getItem("voted")) return;

  fetch("/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ option }),
  })
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("voted", option);
      message.textContent = `You voted for Option ${option}`;
      disableButtons();
    });
}

function disableButtons() {
  btnA.disabled = true;
  btnB.disabled = true;
  btnA.classList.add("disabled");
  btnB.classList.add("disabled");
}

// Poll for results every 10 seconds
setInterval(() => {
  fetch("/results")
    .then((res) => {
      if (!res.ok) throw new Error("No results yet");
      return res.json();
    })
    .then((data) => {
      results.innerHTML = `Results:<br>Option A: ${data.A}<br>Option B: ${data.B}`;
    })
    .catch(() => {
        document.getElementById("results").textContent = "Results will be available soon.";
    });
}, 10000);

//Timer count down
function startCountdown(endTime) {
  function updateCountdown() {
    const now = new Date();
    const timeLeft = new Date(endTime) - now;

    if (timeLeft <= 0) {
      document.getElementById("countdown").textContent = "Voting has ended.";
      clearInterval(timer);
      return;
    }

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    document.getElementById(
      "countdown"
    ).textContent = `Results will be available in ${minutes}m ${seconds}s`;
  }

  updateCountdown(); // initial call
  const timer = setInterval(updateCountdown, 1000);
}

fetch("/end-time")
  .then((res) => res.json())
  .then((data) => startCountdown(data.endTime));
