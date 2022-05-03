import React, {useEffect, useRef} from 'react';
import {makeStyles} from "@material-ui/core";
import { color } from '../../../assets/styles/_color';

const useStyles = makeStyles(() => ({
    video: {
        transform: "scaleX(-1)!important",
    }
}))

const Video = props => {
    const classes = useStyles();
    const {track, isPresenter, borderRadius, width, height, left} = props;
    const videoElementRef = useRef(null);
    useEffect(() => {
        if (!track || !videoElementRef.current) {
            return;
        }
        track.attach(videoElementRef.current);
        return ()=>{
            track.detach(videoElementRef.current);
        }
    }, [track]);

    if (!track) {
        return null;
    }

    return (<video playsInline="1" 
                   autoPlay='1' 
                   className={ !isPresenter && classes.video } 
                   ref={videoElementRef}
                   style={{left,  top: "-1px",  position: "absolute", width: "calc(100% + 2px)", height: "calc(100% + 2px)", objectFit: 'contain', borderRadius: '8px' }}/>);
}

export default Video;
