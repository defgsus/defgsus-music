import {useEffect, useRef, useState} from "react";


const Scroller = ({children, interval, ...props}) => {
    const scrollerRef = useRef();
    const callbackRef = useRef();
    const [scroll_dir, set_scroll_dir] = useState(1);
    const [scroller_offset, set_scroller_offset] = useState(0);

    interval = interval || 200;

    const update_scroller = () => {
        if (scrollerRef.current) {
            const scroller = scrollerRef.current;
            const w1 = scroller.getClientRects()[0].width;
            const w2 = scroller.children[0].getClientRects()[0].width;
            const step_size = 12.;
            if (w2 > w1) {
                const o = scroller_offset + step_size * scroll_dir;
                if (o >= (w2 - w1 + 20) || o < -20)
                    set_scroll_dir(-scroll_dir);
                set_scroller_offset(o);
            } else {
                set_scroller_offset(0);
            }
        }
    };

    const update_scroller_later = () => {
        if (callbackRef.current)
            clearTimeout(callbackRef.current);
        callbackRef.current = setTimeout(update_scroller, interval);
    }

    useEffect(() => {
        return () => {
            if (callbackRef.current)
                clearTimeout(callbackRef.current);
        };
    }, []);

    useEffect(() => {
        if (scrollerRef.current) {
            update_scroller();
        }
    }, [scrollerRef.current]);

    useEffect(() => {
        update_scroller_later();
    }, [scroller_offset, children]);

    return (
        <div className={"text-scroller-container"} {...props}>
            <div className={"text-scroller"} ref={scrollerRef}>
                <div
                    className={"text-scroller-content"}
                    style={{left: `${-scroller_offset}px`}}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Scroller;
