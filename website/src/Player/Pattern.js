
const NOTE_NAMES = [
    "C-", "C#", "D-", "D#", "E-", "F-", "F#", "G-", "G#", "A-", "A#", "B-",
];

const note_to_name = (n) => (
    `${NOTE_NAMES[n % 12]}${Math.floor(n / 12)}`
);


const Pattern = ({player}) => {

    const rows = [];
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
            rows.push(
                <div key={y} className={"flex pattern-row"}>{row}</div>
            );
        }
    }

    return (
        <div className={"pattern"}>
            <div className={"flex"}>
                <div>
                    {player.sample_names?.map((name, i) => (
                        <div key={i}>{name}</div>
                    ))}
                </div>
                <div>
                    {rows}
                    {/*<pre>{JSON.stringify(player, null, 2)}</pre>*/}
                </div>
            </div>

        </div>
    );
}


export default Pattern;