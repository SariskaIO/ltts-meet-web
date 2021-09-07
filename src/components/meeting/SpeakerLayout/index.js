import {Box, makeStyles} from '@material-ui/core';
import React from 'react'
import VideoBox from '../../shared/VideoBox';
import PartcipantPane from "../../shared/ParticipantPane";
import {useSelector} from "react-redux";
import {useWindowResize} from "../../../hooks/useWindowResize";
import classnames from "classnames";
import * as Constants from "../../../constants";


const useStyles = makeStyles((theme) => ({
    root: {
        alignItems: "center",
        display: "flex",
        "& .fullmode": {
            position: "absolute",
            right: 0,
        }
    }
}));

const SpeakerLayout = ({dominantSpeakerId}) => {
    const classes = useStyles();
    const {viewportWidth, viewportHeight} = useWindowResize();
    const localTracks = useSelector(state => state.localTrack);
    const remoteTracks = useSelector(state => state.remoteTrack);
    const conference = useSelector(state => state.conference);
    const layout = useSelector(state=>state.layout);
    const myUserId = conference.myUserId();
    const largeVideoId = layout.pinnedParticipantId || layout.presenterParticipantId || dominantSpeakerId || myUserId;

    const constraints = {
        "colibriClass": "ReceiverVideoConstraints",
        "onStageEndpoints":  [largeVideoId],
        "defaultConstraints": { "maxHeight":  180 },
        "constraints": {
            [largeVideoId]: { "maxHeight": 720 }
        }
    }
    conference.setReceiverConstraints(constraints);

    const activeClasses = classnames(classes.root, {
        'fullmode': layout.mode === Constants.ENTER_FULL_SCREEN_MODE
    });

    return (
        <Box style={{justifyContent: conference.getParticipantCount() === 1 ? "center" : "space-evenly"}} className={activeClasses}>
            <VideoBox
                isFilmstrip={true}
                width={viewportWidth}
                height={viewportHeight > viewportWidth*9/16 ? viewportWidth*9/16 : viewportHeight}
                isLargeVideo={true}
                isActiveSpeaker={ largeVideoId===dominantSpeakerId}
                isPresenter={largeVideoId===layout.presenterParticipantId}
                participantDetails={conference.participants[largeVideoId]?._identity?.user || conference.getLocalUser()}
                participantTracks={remoteTracks[largeVideoId] || localTracks}
                localUserId={conference.myUserId()}
            />
            {  conference.getParticipantCount() > 1 &&
                <PartcipantPane height={viewportHeight > viewportWidth*9/16 ? viewportWidth*9/16 : viewportHeight } dominantSpeakerId={dominantSpeakerId} largeVideoId={largeVideoId} localTracks={localTracks} remoteTracks={remoteTracks}/>
            }
        </Box>
    )
}

export default SpeakerLayout;
