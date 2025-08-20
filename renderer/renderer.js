window.addEventListener('DOMContentLoaded', () => {
  // Hedgehog Animation
  const hedgehog = document.getElementById('hedgehog');
  const bar = document.getElementById('bar-container');

  if (hedgehog && bar) {
    let direction = 1; // 1 = right, -1 = left
    let pos = 0;
    let bobPhase = 0;

    function animateHedgehog() {
      const barWidth = bar.offsetWidth;
      const max = barWidth - hedgehog.offsetWidth;

      pos += direction * 3;
      if (pos > max) {
        direction = -1;
        pos = max;
      } else if (pos < 0) {
        direction = 1;
        pos = 0;
      }

      bobPhase += 0.1;
      const bob = Math.sin(bobPhase) * 5; 

      hedgehog.style.transform = `translateY(calc(-50% + ${bob}px)) scaleX(${direction})`;
      hedgehog.style.left = pos + 'px';

      requestAnimationFrame(animateHedgehog);
    }

    animateHedgehog();
  }

  // Bar UI Logic
  const btn = document.getElementById('move-btn');
  const statusText = document.getElementById('status-text');
  const barContainer = document.getElementById('bar-container');

  btn.addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.sendMoveBar) {
      window.electronAPI.sendMoveBar();
    }
  });

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
});
