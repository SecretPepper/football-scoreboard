(() => {
  "use strict";

  let last = {
    homeScore: 0,
    awayScore: 0,
    elapsedMs: 0,
    running: false
  };

  function getNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(getNumber(ms) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return String(minutes).padStart(2, "0") + ":" +
           String(seconds).padStart(2, "0");
  }

  function render(state) {
    last = state || last;

    const home = document.getElementById("homeScore");
    const away = document.getElementById("awayScore");
    const timer = document.getElementById("timer");

    if (home && state.homeScore !== undefined) {
      home.textContent = Math.max(0, Math.floor(getNumber(state.homeScore)));
    }

    if (away && state.awayScore !== undefined) {
      away.textContent = Math.max(0, Math.floor(getNumber(state.awayScore)));
    }

    if (timer) {
      let elapsed = getNumber(state.elapsedMs, 0);

      // Also support alternate state formats from older control pages.
      if (!state.elapsedMs && state.timeMs !== undefined) {
        elapsed = getNumber(state.timeMs, 0);
      }

      if (!state.elapsedMs && state.timer !== undefined) {
        elapsed = getNumber(state.timer, 0);
      }

      timer.textContent = formatTime(elapsed);
    }
  }

  async function sync() {
    try {
      const response = await fetch("/state?_" + Date.now(), {
        cache: "no-store"
      });

      if (!response.ok) return;

      render(await response.json());
    } catch {
      // Keep the last visible scoreboard state if the connection drops.
    }
  }

  render(last);
  sync();
  setInterval(sync, 250);
})();
