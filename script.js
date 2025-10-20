const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let ghosts = [];
let score = 0;
let gameRunning = false;
let difficultyTimer = 0;

// Imágenes
const ghost1 = new Image();
ghost1.src = 'assets/ghost1.png';

// Audios
const bgMusic = new Audio('assets/bg-music.mp3');
const startSound = new Audio('assets/start.mp3');
const killSound = new Audio('assets/kill.mp3');
bgMusic.loop = true;

// Crear varios fantasmas
function spawnGhosts(count = 15) {
  ghosts = [];
  for (let i = 0; i < count; i++) {
    ghosts.push(newGhost());
  }
}

function newGhost() {
  const size = Math.random() * 30 + 40;
  return {
    x: Math.random() * (canvas.width - size),
    y: Math.random() * (canvas.height - size),
    dx: (Math.random() - 0.5) * 3,
    dy: (Math.random() - 0.5) * 3,
    width: size,
    height: size,
    visible: true,
    animating: false,
    speedBoost: 1
  };
}

function showCountdown() {
  const overlay = document.createElement('div');
  overlay.id = 'countdown';
  overlay.style.position = 'absolute';
  overlay.style.top = '50%';
  overlay.style.left = '50%';
  overlay.style.transform = 'translate(-50%, -50%)';
  overlay.style.color = 'yellow';
  overlay.style.fontSize = '80px';
  overlay.style.fontWeight = 'bold';
  overlay.style.textShadow = '0 0 20px orange';
  document.body.appendChild(overlay);

  const steps = ['3', '2', '1', 'GO!'];
  let i = 0;
  startSound.play();

  const interval = setInterval(() => {
    if (i < steps.length) {
      overlay.textContent = steps[i];
      i++;
    } else {
      clearInterval(interval);
      overlay.remove();
      startGame();
    }
  }, 1000);
}

function startGame() {
  gameRunning = true;
  score = 0;
  document.getElementById('score').innerText = "Puntuación: 0";
  bgMusic.play();
  spawnGhosts(15);
  updateGame();
  increaseDifficulty();
}

canvas.addEventListener('click', (e) => {
  if (!gameRunning) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ghosts.forEach((g) => {
    if (!g.visible || g.animating) return;

    if (x > g.x && x < g.x + g.width && y > g.y && y < g.y + g.height) {
      g.visible = false;
      g.animating = true;
      score += 10;
      document.getElementById('score').innerText = "Puntuación: " + score;
      killSound.play();
      animateGhost2(g.x, g.y, g.width, () => {
        g.visible = true;
        g.animating = false;
        g.x = Math.random() * (canvas.width - g.width);
        g.y = Math.random() * (canvas.height - g.height);
      });
    }
  });
});

function animateGhost2(x, y, size, callback) {
  let opacity = 1;
  const anim = setInterval(() => {
    ctx.globalAlpha = opacity;
    ctx.drawImage(ghost2, x - 5, y - 5, size + 10, size + 10);
    ctx.globalAlpha = 1.0;
    opacity -= 0.08;
    if (opacity <= 0) {
      clearInterval(anim);
      callback();
    }
  }, 40);
}

function updateGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ghosts.forEach((g) => {
    if (g.visible && !g.animating) {
      g.x += g.dx * g.speedBoost;
      g.y += g.dy * g.speedBoost;

      // Rebotes
      if (g.x < 0 || g.x > canvas.width - g.width) g.dx *= -1;
      if (g.y < 0 || g.y > canvas.height - g.height) g.dy *= -1;

      ctx.drawImage(ghost1, g.x, g.y, g.width, g.height);
    }
  });

  requestAnimationFrame(updateGame);
}

// Dificultad progresiva
function increaseDifficulty() {
  setInterval(() => {
    if (!gameRunning) return;

    difficultyTimer++;

    // Cada 10 segundos, aumenta la dificultad
    if (difficultyTimer % 10 === 0) {
      ghosts.forEach((g) => {
        g.speedBoost += 0.2;
      });
      if (ghosts.length < 25) {
        ghosts.push(newGhost());
      }
    }
  }, 1000);
}

// Mostrar modal inicial
window.onload = () => {
  const modal = new bootstrap.Modal(document.getElementById('instructionsModal'));
  modal.show();

  document.getElementById('startButton').addEventListener('click', () => {
    modal.hide();
    showCountdown();
  });
};
