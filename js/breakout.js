(function () {
  "use strict";

  var DIVISOR = 1.9;
  var DASH = "—";

  var el = {
    high: document.getElementById("high"),
    low: document.getElementById("low"),
    notice: document.getElementById("notice"),
    upperValue: document.getElementById("upperValue"),
    lowerValue: document.getElementById("lowerValue"),
    upperNote: document.getElementById("upperNote"),
    lowerNote: document.getElementById("lowerNote"),
    upperTile: document.getElementById("upperTile"),
    lowerTile: document.getElementById("lowerTile")
  };

  // Accepts "4335.24", "4,335.24", " 4335.24 ". Returns null when it is not a finite number.
  function parseNum(raw) {
    var cleaned = String(raw).replace(/[\s,]/g, "");
    if (cleaned === "") return null;
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return null;
    var n = Number(cleaned);
    return isFinite(n) ? n : null;
  }

  function fmt(n, dp) {
    return (typeof n === "number" && isFinite(n)) ? n.toFixed(dp) : DASH;
  }

  function setInvalid(input, bad) {
    if (bad) { input.classList.add("invalid"); } else { input.classList.remove("invalid"); }
  }

  function clearResults() {
    el.upperValue.textContent = DASH;
    el.lowerValue.textContent = DASH;
    el.upperNote.textContent = "";
    el.lowerNote.textContent = "";
    el.upperTile.dataset.copy = "";
    el.lowerTile.dataset.copy = "";
  }

  function showNotice(message) {
    el.notice.textContent = message;
    el.notice.hidden = false;
  }

  function hideNotice() {
    el.notice.hidden = true;
    el.notice.textContent = "";
  }

  function calculate() {
    // Both fields empty is the resting state, not an error.
    if (el.high.value.trim() === "" && el.low.value.trim() === "") {
      setInvalid(el.high, false);
      setInvalid(el.low, false);
      clearResults();
      hideNotice();
      return;
    }

    var high = parseNum(el.high.value);
    var low = parseNum(el.low.value);

    setInvalid(el.high, high === null);
    setInvalid(el.low, low === null);

    if (high === null || low === null) {
      clearResults();
      showNotice("Enter numeric values for High and Low.");
      return;
    }

    if (high <= low) {
      setInvalid(el.high, true);
      setInvalid(el.low, true);
      clearResults();
      showNotice("High must be greater than Low.");
      return;
    }

    var distance = (high - low) / DIVISOR;

    // SELL breakout, above the high: H + ((H - L) / 1.9)  -> the upper target.
    // BUY  breakout, below the low:  L - ((H - L) / 1.9)  -> the lower target.
    var sell = high + distance;
    var buy = low - distance;

    if (!isFinite(distance) || !isFinite(buy) || !isFinite(sell)) {
      clearResults();
      showNotice("Those numbers are too large to price. Try smaller values.");
      return;
    }

    hideNotice();

    el.upperValue.textContent = fmt(sell, 2);
    el.lowerValue.textContent = fmt(buy, 2);
    el.upperNote.textContent = "";
    el.lowerNote.textContent = "";
    el.upperTile.dataset.copy = fmt(sell, 2);
    el.lowerTile.dataset.copy = fmt(buy, 2);
  }

  function copyLevel(tile, noteEl) {
    var value = tile.dataset.copy;
    if (!value) return;

    var done = function () {
      noteEl.textContent = "Copied " + value;
      window.setTimeout(function () {
        noteEl.textContent = "";
      }, 1200);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, function () {});
      return;
    }

    try {
      var tmp = document.createElement("textarea");
      tmp.value = value;
      tmp.setAttribute("readonly", "");
      tmp.style.position = "fixed";
      tmp.style.opacity = "0";
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
      done();
    } catch (err) {
      // Clipboard unavailable: the value stays on screen to read off.
    }
  }

  ["high", "low"].forEach(function (key) {
    el[key].addEventListener("input", calculate);
    el[key].addEventListener("keydown", function (event) {
      if (event.key === "Enter") calculate();
    });
  });

  document.getElementById("calc").addEventListener("click", calculate);

  document.getElementById("reset").addEventListener("click", function () {
    el.high.value = "";
    el.low.value = "";
    calculate();
    el.high.focus();
  });

  el.upperTile.addEventListener("click", function () {
    copyLevel(el.upperTile, el.upperNote);
  });

  el.lowerTile.addEventListener("click", function () {
    copyLevel(el.lowerTile, el.lowerNote);
  });

  calculate();
})();
