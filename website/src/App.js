import Player from "./Player";
import records from "bundle-text:./index.jsontxt";
import {createContext, useState} from "react";
import "./style.scss"


const DEFAULT_CONTEXT = {
    records: JSON.parse(records),
    record_index: 0,
    song_index: 0,
    song: null,
};

export const appContext = createContext(DEFAULT_CONTEXT);


const App = () => {

    const [context_value, set_context_value] = useState(DEFAULT_CONTEXT);

    const set_record_index = (index) => {
        set_context_value({
            ...context_value,
            record_index: index,
            song_index: 0,
        });
    };

    const set_song_index = (index) => {
        const record = context_value.records[context_value.record_index];
        set_context_value({
            ...context_value,
            song_index: index,
            song: {
                record,
                ...record.tracks[index],
            },
        });
    };

    return (
        <appContext.Provider value={{
            ...context_value,
            set_record_index,
            set_song_index,
        }}>
            <Player/>
        </appContext.Provider>
    );
}

export default App;
