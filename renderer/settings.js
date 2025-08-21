window.addEventListener('DOMContentLoaded', async () => {
  const notificationsCheckbox = document.getElementById('notifications');
  const shortenTitleCheckbox = document.getElementById('shorten-title');
  const titleLengthInput = document.getElementById('title-max-length');
  const titleLengthLabel = document.getElementById('title-length-value');
  const hedgehogSpeedInput = document.getElementById('hedgehog-speed');
  const speedValueLabel = document.getElementById('speed-value');
  const saveButton = document.getElementById('save-btn');
  const closeButton = document.getElementById('close-btn');
  const closeButtonTop = document.getElementById('close-btn-top');
  const statusMessage = document.getElementById('status');

  // Load saved settings
  const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
  notificationsCheckbox.checked = settings.notifications ?? true;
  shortenTitleCheckbox.checked = settings.shortenTitle ?? true;
  titleLengthInput.value = settings.titleMaxLength ?? 20;
  titleLengthLabel.innerText = titleLengthInput.value;
  hedgehogSpeedInput.value = settings.hedgehogSpeed ?? 3;
  speedValueLabel.innerText = hedgehogSpeedInput.value;

  titleLengthInput.addEventListener('input', () => {
    titleLengthLabel.innerText = titleLengthInput.value;
    updatePreview();
  });

  hedgehogSpeedInput.addEventListener('input', () => {
    speedValueLabel.innerText = hedgehogSpeedInput.value;
  });

  // Update preview when settings change
  function updatePreview() {
    const shorten = shortenTitleCheckbox.checked;
    const maxLength = parseInt(titleLengthInput.value);
    const sampleTitle = "Chrome - Google Search: electron framework documentation";
    
    if (shorten && sampleTitle.length > maxLength) {
      document.getElementById('title-preview').textContent = sampleTitle.slice(0, maxLength) + '...';
    } else {
      document.getElementById('title-preview').textContent = sampleTitle;
    }
  }

  // Add event listeners for preview updates
  shortenTitleCheckbox.addEventListener('change', updatePreview);
  titleLengthInput.addEventListener('input', updatePreview);
  
  updatePreview();

  saveButton.addEventListener('click', () => {
    const newSettings = {
      notifications: notificationsCheckbox.checked,
      shortenTitle: shortenTitleCheckbox.checked,
      titleMaxLength: Number(titleLengthInput.value) || 20,
      hedgehogSpeed: Number(hedgehogSpeedInput.value) || 3,
    };

    localStorage.setItem('appSettings', JSON.stringify(newSettings));

    if (window.electronAPI?.settingsChanged) {
      window.electronAPI.settingsChanged(newSettings);
    }

    if (window.electronAPI?.setHedgehogSpeed) {
      window.electronAPI.setHedgehogSpeed(Number(hedgehogSpeedInput.value) || 3);
    }

    statusMessage.style.display = 'block';
    setTimeout(() => { statusMessage.style.display = 'none'; }, 1500);
  });

  closeButton.addEventListener('click', () => {
    if (window.electronAPI?.closeSettingsWindow) {
      window.electronAPI.closeSettingsWindow();
    }
  });

  closeButtonTop.addEventListener('click', () => {
    if (window.electronAPI?.closeSettingsWindow) {
      window.electronAPI.closeSettingsWindow();
    }
  });
});