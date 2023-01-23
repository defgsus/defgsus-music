import Player from "./Player";
import records from "bundle-text:./index.jsontxt";
import {createContext, useState} from "react";
import "./style.scss"
import Records from "./Player/Records";


const DEFAULT_CONTEXT = {
    records: JSON.parse(records),
    record_index: null,
    song_index: null,
    song: null,
};

export const appContext = createContext(DEFAULT_CONTEXT);


const App = () => {

    const [context_value, set_context_value] = useState(DEFAULT_CONTEXT);

    const set_record_index = (index) => {
        set_context_value({
            ...context_value,
            record_index: index,
            song_index: null,
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
            <div className={"app-wrapper"}>
                <h3>def.gsus- music 1996-2001</h3>
                <Records/>
            </div>
            <Player/>
        </appContext.Provider>
    );
}

export default App;
