/**
 * Prepares the peer message to be shown on screen.
 * @param {string} peerId for the current peer.
 * @returns a formatted string with the peer ID text.
 */
const getPeerText = (peerId) => `Your peer ID is: ${peerId}`;

let serverList = [];
let peer;
let connection;

const getListOfServers = () => {
  return axios({
    method: 'get',
    url: `https://${SERVER_URI}/${SERVER_KEY}/peers`
  }).then((response) => {
    serverList = response.data;
  });
};

const startServerConnection = () => {
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
  });
  // Establish listener for the connection
  peer.on('connection', (conn) => {
    console.log("CONNECTION RECEIVED");
    setConnecteeConnectionListeners(conn);
  });
};

const showListOfServers = (isRefresh = false) => {
  const serverListElem = document.getElementById(IDS.SERVER_LIST);
  // Show the server selection screen
  serverListElem.classList.remove('hidden_ensure');
  // Remove all children
  while (serverListElem.firstChild) {
    serverListElem.removeChild(serverListElem.firstChild);
  }
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
  console.log('TRYING TO CONNECT');
  // Connection in case I'm the one creating it
  setConnectorConnectionListeners(peer.connect(peerId));
};

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

const setConnectorConnectionListeners = (conn) => {
  console.log("SET CONNECTOR LIST", Date.now());
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
    console.log("OPEN CONN", Date.now());
    // Receive messages
  });
};

const setConnecteeConnectionListeners = (conn) => {
  console.log("SET CONNECTEE LIST", Date.now());
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
    console.log("SEND ACCEPTH", Date.now());
    sendMessage(SERVER_MESSAGE_NUMBERS.ACCEPTED, { message: 'Match accepted!' });
    // Start the game on the connectee, start as the second player
    startGameP2P(false);
  });
};

const handleDataReceived = (data) => {
  console.log("DATA RECV", Date.now());
  payload = JSON.parse(data);
  console.log(`Received ${JSON.stringify(payload)}`);
  // Handle different use cases
  switch (payload.status) {
    // Player rejected because of another connection
    case SERVER_MESSAGE_NUMBERS.REJECTED:
      // Close the connection on this side
      connection.close();
      break;
    // Match accepted, start the game as the first player
    case SERVER_MESSAGE_NUMBERS.ACCEPTED:
      startGameP2P(true);
      break;
    // New Movement
    case SERVER_MESSAGE_NUMBERS.NEW_MOVE:
      handleRemoteMovements(payload.data?.movements || []);
      break;
  }
};

/* 
------------------------------------------------------------------------------------------
Messages and Signaling
------------------------------------------------------------------------------------------
*/
const sendMessage = (status, payload, conn = undefined) => {
  console.log("SENDING MESSAGE ", Date.now());
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
