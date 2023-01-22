import {useContext} from "react";
import {appContext} from "../App";


const Records = () => {

    const {records, record_index, set_record_index, set_song_index} = useContext(appContext);

    return (
        <div>
            {records.map((record, i) => (
                <div key={i}>
                    <div className={"name"} onClick={() => set_record_index(i)}>
                        {record.name} {record_index === i ? "S": null}
                    </div>
                    {record_index !== i ? null : (
                        <div style={{marginLeft: "1rem"}}>
                            {record.tracks.map((track, j) => (
                                <div key={j} onClick={() => set_song_index(j)}>
                                    {track.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Records;
