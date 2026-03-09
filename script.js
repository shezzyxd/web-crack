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
                    }, 9000);

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

    const activeTab = document.querySelector('.tab-link.active');
    if (activeTab) {
        updateSearchVisibility(activeTab.getAttribute('data-tab'));
    }

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

// ================= LOADING SCREEN =================

document.body.classList.add("loading");

const loader = document.getElementById("loader");
const progress = document.querySelector(".progress");
const percentageText = document.querySelector(".percentage");

const TOTAL_TIME = 2000;          // ← 5000 ms = 5 sekund
const UPDATE_EVERY = 40;          // co ile ms aktualizować (płynniej = mniejsza wartość)

let startTime = Date.now();

function updateLoader() {
    const elapsed = Date.now() - startTime;
    let percent = Math.min(100, (elapsed / TOTAL_TIME) * 100);

    progress.style.width = percent + "%";
    percentageText.textContent = Math.floor(percent) + "%";

    if (percent < 100) {
        setTimeout(updateLoader, UPDATE_EVERY);
    } else {
        // koniec ładowania
        setTimeout(() => {
            loader.classList.add("hidden");
            document.body.classList.remove("loading");
        }, 600);   // małe opóźnienie na ładne wygaśnięcie
    }
}

updateLoader();

// ================= FLAPPY BIRD – ADVANCED VERSION =================

let flappyGameRunning = false;
let highScore = parseInt(localStorage.getItem('flappyHighScore')) || 0;

let canvas;
let ctx;

let birdY, birdVelocity, birdAngle, birdFlapFrame;
let pipes = [];
let score = 0;
let particles = [];
let powerUps = [];
let gameSpeed = 1.8;
let gravity = 0.22;
let pipeGap = 240;
let lastPipeTime = 0;
let difficultyTimer = 0;
let isNightMode = false;
let slowMotionTimer = 0;
let audioCtx;

document.addEventListener('DOMContentLoaded', () => {
    const highScoreElement = document.getElementById('highScore');
    if (highScoreElement) {
        highScoreElement.textContent = highScore;
    }
});

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playFlapSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
}

function playScoreSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.05);
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
}

function playDeathSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.5);
}

