window.addEventListener('DOMContentLoaded', async () => {
  const hedgehog = document.getElementById('hedgehog');
  const bar = document.getElementById('bar-container');
  const btn = document.getElementById('move-btn');
  const statusText = document.getElementById('status-text');
  const barContainer = document.getElementById('bar-container');

  let hedgehogSpeed = 3;
  let shortenTitle = true;
  let titleMaxLength = 20;
  let lastActiveWindow = '';

  // Load settings
  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    shortenTitle = settings.shortenTitle ?? true;
    titleMaxLength = Math.max(1, settings.titleMaxLength ?? 20);
  }
  loadSettings();

  // Load hedgehog speed from main process
  if (window.electronAPI?.getHedgehogSpeed) {
    const speed = await window.electronAPI.getHedgehogSpeed();
    hedgehogSpeed = speed ?? hedgehogSpeed;
  }

  if (window.electronAPI?.onHedgehogSpeed) {
    window.electronAPI.onHedgehogSpeed((speed) => {
      hedgehogSpeed = speed ?? hedgehogSpeed;
    });
  }

  // Hedgehog animation
  if (hedgehog && bar) {
    let direction = 1, pos = 0, bobPhase = 0;

    function animateHedgehog() {
      const max = bar.offsetWidth - hedgehog.offsetWidth;
      pos += direction * hedgehogSpeed;
      if (pos > max) { direction = -1; pos = max; }
      else if (pos < 0) { direction = 1; pos = 0; }

      bobPhase += 0.1;
      const bob = Math.sin(bobPhase) * 5;

      hedgehog.style.transform = `translateY(calc(-50% + ${bob}px)) scaleX(${direction})`;
      hedgehog.style.left = pos + 'px';

      requestAnimationFrame(animateHedgehog);
    }
    animateHedgehog();
  }

  // Update status text based on current settings
  function updateStatusText(msg) {
    if (!msg) return;
    lastActiveWindow = typeof msg === 'string' ? msg : JSON.stringify(msg);

    const strMsg = lastActiveWindow;

    if (shortenTitle) {
      const parts = strMsg.split(' - ');
      const processName = parts[0] || strMsg;
      const windowTitle = parts.slice(1).join(' - ') || '';

      let fullTitle = windowTitle ? `${processName} - ${windowTitle}` : processName;

      const maxLen = Math.max(1, titleMaxLength);
      if (fullTitle.length > maxLen) fullTitle = fullTitle.slice(0, maxLen) + '...';

      statusText.innerText = fullTitle;
    } else {
      statusText.innerText = strMsg;
    }
  }

  if (window.electronAPI?.onActiveWindow) {
    window.electronAPI.onActiveWindow(updateStatusText);
  }

  if (window.electronAPI?.onSettingsChanged) {
    window.electronAPI.onSettingsChanged((newSettings) => {
      if (!newSettings) return;

      shortenTitle = newSettings.shortenTitle ?? shortenTitle;
      titleMaxLength = Math.max(1, newSettings.titleMaxLength ?? titleMaxLength);

      const savedSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
      localStorage.setItem('appSettings', JSON.stringify({ ...savedSettings, ...newSettings }));

      // Re-render last active window immediately with new settings
      updateStatusText(lastActiveWindow);
    });
  }

  // Bar orientation helpers
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

  if (window.electronAPI?.onBarPosition) {
    window.electronAPI.onBarPosition((pos) => {
      switch (pos) {
        case 'bottom': setHorizontalBar(); break;
        case 'left': setLeftBar(); break;
        case 'right': setRightBar(); break;
        default: setHorizontalBar();
      }
    });
  } else {
    setHorizontalBar();
  }
});
