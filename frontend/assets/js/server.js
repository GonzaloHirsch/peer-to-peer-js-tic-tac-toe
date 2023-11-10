/**
 * Prepares the peer message to be shown on screen.
 * @param {string} peerId for the current peer.
 * @returns a formatted string with the peer ID text.
 */
const getPeerText = (peerId) => `Your peer ID is: ${peerId}`;

let serverList = [];
let peer;
let connection;
let buttonP2P = document.getElementById(IDS.BUTTON_P2P);
let buttonLocal = document.getElementById(IDS.BUTTON_LOCAL);
let buttonDisconnect = document.getElementById(IDS.BUTTON_DISCONNECT);

const getListOfServers = () => {
  return axios({
    method: 'get',
    url: `https://${SERVER_URI}/${SERVER_KEY}/peers`
  }).then((response) => {
    serverList = response.data;
  });
};

const startServerConnection = () => {
  // Ensure there is no duplicate peer
  if (peer) {
    console.error(
      'Connection with source server already present, will not connect twice.'
    );
    return;
  }
  // Get the element to notify the user
  const hiddenElems = document.querySelectorAll(
    `.${CLASSES.HIDDEN_WHEN_NO_ID}`
  );
  const peerInfoElem = document.getElementById(IDS.PEER_INFO);
  // Create the instance of the peer with the UUID
  peer = new Peer(UUID, SERVER_CONNECTION);
  // Actually establish the connection
  peer.on('open', (id) => {
    // Set the text for the peer info
    peerInfoElem.innerText = getPeerText(id);
    // Show the peer info
    hiddenElems.forEach((elem) => elem.classList.remove('hidden'));
    // Disable instructions, show the server selection list
    getAndShowListOfServers(false);
    // Disable the connection buttons
    buttonP2P.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
    buttonLocal.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
    buttonDisconnect.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
  });
  // Establish listener for the connection
  peer.on('connection', (conn) => {
    setConnecteeConnectionListeners(conn);
  });
  // Handle errors more gracefully
  peer.on('error', (error) => {
    console.error(`Error in the peer. Error type ${error.type}`);
    console.error(error);
    setCoverMessage(
      `Error connecting to opponent. Try refreshing the list of peers. ${MESSAGES.INSTRUCTIONS} (error code '${error.type}')`
    );
  });
};

/**
 * Closes the connection to the server, if present.
 * @returns nothing
 */
const closeServerConnection = () => {
  // Do nothing if no peer
  if (!peer) return;
  // Destroy the peer for cleanup
  peer.destroy();
  peer = undefined;
  // Show the connect buttons again
  buttonP2P.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
  buttonLocal.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
  buttonDisconnect.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
};

/* 
------------------------------------------------------------------------------------------
Server Listing
------------------------------------------------------------------------------------------
*/
const showListOfServers = (isRefresh = false) => {
  const serverListElem = document.getElementById(IDS.SERVER_LIST);
  // Show the server selection screen
  serverListElem.classList.remove('hidden_ensure');
  // Remove all children
  clearChildren(serverListElem);
  let serverItem;
  // Create a refresh element as the first one
  const refreshElem = document.createElement('button');
  refreshElem.innerHTML = 'Refresh List';
  refreshElem.setAttribute('onclick', `getAndShowListOfServers(true)`);
  refreshElem.classList.add('refresh');
  serverListElem.appendChild(refreshElem);
  // If it is a refresh, must disable it for some timeout
  if (isRefresh) {
    refreshElem.setAttribute('disabled', 'true');
    refreshElem.classList.add('disabled');
    // Timeout helps limit the number of requests to the server
    setTimeout(() => {
      refreshElem.removeAttribute('disabled');
      refreshElem.classList.remove('disabled');
    }, SERVER_REFRESH_TIMEOUT * 1000);
  }
  // Show servers only if there are enough
  if (serverList.length > 1) {
    // Add the current list
    serverList.forEach((server) => {
      if (server !== UUID) {
        serverItem = document.createElement('button');
        serverItem.innerHTML = `${server}`;
        serverItem.setAttribute('onclick', `handleSelectServer('${server}')`);
        serverListElem.appendChild(serverItem);
      }
    });
  }
  // No servers, just show a help message
  else {
    serverItem = document.createElement('div');
    serverItem.innerHTML =
      'Currently there are no servers. Wait and refresh periodically or share this to play with a friend.';
    serverListElem.appendChild(serverItem);
  }
};

const getAndShowListOfServers = (isRefresh = false) => {
  getListOfServers().then(() => {
    // Show the server selection screen
    showListOfServers(isRefresh);
  });
};

const handleSelectServer = (peerId) => {
  // Connection in case I'm the one creating it
  setConnectorConnectionListeners(peer.connect(peerId));
};