class Particle {
    constructor(x, y, vx, vy, life, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = Math.random() * 4 + 2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.life--;
    }
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 20;
        this.life = 300;
    }
    update() {
        this.x -= gameSpeed;
        this.life--;
    }
    draw(ctx) {
        ctx.save();
        ctx.shadowColor = '#f899ff';
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.type === 'biggap' ? '#4caf50' : '#2196f3';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawBird(ctx) {
    ctx.save();
    ctx.translate(90, birdY);
    ctx.rotate(birdAngle);

    ctx.shadowColor = '#c300ff';
    ctx.shadowBlur = 15;

    const wingOffset = Math.sin(birdFlapFrame) * 3;

    ctx.fillStyle = '#c300ff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b800e6';
    ctx.beginPath();
    ctx.ellipse(-5, wingOffset, 8, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(8, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(10, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.moveTo(18, -2);
    ctx.lineTo(28, -1);
    ctx.lineTo(28, 3);
    ctx.fill();

    ctx.restore();
    ctx.shadowBlur = 0;
}

function drawPipe(ctx, pipe) {
    const topGrd = ctx.createLinearGradient(pipe.x, 0, pipe.x + 70, 0);
    topGrd.addColorStop(0, '#7e57c2');
    topGrd.addColorStop(1, '#512da8');
    ctx.shadowColor = '#7e57c2';
    ctx.shadowBlur = 8;
    ctx.fillStyle = topGrd;
    ctx.fillRect(pipe.x, 0, 70, pipe.top);
    ctx.fillRect(pipe.x - 5, pipe.top - 30, 80, 30);

    const botGrd = ctx.createLinearGradient(pipe.x, canvas.height, pipe.x + 70, canvas.height);
    botGrd.addColorStop(0, '#512da8');
    botGrd.addColorStop(1, '#7e57c2');
    ctx.fillStyle = botGrd;
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, 70, pipe.bottom);
    ctx.fillRect(pipe.x - 5, canvas.height - pipe.bottom, 80, 30);

    ctx.shadowBlur = 0;
}

function drawClouds(ctx, speed) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 5; i++) {
        const x = (Date.now() * 0.01 + i * 200 - speed * 1000) % (canvas.width + 200) - 100;
        ctx.beginPath();
        ctx.arc(x, 80 + i * 40, 25, 0, Math.PI * 2);
        ctx.arc(x + 30, 80 + i * 40, 35, 0, Math.PI * 2);
        ctx.arc(x + 60, 80 + i * 40, 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGround(ctx, speed) {
    ctx.fillStyle = '#4a5c23';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    ctx.fillStyle = '#5d7c2e';
    for (let i = 0; i < canvas.width + 40; i += 20) {
        const grassX = (i - (Date.now() * 0.03 + speed * 10)) % 40;
        ctx.fillRect(grassX + i, canvas.height - 40, 3, 10 + Math.sin(grassX * 0.3) * 5);
    }
}

function drawScore(ctx, score) {
    ctx.shadowColor = '#f899ff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(score, canvas.width / 2, 80);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
}

function drawMedalPreview(ctx, score) {
    let medal = '';
    if (score >= 1000) medal = '🏆 RYNTA 🏆';
    else if (score >= 500) medal = '🥇 DOBRY JESTES TY 🥇';
    else if (score >= 250) medal = '🥈 O KUR 🥈';
    else if (score >= 100) medal = '🥉 NOOB 🥉';

    if (medal) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(medal, canvas.width / 2, 120);
        ctx.textAlign = 'left';
    }
}

function addParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(
            x, y,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            30 + Math.random() * 20,
            color
        ));
    }
}

function addPipe() {
    const minHeight = 80;
    const maxHeight = canvas.height - pipeGap - 120;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);

    pipes.push({
        x: canvas.width + 30,
        top: topHeight,
        bottom: canvas.height - topHeight - pipeGap,
        scored: false
    });
}

