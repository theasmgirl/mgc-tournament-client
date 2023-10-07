
let api, beatmaps;
async function getAPI() {
    try {
        const file = [];
        const jsonData = await $.getJSON("api.json");
        jsonData.map((num) => {
            file.push(num);
        });
        api = file[0].api;
    } catch (error) {
        console.error("Could not read JSON file", error);
    }
}

async function loadBeatmaps() {
    try {
        const file = [];
        const jsonData = await $.getJSON("./mappool/beatmaps.json");
        jsonData.map((num) => {
            file.push(num);
        });
        beatmaps = file;
    } catch (error) {
        console.error("Could not read JSON file", error);
    }
}
// Not smart decision due to DOM loading before .json which resulting in API request being made without API key and failing.
//getAPI();
loadBeatmaps()

const players = [
    {
        player: "maliszewski",
        seed: "1"
    },
    {
        player: "xootynator",
        seed: "2"
    },
    {
        player: "enri",
        seed: "3"
    },
    {
        player: "Vaxei",
        seed: "4"
    },
    {
        player: "Intercambing",
        seed: "5"
    },
    {
        player: "[Karcher]",
        seed: "6"
    },
    {
        player: "Accolibed",
        seed: "7"
    },
    {
        player: "mcy4",
        seed: "8"
    },
    {
        player: "decaten",
        seed: "9"
    },
    {
        player: "[MG]Arnold24x24",
        seed: "10"
    },
    {
        player: "Skrowell",
        seed: "11"
    },
    {
        player: "FlyingTuna",
        seed: "12"
    },
    {
        player: "gnahus",
        seed: "13"
    },
    {
        player: "WindowLife",
        seed: "14"
    },
    {
        player: "Riot",
        seed: "15"
    },
    {
        player: "Coreanmaluco",
        seed: "16"
    }
]

// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);

let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
let mapid = document.getElementById("mapid");
let axios = window.axios;
let user = {};

// NOW PLAYING
let nowPlayingContainer = document.getElementById("nowPlayingContainer");

// TEAM OVERALL SCORE
let teamLeftName = document.getElementById("teamLeftName");
let teamRightName = document.getElementById("teamRightName");

let teamLeftRank = document.getElementById("teamLeftRank");
let teamRightRank = document.getElementById("teamRightRank");

// TEAM PLAYING SCORE
let playingScoreContainer = document.getElementById("playingScoreContainer");
let scoreStuff = document.getElementById("scoreStuff");
let mapStuff = document.getElementById("mapStuff");
let playScoreLeft = document.getElementById("playScoreLeft");
let playScoreRight = document.getElementById("playScoreRight");
let deltaBarL = document.getElementById("deltaBarL");
let deltaBarR = document.getElementById("deltaBarR");
let scoreScoreDelta = document.getElementById("deltaScore");
let scoreScoreRight = document.getElementById("scoreScoreRight");
let scoreScoreLeft = document.getElementById("scoreScoreLeft");
let scoreCrownLeft = document.getElementById("scoreCrownLeft");
let scoreCrownRight = document.getElementById("scoreCrownRight");
let currentPick = document.getElementById("currentPick")

// Chats
let chats = document.getElementById("chats");

// Avatar
let avaLeft = document.getElementById("avatarLeft");
let avaRight = document.getElementById("avatarRight");
let avaSet = 0;

// State Toggler
let toGameplay = document.getElementById("toGameplay");
let toPool = document.getElementById("toPool");
// let toPoolB = document.getElementById("toPoolB");
let refresh = document.getElementById("refreshiFrame");
let overlayState = 0; // 0 = Gameplay, 1 = BanPick
let tempOverlayState = 0;
let currentPickTemp = false;
let currentPickChange = false;

// Main
let main = document.getElementById("main");

socket.onopen = () => {
    console.log("Successfully Connected");
};

