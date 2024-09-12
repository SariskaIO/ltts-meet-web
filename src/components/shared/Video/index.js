import React, { useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  video: {},
}));

const Video = (props) => {
  const classes = useStyles();
  const { track, position, height, largeVideoId } = props;
  const videoElementRef = useRef(null);
  useEffect(() => {
    const videoElement = videoElementRef.current;
    try {
        if (track && videoElement) {
          // Attach the media stream track to the video element
          track?.attach(videoElement);
          
          // return () => {
          //   // Detach the track when the component is unmounted or track changes
          //  // track.detach(videoElement);
          // };
      }
    } catch (error) {
      console.log('error in attaching track', error)
    }
    
  }, [track]);

  if (!track) {
    return null;
  }

  return (
    <video
      ref={videoElementRef}
      //  muted // If you want autoplay to work without user interaction, video must be muted
      playsInline="1"
      autoPlay="1"
     muted
      loop
      //  controls={true}
      style={{
        left: "-1px",
        top: "-1px",
        position: position || "absolute",
        width: "calc(100% + 2px)",
        height: height || "calc(100% + 2px)",
        objectFit: "contain",
        borderRadius: "8px",
        transform: "initial"// Mirror the video if not presenter
      }}
    />
  );
};

export default Video;

