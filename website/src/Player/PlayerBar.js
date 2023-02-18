import {useContext, useEffect, useRef, useState} from "react";
import Scroller from "./Scroller";
import {appContext} from "../App";


const PlayerBar = () => {

    const {records, song, playing_song, set_song, play_song, player} = useContext(appContext);

    const [text, set_text] = useState("");

    const buttons = [
        {
            title: ">",
            disabled: !player.ready || player.playing,
            onClick: () => player.play(),
        },
        {
            title: "#",
            disabled: !player.ready || !player.playing,
            onClick: () => player.stop(),
        }
    ];

    useEffect(() => {
        let new_text = "* ye olde tunes by def.gsus- * greetings to gonzo *";
        const sng = playing_song || song;
        if (sng?.name || sng?.file)
            new_text = sng?.name || sng?.file;
        else if (player.title)
            new_text = player.title;

        const rec = records && records[sng?.record_index]
        if (rec?.name)
            new_text = `${new_text} [${rec.name}]`;

        if (player.loading)
            new_text = `loading... ${new_text}`;
        if (player.playing) {
            const pos = `${player.position}/${player.length} ${player.row}/64`;
            new_text = `${new_text} ${pos}`;
        }
        set_text(new_text);
    }, [song, playing_song, player]);

    return (
        <div className={"player-bar"}>
            <Scroller
                onClick={() => { if (playing_song) set_song(playing_song)}}
            >
                {text}
            </Scroller>
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
        </div>
    )
};

export default PlayerBar;
