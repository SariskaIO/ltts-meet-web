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
        console.log("!hlsUrl || typeof hlsUrl !== 'string' || !hlsUrl.trim()");
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
            console.log('MANIFEST_PARSED')
              videoElement.play().catch(e => console.error("Error playing HLS stream", e));
          });

          videoElement.onloadedmetadata = () => {
            console.log('onloadedmetadata');
              canvas.width = videoElement.videoWidth;
              canvas.height = videoElement.videoHeight;

              const canvasStream = canvas.captureStream(30); // 30 FPS
              const videoTrack = canvasStream.getVideoTracks()[0];
              const audioTrack = videoElement.captureStream().getAudioTracks()[0];
            console.log('videoTrack', videoTrack, audioTrack)
              function drawVideoFrame() {
                  if (!videoElement.paused && !videoElement.ended) {
                    console.log('drawVideoFrame');
                      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                      requestAnimationFrame(drawVideoFrame);
                  }
              }
              try {
                drawVideoFrame();

              createTracks(videoTrack, audioTrack);
              } catch (error) {
                console.log('drawVideoFrame creeate', error);
              }
              
          };

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.log('Hls.Events.ERROR', data);
              if (data.fatal) {
                  reject(new SariskaMediaTransport.JitsiTrackError(
                      SariskaMediaTransport.JitsiTrackErrors.TRACK_NO_STREAM_FOUND, new Error("Fatal HLS error")));
                  hls.destroy();
              }
          });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        console.log("videoElement.canPlayType('application/vnd.apple.mpegurl')")
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
  // useEffect(() => {
  //   if(!streamUrl) return;
  // //  const videoElement = videoRef.current;
  //   if (Hls.isSupported()) {
  //     const hls = new Hls();
  //     hls.loadSource(streamUrl);
  //     // When HLS.js is done attaching the media, we handle the video
  //     hls.on(Hls.Events.MANIFEST_PARSED, () => {
  //       const videoElement = document.createElement('video');
  //       hls.attachMedia(videoElement);
  //       videoElement.autoplay = true; // Enable autoplay
  //       videoElement.muted = false; 
  //       videoElement.play();
  //       videoElement.onloadedmetadata = async () => {
  //         const stream = hls.media?.captureStream();
  //         const [videoTrack] = await SariskaMediaTransport.createLocalTracksFromMediaStreams([{
  //           stream,
  //           mediaType: 'video',
  //           videoType: 'camera'
  //         }]);
  //         // Create Jitsi audio track
  //         const [audioTrack] = await SariskaMediaTransport.createLocalTracksFromMediaStreams([{
  //           stream,
  //           mediaType: 'audio',
  //         }]);
  //       // const audioTrack = await SariskaMediaTransport.createLocalTracks(audioOptions);
  //       // const videoTrack = await SariskaMediaTransport.createLocalTracks(videoOptions);

  //         let tracks = [];
  //         tracks.push(audioTrack);
  //         tracks.push(videoTrack);
  //         dispatch(addLocalTrack(audioTrack));
  //         dispatch(addLocalTrack(videoTrack));

  //         setLocalTracks(tracks)
  //         console.log('Video Track:', videoTrack);
  //         console.log('Audio Track:', audioTrack);
  //       }
  //     });

  //     // // Wait for metadata to be loaded
  //     // videoElement.onloadedmetadata = async() => {
  //     //   console.log('Metadata loaded');

  //     //   // Capture media stream from video element
  //     //   const stream = videoElement.captureStream();
  //     //   console.log('first videoElement', stream, videoElement)
  //     //   const videoMediaTrack = stream.getVideoTracks()[0];
  //     //   const audioMediaTrack = stream.getAudioTracks()[0];
  //     //   console.log('audioMediaTrack.getSettings().deviceId', audioMediaTrack.getSettings().deviceId, videoMediaTrack.getSettings().deviceId)
  //     // //  // Add device metadata or options for the tracks
  //     // //  const audioOptions = {
  //     // //   track: audioMediaTrack, 
  //     // //   kind: 'audio',
  //     // //   devices: ['audio'],  // You can specify the type of device here
  //     // //   deviceId: audioMediaTrack.getSettings().deviceId || 'external_audio', // Optional device ID if available
  //     // // };

  //     // // const videoOptions = {
  //     // //   track: videoMediaTrack, 
  //     // //   kind: 'video',
  //     // //   devices: ['video'],  // You can specify the type of device here
  //     // //   deviceId: videoMediaTrack.getSettings().deviceId || 'external_video', // Optional device ID if available
  //     // //   resolution: videoMediaTrack.getSettings().width + 'x' + videoMediaTrack.getSettings().height, // Optional resolution
  //     // // };
  //     //   console.log('videoMediaTrack', videoMediaTrack)
  //     //   // Create Jitsi video track
  //     //   const [videoTrack] = await SariskaMediaTransport.createLocalTracksFromMediaStreams([{
  //     //     stream,
  //     //     mediaType: 'video',
  //     //     videoType: 'camera'
  //     //   }]);
  //     //   console.log('videoTrackvideoMediaTrack', videoTrack)
  //     //   // Create Jitsi audio track
  //     //   const [audioTrack] = await SariskaMediaTransport.createLocalTracksFromMediaStreams([{
  //     //     stream,
  //     //     mediaType: 'audio',
  //     //   }]);
  //     // // const audioTrack = await SariskaMediaTransport.createLocalTracks(audioOptions);
  //     // // const videoTrack = await SariskaMediaTransport.createLocalTracks(videoOptions);

  //     //   let tracks = [];
  //     //   tracks.push(audioTrack);
  //     //   tracks.push(videoTrack);
  //     //   dispatch(addLocalTrack(audioTrack));
  //     //   dispatch(addLocalTrack(videoTrack));

  //     //   setLocalTracks(tracks)
  //     //   console.log('Video Track:', videoTrack);
  //     //   console.log('Audio Track:', audioTrack);
  //     // };

  //     return () => {
  //         hls.destroy();
  //     };
  //   } 
  //   // else if (videoElement?.canPlayType('application/vnd.apple.mpegURL')) {
  //   //   // For Safari, which supports HLS natively
  //   //   videoElement.src = streamUrl;
  //   //   videoElement.addEventListener('loadedmetadata', async() => {
  //   //     const stream = videoElement.captureStream();
  //   //     const videoMediaTrack = stream.getVideoTracks()[0];
  //   //     const audioMediaTrack = stream.getAudioTracks()[0];
  //   //     // Add device metadata or options for the tracks
  //   //     const [videoTrack] = await SariskaMediaTransport.createLocalTracksFromMediaStreams([{
  //   //       stream,
  //   //       mediaType: 'video',
  //   //       videoType: 'camera'
  //   //     }]);
  //   //     console.log('videoTrackvideoMediaTrack', videoTrack)
  //   //     // Create Jitsi audio track
  //   //     const [audioTrack] = await SariskaMediaTransport.createLocalTracksFromMediaStreams([{
  //   //       stream,
  //   //       mediaType: 'audio',
  //   //     }]);

  //   //     console.log('Video Track:', videoTrack);
  //   //     console.log('Audio Track:', audioTrack);

  //   //     let tracks = [];
  //   //     tracks.push(audioTrack);
  //   //     tracks.push(videoTrack);
  //   //     dispatch(addLocalTrack(audioTrack));
  //   //     dispatch(addLocalTrack(videoTrack));

  //   //     setLocalTracks(tracks)

  //   //   });
  //   // }
  // }, [streamUrl]);

  return null;
};

