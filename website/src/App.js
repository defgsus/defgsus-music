import Player from "./Player";
import records_json from "bundle-text:./index.jsontxt";
import {createContext, useEffect, useRef, useState} from "react";
import "./style.scss"
import Records from "./Player/Records";
import {ModPlayer} from "./microjazz/src";
import {SOURCE_URL} from "./config";

const records_data = JSON.parse(records_json);

const DEFAULT_CONTEXT = {
    records: records_data.records,
    record: null,
    song: null,
    playing_song: null,
    player: {},
};

export const appContext = createContext(DEFAULT_CONTEXT);


const App = () => {

    const [context_value, set_context_value] = useState(DEFAULT_CONTEXT);
    const playerRef = useRef(new ModPlayer());
    const timeoutRef = useRef();
    const [player_state, set_player_state] = useState({});

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
            row: player.row || 0,
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

    const hook_to_player = (player) => {
        window.player = player;
        player.onReady = () => {
            player.play();
            update_player_state();
        }
        player.onPlay = update_player_state;
        player.onStop = update_player_state;
        player.onNextRow = update_player_state;

    };

    useEffect(() => {
        hook_to_player(playerRef.current);
        update_player_state();
    }, [playerRef.current]);

    const set_record = (record) => {
        set_context_value({
            ...context_value,
            record,
            song: null,
        });
    };

    const set_song = (song) => {
        const record = context_value.records[song.record_index];
        set_context_value({
            ...context_value,
            record,
            song,
        });
        if (!player_state.playing) {
            play_song(song);
        }
    };

    const play_song = (song) => {
        const record = context_value.records[song.record_index];
        const filename = `${record.path}/${song.file}`;
        const url = `${SOURCE_URL}/MODULE/${filename}`;

        if (playerRef.current.player?.playing) {
            playerRef.current.stop();
            playerRef.current = new ModPlayer();
            hook_to_player(playerRef.current);
        }
        playerRef.current.load(url);
        set_context_value({
            ...context_value,
            playing_song: song,
        });
    };

    return (
        <appContext.Provider value={{
            ...context_value,
            set_record,
            set_song,
            play_song,
            player: player_state,
        }}>
            <div className={"app-wrapper"}>
                <h3><i>def.gsus-</i> music 1996-2001</h3>
                <Records/>
            </div>
            <Player/>
        </appContext.Provider>
    );
}

export default App;
