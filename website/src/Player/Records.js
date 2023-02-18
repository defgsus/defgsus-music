import {useContext} from "react";
import {appContext} from "../App";
import {SOURCE_URL} from "../config";
import Image from "./Image";


const TrackInfo = ({song}) => {
    return (
        <div className={"track-info"}>
            <div className={"instruments"}>
                {song.instruments.map((inst, i) => (
                    <div className={"instrument"}>
                        {inst.name.padEnd(26)} {`${inst.length || ""}`.padStart(6)}
                    </div>
                ))}
            </div>
        </div>
    );
}


const Records = () => {

    const {
        records, record, song, playing_song,
        set_record, set_song, play_song,
    } = useContext(appContext);

    return (
        <div className={"records"}>
            {records.map((rec, i) => {
                const selected_record = rec.index === record?.index;
                return (
                    <div className={"record-wrapper"} key={i}>
                        <div
                            className={selected_record ? "record selected" : "record"}
                            onClick={() => {
                                if (!selected_record) set_record(rec);
                            }}
                            onDoubleClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                play_song(record.tracks[0]);
                            }}
                        >
                            <div className={"record-head"}>
                                <div
                                    className={"name"}
                                >
                                    {rec.name}
                                </div>
                                <div className={"graphics"}>
                                    {selected_record && rec?.graphics?.map(name => (
                                        <div className={"graphic"} key={name}>
                                            <Image
                                                src={`${SOURCE_URL}/MODULE/${rec.path}/${name}`}
                                                alt={name}
                                                title={name}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {!selected_record ? null : (
                                <div className={"record-content"}>
                                    <div className={"tracks"}>
                                    {rec.tracks.map((track, j) => {
                                        const selected_track = selected_record && track.index === song?.index;
                                        const playing_track = playing_song?.record_index === i && track.index === playing_song?.index;
                                        return (
                                            <div
                                                key={j}
                                                onClick={() => set_song(track)}
                                                onDoubleClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    play_song(track);
                                                }}
                                                className={
                                                    "track"
                                                    + (selected_track
                                                        ? " selected" : "")
                                                    + (playing_track
                                                        ? " playing" : "")
                                                }
                                            >
                                                <div
                                                    className={"play-symbol"}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        play_song(track);
                                                    }}
                                                />
                                                {track.name || track.file}
                                            </div>
                                        );
                                    })}
                                </div>
                                    {!song ? null : <TrackInfo song={song}/>}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Records;