let animation = {
    scoreScoreLeft: new CountUp("scoreScoreLeft", 0, 0, 0, 0.2, {
        useEasing: true,
        useGrouping: true,
        separator: ",",
        decimal: ".",
    }),
    scoreScoreRight: new CountUp("scoreScoreRight", 0, 0, 0, 0.2, {
        useEasing: true,
        useGrouping: true,
        separator: ",",
        decimal: ".",
    }),
    scoreScoreDelta: new CountUp("deltaScore", 0, 0, 0, 0.2, {
        useEasing: true,
        useGrouping: true,
        separator: ",",
        decimal: ".",
    }),
};

socket.onclose = (event) => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = (error) => {
    console.log("Socket Error: ", error);
};

let bestOfTemp;
let scoreVisibleTemp;
let starsVisibleTemp;

let tempMapID, tempImg, tempMapArtist, tempMapTitle, tempMapDiff, tempMapper;
let tempSR, tempCS, tempAR, tempOD, tempHP, tempLength, tempBPM;

let scoreLeftTemp, scoreRightTemp;

let playScoreLeftTemp, playScoreRightTemp, leftOffset, rightOffset, deltaScore;

let teamNameLeftTemp, teamNameRightTemp, team1, team2;

let gameState;

let chatLen = 0;
let tempClass = "unknown";

let scoreLeft = [];
let scoreRight = [];

let mappoolSetup = 0;

let tournamentDebugger = 0;
let tempTournamentDebugger;

let teamSize;
let maximumDelta;

let leftScoreWidth, rightScoreWidth;

let integratedMappool = 0;
let tempIntegratedMappool;
let currentLead = 0

toMins = (time) => {
    let minutes =
        time.getUTCMinutes() >= 10
            ? time.getUTCMinutes()
            : "0" + time.getUTCMinutes();
    let seconds =
        time.getUTCSeconds() >= 10
            ? time.getUTCSeconds()
            : "0" + time.getUTCSeconds();
    return minutes + ":" + seconds;
};

