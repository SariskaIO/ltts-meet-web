import React, { useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  video: {},
}));

const Video = (props) => {
  const classes = useStyles();
  const { track, isPresenter, position, height } = props;
  const videoElementRef = useRef(null);
  useEffect(() => {
    const videoElement = videoElementRef.current;
    try {
        if (track && videoElement) {
          // Prevent attaching the track twice by checking if it's already attached
          const isTrackAlreadyAttached = Array.from(videoElement.srcObject?.getTracks() || []).some(
            (mediaTrack) => mediaTrack.id === track.getTrack().id
          );

          if (isTrackAlreadyAttached) {
            console.warn("Track is already attached, skipping re-attachment.");
            return; // Prevent further execution to avoid double attachment
          }
          // Attach the media stream track to the video element
          track?.attach(videoElement);
          // Ensure video playback only after metadata is loaded to avoid interruption
          videoElement.onloadedmetadata = () => {
            videoElement.play().catch((error) => {
              console.error("Error playing video:", error);
            });
          };
          
          return () => {
            // Detach the track when the component is unmounted or track changes
            track.detach(videoElement);
          };
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
      //  controls={true}
      style={{
        left: "-1px",
        top: "-1px",
        position: position || "absolute",
        width: "calc(100% + 2px)",
        height: height || "calc(100% + 2px)",
        objectFit: "contain",
        borderRadius: "8px",
        transform: !isPresenter ? "initial" : "scaleX(-1)", // Mirror the video if not presenter
      }}
    />
  );
};

export default Video;

