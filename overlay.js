const params = new URLSearchParams(window.location.search);
const room = params.get("room") || "premier-league-match";

const displayId = `scoreboard-${room}-display`;

console.log("================================");
console.log("SCOREBOARD READY");
console.log("Room:", room);
console.log("Display ID:", displayId);
console.log("================================");


/* ============================================================
   STATE
============================================================ */

const state = {

    homeName: "FUL",
    awayName: "MUN",

    homeClub: "fulham",
    awayClub: "manchester-united",

    homeLogo: "assets/clubs-and-countries/fulham.png",
    awayLogo: "assets/clubs-and-countries/manchester-united.png",

    homeColor: "#111111",
    homeSecondary: "#ffffff",

    awayColor: "#da291c",
    awaySecondary: "#fbe122",

    competitionLogo:
        "assets/competitions/premier-league.png",

    homeScore: 0,
    awayScore: 0,

    clockRunning: false,
    clockSeconds: 0
};


/* ============================================================
   DOM
============================================================ */

const scoreboard =
    document.getElementById("scoreboard");

const homePanel =
    document.getElementById("home-panel");

const awayPanel =
    document.getElementById("away-panel");

const homeNameEl =
    document.getElementById("home-name");

const awayNameEl =
    document.getElementById("away-name");

const homeScoreEl =
    document.getElementById("home-score");

const awayScoreEl =
    document.getElementById("away-score");

const homeLogoEl =
    document.getElementById("home-logo");

const awayLogoEl =
    document.getElementById("away-logo");

const competitionLogoEl =
    document.getElementById("competition-logo");

const timerEl =
    document.getElementById("timer");


/* ============================================================
   CLOCK
============================================================ */

let clockStartTime = null;
let clockStartSeconds = 0;


