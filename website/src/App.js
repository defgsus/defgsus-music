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
    total_play_time: records_data.play_time,
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
    const [player_ended, set_player_ended] = useState(false);
    const [current_hash, set_current_hash] = useState(window.location.hash);
    const [first_hash, set_first_hash] = useState(true);

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
                update_player_state();
            },
            stop: () => player.stop(),
        };
        if (player.player) {
            new_state.pattern = player.patterndata(new_state.pattern_index);
            new_state.active_samples = new Set(
                player.player.channel.filter(c => c.noteon).map(c => c.sample)
            );
        }
        set_player_state(new_state);
    };

    // actually unused
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
        player.onEnd = () => {
            set_player_ended(true);
            update_player_state();
        };
    };

    const on_hash_change = (event) => {
        const hash = new URL(event.newURL).hash;
        set_current_hash(hash);
    };

    useEffect(() => {
        hook_to_player(playerRef.current);
        update_player_state();
    }, [playerRef.current]);

    // load the `context_value.playing_song` when changed
    useEffect(() => {
        const song = context_value.playing_song;
        if (song) {
            const record = context_value.records[song.record_index];
            const filename = `${record.path}/${song.file}`;
            const url = `${SOURCE_URL}/MODULE/${filename}`;

            playerRef.current.stop();
            playerRef.current = new ModPlayer();
            playerRef.song = song;
            hook_to_player(playerRef.current);
            playerRef.current.load(url);
        }
    }, [context_value.playing_song]);

    useEffect(() => {
        if (player_ended) {
            set_player_ended(false);
            play_next_song();
        }
    }, [player_ended]);

    useEffect(() => {
        window.addEventListener('hashchange', on_hash_change);
    }, [window]);

    // url hash change
    useEffect(() => {
        if (first_hash) {
            set_first_hash(false);
        }
        let path = current_hash?.split("/");
        if (path?.length >= 2) {
            const file = path[path.length - 1];
            path = path.slice(0, path.length - 1).join("/").slice(1);
            const rec = context_value.records.find(r => r.path === path)
            if (rec) {
                const song = rec.tracks.find(t => t.file === file);
                if (song && !(
                    song.index === context_value.playing_song?.index
                 && song.record_index === context_value.playing_song?.record_index)
                ) {
                    if (first_hash)
                        set_song(song, false);
                    else
                        play_song(song, true);
                }
            }
        }
    }, [current_hash]);

    const set_record = (record) => {
        set_context_value({
            ...context_value,
            record,
            song: null,
        });
    };

    const set_song = (song, auto_play=true) => {
        if (!song) {
            set_context_value({
                ...context_value,
                song: null,
            });
            return
        }
        const record = context_value.records[song.record_index];
        const new_state = {
            ...context_value,
            record,
            song,
        };
        if (auto_play && !player_state.playing)
            new_state.playing_song = song;
        set_context_value(new_state);
    };

    const play_song = (song, view=false) => {
        const new_state = {
            ...context_value,
            playing_song: song,
        };
        if (song && view) {
            new_state.song = song;
            new_state.record = context_value.records[song.record_index];
        }
        set_context_value(new_state);
        const record = context_value.records[song.record_index];
        window.location.hash = `#${record.path}/${song.file}`;
    };

    const play_next_song = () => {
        const song = context_value.playing_song;
        console.log("X", song)
        if (song) {
            const is_viewed = context_value.playing_song.index === context_value.song?.index
                                && context_value.playing_song.record_index === context_value.song?.record_index;
            const record = context_value.records[song.record_index];
            if (song.index < record.tracks.length - 1)
                play_song(record.tracks[song.index + 1], is_viewed);
            else {
                const next_record = context_value.records[(record.index + 1) % context_value.records.length];
                play_song(next_record.tracks[0], is_viewed);
            }
        } else {
            play_song(context_value.records[0].tracks[0]);
        }
    };

    return (
        <appContext.Provider value={{
            ...context_value,
            set_record,
            set_song,
            play_song,
            play_next_song,
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
