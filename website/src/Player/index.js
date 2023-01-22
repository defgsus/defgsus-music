import {useContext} from "react";
import {appContext} from "../App";
import Records from "./Records";
import SongPlayer from "./SongPlayer";


const Player = () => {

    //const context = useContext(appContext);

    return (
        <div className={"flex"}>
            <div>
                <Records/>
            </div>
            <div>
                <SongPlayer/>
            </div>
        </div>
    )
};

export default Player;
