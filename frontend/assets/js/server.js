/**
 * Prepares the peer message to be shown on screen.
 * @param {string} peerId for the current peer.
 * @returns a formatted string with the peer ID text.
 */
const getPeerText = (peerId) => `Your peer ID is: ${peerId}`;

let serverList = [];

const getListOfServers = () => {
  axios({
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
  const instructions = document.getElementById(IDS.INSTRUCTIONS);
  /*
  // Create the instance of the peer with the UUID
  const peer = new Peer(UUID, SERVER_CONNECTION);
  // Actually establish the connection
  peer.on('open', function (id) {
    // Set the text for the peer info
    peerInfoElem.innerText = getPeerText(id);
    // Show the peer info
    hiddenElems.forEach((elem) => elem.classList.remove('hidden'));
    // Disable instructions, show the server selection list
    getListOfServers();
    instructions.classList.add('hidden_ensure');
  });
  */
  hiddenElems.forEach((elem) => elem.classList.remove('hidden'));
  instructions.classList.add('hidden_ensure');
};

const handleTestClick = () => {
  console.log('HELLO');
  const title = document.getElementById('title');
  title.innerText = getTitle();
  const uuid = crypto.randomUUID();
  const conn = {
    host: 'peerjs-server-geag7w45ea-uc.a.run.app',
    port: 443,
    ping: 1000 * 15, // 15s ping
    secure: true,
    debug: 3
  };
  const peer = new Peer(uuid, conn);
  peer.on('open', function (id) {
    title.innerText = getTitle(id);
    console.log('My peer ID is: ' + id);
  });
};
const handleListPeers = () => {
  axios({
    method: 'get',
    url: 'https://peerjs-server-geag7w45ea-uc.a.run.app/peerjs/peers'
  }).then((response) => {
    console.log(response.data);
  });
};
