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
 * INITIAL STATE
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
  document.getElementById("competition-logo");

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
 * RENDER
 * ============================================================
 */

function render() {

  homeName.textContent =
    state.homeName;

  awayName.textContent =
    state.awayName;

  homeScore.textContent =
    state.homeScore;

  awayScore.textContent =
    state.awayScore;


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
   * CLUB COLOURS
   *
   * These are supplied by the club database
   * in control.html.
   */

  homePanel.style.setProperty(
    "--club-color",
    state.homeColor
  );

  homePanel.style.setProperty(
    "--club-secondary",
    state.homeSecondary
  );

  awayPanel.style.setProperty(
    "--club-color",
    state.awayColor
  );

  awayPanel.style.setProperty(
    "--club-secondary",
    state.awaySecondary
  );


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

const peer =
  new Peer(
    displayId,
    {
      debug: 0
    }
  );


peer.on(
  "open",
  id => {

    console.log(
      "Scoreboard ready:",
      id
    );
  }
);


peer.on(
  "connection",
  connection => {

    console.log(
      "Control panel connected."
    );

    connection.on(
      "open",
      () => {

        /*
         * Immediately send the current
         * scoreboard state to the control panel.
         */

        connection.send({
          type: "state",
          state: {
            ...state
          }
        });
      }
    );


    connection.on(
      "data",
      data => {

        if (
          !data ||
          data.type !== "state" ||
          !data.state
        ) {
          return;
        }


        /*
         * Merge incoming state.
         */

        state = {
          ...state,
          ...data.state
        };


        render();


        /*
         * Send the new state back to the
         * control panel so both sides stay
         * synchronised.
         */

        connection.send({
          type: "state",
          state: {
            ...state
          }
        });
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
          "Connection error:",
          error
        );
      }
    );

  }
);


peer.on(
  "error",
  error => {

    console.error(
      "PeerJS error:",
      error
    );
  }
);


/*
 * ============================================================
 * CONTINUOUS CLOCK UPDATE
 * ============================================================
 */

setInterval(
  () => {

    timer.textContent =
      formatTime(
        getElapsed()
      );

  },
  250
);


/*
 * ============================================================
 * FIRST RENDER
 * ============================================================
 */

render();
