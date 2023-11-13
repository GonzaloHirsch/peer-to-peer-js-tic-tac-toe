// Generate the ID for the connection, once per load of the tab
const UUID = window.crypto.randomUUID();

/* 
------------------------------------------------------------------------------------------
CSS CLASSES AND IDS
------------------------------------------------------------------------------------------
*/
// Some names of the classes
const CLASSES = {
  HIDDEN_WHEN_NO_ID: 'hidden-when-no-id'
};
// Names for some IDs
const IDS = {
  GAME_BOX: 'game-box',
  INSTRUCTIONS: 'game-instructions',
  COVER: 'game-cover',
  TURN_COVER: 'turn-cover',
  PEER_INFO: 'peer-info',
  END_COVER: 'end-cover',
  WINNER: 'winner',
  SERVER_LIST: 'server-list',
  REMATCH_BTN: 'end-rematch-button',
  END_REMATCH: 'end-rematch',
  BUTTON_P2P: 'button-p2p',
  BUTTON_DISCONNECT: 'button-disconnect',
  BUTTON_LOCAL: 'button-local'
};
// CSS Classes
const CSS_CLASSES = {
  ENSURE_HIDDEN: 'hidden_ensure',
  PREVIOUS_SELECTION: 'previous_selection'
};

/* 
------------------------------------------------------------------------------------------
GAME RELATED
------------------------------------------------------------------------------------------
*/
// Cell states
const STATES = {
  EMPTY: 'EMPTY',
  X: 'X',
  O: 'O',
  TIE: 'TIE'
};
// Game states
const GAME_STATES = {
  CHOOSE_BOARD: 'CHOOSE_BOARD',
  CHOOSE_CELL: 'CHOOSE_CELL'
};
// Game Win Configurations
const WIN_CONFIGS = [
  [
    [0, 0],
    [0, 1],
    [0, 2]
  ],
  [
    [1, 0],
    [1, 1],
    [1, 2]
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2]
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0]
  ],
  [
    [0, 1],
    [1, 1],
    [2, 1]
  ],
  [
    [0, 2],
    [1, 2],
    [2, 2]
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2]
  ],
  [
    [0, 2],
    [1, 1],
    [2, 0]
  ]
];
// Possible win options.
const WIN_OPTIONS = {
  [STATES.X]: `${STATES.X}${STATES.X}${STATES.X}`,
  [STATES.O]: `${STATES.O}${STATES.O}${STATES.O}`
};
// Playable modes
const PLAY_MODE = {
  LOCAL: 'LOCAL',
  P2P: 'P2P'
};
const MESSAGES = {
  INSTRUCTIONS:
    'Start the game by selecting which game mode you want. You can opt for local multiplayer or P2P. If you choose to play P2P, you need to select your opponent from the peer list.'
};

/* 
------------------------------------------------------------------------------------------
Server
------------------------------------------------------------------------------------------
*/
// Template to send messages for the server
const SERVER_MESSAGE_TEMPLATE = {
  data: {},
  status: 200
};
// Server message types
const SERVER_MESSAGE_NUMBERS = {
  REJECTED: 400,
  REMATCH_REJECTED: 401,
  ACCEPTED: 200,
  REMATCH_ACCEPTED: 201,
  NEW_MOVE: 250,
  REMATCH: 300
};
// Server connection information
const SERVER_URI = 'tictactoe-server-geag7w45ea-ew.a.run.app';
const SERVER_KEY = '8dd9b2075a04edc3c85aea8cc815ee93';
const SERVER_CONNECTION = {
  host: SERVER_URI,
  port: 443,
  ping: 1000 * 15, // 15s ping
  secure: true,
  debug: 2,
  key: SERVER_KEY
};
// Timeout in seconds
const SERVER_REFRESH_TIMEOUT = 60;

/* 
------------------------------------------------------------------------------------------
Tracking
------------------------------------------------------------------------------------------
*/
const TRACKING_EVENTS = {
  SERVER_CONNECTION_START: 'server_connection_start',
  SERVER_CONNECTION_FINISH: 'server_connection_finish',
  SERVER_CONNECTION_CLOSE: 'server_connection_close',
  SERVER_CONNECTION_LIST: 'server_connection_list',
  PEER_CONNECTION_CLOSE: 'peer_connection_close',
  MATCH_RESULT: 'match_result',
  REMATCH_REQUEST: 'peer_rematch_request',
  REMATCH_RESPONSE: 'peer_rematch_response'
};
