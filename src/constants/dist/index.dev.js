"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STREAMING_URL_KEYS = exports.PARTICIPANTS_VISIBLE_ON_MOBILE = exports.RECORDING_ERROR_CONSTANTS = exports.GET_PRESIGNED_URL = exports.CHECK_ROOM_URL = exports.DROPBOX_APP_KEY = exports.WHITEBOARD = exports.SHARED_DOCUMENT = exports.SET_PRESENTATION_TYPE = exports.SPEAKER = exports.GRID = exports.PRESENTATION = exports.CHAT = exports.STOP_PRESENTING = exports.START_PRESENTING = exports.IS_PRESENTING = exports.VIRTUAL_BACKGROUND = exports.ENTER_FULL_SCREEN_MODE = exports.EXIT_FULL_SCREEN_MODE = exports.GENERATE_TOKEN_URL = exports.GOOGLE_SCOPE_YOUTUBE = exports.GOOGLE_SCOPE_CALENDAR = exports.GOOGLE_API_STATES = exports.RECEIVED_PRESENTATION_STATUS = exports.GET_PRESENTATION_STATUS = exports.LIVE_STREAMING_STOP_URL = exports.LIVE_STREAMING_START_URL = exports.CREATE_YOUTUBE_LIVE_BROADCASTS = exports.CREATE_YOUTUBE_LIVE_STREAMS = exports.DISCOVERY_DOCS = exports.API_URL_LIVE_BROADCASTS = exports.API_URL_BROADCAST_STREAMS = exports.GOOGLE_API_CLIENT_ID = exports.GOOGLE_API_CLIENT_LIBRARY_URL = exports.LTTS_API_SERVICE_URL = exports.streamingMode = exports.s3 = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var s3 = {
  file_recording_metadata: {
    share: true
  }
};
exports.s3 = s3;
var streamingMode = 'jibri'; // or 'srs'

