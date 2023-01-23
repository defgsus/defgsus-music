import {useEffect, useRef, useState} from "react";
import Scroller from "./Scroller";


const PlayerBar = ({player, song}) => {

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
        if (song?.name || song?.file)
            new_text = song?.name || song?.file;
        else if (player.title)
            new_text = player.title;
        if (song?.record?.name)
            new_text = `${new_text} / ${song.record.name}`;
        if (player.loading)
            new_text = `loading... ${new_text}`;
        set_text(new_text);
    }, [player]);

    return (
        <div className={"player-bar"}>
            <Scroller>{text}</Scroller>
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
