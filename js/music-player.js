document.addEventListener("DOMContentLoaded", function () {
  const playlistId = "17841615593";
  const storageKeyOpen = "music_panel_open";
  const storageKeyMin = "music_panel_minimized";

  const btn = document.createElement("button");
  btn.id = "music-float-btn";
  btn.innerText = "♫";
  btn.title = "Music";

  const panel = document.createElement("div");
  panel.id = "music-panel";
  panel.className = "hidden";

  panel.innerHTML = `
    <div id="music-panel-header">
      <div id="music-panel-title">
        <strong>Music</strong>
        <span>Netease Cloud Playlist</span>
      </div>
      <div id="music-panel-actions">
        <button id="music-min-btn" class="music-panel-btn" title="Minimize">—</button>
        <button id="music-close-btn" class="music-panel-btn" title="Close">×</button>
      </div>
    </div>
    <div id="music-player-wrap">
      <iframe
        id="music-player-frame"
        data-src="https://music.163.com/outchain/player?type=0&id=${playlistId}&auto=0&height=340"
        allow="autoplay"
        loading="lazy"
      ></iframe>
    </div>
    <div id="music-panel-footer">
      <span id="music-status">Click to load player</span>
      <a href="https://music.163.com/#/playlist?id=${playlistId}" target="_blank" rel="noopener noreferrer">Open in Netease</a>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  const frame = document.getElementById("music-player-frame");
  const closeBtn = document.getElementById("music-close-btn");
  const minBtn = document.getElementById("music-min-btn");
  const status = document.getElementById("music-status");

  let loaded = false;

  function loadFrameOnce() {
    if (loaded) return;
    frame.src = frame.dataset.src;
    loaded = true;
    status.textContent = "Player loaded";
  }

  function openPanel() {
    panel.classList.remove("hidden");
    loadFrameOnce();
    localStorage.setItem(storageKeyOpen, "1");
  }

  function closePanel() {
    panel.classList.add("hidden");
    localStorage.setItem(storageKeyOpen, "0");
  }

  function toggleMinimize() {
    panel.classList.toggle("minimized");
    const minimized = panel.classList.contains("minimized");
    localStorage.setItem(storageKeyMin, minimized ? "1" : "0");
    minBtn.textContent = minimized ? "+" : "—";
    minBtn.title = minimized ? "Expand" : "Minimize";
  }

  btn.addEventListener("click", function () {
    if (panel.classList.contains("hidden")) {
      openPanel();
    } else {
      closePanel();
    }
  });

  closeBtn.addEventListener("click", function () {
    closePanel();
  });

  minBtn.addEventListener("click", function () {
    loadFrameOnce();
    toggleMinimize();
  });

  frame.addEventListener("load", function () {
    status.textContent = "Ready";
  });

  const shouldOpen = localStorage.getItem(storageKeyOpen) === "1";
  const shouldMin = localStorage.getItem(storageKeyMin) === "1";

  if (shouldMin) {
    panel.classList.add("minimized");
    minBtn.textContent = "+";
    minBtn.title = "Expand";
  }

  if (shouldOpen) {
    openPanel();
  }
});