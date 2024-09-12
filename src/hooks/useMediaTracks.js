import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { apiCall, getVideoCards } from "../utils";
import Hls from "hls.js";
import { useDispatch } from "react-redux";
import { addLocalTrack } from "../store/actions/track";
import { useLocation } from "react-router-dom";
import SariskaMediaTransport from "sariska-media-transport";

export const useMediaTracks = (streamUrl, setLocalTracks, iAmRecorder, localTracksRedux) => {
  const dispatch = useDispatch();
  //const streamUrl = queryParams.get('url');
 //  let streamUrl ='http://playertest.longtailvideo.com/adaptive/wowzaid3/playlist.m3u8';

 useEffect(() => {
    if (iAmRecorder) {
        setLocalTracks([]);
        return;
    }

    if (localTracksRedux.length > 0)  {
        return;
    }
    
 function createLocalTracksFromHLS(hlsUrl) {
  return new Promise((resolve, reject) => {
      if (!hlsUrl || typeof hlsUrl !== 'string' || !hlsUrl.trim()) {
          reject(new SariskaMediaTransport.JitsiTrackError(
              SariskaMediaTransport.JitsiTrackErrors.TRACK_INVALID_PARAMETERS, 'Invalid HLS URL'));
          return;
      }

      const videoElement = document.createElement('video');
      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.loop = true;  // This line enables looping
      videoElement.playsInline = true;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const createTracks = (videoTrack, audioTrack) => {
          const tracksInfo = [
              {
                  stream: new MediaStream([videoTrack]),
                  track: videoTrack,
                  mediaType: 'video',
                  videoType: 'camera',
                  sourceType: 'hls'
              },
              {
                  stream: new MediaStream([audioTrack]),
                  track: audioTrack,
                  mediaType: 'audio',
                  sourceType: 'hls'
              }
          ].filter(info => info.track); // Only include tracks that exist
          try {
            const t = SariskaMediaTransport.createLocalTracksFromMediaStreams(tracksInfo)
          resolve(t)
          } catch (error) {
            console.log('error in creating track', error)
          }
          

      };

      if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(hlsUrl);
          hls.attachMedia(videoElement);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
              videoElement.play().catch(e => console.error("Error playing HLS stream", e));
          });

          videoElement.onloadedmetadata = () => {
              canvas.width = videoElement.videoWidth;
              canvas.height = videoElement.videoHeight;

              const canvasStream = canvas.captureStream(30); // 30 FPS
              const videoTrack = canvasStream.getVideoTracks()[0];
              const audioTrack = videoElement.captureStream().getAudioTracks()[0];
              function drawVideoFrame() {
                  if (!videoElement.paused && !videoElement.ended) {
                      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                      requestAnimationFrame(drawVideoFrame);
                  }
              }
              try {
                drawVideoFrame();

              createTracks(videoTrack, audioTrack);
              } catch (error) {
                console.log('drawVideoFrame create error', error);
              }
              
          };

          hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                  reject(new SariskaMediaTransport.JitsiTrackError(
                      SariskaMediaTransport.JitsiTrackErrors.TRACK_NO_STREAM_FOUND, new Error("Fatal HLS error")));
                  hls.destroy();
              }
          });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari
          videoElement.src = hlsUrl;
          videoElement.onloadedmetadata = () => {
              canvas.width = videoElement.videoWidth;
              canvas.height = videoElement.videoHeight;

              const canvasStream = canvas.captureStream(30);
              const videoTrack = canvasStream.getVideoTracks()[0];
              const audioTrack = videoElement.captureStream().getAudioTracks()[0];

              function drawVideoFrame() {
                  if (!videoElement.paused && !videoElement.ended) {
                      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                      requestAnimationFrame(drawVideoFrame);
                  }
              }

              drawVideoFrame();
              
              videoElement.play()
                  .then(() => createTracks(videoTrack, audioTrack))
                  .catch(e => {
                      console.error("Error playing HLS stream in Safari", e);
                      reject(new SariskaMediaTransport.JitsiTrackError(
                          SariskaMediaTransport.JitsiTrackErrors.TRACK_NO_STREAM_FOUND, e));
                  });
          };
      } else {
          reject(new SariskaMediaTransport.JitsiTrackError(
              SariskaMediaTransport.JitsiTrackErrors.UNSUPPORTED_BROWSER, new Error('HLS is not supported in this browser')));
      }
  });
}

createLocalTracksFromHLS(streamUrl)
.then(tracks => {
    
    // These tracks should now be compatible with Jitsi's systems
    // tracks.forEach(track => {
    //     conference.addTrack(track);
    // });
    setLocalTracks(tracks);
    tracks.forEach(track=>dispatch(addLocalTrack(track)));
})

}, [])

  return null;
};
