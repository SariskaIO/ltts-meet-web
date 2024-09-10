import React from 'react'
import { useMediaTracks } from '../../../hooks/useMediaTracks';

const MediaTrack = ({streamUrl, setLocalTracks, iAmRecorder, localTracksRedux}) => {
    useMediaTracks(streamUrl, setLocalTracks, iAmRecorder, localTracksRedux);
  return (
    <div></div>
  )
}

export default MediaTrack