const gameGrid = document.getElementById('game-grid');
const scoreDisplay = document.getElementById('score');
let score = 0;
let pacmanPosition = { x: 9, y: 9 };
const gridSize = 20;
const dots = [];
const ghosts = [
  { x: 5, y: 5, color: 'ghost-1' },
  { x: 15, y: 5, color: 'ghost-2' },
  { x: 5, y: 15, color: 'ghost-3' },
  { x: 15, y: 15, color: 'ghost-4' },
];
let gameInterval;
let foodSpawnInterval;

// Create the game grid
function createGrid() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.id = `cell-${x}-${y}`;
      gameGrid.appendChild(cell);

      // Add initial dots to the grid
      if (Math.random() > 0.7 && !(x === pacmanPosition.x && y === pacmanPosition.y)) {
        dots.push({ x, y });
      }
    }
  }
}

// Render the game state
function render() {
  // Clear the grid
  document.querySelectorAll('.cell').forEach(cell => {
    cell.innerHTML = '';
    cell.classList.remove('pacman', 'ghost-1', 'ghost-2', 'ghost-3', 'ghost-4', 'dot');
  });

  // Render Pac-Man
  const pacmanCell = document.getElementById(`cell-${pacmanPosition.x}-${pacmanPosition.y}`);
  pacmanCell.classList.add('pacman');

  // Render Ghosts
  ghosts.forEach(ghost => {
    const ghostCell = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
    ghostCell.classList.add('ghost', ghost.color);
  });

  // Render Dots
  dots.forEach(dot => {
    const dotCell = document.getElementById(`cell-${dot.x}-${dot.y}`);
    const dotElement = document.createElement('div');
    dotElement.classList.add('dot');
    dotCell.appendChild(dotElement);
  });

  // Check for dot collection
  const dotIndex = dots.findIndex(dot => dot.x === pacmanPosition.x && dot.y === pacmanPosition.y);
  if (dotIndex !== -1) {
    dots.splice(dotIndex, 1);
    score++;
    scoreDisplay.textContent = `Score: ${score}`;

    // Check if all dots are eaten
    if (dots.length === 0) {
      endGame(true); // Player wins
    }
  }

  // Check for ghost collision
  const isCollision = ghosts.some(ghost => ghost.x === pacmanPosition.x && ghost.y === pacmanPosition.y);
  if (isCollision) {
    endGame(false); // Player loses
  }
}

// Move Pac-Man
function movePacman(event) {
  switch (event.key) {
    case 'ArrowUp':
      if (pacmanPosition.y > 0) pacmanPosition.y--;
      break;
    case 'ArrowDown':
      if (pacmanPosition.y < gridSize - 1) pacmanPosition.y++;
      break;
    case 'ArrowLeft':
      if (pacmanPosition.x > 0) pacmanPosition.x--;
      break;
    case 'ArrowRight':
      if (pacmanPosition.x < gridSize - 1) pacmanPosition.x++;
      break;
  }
  render();
}

// Move Ghosts (simple AI)
function moveGhosts() {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  ghosts.forEach(ghost => {
    const direction = directions[Math.floor(Math.random() * directions.length)];
    ghost.x += direction.x;
    ghost.y += direction.y;

    // Keep ghosts within bounds
    ghost.x = Math.max(0, Math.min(gridSize - 1, ghost.x));
    ghost.y = Math.max(0, Math.min(gridSize - 1, ghost.y));
  });
  render();
}

// Spawn new food randomly
function spawnFood() {
  if (dots.length < 50) { // Limit the number of dots
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    if (!dots.some(dot => dot.x === x && dot.y === y) && !(x === pacmanPosition.x && y === pacmanPosition.y)) {
      dots.push({ x, y });
    }
  }
}

// End the game
function endGame(isWin) {
  clearInterval(gameInterval);
  clearInterval(foodSpawnInterval);
  if (isWin) {
    alert('You Win!');
  } else {
    alert('Game Over!');
  }
  resetGame();
}

// Reset the game
function resetGame() {
  pacmanPosition = { x: 9, y: 9 };
  ghosts.forEach((ghost, index) => {
    ghost.x = [5, 15, 5, 15][index];
    ghost.y = [5, 5, 15, 15][index];
  });
  dots.length = 0;
  score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  createGrid();
  render();
  startGame();
}

// Start the game
function startGame() {
  gameInterval = setInterval(moveGhosts, 300); // Ghosts move every 300ms
  foodSpawnInterval = setInterval(spawnFood, 2000); // Spawn food every 2 seconds
}

// Initialize the game
createGrid();
render();
document.addEventListener('keydown', movePacman);
startGame();