import {useContext, useEffect, useRef, useState} from "react";
import Scroller from "./Scroller";
import {appContext} from "../App";
import Pattern from "./Pattern";


const PlayerBar = () => {

    const {
        records, total_play_time, song, playing_song, set_song, play_song, player,
        pattern_visible, set_pattern_visible,
    } = useContext(appContext);

    const [text, set_text] = useState("");
    const [pos_text, set_pos_text] = useState("");
    const [] = useState(false);

    const buttons = [
        {
            title: "P1AY",
            disabled: player.playing || !(playing_song || song),
            onClick: () => {
                if (!player.ready)
                    play_song(playing_song || song);
                else
                    player.play()
            },
        },
        {
            title: "ST0P",
            disabled: !player.ready || !player.playing,
            onClick: () => player.stop(),
        },
        {
            title: pattern_visible ? "HID3" : "PATT3RN",
            disabled: !pattern_visible && (!player.ready || !player.playing),
            onClick: () => set_pattern_visible(!pattern_visible),
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
        <div className={"player-bar" + (pattern_visible ? " big" : "")}>
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
                    <div className={"right pos-text"}>
                        {pos_text}
                    </div>
                </div>
                {!pattern_visible ? null : (
                    <Pattern player={player}/>
                )}
            </div>
        </div>
    )
};

export default PlayerBar;
