import {useEffect, useState} from "react";

const NOTE_NAMES = [
    "C-", "C#", "D-", "D#", "E-", "F-", "F#", "G-", "G#", "A-", "A#", "B-",
];

const note_to_name = (n) => (
    `${NOTE_NAMES[n % 12]}${Math.floor(n / 12)}`
);


const Pattern = ({player}) => {

    const [rows, set_rows] = useState([]);

    useEffect(() => {
        if (!player?.pattern) {
            set_rows([]);
        } else {
            const new_rows = [];
            if (player.pattern) {
                for (let y = 0; y < 64; ++y) {
                    const row = [];
                    for (let x = 0; x < player.num_channels; ++x) {
                        const idx = (y * player.num_channels + x) * 5;
                        const value = player.pattern[idx];
                        row.push(
                            <div key={x}>
                                {(value === 255 ? "." : note_to_name(value & 127)).padEnd(4, ".")}
                            </div>
                        );
                    }
                    new_rows.push(
                        row
                    );
                }
            }
            set_rows(new_rows)
        }
    }, [player?.pattern]);

    const offset = Math.min(33, Math.max(0, (player?.row || 0) - 16));

    return (
        <div className={"pattern-container"}>
            <div className={"pattern"}>
                <div className={"flex"}>
                    <div>
                        {rows.slice(offset).map((row, i) => (
                            <div
                                key={i + offset}
                                className={"flex pattern-row" + (
                                    i + offset === player.row ? " active" : ""
                                )}
                            >
                                {row}
                            </div>
                        ))}
                        {/*<pre>{JSON.stringify(player, null, 2)}</pre>*/}
                    </div>
                </div>

            </div>
        </div>
    );
}


export default Pattern;