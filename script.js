const rankFlow = [
    "Bronze III", "Bronze II", "Bronze I", "Silver III", "Silver II", "Silver I",
    "Gold III", "Gold II", "Gold I", "Platinum II", "Platinum I", "Diamond II",
    "Diamond I", "Emerald II", "Emerald I", "Master II", "Master I", "Grandmaster"
];

let state = {
    rankIdx: 0,
    stars: 0,
    highestRank: "Bronze III",
    completedTasks: [],
    isMusicOn: false
};

// --- AUDIO ENGINE ---
const sfxClick = document.getElementById('sfx-click');
const sfxRankUp = document.getElementById('sfx-rankup');
const bgMusic = document.getElementById('bg-music');

function playClick() { sfxClick.currentTime = 0; sfxClick.play(); }

function toggleMusic() {
    state.isMusicOn = !state.isMusicOn;
    const btn = document.getElementById('music-icon');
    if (state.isMusicOn) {
        bgMusic.play();
        btn.innerText = "🔊 Music On";
    } else {
        bgMusic.pause();
        btn.innerText = "🔈 Music Off";
    }
    saveData();
}

// --- SYSTEM: PERSISTENCE ---
function saveData() {
    localStorage.setItem('rankfit_elite_data', JSON.stringify(state));
}

function loadData() {
    const saved = localStorage.getItem('rankfit_elite_data');
    if (saved) {
        state = JSON.parse(saved);
        if (state.isMusicOn) {
            // Browser policy requires user interaction before playing
            document.getElementById('music-icon').innerText = "🔊 Music Ready";
        }
        updateUI();
    }
}

// --- TIMER: PLANK ---
let timerInterval;
let timeLeft = 180;
let isRunning = false;

function toggleTimer() {
    playClick();
    const btn = document.getElementById('plank-ctrl');
    if (isRunning) {
        clearInterval(timerInterval);
        btn.innerText = "RESUME MISSION";
        isRunning = false;
    } else {
        isRunning = true;
        btn.innerText = "PAUSE";
        timerInterval = setInterval(() => {
            timeLeft--;
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            document.getElementById('timer-display').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            if (timeLeft <= 0) { clearInterval(timerInterval); finishPlank(); }
        }, 1000);
    }
}

function finishPlank() {
    document.getElementById('plank-ctrl').innerText = "DONE";
    document.getElementById('plank-ctrl').disabled = true;
    markTask('plank');
}

// --- LOGIC: WORKOUT ---
function markTask(id, btn) {
    playClick();
    if (!state.completedTasks.includes(id)) {
        state.completedTasks.push(id);
        if (btn) {
            btn.innerText = "✓";
            btn.disabled = true;
            btn.classList.replace('bg-slate-800', 'bg-green-600');
        }
    }
    
    if (state.completedTasks.length >= 5) {
        const claimBtn = document.getElementById('claim-star-btn');
        claimBtn.disabled = false;
        claimBtn.classList.replace('bg-slate-800', 'bg-cyan-600');
        claimBtn.classList.add('text-white', 'shadow-[0_0_30px_rgba(34,211,238,0.5)]');
    }
}

function processClaim() {
    playClick();
    state.stars++;

    if (state.rankIdx < 17) {
        if (state.stars >= 5) {
            state.rankIdx++;
            state.stars = 0;
            sfxRankUp.play(); // Efek suara naik rank
            alert(`PROMOTED TO ${rankFlow[state.rankIdx]}!`);
        }
    } else {
        if (state.stars > 300) state.stars = 300;
    }

    state.highestRank = rankFlow[state.rankIdx];
    state.completedTasks = [];
    saveData();
    location.reload(); // Refresh visual
}

function updateUI() {
    const currentRank = rankFlow[state.rankIdx];
    document.getElementById('display-rank').innerText = currentRank.toUpperCase();
    document.getElementById('highest-rank').innerText = state.highestRank.toUpperCase();

    // Update Image (Ambil nama depan rank: Bronze, Silver, dsb)
    const rankBase = currentRank.split(' ')[0];
    document.getElementById('rank-icon').src = `assets/${rankBase}.png`;

    const container = document.getElementById('star-container');
    container.innerHTML = "";
    
    if (state.rankIdx === 17) {
        container.innerHTML = `<span class="star-gold font-orbitron text-xl">★ ${state.stars} / 300</span>`;
    } else {
        for (let i = 0; i < 5; i++) {
            const s = document.createElement('span');
            s.innerText = "★";
            if (i < state.stars) s.classList.add('star-gold');
            else s.classList.add('text-slate-800');
            container.appendChild(s);
        }
    }
}

window.onload = loadData;