function startFlappyBird() {
    if (flappyGameRunning) return;
    flappyGameRunning = true;

    initAudio();

    canvas = document.getElementById('flappyCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.style.display = 'block';
    const gameMessage = document.getElementById('gameMessage');
    if (gameMessage) gameMessage.textContent = 'Spacja / Klik';

    birdY = canvas.height / 2;
    birdVelocity = 0;
    birdAngle = 0;
    birdFlapFrame = 0;
    pipes = [];
    particles = [];
    powerUps = [];
    score = 0;
    gameSpeed = 1.8;
    gravity = 0.22;
    pipeGap = 240;
    difficultyTimer = 0;
    isNightMode = false;
    slowMotionTimer = 0;
    lastPipeTime = Date.now();

    addPipe();

    let lastTime = 0;

    function gameLoop(currentTime) {
        if (!flappyGameRunning) return;

        if (!lastTime) lastTime = currentTime;
        const delta = currentTime - lastTime;
        lastTime = currentTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const speedMod = slowMotionTimer > 0 ? 0.5 : 1;
        const currentSpeed = gameSpeed * speedMod;

        const nightFactor = isNightMode ? 0.6 : 0;
        const skyGrd = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrd.addColorStop(0, `rgba(149, 117, 205, ${1 - nightFactor})`);
        skyGrd.addColorStop(1, `rgba(206, 147, 216, ${1 - nightFactor})`);
        ctx.fillStyle = skyGrd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawClouds(ctx, currentSpeed * 0.5);
        drawGround(ctx, currentSpeed);

        birdVelocity *= 0.95;
        birdVelocity += gravity;
        birdY += birdVelocity;
        birdAngle = Math.min(Math.max(birdVelocity * 0.08, -0.6), 1.2);
        birdFlapFrame += 0.2;

        drawBird(ctx);

        pipes.forEach((pipe, i) => {
            pipe.x -= currentSpeed;
            drawPipe(ctx, pipe);

            const birdRight = 90 + 18;
            const birdLeft = 90 - 18;
            const birdTop = birdY - 18;
            const birdBottom = birdY + 18;

            if (
                (birdRight > pipe.x && birdLeft < pipe.x + 70) &&
                (birdTop < pipe.top || birdBottom > canvas.height - pipe.bottom)
            ) {
                endGame();
                return;
            }

            if (pipe.x + 70 < 90 && !pipe.scored) {
                score++;
                pipe.scored = true;
                playScoreSound();
                addParticles(pipe.x + 35, canvas.height / 2, '#f899ff', 20);
                if (score % 10 === 0) difficultyTimer++;
                if (score >= 50) isNightMode = true;
            }

            if (pipe.x < -80) pipes.splice(i, 1);
        });

        if (Date.now() - lastPipeTime > 1800 / gameSpeed) {
            addPipe();
            lastPipeTime = Date.now();

            if (Math.random() < 0.2) {
                const type = Math.random() < 0.5 ? 'biggap' : 'slow';
                powerUps.push(new PowerUp(canvas.width + 50, Math.random() * (canvas.height - 300) + 100, type));
            }
        }

        powerUps.forEach((pu, i) => {
            pu.update();
            pu.draw(ctx);

            if (Math.hypot(pu.x - 90, pu.y - birdY) < 35) {
                if (pu.type === 'biggap') {
                    pipeGap = 320;
                    setTimeout(() => { pipeGap = 240; }, 8000);
                } else {
                    slowMotionTimer = 360;
                }
                addParticles(pu.x, pu.y, '#00ff88', 20);
                powerUps.splice(i, 1);
            }

            if (pu.life <= 0 || pu.x < -50) powerUps.splice(i, 1);
        });

        particles.forEach((p, i) => {
            p.update();
            p.draw(ctx);
            if (p.life <= 0) particles.splice(i, 1);
        });

        gameSpeed = 1.8 + difficultyTimer * 0.08;
        gravity = 0.22 + difficultyTimer * 0.002;

        if (slowMotionTimer > 0) slowMotionTimer--;

        if (birdY > canvas.height - 40 || birdY < 40) {
            endGame();
            return;
        }

        drawScore(ctx, score);
        drawMedalPreview(ctx, score);

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);

    function jump() {
        if (!flappyGameRunning) return;
        birdVelocity = -9;
        playFlapSound();
        addParticles(70, birdY, '#f899ff', 8);
    }

    const jumpHandler = e => {
        e.preventDefault();
        jump();
    };

    document.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
        if (e.code === 'Escape') {
            e.preventDefault();
            flappyGameRunning = !flappyGameRunning;
            const msg = document.getElementById('gameMessage');
            if (msg) {
                msg.textContent = flappyGameRunning ? 'Gra wznowiona!' : 'Pauza (ESC → wznowić)';
            }
        }
    });

    canvas.addEventListener('click', jumpHandler);
    canvas.addEventListener('touchstart', jumpHandler);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) flappyGameRunning = false;
    });
}

function endGame() {
    flappyGameRunning = false;
    playDeathSound();

    addParticles(90, birdY, '#ff4444', 60);

    for (let i = 0; i < 120; i++) {
        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 18,
            50 + Math.random() * 50,
            `hsl(${Math.random() * 60}, 100%, 60%)`
        ));
    }

    let deathAnimFrame = 0;

    function deathAnimation() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawClouds(ctx, 0);
        drawGround(ctx, 0);

        particles.forEach((p, i) => {
            p.update();
            p.draw(ctx);
            if (p.life <= 0) particles.splice(i, 1);
        });

        if (particles.length > 0 || deathAnimFrame < 80) {
            deathAnimFrame++;
            requestAnimationFrame(deathAnimation);
        } else {
            canvas.style.display = 'none';
            showEndScreen();
        }
    }

    deathAnimation();
}

