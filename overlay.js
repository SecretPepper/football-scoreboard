/* ============================================================
   ROOM
============================================================ */

const params =
  new URLSearchParams(
    window.location.search
  );

const room =
  params.get("room") ||
  "match-preview";

const displayId =
  "scoreboard-" +
  room +
  "-display";


console.log(
  "================================"
);

console.log(
  "SCOREBOARD STARTING"
);

console.log(
  "Room:",
  room
);

console.log(
  "Display ID:",
  displayId
);

console.log(
  "================================"
);


/* ============================================================
   DEFAULT STATE
============================================================ */

let state = {

  homeName: "...",
  awayName: "...",

  homeClub: "",
  awayClub: "",

  homeLogo:
    "assets/clubs-and-countries/default.png",

  awayLogo:
    "assets/clubs-and-countries/default.png",

  homeColor: "#7a7a7a",
  homeSecondary: "#000",

  awayColor: "#7a7a7a",
  awaySecondary: "#000",

  competitionLogo:
    "assets/competitions/premier-league.png",

  homeScore: 0,
  awayScore: 0,

  elapsedMs: 0,
  running: false,
  startedAt: null

};


/* ============================================================
   DOM
============================================================ */

const scoreboard =
  document.getElementById(
    "scoreboard"
  );


const homePanel =
  document.getElementById(
    "home-panel"
  );


const awayPanel =
  document.getElementById(
    "away-panel"
  );


const homeName =
  document.getElementById(
    "home-name"
  );


const awayName =
  document.getElementById(
    "away-name"
  );


const homeScore =
  document.getElementById(
    "home-score"
  );


const awayScore =
  document.getElementById(
    "away-score"
  );


const homeLogo =
  document.getElementById(
    "home-logo"
  );


const awayLogo =
  document.getElementById(
    "away-logo"
  );


const competitionLogo =
  document.getElementById(
    "competition-logo"
  );


const timer =
  document.getElementById(
    "timer"
  );


/* ============================================================
   CLOCK
============================================================ */

let clockStartTime = null;

let clockStartSeconds = 0;


/* ============================================================
   FORMAT TIME
============================================================ */

function formatTime(seconds) {

  seconds =
    Math.max(
      0,
      Math.floor(
        Number(seconds) || 0
      )
    );


  const minutes =
    Math.floor(
      seconds / 60
    );


  const secs =
    seconds % 60;


  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );

}


/* ============================================================
   ELAPSED TIME
============================================================ */

function getElapsedSeconds() {

  if (
    !state.running ||
    clockStartTime === null
  ) {

    return Math.floor(
      Number(
        state.elapsedMs || 0
      ) / 1000
    );

  }


  return (
    clockStartSeconds +
    Math.floor(
      (
        Date.now() -
        clockStartTime
      ) / 1000
    )
  );

}


/* ============================================================
   RENDER
============================================================ */

function render() {

  homeName.textContent =
    state.homeName || "...";


  awayName.textContent =
    state.awayName || "...";


  homeScore.textContent =
    Number(
      state.homeScore
    ) || 0;


  awayScore.textContent =
    Number(
      state.awayScore
    ) || 0;


  if (state.homeLogo) {

    homeLogo.src =
      state.homeLogo;

  }


  if (state.awayLogo) {

    awayLogo.src =
      state.awayLogo;

  }


  if (state.competitionLogo) {

    competitionLogo.src =
      state.competitionLogo;

  }


  homePanel.style.setProperty(
    "--club-color",
    state.homeColor ||
    "#7a7a7a"
  );


  homePanel.style.setProperty(
    "--club-secondary",
    state.homeSecondary ||
    "#000000"
  );


  awayPanel.style.setProperty(
    "--club-color",
    state.awayColor ||
    "#7a7a7a"
  );


  awayPanel.style.setProperty(
    "--club-secondary",
    state.awaySecondary ||
    "#000000"
  );

  homePanel.dataset.club = state.homeClub || "";
  awayPanel.dataset.club = state.awayClub || "";


  timer.textContent =
    formatTime(
      getElapsedSeconds()
    );

}


/* ============================================================
   APPLY CONTROL STATE
============================================================ */

function applyState(newState) {

  if (!newState) {
    return;
  }


  console.log(
    "STATE FROM CONTROL:",
    newState
  );


  const wasRunning =
    state.running;


  state = {
    ...state,
    ...newState
  };


  /* CLOCK START */

  if (
    state.running &&
    !wasRunning
  ) {

    clockStartSeconds =
      Math.floor(
        Number(
          state.elapsedMs || 0
        ) / 1000
      );


    clockStartTime =
      Date.now();

  }


  /* CLOCK STOP */

  if (!state.running) {

    clockStartSeconds =
      Math.floor(
        Number(
          state.elapsedMs || 0
        ) / 1000
      );


    clockStartTime =
      null;

  }


  render();

}


/* ============================================================
   PEERJS
============================================================ */

let peer = null;

let controlConnection = null;


/* ============================================================
   CREATE PEER
============================================================ */

function createPeer() {

  console.log(
    "Creating scoreboard PeerJS..."
  );


  peer =
    new Peer(
      displayId,
      {
        debug: 2
      }
    );


  /* ==========================================================
     PEER OPEN
  ========================================================== */

  peer.on(
    "open",
    id => {

      console.log(
        "SCOREBOARD PEER READY:",
        id
      );

    }
  );


  /* ==========================================================
     CONTROL CONNECTS
  ========================================================== */

  peer.on(
    "connection",
    connection => {

      console.log(
        "CONTROL CONNECTED"
      );


      controlConnection =
        connection;


      connection.on(
        "open",
        () => {

          console.log(
            "CONTROL CONNECTION OPEN"
          );


          /*
           * Ask the control panel for its
           * current state.
           */

          connection.send({
            type: "request-state"
          });

        }
      );


      connection.on(
        "data",
        message => {

          console.log(
            "DATA FROM CONTROL:",
            message
          );


          if (
            message &&
            message.type === "state" &&
            message.state
          ) {

            applyState(
              message.state
            );

          }

        }
      );


      connection.on(
        "close",
        () => {

          console.log(
            "CONTROL DISCONNECTED"
          );


          if (
            controlConnection ===
            connection
          ) {

            controlConnection =
              null;

          }

        }
      );


      connection.on(
        "error",
        error => {

          console.error(
            "CONTROL CONNECTION ERROR:",
            error
          );

        }
      );

    }
  );


  /* ==========================================================
     PEER ERROR
  ========================================================== */

  peer.on(
    "error",
    error => {

      console.error(
        "PEERJS ERROR:",
        error
      );

    }
  );


  /* ==========================================================
     PEER DISCONNECTED
  ========================================================== */

  peer.on(
    "disconnected",
    () => {

      console.warn(
        "PEERJS DISCONNECTED"
      );


      setTimeout(
        () => {

          if (
            peer &&
            !peer.destroyed
          ) {

            try {

              peer.reconnect();

            } catch (error) {

              console.error(
                "RECONNECT FAILED:",
                error
              );

            }

          }

        },
        2000
      );

    }
  );

}


/* ============================================================
   CLOCK DISPLAY
============================================================ */

setInterval(
  () => {

    timer.textContent =
      formatTime(
        getElapsedSeconds()
      );

  },
  250
);


/* ============================================================
   START
============================================================ */

render();

createPeer();