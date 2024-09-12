
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "@material-ui/core";
import classNames from "classnames";
import { ENTER_FULL_SCREEN_MODE } from "../../../constants";
import { useSelector } from "react-redux";
import CompositeVideoBox from "../../shared/CompositeVideoBox";


const useStyles = makeStyles(() => ({
    container : {
        position: 'absolute',
        padding: 0,
        overflow: 'hidden',
        top: 0,
        bottom: 0,
        width: '100%',
        height: '100%'
    },
    title : {
        color: 'white',
        display: 'block',
        top: 0,
        padding: 0,
        textAlign: 'left',
        marginBottom: '5px', /* Space below the title */
        zIndex: 1, /* Ensure the title is above the cards */
        position: 'relative'
    },
    cardContainer : {
        flex: '1 0 20%',
        display: 'flex',
        width: '100%',
        padding: 0,
        height: '100%',
        alignItems: 'center', /* Center items vertically */
        whiteSpace: 'nowrap', /* Prevent wrapping */
        marginRight: '2px'
    },
    reactPlayer: {
      background: '#000',
        minHeight: '30%',
      '& video': {
        minHeight: '30%'
      }
    },
    video : {
        width: '97%',
        height: '100%', /* Adjust to fit within card */
        objectFit: 'cover',
        transition: 'transform 0.3s ease, margin 0.3s ease',
        '&:hover': {
            transform: 'scale(1.3) translateY(-10%)',
            transformOrigin: 'center center'
        }
    },
    styledCard : {
        background: 'transparent',
        padding: 0, /* Remove padding */
        fontSize: '10px',
        cursor: 'pointer',
        width: 'calc(20vw - 2px)', /* Width as a percentage of viewport width minus padding */
        height: '100%', /* Fill the container height */
        position: 'relative',
        border: 'none',
        outline: 'none',
        flexShrink: 0, /* Prevent cards from shrinking */
        display: 'flex',
        flexDirection: 'column', /* Stack children vertically */
        alignItems: 'flex-start', /* Align items to the start of the card */
        overflow: 'visible', /* Allow overflow for the scaling video */
        margin: '0 1px', /* 1px distance between cards on each side */
        transition: 'transform 0.3s ease, margin 0.3s ease',
        '&:hover $video': {
            transform: 'scale(1.2) translateY(-5%)',
            marginTop: '-8%', /* Move the video up on hover */
            zIndex: 2, /* Ensure the hovered video is on top */
            marginLeft: '-10px'
        },
        '&:last-child': {
            marginRight: 0
        }
    },
    titleWrapper : {
        bottom: '10px', /* Adjusted position from the bottom */
        left: '10px',
        width: '100%',
        width: 'calc(100% - 20px)', /* Full width minus padding */
        padding: '10px',
        alignItem: 'left',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    }
}))

