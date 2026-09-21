/*
 * ============================================================
 * FOOTBALL SCOREBOARD OVERLAY
 * ============================================================
 */

const params =
  new URLSearchParams(
    window.location.search
  );


const room =
  params.get("room") ||
  "premier-league-match";


const displayId =
  "scoreboard-" +
  room +
  "-display";


/*
 * ============================================================
 * STATE
 * ============================================================
 */

let state = {

  homeName: "FUL",
  awayName: "MUN",

  homeClub: "fulham",
  awayClub: "manchester-united",

  homeLogo:
    "assets/clubs-and-countries/fulham.png",

  awayLogo:
    "assets/clubs-and-countries/manchester-united.png",

  homeColor: "#000000",
  homeSecondary: "#ffffff",

  awayColor: "#da291c",
  awaySecondary: "#000000",

  competitionLogo:
    "assets/competitions/premier-league.png",

  homeScore: 0,
  awayScore: 0,

  elapsedMs: 0,
  running: false,
  startedAt: null

};


/*
 * ============================================================
 * ELEMENTS
 * ============================================================
 */

const homePanel =
  document.getElementById("home-panel");

const awayPanel =
  document.getElementById("away-panel");

const homeLogo =
  document.getElementById("home-logo");

const awayLogo =
  document.getElementById("away-logo");

const homeName =
  document.getElementById("home-name");

const awayName =
  document.getElementById("away-name");

const homeScore =
  document.getElementById("home-score");

const awayScore =
  document.getElementById("away-score");

const competitionLogo =
  document.getElementById(
    "competition-logo"
  );

const timer =
  document.getElementById("timer");


/*
 * ============================================================
 * CLOCK
 * ============================================================
 */

function getElapsed() {

  if (
    state.running &&
    state.startedAt !== null
  ) {

    return (
      state.elapsedMs +
      (
        Date.now() -
        state.startedAt
      )
    );

  }

  return state.elapsedMs;

}


function formatTime(milliseconds) {

  const totalSeconds =
    Math.floor(
      Math.max(
        0,
        milliseconds
      ) / 1000
    );


  const minutes =
    Math.floor(
      totalSeconds / 60
    );


  const seconds =
    totalSeconds % 60;


  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );

}


/*
 * ============================================================
 * RENDER SCOREBOARD
 * ============================================================
 */

function render() {

  /*
   * TEAM NAMES
   */

  homeName.textContent =
    state.homeName || "FUL";

  awayName.textContent =
    state.awayName || "MUN";


  /*
   * SCORES
   */

  homeScore.textContent =
    Number(state.homeScore) || 0;

  awayScore.textContent =
    Number(state.awayScore) || 0;


  /*
   * CLUB LOGOS
   */

  if (state.homeLogo) {

    homeLogo.src =
      state.homeLogo;

  }


  if (state.awayLogo) {

    awayLogo.src =
      state.awayLogo;

  }


  /*
   * COMPETITION
   */

  if (state.competitionLogo) {

    competitionLogo.src =
      state.competitionLogo;

  }


  /*
   * HOME COLOUR
   */

  homePanel.style.setProperty(
    "--club-color",
    state.homeColor ||
    "#000000"
  );


  homePanel.style.setProperty(
    "--club-secondary",
    state.homeSecondary ||
    "#ffffff"
  );


  /*
   * AWAY COLOUR
   */

  awayPanel.style.setProperty(
    "--club-color",
    state.awayColor ||
    "#000000"
  );


  awayPanel.style.setProperty(
    "--club-secondary",
    state.awaySecondary ||
    "#ffffff"
  );


  /*
   * CLOCK
   */

  timer.textContent =
    formatTime(
      getElapsed()
    );

}


/*
 * ============================================================
 * PEERJS
 * ============================================================
 */

let peer;


try {

  peer =
    new Peer(
      displayId,
      {
        debug: 1
      }
    );

} catch (error) {

  console.error(
    "Could not create PeerJS:",
    error
  );

}


/*
 * ============================================================
 * PEER OPEN
 * ============================================================
 */

peer.on(
  "open",
  id => {

    console.log(
      "================================"
    );

    console.log(
      "SCOREBOARD READY"
    );

    console.log(
      "Room:",
      room
    );

    console.log(
      "Display ID:",
      id
    );

    console.log(
      "================================"
    );

  }
);


/*
 * ============================================================
 * CONTROL PANEL CONNECTED
 * ============================================================
 */

peer.on(
  "connection",
  connection => {

    console.log(
      "Control panel connection received."
    );


    connection.on(
      "open",
      () => {

        console.log(
          "Control panel connected."
        );


        /*
         * Send current state immediately.
         */

        try {

          connection.send({
            type: "state",
            state: {
              ...state
            }
          });

        } catch (error) {

          console.error(
            "Initial state send failed:",
            error
          );

        }

      }
    );


    /*
     * ========================================================
     * RECEIVE STATE
     * ========================================================
     */

    connection.on(
      "data",
      data => {

        console.log(
          "Data received:",
          data
        );


        if (
          !data ||
          data.type !== "state" ||
          !data.state
        ) {

          return;

        }


        /*
         * Merge the new state.
         */

        state = {
          ...state,
          ...data.state
        };


        /*
         * IMPORTANT:
         * Render immediately.
         */

        render();


        /*
         * Send the confirmed state
         * back to the control panel.
         */

        try {

          connection.send({
            type: "state",
            state: {
              ...state
            }
          });

        } catch (error) {

          console.error(
            "State confirmation failed:",
            error
          );

        }

      }
    );


    connection.on(
      "close",
      () => {

        console.log(
          "Control panel disconnected."
        );

      }
    );


    connection.on(
      "error",
      error => {

        console.error(
          "Control connection error:",
          error
        );

      }
    );

  }
);


/*
 * ============================================================
 * PEER ERRORS
 * ============================================================
 */

peer.on(
  "error",
  error => {

    console.error(
      "================================"
    );

    console.error(
      "PEERJS ERROR:",
      error
    );

    console.error(
      "================================"
    );

  }
);


/*
 * ============================================================
 * CONTINUOUS CLOCK
 * ============================================================
 */

setInterval(
  () => {

    if (timer) {

      timer.textContent =
        formatTime(
          getElapsed()
        );

    }

  },
  250
);


/*
 * ============================================================
 * FIRST RENDER
 * ============================================================
 */

render();