(function () {
  "use strict";

  var MODEL_URL = "/live2d/anan/anan.model3.json?v=20260511d";
  var STORAGE_KEY = "anan-live2d-hidden";
  var WIDTH = 260;
  var HEIGHT = 360;
  var MIN_RENDER_RESOLUTION = 2;
  var MAX_RENDER_RESOLUTION = 3;
  var MOBILE_MEDIA = "(max-width: 768px), (hover: none) and (pointer: coarse)";
  var DIALOGUE_VISIBLE_MS = 3800;
  var HIDE_DIALOGUE_DELAY_MS = 1200;
  var VISIBILITY_TRANSITION_MS = 260;
  var IDLE_MIN_MS = 45000;
  var IDLE_MAX_MS = 75000;
  var DIALOGUE_LINES = {
    click: [
      "你很闲吗？那就去写代码",
      "吾辈在这里，不代表可以随便戳",
      "有什么事就快说",
      "吾辈正在守护这个博客",
      "别偷懒，继续学习"
    ],
    welcome: ["欢迎来到吾辈的领地", "吾辈已经等……不，什么都没有"],
    hide: [
      "哼，吾辈先退下了",
      "需要吾辈的时候再叫吧",
      "终于能安静一会儿了",
      "别以为吾辈是被你赶走的",
      "吾辈只是暂时消失"
    ],
    restore: [
      "吾辈回来了",
      "果然还是需要吾辈吧",
      "哼，看来你还算有眼光",
      "又把吾辈叫出来了啊"
    ],
    idle: ["怎么不动了？睡着了吗？", "页面还没看完吧", "如果累了，就稍微休息一下"]
  };
  var EXPRESSION_GROUPS = [
    {
      title: "情绪",
      items: [
        { name: "shy", label: "害羞" },
        { name: "shy2", label: "害羞2" },
        { name: "angry", label: "生气" },
        { name: "namida", label: "流泪" },
        { name: "sweat", label: "流汗" },
        { name: "pale01", label: "脸色1" },
        { name: "pale02", label: "脸色2" },
        { name: "sur1", label: "惊讶" }
      ]
    },
    {
      title: "动作",
      items: [
        { name: "think", label: "思考" },
        { name: "writenote", label: "写字" },
        { name: "armLup", label: "抬手" },
        { name: "armL06", label: "左手" },
        { name: "down", label: "垂手" },
        { name: "exp1", label: "右手" },
        { name: "abb", label: "摆手" }
      ]
    },
    {
      title: "道具",
      items: [
        { name: "note", label: "便签" },
        { name: "notebig", label: "大便签" },
        { name: "notelily", label: "花签" }
      ]
    }
  ];
  var EXPRESSION_PARAM_IDS = [
    "ArmR01abb",
    "Lacehead",
    "armL06",
    "armL02",
    "armL03",
    "armR02",
    "armR05",
    "nmd",
    "note1",
    "armsbig",
    "armslily",
    "Pale001",
    "Pale002",
    "shy",
    "armL08",
    "armR06",
    "sweat",
    "armR04",
    "armR03L04"
  ];

  function isMobile() {
    return window.matchMedia && window.matchMedia(MOBILE_MEDIA).matches;
  }

  function createButton(id, text, title) {
    var button = document.createElement("button");
    button.id = id;
    button.type = "button";
    button.textContent = text;
    button.title = title;
    button.setAttribute("aria-label", title);
    return button;
  }

  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function createDialogue(root) {
    var bubble = document.createElement("div");
    var hideTimer = 0;
    var idleTimer = 0;

    bubble.id = "anan-live2d-dialogue";
    bubble.setAttribute("aria-live", "polite");
    bubble.hidden = true;
    root.appendChild(bubble);

    function clearHideTimer() {
      if (hideTimer) {
        window.clearTimeout(hideTimer);
        hideTimer = 0;
      }
    }

    function hideBubble() {
      clearHideTimer();
      bubble.classList.remove("is-visible");
      hideTimer = window.setTimeout(function () {
        bubble.hidden = true;
        hideTimer = 0;
      }, 220);
    }

    function show(lines, duration) {
      if (!lines || !lines.length || root.hidden) return;

      clearHideTimer();
      bubble.textContent = pickRandom(lines);
      bubble.hidden = false;
      bubble.classList.remove("is-visible");
      bubble.offsetHeight;
      bubble.classList.add("is-visible");

      hideTimer = window.setTimeout(hideBubble, duration || DIALOGUE_VISIBLE_MS);
    }

    function clearIdle() {
      if (idleTimer) {
        window.clearTimeout(idleTimer);
        idleTimer = 0;
      }
    }

    function scheduleIdle() {
      clearIdle();
      if (root.hidden) return;

      idleTimer = window.setTimeout(function () {
        idleTimer = 0;
        if (!root.hidden) {
          show(DIALOGUE_LINES.idle);
          scheduleIdle();
        }
      }, IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS));
    }

    return {
      show: show,
      hide: hideBubble,
      clearIdle: clearIdle,
      scheduleIdle: scheduleIdle,
      resetIdle: scheduleIdle
    };
  }

  function showError(root, message) {
    var oldError = document.getElementById("anan-live2d-error");
    if (oldError) oldError.remove();

    var error = document.createElement("div");
    error.id = "anan-live2d-error";
    error.textContent = message;
    root.appendChild(error);
  }

  function getLive2DModelClass() {
    return window.PIXI && window.PIXI.live2d && window.PIXI.live2d.Live2DModel;
  }

  function isCubismCoreReady() {
    try {
      return !!(
        window.Live2DCubismCore &&
        window.Live2DCubismCore.Version &&
        typeof window.Live2DCubismCore.Version.csmGetVersion === "function" &&
        window.Live2DCubismCore.Version.csmGetVersion()
      );
    } catch (e) {
      return false;
    }
  }

  function getRenderResolution() {
    var ratio = window.devicePixelRatio || 1;
    return Math.min(Math.max(ratio, MIN_RENDER_RESOLUTION), MAX_RENDER_RESOLUTION);
  }

  function waitForRuntime() {
    return new Promise(function (resolve) {
      var retry = 0;
      var timer = setInterval(function () {
        var Live2DModel = getLive2DModelClass();
        if ((Live2DModel && isCubismCoreReady()) || retry >= 300) {
          clearInterval(timer);
          resolve(Live2DModel && isCubismCoreReady() ? Live2DModel : null);
        }
        retry++;
      }, 100);
    });
  }

  function clearVisibilityTimer(element) {
    if (element._ananVisibilityTimer) {
      window.clearTimeout(element._ananVisibilityTimer);
      element._ananVisibilityTimer = 0;
    }
  }

  function setElementVisible(element, visible, immediate) {
    clearVisibilityTimer(element);

    if (visible) {
      element.hidden = false;
      element.classList.add("is-hidden");

      if (immediate) {
        element.classList.remove("is-hidden");
        element.classList.add("is-visible");
        return;
      }

      element.classList.remove("is-visible");
      element.offsetHeight;
      window.requestAnimationFrame(function () {
        element.classList.remove("is-hidden");
        element.classList.add("is-visible");
      });
      return;
    }

    element.classList.remove("is-visible");
    element.classList.add("is-hidden");

    if (immediate) {
      element.hidden = true;
      return;
    }

    element._ananVisibilityTimer = window.setTimeout(function () {
      element.hidden = true;
      element._ananVisibilityTimer = 0;
    }, VISIBILITY_TRANSITION_MS);
  }

  function setHidden(root, restore, hidden, dialogue, immediate) {
    if (hidden) {
      setElementVisible(restore, false, true);
      setElementVisible(root, false, immediate);
      window.setTimeout(function () {
        setElementVisible(restore, true, immediate);
      }, immediate ? 0 : VISIBILITY_TRANSITION_MS);
    } else {
      setElementVisible(restore, false, immediate);
      setElementVisible(root, true, immediate);
    }

    if (dialogue) {
      if (hidden) {
        dialogue.clearIdle();
        dialogue.hide();
      } else {
        dialogue.resetIdle();
      }
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, hidden ? "1" : "0");
    } catch (e) {}
  }

  function getExpressionItems() {
    var items = [];
    EXPRESSION_GROUPS.forEach(function (group) {
      group.items.forEach(function (item) {
        items.push(item);
      });
    });
    return items;
  }

  function stopExpressions(model) {
    var manager =
      model &&
      model.internalModel &&
      model.internalModel.motionManager &&
      model.internalModel.motionManager.expressionManager;

    if (manager && typeof manager.stopAllExpressions === "function") {
      manager.stopAllExpressions();
    }
  }

  function resetExpression(model) {
    stopExpressions(model);

    var coreModel = model && model.internalModel && model.internalModel.coreModel;
    if (!coreModel || typeof coreModel.setParameterValueById !== "function") return;

    EXPRESSION_PARAM_IDS.forEach(function (id) {
      coreModel.setParameterValueById(id, 0);
    });
  }

  async function applyRandomExpression(model) {
    var items = getExpressionItems();
    var chosen = items[Math.floor(Math.random() * items.length)];

    resetExpression(model);
    stopExpressions(model);
    await model.expression(chosen.name);
  }

  function installRandomExpressionClick(model, canvas, dialogue) {
    var busy = false;
    var lastClickAt = 0;

    canvas.title = "点击随机切换表情和台词";
    canvas.setAttribute("aria-label", "点击随机切换 Live2D 表情和台词");

    canvas.addEventListener("click", function () {
      var now = Date.now();
      if (busy || now - lastClickAt < 350) return;

      busy = true;
      lastClickAt = now;
      if (dialogue) {
        dialogue.show(DIALOGUE_LINES.click);
        dialogue.resetIdle();
      }
      applyRandomExpression(model)
        .catch(function (error) {
          console.error("Failed to switch Live2D expression", error);
        })
        .finally(function () {
          busy = false;
        });
    });
  }

  function fitModel(model, app) {
    var stage = app.screen || { width: WIDTH, height: HEIGHT };
    var stageWidth = stage.width;
    var stageHeight = stage.height;

    if (model.anchor && model.anchor.set) {
      model.anchor.set(0.5, 1);
      model.x = stageWidth / 2;
      model.y = stageHeight;
    }

    var bounds = model.getLocalBounds ? model.getLocalBounds() : model.getBounds ? model.getBounds() : null;
    var modelWidth = bounds && bounds.width ? bounds.width : model.width;
    var modelHeight = bounds && bounds.height ? bounds.height : model.height;
    var scale = Math.min((stageWidth * 0.94) / modelWidth, (stageHeight * 0.98) / modelHeight);

    if (Number.isFinite(scale) && scale > 0) {
      model.scale.set(scale);
    }

    if (!model.anchor || !model.anchor.set) {
      model.x = Math.max(0, (stageWidth - model.width) / 2);
      model.y = Math.max(0, stageHeight - model.height);
    }
  }

  function installMouseFollow(model, app, canvas, root) {
    if (!model || typeof model.focus !== "function") return;

    var stage = app.screen || { width: WIDTH, height: HEIGHT };
    var focusPoint = { x: stage.width / 2, y: stage.height / 2 };
    var raf = 0;

    function requestFocusUpdate() {
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        if (!root.hidden && !model.destroyed) {
          model.focus(focusPoint.x, focusPoint.y);
        }
      });
    }

    document.addEventListener(
      "mousemove",
      function (event) {
        var rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        focusPoint.x = (event.clientX - rect.left) * (stage.width / rect.width);
        focusPoint.y = (event.clientY - rect.top) * (stage.height / rect.height);
        requestFocusUpdate();
      },
      { passive: true }
    );

    document.addEventListener(
      "mouseleave",
      function () {
        focusPoint.x = stage.width / 2;
        focusPoint.y = stage.height / 2;
        requestFocusUpdate();
      },
      { passive: true }
    );
  }

  async function init() {
    if (isMobile() || document.getElementById("anan-live2d")) return;

    var root = document.createElement("div");
    root.id = "anan-live2d";
    root.classList.add("is-hidden");
    var hideTimer = 0;

    var canvas = document.createElement("canvas");
    canvas.id = "anan-live2d-canvas";
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    root.appendChild(canvas);

    var close = createButton("anan-live2d-close", "x", "Hide Live2D");
    root.appendChild(close);
    var dialogue = createDialogue(root);

    var restore = createButton("anan-live2d-restore", "Show", "Show Live2D");
    restore.classList.add("is-hidden");
    restore.hidden = true;

    document.body.appendChild(root);
    document.body.appendChild(restore);

    close.addEventListener("click", function () {
      if (close.disabled || root.hidden) return;

      close.disabled = true;
      dialogue.clearIdle();
      dialogue.show(DIALOGUE_LINES.hide, HIDE_DIALOGUE_DELAY_MS + 500);
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(function () {
        hideTimer = 0;
        close.disabled = false;
        setHidden(root, restore, true, dialogue);
      }, HIDE_DIALOGUE_DELAY_MS);
    });

    restore.addEventListener("click", function () {
      if (hideTimer) {
        window.clearTimeout(hideTimer);
        hideTimer = 0;
      }
      close.disabled = false;
      setHidden(root, restore, false, dialogue);
      dialogue.show(DIALOGUE_LINES.restore);
    });

    var startHidden = false;
    try {
      startHidden = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {}

    if (startHidden) {
      setHidden(root, restore, true, dialogue, true);
    } else {
      setElementVisible(root, true, false);
      setElementVisible(restore, false, true);
    }

    var Live2DModel = await waitForRuntime();
    if (!window.PIXI || !Live2DModel) {
      showError(root, "Live2D runtime failed to load.");
      return;
    }

    try {
      if (window.PIXI.settings && window.PIXI.SCALE_MODES) {
        window.PIXI.settings.SCALE_MODE = window.PIXI.SCALE_MODES.LINEAR;
      }

      var app = new window.PIXI.Application({
        view: canvas,
        width: WIDTH,
        height: HEIGHT,
        transparent: true,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: getRenderResolution(),
        autoStart: true
      });

      var model = await Live2DModel.from(MODEL_URL, {
        autoInteract: false
      });

      app.stage.addChild(model);
      fitModel(model, app);
      installMouseFollow(model, app, canvas, root);
      installRandomExpressionClick(model, canvas, dialogue);
      if (!root.hidden) {
        dialogue.show(DIALOGUE_LINES.welcome);
        dialogue.scheduleIdle();
      }
    } catch (error) {
      console.error("Failed to load AnAn Live2D model", error);
      showError(root, "Live2D model failed to load.");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