export default function RailView({ onVideoSelect, remoteTracks, localTracks, panelHeight, gridItemWidth, gridItemHeight, largeVideoId, isPresenter, togglePinParticipant, participantDetails }) {
  const [videos, setVideos] = useState([]);
  const conference = useSelector(state => state.conference);
    const layout = useSelector(state => state.layout);
  const classes = useStyles();
    // all participants 
    const tracks = { ...remoteTracks, [conference.myUserId()]: localTracks };
    // all tracks
    let participants = [{ _identity: { user: conference.getLocalUser() }, _id: conference.myUserId() }, ...conference.getParticipantsWithoutHidden()];
    const activeClasses = classNames(classes.root, {
        'fullmode': layout.mode === ENTER_FULL_SCREEN_MODE
    });
    
    participants.filter( p => layout.presenterParticipantIds.indexOf(p._id) >= 0).forEach(p=>{
        participants.push({...p, presenter: true});
    });

    // useEffect(() => {
    //   const fetchData = async () => {
    //     const videoData = await getVideoCards();
    //     setVideos(videoData);
    //   };
    //   fetchData();
    // }, []);

    
    // if (isPresenter && largeVideoId)   {
    //     participants  = participants.filter(p=>!(p.presenter && p._id === largeVideoId));
    // } else if (largeVideoId)   {
    //     participants  = participants.filter(p=>!(p._id === largeVideoId && !p.presenter));
    // }

    if (participants.length <= 0)  {
        return null;
    }


  const handleVideoSelect = (video) => {
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  const handleMouseEnter = (e) => {
    const video = e.currentTarget.querySelector("video");
    if (video) {
      video.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  };

  const handleMouseLeave = (e) => {
    const video = e.currentTarget.querySelector("video");
    if (video) {
      video.pause();
    }
  };
 // let recorder = participants?.filter(participant => participant?._identity?.user?.name === 'recorder')[0];

  return (
    <Box className={classes.container}>
      <Typography className={classes.title} >New TV Channels</Typography>
      <Box className={classes.cardContainer}>
        {participants.map((participant, index) => {
         return participant?._identity?.user?.name === 'recorder' ? <></> :
          <Box
            key={index}
           // onMouseEnter={handleMouseEnter}
           // onMouseLeave={handleMouseLeave}
            className={classes.styledCard}
          >
            <CompositeVideoBox 
              localUserId={conference.myUserId()}
              width={'100%'}
              height={'100%'}
              isPresenter={participant.presenter ? true : false}
              isFilmstrip={false}
              participantDetails={participant?._identity?.user}
              participantTracks={tracks[participant._id]}
              togglePinParticipant={togglePinParticipant}
            />
            {/* <ReactPlayer  
              url={video.url}
              playing={true}
             // controls={true}
              width="100%"
              height="100%"
              style={{background: '#000', '& video': {minHeight: '108px'}}}
              loop={true}
              muted={true}
              className={classes.reactPlayer}
            /> */}
            {/* <video src={video.url} muted preload="metadata" className={classes.video} autoPlay={true} loop={true} /> */}
            <Box className={classes.titleWrapper}>
              <Typography
                variant="h6"
                component="div"
                style={{
                  color: "white",
                  textAlign: "left",
                  fontSize: "12px",
                  marginLeft:"-10px",
                  padding:0
                }}
              >
                {participant?._identity?.user?.name === 'recorder' ? '' : participant?._identity?.user?.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "grey", 
                  textAlign: "left",
                  fontSize: "12px",
                  marginLeft:"-10px",
                  padding:0
                 }}
              >
                {participant?._identity?.user?.name === 'recorder' ? '' : 'title'}
              </Typography>
            </Box>
          </Box>
        })}
      </Box>
    </Box>
    
  );
}

// import React, { useState, useEffect } from "react";
// import styled from "styled-components";
// import { getVideoCards } from "../../utils";
// import { Typography } from "@mui/material";
//import { classes } from '../../../node_modules/@types/istanbul-lib-coverage/index.d';
//import { useEffect } from "react";

// const Container = styled.div`
//   position: absolute;
//   padding: 0;
//   overflow: hidden;
//   top: 0;
//   bottom: 0;
//   width: 100%;
//   height: 100%;
// `;

// const Title = styled.span`
//   color: white;
//   display: block;
//   top: 0;
//   padding:0;
//   text-align: left;
//   margin-bottom: 5px; /* Space below the title */
// `;

// const div = styled.div`
//   margin-right:10px;
//   height:100%;
// `;

// const CardContainer = styled.div`
//   flex: 1 0 20%;
//   display: flex;
//   width: 100%;
//   padding: 0;
//   // margin-right: 8px;
//   align-items: center; /* Center items vertically */
//   white-space: nowrap; /* Prevent wrapping */
// `;

// const VideoWrapper = styled.div`
//  positon:relative;
//  width:100%;
//  height:100%;
//    overflow: visible; /* Allow overflow to be visible */

// `;

// const Video = styled.video`
//   width: 80%;
//   height: 70%; /* Adjust to fit within card */
//   object-fit: cover;
//   transition: transform 0.3s ease;

//   &:hover {
//     transform: scale(1.30) translateY(-10%);
//     transform-origin: center center;
//   }
// `;

// const StyledCard = styled.div`
//   background: transparent;
//   // margin-right: 10px; /* Remove space between cards */
//   padding: 0; /* Remove padding */
//   font-size: 10px;
//   cursor: pointer;
//   width: 20vw; /* Width as a percentage of viewport width */
//   height: 100%; /* Fill the container height */
//   position: relative;
//   border: none;
//   outline: none;
//   flex-shrink: 0; /* Prevent cards from shrinking */
//   display: flex;
//   flex-direction: column; /* Stack children vertically */
//   align-items: flex-start; /* Align items to the start of the card */

//   &:last-child {
//     margin-right: 0;
//   }

//   &:hover ${Video} {
//     transform: scale(1.3) translateY(-10%);
//     transform-origin: center center; /* Scale from the center */
//   }
// `;

// const TitleWrapper = styled.div`
//   bottom: 0; /* Align it to the bottom of the card */
//   left: 0;
//   width: 80%;
//   padding: 10px;
// `;

// export default function RailViews({ onVideoSelect }) {
//   const [videos, setVideos] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const videoData = await getVideoCards();
//       setVideos(videoData);
//     };
//     fetchData();
//   }, []);

//   const handleVideoSelect = (video) => {
//     if (onVideoSelect) {
//       onVideoSelect(video);
//     }
//   };

//   const handleMouseEnter = (e) => {
//     const video = e.currentTarget.querySelector("video");
//     if (video) {
//       video.play().catch((error) => {
//         console.error("Error playing video:", error);
//       });
//     }
//   };

//   const handleMouseLeave = (e) => {
//     const video = e.currentTarget.querySelector("video");
//     if (video) {
//       video.pause();
//     }
//   };

//   return (
//     <Container>
//       <Title>New TV Channels</Title>
//       <div>
//       <CardContainer>
//         {videos.slice(0, 5).map((video, index) => (
//           <StyledCard
//             key={index}
//             onClick={() => handleVideoSelect(video)}
//             onMouseEnter={handleMouseEnter}
//             onMouseLeave={handleMouseLeave}
//           >
//             <Video src={video.url} muted preload="metadata" />
//             <TitleWrapper>
//               <Typography
//                 variant="h6"
//                 component="div"
//                 style={{
//                   color: "white",
//                   textAlign: "left",
//                   fontSize:"12px"
//                 }}
//               >
//                 {video.title}
//               </Typography>
//               <Typography variant="body2" sx={{color:"grey", textAlign:"left",fontSize:"12px"}}>
//                 {video.showtitle}
//               </Typography>
//             </TitleWrapper>
//           </StyledCard>
//         ))}
//       </CardContainer>
//       </div>
//     </Container>
//   );
// }