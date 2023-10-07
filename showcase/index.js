let socket = new ReconnectingWebSocket('ws://' + location.host + '/ws');

let map_container = document.getElementById('map-container');
let title = document.getElementById('title');
let diff = document.getElementById('diff');
let artist = document.getElementById('artist');
let replay = document.getElementById('replay');

let beatmaps;
(async () => {
	$.ajaxSetup({ cache: false });
	beatmaps = (await $.getJSON('maps.json'));
})();

socket.onopen = () => { console.log('Successfully Connected'); };

socket.onclose = event => {
	console.log('Socket Closed Connection: ', event);
	socket.send('Client Closed!');
};

socket.onerror = error => { console.log('Socket Error: ', error); };

let tempImg;
let tempMapName;
let tempMapDiff;
let tempMapArtist;
let tempReplayer;
let ar;
let od;
let cs;
let sr;
let bpm;
let len;

socket.onmessage = event => {
	let data = JSON.parse(event.data);
	if (tempImg !== data.menu.bm.path.full) {
		tempImg = data.menu.bm.path.full;
		data.menu.bm.path.full = data.menu.bm.path.full.replace(/#/g, '%23').replace(/%/g, '%25').replace(/\\/g, '/');
		map_container.style.backgroundImage = `url('http://` + location.host + `/Songs/${data.menu.bm.path.full}')`;
	}
	if (tempMapName !== data.menu.bm.metadata.title) {
		tempMapName = data.menu.bm.metadata.title;
		title.innerHTML = tempMapName;
	}
	if (tempMapDiff !== `<b>[${data.menu.bm.metadata.difficulty}]</b> / mapset by <b>${data.menu.bm.metadata.mapper}</b>`) {
		tempMapDiff = `<b>[${data.menu.bm.metadata.difficulty}]</b> / mapset by <b>${data.menu.bm.metadata.mapper}</b>`;
		diff.innerHTML = tempMapDiff;
	}
	if (tempMapArtist !== data.menu.bm.metadata.artist) {
		tempMapArtist = data.menu.bm.metadata.artist;
		artist.innerHTML = tempMapArtist;
	}
	if (tempReplayer !== data.gameplay.name ? `Replay by <b>${data.gameplay.name}</b>` : ' ') {
		tempReplayer = data.gameplay.name ? `Replay by <b>${data.gameplay.name}</b>` : ' ';
		replay.innerHTML = tempReplayer;
	}
	if (ar !== data.menu.bm.stats.AR || sr !== data.menu.bm.stats.fullSR || len !== data.menu.bm.time.mp3) {
		ar = data.menu.bm.stats.AR;
		cs = data.menu.bm.stats.CS;
		od = data.menu.bm.stats.OD;
		sr = data.menu.bm.stats.fullSR;
		bpm = data.menu.bm.stats.BPM.max;
		len = data.menu.bm.time.full;
		rawlength = len / 1000;
		let mins = Math.trunc(rawlength / 60);
		let secs = Math.trunc(rawlength % 60);
		let songlength = mins.toString();
		songlength += ':'
		songlength += secs.toString().padStart(2, '0');

		document.getElementById('stats-1').innerHTML = `CS <b>${cs}</b> / AR <b>${ar}</b> / OD <b>${od}</b>`;
		document.getElementById('stats-2').innerHTML = `BPM <b>${bpm}</b> / Length <b>${songlength}</b> / SR <b>${sr}★</b>`;
	}
}