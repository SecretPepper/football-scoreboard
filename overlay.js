const params = new URLSearchParams(window.location.search);
const room = params.get("room") || "premier-league-match";

const displayId = `scoreboard-${room}-display`;
const storageKey = `scoreboard-state-${room}`;

console.log("================================");
console.log("SCOREBOARD READY");
console.log("Room:", room);
console.log("Display ID:", displayId);
console.log("================================");


/* ============================================================
   DEFAULT STATE
============================================================ */

const defaultState = {

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


/* ============================================================
   LOAD LAST SAVED STATE
============================================================ */

let state = {
    ...defaultState
};

try {

    const saved =
        localStorage.getItem(storageKey);

    if (saved) {

        const parsed =
            JSON.parse(saved);

        state = {
            ...defaultState,
            ...parsed
        };

        console.log(
            "Restored saved scoreboard state."
        );
    }

} catch (error) {

    console.warn(
        "Could not restore saved state:",
        error
    );

}


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

    seconds =
        Math.max(
            0,
            Math.floor(
                Number(seconds) || 0
            )
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
        !state.running ||
        clockStartTime === null
    ) {

        return Math.floor(
            Number(state.elapsedMs || 0) / 1000
        );

    }

    return (
        clockStartSeconds +
        Math.floor(
            (Date.now() - clockStartTime) / 1000
        )
    );
}


/* ============================================================
   SAVE STATE
============================================================ */

function saveState() {

    try {

        localStorage.setItem(
            storageKey,
            JSON.stringify({
                ...state,
                elapsedMs:
                    state.running
                        ? getElapsedSeconds() * 1000
                        : state.elapsedMs
            })
        );

    } catch (error) {

        console.warn(
            "Could not save scoreboard state:",
            error
        );

    }
}


/* ============================================================
   RENDER
============================================================ */

function render() {

    homeNameEl.textContent =
        state.homeName;

    awayNameEl.textContent =
        state.awayName;

    homeScoreEl.textContent =
        state.homeScore;

    awayScoreEl.textContent =
        state.awayScore;


    if (state.homeLogo) {

        homeLogoEl.src =
            state.homeLogo;

    }


    if (state.awayLogo) {

        awayLogoEl.src =
            state.awayLogo;

    }


    if (state.competitionLogo) {

        competitionLogoEl.src =
            state.competitionLogo;

        competitionLogoEl.style.display =
            "block";

    }


    homePanel.style.setProperty(
        "--club-color",
        state.homeColor || "#000000"
    );

    homePanel.style.setProperty(
        "--club-secondary",
        state.homeSecondary || "#ffffff"
    );


    awayPanel.style.setProperty(
        "--club-color",
        state.awayColor || "#111111"
    );

    awayPanel.style.setProperty(
        "--club-secondary",
        state.awaySecondary || "#ffffff"
    );


    scoreboard.style.setProperty(
        "--home-color",
        state.homeColor || "#000000"
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


    timerEl.textContent =
        formatTime(
            getElapsedSeconds()
        );


    saveState();

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
                Number(state.elapsedMs || 0) / 1000
            );

        clockStartTime =
            Date.now();

    }


    /* CLOCK STOP */

    if (!state.running) {

        clockStartSeconds =
            Math.floor(
                Number(state.elapsedMs || 0) / 1000
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


    /* --------------------------------------------------------
       PEER READY
    -------------------------------------------------------- */

    peer.on(
        "open",
        id => {

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

        }
    );


    /* --------------------------------------------------------
       CONTROL CONNECTION
    -------------------------------------------------------- */

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
                     * IMPORTANT:
                     *
                     * DO NOT send our default state here.
                     *
                     * Instead ask the control panel
                     * for the current state.
                     */

                    try {

                        connection.send({
                            type: "request-state"
                        });

                        console.log(
                            "Requested current state from control."
                        );

                    } catch (error) {

                        console.error(
                            "Failed to request state:",
                            error
                        );

                    }

                }
            );


            connection.on(
                "data",
                message => {

                    console.log(
                        "Data received:",
                        message
                    );


                    /* ----------------------------------------
                       CONTROL REQUESTED / SENT STATE
                    ---------------------------------------- */

                    if (
                        message &&
                        message.type === "state" &&
                        message.state
                    ) {

                        applyIncomingState(
                            message.state
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


    /* --------------------------------------------------------
       PEER ERRORS
    -------------------------------------------------------- */

    peer.on(
        "error",
        error => {

            console.error(
                "PeerJS error:",
                error
            );

        }
    );


    /* --------------------------------------------------------
       PEER DISCONNECTED
    -------------------------------------------------------- */

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
   CLOCK UPDATE
============================================================ */

setInterval(
    () => {

        timerEl.textContent =
            formatTime(
                getElapsedSeconds()
            );

        if (state.running) {
            saveState();
        }

    },
    250
);


/* ============================================================
   INITIAL
============================================================ */

render();

createPeer();