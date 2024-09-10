import { Box, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { getVideoCards } from '../../../utils';
import RailCard from '../../RailCard';
import VideoBox from '../../shared/VideoBox';
import { useSelector } from 'react-redux';
import { useWindowResize } from '../../../hooks/useWindowResize';
import { useDocumentSize } from '../../../hooks/useDocumentSize';
import { ENTER_FULL_SCREEN_MODE } from '../../../constants';
import classNames from 'classnames';
import RailView from '../RailView';
import CompositeVideoBox from '../../shared/CompositeVideoBox';


const useStyles = makeStyles((theme) => ({
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'black',
      height: '100vh',
      [theme.breakpoints.down('xl')]: {
          height: '100vh' 
      },
      [theme.breakpoints.down('md')]: {
          height: '90vh',  /* For smaller laptops */
          marginTop:'30px'
      },
      [theme.breakpoints.down('sm')]: {
          height:'66vh',  /* For tablets */
          width:'100%',
          justifyContent: 'center',  /* Center video vertically */
          alignItems: 'center',      /* Center video horizontally */
          marginTop:'120px',
          backgroundColor: 'black',  /* Set background color to black */
          display: 'flex'
      },
      [theme.breakpoints.down('sm')]: {
          height:'40vh',  /* For tablets */
          width:'100%',
      }
    },
    videoContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        transition: 'height 0.3s ease' /* Smooth transition for height changes */
    },
    video : {
        width: '100%',
        height: '100%', /* Fill the container */
        objectFit: 'cover'
    },
    railCardsContainer : {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%', /* Adjust height as needed */
        display: 'flex',
        overflowX: 'hidden', /* Allow horizontal scrolling */
        whiteSpace: 'nowrap', /* Prevent cards from wrapping to the next line */
        background: '#000',
        backdropFlter: 'blur(10px)',
        padding: '20px',
        zIndex: 1, /* Ensure it is on top of other content */
        transition: 'height 0.3s ease' 
    },
    toggleButton : {
        position: 'fixed',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', /* Semi-transparent black background */
        color: 'white',
        border: 'none',
        borderRadius: '50%', /* Make the button circular */
        width: '50px', /* Set a fixed width */
        height: '50px', /* Set a fixed height */
        padding: '15px', /* Ensure padding is equal to create a circle */
        cursor: 'pointer',
        zIndex: 2, /* Ensure button is above the video */
        fontSize: '20px',
        display:'flex',
        alignItem:'center',
        justifyContent:'center',
        transition: 'opacity 0.3s ease', /* Smooth transition for button appearance */
            '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)' /* Change background color on hover */
            }
    },
    overlay: {
      //  background: '#000', 
        position: 'absolute', 
        bottom: 0, 
        width: '100%', 
        transition: 'height 0.3s ease' 
    }
}))

