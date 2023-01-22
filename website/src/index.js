import { ModPlayer } from "./microjazz/src/index";

document.querySelector("#do-it").addEventListener("click", () => {

    const player = new ModPlayer();
    window.player = player;
    player.load("./MODULE/ALONE/98.S3M");
    player.onReady = () => {
        console.log(player);
        player.play();
    };

});

/*
import ScripTracker from "./ScripTracker/src/scriptracker";

function onSongLoaded(player) {
    console.log("loaded");
    player.play();
}

function onPlay(player) {
    console.log("Playback has started, enjoy the music! :)");
}
function onOrder(player, currentOrder, songLength, patternIndex) {
    console.log("Playing order " + currentOrder + " of " + songLength + " (Pattern " + patternIndex + ").");
}

document.querySelector("#do-it").addEventListener("click", () => {
    var modPlayer = new ScripTracker();
    modPlayer.on(ScripTracker.Events.playerReady, onSongLoaded);
    modPlayer.on(ScripTracker.Events.play, onPlay);
    modPlayer.on(ScripTracker.Events.order, onOrder);

    console.log(modPlayer);
    modPlayer.loadModule("./MODULE/ALONE/98.S3M");
//modPlayer.loadModule("https://github.com/defgsus/defgsus-music/raw/master/MODULE/ALONE/98.S3M");
//modPlayer.loadModule("https://github.com/defgsus/defgsus-music/blob/master/MODULE/ALONE/98.S3M?raw=true")

    window.modPlayer = modPlayer;
    const debug = () => {
        document.querySelector("#debug").textContent = JSON.stringify(modPlayer, null, 2);
        setTimeout(debug, 2000);
    };
    //debug();

});

*/