/* 
------------------------------------------------------------------------------------------
Connection Listeners
------------------------------------------------------------------------------------------
*/
const setConnectorConnectionListeners = (conn) => {
  // Ensure it only has 1 connection
  if (connection) {
    rejectNewConnection(conn);
    return;
  }
  connection = conn;
  // Make sure connection is successful
  connection.on('data', (data) => handleDataReceived(data));
  // Make sure the connection is usable
  connection.on('open', () => {
    // Receive messages
  });
  // Ensure connection is closed from both ends
  connection.on('close', () => handleClosedConnection());
  // Ensure correct signaling for errors
  connection.on('error', () => {
    console.log('SUPER ERROR');
  });
};

const setConnecteeConnectionListeners = (conn) => {
  // Ensure it only has 1 connection
  if (connection) {
    rejectNewConnection(conn);
    return;
  }
  connection = conn;
  // Make sure connection is successful
  connection.on('data', (data) => handleDataReceived(data));
  connection.on('open', () => {
    // Send the match accepted data
    sendMessage(SERVER_MESSAGE_NUMBERS.ACCEPTED, {
      message: 'Match accepted!'
    });
    // Start the game on the connectee, start as the second player
    startGameP2P(false);
  });
  // Ensure connection is closed from both ends
  connection.on('close', () => handleClosedConnection());
};

const handleClosedConnection = () => {
  console.warn(
    'Closing connection because a close event was received from the other end.'
  );
  connection.close();
  connection = undefined;
  // Handle when there was another player playing and you were waiting
  resetGame(
    `Game was closed by one of the players, it cannot be continued. ${MESSAGES.INSTRUCTIONS}`
  );
};

/* 
------------------------------------------------------------------------------------------
Main Handler
------------------------------------------------------------------------------------------
*/
const handleDataReceived = (data) => {
  payload = JSON.parse(data);
  // Handle different use cases
  switch (payload.status) {
    // Player rejected because of another connection
    case SERVER_MESSAGE_NUMBERS.REJECTED:
      // Close the connection on this side
      connection.close();
      connection = undefined;
      break;
    // Player rejected
    case SERVER_MESSAGE_NUMBERS.REMATCH_REJECTED:
      // Close the connection on this side
      connection.close();
      connection = undefined;
      // Display the information that the player rejected it
      handleRematchRemoteDecline();
      break;
    // Match/rematch accepted, start the game as the first player
    case SERVER_MESSAGE_NUMBERS.ACCEPTED:
    case SERVER_MESSAGE_NUMBERS.REMATCH_ACCEPTED:
      startGameP2P(true);
      break;
    // New Movement
    case SERVER_MESSAGE_NUMBERS.NEW_MOVE:
      handleRemoteMovements(payload.data?.movements || []);
      break;
    // Rematch request
    case SERVER_MESSAGE_NUMBERS.REMATCH:
      handleRematchRequest(payload.data?.message || '');
      break;
  }
};

/* 
------------------------------------------------------------------------------------------
Messages and Signaling
------------------------------------------------------------------------------------------
*/

const rejectNewConnection = (conn) => {
  // Just log out the error
  console.error(
    `Rejecting connection with ${conn.peer} because of an existing match with ${connection.peer}.`
  );
  // Wait until this new connection is created to send the rejection, then close it.
  conn.on('open', () => {
    sendMessage(
      SERVER_MESSAGE_NUMBERS.REJECTED,
      {
        message: 'This peer is already on a match.'
      },
      conn
    );
    conn.close();
  });
};

const sendMessage = (status, payload, conn = undefined) => {
  // If no available connection, the connection was closed. Show that and close the connection
  if (!(conn || connection)) {
    setCoverMessage(`Match was closed by opponent. ${MESSAGES.INSTRUCTIONS}`);
    setCoverStatus(true);
    setTurnCoverStatus(false);
    return;
  }
  (conn ? conn : connection).send(
    JSON.stringify({
      ...SERVER_MESSAGE_TEMPLATE,
      status: status,
      data: payload
    })
  );
};

const sendMovement = (payload) => {
  sendMessage(SERVER_MESSAGE_NUMBERS.NEW_MOVE, payload);
};

const sendRematch = () => {
  sendMessage(SERVER_MESSAGE_NUMBERS.REMATCH, {
    message: 'Fancy a rematch?'
  });
};

const respondToRematch = (accept) => {
  sendMessage(
    accept
      ? SERVER_MESSAGE_NUMBERS.REMATCH_ACCEPTED
      : SERVER_MESSAGE_NUMBERS.REMATCH_REJECTED,
    {
      message: accept ? 'Rematch accepted!' : 'Rematch declined!'
    }
  );
};