function formatNumber(number) {
    if (!number) return '0'
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

socket.onmessage = (event) => {
    let data = JSON.parse(event.data);
    setTimeout(() => {
        if (!mappoolSetup) {
            mappoolSetup = 1;
            iFrameInitiate();
        }
    }, 1000);
    if (
        scoreVisibleTemp !== data.tourney.manager.bools.scoreVisible ||
        tempOverlayState !== overlayState ||
        tempTournamentDebugger !== tournamentDebugger
    ) {
        tempTournamentDebugger = tournamentDebugger;
        if (tournamentDebugger === 0)
            scoreVisibleTemp = data.tourney.manager.bools.scoreVisible;
        else scoreVisibleTemp = true;
        tempOverlayState = overlayState;
        if (scoreVisibleTemp === true) {
            // Score visible -> Set bg bottom to full
            chats.style.width = "0px";
            scoreStuff.style.opacity = 1;
            deltaBarL.style.opacity = 1;
            deltaBarR.style.opacity = 1;
            nowPlayingContainer.style.position = "absolute";
            nowPlayingContainer.style.left = "0px";
            nowPlayingContainer.style.bottom = "0px";
        } else if (scoreVisibleTemp === false) {
            // Score invisible -> Set bg to show chats
            if (tempOverlayState === 0) {
                chats.style.width = "930px";
                chats.style.transform = `none`;
                scoreStuff.style.opacity = 0;
                deltaBarL.style.opacity = 0;
                deltaBarR.style.opacity = 0;
                nowPlayingContainer.style.position = "absolute";
                nowPlayingContainer.style.left = "470px";
                nowPlayingContainer.style.bottom = "0px";
                // main.style.backgroundImage = "var(--bg2)";
            } else if (tempOverlayState === 1) {
                chats.style.transform = `translateX(${(1920 - 930) / 2}px)`;
                // main.style.backgroundImage = "var(--mp-bg2)";
            }
        }
    }
    if (starsVisibleTemp !== data.tourney.manager.bools.starsVisible) {
        starsVisibleTemp = data.tourney.manager.bools.starsVisible;
        if (starsVisibleTemp) {
            document.getElementById("scoreContainerLeft").style.opacity = "1";
            document.getElementById("scoreContainerRight").style.opacity = "1";
        } else {
            document.getElementById("scoreContainerLeft").style.opacity = "0";
            document.getElementById("scoreContainerRight").style.opacity = "0";
        }
    }
    if (tempImg !== data.menu.bm.path.full) {
        tempImg = data.menu.bm.path.full;
        data.menu.bm.path.full = data.menu.bm.path.full
            .replace(/#/g, "%23")
            .replace(/%/g, "%25")
            .replace(/\\/g, "/")
            .replace(/'/g, "%27");
        mapThumbnail.style.backgroundImage = `url('http://127.0.0.1:24050/Songs/${data.menu.bm.path.full
            }?a=${Date.now()}')`;

        mapThumbnail.style.backgroundSize = "cover"
    }
    if (
        tempMapID !== data.menu.bm.id ||
        tempSR !== data.menu.bm.stats.fullSR ||
        tempLength !== data.menu.bm.time.full
    ) {
        tempMapID = data.menu.bm.id;
        tempMapArtist = data.menu.bm.metadata.artist;
        tempMapTitle = data.menu.bm.metadata.title;
        tempMapDiff = data.menu.bm.metadata.difficulty;
        tempMapper = data.menu.bm.metadata.mapper;

        tempCS = data.menu.bm.stats.CS;
        tempAR = data.menu.bm.stats.AR;
        tempOD = data.menu.bm.stats.OD;
        tempHP = data.menu.bm.stats.HP;
        tempSR = data.menu.bm.stats.fullSR;
        tempLength = data.menu.bm.time.full;
        let convertedLength = new Date(tempLength);
        convertedLength = toMins(convertedLength);

        tempBPM = data.menu.bm.stats.BPM.max;
        if (data.menu.bm.stats.BPM.max !== data.menu.bm.stats.BPM.min)
            tempBPM = `${data.menu.bm.stats.BPM.min} - ${data.menu.bm.stats.BPM.max}`;

        mapName.innerText = tempMapTitle;
        mapArtist.innerText = tempMapArtist
        mapMapper.innerText = tempMapper
        mapCS.innerHTML = "CS: " + tempCS
        mapAR.innerHTML = "AR: " + tempAR
        mapOD.innerHTML = "OD: " + tempOD
        mapBPM.innerHTML = "BPM: " + tempBPM
        mapSR.innerHTML = `<p class="sr-text">SR</p>${tempSR}*`
        mapLength.innerHTML = `<p class="length-text">Length</p>${convertedLength}`
        mapDiffName.innerText = "[" + tempMapDiff + "]"

        if (beatmaps.findIndex(beatmap => beatmap.beatmapId == data.menu.bm.id) !== -1) {
            currentPickTemp = !currentPickTemp
            if (currentPickTemp === 0) {
                currentPick.innerText = `Pick by ${team1}`
                currentPick.style.backgroundColor = '#dc6868'
                currentPick.style.opacity = 1
            } else {
                currentPick.innerText = `Pick by ${team2}`
                currentPick.style.backgroundColor = '#335c67'
                currentPick.style.opacity = 1
            }
        }

        // Why??????
        /*setTimeout(() => {
            togglePool(false);
        }, 7270);*/
    }
    if (bestOfTemp !== data.tourney.manager.bestOF) {
        bestOfTemp = data.tourney.manager.bestOF;
        containerLeft = document.getElementById("scoreContainerLeft");
        containerRight = document.getElementById("scoreContainerRight");
        containerLeft.innerHTML = "";
        containerRight.innerHTML = "";
        for (var counter = 0; counter < Math.ceil(bestOfTemp / 2); counter++) {
            scoreLeft[counter] = document.createElement("div");
            scoreLeft[counter].id = `scoreLeft${counter}`;
            scoreLeft[counter].setAttribute("class", "scoreLeft");
            let img = document.createElement("img")
            img.src = "./static/main/score-point.png"
            img.setAttribute("class", "scorePointImage")
            scoreLeft[counter].appendChild(img)
            containerLeft.appendChild(scoreLeft[counter]);

            scoreRight[counter] = document.createElement("div");
            scoreRight[counter].id = `scoreRight${counter}`;
            scoreRight[counter].setAttribute("class", "scoreRight");
            img = document.createElement("img")
            img.src = "./static/main/score-point.png"
            img.setAttribute("class", "scorePointImage")
            scoreRight[counter].appendChild(img)
            containerRight.appendChild(scoreRight[counter]);
        }
    }

    if (scoreLeftTemp !== data.tourney.manager.stars.left) {
        scoreLeftTemp = data.tourney.manager.stars.left;
        for (var i = 0; i < Math.ceil(bestOfTemp / 2); i++) {
            if (i < scoreLeftTemp) {
                scoreLeft[i].getElementsByClassName("scorePointImage")[0].src = "./static/main/score-point-left.png";
            } else if (i >= scoreLeftTemp) {
                scoreLeft[i].getElementsByClassName("scorePointImage")[0].src = "./static/main/score-point.png";
            }
        }
    }

    if (scoreRightTemp !== data.tourney.manager.stars.right) {
        scoreRightTemp = data.tourney.manager.stars.right;
        for (var i = 0; i < Math.ceil(bestOfTemp / 2); i++) {
            if (i < scoreRightTemp) {
                scoreRight[
                    Math.ceil(bestOfTemp / 2) - 1 - i
                ].getElementsByClassName("scorePointImage")[0].src = "./static/main/score-point-right.png";
            } else if (i >= scoreRightTemp) {
                scoreRight[
                    Math.ceil(bestOfTemp / 2) - 1 - i
                ].getElementsByClassName("scorePointImage")[0].src = "./static/main/score-point.png";
            }
        }
    }

    if (
        team1 !== data.tourney.manager.teamName.left &&
        team2 !== data.tourney.manager.teamName.right
    ) {
        if (
            data.tourney.manager.teamName.left !== "" &&
            data.tourney.manager.teamName.right !== "" &&
            tournamentDebugger === 0
        ) {
            team1 = data.tourney.manager.teamName.left;
            team2 = data.tourney.manager.teamName.right;
        } else {
            team1 = "";
            team2 = "";
        }
        avaSet = 0;
    }

    if (teamNameLeftTemp !== data.tourney.manager.teamName.left) {
        teamNameLeftTemp = data.tourney.manager.teamName.left;
        teamLeftName.innerHTML = teamNameLeftTemp;
    }
    if (teamNameRightTemp !== data.tourney.manager.teamName.right) {
        teamNameRightTemp = data.tourney.manager.teamName.right;
        teamRightName.innerHTML = teamNameRightTemp;
    }

    if (!avaSet && tournamentDebugger === 0) {
        avaSet = 1;
        setAvatar(avaLeft, teamLeftRank, team1);
        setAvatar(avaRight, teamRightRank, team2);
    }

    if (scoreVisibleTemp) {
        if (tournamentDebugger === 0) {
            teamSize = data.tourney.ipcClients.length / 2;
            playScoreLeftTemp = data.tourney.manager.gameplay.score.left;
            playScoreRightTemp = data.tourney.manager.gameplay.score.right;
            maximumDelta = teamSize * 1000000;
        } else {
            teamSize = 1;
            maximumDelta = 1000000;
        }

        deltaScore = (playScoreRightTemp - playScoreLeftTemp);

        animation.scoreScoreLeft.update(playScoreLeftTemp);
        animation.scoreScoreRight.update(playScoreRightTemp);
        animation.scoreScoreDelta.update(Math.abs(deltaScore));

        leftScoreWidth = parseInt(getComputedStyle(playScoreLeft).width);
        rightScoreWidth = parseInt(getComputedStyle(playScoreRight).width);

        leftOffset = -Math.sqrt(
            Math.abs(
                (deltaScore / maximumDelta) *
                (960 - leftScoreWidth) *
                (960 - leftScoreWidth)
            )
        );
        rightOffset = Math.sqrt(
            (deltaScore / maximumDelta) *
            (960 - rightScoreWidth) *
            (960 - rightScoreWidth)
        );

        // console.log(rightOffset);

        if (playScoreLeftTemp > playScoreRightTemp) {
            // Left is Leading
            playScoreLeft.className = "leadingScore";
            playScoreRight.className = "normalScore";
            if (-leftOffset >= leftScoreWidth / 2) {
                if (-leftOffset < 960 - leftScoreWidth)
                    playScoreLeft.style.transform = `translateX(${leftOffset + leftScoreWidth / 2
                        }px)`;
                else
                    playScoreLeft.style.transform = `translateX(-${960 - leftScoreWidth
                        }px)`;
            } else playScoreLeft.style.transform = `translateX(0)`;
            playScoreRight.style.transform = `translateX(0)`;
            deltaBarL.style.width = `${-leftOffset}px`;
            deltaBarR.style.width = 0;

            if (currentLead !== 2) {
                scoreCrownLeft.innerHTML = `<img src="./static/main/crown-active.png">`
                scoreCrownRight.innerHTML = `<img src="./static/main/crown.png">`
                scoreScoreLeft.style.fontSize = '50px'
                scoreScoreRight.style.fontSize = '36px'
                scoreScoreDelta.style.color = '#dc6868';
                currentLead = 2
            }
        } else if (playScoreLeftTemp === playScoreRightTemp) {
            // Tie
            playScoreLeft.className = "normalScore";
            playScoreRight.className = "normalScore";
            playScoreLeft.style.transform = `translateX(0)`;
            playScoreRight.style.transform = `translateX(0)`;
            deltaBarL.style.width = 0;
            deltaBarR.style.width = 0;

            if (currentLead !== 0) {
                scoreCrownRight.innerHTML = `<img src="./static/main/crown.png">`
                scoreCrownLeft.innerHTML = `<img src="./static/main/crown.png">`
                scoreScoreRight.style.fontSize = '50px'
                scoreScoreLeft.style.fontSize = '50px'
                scoreScoreDelta.style.color = '#aa7f57';
                currentLead = 0
            }
        } else {
            // Right is Leading
            playScoreRight.className = "leadingScore";
            playScoreLeft.className = "normalScore";
            playScoreLeft.style.transform = `translateX(0)`;
            if (rightOffset >= rightScoreWidth / 2)
                if (rightOffset < 960 - rightScoreWidth)
                    playScoreRight.style.transform = `translateX(${rightOffset - rightScoreWidth / 2
                        }px)`;
                else
                    playScoreRight.style.transform = `translateX(${960 - rightScoreWidth
                        }px)`;
            else playScoreRight.style.transform = `translateX(0)`;
            deltaBarL.style.width = 0;
            deltaBarR.style.width = `${rightOffset}px`;

            if (currentLead !== 1) {
                scoreCrownRight.innerHTML = `<img src="./static/main/crown-active.png">`
                scoreCrownLeft.innerHTML = `<img src="./static/main/crown.png">`
                scoreScoreRight.style.fontSize = '50px'
                scoreScoreLeft.style.fontSize = '36px'
                scoreScoreDelta.style.color = '#335c67';
                currentLead = 1
            }
        }
    }

    if (!scoreVisibleTemp && tournamentDebugger === 0) {
        if (chatLen != data.tourney.manager?.chat?.length && data.tourney.manager?.chat !== null) {
            // There's new chats that haven't been updated
            if (
                chatLen == 0 ||
                (chatLen > 0 && chatLen > data.tourney.manager.chat.length)
            ) {
                // Starts from bottom
                chats.innerHTML = "";
                chatLen = 0;
            }

            // Add the chats
            for (var i = chatLen; i < data.tourney.manager.chat.length; i++) {
                tempClass = data.tourney.manager.chat[i].team;

                // Chat variables
                let chatParent = document.createElement("div");
                chatParent.setAttribute("class", "chat");

                let chatTime = document.createElement("div");
                chatTime.setAttribute("class", "chatTime");

                let chatName = document.createElement("div");
                chatName.setAttribute("class", "chatName");

                let chatText = document.createElement("div");
                chatText.setAttribute("class", "chatText");

                chatTime.innerText = data.tourney.manager.chat[i].time;
                chatName.innerText =
                    data.tourney.manager.chat[i].name + ":\xa0";
                chatText.innerText = data.tourney.manager.chat[i].messageBody;

                /*if (
                    data.tourney.manager.chat[i].messageBody.includes(
                        "Next Pick"
                    )
                )
                    togglePool(true);*/

                chatName.classList.add(tempClass);

                chatParent.append(chatTime);
                chatParent.append(chatName);
                chatParent.append(chatText);
                chats.append(chatParent);
            }

            // Update the Length of chat
            chatLen = data.tourney.manager.chat.length;

            // Update the scroll so it's sticks at the bottom by default
            chats.scrollTop = chats.scrollHeight;
        }
    } else {
        //togglePool(false);
    }
};

async function setAvatar(element, rankElement, username) {
    const data = await getDataSet(username);
    if (data !== null) {
        element.style.backgroundImage = `url("http://a.ppy.sh/${data.user_id}")`;
        let seed;
        for (let i = 0; i < players.length; i++) {
            const user = players[i].player;
            if (user === username) {
                seed = players[i].seed;
            };
        };
        rankElement.innerHTML = "#" + formatNumber(data.pp_rank) + " | Seed " + seed;
    } else {
        element.style.backgroundImage = `url("./static/main/${element.id}.jpg")`;
    }
}

async function getDataSet(name) {
    try {
        if (!api) await getAPI()

        const data = (
            await axios.get("/get_user", {
                baseURL: "https://osu.ppy.sh/api",
                params: {
                    k: api,
                    u: name,
                },
            })
        )["data"];
        return data.length !== 0 ? data[0] : null;
    } catch (error) {
        console.error(error);
    }
}

async function iFrameInitiate() {
    let mappoolPicker = document.createElement("iframe");
    mappoolPicker.setAttribute(
        "src",
        `./mappool`
    );
    mappoolPicker.setAttribute("frameBorder", "0");
    mappoolPicker.setAttribute("name", `picker`);
    mappoolPicker.className = "mappoolPicker";

    document.body.appendChild(mappoolPicker);
}

toGameplay.addEventListener("click", () => {
    togglePool(false);
});

toPool.addEventListener("click", () => {
    togglePool(true);
});

// toPoolB.addEventListener("click", () => {
//     togglePool("2");
// });

refresh.addEventListener("click", () => {
    [].forEach.call(document.querySelectorAll("[name*=picker]"), (ifr) => {
        ifr.contentWindow.location.reload(true);
    });
    togglePool(true);
});

togglePool = (state) => {
    if (state) {
        overlayState = 1;

        let ifr = document.getElementsByName(`picker`)[0];
        ifr.style.opacity = 1;

        // [].forEach.call(document.querySelectorAll("[name*=picker]"), (ele) => {
        //     ele.style.clipPath = "inset(0px 0px 0px 1920px)";
        // });

        let playArea = document.getElementById("playArea");
        playArea.style.clipPath = "inset(0px 0px 0px 0px)";

        setTimeout(() => {
            ifr.style.clipPath = "inset(0px 0px 0px 0px)";
        }, 500);
    } else {
        overlayState = 0;

        let playArea = document.getElementById("playArea");
        playArea.style.clipPath = "inset(0px 0px 0px 1920px)";

        [].forEach.call(document.querySelectorAll("[name*=picker]"), (ele) => {
            ele.style.clipPath = "inset(0px 0px 0px 1920px)";
        });
    }
};

document.body.addEventListener("mousedown", function () {
    document.body.addEventListener("click", function (event) {
        if (event.ctrlKey) {
            currentPick.style.opacity = 0
        } else {
            currentPick.innerText = `Pick by ${team1}`
            currentPick.style.backgroundColor = '#dc6868'
            currentPick.style.opacity = 1
            currentPickTemp = false
        }
    });
    document.body.addEventListener("contextmenu", function (event) {
        if (event.ctrlKey) {
            currentPick.style.opacity = 0
        } else {
            currentPick.innerText = `Pick by ${team2}`
            currentPick.style.backgroundColor = '#335c67'
            currentPick.style.opacity = 1
            currentPickTemp = true
        }
    });
});