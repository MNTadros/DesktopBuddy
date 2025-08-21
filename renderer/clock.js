function updateDigitalClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    document.getElementById('digital-clock').textContent = `${hours}:${minutes}:${seconds}`;
}

document.addEventListener('DOMContentLoaded', () => {
    updateDigitalClock();
    setInterval(updateDigitalClock, 1000);
});