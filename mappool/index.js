window.addEventListener("contextmenu", (e) => e.preventDefault());

// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);

const file = [];
let api;
async function getAPI() {
    try {
        const jsonData = await $.getJSON("../api.json");
        jsonData.map((num) => {
            file.push(num);
        });
        api = file[0].api;
    } catch (error) {
        console.error("Could not read JSON file", error);
    }
}

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
        player: "hyeok2045",
        seed: "3"
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

const alternativeNames = {
    "hyeok2045": "enri"
}

// Not smart decision due to DOM loading before .json which resulting in API request being made without API key and failing.
//getAPI();

/*BackgroundCheck.init({
    targets: '.teamName',
    images: '#teamName'
});*/

// START
let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
let axios = window.axios;
let user = {};

// NOW PLAYING
let mapContainer = document.getElementById("mapContainer");
let mapArtist = document.getElementById("mapName");
let mapInfo = document.getElementById("mapInfo");
let mapper = document.getElementById("mapper");
let stars = document.getElementById("stars");
let nowPlayingContainer = document.getElementById("nowPlayingContainer");
let stats = document.getElementById("stats");

// Chats
let chats = document.getElementById("chats");

// Avatar
let avaLeft = document.getElementById("avatarLeft");
let avaRight = document.getElementById("avatarRight");
let avaSet = 0;

// First Pick
let pickButtonR = document.getElementById("pickButtonR");
let pickButtonB = document.getElementById("pickButtonB");
let pickState = document.getElementById("pickState");

let teamLeftName = document.getElementById("teamLeftName");
let teamRightName = document.getElementById("teamRightName");

let teamLeftRank = document.getElementById("teamLeftRank");
let teamRightRank = document.getElementById("teamRightRank");

const beatmaps = new Set(); // Store beatmapID;

