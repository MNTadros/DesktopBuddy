class PomodoroTimer {
    constructor() {
        this.isRunning = false;
        this.isBreak = false;
        this.isMinimized = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.timerInterval = null;

        this.initElements();
        this.initEvents();
        this.updateDisplay();
    }

    initElements() {
        const $ = id => document.getElementById(id);
        this.container = $('pomodoro-container');
        this.clock = $('pomodoro-clock');
        this.startBtn = $('pomodoro-start');
        this.stopBtn = $('pomodoro-stop');
        this.resetBtn = $('pomodoro-reset');
        this.minBtn = $('pomodoro-minimize');
        this.barContainer = $('bar-container');
        this.controls = this.container.querySelector('.pomodoro-controls');
    }

    initEvents() {
        this.startBtn.onclick = () => this.start();
        this.stopBtn.onclick = () => this.stop();
        this.resetBtn.onclick = () => this.reset();
        this.minBtn.onclick = () => this.toggleMinimize();

        this.container.addEventListener('mousedown', e => this.startDrag(e));
        this.onMove = e => this.handleDrag(e);
        this.onUp = () => this.stopDrag();
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.controls.style.display = this.isMinimized ? 'none' : 'flex';
        this.container.style.minWidth = this.isMinimized ? 'auto' : '80px';
        this.container.style.padding = this.isMinimized ? '4px 6px' : '6px 8px';
        this.minBtn.textContent = this.isMinimized ? '+' : '−';
    }

    startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        const rect = this.container.getBoundingClientRect();
        this.dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        document.addEventListener('mousemove', this.onMove);
        document.addEventListener('mouseup', this.onUp);
    }

    handleDrag(e) {
        if (!this.isDragging) return;
        const barRect = this.barContainer.getBoundingClientRect();
        let left = e.clientX - barRect.left - this.dragOffset.x;
        let top = e.clientY - barRect.top - this.dragOffset.y;

        left = Math.max(0, Math.min(left, barRect.width - this.container.offsetWidth));
        top = Math.max(0, Math.min(top, barRect.height - this.container.offsetHeight));

        this.container.style.left = left + 'px';
        this.container.style.top = top + 'px';
    }

    stopDrag() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.onMove);
        document.removeEventListener('mouseup', this.onUp);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) this.complete();
            this.updateDisplay();
        }, 1000);
    }

    stop() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
    }

    reset() {
        this.stop();
        this.timeLeft = this.isBreak ? 5 * 60 : 25 * 60;
        this.updateDisplay();
    }

    complete() {
        this.stop();
        const message = this.isBreak
            ? "Break over! Time to focus! 🍅"
            : "Pomodoro complete! Take a break! 🎉";

        this.notify(message);

        this.isBreak = !this.isBreak;
        this.timeLeft = this.isBreak ? 5 * 60 : 25 * 60;
        this.updateDisplay();
    }

    notify(message) {
        if (window.electronAPI) {
            window.electronAPI.showNotification(message);
        } else if ("Notification" in window) {
            if (Notification.permission === "granted") {
                new Notification("Pomodoro Timer", { body: message });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(p => {
                    if (p === "granted") new Notification("Pomodoro Timer", { body: message });
                });
            }
        }
    }

    updateDisplay() {
        const m = String(Math.floor(this.timeLeft / 60)).padStart(2, '0');
        const s = String(this.timeLeft % 60).padStart(2, '0');
        this.clock.textContent = `${m}:${s}`;
        this.clock.classList.toggle('pomodoro-alert', this.timeLeft <= 60);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroTimer = new PomodoroTimer();
});
