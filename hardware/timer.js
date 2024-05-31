// script.js
let timerInterval;
let elapsedTime = 0;
let isRunning = false;

const timerDisplay = document.getElementById('timer');
const startPauseButton = document.getElementById('startPause');
const resetButton = document.getElementById('reset');

startPauseButton.addEventListener('click', () => {
    if (isRunning) {
        clearInterval(timerInterval);
        startPauseButton.textContent = 'Start';
    } else {
        startTimer();
        startPauseButton.textContent = 'Pause';
    }
    isRunning = !isRunning;
});

resetButton.addEventListener('click', resetTimer);

function startTimer() {
    const startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

function resetTimer() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    isRunning = false;
    timerDisplay.textContent = '00:00:00';
    startPauseButton.textContent = 'Start';
}
