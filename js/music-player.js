document.addEventListener("DOMContentLoaded", function () {
  const playlistId = "17841615593";

  const btn = document.createElement("button");
  btn.id = "music-float-btn";
  btn.innerText = "♫";
  btn.title = "打开音乐播放器";

  const panel = document.createElement("div");
  panel.id = "music-panel";
  panel.className = "hidden";

  panel.innerHTML = `
    <div id="music-panel-header">
      <span>网易云音乐</span>
      <button id="music-panel-close" title="关闭">×</button>
    </div>
    <iframe
      src="https://music.163.com/outchain/player?type=0&id=${playlistId}&auto=0&height=388"
      allow="autoplay"
    ></iframe>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  btn.addEventListener("click", function () {
    panel.classList.toggle("hidden");
  });

  panel.querySelector("#music-panel-close").addEventListener("click", function () {
    panel.classList.add("hidden");
  });
});