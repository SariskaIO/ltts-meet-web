import {
  Box,
  Button,
  Typography,
  makeStyles,
} from "@material-ui/core";
import React, { useState } from "react";
import { STREAMING_URL_KEYS } from "../../../constants";
import CopyMeetingLink from "../CopyMeetingLink";
import { color } from "../../../assets/styles/_color";
import { useDispatch, useSelector } from "react-redux";
import { showNotification } from "../../../store/actions/notification";
import SearchBox from "../SearchBox";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "95%",
    [theme.breakpoints.down('md')]: {
      height: '82%'
    }
  },
  streamingButton:{
    marginTop: '16px',
    color: color.white,
    background: color.mainGradient,
    marginBottom: '16px',
  //  marginLeft: '8px',
    textTransform: 'capitalize',
    width: '100%',
    borderRadius: '10px',
    paddingTop: '10px',
    paddingBottom: '10px',
    '&:hover': {
      opacity: '0.8'
    }
  }
}));

const LiveStreamingDetails = ({featureStates, stopStreaming, startStreaming, streamingUrls, streamKey, handleStreamKeyChange, isLowLatencyUrl}) => {
  const classes = useStyles();
  const [copySuccess, setCopySuccess] = useState('');
  const notification = useSelector(state => state.notification);
  const dispatch = useDispatch();

  function copyToClipboard(textToCopy) {
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess('successfully copied');
    dispatch(showNotification({
        message: "successfully copied",
        severity: "info",
        autoHide: true,
    }))
}

  return (
    <Box className={classes.root}>
      <Box sx={{mt: 1}}>
      <SearchBox
          placeholder={"Enter You Tube Stream key"}
          value={streamKey}
          id="streamKey"
          name="streamKey"
          handleChange={handleStreamKeyChange}
        />
        <Button
          variant="outlined"
          onClick={featureStates.streaming ? stopStreaming : startStreaming}
          className={classes.streamingButton}
        >{featureStates.streaming ? "Stop Streaming" : "Start Streaming"}
        </Button>
        {featureStates.streaming && Object.keys(streamingUrls)?.length>0 ? <Box>
        <Typography style={{color: color.white, marginTop: '0.5rem', marginLeft: '8px', marginBottom: '8px'}}>Click to copy Streaming Url</Typography>
        {isLowLatencyUrl ? 
             <Box sx={{display: 'flex', mb: 1, mt: 1}} >
             <Button style={{color: color.primaryLight}} onClick={()=>copyToClipboard(streamingUrls['low_latency_hls_url'] || streamingUrls['low_latency_hls_url'])}>
               low_latency_hls_url
             </Button>
             </Box>
           :
           STREAMING_URL_KEYS.map(url => (
            <Box sx={{display: 'flex', mb: 1, mt: 1}} key={url}>
              <Button style={{color: color.primaryLight}} onClick={()=>copyToClipboard(streamingUrls[url])}>
                {url}
              </Button>
            </Box>
          ))}
        </Box> : null}
      </Box>
      
    </Box>
  );
};

export default LiveStreamingDetails;