// export const useMediaTracks = () => {
//     const [mediaStream, setMediaStream] = useState([]);
//     const [localTrackUrls, setLocalTrackUrls] = useState([]);

//   console.log('localTrackUrls', localTrackUrls, mediaStream);

//   const separateTracks = async () => {
//     try {
//       // Create a hidden video element programmatically
//       const videoElement = document.createElement('video');
//       if (!videoElement) return;
//       videoElement.muted = true; // To avoid audio playing automatically

//       // Fetch the video source (replace with your video URL)
//       const response = await fetch('http://playertest.longtailvideo.com/adaptive/wowzaid3/playlist.m3u8');
//       const videoBlob = await response.blob();
//       const videoSrc = URL.createObjectURL(videoBlob);
//       console.log('Video separateTracks', response, videoBlob, videoSrc);

//       // Set the video element source
//       videoElement.src = videoSrc;
      

//         document.body.appendChild(videoElement);
//         videoElement.load();

//         // Capture the media stream from the video element
//         const mediaStream = videoElement.captureStream();

//         // Extract video and audio tracks
//         const videoTrack = mediaStream.getVideoTracks();
//         const audioTrack = mediaStream.getAudioTracks();
// console.log('videoElement.load();', videoElement, mediaStream, videoTrack, audioTrack)
//       // Wait for the video metadata to load
//       videoElement.addEventListener('loadedmetadata', () => {
//         console.log('Video metadata loaded');

//         // Capture the media stream from the video element
//         const mediaStream = videoElement.captureStream();

//         // Extract video and audio tracks
//         const videoTrack = mediaStream.getVideoTracks()[0];
//         const audioTrack = mediaStream.getAudioTracks()[0];
        
//         console.log('Video Track:', videoTrack);
//         console.log('Audio Track:', audioTrack);

//         // Example: Create a new MediaStream with the extracted tracks
//         const newStream = new MediaStream();
//         if (videoTrack) newStream.addTrack(videoTrack);
//         if (audioTrack) newStream.addTrack(audioTrack);

//         console.log('New MediaStream:', newStream);
//        // document.body.removeChild(videoElement);
//        // return {audioTrack, videoTrack}// Perform any further processing with the tracks or newStream
//       });
//     } catch (error) {
//       console.error('Error fetching video or extracting tracks:', error);
//     }
//   };

