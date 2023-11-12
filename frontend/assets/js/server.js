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

/**
 * Gets the list of available peers to connect to.
 * @returns a promise that resolves to the list of peers.
 */
const getListOfPeers = () => {
  return axios({
    method: 'get',
    url: `https://${SERVER_URI}/${SERVER_KEY}/peers`
  }).then((response) => {
    serverList = response.data;
    gtag('event', TRACKING_EVENTS.SERVER_CONNECTION_LIST, {
      uuid: UUID
    });
  });
};

/**
 * Tries to start a new server connection to the signaling server.
 * @returns undefined.
 */
const startServerConnection = () => {
  gtag('event', TRACKING_EVENTS.SERVER_CONNECTION_START, {
    uuid: UUID
  });
  // Ensure there is no duplicate peer
  if (peer) {
    console.error(
      'Connection with source server already present, will not connect twice.'
    );
    return;
  }
  // Reset the game
  resetGame(MESSAGES.INSTRUCTIONS);
  // Get the peer information
  const peerInfoElem = document.getElementById(IDS.PEER_INFO);
  // Create the instance of the peer with the UUID
  peer = new Peer(UUID, SERVER_CONNECTION);
  gtag('event', TRACKING_EVENTS.SERVER_CONNECTION_FINISH, {
    uuid: UUID
  });
  // Actually establish the connection
  peer.on('open', (id) => {
    // Set the text for the peer info
    peerInfoElem.innerText = getPeerText(id);
    // Show items
    setIdDependentItemsStatus(true);
    // Disable instructions, show the server selection list
    getAndShowListOfPeers(false);
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
 * @returns undefined.
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
  // Hide the server list
  const serverListElem = document.getElementById(IDS.SERVER_LIST);
  serverListElem.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  // Show items
  setIdDependentItemsStatus(false);
  gtag('event', TRACKING_EVENTS.SERVER_CONNECTION_CLOSE, {
    uuid: UUID
  });
};

/* 
------------------------------------------------------------------------------------------
Visual Elements
------------------------------------------------------------------------------------------
*/

/**
 * Sets the visibility status for all the UUID-dependent items.
 * @param {boolean} visible flag to determine if items are visible or not
 */
const setIdDependentItemsStatus = (visible) => {
  // Get the element to notify the user
  const hiddenElems = document.querySelectorAll(
    `.${CLASSES.HIDDEN_WHEN_NO_ID}`
  );
  // Show the peer info
  hiddenElems.forEach((elem) => {
    if (visible) {
      elem.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
    } else {
      elem.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
    }
  });
};

/* 
------------------------------------------------------------------------------------------
Server Listing
------------------------------------------------------------------------------------------
*/
/**
 * Shows the list of peers previously obtained.
 * @param {boolean} isRefresh flag to determine if the action was a refresh, for backoff.
 */
const showListOfPeers = (isRefresh = false) => {
  const serverListElem = document.getElementById(IDS.SERVER_LIST);
  // Show the server selection screen
  serverListElem.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
  // Remove all children
  clearChildren(serverListElem);
  let serverItem;
  // Create a refresh element as the first one
  const refreshElem = document.createElement('button');
  refreshElem.innerHTML = 'Refresh List';
  refreshElem.setAttribute('onclick', `getAndShowListOfPeers(true)`);
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
        serverItem.setAttribute('onclick', `handleSelectPeer('${server}')`);
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

/**
 * Utility to get the list of peers and show it at the same time.
 * @param {boolean} isRefresh flag to determine if it's a refresh.
 */
const getAndShowListOfPeers = (isRefresh = false) => {
  getListOfPeers().then(() => {
    // Show the server selection screen
    showListOfPeers(isRefresh);
  });
};

/**
 * Handles the selection of a peer, will try to connect to it.
 * @param {string} peerId for the peer to try to connect to.
 */
const handleSelectPeer = (peerId) => {
  // Connection in case I'm the one creating it
  setConnectorConnectionListeners(peer.connect(peerId));
};

/* 
------------------------------------------------------------------------------------------
Connection Listeners
------------------------------------------------------------------------------------------
*/
/**
 * Sets the listeners for the peer that attempt to connect to the other.
 * @param {DataConnection} conn to set listeners to.
 * @returns undefined.
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

/**
 * Sets the listeners for the peer is being connected to.
 * @param {DataConnection} conn to set listeners to.
 * @returns undefined.
 */
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

/**
 * Handles a closed connection to inform the peer correctly and clean up resources.
 */
const handleClosedConnection = () => {
  gtag('event', TRACKING_EVENTS.PEER_CONNECTION_CLOSE, {
    uuid: UUID
  });
  console.warn(
    'Closing connection because a close event was received from the other end.'
  );
  connection.close();
  connection = undefined;
  // Handle when there was another player playing and you were waiting
  resetGame(
    `Game was closed by one of the players, it cannot be continued (or the match was rejected). ${MESSAGES.INSTRUCTIONS}`
  );
};

/* 
------------------------------------------------------------------------------------------
Main Handler
------------------------------------------------------------------------------------------
*/
/**
 * Handles data from the remote peer, based on the payload status, performs actions.
 * @param {any} data received from the other peer.
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
    case SERVER_MESSAGE_NUMBERS.REMATCH_ACCEPTED:
    case SERVER_MESSAGE_NUMBERS.ACCEPTED:
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

/**
 * Rejects a connection by sending a meesage and closing it.
 * @param {DataConnection} conn being rejected.
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

/**
 * Sends a message to the remote peer.
 * @param {number} status for the message.
 * @param {any} payload to send in the message.
 * @param {DataConnection} conn to send the message to.
 * @returns undefined.
 */
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

/**
 * Sends a movement message to the peer.
 * @param {any} payload with movement information.
 */
const sendMovement = (payload) => {
  sendMessage(SERVER_MESSAGE_NUMBERS.NEW_MOVE, payload);
};

/**
 * Sends a rematch request to the remote peer.
 */
const sendRematch = () => {
  sendMessage(SERVER_MESSAGE_NUMBERS.REMATCH, {
    message: 'Fancy a rematch?'
  });
  gtag('event', TRACKING_EVENTS.REMATCH_REQUEST, {
    uuid: UUID
  });
};

/**
 * Sends a rematch response to the peer that requested it.
 * @param {boolean} accept flag to determine if accepted or not.
 */
const respondToRematch = (accept) => {
  sendMessage(
    accept
      ? SERVER_MESSAGE_NUMBERS.REMATCH_ACCEPTED
      : SERVER_MESSAGE_NUMBERS.REMATCH_REJECTED,
    {
      message: accept ? 'Rematch accepted!' : 'Rematch declined!'
    }
  );
  gtag('event', TRACKING_EVENTS.REMATCH_RESPONSE, {
    uuid: UUID,
    accept: accept
  });
};
