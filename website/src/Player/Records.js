import {useContext} from "react";
import {appContext} from "../App";


const Records = () => {

    const {records, record_index, song_index, set_record_index, set_song_index} = useContext(appContext);

    return (
        <div className={"records"}>
            {records.map((record, i) => (
                <div className={"record-wrapper"} key={i}>
                    <div
                        className={record_index === i ? "record selected" : "record"}
                        onClick={() => { if (record_index !== i) set_record_index(i); }}
                    >
                        <div
                            className={"name"}
                        >
                            {record.name}
                        </div>
                        {record_index !== i ? null : (
                            <div className={"tracks"}>
                                {record.tracks.map((track, j) => (
                                    <div
                                        key={j}
                                        onClick={() => set_song_index(j)}
                                        className={
                                            record_index === i && song_index === j
                                                ? "track selected" : "track"
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
