import {useContext, useEffect, useRef, useState} from "react";
import Scroller from "./Scroller";
import {appContext} from "../App";


const PlayerBar = () => {

    const {records, total_play_time, song, playing_song, set_song, play_song, player} = useContext(appContext);

    const [text, set_text] = useState("");
    const [pos_text, set_pos_text] = useState("");

    const buttons = [
        {
            title: "P1AY",
            disabled: !player.ready || player.playing,
            onClick: () => player.play(),
        },
        {
            title: "ST0P",
            disabled: !player.ready || !player.playing,
            onClick: () => player.stop(),
        }
    ];

    useEffect(() => {
        let new_text = `* ye olde tunes by def.gsus- (${total_play_time}) * greetings to gonzo and future crew ;) *`;
        const sng = playing_song || song;
        if (sng?.name || sng?.file)
            new_text = sng?.name || sng?.file;
        else if (player.title)
            new_text = player.title;

        const rec = records && records[sng?.record_index]
        if (rec?.name)
            new_text = `${new_text} [${rec.name}]`;

        set_text(new_text);
    }, [song, playing_song]);

    useEffect(() => {
        let new_text = "";
        if (player.loading)
            new_text = `loading...`;
        if (player.playing) {
            new_text = `${player.position}/${player.length} ${player.row}/64`;
        }
        set_pos_text(new_text);
    }, [player]);

    return (
        <div className={"player-bar"}>
            <Scroller
                onClick={() => { if (playing_song) set_song(playing_song)}}
                className={"clickable"}
            >
                {text}
            </Scroller>
            <div className={"playbar-content"}>
                <div className={"left-right"}>
                    <div className={"buttons"}>
                        {buttons.map((b, i) => (
                            <button
                                key={i}
                                disabled={b.disabled}
                                onClick={b.onClick}
                            >
                                {b.title}
                            </button>
                        ))}
                    </div>
                    <div className={"right"}>
                        {pos_text}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default PlayerBar;
