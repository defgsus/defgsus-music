import { ModPlayer } from "../microjazz/src/index";
import {useContext, useEffect, useRef, useState} from "react";
import {appContext} from "../App";
import Pattern from "./Pattern";


const Header = ({player}) => {
    return (
        <div className={"header"}>
            {player.bpm} BPM
            <div className={"buttons"}>
                <button
                    disabled={!player.ready || player.playing}
                    onClick={() => player.play()}
                >
                    {">"}
                </button>
                <button
                    disabled={!player.ready || !player.playing}
                    onClick={() => player.stop()}
                >
                    {"#"}
                </button>
            </div>
        </div>
    )
};

const SongPlayer = () => {

    const {song} = useContext(appContext);

    const playerRef = useRef(new ModPlayer());
    const [next_url, set_next_url] = useState(null);
    const [player_state, set_player_state] = useState(playerRef.current);

    const update_player_state = () => {
        const player = playerRef.current;
        const new_state = {
            ready: player.state === "ready.",
            loading: player.loading,
            playing: player.player?.playing || false,
            bpm: player.player?.bpm || 0,
            num_channels: player.channels,
            position: player.position || 0,
            length: player.songlen || 0,
            pattern_index: player.currentpattern(),
            pattern: null,
            sample_names: player.samplenames || [],
            play: () => {
                player.play();
                update_player_state_repeatedly();
            },
            stop: () => player.stop(),
        };
        if (player.player) {
            new_state.pattern = player.patterndata(new_state.pattern_index);
            try {
                new_state.channel_samples = [...Array(new_state.num_channels)].map(
                    ch => player.currentsample(ch)
                );
            }
            catch {
                new_state.channel_samples = [...Array(new_state.num_channels)].map(_ => 0);
            }
        }
        set_player_state(new_state);
    };

    const update_player_state_repeatedly = () => {
        update_player_state();
        if (playerRef.current.player?.playing)
            setTimeout(update_player_state_repeatedly, 250);
    };

    // hook to module player
    useEffect(() => {
        window.player = playerRef.current;
        playerRef.current.onReady = update_player_state;
        playerRef.current.onPlay = update_player_state;
        playerRef.current.onStop = () => {
            update_player_state();
            if (next_url) {
                player.load(next_url);
                set_next_url(null);
            }
        };
        update_player_state();
    }, [playerRef.current, next_url]);

    // fetch new song file
    useEffect(() => {
        if (song) {
            const filename = `${song.record.path}/${song.file}`;
            const url = `https://raw.githubusercontent.com/defgsus/defgsus-music/master/MODULE/${filename}`;

            if (playerRef.current.player?.playing) {
                playerRef.current.stop();
                playerRef.current = new ModPlayer();
            }
            playerRef.current.load(url);
        }
    }, [song]);


    return (
        <div className={"player"}>
            {player_state.loading ? "loading..." : null}
            <Header player={player_state}/>
            <Pattern player={player_state}/>
        </div>
    )
};

export default SongPlayer;
