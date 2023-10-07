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
// Not smart decision due to DOM loading before .json which resulting in API request being made without API key and failing.
//getAPI();

/*BackgroundCheck.init({
    targets: '.teamName',
    images: '#teamName'
});*/

let main = document.getElementById("main")
let avatar = document.getElementById("avatar")
let username = document.getElementById("username") 
let stage = document.getElementById("stage")

// START
let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
let axios = window.axios;
let user = {};

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

let currentWinner = -1
let team1 = "",
    team2 = "";

let ava1 = "",
    ava2 = ""

let avaSet = false

socket.onmessage = async (event) => {
    let data = JSON.parse(event.data);

    data.tourney.manager.teamName.left = "mrekk"
    data.tourney.manager.teamName.right = "fFrequence"

    if(!avaSet) {
        setAvatar(data.tourney.manager.teamName.left, data.tourney.manager.teamName.right)
        avaSet = true
    }

    if(data.tourney.manager.stars.left > data.tourney.manager.stars.right && currentWinner !== 0) {
        currentWinner = 0
        main.style.backgroundImage = `url("./static/main/red.png")`
        avatar.style.backgroundImage = `url("${ava1}")`
        username.innerText = data.tourney.manager.teamName.left
        stage.setAttribute("class", "winner-red")
    } else if(data.tourney.manager.stars.left < data.tourney.manager.stars.right && currentWinner !== 1) {
        currentWinner = 1
        main.style.backgroundImage = `url("./static/main/blue.png")`
        avatar.style.backgroundImage = `url("${ava2}")`
        username.innerText = data.tourney.manager.teamName.right
        stage.setAttribute("class", "winner-blue")
    }

    /*if (bestOfTemp !== data.tourney.manager.bestOF) {
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
            img.src = "./static/main/score-left.png"
            img.setAttribute("class", "scorePointImage")
            scoreLeft[counter].appendChild(img)
            containerLeft.appendChild(scoreLeft[counter]);

            scoreRight[counter] = document.createElement("div");
            scoreRight[counter].id = `scoreRight${counter}`;
            scoreRight[counter].setAttribute("class", "scoreRight");
            img = document.createElement("img")
            img.src = "./static/main/score-right.png"
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

    data.tourney.manager.teamName.left = "fFrequence"
    data.tourney.manager.teamName.right = "mrekk"

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
            team1 = "mrekk";
            team2 = "fFrequence";
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

    if (!avaSet) {
        avaSet = 1;
        setAvatar(avaLeft, teamLeftRank, team1);
        setAvatar(avaRight, teamRightRank, team2);
    }*/
};

async function setAvatar(user1, user2) {
    let data = await getDataSet(user1);
    ava1 = `http://a.ppy.sh/${data.user_id}`
    data = await getDataSet(user2)
    ava2 = `http://a.ppy.sh/${data.user_id}`
}

async function getDataSet(name) {
    try {
        if(!api) await getAPI()

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
