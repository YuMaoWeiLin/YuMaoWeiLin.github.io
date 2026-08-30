(function () {
  "use strict";

  // pjax 换页会替换 <title>,因此离开时读取当前标题、返回时还原,不做加载时缓存
  var HIDDEN_TITLE = "回来看看吧";
  var titleBeforeHide = null;

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      titleBeforeHide = document.title;
      document.title = HIDDEN_TITLE;
    } else if (titleBeforeHide !== null) {
      document.title = titleBeforeHide;
      titleBeforeHide = null;
    }
  });
})();
