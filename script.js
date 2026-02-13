document.addEventListener('DOMContentLoaded', () => {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', function () {
            tabLinks.forEach(el => el.classList.remove('active'));
            tabContents.forEach(el => el.classList.remove('active'));

            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const target = document.getElementById(tabId);

            if (target) {
                target.classList.add('active');
            }
        });
    });
});

// ================= LOADING SCREEN =================

document.body.classList.add("loading");

const loader = document.getElementById("loader");
const progress = document.querySelector(".progress");
const percentageText = document.querySelector(".percentage");

let percent = 0;

const interval = setInterval(() => {
  percent++;
  progress.style.width = percent + "%";
  percentageText.textContent = percent + "%";

  if (percent >= 100) {
    clearInterval(interval);

    setTimeout(() => {
      loader.classList.add("hidden");
      document.body.classList.remove("loading");
    }, 500);
  }
}, 20);

document.addEventListener("DOMContentLoaded", function () {

  const searchInput = document.getElementById("gameSearch");
  const resultsContainer = document.getElementById("searchResults");

  if (!searchInput) return;

  function fuzzyMatch(text, search) {
    text = text.toLowerCase();
    search = search.toLowerCase();

    let t = 0;
    for (let s = 0; s < search.length; s++) {
      t = text.indexOf(search[s], t);
      if (t === -1) return false;
      t++;
    }
    return true;
  }

  searchInput.addEventListener("input", function () {
    const value = this.value.trim().toLowerCase();
    resultsContainer.innerHTML = "";

    if (!value) {
      resultsContainer.style.display = "none";
      return;
    }

    let matches = [];

    const gameCards = document.querySelectorAll(".game-card");

    gameCards.forEach(card => {

      const titleElement = card.querySelector("h3");
      if (!titleElement) return;

      const title = titleElement.textContent;

      if (fuzzyMatch(title, value)) {
        matches.push({ title, element: card });
      }
    });

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<div class="no-result">Nie znaleziono gry</div>`;
    } else {
      matches.forEach(match => {
        const div = document.createElement("div");
        div.classList.add("result-item");
        div.textContent = match.title;

        div.addEventListener("click", () => {
          match.element.scrollIntoView({ behavior: "smooth", block: "center" });
match.element.classList.add("highlighted");

setTimeout(() => {
  match.element.classList.remove("highlighted");
}, 9000);  // świeci 4 sekundy – możesz zmienić na 3000 lub 5000

          resultsContainer.style.display = "none";
          searchInput.value = match.title;
        });

        resultsContainer.appendChild(div);
      });
    }

    resultsContainer.style.display = "block";
  });

});

document.addEventListener("DOMContentLoaded", () => {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const searchContainer = document.querySelector('.search-container');

    function updateSearchVisibility(tabId) {
        if (tabId === "menu") {
            searchContainer.style.display = "none";
        } else {
            searchContainer.style.display = "block";
        }
    }

    // 🔹 USTAWIENIE NA START (pierwsze wejście na stronę)
    const activeTab = document.querySelector('.tab-link.active');
    if (activeTab) {
        updateSearchVisibility(activeTab.getAttribute('data-tab'));
    }

    // 🔹 Obsługa przełączania zakładek
    tabLinks.forEach(link => {
        link.addEventListener('click', function () {
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            updateSearchVisibility(tabId);
        });
    });
});

// ================= CRACK BIRD MINIGRA =================

let bestScore = localStorage.getItem('crackBirdHighScore') || 0;
document.getElementById('bestScore').textContent = bestScore;
document.getElementById('highScore').textContent = bestScore;

function openGame() {
  document.getElementById('gameOverlay').style.display = 'flex';
  initGame();
}

function closeGame() {
  document.getElementById('gameOverlay').style.display = 'none';
}

// Logika gry
let canvas, ctx, bird, pipes, score, gameOver, frame;

function initGame() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  bird = { x: 100, y: 300, size: 30, velocity: 0, gravity: 0.5, lift: -10 };
  pipes = [];
  score = 0;
  gameOver = false;
  frame = 0;

  document.getElementById('score').textContent = score;

  // Skok spacja lub klik
  const jump = () => {
    if (!gameOver) bird.velocity = bird.lift;
  };

  document.addEventListener('keydown', e => { if (e.code === 'Space') jump(); });
  canvas.addEventListener('click', jump);

  gameLoop();
}

function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ptak
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  ctx.fillStyle = '#f899ff';
  ctx.fillRect(bird.x - bird.size/2, bird.y - bird.size/2, bird.size, bird.size);

  // Rury
  if (frame % 90 === 0) {
    const gap = 150;
    const height = Math.random() * (canvas.height - gap - 200) + 100;
    pipes.push({ x: canvas.width, top: height, bottom: canvas.height - height - gap, width: 60 });
  }

  pipes.forEach((p, i) => {
    p.x -= 2;

    ctx.fillStyle = '#ff2eff';
    ctx.fillRect(p.x, 0, p.width, p.top);              // górna rura
    ctx.fillRect(p.x, canvas.height - p.bottom, p.width, p.bottom); // dolna rura

    // Kolizja
    if (
      bird.x + bird.size/2 > p.x &&
      bird.x - bird.size/2 < p.x + p.width &&
      (bird.y - bird.size/2 < p.top || bird.y + bird.size/2 > canvas.height - p.bottom)
    ) {
      gameOver = true;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('crackBirdHighScore', bestScore);
        document.getElementById('bestScore').textContent = bestScore;
        document.getElementById('highScore').textContent = bestScore;
      }
      alert(`Game Over! Wynik: ${score}\nNajlepszy: ${bestScore}`);
    }

    // Punkt za przejście
    if (p.x + p.width < bird.x && !p.scored) {
      score++;
      document.getElementById('score').textContent = score;
      p.scored = true;
    }

    if (p.x + p.width < 0) pipes.splice(i, 1);
  });

  // Koniec ekranu
  if (bird.y > canvas.height || bird.y < 0) {
    gameOver = true;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('crackBirdHighScore', bestScore);
      document.getElementById('bestScore').textContent = bestScore;
      document.getElementById('highScore').textContent = bestScore;
    }
    alert(`Game Over! Wynik: ${score}\nNajlepszy: ${bestScore}`);
  }

  frame++;
  requestAnimationFrame(gameLoop);
}