function showEndScreen() {
    let medal = '';
    if (score >= 1000) medal = '🏆 RYNTA 🏆';
    else if (score >= 500) medal = '🥇 DOBRY JESTES TY 🥇';
    else if (score >= 250) medal = '🥈 O KUR 🥈';
    else if (score >= 100) medal = '🥉 NOOB 🥉';

    const isNewRecord = score > highScore;
    if (isNewRecord) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
        const hsElem = document.getElementById('highScore');
        if (hsElem) hsElem.textContent = highScore;
    }

    const message = document.getElementById('gameMessage');
    if (message) {
        message.innerHTML = `
      <div style="text-align:center; font-size:24px; color:#f899ff; margin:20px 0; line-height:1.5;">
        Koniec gry!<br>
        Twój wynik: <strong>${score}</strong><br>
        ${medal ? `<strong style="font-size:28px;">${medal}</strong><br>` : ''}
        Najlepszy wynik: <strong>${highScore}</strong><br>
        ${isNewRecord ? '<span style="color:#ffd700; font-weight:bold;">NOWY REKORD! 🎉</span>' : ''}
      </div>
      <button onclick="startFlappyBird()" style="
        background:#f899ff;
        color:#000;
        font-weight:bold;
        padding:14px 32px;
        border:none;
        border-radius:50px;
        cursor:pointer;
        font-size:18px;
        margin-top:12px;
      ">
        Zagraj ponownie 🐦
      </button>
    `;
    }
}

// ================= AIM TRAINER – ZŁAP RYNĘ =================

let aimGameRunning = false;
let aimHighScore = parseInt(localStorage.getItem('aimHighScore')) || 0;
let aimCanvas, aimCtx;
let aimTimer = 30;
let aimScore = 0;
let aimHits = 0;
let aimShots = 0;
let aimCombo = 0;
let aimTarget;
let aimParticles = [];
let aimStartTime;
let aimInterval;
let aimAnimationId;
let aimAudioCtx = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('aimHighScore').textContent = aimHighScore;
});

// ────────────────────────────────────────────────
// DŹWIĘKI DLA AIM TRAINER
// ────────────────────────────────────────────────

function initAimAudio() {
    if (!aimAudioCtx) {
        aimAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (aimAudioCtx.state === 'suspended') {
        aimAudioCtx.resume();
    }
}

function playClickSound(isHit = true) {
    if (!aimAudioCtx) return;

    const now = aimAudioCtx.currentTime;

    const osc = aimAudioCtx.createOscillator();
    const gain = aimAudioCtx.createGain();

    osc.connect(gain);
    gain.connect(aimAudioCtx.destination);

    if (isHit) {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    }

    osc.start(now);
    osc.stop(now + 0.12);
}

class AimParticle {
    constructor(x, y, vx, vy, life, color, size = 3) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.gravity = 0.05;
        this.decay = 0.98;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.decay;
        this.vy *= this.decay;
        this.life--;
        this.size *= 0.995;
    }
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(this.size, 0), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function createHitParticles(x, y, count = 15, isMiss = false) {
    const colorBase = isMiss ? 0 : 300;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = Math.random() * 8 + 2;
        aimParticles.push(new AimParticle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            40 + Math.random() * 30,
            `hsl(${colorBase + Math.random() * 60}, 100%, ${50 + Math.random() * 50}%)`,
            Math.random() * 4 + 2
        ));
    }
}

function getCurrentTargetSize() {
    if (!aimTarget) return 0;
    const elapsed = (Date.now() - aimTarget.startTime) / (aimTarget.duration * 1000);
    return Math.max(0, aimTarget.size * (1 - elapsed));
}