function formatNumber(number) {
    if (!number) return '0'
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

socket.onopen = () => {
    console.log("Successfully Connected");
};

socket.onclose = (event) => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = (error) => {
    console.log("Socket Error: ", error);
};

let tempUID;

let tempMapID, tempImg, tempMapArtist, tempMapTitle, tempMapDiff, tempMapper;

let tempSR, tempCS, tempAR, tempOD, tempHP;

let scoreLeftTemp, scoreRightTemp;
let teamNameLeftTemp, teamNameRightTemp;

let gameState;

let chatLen = 0;
let tempClass = "unknown";

let hasSetup = false;
let tempTempMapID;

let scoreLeft = [];
let scoreRight = [];

let tempLastPick = "Blue";

const mods = {
    NM: 0,
    HD: 1,
    HR: 2,
    DT: 3,
    FM: 4,
    TB: 5,
};

const Status = {
    None: 0,
    Pick: 1,
    Ban: 2,
}

class Beatmap {
    constructor(mods, beatmapID, layerName, mappoolID) {
        this.mods = mods;
        this.beatmapID = beatmapID;
        this.layerName = layerName;
        this.mappoolID = mappoolID;
        this.status = Status.None
        this.interval = null
    }
    generate() {
        let mappoolContainer = document.getElementById(`${this.mods}`);

        this.clicker = document.createElement("div");
        this.clicker.id = `clicker`;

        mappoolContainer.append(this.clicker);

        this.map = document.createElement("div");
        this.mapThumbnail = document.createElement("div");
        this.mapStats = document.createElement("div");
        this.firstRow = document.createElement("div");
        this.secondRow = document.createElement("div");
        this.thirdRow = document.createElement("div");
        this.mapTitle = document.createElement("div");
        this.mapMapper = document.createElement("div");
        this.mapMapperLabel = document.createElement("div");
        this.mapArtist = document.createElement("div");
        this.mapDifficulty = document.createElement("div");
        this.mapMappoolID = document.createElement("div");
        this.mapPickBan = document.createElement("div");

        this.map.id = `map`;
        this.mapThumbnail.id = `mapThumbnail`
        this.mapStats.id = `mapStats`
        this.firstRow.id = "firstRow"
        this.secondRow.id = "secondRow"
        this.thirdRow.id = "thirdRow"
        this.mapTitle.id = "mapTitle"
        this.mapMapper.id = "mapMapper"
        this.mapMapperLabel.id = "mapMapperLabel"
        this.mapArtist.id = "mapArtist"
        this.mapDifficulty.id = "mapDifficulty"
        this.mapMappoolID.id = "mapMappoolID"
        this.mapPickBan.id = "mapPickBan"

        this.mapMapperLabel.innerHTML = "MAPPER";
        this.mapMappoolID.innerHTML = this.mappoolID;

        this.firstRow.append(this.mapTitle);
        this.firstRow.append(this.mapMapperLabel);

        this.secondRow.append(this.mapArtist)
        this.secondRow.append(this.mapMapper)

        this.thirdRow.append(this.mapDifficulty)
        this.thirdRow.append(this.mapMappoolID)

        this.mapStats.append(this.firstRow)
        this.mapStats.append(this.secondRow)
        this.mapStats.append(this.thirdRow)

        this.map.append(this.mapThumbnail)
        this.map.append(this.mapStats)
        this.map.append(this.mapPickBan)

        /*this.overlay.id = `${this.layerName}-overlay`;
        this.metadata.id = `${this.layerName}-metadata`;
        this.difficulty.id = `${this.layerName}-difficulty`;
        this.modIcon.id = `${this.layerName}-modicon`;
        this.pickedStatus.id = `${this.layerName}-status`;*/

        /*this.metadata.setAttribute("class", "mapInfo");
        this.difficulty.setAttribute("class", "mapInfo");
        this.map.setAttribute("class", "map");
        this.pickedStatus.setAttribute("class", "pickingStatus");
        this.overlay.setAttribute("class", "overlay");
        this.modIcon.setAttribute("class", "modIcon");*/
        this.clicker.setAttribute("class", "clicker");
        this.map.setAttribute("class", "map");
        this.mapPickBan.setAttribute("class", "mapPickBan")
        this.clicker.appendChild(this.map);
        /*document.getElementById(this.map.id).appendChild(this.overlay);
        document.getElementById(this.map.id).appendChild(this.metadata);
        document.getElementById(this.map.id).appendChild(this.difficulty);
        clickerObj.appendChild(this.pickedStatus);
        clickerObj.appendChild(this.modIcon);*/

        this.clicker.style.transform = "translateY(0)";
    }
    grayedOut() {
        this.overlay.style.opacity = "1";
    }
    PickedOn(type) {
        this.pickedStatus.className = `picked${type}`;
        this.overlay.style.opacity = "0.5";
        this.metadata.style.opacity = "1";
        this.difficulty.style.opacity = "1";
        this.pickedStatus.innerHTML = "Picked";
    }

    processMouseOn() {
        if ((this.map.style.opacity != 1 && this.map.style.opacity != "") || this.status !== Status.None || this.interval !== null) return
        this.map.style.opacity = 1
        this.interval = setInterval(() => {
            if (this.map.style.opacity == 0.5) this.map.style.opacity = 1
            else if (this.map.style.opacity == 1) this.map.style.opacity = 0.5
        }, 500)
    }

    processMouseOff() {
        if (this.interval === null) return
        this.map.style.opacity = 1
        clearInterval(this.interval)
        this.interval = null
    }
}

let bestOfTemp;
let scoreVisibleTemp;
let starsVisibleTemp;

let team1 = "",
    team2 = "";

socket.onmessage = async (event) => {
    let data = JSON.parse(event.data);

    if (
        team1 !== data.tourney.manager.teamName.left &&
        team2 !== data.tourney.manager.teamName.right
    ) {
        if (
            data.tourney.manager.teamName.left !== "" &&
            data.tourney.manager.teamName.right !== ""
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
        teamLeftName.innerHTML = alternativeNames[teamNameLeftTemp] ?? teamNameLeftTemp;
    }
    if (teamNameRightTemp !== data.tourney.manager.teamName.right) {
        teamNameRightTemp = data.tourney.manager.teamName.right;
        teamRightName.innerHTML = alternativeNames[teamNameRightTemp] ?? teamNameRightTemp;
    }

    if (!avaSet) {
        avaSet = 1;
        setAvatar(avaLeft, teamLeftRank, team1);
        setAvatar(avaRight, teamRightRank, team2);
    }

    if (!hasSetup) setupBeatmaps();

    if (tempMapID !== data.menu.bm.id) {
        tempMapID = data.menu.bm.id;
        pickedOnManual(tempMapID);
    }

    if (teamNameLeftTemp !== data.tourney.manager.teamName.left) {
        teamNameLeftTemp = data.tourney.manager.teamName.left;
        pickButtonR.innerHTML = teamNameLeftTemp;
    }
    if (teamNameRightTemp !== data.tourney.manager.teamName.right) {
        teamNameRightTemp = data.tourney.manager.teamName.right;
        pickButtonB.innerHTML = teamNameRightTemp;
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

    if (chatLen != data.tourney.manager?.chat?.length && data.tourney.manager?.chat !== null) {
        // There's new chats that haven't been updated
        console.log(data.tourney.manager.chat);
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
};

pickButtonR.addEventListener("click", () => {
    pickState.innerHTML = "First Team to pick: " + pickButtonR.innerHTML;
    tempLastPick = "Blue";
});

pickButtonB.addEventListener("click", () => {
    pickState.innerHTML = "First Team to pick: " + pickButtonB.innerHTML;
    tempLastPick = "Red";
});

async function setupBeatmaps() {
    hasSetup = true;

    const modsCount = {
        NM: 0,
        HD: 0,
        HR: 0,
        DT: 0,
        FM: 0,
        TB: 0,
    };

    const bms = [];
    try {
        const jsonData = await $.getJSON(`beatmaps.json`);
        jsonData.map((beatmap) => {
            bms.push(beatmap);
        });
    } catch (error) {
        console.error("Could not read JSON file", error);
    }

    (function countMods() {
        bms.map((beatmap) => {
            modsCount[beatmap.mods]++;
        });
    })();

    let row = -1;
    let preMod = 0;
    let colIndex = 0;
    bms.map(async (beatmap, index) => {
        if (beatmap.mods !== preMod || colIndex % 3 === 0) {
            preMod = beatmap.mods;
            colIndex = 0;
            row++;
        }
        const bm = new Beatmap(
            beatmap.mods,
            beatmap.beatmapId,
            `id-${beatmap.beatmapId}`,
            beatmap.Id,
        );
        bm.generate();
        bm.clicker.onmouseover = function () {
            bm.processMouseOn()
        };
        bm.clicker.onmouseleave = function () {
            bm.processMouseOff()
        };
        bm.clicker.addEventListener("mousedown", function () {
            bm.clicker.addEventListener("click", function (event) {
                if (event.shiftKey) {
                    bm.mapPickBan.innerHTML = `<p>Banned by<br /><span class="username">${team1}</span></p>`
                    bm.mapPickBan.style.opacity = 1
                    bm.mapPickBan.style.backgroundColor = 'rgba(160, 17, 17, 0.6)'
                    bm.mapPickBan.style.border = '2px solid rgba(135, 16, 16, 0.6)'
                    bm.map.style.opacity = 0.5
                    bm.status = Status.Ban
                } else if (event.ctrlKey) {
                    bm.mapPickBan.innerHTML = ""
                    bm.mapPickBan.style.opacity = 0
                    bm.map.style.opacity = 1
                    bm.status = Status.None
                } else {
                    bm.mapPickBan.innerHTML = `<p>Picked by<br /><span class="username">${team1}</span></p>`
                    bm.mapPickBan.style.opacity = 1
                    bm.mapPickBan.style.backgroundColor = 'rgba(160, 17, 17, 0.7)'
                    bm.mapPickBan.style.border = '2px solid #871010'
                    bm.map.style.opacity = 0.9
                    bm.status = Status.Pick
                }
                if (bm.interval) {
                    clearInterval(bm.interval)
                    bm.interval = null
                }
            });
            bm.clicker.addEventListener("contextmenu", function (event) {
                if (event.shiftKey) {
                    bm.mapPickBan.innerHTML = `<p>Banned by<br /><span class="username">${team2}</span></p>`
                    bm.mapPickBan.style.opacity = 1
                    bm.mapPickBan.style.backgroundColor = 'rgba(20, 17, 160, 0.7)'
                    bm.mapPickBan.style.border = '2px solid rgba(19, 16, 135, 0.7)'
                    bm.map.style.opacity = 0.6
                    bm.status = Status.Ban
                } else if (event.ctrlKey) {
                    bm.mapPickBan.innerHTML = ""
                    bm.mapPickBan.style.opacity = 0
                    bm.map.style.opacity = 1
                    bm.status = Status.None
                } else {
                    bm.mapPickBan.innerHTML = `<p>Picked by<br /><span class="username">${team2}</span></p>`
                    bm.mapPickBan.style.opacity = 1
                    bm.mapPickBan.style.backgroundColor = 'rgba(20, 17, 160, 0.7)'
                    bm.mapPickBan.style.border = '2px solid #131087'
                    bm.map.style.opacity = 0.9
                    bm.status = Status.Pick
                }
                if (bm.interval) {
                    clearInterval(bm.interval)
                    bm.interval = null
                }
            });
        });
        const mapData = await getDataSet(beatmap.beatmapId);

        bm.mapThumbnail.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${mapData.beatmapset_id}/covers/cover.jpg')`;
        bm.mapArtist.innerText = mapData.artist
        bm.mapDifficulty.innerText = `[${mapData.version}]`
        bm.mapMapper.innerText = mapData.creator
        bm.mapTitle.innerText = mapData.title

        /*bm.map.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${mapData.beatmapset_id}/covers/cover.jpg')`;
        bm.metadata.innerHTML = mapData.artist + " - " + mapData.title;
        bm.difficulty.innerHTML =
            `[${mapData.version}]` + "&emsp;&emsp;Mapper: " + mapData.creator;*/
        beatmaps.add(bm);
    });
}

async function getDataSet(beatmapID) {
    try {
        if (!api) await getAPI()

        const data = (
            await axios.get("/get_beatmaps", {
                baseURL: "https://osu.ppy.sh/api",
                params: {
                    k: api,
                    b: beatmapID,
                },
            })
        )["data"];
        return data.length !== 0 ? data[0] : null;
    } catch (error) {
        console.error(error);
    }
}

pickedOnManual = (id) => {
    tempLastPick = tempLastPick === "Red" ? "Blue" : "Red";
    if (document.getElementById(`id-${id}-clicker`)) {
        let pickedStatus = document.getElementById(`id-${id}-status`);
        let overlay = document.getElementById(`id-${id}-overlay`);
        let metadata = document.getElementById(`id-${id}-metadata`);
        let difficulty = document.getElementById(`id-${id}-difficulty`);

        pickedStatus.className = `picked${tempLastPick}`;
        overlay.style.opacity = "0.5";
        metadata.style.opacity = "1";
        difficulty.style.opacity = "1";
        pickedStatus.innerHTML = "Picked";
    }
};

async function setAvatar(element, rankElement, username) {
    const data = await getDataSetUser(username);
    if (data !== null) {
        element.style.backgroundImage = `url("http://s.ppy.sh/a/${data.user_id}")`;
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

async function getDataSetUser(name) {
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