function formatTime(seconds) {

    seconds = Math.max(
        0,
        Math.floor(Number(seconds) || 0)
    );

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


function getElapsedSeconds() {

    if (
        !state.clockRunning ||
        clockStartTime === null
    ) {
        return Number(state.clockSeconds) || 0;
    }

    return (
        clockStartSeconds +
        Math.floor(
            (Date.now() - clockStartTime) / 1000
        )
    );
}


/* ============================================================
   RENDER
============================================================ */

function render() {

    console.log(
        "Rendering:",
        state.homeName,
        state.homeScore,
        "-",
        state.awayScore,
        state.awayName
    );


    /* ----------------------------
       Text
    ---------------------------- */

    homeNameEl.textContent =
        state.homeName;

    awayNameEl.textContent =
        state.awayName;

    homeScoreEl.textContent =
        state.homeScore;

    awayScoreEl.textContent =
        state.awayScore;


    /* ----------------------------
       Club logos
    ---------------------------- */

    if (state.homeLogo) {
        homeLogoEl.src =
            state.homeLogo;
    }

    if (state.awayLogo) {
        awayLogoEl.src =
            state.awayLogo;
    }


    /* ----------------------------
       Competition
    ---------------------------- */

    if (state.competitionLogo) {

        competitionLogoEl.src =
            state.competitionLogo;

        competitionLogoEl.style.display =
            "block";
    }


    /* ----------------------------
       HOME COLORS
    ---------------------------- */

    homePanel.style.setProperty(
        "--club-color",
        state.homeColor || "#111111"
    );

    homePanel.style.setProperty(
        "--club-secondary",
        state.homeSecondary || "#ffffff"
    );


    /* ----------------------------
       AWAY COLORS
    ---------------------------- */

    awayPanel.style.setProperty(
        "--club-color",
        state.awayColor || "#111111"
    );

    awayPanel.style.setProperty(
        "--club-secondary",
        state.awaySecondary || "#ffffff"
    );


    /* ----------------------------
       Scoreboard root variables
    ---------------------------- */

    scoreboard.style.setProperty(
        "--home-color",
        state.homeColor || "#111111"
    );

    scoreboard.style.setProperty(
        "--home-secondary",
        state.homeSecondary || "#ffffff"
    );

    scoreboard.style.setProperty(
        "--away-color",
        state.awayColor || "#111111"
    );

    scoreboard.style.setProperty(
        "--away-secondary",
        state.awaySecondary || "#ffffff"
    );


    /* ----------------------------
       Timer
    ---------------------------- */

    timerEl.textContent =
        formatTime(
            getElapsedSeconds()
        );
}


/* ============================================================
   APPLY STATE FROM CONTROL
============================================================ */

function applyIncomingState(newState) {

    if (!newState) {
        console.warn(
            "Received empty state."
        );
        return;
    }

    console.log(
        "================================"
    );

    console.log(
        "STATE RECEIVED FROM CONTROL"
    );

    console.log(
        newState
    );

    console.log(
        "================================"
    );


    const wasRunning =
        state.clockRunning;


    Object.assign(
        state,
        newState
    );


    /* ----------------------------
       Clock transition
    ---------------------------- */

    if (
        state.clockRunning &&
        !wasRunning
    ) {

        clockStartSeconds =
            Number(state.clockSeconds) || 0;

        clockStartTime =
            Date.now();

    }


    if (!state.clockRunning) {

        state.clockSeconds =
            Number(state.clockSeconds) || 0;

        clockStartSeconds =
            state.clockSeconds;

        clockStartTime =
            null;
    }


    /* ----------------------------
       Render immediately
    ---------------------------- */

    render();
}


/* ============================================================
   PEERJS
============================================================ */

let peer = null;
let controlConnection = null;


function createPeer() {

    console.log(
        "Creating PeerJS scoreboard..."
    );


    peer = new Peer(
        displayId,
        {
            debug: 3
        }
    );


    /* ----------------------------
       Peer ready
    ---------------------------- */

    peer.on("open", id => {

        console.log(
            "================================"
        );

        console.log(
            "SCOREBOARD PEER READY"
        );

        console.log(
            "Peer ID:",
            id
        );

        console.log(
            "================================"
        );
    });


    /* ----------------------------
       Control connection
    ---------------------------- */

    peer.on(
        "connection",
        connection => {

            console.log(
                "Control panel connection received."
            );

            controlConnection =
                connection;


            connection.on(
                "open",
                () => {

                    console.log(
                        "Control panel connected."
                    );


                    /*
                       Send current state
                       back to control.
                    */

                    sendCurrentState(
                        connection
                    );
                }
            );


            connection.on(
                "data",
                message => {

                    console.log(
                        "Data received:",
                        message
                    );


                    if (
                        message &&
                        message.type === "state"
                    ) {

                        applyIncomingState(
                            message.state
                        );


                        /*
                           Confirm the state
                           back to control.
                        */

                        sendCurrentState(
                            connection
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
                        "Control connection error:",
                        error
                    );
                }
            );
        }
    );


    /* ----------------------------
       Peer errors
    ---------------------------- */

    peer.on(
        "error",
        error => {

            console.error(
                "PeerJS error:",
                error
            );
        }
    );


    /* ----------------------------
       Peer disconnected
    ---------------------------- */

    peer.on(
        "disconnected",
        () => {

            console.warn(
                "PeerJS disconnected."
            );


            setTimeout(
                () => {

                    if (
                        peer &&
                        !peer.destroyed
                    ) {

                        console.log(
                            "Reconnecting PeerJS..."
                        );

                        peer.reconnect();
                    }

                },
                2000
            );
        }
    );
}


/* ============================================================
   SEND STATE
============================================================ */

function sendCurrentState(
    connection
) {

    if (
        !connection ||
        !connection.open
    ) {

        console.warn(
            "Cannot send state - connection closed."
        );

        return;
    }


    try {

        connection.send({

            type: "state",

            state: {

                ...state,

                clockSeconds:
                    getElapsedSeconds()
            }
        });


        console.log(
            "State sent to control."
        );

    } catch (error) {

        console.error(
            "Failed to send state:",
            error
        );
    }
}


/* ============================================================
   CLOCK UPDATE
============================================================ */

setInterval(
    () => {

        timerEl.textContent =
            formatTime(
                getElapsedSeconds()
            );

    },
    250
);


/* ============================================================
   INITIAL
============================================================ */

render();

createPeer();