function drawTarget(ctx) {
    if (!aimTarget) return;
    const currentSize = getCurrentTargetSize();
    if (currentSize <= 0) {
        aimTarget = null;
        return;
    }

    const { x, y } = aimTarget;

    const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 1;
    const drawSize = currentSize * pulse;

    const grd = ctx.createRadialGradient(x, y, 0, x, y, drawSize);
    grd.addColorStop(0, '#4caf50');
    grd.addColorStop(0.5, '#8bc34a');
    grd.addColorStop(1, 'rgba(76, 175, 80, 0.8)');

    ctx.save();
    ctx.shadowColor = '#f899ff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.roundRect(x - drawSize / 2, y - drawSize / 2, drawSize, drawSize, 10);
    ctx.fill();

    ctx.fillStyle = '#f899ff';
    ctx.font = `${drawSize * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText('💸', x, y);
    ctx.restore();
}

function drawParticles(ctx) {
    aimParticles.forEach((p, i) => {
        p.update();
        p.draw(ctx);
        if (p.life <= 0) aimParticles.splice(i, 1);
    });
}

function aimGameLoop() {
    if (!aimGameRunning) return;

    aimCtx.clearRect(0, 0, aimCanvas.width, aimCanvas.height);

    const bgGrd = aimCtx.createLinearGradient(0, 0, aimCanvas.width, aimCanvas.height);
    bgGrd.addColorStop(0, 'rgba(10,10,20,0.95)');
    bgGrd.addColorStop(1, 'rgba(26,27,46,0.95)');
    aimCtx.fillStyle = bgGrd;
    aimCtx.fillRect(0, 0, aimCanvas.width, aimCanvas.height);

    aimCtx.fillStyle = 'rgba(248, 153, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
        const starX = (Date.now() * 0.01 + i * 100) % aimCanvas.width;
        const starY = (i * 37) % aimCanvas.height;
        aimCtx.beginPath();
        aimCtx.arc(starX, starY, 1, 0, Math.PI * 2);
        aimCtx.fill();
    }

    drawTarget(aimCtx);
    drawParticles(aimCtx);

    if (!aimTarget) {
        spawnNewTarget();
    }

    aimAnimationId = requestAnimationFrame(aimGameLoop);
}

const aimClickHandler = (e) => {
    if (!aimGameRunning) return;
    const rect = aimCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    aimShots++;

    const currentSize = getCurrentTargetSize();
    const hitRadius = currentSize / 2;

    if (aimTarget && Math.hypot(clickX - aimTarget.x, clickY - aimTarget.y) < hitRadius) {
        aimHits++;
        aimScore += aimCombo >= 5 ? 2 : 1;
        aimCombo++;
        if (aimCombo >= 5) aimCombo = 5;

        createHitParticles(aimTarget.x, aimTarget.y, 20);
        aimTarget = null;
        spawnNewTarget();

        playClickSound(true);           // dźwięk trafienia

        document.getElementById('aimScore').textContent = aimScore;
        document.getElementById('aimCombo').textContent = `Combo: ${aimCombo}x`;
    } else {
        aimCombo = 0;
        aimScore = Math.max(0, aimScore - 1);

        playClickSound(false);          // dźwięk pudła

        createHitParticles(clickX, clickY, 5, true);

        document.getElementById('aimScore').textContent = aimScore;
        document.getElementById('aimCombo').textContent = `Combo: 0x`;
    }
};

function spawnNewTarget() {
    const x = Math.random() * (aimCanvas.width - 60) + 30;
    const y = Math.random() * (aimCanvas.height - 60) + 30;
    aimTarget = {
        x, y,
        size: 80,
        startTime: Date.now(),
        duration: 3 + Math.random() * 2,
    };
}

function updateTimer() {
    const elapsed = (Date.now() - aimStartTime) / 1000;
    aimTimer = Math.max(0, 30 - elapsed);
    document.getElementById('aimTimer').textContent = `${Math.ceil(aimTimer)}s`;

    if (aimTimer <= 0) {
        endAimGame();
    }
}

function startAimTrainer() {
    if (aimGameRunning) return;
    aimGameRunning = true;

    initAimAudio();   // Inicjalizacja dźwięku

    aimScore = 0;
    aimHits = 0;
    aimShots = 0;
    aimCombo = 0;
    aimParticles = [];
    aimTimer = 30;
    aimTarget = null;

    document.getElementById('startAimBtn').style.display = 'none';
    document.getElementById('aimGameArea').style.display = 'block';
    document.getElementById('aimEndScreen').style.display = 'none';

    aimCanvas = document.getElementById('aimCanvas');
    aimCtx = aimCanvas.getContext('2d');

    if (!aimCanvas.hasAimListener) {
        aimCanvas.addEventListener('click', aimClickHandler);
        aimCanvas.hasAimListener = true;
    }

    aimStartTime = Date.now();
    aimInterval = setInterval(updateTimer, 50);

    spawnNewTarget();
    aimGameLoop();
}

function endAimGame() {
    aimGameRunning = false;
    clearInterval(aimInterval);
    cancelAnimationFrame(aimAnimationId);

    const accuracy = aimShots > 0 ? Math.round((aimHits / aimShots) * 100) : 0;
    document.getElementById('aimAccuracy').textContent = `${accuracy}%`;

    const isNewRecord = aimScore > aimHighScore;
    if (isNewRecord) {
        aimHighScore = aimScore;
        localStorage.setItem('aimHighScore', aimHighScore);
        document.getElementById('aimHighScore').textContent = aimHighScore;
    }

    document.getElementById('aimGameArea').style.display = 'none';
    const results = document.getElementById('aimResults');
    results.innerHTML = `
        <div style="text-align:center; font-size:24px; color:#f899ff; margin:20px 0; line-height:1.5; text-shadow: 0 0 10px #f899ff;">
            Koniec Gry!<br>
            Wynik: <strong>${aimScore}</strong><br>
            Accuracy: <strong>${accuracy}%</strong><br>
            Max Combo: <strong>${aimCombo}x</strong><br>
            Najlepszy: <strong>${aimHighScore}</strong><br>
            ${isNewRecord ? '<span style="color:#ffd700; font-weight:bold;">NOWY REKORD! 🎉</span>' : ''}
        </div>
    `;
    document.getElementById('aimEndScreen').style.display = 'block';
    document.getElementById('startAimBtn').style.display = 'block';
}

// ────────────────────────────────────────────────
// MINIMALNE CZĄSTECZKI W TLE LOADERA – UCIEKAJĄ PRZED MYSZKĄ
// ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;
    let mouse = { x: null, y: null };

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2.2 + 0.8;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.baseHue = 270 + Math.random() * 90; // fiolet → róż
        }
        update() {
            // uciekanie przed myszką
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 140) {
                    const force = (140 - dist) / 140;
                    this.vx += dx / dist * force * 1.8;
                    this.vy += dy / dist * force * 1.8;
                }
            }

            this.x += this.vx;
            this.y += this.vy;

            // delikatne tłumienie prędkości
            this.vx *= 0.982;
            this.vy *= 0.982;

            // reset gdy wyjdzie poza ekran lub zwolni za bardzo
            if (this.x < -20 || this.x > w + 20 || 
                this.y < -20 || this.y > h + 20 ||
                Math.abs(this.vx) + Math.abs(this.vy) < 0.01) {
                this.reset();
            }
        }
        draw() {
            ctx.globalAlpha = 0.5 + Math.random() * 0.3;
            ctx.fillStyle = `hsl(${this.baseHue}, 85%, 65%)`;
            ctx.shadowColor = `hsl(${this.baseHue}, 90%, 70%)`;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // start – 80–120 cząsteczek wystarczy
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }

    function loop() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(loop);
    }

    // uruchamiamy tylko gdy loader jest widoczny
    if (!document.getElementById('loader').classList.contains('hidden')) {
        loop();
    }

    // zatrzymujemy po schowaniu loadera
    const loader = document.getElementById('loader');
    const obs = new MutationObserver(() => {
        if (loader.classList.contains('hidden')) {
            particles = [];
        }
    });
    obs.observe(loader, { attributes: true });
});