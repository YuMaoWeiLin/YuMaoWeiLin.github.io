document.addEventListener("DOMContentLoaded", function () {
  const lines = {
    head: [
      "别戳我头啦",
      "头发会乱掉的"
    ],
    face: [
      "捏脸是要收费的",
      "脸不是这样玩的啦"
    ],
    shoulder: [
      "这里不许乱碰哦",
	"变态啊!",
	"别摸了",
      "我要报警了!",
	"喂,幺幺零吗"
    ],
    hand: [
      "要牵手吗？",
      "手在这里哦"
    ],
    body: [
      "欢迎来到我的博客",
	"右边可以听歌和切换主题哦",
      "点我一下就会说话"
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

    const canvas =
      root.querySelector("#live2dcanvas") ||
      document.getElementById("live2dcanvas") ||
      root.querySelector("canvas");

    if (!canvas) return;

    if (getComputedStyle(root).position === "static") {
      root.style.position = "fixed";
    }

    const hotzones = document.createElement("div");
    hotzones.id = "waifu-hotzones";

    const bubble = document.createElement("div");
    bubble.id = "waifu-bubble";
    bubble.textContent = "调试模式已开启";

    const zones = [
  { name: "body", label: "body", style: "left:20%;top:10%;width:50%;height:82%;z-index:1;" },
  { name: "shoulder", label: "shoulder", style: "left:22%;top:46%;width:46%;height:16%;z-index:2;" },

  { name: "hand", label: "left-hand", style: "left:12%;top:64%;width:14%;height:16%;z-index:3;" },
  { name: "hand", label: "right-hand", style: "left:60%;top:66%;width:14%;height:14%;z-index:3;" },

  { name: "face", label: "face", style: "left:30%;top:31%;width:30%;height:14%;z-index:4;" },
  { name: "head", label: "head", style: "left:24%;top:14%;width:42%;height:16%;z-index:5;" }
];

    zones.forEach(function (z) {
      const el = document.createElement("div");
      el.className = "waifu-zone";
      el.dataset.zone = z.name;
      el.textContent = z.label;
      el.style.cssText = z.style;
      hotzones.appendChild(el);
    });

    root.appendChild(hotzones);
    root.appendChild(bubble);

    function syncHotzones() {
      const rect = canvas.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();

      hotzones.style.left = (rect.left - rootRect.left) + "px";
      hotzones.style.top = (rect.top - rootRect.top) + "px";
      hotzones.style.width = rect.width + "px";
      hotzones.style.height = rect.height + "px";
    }

    syncHotzones();
    window.addEventListener("resize", syncHotzones);
    window.addEventListener("scroll", syncHotzones);
    setInterval(syncHotzones, 800);

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
      }, 1800);
    }

    hotzones.addEventListener("click", function (e) {
      const target = e.target;
      if (!target.classList.contains("waifu-zone")) return;

      const zone = target.dataset.zone || "body";
      say(pick(lines[zone] || lines.body));
      e.stopPropagation();
    });
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