document.addEventListener("DOMContentLoaded", function () {
  const lines = {
    head: [
      "别戳我头啦。",
      "头发会乱掉的。",
      "摸头可以，轻一点。"
    ],
    face: [
      "捏脸是要收费的。",
      "脸不是这样玩的啦。",
      "你是不是又手痒了？"
    ],
    shoulder: [
      "这里不许乱碰哦。",
      "喂，注意一点分寸。",
      "突然碰我会吓一跳的。"
    ],
    hand: [
      "要牵手吗？",
      "手在这里哦。",
      "今天也要一起加油。"
    ],
    body: [
      "欢迎来到我的博客。",
      "右下角可以听歌哦",
      "点我一下就会说话。",
	"咕咕嘎嘎!"
    ]
  };

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function findWaifuRoot() {
    const byId = document.getElementById("live2d-widget");
    if (byId) return byId;

    const canvas = document.getElementById("live2dcanvas");
    if (canvas && canvas.parentElement) return canvas.parentElement;

    const candidates = document.querySelectorAll("canvas");
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if ((c.width >= 120 && c.height >= 200) || c.style.position === "fixed") {
        if (c.parentElement) return c.parentElement;
      }
    }
    return null;
  }

  function setupWaifuInteract(root) {
    if (!root || root.dataset.waifuEnhanced === "1") return;
    root.dataset.waifuEnhanced = "1";

    if (getComputedStyle(root).position === "static") {
      root.style.position = "fixed";
    }

    const hotzones = document.createElement("div");
    hotzones.id = "waifu-hotzones";

    const bubble = document.createElement("div");
    bubble.id = "waifu-bubble";
    bubble.textContent = "你好呀，欢迎来到这里。";

    const zones = [
  { name: "body", className: "waifu-zone", style: "left:18%;top:0;width:64%;height:100%;z-index:1;" },
  { name: "shoulder", className: "waifu-zone", style: "left:22%;top:42%;width:56%;height:20%;z-index:2;" },
  { name: "hand", className: "waifu-zone", style: "left:62%;top:58%;width:20%;height:18%;z-index:3;" },
  { name: "face", className: "waifu-zone", style: "left:25%;top:24%;width:48%;height:18%;z-index:4;" },
  { name: "head", className: "waifu-zone", style: "left:18%;top:8%;width:64%;height:22%;z-index:5;" }
];

    zones.forEach(function (z) {
      const el = document.createElement("div");
      el.className = z.className;
      el.dataset.zone = z.name;
      el.style.cssText = z.style;
      hotzones.appendChild(el);
    });

    root.appendChild(hotzones);
    root.appendChild(bubble);

    let timer = null;

    function say(text) {
      bubble.textContent = text;
      bubble.classList.add("show");

      root.classList.remove("waifu-pop");
      void root.offsetWidth;
      root.classList.add("waifu-pop");

      clearTimeout(timer);
      timer = setTimeout(function () {
        bubble.classList.remove("show");
      }, 2200);
    }

    hotzones.addEventListener("click", function (e) {
      const target = e.target;
      if (!target.classList.contains("waifu-zone")) return;

      const zone = target.dataset.zone || "body";
      say(pick(lines[zone] || lines.body));
      e.stopPropagation();
    });

    hotzones.addEventListener("mouseenter", function () {
      bubble.classList.add("show");
    }, true);

    hotzones.addEventListener("mouseleave", function () {
      bubble.classList.remove("show");
    }, true);
  }

  let retry = 0;
  const timer = setInterval(function () {
    const root = findWaifuRoot();
    if (root) {
      clearInterval(timer);
      setupWaifuInteract(root);
      return;
    }
    retry++;
    if (retry > 40) clearInterval(timer);
  }, 500);
});