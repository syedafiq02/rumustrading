(function () {
  "use strict";

  // Navigation buttons carry their destination in data-href, so the markup
  // stays free of inline handlers and every page shares one wiring script.
  var buttons = document.querySelectorAll("[data-href]");

  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener("click", function () {
      var target = button.getAttribute("data-href");
      if (target) window.location.href = target;
    });
  });
})();
