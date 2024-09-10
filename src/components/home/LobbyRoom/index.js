import React, { useEffect, useState, useRef } from "react";
import SariskaMediaTransport from "sariska-media-transport";
import { useHistory } from "react-router-dom";
import { localTrackMutedChanged } from "../../../store/actions/track";
import { addConference } from "../../../store/actions/conference";
import {
  getToken,
  getRandomColor,
  getMeetingId,
  generateUsername,
  trimSpace
} from "../../../utils";
import { addThumbnailColor } from "../../../store/actions/color";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { setProfile, setMeeting , updateProfile} from "../../../store/actions/profile";
import { addConnection } from "../../../store/actions/connection";
import SnackbarBox from "../../shared/Snackbar";
import { showNotification } from "../../../store/actions/notification";
import { setDisconnected } from "../../../store/actions/layout";
import { Box, Button, Hidden, makeStyles, Typography } from "@material-ui/core";
import JoinTrack from "../JoinTrack";
import { color } from "../../../assets/styles/_color";
import FancyButton from "../../shared/FancyButton";
import TextInput from "../../shared/TextInput";
import Logo from "../../shared/Logo";


const LobbyRoom = ({localTracks, streamUrl, setStreamUrl}) => {
  const history = useHistory();
 // const audioTrack =  useSelector((state) => state.localTrack).find(track=>track?.isAudioTrack());  
  const videoTrack =  useSelector((state) => state.localTrack).find(track=>track?.isVideoTrack());  
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const queryParams = useParams();
  const [meetingTitle, setMeetingTitle] = useState();
  const [name, setName] = useState(generateUsername());
  const [buttonText, setButtonText] = useState("Start Meeting");
  const profile = useSelector((state) => state.profile);
  const iAmRecorder = window.location.hash.indexOf("iAmRecorder") >= 0;
  const testMode = window.location.hash.indexOf("testMode") >= 0;
  const notification = useSelector((state) => state.notification);
  const moderator = useRef(true);
  
  const handleStreamUrlChange = (e) => {
    setStreamUrl(trimSpace(e.target.value.toLowerCase()));
  };

  const handleTitleChange = (e) => {
    setMeetingTitle(trimSpace(e.target.value.toLowerCase()));
  };

  const handleUserNameChange = (e) => {
    setName(e.target.value);
    if (e.target.value.length === 1 ) {
      dispatch(updateProfile({key: "color", value: getRandomColor()}));
    }
    if (!e.target.value) {
      dispatch(updateProfile({key: "color", value: null}));
    }
  };

  const handleSubmit = async () => {
    if (!meetingTitle) {
      dispatch(
        showNotification({
          message: "Meeting Title is required",
          severity: "warning",
          autoHide: true,
        })
      );
      return;
    }

    setLoading(true);
    let avatarColor = profile?.color ?  profile?.color : getRandomColor();
    dispatch(updateProfile({key: "color", value: avatarColor}));

    const token = await getToken(profile, name, avatarColor);
    const connection = new SariskaMediaTransport.JitsiConnection(
      token,
      meetingTitle,
      process.env.REACT_APP_ENV === "development" ? true : false
    );

    connection.addEventListener(
      SariskaMediaTransport.events.connection.CONNECTION_ESTABLISHED,
      () => {
        dispatch(addConnection(connection));
        createConference(connection);
      }
    );

    connection.addEventListener(
      SariskaMediaTransport.events.connection.CONNECTION_FAILED,
      async (error) => {
        console.log(" CONNECTION_DROPPED_ERROR", error);
        if (
          error === SariskaMediaTransport.errors.connection.PASSWORD_REQUIRED
        ) {
          const token = await getToken(profile, name, moderator.current);
          connection.setToken(token); // token expired, set a new token
        }
        if (
          error ===
          SariskaMediaTransport.errors.connection.CONNECTION_DROPPED_ERROR
        ) {
          dispatch(setDisconnected("lost"));
        }
      }
    );

    connection.addEventListener(
      SariskaMediaTransport.events.connection.CONNECTION_DISCONNECTED,
      (error) => {
        console.log("connection disconnect!!!", error);
      }
    );

    connection.connect();
  };

  const createConference = async (connection) => {
    const conference = connection.initJitsiConference();
    localTracks?.length && localTracks?.forEach(async track => {
      try {
        await conference.addTrack(track)
      } catch (error) {
        console.log('error in adding track', track)
      }
      
    }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.CONFERENCE_JOINED,
      () => {
        console.log('CONFERENCE_JOINED')
        setLoading(false);
        dispatch(addConference(conference));
        dispatch(setProfile(conference.getLocalUser()));
        dispatch(setMeeting({ meetingTitle }));
        dispatch(addThumbnailColor({participantId: conference?.myUserId(), color:  profile?.color}));
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.USER_ROLE_CHANGED,
      (id, role) => {
        console.log('USER_ROLE_CHANGED', id, role)
          history.push(`/${meetingTitle}`);
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.CONFERENCE_ERROR,
      () => {
        setLoading(false);
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.USER_JOINED,
      (id) => {
        dispatch(
          addThumbnailColor({ participantId: id, color: getRandomColor() })
        );
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.CONFERENCE_FAILED,
      async (error) => {
        console.log('CONFERENCE_FAILED', error)
        if (
          error === SariskaMediaTransport.errors.conference.MEMBERS_ONLY_ERROR
        ) {
          console.log('MEMBERS_ONLY_ERROR', error)
        }

        if (
          error ===
          SariskaMediaTransport.errors.conference.CONFERENCE_ACCESS_DENIED
        ) {
          setLoading(false);
         console.log('CONFERENCE_ACCESS_DENIED', error);
        }
      }
    );
    conference.join();
  };

  // useEffect(()=>{

  //   if(meetingTitle && name)
  //   handleSubmit();
  // },[])

  // const unmuteAudioLocalTrack = async () => {
  //   await audioTrack?.unmute();
  //   dispatch(localTrackMutedChanged());
  // };

  // const muteAudioLocalTrack = async () => {
  //   await audioTrack?.mute();
  //   dispatch(localTrackMutedChanged());
  // };

  // const unmuteVideoLocalTrack = async () => {
  //   await videoTrack?.unmute();
  //   dispatch(localTrackMutedChanged());
  // };

  // const muteVideoLocalTrack = async () => {
  //   await videoTrack?.mute();
  //   dispatch(localTrackMutedChanged());
  // };

  if (iAmRecorder && !meetingTitle) {
    setName("recorder");
    setMeetingTitle(queryParams.meetingId);
  }

  useEffect(() => {
    if (meetingTitle && iAmRecorder) {
      handleSubmit();
    }
  }, [meetingTitle]);

  // useEffect(() => {
  //   if ((!audioTrack || !videoTrack) && !iAmRecorder ) {
  //       setLoading(true);
  //   } else {
  //       setLoading(false);
  //   }
  // }, [audioTrack, videoTrack]);


  useEffect(() => {
    if (queryParams.meetingId) {
      setMeetingTitle(queryParams.meetingId);
    }
    setName(profile.name);
  }, [profile?.name]);

  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: 'flex-start'
    },
    permissions: {
      display: "flex",
      justifyContent: "space-around",
      paddingLeft: "0",
      paddingRight: "0",
      marginTop: "3.73vh",
      "& svg": {
        //border: `1px solid ${color.white}`,
        padding: "12px 0px",
        borderRadius: "7.5px",
        color: color.white,
        fontSize: "1.87vw",
        "&:hover": {
          color: color.primaryLight,
          cursor: "pointer",
        },
        [theme.breakpoints.down("sm")]: {
          fontSize: "1.6rem",
        }
      },
      [theme.breakpoints.down("sm")]: {
        marginTop: "10px !important",
        padding: '0 50px',
        width: '250px',
        margin: 'auto'
      }
    },
  
    joinPermissions: {
      display: "flex",
      justifyContent: "space-around",
      paddingLeft: "0",
      paddingRight: "0",
      marginTop: "3.73vh",
      //marginBottom: theme.spacing(3),
      "& svg": {
        //border: `1px solid ${color.white}`,
        padding: "12px 0px",
        borderRadius: "7.5px",
        color: color.white,
        fontSize: "1.87vw",
        "&:hover": {
          color: color.primaryLight,
          cursor: "pointer",
        },
        [theme.breakpoints.down("sm")]: {
          fontSize: "1.6rem",
        }
      },
      [theme.breakpoints.down("sm")]: {
        marginTop: "10px !important",
        padding: '0 50px',
        width: '250px',
        margin: 'auto'
      }
    },
    disable: {
      background: color.red,
      "&:hover": {
        opacity: "0.8",
        background: `${color.red} !important`,
      },
    },
    textBox: {
      width: "100%",
      //marginBottom: "60px"
    },
    userBox: {
      marginTop: '1vh',
      marginBottom: '1vh',
      [theme.breakpoints.down("sm")]: {
        marginTop: '10px',
        marginBottom: '10px'
      }
    },
    moderatorBox: {
      display: "flex",
      justifyContent: "space-between",
      color: color.lightgray1,
      alignItems: "center",
      padding: "0px 8px 8px",
    },
    action: {
      opacity: .9
    },
    anchor: {
      color: color.white,
      textDecoration: "none",
      border: `1px solid ${color.primaryLight}`,
      padding: theme.spacing(0.5, 5),
      borderRadius: "10px",
      textTransform: "capitalize",
      marginTop: '5.4vh',
      width: '178.69px',
      "&:hover": {
        fontWeight: "900",
        background: `linear-gradient(to right, ${color.primaryLight}, ${color.buttonGradient}, ${color.primary})`,
      }
    },
    videoContainer: {
      borderRadius: "4px",
      backgroundColor: color.blurEffect,
      backdropFilter: `blur(48px)`,	
      '-webkit-backdrop-filter': 'blur(48px)',
      transition: `background-color .2s ease`,
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "column",
      zIndex: 1,
      padding: "1.74vw",
      border: `1px solid ${color.whitePointOne}`,
      marginLeft: '15%',
      marginRight: 'auto',
      minHeight: '60vh',
      [theme.breakpoints.down("md")]: {
        padding: "24px 0",
        backgroundColor: videoTrack?.isMuted() ? color.blurEffect : color.lightBlurEffect,
        border: `none`,
        minHeight: 'fit-content',
        borderRadius: "20px 20px 0px 0px",
        marginLeft: 0,
        marginRight: 0,
        width: '350px'
      }
    },
    logoContainer: {},
    header: {
      color: color.white,
      textAlign: "center",
      fontSize: "2.385vw",
      fontWeight: 300,
      marginTop: '5.5vh',
      [theme.breakpoints.down("sm")]: {
        fontSize: "1.7rem",
        marginTop: '0',
      }
    },
    headerJoin: {
      color: color.white,
      textAlign: "center",
      fontSize: "2.385vw",
      fontWeight: 300,
      marginTop: theme.spacing(11),
      [theme.breakpoints.down("sm")]: {
        fontSize: "1.7rem",
        marginTop: '0',
      }
    },
    wrapper: {
      margin: "2.3vh 0px 0.5vh 0px",
      position: "relative",
      textAlign: "center",
      [theme.breakpoints.down("sm")]: {
        marginTop: 0,
        marginBottom: 0,
      }
    },
    buttonSuccess: {
      backgroundColor: color.primary,
      "&:hover": {
        backgroundColor: color.primary,
      },
    },
    buttonProgress: {
      color: color.primary,
      position: "absolute",
      bottom: "4.5vh",
      top: "30px",
      left: "50%",
      marginLeft: -12,
    },
    buttonProgressJoin: {
      color: color.primary,
      top: "30px",
      position: "absolute",
      bottom: '4.5vh',
      left: "50%",
      marginLeft: -12,
    },
  }));

  const classes = useStyles();
  return (
    <>
      {/* <Button onClick={handleSubmit} style={{background: '#fff'}}>Submit</Button>
      <JoinTrack tracks={localTracks} name={name} />
      <SnackbarBox notification={notification} /> */}
      <Box className={classes.root}>
        <JoinTrack tracks={localTracks} name={name} />
      <Box className={classes.videoContainer}>
        <Hidden smDown>
        <Box className={classes.logoContainer}>
          <Logo height={"80px"} />
        </Box>
        </Hidden>
        <Box>
        {queryParams.meetingId ? 
          <Typography className={classes.headerJoin}>Join {queryParams.meetingId}</Typography>
          :
          <Typography className={classes.header}>Create Meeting</Typography>
        }
        </Box>
        <Box className={classes.action}>
          <div className={classes.wrapper}>
            <Box className={classes.textBox}>
              <TextInput
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                label="Stream Url"
                width="20vw"
                value={streamUrl}
                onChange={handleStreamUrlChange}
              />
              {!queryParams.meetingId ? <>
              <TextInput
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                label="Meeting Title"
                width="20vw"
                value={meetingTitle}
                onChange={handleTitleChange}
              />
              </> : 
              null}
              <Box className={classes.userBox}>
                <TextInput
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  label="Username"
                  width="20vw"
                  value={name}
                  onChange={handleUserNameChange}
                />
              </Box>
            </Box>
            
          </div>
        </Box>
        <Box style={{textAlign: 'center', position: 'relative'}}>
        <FancyButton 
              homeButton={true}
              disabled={loading}
              onClick={handleSubmit}
              buttonText={buttonText}
            />
            </Box>
      </Box>
      <SnackbarBox notification={notification} />
    </Box>
    </>
  );
};

export default LobbyRoom;