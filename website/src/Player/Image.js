import {useState} from "react";


const Image = ({src, ...props}) => {
    const [show, set_show] = useState(false);

    if (show) {
        return (
            <div
                className={"big-image"}
                onClick={() => set_show(false)}
            >
                <div className={"image"}>
                    <img src={src} {...props}/>
                </div>
            </div>
        );
    }

    return (
        <div
            className={"small-image"}
            onClick={() => set_show(true)}
        >
            <img src={src} width={"50px"} {...props}/>
        </div>
    );
};

export default Image;


