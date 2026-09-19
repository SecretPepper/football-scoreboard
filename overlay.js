(() => {
  "use strict";

  const params = new URLSearchParams(location.search);
  const room = (params.get("room") || "premier-league-match")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 40) || "premier-league-match";

  const displayId = "scoreboard-" + room + "-display";

  let state = {
    homeName: "FUL",
    awayName: "MUN",
    homeLogo: "assets/fulham.png",
    awayLogo: "assets/manchester-united.png",
    homeScore: 0,
    awayScore: 0,
    elapsedMs: 0,
    running: false,
    startedAt: null
  };

  function $(id){ return document.getElementById(id); }

  function elapsedMs() {
    if (state.running && state.startedAt) {
      return Math.max(0, Number(state.elapsedMs || 0) + (Date.now() - Number(state.startedAt)));
    }
    return Math.max(0, Number(state.elapsedMs || 0));
  }

  function formatTime(ms) {
    const total = Math.floor(Math.max(0, ms) / 1000);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return String(minutes).padStart(2,"0") + ":" + String(seconds).padStart(2,"0");
  }

  function render() {
    $("homeName").textContent = state.homeName || "HOME";
    $("awayName").textContent = state.awayName || "AWAY";
    $("homeScore").textContent = Math.max(0, Math.floor(Number(state.homeScore) || 0));
    $("awayScore").textContent = Math.max(0, Math.floor(Number(state.awayScore) || 0));
    $("homeLogo").src = state.homeLogo || "assets/fulham.png";
    $("awayLogo").src = state.awayLogo || "assets/manchester-united.png";
    $("timer").textContent = formatTime(elapsedMs());
  }

  function startPeer() {
    const peer = new Peer(displayId, { debug: 0 });

    peer.on("open", () => {
      render();
    });

    peer.on("connection", conn => {
      conn.on("data", data => {
        if (!data) return;

        if (data.type === "state" && data.state) {
          state = {
            ...state,
            ...data.state
          };
          render();
        }
      });

      conn.on("open", () => {
        conn.send({ type: "state", state });
      });
    });

    peer.on("error", err => {
      console.error("PeerJS error:", err);
      if (err && err.type === "unavailable-id") {
        // Another OBS tab may already own the room. Reloading lets
        // PeerJS reclaim the display ID after the old tab closes.
      }
    });
  }

  render();
  setInterval(render, 250);
  startPeer();
})();
