import {useContext} from "react";
import {appContext} from "../App";
import {SOURCE_URL} from "../config";
import Image from "./Image";


const Records = () => {

    const {
        records, record_index, song_index, playing_song_index,
        set_record_index, set_song_index,
    } = useContext(appContext);

    return (
        <div className={"records"}>
            {records.map((record, i) => (
                <div className={"record-wrapper"} key={i}>
                    <div
                        className={record_index === i ? "record selected" : "record"}
                        onClick={() => { if (record_index !== i) set_record_index(i); }}
                    >
                        <div className={"record-head"}>
                            <div
                                className={"name"}
                            >
                                {record.name}
                            </div>
                            <div className={"graphics"}>
                                {record_index === i && record?.graphics?.map(name => (
                                    <div className={"graphic"} key={name}>
                                        <Image
                                            src={`${SOURCE_URL}/MODULE/${record.path}/${name}`}
                                            alt={name}
                                            title={name}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {record_index !== i ? null : (
                            <div className={"tracks"}>
                                {record.tracks.map((track, j) => (
                                    <div
                                        key={j}
                                        onClick={() => set_song_index(j)}
                                        className={
                                            "track"
                                            + (record_index === i && song_index === j
                                                ? " selected" : "")
                                            + (playing_song_index[0] === i && playing_song_index[1] === j
                                                ? " playing" : "")
                                        }
                                    >
                                        {track.name || track.file}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Records;
