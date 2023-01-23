import { ModPlayer } from "../microjazz/src/index";
import {useContext, useEffect, useRef, useState} from "react";
import {appContext} from "../App";
import Pattern from "./Pattern";
import PlayerBar from "./PlayerBar";


const SongPlayer = () => {

    const {song} = useContext(appContext);

    const playerRef = useRef(new ModPlayer());
    const timeoutRef = useRef();
    const [player_state, set_player_state] = useState(playerRef.current);
    const [player_song, set_player_song] = useState();

    const update_player_state = () => {
        const player = playerRef.current;
        const new_state = {
            ready: player.state === "ready.",
            loading: player.loading,
            playing: player.player?.playing || false,
            title: player.title,
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
        if (timeoutRef.current)
            clearTimeout(timeoutRef.current);
        if (playerRef.current.player?.playing)
            timeoutRef.current = setTimeout(update_player_state_repeatedly, 250);
    };

    // hook to module player
    useEffect(() => {
        window.player = playerRef.current;
        playerRef.current.onReady = update_player_state;
        playerRef.current.onPlay = update_player_state;
        playerRef.current.onStop = update_player_state;
        update_player_state();
    }, [playerRef.current]);

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
            set_player_song(song);
        } else {
            set_player_song(null);
        }
    }, [song]);

    return (
        <div>
            <PlayerBar player={player_state} song={player_song}/>
        </div>
    )
};

export default SongPlayer;
