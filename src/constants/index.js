import React from "react";

export const s3 = {
   file_recording_metadata : {
       share: true
    }
}
export const STREAMING_FLAGS = {
    is_direct_ingestion: true,
    is_low_latency: true
}
export const streamingMode = 'jibri' // or 'srs'
export const LTTS_API_SERVICE_URL = `${process.env.REACT_APP_LTTS_API_SERVICE_HOST}/api`;
export const GOOGLE_API_CLIENT_LIBRARY_URL = 'https://apis.google.com/js/api.js';
export const GOOGLE_API_CLIENT_ID = "621897095595-k7tr68mgfrhm1935cqdq5l2vg8u7ltu8.apps.googleusercontent.com";
export const API_URL_BROADCAST_STREAMS = 'https://content.googleapis.com/youtube/v3/liveStreams?part=id%2Csnippet%2Ccdn%2Cstatus&id=';
export const API_URL_LIVE_BROADCASTS = 'https://content.googleapis.com/youtube/v3/liveBroadcasts?broadcastType=all&mine=true&part=id%2Csnippet%2CcontentDetails%2Cstatus';
export const DISCOVERY_DOCS = [ 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest' ];
export const CREATE_YOUTUBE_LIVE_STREAMS = "https://www.googleapis.com/youtube/v3/liveStreams";
export const CREATE_YOUTUBE_LIVE_BROADCASTS = "https://www.googleapis.com/youtube/v3/liveBroadcasts";
export const LIVE_STREAMING_START_URL = `${process.env.REACT_APP_API_SERVICE_HOST}terraform/v1/hooks/srs/startRecording`;
export const LIVE_STREAMING_STOP_URL = `${process.env.REACT_APP_API_SERVICE_HOST}terraform/v1/hooks/srs/stopRecording`;
export const GET_PRESENTATION_STATUS = "GET_PRESENTATION_STATUS";
export const RECEIVED_PRESENTATION_STATUS = "RECEIVED_PRESENTATION_STATUS";
export const GOOGLE_API_STATES = {
    NEEDS_LOADING: 0,
    LOADED: 1,
    SIGNED_IN: 2,
    NOT_AVAILABLE: 3
};
export const GOOGLE_SCOPE_CALENDAR = 'https://www.googleapis.com/auth/calendar';
export const GOOGLE_SCOPE_YOUTUBE = 'https://www.googleapis.com/auth/youtube';
export const GENERATE_TOKEN_URL = `${process.env.REACT_APP_API_SERVICE_HOST}api/v1/misc/generate-token`;
export const EXIT_FULL_SCREEN_MODE = "exitFullScreen";
export const ENTER_FULL_SCREEN_MODE = "enterFullScreen";
export const VIRTUAL_BACKGROUND  = "VIRTUAL_BACKGROUND";
export const IS_PRESENTING  = "IS_PRESENTING";
export const START_PRESENTING = "START_PRESENTING";
export const STOP_PRESENTING = "STOP_PRESENTING";
export const CHAT = "CHAT";
export const PRESENTATION = "PRESENTATION";
export const GRID = "GRID";
export const SPEAKER = "SPEAKER";
export const SET_PRESENTATION_TYPE = "SET_PRESENTATION_TYPE";
export const SHARED_DOCUMENT = "SHARED_DOCUMENT";
export const WHITEBOARD = "WHITEBOARD";

export const DROPBOX_APP_KEY = "hey9dkz8x8s3x74";
export const CHECK_ROOM_URL = "https://reservation.sariska.io/room"

export const GET_PRESIGNED_URL = `${process.env.REACT_APP_API_SERVICE_HOST}api/v1/misc/get-presigned`;

export const RECORDING_ERROR_CONSTANTS  = {
    busy: "Already Busy",
    error: "Something went wrong",
    resource_constraint: "Resource constraint",
    unexpected_request: "Recording or live streaming is already enabled",
    service_unavailable: "Service unavailable"
};

export const PARTICIPANTS_VISIBLE_ON_MOBILE = 7;

export const STREAMING_URL_KEYS = [
    'dash_url',
    'flv_url',
    'hds_url',
    'hls_master_url',
    'hls_url',
    'low_latency_hls_master_url',
    'low_latency_hls_url',
    'rtmp_url',
    'srt_url',
    'vod_url'
  ]