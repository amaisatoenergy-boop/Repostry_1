const gridSize = 5;
let agent = {x: 0, y: 0};
let goal = {x: 0, y: 0};
let level = 0, fails = 0, success = 0;

let qTable = {};

// استرجاع التعلم السابق من LocalStorage
if (localStorage.getItem("qTable")) {
  qTable = JSON.parse(localStorage.getItem("qTable"));
  level = parseInt(localStorage.getItem("level") || 0);
  fails = parseInt(localStorage.getItem("fails") || 0);
  success = parseInt(localStorage.getItem("success") || 0);
}

const gridEl = document.getElementById("grid");
const levelEl = document.getElementById("level");
const failsEl = document.getElementById("fails");
const successEl = document.getElementById("success");

function initGrid() {
  gridEl.innerHTML = "";
  gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (x === agent.x && y === agent.y) cell.classList.add("agent");
      if (x === goal.x && y === goal.y) cell.classList.add("goal");
      gridEl.appendChild(cell);
    }
  }
}

// توليد موقع عشوائي مختلف
function randomPos(exclude={}) {
  let x,y;
  do {
    x = Math.floor(Math.random()*gridSize);
    y = Math.floor(Math.random()*gridSize);
  } while (x===exclude.x && y===exclude.y);
  return {x,y};
}

// اختيار حركة من Q-Table
function chooseAction(state) {
  if (!qTable[state]) qTable[state] = [0,0,0,0]; // [up,down,left,right]
  if (Math.random() < 0.2) return Math.floor(Math.random()*4); // استكشاف
  return qTable[state].indexOf(Math.max(...qTable[state]));
}

function moveAgent() {
  const state = `${agent.x},${agent.y}`;
  const action = chooseAction(state);

  let oldX = agent.x, oldY = agent.y;
  if (action===0 && agent.y>0) agent.y--;        // up
  if (action===1 && agent.y<gridSize-1) agent.y++; // down
  if (action===2 && agent.x>0) agent.x--;        // left
  if (action===3 && agent.x<gridSize-1) agent.x++; // right

  const newState = `${agent.x},${agent.y}`;
  if (!qTable[newState]) qTable[newState] = [0,0,0,0];

  let reward = -0.1;
  if (agent.x===goal.x && agent.y===goal.y) reward = 50;

  // تحديث Q-Table
  qTable[state][action] += 0.5 * (reward + 0.9*Math.max(...qTable[newState]) - qTable[state][action]);

  if (reward===50) {
    success++;
    level++;
    resetGame();
  } else if (oldX===agent.x && oldY===agent.y) {
    fails++;
  }

  initGrid();
  updateStats();
  saveProgress();
}

function updateStats() {
  levelEl.textContent = level;
  failsEl.textContent = fails;
  successEl.textContent = success;
}

function saveProgress() {
  localStorage.setItem("qTable", JSON.stringify(qTable));
  localStorage.setItem("level", level);
  localStorage.setItem("fails", fails);
  localStorage.setItem("success", success);
}

function resetGame() {
  agent = randomPos();
  goal = randomPos(agent);
}

// زر مسح التعلم
document.getElementById("reset").onclick = () => {
  localStorage.clear();
  qTable = {};
  level = fails = success = 0;
  resetGame();
  initGrid();
  updateStats();
};

resetGame();
initGrid();
updateStats();

// تشغيل دائم
setInterval(moveAgent, 100);