exports.streamingMode = streamingMode;
var LTTS_API_SERVICE_URL = "".concat(process.env.REACT_APP_LTTS_API_SERVICE_HOST, "/api");
exports.LTTS_API_SERVICE_URL = LTTS_API_SERVICE_URL;
var GOOGLE_API_CLIENT_LIBRARY_URL = 'https://apis.google.com/js/api.js';
exports.GOOGLE_API_CLIENT_LIBRARY_URL = GOOGLE_API_CLIENT_LIBRARY_URL;
var GOOGLE_API_CLIENT_ID = "621897095595-k7tr68mgfrhm1935cqdq5l2vg8u7ltu8.apps.googleusercontent.com";
exports.GOOGLE_API_CLIENT_ID = GOOGLE_API_CLIENT_ID;
var API_URL_BROADCAST_STREAMS = 'https://content.googleapis.com/youtube/v3/liveStreams?part=id%2Csnippet%2Ccdn%2Cstatus&id=';
exports.API_URL_BROADCAST_STREAMS = API_URL_BROADCAST_STREAMS;
var API_URL_LIVE_BROADCASTS = 'https://content.googleapis.com/youtube/v3/liveBroadcasts?broadcastType=all&mine=true&part=id%2Csnippet%2CcontentDetails%2Cstatus';
exports.API_URL_LIVE_BROADCASTS = API_URL_LIVE_BROADCASTS;
var DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
exports.DISCOVERY_DOCS = DISCOVERY_DOCS;
var CREATE_YOUTUBE_LIVE_STREAMS = "https://www.googleapis.com/youtube/v3/liveStreams";
exports.CREATE_YOUTUBE_LIVE_STREAMS = CREATE_YOUTUBE_LIVE_STREAMS;
var CREATE_YOUTUBE_LIVE_BROADCASTS = "https://www.googleapis.com/youtube/v3/liveBroadcasts";
exports.CREATE_YOUTUBE_LIVE_BROADCASTS = CREATE_YOUTUBE_LIVE_BROADCASTS;
var LIVE_STREAMING_START_URL = "".concat(process.env.REACT_APP_API_SERVICE_HOST, "terraform/v1/hooks/srs/startRecording");
exports.LIVE_STREAMING_START_URL = LIVE_STREAMING_START_URL;
var LIVE_STREAMING_STOP_URL = "".concat(process.env.REACT_APP_API_SERVICE_HOST, "terraform/v1/hooks/srs/stopRecording");
exports.LIVE_STREAMING_STOP_URL = LIVE_STREAMING_STOP_URL;
var GET_PRESENTATION_STATUS = "GET_PRESENTATION_STATUS";
exports.GET_PRESENTATION_STATUS = GET_PRESENTATION_STATUS;
var RECEIVED_PRESENTATION_STATUS = "RECEIVED_PRESENTATION_STATUS";
exports.RECEIVED_PRESENTATION_STATUS = RECEIVED_PRESENTATION_STATUS;
var GOOGLE_API_STATES = {
  NEEDS_LOADING: 0,
  LOADED: 1,
  SIGNED_IN: 2,
  NOT_AVAILABLE: 3
};
exports.GOOGLE_API_STATES = GOOGLE_API_STATES;
var GOOGLE_SCOPE_CALENDAR = 'https://www.googleapis.com/auth/calendar';
exports.GOOGLE_SCOPE_CALENDAR = GOOGLE_SCOPE_CALENDAR;
var GOOGLE_SCOPE_YOUTUBE = 'https://www.googleapis.com/auth/youtube';
exports.GOOGLE_SCOPE_YOUTUBE = GOOGLE_SCOPE_YOUTUBE;
var GENERATE_TOKEN_URL = "".concat(process.env.REACT_APP_API_SERVICE_HOST, "api/v1/misc/generate-token");
exports.GENERATE_TOKEN_URL = GENERATE_TOKEN_URL;
var EXIT_FULL_SCREEN_MODE = "exitFullScreen";
exports.EXIT_FULL_SCREEN_MODE = EXIT_FULL_SCREEN_MODE;
var ENTER_FULL_SCREEN_MODE = "enterFullScreen";
exports.ENTER_FULL_SCREEN_MODE = ENTER_FULL_SCREEN_MODE;
var VIRTUAL_BACKGROUND = "VIRTUAL_BACKGROUND";
exports.VIRTUAL_BACKGROUND = VIRTUAL_BACKGROUND;
var IS_PRESENTING = "IS_PRESENTING";
exports.IS_PRESENTING = IS_PRESENTING;
var START_PRESENTING = "START_PRESENTING";
exports.START_PRESENTING = START_PRESENTING;
var STOP_PRESENTING = "STOP_PRESENTING";
exports.STOP_PRESENTING = STOP_PRESENTING;
var CHAT = "CHAT";
exports.CHAT = CHAT;
var PRESENTATION = "PRESENTATION";
exports.PRESENTATION = PRESENTATION;
var GRID = "GRID";
exports.GRID = GRID;
var SPEAKER = "SPEAKER";
exports.SPEAKER = SPEAKER;
var SET_PRESENTATION_TYPE = "SET_PRESENTATION_TYPE";
exports.SET_PRESENTATION_TYPE = SET_PRESENTATION_TYPE;
var SHARED_DOCUMENT = "SHARED_DOCUMENT";
exports.SHARED_DOCUMENT = SHARED_DOCUMENT;
var WHITEBOARD = "WHITEBOARD";
exports.WHITEBOARD = WHITEBOARD;
var DROPBOX_APP_KEY = "hey9dkz8x8s3x74";
exports.DROPBOX_APP_KEY = DROPBOX_APP_KEY;
var CHECK_ROOM_URL = "https://reservation.sariska.io/room";
exports.CHECK_ROOM_URL = CHECK_ROOM_URL;
var GET_PRESIGNED_URL = "".concat(process.env.REACT_APP_API_SERVICE_HOST, "api/v1/misc/get-presigned");
exports.GET_PRESIGNED_URL = GET_PRESIGNED_URL;
var RECORDING_ERROR_CONSTANTS = {
  busy: "Already Busy",
  error: "Something went wrong",
  resource_constraint: "Resource constraint",
  unexpected_request: "Recording or live streaming is already enabled",
  service_unavailable: "Service unavailable"
};
exports.RECORDING_ERROR_CONSTANTS = RECORDING_ERROR_CONSTANTS;
var PARTICIPANTS_VISIBLE_ON_MOBILE = 7;
exports.PARTICIPANTS_VISIBLE_ON_MOBILE = PARTICIPANTS_VISIBLE_ON_MOBILE;
var STREAMING_URL_KEYS = ['dash_url', 'flv_url', 'hds_url', 'hls_master_url', 'hls_url', 'low_latency_hls_master_url', 'low_latency_hls_url', 'rtmp_url', 'srt_url', 'vod_url'];
exports.STREAMING_URL_KEYS = STREAMING_URL_KEYS;