const CompositeLayout = () => {
  const conference = useSelector(state => state.conference);
    const layout = useSelector(state=>state.layout);
    const totalParticipantGrid = conference?.getParticipantCount()+layout.presenterParticipantIds.length;
    let {viewportWidth, viewportHeight} = useWindowResize(totalParticipantGrid);
    const {documentWidth, documentHeight} = useDocumentSize();
    const localTracks = useSelector(state => state.localTrack);
    const remoteTracks = useSelector(state => state.remoteTrack);
    const resolution = useSelector(state => state.media?.resolution);
    const myUserId = conference.myUserId();
    const classes = useStyles();
    let largeVideoId, isPresenter, participantTracks, participantDetails, justifyContent;

    // if ( conference.getParticipantCount() === 2 ) {
    //     largeVideoId = conference.getParticipantsWithoutHidden()[0]?._id;
    // }
    // largeVideoId = layout.pinnedParticipant.participantId || layout.presenterParticipantIds.slice(0).pop() || largeVideoId || myUserId;
   // isPresenter = layout.presenterParticipantIds.find(item=>item===largeVideoId);
    // if ( layout.pinnedParticipant.isPresenter === false ) {
    //     isPresenter = false;
    // }

    const tracks = { ...remoteTracks, [conference.myUserId()]: localTracks };
    let recorderId;
      tracks && Object.entries(tracks).map((key) => {
        console.log('key valie', key, key[1]);
        if(!(key[1] && key[1]?.length)){
          recorderId = key[0]
        }else{
          largeVideoId = key[0];
        }
      })      
    participantTracks = remoteTracks[largeVideoId];
    participantDetails =  conference.participants.get(largeVideoId)?._identity?.user; 

    // if (largeVideoId === conference.myUserId()){
    //     participantTracks = localTracks;
    //     participantDetails = conference.getLocalUser();
    // }
    const videoTrack = participantTracks?.find(track => track.getVideoType() === "camera");
    const constraints = {
        "lastN": 25,
        "colibriClass": "ReceiverVideoConstraints",
        "selectedSources":  [],
        "defaultConstraints": {"maxHeight": 180 },
        "onStageSources":  [videoTrack?.getSourceName()],
        constraints: {
            [videoTrack?.getSourceName()]:  { "maxHeight":  layout?.resolution[largeVideoId] || resolution  }
        }
    }

    // if (isPresenter)  {
    //     const desktopTrack = participantTracks?.find(track => track.getVideoType() === "desktop");
    //     constraints["onStageSources"] = [desktopTrack?.getSourceName()];
    //     constraints["selectedSources"] = [desktopTrack?.getSourceName()];
    //     constraints["constraints"] = { [desktopTrack?.getSourceName()]: { "maxHeight": 2160 }};
    // }

    conference.setReceiverConstraints(constraints);
    // const activeClasses = classNames(classes.root, {
    //     'fullmode': layout.mode === ENTER_FULL_SCREEN_MODE
    // });    

  const [videos, setVideos] = useState([]); // List of video objects
  const [defaultVideo, setDefaultVideo] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null); // Currently selected video
  const [showRailCards, setShowRailCards] = useState(false); // State to toggle RailCards visibility
  const [showToggleButton, setShowToggleButton] = useState(false); // State to show/hide the toggle button
  const [timer, setTimer] = useState(null);
  const [muted, setMuted] = useState(true);

    const selectVideo =(video) => {
        setSelectedVideo(video);
        showRailCardsWithTimer();
        clearTimeout(timer);
        const newTimer = setTimeout(()=>{
            setShowRailCards(false);
        },5000);
      setTimer(newTimer);
      }
    
     const showRailCardsWithTimer =() => {
      setShowRailCards(true);
     };
    
     const hideRailCards =() =>{
      setShowRailCards(false);
      clearTimeout(timer);
     }
      const handleUnmute = () => {
        setMuted(false);
      }

    useEffect(() => {
        async function fetchData() {
          const videosData = await getVideoCards();
          if (videosData && videosData.length > 0) {
            setVideos(videosData); // Set the list of videos
         //   setSelectedVideo(videosData[0]); // Set the default selected video
            setDefaultVideo(videosData[0]);
          }
        }
        fetchData();
      }, []);
      console.log('participantTracks', participantTracks, participantTracks?.length);

      
      console.log('total tracks', largeVideoId, recorderId, tracks, remoteTracks, localTracks, conference.myUserId());
  return (
    <>{
      conference.myUserId() === recorderId ?
    <Box
      onMouseEnter={() => setShowToggleButton(true)}
      onMouseLeave={() => setShowToggleButton(false)}
      className={classes.container}
    >
            <CompositeVideoBox
              isFilmstrip={true}
              isTranscription={true}
              width={'100%'}
              height={'100%'}
              isLargeVideo={true}
             // isActiveSpeaker={ largeVideoId === dominantSpeakerId }
              isPresenter={isPresenter}
              participantDetails={participantDetails}
              participantTracks={participantTracks}
              localUserId={conference.myUserId()}
              largeVideoId={largeVideoId}
            />
      {/* <button id="button" style={{color: 'red', zIndex: 1}} onClick={handleUnmute}>click here</button> */}
    
      <Box style={{ height: showRailCards ? "20%" : "0"}} className={classes.overlay}>
        
      </Box>

      {showRailCards && (
        <Box className={classes.railCardsContainer}>
          <RailView 
            isPresenter={isPresenter}
            panelHeight = {layout.mode === ENTER_FULL_SCREEN_MODE ? documentHeight - 108 :documentHeight - 88}
            gridItemWidth = {218}    
            gridItemHeight= {123}   
            largeVideoId={largeVideoId} 
            localTracks={localTracks} 
            remoteTracks={remoteTracks}
          />
          {/* <RailCard videos={videos} onVideoSelect={selectVideo} /> */}
        </Box>
      )}

      {showToggleButton && !showRailCards && (
        <button onClick={showRailCardsWithTimer} className={classes.toggleButton}>
          <KeyboardDoubleArrowUpIcon />
        </button>
      )}

      {showToggleButton && showRailCards && (
        <button onClick={hideRailCards} className={classes.toggleButton}>
          <KeyboardDoubleArrowDownIcon />
        </button>
      )}
    </Box> 
    :
    <div>Recorder</div>
    }
    </>
  )
}

export default CompositeLayout