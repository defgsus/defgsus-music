import {useContext} from "react";
import {appContext} from "../App";
import {SOURCE_URL} from "../config";


const TrackInfo = ({song}) => {
    const {
        playing_song,
        player,
        records,
    } = useContext(appContext);
    const is_playing = playing_song?.index === song?.index && playing_song?.record_index === song?.record_index;

    const render_instruments = () => {
        if (!is_playing) {
            return (
                song.instruments.map(inst => (
                    <div className={"instrument"} key={inst.index}>
                        {inst.name.padEnd(28)} {`${inst.length || ""}`.padStart(6)}
                    </div>
                ))
            );
        } else {
            return (
                song.instruments.map(inst => {
                    const active = player.active_samples?.has(inst.index);
                    return (
                        <div className={"instrument" + (active ? " active" : "")} key={inst.index}>
                            {inst.name.padEnd(28)} {`${inst.length || ""}`.padStart(6)}
                        </div>
                    );
                })
            );
        }
    };

    const filename = `${records[song.record_index].path}/${song.file}`;
    const url = `${SOURCE_URL}/MODULE/${filename}`;

    return (
        <div className={"track-info"}>
            <div className={"header left-right"}>
                <div><a href={url}>{filename}</a></div>
                <div className={"right"}>{song.length}</div>
            </div>
            <div className={"instruments"}>
                {render_instruments()}
            </div>
        </div>
    );
};

export default TrackInfo;


