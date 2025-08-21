// Live time update
const startTime = new Date("2025-08-20T15:00:00-04:00");
function updateTime() {
  const now = new Date();
  document.getElementById("current-time").textContent = now.toLocaleTimeString();
  const elapsedMs = now - startTime;
  const h = Math.floor(elapsedMs / 3600000);
  const m = Math.floor((elapsedMs % 3600000) / 60000);
  const s = Math.floor((elapsedMs % 60000) / 1000);
  // document.getElementById("elapsed").textContent = `${h}h ${m}m ${s}s`;
}
setInterval(updateTime, 1000);
updateTime();

// Image viewer functions
function openViewer(src) {
  document.getElementById('viewerImg').src = src;
  document.getElementById('imageViewer').classList.remove('hidden');
}

function closeViewer() {
  document.getElementById('imageViewer').classList.add('hidden');
}
