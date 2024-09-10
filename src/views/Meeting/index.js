import { Box, Hidden, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { color } from "../../assets/styles/_color";
import ActionButtons from "../../components/meeting/ActionButtons";
import SariskaMediaTransport from "sariska-media-transport";
import ReconnectDialog from "../../components/shared/ReconnectDialog";
import { useDispatch, useSelector } from "react-redux";
import {
  addRemoteTrack,
  participantLeft,
  removeRemoteTrack,
  updateLocalTrack,
  remoteTrackMutedChanged,
} from "../../store/actions/track";
import Notification from "../../components/shared/Notification";
import {
  SPEAKER,
  PRESENTATION,
  GRID,
  ENTER_FULL_SCREEN_MODE,
} from "../../constants";
import { getUserById, preloadIframes, getDefaultDeviceId, isPortrait, isMobileOrTab } from "../../utils";
import PermissionDialog from "../../components/shared/PermissionDialog";
import SnackbarBox from "../../components/shared/Snackbar";
import Home from "../Home";
import {
  setPresenter,
  setPinParticipant,
  setRaiseHand,
  setModerator,
  setDisconnected,
  setLayout,
} from "../../store/actions/layout";
import { showNotification } from "../../store/actions/notification";
import { useHistory } from "react-router-dom";
import { setUserResolution } from "../../store/actions/layout";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import ReactGA from "react-ga4";
import {
  setCamera,
  setDevices,
  setMicrophone,
} from "../../store/actions/media";
import CompositeLayout from "../../components/meeting/CompositeLayout";
import SpeakerLayout from "../../components/meeting/SpeakerLayout";

const Meeting = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const localTracks = useSelector((state) => state.localTrack);
  const conference = useSelector((state) => state.conference);
  const connection = useSelector((state) => state.connection);
  const layout = useSelector((state) => state.layout);
  const notification = useSelector((state) => state.notification);
  const snackbar = useSelector((state) => state.snackbar);
  const isOnline = useOnlineStatus();
  const resolution = useSelector((state) => state.media?.resolution);
  const [dominantSpeakerId, setDominantSpeakerId] = useState(null);
  let oldDevices = useSelector((state) => state?.media?.devices);

  const useStyles = makeStyles((theme) => ({
    root: {
      // display: "flex",
      // flexDirection: "column",
      // background: color.secondaryDark,
      // minHeight:
      //   layout.mode === ENTER_FULL_SCREEN_MODE ? "100vh" : "calc(100vh - 16px)",
    },
  }));

  const classes = useStyles();
  let ingoreFirstEvent = true;

  const deviceListChanged = async (devices) => {
    let selectedDeviceOld,
      audioInputDeviceOld,
      audioOuputDeviceOld,
      videoInputDeviceOld;
    if (oldDevices) {
      selectedDeviceOld = oldDevices.filter(
        (item) => item.deviceId === "default"
      );
      audioInputDeviceOld = selectedDeviceOld.find(
        (item) => item.kind === "audioinput"
      );
      audioOuputDeviceOld = selectedDeviceOld.find(
        (item) => item.kind === "audiooutput"
      );
      videoInputDeviceOld = oldDevices.filter(
        (item) => item.kind === "videoinput"
      );
    }

    const selectedDeviceNew = devices.filter(
      (item) => item.deviceId === "default"
    );
    const audioInputDeviceNew = selectedDeviceNew.find(
      (item) => item.kind === "audioinput"
    );
    const audioOuputDeviceNew = selectedDeviceNew.find(
      (item) => item.kind === "audiooutput"
    );
    const videoInputDeviceNew = selectedDeviceNew.find(
      (item) => item.kind === "videoinput"
    );

    if (
      audioInputDeviceNew?.label &&
      audioInputDeviceOld?.label &&
      audioInputDeviceNew?.label !== audioInputDeviceOld?.label
    ) {
      const audioTrack = localTracks.find(
        (track) => track.getType() === "audio"
      );
      const [newAudioTrack] = await SariskaMediaTransport.createLocalTracks({
        devices: ["audio"],
        micDeviceId: "default",
      });
      dispatch(setMicrophone("default"));
      await conference.replaceTrack(audioTrack, newAudioTrack);
      console.log("audio input update done!!!!");
    }

    if (
      videoInputDeviceNew?.label &&
      videoInputDeviceOld?.label &&
      videoInputDeviceNew?.label !== videoInputDeviceOld?.label
    ) {
      const videoTrack = localTracks.find(
        (track) => track.getType() === "video"
      );
      const [newVideoTrack] = await SariskaMediaTransport.createLocalTracks({
        devices: ["video"],
        cameraDeviceId: "default",
        resolution,
      });
      dispatch(setCamera("default"));
      await conference.replaceTrack(videoTrack, newVideoTrack);
      console.log("video input update done!!!!");
    }

    if (
      audioOuputDeviceNew?.label &&
      audioOuputDeviceOld?.label &&
      audioOuputDeviceNew?.label !== audioOuputDeviceOld?.label
    ) {
      SariskaMediaTransport.mediaDevices.setAudioOutputDevice(
        audioOuputDeviceNew.deviceId
      );
      console.log("audio output update done!!!!");
    }
    dispatch(setDevices(devices));
    oldDevices = devices;
  };

  const audioOutputDeviceChanged = (deviceId) => {
    SariskaMediaTransport.mediaDevices.setAudioOutputDevice(deviceId);
  };

  const destroy = async () => {
    if (conference.getParticipantCount() - 1 === 0) {
      fetch(
        `https://whiteboard.sariska.io/boards/delete/${conference.connection.name}`,
        { method: "DELETE", mode: "cors" }
      );
      fetch(
        `https://etherpad.sariska.io/api/1/deletePad?apikey=a97b8845463ab348a91717f9887842edf0df15e395977c2dad12c56bca146d6e&padID=${conference.connection.name}`,
        { method: "GET", mode: "cors" }
      );
    }
    if (conference?.isJoined()) {
      await conference?.leave();
    }
    for (const track of localTracks) {
      await track.dispose();
    }
    await connection?.disconnect();
    SariskaMediaTransport.mediaDevices.removeEventListener(
      SariskaMediaTransport.mediaDevices.DEVICE_LIST_CHANGED,
      deviceListChanged
    );
  };

  useEffect(() => {
    if (!conference) {
      return;
    }

    conference.getParticipantsWithoutHidden().forEach((item) => {
      if (item._properties?.presenting === "start") {
        dispatch(
          showNotification({
            autoHide: true,
            message: `Screen sharing is being presenting by ${item._identity?.user?.name}`,
          })
        );
        dispatch(setPresenter({ participantId: item._id, presenter: true }));
      }

      if (item._properties?.handraise === "start") {
        dispatch(setRaiseHand({ participantId: item._id, raiseHand: true }));
      }

      if (item._properties?.isModerator === "true") {
        dispatch(setModerator({ participantId: item._id, isModerator: true }));
      }

      if (item._properties?.resolution) {
        dispatch(
          setUserResolution({
            participantId: item._id,
            resolution: item._properties?.resolution,
          })
        );
      }
    });

    conference.addEventListener(
      SariskaMediaTransport.events.conference.TRACK_REMOVED,
      (track) => {
        dispatch(removeRemoteTrack(track));
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.TRACK_ADDED,
      (track) => {
        if (track.isLocal()) {
          return;
        }
        dispatch(addRemoteTrack(track));
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.FACIAL_EXPRESSION_ADDED,
      (expression) => {
        console.log("FACIAL_EXPRESSION_ADDED", expression);
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.TRACK_MUTE_CHANGED,
      (track) => {
        dispatch(remoteTrackMutedChanged());
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.DOMINANT_SPEAKER_CHANGED,
      (id) => {
        console.log("DOMINANT_SPEAKER_CHANGED", id);
        setDominantSpeakerId(id);
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.LAST_N_ENDPOINTS_CHANGED,
      (enterIds, exitingIds) => {
        console.log("LAST_N_ENDPOINTS_CHANGED", enterIds, exitingIds);
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.PARTICIPANT_PROPERTY_CHANGED,
      (participant, key, oldValue, newValue) => {
        if (key === "presenting" && newValue === "start") {
          dispatch(
            showNotification({
              autoHide: true,
              message: `Screen sharing started by ${participant._identity?.user?.name}`,
            })
          );
          dispatch(
            setPresenter({ participantId: participant._id, presenter: true })
          );
        }

        if (key === "presenting" && newValue === "stop") {
          dispatch(
            setPresenter({ participantId: participant._id, presenter: false })
          );
        }

        if (key === "handraise" && newValue === "start") {
          dispatch(
            setRaiseHand({ participantId: participant._id, raiseHand: true })
          );
        }

        if (key === "handraise" && newValue === "stop") {
          dispatch(
            setRaiseHand({ participantId: participant._id, raiseHand: false })
          );
        }

        if (key === "isModerator" && newValue === "true") {
          dispatch(
            setModerator({ participantId: participant._id, isModerator: true })
          );
        }

        if (key === "resolution") {
          dispatch(
            setUserResolution({
              participantId: participant._id,
              resolution: newValue,
            })
          );
        }
      }
    );


    conference.addEventListener(
      SariskaMediaTransport.events.conference.MESSAGE_RECEIVED,
      (id, text, ts) => {
       console.log('MESSAGE_RECEIVED')
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.NOISY_MIC,
      () => {
        dispatch(
          showNotification({
            autoHide: true,
            message: "Your mic seems to be noisy",
            severity: "info",
          })
        );
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.TALK_WHILE_MUTED,
      () => {
        dispatch(
          showNotification({
            autoHide: true,
            message: "Trying to speak?  your are muted!!!",
            severity: "info",
          })
        );
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.NO_AUDIO_INPUT,
      () => {
        dispatch(
          showNotification({
            autoHide: true,
            message: "Looks like device has no audio input",
            severity: "warning",
          })
        );
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.CONNECTION_INTERRUPTED,
      () => {
        dispatch(
          showNotification({
            message:
              "You lost your internet connection. Trying to reconnect...",
            severity: "info",
          })
        );
        ingoreFirstEvent = false;
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.ENDPOINT_MESSAGE_RECEIVED,
      async (participant, data) => {
        console.log('ENDPOINT_MESSAGE_RECEIVED')
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.CONNECTION_RESTORED,
      () => {
        if (ingoreFirstEvent) {
          return;
        }
        dispatch(
          showNotification({
            message: "Your Internet connection was restored",
            autoHide: true,
            severity: "info",
          })
        );
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.ANALYTICS_EVENT_RECEIVED,
      (payload) => {
        const { name, action, actionSubject, source, attributes } = payload;
        ReactGA.event({
          category: name,
          action,
          label: actionSubject,
        });
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.KICKED,
      (id) => {
        // if a user kicked by moderator
        // kicked participant id
      }
    );

    conference.addEventListener(
      SariskaMediaTransport.events.conference.PARTICIPANT_KICKED,
      (actorParticipant, kickedParticipant, reason) => {}
    );

    preloadIframes(conference);
    SariskaMediaTransport.effects.createRnnoiseProcessor();
    SariskaMediaTransport.mediaDevices.addEventListener(
      SariskaMediaTransport.events.mediaDevices.DEVICE_LIST_CHANGED,
      deviceListChanged
    );
    SariskaMediaTransport.mediaDevices.addEventListener(
      SariskaMediaTransport.events.mediaDevices.AUDIO_OUTPUT_DEVICE_CHANGED,
      audioOutputDeviceChanged
    );

    window.addEventListener("beforeunload", destroy);

    return () => {
      destroy();
    };
  }, [conference]);

  useEffect(() => {
    if (!conference) {
      return;
    }
    const userLeft = (id) => {
      if (id === dominantSpeakerId) {
        setDominantSpeakerId(null);
      }
      if (id === layout.pinnedParticipant.participantId) {
        dispatch(setPinParticipant(null));
      }

      if (layout.presenterParticipantIds.find((item) => item === id)) {
        dispatch(setPresenter({ participantId: id, presenter: null }));
      }

      if (layout.raisedHandParticipantIds[id]) {
        dispatch(setRaiseHand({ participantId: id, raiseHand: null }));
      }
      dispatch(participantLeft(id));
    };
    conference.addEventListener(
      SariskaMediaTransport.events.conference.USER_LEFT,
      userLeft
    );
    return () => {
      conference.removeEventListener(
        SariskaMediaTransport.events.conference.USER_LEFT,
        userLeft
      );
    };
  }, [conference, layout]);

  useEffect(() => {
    SariskaMediaTransport.setNetworkInfo({ isOnline });
  }, [isOnline]);

  useEffect(()=> {
    if(isMobileOrTab()) {
      if(layout.type === SPEAKER)
      dispatch(setLayout(GRID));
    }
  },[])
  
  if (!conference || !conference.isJoined()) {
    return <Home />;
  }
  let justifyContent = "space-between";
  let paddingTop = 16;
  if (layout.mode === ENTER_FULL_SCREEN_MODE) {
    justifyContent = "space-around";
    paddingTop = 0;
  }
  return (
    <Box
      className={classes.root}
    >
      {/* <SpeakerLayout dominantSpeakerId={dominantSpeakerId}/> */}
        <CompositeLayout dominantSpeakerId={dominantSpeakerId} />
      
      <ActionButtons dominantSpeakerId={dominantSpeakerId} />
      
      <SnackbarBox notification={notification} />
      <ReconnectDialog open={layout.disconnected === "lost"} />
      <Notification snackbar={snackbar} />
    </Box>
  );
};

export default Meeting;
