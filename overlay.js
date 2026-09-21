const params = new URLSearchParams(window.location.search);
const room = params.get("room") || "premier-league-match";

const displayId = `scoreboard-${room}-display`;

console.log("=================================");
console.log("FOOTBALL SCOREBOARD");
console.log("Room:", room);
console.log("Display ID:", displayId);
console.log("=================================");

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

    competitionLogo: "assets/competitions/premier-league.png",

    homeScore: 0,
    awayScore: 0,

    clockRunning: false,
    clockSeconds: 0
};

const homeNameEl = document.getElementById("home-name");
const awayNameEl = document.getElementById("away-name");

const homeScoreEl = document.getElementById("home-score");
const awayScoreEl = document.getElementById("away-score");

const homeLogoEl = document.getElementById("home-logo");
const awayLogoEl = document.getElementById("away-logo");

const competitionLogoEl =
    document.getElementById("competition-logo");

const timerEl =
    document.getElementById("timer");


/* ============================================================
   CLOCK
============================================================ */

function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds));

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


let clockStartTime = null;
let clockStartSeconds = 0;


function getElapsedSeconds() {

    if (!state.clockRunning || clockStartTime === null) {
        return state.clockSeconds;
    }

    return clockStartSeconds +
        Math.floor((Date.now() - clockStartTime) / 1000);
}


/* ============================================================
   RENDER
============================================================ */

function render() {

    console.log("Rendering state:", state);

    homeNameEl.textContent = state.homeName;
    awayNameEl.textContent = state.awayName;

    homeScoreEl.textContent = state.homeScore;
    awayScoreEl.textContent = state.awayScore;

    homeLogoEl.src = state.homeLogo;
    awayLogoEl.src = state.awayLogo;

    competitionLogoEl.src = state.competitionLogo;

    document.documentElement.style.setProperty(
        "--club-color",
        state.homeColor
    );

    document.documentElement.style.setProperty(
        "--club-secondary",
        state.homeSecondary
    );

    timerEl.textContent =
        formatTime(getElapsedSeconds());
}


/* ============================================================
   APPLY INCOMING STATE
============================================================ */

function applyIncomingState(newState) {

    console.log("=================================");
    console.log("NEW STATE RECEIVED FROM CONTROL");
    console.log(newState);
    console.log("=================================");

    const oldRunning = state.clockRunning;

    Object.assign(state, newState);

    /*
       Handle clock starting/stopping cleanly.
    */

    if (state.clockRunning && !oldRunning) {

        clockStartSeconds = state.clockSeconds;
        clockStartTime = Date.now();

    } else if (!state.clockRunning) {

        state.clockSeconds =
            Number(state.clockSeconds) || 0;

        clockStartTime = null;
        clockStartSeconds = state.clockSeconds;
    }

    render();
}


/* ============================================================
   PEERJS
============================================================ */

let peer = null;
let controlConnection = null;


function createPeer() {

    console.log("Creating PeerJS display...");

    peer = new Peer(displayId, {
        debug: 3
    });


    peer.on("open", id => {

        console.log("=================================");
        console.log("OBS SCOREBOARD PEER READY");
        console.log("Peer ID:", id);
        console.log("=================================");

    });


    peer.on("connection", connection => {

        console.log("=================================");
        console.log("CONTROL CONNECTING");
        console.log("Connection:", connection.peer);
        console.log("=================================");

        controlConnection = connection;


        connection.on("open", () => {

            console.log("=================================");
            console.log("CONTROL CONNECTED");
            console.log("=================================");

            /*
               Immediately send current scoreboard
               state to the control page.
            */

            try {
                connection.send({
                    type: "state",
                    state: {
                        ...state,
                        clockSeconds: getElapsedSeconds()
                    }
                });

                console.log("Initial state sent.");
            } catch (error) {
                console.error(
                    "Could not send initial state:",
                    error
                );
            }
        });


        connection.on("data", message => {

            console.log("=================================");
            console.log("DATA RECEIVED");
            console.log(message);
            console.log("=================================");


            if (!message) {
                return;
            }


            if (message.type === "state") {

                applyIncomingState(message.state);


                /*
                   Send confirmation back to control.
                */

                try {

                    connection.send({
                        type: "state",
                        state: {
                            ...state,
                            clockSeconds: getElapsedSeconds()
                        }
                    });

                    console.log(
                        "State confirmation sent."
                    );

                } catch (error) {

                    console.error(
                        "Confirmation failed:",
                        error
                    );
                }
            }
        });


        connection.on("close", () => {

            console.log(
                "Control connection closed."
            );

            if (controlConnection === connection) {
                controlConnection = null;
            }
        });


        connection.on("error", error => {

            console.error(
                "CONTROL CONNECTION ERROR:",
                error
            );
        });
    });


    peer.on("error", error => {

        console.error(
            "================================="
        );

        console.error(
            "PEERJS ERROR:",
            error
        );

        console.error(
            "================================="
        );

    });


    peer.on("disconnected", () => {

        console.warn(
            "PeerJS disconnected from server."
        );

        /*
           Try to reconnect automatically.
        */

        setTimeout(() => {

            if (peer && !peer.destroyed) {

                console.log(
                    "Attempting PeerJS reconnect..."
                );

                peer.reconnect();
            }

        }, 2000);
    });
}


/* ============================================================
   TIMER UPDATE
============================================================ */

setInterval(() => {

    timerEl.textContent =
        formatTime(getElapsedSeconds());

}, 250);


/* ============================================================
   INITIAL RENDER
============================================================ */

render();


/* ============================================================
   START PEER
============================================================ */

createPeer();