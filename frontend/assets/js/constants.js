const SERVER_URI = 'tictactoe-server-geag7w45ea-ew.a.run.app';
const SERVER_KEY = '8dd9b2075a04edc3c85aea8cc815ee93';
const SERVER_CONNECTION = {
  host: SERVER_URI,
  port: 443,
  ping: 1000 * 15, // 15s ping
  secure: true,
  debug: 3,
  key: SERVER_KEY
};
// Generate the ID for the connection, once per load of the tab
const UUID = crypto.randomUUID();
// Some names of the classes
const CLASSES = {
  HIDDEN_WHEN_NO_ID: 'hidden-when-no-id'
};
// Names for some IDs
const IDS = {
  GAME_BOX: 'game-box',
  INSTRUCTIONS: 'game-instructions',
  COVER: 'game-cover',
  PEER_INFO: 'peer-info',
  END_COVER: 'end-cover',
  WINNER: 'winner'
};
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