//     useEffect(() => {
//       const createNewLocalTrackUrls = async () => {
//           try  {
//             // await ffmpeg.load();
//               const localTrackUrlsData = await getVideoCards();
//               if (localTrackUrlsData && localTrackUrlsData.length > 0) {
//                 localTrackUrlsData.forEach(async(localTrackUrls) => {
//                    await separateTracks()
//                   // console.log('separateTracks', tracks)
//                 //  trackUrls.push(response.url);
//                   // try {
//                   //   const body={url: localTrackUrls.url}
//                   //   const response = await apiCall('/audio', 'GET', body);
//                   //   if (!response.httpStatus && response?.url) {
//                   //     trackUrls.push(response.url);
//                   //   }
//                   // } catch (error) {
//                   //   console.log("failed to fetch audio track", error);
//                   // }
//                   // try {
//                   //   const body={url: localTrackUrls.url}
//                   //   const response = await apiCall('/video', 'GET', body);
//                   //   if (!response.httpStatus && response?.url) {
//                   //     trackUrls.push(response.url);
//                   //   }
//                   // } catch (error) {
//                   //   console.log("failed to fetch video track", error);
//                   // }
//                  // createMediaStream(trackUrls[0], trackUrls[1])
//                   setLocalTrackUrls(localTrackUrls => [...localTrackUrls]);
//                 })
//               }
//           } catch(e) {
//               console.log("failed to fetch local tracks");
//           }
//       };
//       separateTracks()
//       createNewLocalTrackUrls();
//     }, []);
  
//     return mediaStream;
//   };
  

// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { apiCall, getVideoCards } from "../utils";

// export const useMediaTracks = () => {
//     const [mediaStream, setMediaStream] = useState([]);
//     const [localTrackUrls, setLocalTrackUrls] = useState([]);

//   console.log('localTrackUrls', localTrackUrls, mediaStream);

//   const createMediaStream = async (audioUrl, videoUrl) => {
//     console.log('createMediaStream', audioUrl, videoUrl)
//     try {
//       const videoResponse = await axios.get(videoUrl, { responseType: 'blob' });

//       console.log('videoResponse', videoResponse)
//       const audioResponse = await axios.get(audioUrl, { responseType: 'blob' });
//       console.log('audioResponse', audioResponse)
//       if(videoResponse?.status === 200 && audioResponse?.status === 200){
//         // Create a new MediaSource
//         const videoBlob = videoResponse.data;
//         const audioBlob = audioResponse.data;

//         // Create tracks from the blobs
//         const videoStream = new MediaSource(videoBlob);
//         const audioStream = new MediaSource(audioBlob);
//         console.log('videoStreamaudioStream', audioStream, videoStream)

//         const mediaStream = new MediaStream();

//         // Video track
//         const videoTrack = new MediaStreamTrack();
//         videoTrack.kind = 'video';
//         videoTrack.stream = videoStream;

//         // Audio track
//         const audioTrack = new MediaStreamTrack();
//         audioTrack.kind = 'audio';
//         audioTrack.stream = audioStream;

//         // Add tracks to the MediaStream
//         mediaStream.addTrack(videoTrack);
//         mediaStream.addTrack(audioTrack);

//         setMediaStream(prevMediaStream => [...prevMediaStream, mediaStream]);
//       }
//     } catch (error) {
//       console.error('Error creating media tracks:', error);
//     }
//   };

//     useEffect(() => {
//       const createNewLocalTrackUrls = async () => {
//           try  {
//             // await ffmpeg.load();
//               const localTrackUrlsData = await getVideoCards();
//               if (localTrackUrlsData && localTrackUrlsData.length > 0) {
//                 localTrackUrlsData.forEach(async(localTrackUrls) => {
//                   let trackUrls = [];
                  
//                   try {
//                     const body={url: localTrackUrls.url}
//                     const response = await apiCall('/audio', 'GET', body);
//                     if (!response.httpStatus && response?.url) {
//                       trackUrls.push(response.url);
//                     }
//                   } catch (error) {
//                     console.log("failed to fetch audio track", error);
//                   }
//                   try {
//                     const body={url: localTrackUrls.url}
//                     const response = await apiCall('/video', 'GET', body);
//                     if (!response.httpStatus && response?.url) {
//                       trackUrls.push(response.url);
//                     }
//                   } catch (error) {
//                     console.log("failed to fetch video track", error);
//                   }
//                   createMediaStream(trackUrls[0], trackUrls[1])
//                   setLocalTrackUrls(localTrackUrls => [...localTrackUrls, trackUrls]);
//                 })
//               }
//           } catch(e) {
//               console.log("failed to fetch local tracks");
//           }
//       };
//       createNewLocalTrackUrls();
//     }, []);
  
//     return mediaStream;
//   };
  