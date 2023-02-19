import {useContext} from "react";
import {appContext} from "../App";
import Records from "./Records";
import PlayerBar from "./PlayerBar";


const Player = () => {

    //const context = useContext(appContext);

    return (
        <div>
            <PlayerBar/>
        </div>
    );
};

export default Player;
