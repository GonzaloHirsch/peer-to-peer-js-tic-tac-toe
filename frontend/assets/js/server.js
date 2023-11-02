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
    getListOfServers().then(() => {
      // Show the server selection screen
      showListOfServers();
    });
  });
  // Establish listener for the connection
  peer.on('connection', (conn) => {
    console.log("CONNECTION RECEIVED");
    setConnecteeConnectionListeners(conn);
  });
};

const showListOfServers = () => {
  const serverListElem = document.getElementById(IDS.SERVER_LIST);
  // Show the server selection screen
  serverListElem.classList.remove('hidden_ensure');
  // Remove the current servers
  serverListElem.innerHTML = '';
  let serverItem;
  // Show servers only if there are enough
  if (serverList.length > 1) {
    // Add the current list
    serverList.forEach((server) => {
      if (server !== UUID) {
        serverItem = document.createElement('button');
        serverItem.innerHTML = `${server}`;
        //serverItem.setAttribute('disabled', `false`);
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

const handleListPeers = () => {
  axios({
    method: 'get',
    url: `https://${SERVER_URI}/peerjs/peers`
  }).then((response) => {
    console.log(response.data);
  });
};

const handleSelectServer = (peerId) => {
  console.log('TRYING TO CONNECT');
  // Connection in case I'm the one creating it
  setConnectorConnectionListeners(peer.connect(peerId));
};

const rejectNewConnection = (conn) => {
  // Close the connection if there's one already but send a message first
  conn.send(
    JSON.stringify({
      ...SERVER_MESSAGE_TEMPLATE,
      status: 400,
      data: {
        message: 'This peer is already on a match.'
      }
    })
  );
  conn.close();
};

const setConnectorConnectionListeners = (conn) => {
  // Ensure it only has 1 connection
  if (connection) {
    rejectNewConnection(conn);
    return;
  }
  connection = conn;
  // Make sure connection is successful
  // Make sure the connection is usable
  connection.on('open', () => {
    console.log("OPEN CONN");
    // Receive messages
    connection.on('data', (data) => handleDataReceived(data));
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
};

const handleDataReceived = (data) => {
  payload = JSON.parse(data);
  console.log(`Received ${payload}`);
  // Handle different use cases
  switch (payload.status) {
    // Player rejected because of another connection
    case 400:
      console.log(payload.data.message);
      break;
    case 200:
      console.log(payload.data.message);
      break;
    default:
      break;
  }
}
