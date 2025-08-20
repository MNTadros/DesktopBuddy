const btn = document.getElementById('move-btn');
const statusText = document.getElementById('status-text');
const barContainer = document.getElementById('bar-container');

// Handle move button click
btn.addEventListener('click', () => {
  if (window.electronAPI && window.electronAPI.sendMoveBar) {
    window.electronAPI.sendMoveBar();
  }
});

// Update status text with active window info
if (window.electronAPI && window.electronAPI.onActiveWindow) {
  window.electronAPI.onActiveWindow((msg) => {
    statusText.innerText = msg;
  });
}

// Adjust orientation and button position based on bar position
function setHorizontalBar() {
  barContainer.className = 'flex flex-row items-center gap-2 w-full h-full justify-center relative';
  statusText.style.transform = 'rotate(0deg)';
  statusText.style.writingMode = 'horizontal-tb';
  btn.style.transform = 'rotate(0deg)';
  btn.classList.remove('mb-2', 'mt-2');
  btn.classList.add('ml-2');
  btn.classList.remove('mr-2');
}
function setLeftBar() {
  barContainer.className = 'flex flex-col items-center gap-2 w-full h-full justify-center relative';
  statusText.style.transform = 'rotate(0deg)';
  statusText.style.writingMode = 'vertical-rl';
  btn.style.transform = 'rotate(0deg)';
  btn.classList.remove('ml-2', 'mr-2');
  btn.classList.add('mb-2');
  btn.classList.remove('mt-2');
}
function setRightBar() {
  barContainer.className = 'flex flex-col items-center gap-2 w-full h-full justify-center relative';
  statusText.style.transform = 'rotate(180deg)';
  statusText.style.writingMode = 'vertical-rl';
  btn.style.transform = 'rotate(180deg)';
  btn.classList.remove('ml-2', 'mr-2');
  btn.classList.add('mt-2');
  btn.classList.remove('mb-2');
}

if (window.electronAPI && window.electronAPI.onBarPosition) {
  window.electronAPI.onBarPosition((pos) => {
    switch (pos) {
      case 'bottom':
        setHorizontalBar();
        break;
      case 'left':
        setLeftBar();
        break;
      case 'right':
        setRightBar();
        break;
      default:
        setHorizontalBar();
    }
  });
} else {
  setHorizontalBar();
}
