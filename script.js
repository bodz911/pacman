const gameGrid = document.getElementById('game-grid');
const scoreDisplay = document.getElementById('score');
const pacman = document.getElementById('pacman');
const ghostsContainer = document.getElementById('ghosts');
let score = 0;
let pacmanPosition = { x: 12, y: 12 };
const gridSize = 25;
const dots = [];
const ghosts = [
  { x: 5, y: 5, color: '👻', element: null },
  { x: 20, y: 5, color: '👾', element: null },
  { x: 5, y: 20, color: '💀', element: null },
  { x: 20, y: 20, color: '👹', element: null }
];
let gameInterval;
let foodSpawnInterval;
let lastTimestamp = 0;
const frameRate = 60; // Target FPS

// Maze walls
const walls = [
  // Borders
  ...Array.from({ length: gridSize }, (_, i) => ({ x: 0, y: i })),
  ...Array.from({ length: gridSize }, (_, i) => ({ x: gridSize - 1, y: i })),
  ...Array.from({ length: gridSize }, (_, i) => ({ x: i, y: 0 })),
  ...Array.from({ length: gridSize }, (_, i) => ({ x: i, y: gridSize - 1 })),

  // Inner walls
  { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 },
  { x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 },
  { x: 15, y: 15 }, { x: 15, y: 16 }, { x: 15, y: 17 },
  { x: 20, y: 5 }, { x: 20, y: 6 }, { x: 20, y: 7 },
];

// Create the game grid with walls
function createGrid() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.id = `cell-${x}-${y}`;
      gameGrid.appendChild(cell);

      // Add walls
      if (walls.some(wall => wall.x === x && wall.y === y)) {
        cell.classList.add('wall');
      } 
      // Add dots
      else if (Math.random() > 0.7 && !(x === pacmanPosition.x && y === pacmanPosition.y)) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.id = `dot-${x}-${y}`;
        cell.appendChild(dot);
        dots.push({ x, y, element: dot });
      }
    }
  }

  // Create ghost elements
  ghosts.forEach((ghost, index) => {
    const ghostElement = document.createElement('div');
    ghostElement.classList.add('entity', 'ghost');
    ghostElement.textContent = ghost.color;
    ghostElement.id = `ghost-${index}`;
    ghostsContainer.appendChild(ghostElement);
    ghost.element = ghostElement;
    updatePosition(ghostElement, ghost.x, ghost.y);
  });

  // Position Pac-Man
  updatePosition(pacman, pacmanPosition.x, pacmanPosition.y);
}

// Update position with smooth transition
function updatePosition(element, x, y) {
  element.style.transform = `translate(${x * 25}px, ${y * 25}px)`;
}

// Game loop for smooth animation
function gameLoop(timestamp) {
  if (timestamp - lastTimestamp >= 1000 / frameRate) {
    lastTimestamp = timestamp;
    moveGhosts();
    checkCollisions();
  }
  requestAnimationFrame(gameLoop);
}

// Check collisions
function checkCollisions() {
  // Check for dot collection
  const dotIndex = dots.findIndex(dot => dot.x === pacmanPosition.x && dot.y === pacmanPosition.y);
  if (dotIndex !== -1) {
    const dot = dots[dotIndex];
    dot.element.remove();
    dots.splice(dotIndex, 1);
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    
    if (dots.length === 0) endGame(true);
  }

  // Check for ghost collision
  if (ghosts.some(ghost => ghost.x === pacmanPosition.x && ghost.y === pacmanPosition.y)) {
    endGame(false);
  }
}

// Move Pac-Man
function movePacman(event) {
  let newX = pacmanPosition.x;
  let newY = pacmanPosition.y;

  switch (event.key) {
    case 'ArrowUp': newY--; break;
    case 'ArrowDown': newY++; break;
    case 'ArrowLeft': newX--; break;
    case 'ArrowRight': newX++; break;
    default: return;
  }

  // Check if new position is valid
  const cell = document.getElementById(`cell-${newX}-${newY}`);
  if (cell && !cell.classList.contains('wall')) {
    pacmanPosition.x = newX;
    pacmanPosition.y = newY;
    updatePosition(pacman, newX, newY);
    checkCollisions();
  }
}

// Ghost movement
function moveGhosts() {
  const directions = [
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
  ];
  
  ghosts.forEach(ghost => {
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const newX = ghost.x + direction.x;
    const newY = ghost.y + direction.y;
    
    const cell = document.getElementById(`cell-${newX}-${newY}`);
    if (cell && !cell.classList.contains('wall')) {
      ghost.x = newX;
      ghost.y = newY;
      updatePosition(ghost.element, newX, newY);
    }
  });
}

// Spawn new food
function spawnFood() {
  if (dots.length < 75) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const cell = document.getElementById(`cell-${x}-${newY}`);
    
    if (cell && !cell.classList.contains('wall') && 
        !dots.some(dot => dot.x === x && dot.y === y) &&
        !ghosts.some(ghost => ghost.x === x && ghost.y === y)) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dot.id = `dot-${x}-${y}`;
      cell.appendChild(dot);
      dots.push({ x, y, element: dot });
    }
  }
}

// End game
function endGame(isWin) {
  cancelAnimationFrame(gameLoop);
  clearInterval(foodSpawnInterval);
  alert(isWin ? "YOU WIN! 🎉" : "GAME OVER! 💀");
  resetGame();
}

// Reset game
function resetGame() {
  // Clear the board
  dots.forEach(dot => dot.element.remove());
  dots.length = 0;
  
  // Reset positions
  pacmanPosition = { x: 12, y: 12 };
  updatePosition(pacman, pacmanPosition.x, pacmanPosition.y);
  
  ghosts.forEach((ghost, i) => {
    ghost.x = [5, 20, 5, 20][i];
    ghost.y = [5, 5, 20, 20][i];
    updatePosition(ghost.element, ghost.x, ghost.y);
  });
  
  // Reset score
  score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  
  // Recreate dots
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!walls.some(wall => wall.x === x && wall.y === y) &&
          !(x === pacmanPosition.x && y === pacmanPosition.y) &&
          Math.random() > 0.7) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.id = `dot-${x}-${y}`;
        document.getElementById(`cell-${x}-${y}`).appendChild(dot);
        dots.push({ x, y, element: dot });
      }
    }
  }
  
  // Restart game loop
  lastTimestamp = 0;
  requestAnimationFrame(gameLoop);
  foodSpawnInterval = setInterval(spawnFood, 2000);
}

// Initialize game
createGrid();
document.addEventListener('keydown', movePacman);
resetGame();