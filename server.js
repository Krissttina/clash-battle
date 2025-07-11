const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 3000;
const path = require('path');

const VOTE_END_TIME = new Date(Date.now() + 30 * 1000); // 30 seconds from now

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Настройка на папката със статични файлове
app.use(express.static(path.join(__dirname, 'public')));

// Когато се посети "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Load or initialize votes
let votes = { A: 0, B: 0 };
const votesFile = "./votes.json";

if (fs.existsSync(votesFile)) {
  votes = JSON.parse(fs.readFileSync(votesFile, "utf-8"));
}

// Save votes to file
function saveVotes() {
  fs.writeFileSync(votesFile, JSON.stringify(votes));
}

// Handle vote
app.post("/vote", (req, res) => {
  const { option } = req.body;
  if (option !== "A" && option !== "B") {
    return res.status(400).json({ error: "Invalid vote" });
  }
  votes[option]++;
  saveVotes();
  res.json({ message: "Vote counted!" });
});

//Expose VOTE_END_TIME
app.get("/end-time", (req, res) => {
  res.json({ endTime: VOTE_END_TIME });
});

// Get results (only if voting has ended)
app.get("/results", (req, res) => {
  const now = new Date();
  if (now > VOTE_END_TIME) {
   res.json(votes); 
  }else{
    return res.status(403).json({ message: "Results not available yet." });
  } 
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});