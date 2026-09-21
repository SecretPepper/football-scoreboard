/* ============================================================
   ROOM
============================================================ */

const params =
    new URLSearchParams(
        window.location.search
    );


const room =
    params.get("room") ||
    "premier-league-match";


const displayId =
    `scoreboard-${room}-display`;


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
   STATE
============================================================ */

/*
 * IMPORTANT:
 *
 * OBS does NOT own the scoreboard state.
 *
 * The control panel owns the state.
 *
 * OBS only displays it.
 */

let state = {
    ...defaultState
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


const homeNameEl =
    document.getElementById(
        "home-name"
    );


const awayNameEl =
    document.getElementById(
        "away-name"
    );


const homeScoreEl =
    document.getElementById(
        "home-score"
    );


const awayScoreEl =
    document.getElementById(
        "away-score"
    );


const homeLogoEl =
    document.getElementById(
        "home-logo"
    );


const awayLogoEl =
    document.getElementById(
        "away-logo"
    );


const competitionLogoEl =
    document.getElementById(
        "competition-logo"
    );


const timerEl =
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
   GET CURRENT CLOCK
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

    /* ----------------------------------------
       TEAM NAMES
    ---------------------------------------- */

    homeNameEl.textContent =
        state.homeName || "FUL";


    awayNameEl.textContent =
        state.awayName || "MUN";


    /* ----------------------------------------
       SCORES
    ---------------------------------------- */

    homeScoreEl.textContent =
        Number(state.homeScore) || 0;


    awayScoreEl.textContent =
        Number(state.awayScore) || 0;


    /* ----------------------------------------
       LOGOS
    ---------------------------------------- */

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

    } else {

        competitionLogoEl.style.display =
            "none";

    }


    /* ----------------------------------------
       HOME COLOURS
    ---------------------------------------- */

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


    /* ----------------------------------------
       AWAY COLOURS
    ---------------------------------------- */

    awayPanel.style.setProperty(
        "--club-color",
        state.awayColor ||
        "#111111"
    );


    awayPanel.style.setProperty(
        "--club-secondary",
        state.awaySecondary ||
        "#ffffff"
    );


    /* ----------------------------------------
       SCOREBOARD VARIABLES
    ---------------------------------------- */

    scoreboard.style.setProperty(
        "--home-color",
        state.homeColor ||
        "#000000"
    );


    scoreboard.style.setProperty(
        "--home-secondary",
        state.homeSecondary ||
        "#ffffff"
    );


    scoreboard.style.setProperty(
        "--away-color",
        state.awayColor ||
        "#111111"
    );


    scoreboard.style.setProperty(
        "--away-secondary",
        state.awaySecondary ||
        "#ffffff"
    );


    /* ----------------------------------------
       CLOCK
    ---------------------------------------- */

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
        state.running;


    /*
     * Replace the scoreboard state with
     * the control panel state.
     */

    state = {

        ...defaultState,

        ...newState

    };


    /* ========================================================
       CLOCK START
    ======================================================== */

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


    /* ========================================================
       CLOCK ALREADY RUNNING
    ======================================================== */

    else if (
        state.running &&
        wasRunning
    ) {

        /*
         * Keep the existing local clock
         * running smoothly.
         */

    }


    /* ========================================================
       CLOCK STOPPED
    ======================================================== */

    else if (!state.running) {

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
        "Creating PeerJS scoreboard..."
    );


    peer =
        new Peer(
            displayId,
            {
                debug: 3
            }
        );


    /* ========================================================
       PEER READY
    ======================================================== */

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


    /* ========================================================
       CONTROL CONNECTION
    ======================================================== */

    peer.on(
        "connection",
        connection => {

            console.log(
                "Control panel connection received."
            );


            /*
             * If an old control connection exists,
             * close it before accepting the new one.
             */

            if (
                controlConnection &&
                controlConnection !== connection
            ) {

                try {

                    controlConnection.close();

                } catch (error) {}

            }


            controlConnection =
                connection;


            /* ==================================================
               CONNECTION OPEN
            ================================================== */

            connection.on(
                "open",
                () => {

                    console.log(
                        "Control panel connected."
                    );


                    /*
                     * DO NOT send our own state.
                     *
                     * Ask the control panel for
                     * the authoritative state.
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


            /* ==================================================
               DATA FROM CONTROL
            ================================================== */

            connection.on(
                "data",
                message => {

                    console.log(
                        "Data received:",
                        message
                    );


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


            /* ==================================================
               CONNECTION CLOSE
            ================================================== */

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


            /* ==================================================
               CONNECTION ERROR
            ================================================== */

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


    /* ========================================================
       PEER ERRORS
    ======================================================== */

    peer.on(
        "error",
        error => {

            console.error(
                "PeerJS error:",
                error
            );

        }
    );


    /* ========================================================
       PEER DISCONNECTED
    ======================================================== */

    peer.on(
        "disconnected",
        () => {

            console.warn(
                "PeerJS server disconnected."
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


                        try {

                            peer.reconnect();

                        } catch (error) {

                            console.error(
                                "Peer reconnect failed:",
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
   INITIAL RENDER
============================================================ */

render();


/* ============================================================
   START PEER
============================================================ */

createPeer();