// Local copy of the game state
let gameState = {};
let cover = document.getElementById(IDS.COVER);
let gameBox = document.getElementById(IDS.GAME_BOX);
let turnCover = document.getElementById(IDS.TURN_COVER);
let endCover = document.getElementById(IDS.END_COVER);
let rematchButton = document.getElementById(IDS.REMATCH_BTN);
let rematchOptionButtons = document.getElementById(IDS.END_REMATCH);

/* 
------------------------------------------------------------------------------------------
Building the Game
------------------------------------------------------------------------------------------
*/
const buildTicTacToe = (offsetX, offsetY) => {
  const board = document.createElement('div');
  board.setAttribute('id', getBoardId(offsetX, offsetY));
  board.setAttribute('boardX', offsetX);
  board.setAttribute('boardY', offsetY);
  board.setAttribute('state', STATES.EMPTY);
  board.setAttribute(
    'onclick',
    `handleBoardClick(event, ${offsetX}, ${offsetY})`
  );
  board.classList.add('board');
  for (let i = 0; i < 3; i++) {
    const divRow = document.createElement('div');
    board.appendChild(divRow);
    divRow.classList.add('board_row');
    for (let j = 0; j < 3; j++) {
      const buttonCell = document.createElement('button');
      buttonCell.setAttribute('id', getCellId(offsetX, offsetY, i, j));
      buttonCell.setAttribute('cellX', i);
      buttonCell.setAttribute('cellY', j);
      buttonCell.setAttribute('boardX', offsetX);
      buttonCell.setAttribute('boardY', offsetY);
      buttonCell.setAttribute('state', STATES.EMPTY);
      buttonCell.setAttribute(
        'onclick',
        `handleCellClickWrapper(event, ${offsetX}, ${offsetY}, ${i}, ${j})`
      );
      buttonCell.classList.add('board_cell');
      divRow.appendChild(buttonCell);
    }
  }
  return board;
};

const buildBoard = () => {
  const gameBox = document.getElementById(IDS.GAME_BOX);
  gameBox.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const divRow = document.createElement('div');
    gameBox.appendChild(divRow);
    divRow.classList.add('game_row');
    for (let j = 0; j < 3; j++) {
      const miniBoard = buildTicTacToe(i, j);
      divRow.appendChild(miniBoard);
    }
  }
};

const buildInternalBoard = () => {
  const boardRow = Array.from(new Array(3), (_, __) => STATES.EMPTY);
  const board = Array.from(new Array(3), (_, __) => [...boardRow]);
  const gameRow = Array.from(new Array(3), (_, __) => [...board]);
  const game = Array.from(new Array(3), (_, __) => [...gameRow]);
  return JSON.parse(JSON.stringify(game));
};

const buildInternalOverallBoard = (initialState) => {
  const boardRow = Array.from(new Array(3), (_, __) => initialState);
  const board = Array.from(new Array(3), (_, __) => [...boardRow]);
  return JSON.parse(JSON.stringify(board));
};

/* 
------------------------------------------------------------------------------------------
Events
------------------------------------------------------------------------------------------
*/
const handleCellClickWrapper = (
  e,
  boardX,
  boardY,
  cellX,
  cellY,
  removeMovement = false
) => {
  // Run the move and check it's valid
  const validMove = handleCellClick(
    e,
    document.getElementById(getCellId(boardX, boardY, cellX, cellY)),
    boardX,
    boardY,
    cellX,
    cellY,
    removeMovement
  );
  // If the move is entirely valid and is playing in P2P, send the move
  if (validMove && gameState.playMode === PLAY_MODE.P2P) {
    // Movements to send, include at least cell selection
    let movements = [
      {
        type: GAME_STATES.CHOOSE_CELL,
        coords: [boardX, boardY, cellX, cellY]
      }
    ];
    // If the player was able to choose the board, must do that too
    if (gameState.movementChoseBoard) {
      movements.unshift({
        type: GAME_STATES.CHOOSE_BOARD,
        coords: [boardX, boardY]
      });
    }
    // Send the movements to the other player
    sendMovement({
      movements: movements
    });
  }
};

const handleCellClick = (
  e,
  elem,
  boardX,
  boardY,
  cellX,
  cellY,
  removeMovement = false
) => {
  // Ensure it's the turn of the player
  if (!isPlayerTurn() && !removeMovement) return false;
  // Ensure it fires only on choose cell
  if (gameState.state !== GAME_STATES.CHOOSE_CELL) return false;
  // Ensure it can only be clicked if on an EMPTY state.
  if (elem.getAttribute('state') !== STATES.EMPTY) return false;
  // Ensure the cell clicked is one of the ones from the selected board.
  if (
    boardX !== gameState.selectedBoardX ||
    boardY !== gameState.selectedBoardY
  )
    return false;
  // Visually mark the element as the previous selection
  if (gameState.previousSelection) {
    // Remove the marking for previous selection
    gameState.previousSelection.classList.remove(
      CSS_CLASSES.PREVIOUS_SELECTION
    );
  }
  // Store the new previous selection
  gameState.previousSelection = elem;
  // Make the necessary state changes
  elem.setAttribute('state', gameState.turn);
  elem.setAttribute('disabled', 'true');
  elem.classList.add(CSS_CLASSES.PREVIOUS_SELECTION);
  // Update the internal state
  gameState.board[boardX][boardY][cellX][cellY] = gameState.turn;
  gameState.movementChoseBoard = gameState.canChooseBoard;
  // Update the stats
  gameState.completedCells[boardX][boardY]++;
  // Verify win condition in mini board
  // Ensure there's enough choices to determine a win
  if (gameState.completedCells[boardX][boardY] >= 3) {
    let winner = checkWinCondition(gameState.board[boardX][boardY]);
    // If there is a change in win conditions, evaluate the big board
    if (winner) {
      gameState.completedBoards++;
      // Update the representations to represent a win
      updateBoardWithWinner(boardX, boardY, winner);
      // Check win condition against the big board
      if (gameState.completedBoards >= 3) {
        let overallWinner = checkWinCondition(gameState.overallBoard);
        // If there's a winner, end the game
        if (overallWinner) {
          endGame(overallWinner);
          return true;
        } else if (gameState.completedBoards === 9) {
          endGame(STATES.TIE);
          return true;
        }
      }
    }
    // No winner and the board is fully complete
    else if (gameState.completedCells[boardX][boardY] === 9) {
      updateBoardWithWinner(boardX, boardY, STATES.TIE);
    }
  }
  // Check handing off board selection
  getNextPlayingBoard(cellX, cellY);
  // Hand off to other player
  switchPlayerTurn(getOppositeState(gameState.turn));
  // Preven board click at this point
  if (e) e.stopPropagation();
  return true;
};

const handleBoardClick = (e, x, y, removeMovement = false) => {
  // Ensure it's the turn of the player
  if (!isPlayerTurn() && !removeMovement) return false;
  // Ensure this fires only on choose board
  // It can also happen if the player has the opportunity to choose the board
  if (!gameState.canChooseBoard) {
    return;
  }
  // Update the selected state of the previous board
  if (gameState.selectedBoardElem) {
    gameState.selectedBoardElem.setAttribute('selected', 'false');
  }
  // Get the new elem and update the state
  const boardElem = document.getElementById(getBoardId(x, y));
  // Update internal state
  gameState.selectedBoardElem = boardElem;
  gameState.selectedBoardX = x;
  gameState.selectedBoardY = y;
  gameState.state = GAME_STATES.CHOOSE_CELL;
  gameState.canChooseBoard = true;
  // Update visual state
  boardElem.setAttribute('selected', 'true');
  gameBox.setAttribute('state', gameState.state);
};

/* 
------------------------------------------------------------------------------------------
Rematch
------------------------------------------------------------------------------------------
*/
const handleRematch = (e) => {
  // Ensure there is a winner.
  if (!gameState.winner) {
    console.error('There is no winner, hence there cannot be a rematch');
    return;
  }
  // If the rematch is local, just restart the game
  if (gameState.playMode === PLAY_MODE.LOCAL) {
    startGameLocal();
    return;
  }
  // If the rematch is remote, send a rematch request
  if (gameState.playMode === PLAY_MODE.P2P) {
    sendRematch();
    // Show that rematch is sent
    setupEndgameText(
      'Sent rematch request to opponent, please wait for a response.'
    );
    // Hide the rematch button
    rematchButton.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
    return;
  }
};

const handleRematchRequest = (message) => {
  // Ensure there is a winner.
  if (!gameState.winner) {
    console.error('There is no winner, hence there cannot be a rematch');
    return;
  }
  // Show the message
  setupEndgameText(message);
  // Hide the rematch button.
  rematchButton.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  // Show the other buttons
  rematchOptionButtons.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
};

const handleRematchResponse = (accept) => {
  // Ensure there is a winner.
  if (!gameState.winner) {
    console.error('There is no winner, hence there cannot be a rematch');
    return;
  }
  // Hide the buttons
  rematchOptionButtons.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  if (accept) {
    // Restart game
    startGameP2P(false);
  } else {
    // Show the message
    setupEndgameText(`Rematch declined. ${MESSAGES.INSTRUCTIONS}`);
  }
  // Send response to server
  respondToRematch(accept);
};

const handleRematchRemoteDecline = () => {
  // Hide the buttons
  rematchOptionButtons.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  rematchButton.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  // Show the message
  setupEndgameText(
    `Rematch was declined by opponent. ${MESSAGES.INSTRUCTIONS}`
  );
};

/* 
------------------------------------------------------------------------------------------
Utilities
------------------------------------------------------------------------------------------
*/
const switchPlayerTurn = (nextState) => {
  // Switch the turn
  gameState.turn = nextState;
  // Set the correct classes
  gameBox.setAttribute('turn', nextState);
  gameBox.setAttribute('state', gameState.state);
  gameBox.setAttribute('choose', gameState.canChooseBoard);
  // Switch the turn visually as well
  switchPlayerTurnVisually();
};

const switchPlayerTurnVisually = () => {
  // If it's the player turn, enable it for them
  if (gameState.playMode === PLAY_MODE.P2P) {
    if (isPlayerTurn()) {
      turnCover.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
    } else {
      turnCover.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
    }
  }
};

const getOppositeState = (currState) => {
  return currState === STATES.X ? STATES.O : STATES.X;
};

const isPlayerTurn = () =>
  gameState.playMode === PLAY_MODE.LOCAL || gameState.turn === gameState.player;

const getBoardId = (x, y) => `board_${x}_${y}`;
const getCellId = (bx, by, cx, cy) => `cell_${bx}_${by}_${cx}_${cy}`;

const getNextPlayingBoard = (x, y) => {
  // Ensure the types for the variables, which must be integers
  if (typeof x === 'string') x = parseInt(x);
  if (typeof y === 'string') y = parseInt(y);

  // If the next one is empty, player is forced to go there.
  // Update visual state of old board.
  // Always remove the highlight from the previous one
  gameState.selectedBoardElem.setAttribute('selected', 'false');

  // If the next one is not empty, next player can choose any one
  if (gameState.overallBoard[x][y] !== STATES.EMPTY) {
    gameState.state = GAME_STATES.CHOOSE_BOARD;
    gameState.canChooseBoard = true;
    gameState.selectedBoardElem = undefined;
    gameState.selectedBoardX = undefined;
    gameState.selectedBoardY = undefined;
    return;
  }

  // Update internal state
  gameState.state = GAME_STATES.CHOOSE_CELL;
  gameState.canChooseBoard = false;
  gameState.selectedBoardElem = document.getElementById(getBoardId(x, y));
  gameState.selectedBoardX = x;
  gameState.selectedBoardY = y;
  // Update visual of new one
  gameState.selectedBoardElem.setAttribute('selected', 'true');
};

const checkWinCondition = (board) => {
  let winner = undefined;
  // Use an explicit for loop to be able to break out if the win condition is met
  for (let i = 0, config = undefined; i < WIN_CONFIGS.length && !winner; i++) {
    config = WIN_CONFIGS[i];
    let possibleConfig = config
      .map((coords) => board[coords[0]][coords[1]])
      .join('');
    // Map the win configuration patterns
    Object.entries(WIN_OPTIONS).forEach((entry) => {
      if (possibleConfig === entry[1]) winner = entry[0];
    });
  }
  return winner;
};

const updateBoardWithWinner = (x, y, winner) => {
  // Visual updates
  const boardElem = document.getElementById(getBoardId(x, y));
  boardElem.setAttribute('state', winner);
  // Internal updates
  gameState.overallBoard[x][y] = winner;
};

const enableGameVisually = () => {
  cover.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  endCover.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  rematchButton.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
  rematchOptionButtons.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  if (gameState.playMode !== PLAY_MODE.P2P) {
    turnCover.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  }
};

const setupEndgameText = (content) => {
  endCover.firstElementChild.innerHTML = content;
};

const setCoverMessage = (content) => {
  cover.firstElementChild.innerHTML = content;
};

const setCoverStatus = (enabled) => setElemStatus(enabled, cover);

const setTurnCoverStatus = (enabled) => setElemStatus(enabled, turnCover);

const setElemStatus = (enabled, elem) => {
  if (enabled) {
    elem.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
  } else {
    elem.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  }
};

/* 
------------------------------------------------------------------------------------------
Game Lifecycle
------------------------------------------------------------------------------------------
*/
const startGame = (playMode, firstPlayer) => {
  // Rebuilds the board
  buildBoard();
  // Resets the state
  gameState = {};
  // Sets initial values
  gameState.playMode = playMode;
  gameState.player = firstPlayer ? STATES.X : STATES.O;
  gameState.turn = STATES.X;
  gameState.state = GAME_STATES.CHOOSE_BOARD;
  gameState.board = buildInternalBoard();
  gameState.overallBoard = buildInternalOverallBoard(STATES.EMPTY);
  gameState.completedCells = buildInternalOverallBoard(0);
  gameState.completedBoards = 0;
  gameState.canChooseBoard = true;
  gameState.movementChoseBoard = true;
  gameState.winner = undefined;
  gameState.stopped = false;
  // Switch turn to the current player, this will leave the player
  switchPlayerTurn(STATES.X);
  // Visually enable the game
  enableGameVisually();
};

const startGameLocal = () => {
  // Ensure to close the server connection to prevent resource consumption
  closeServerConnection();
  // Start the game locally
  startGame(PLAY_MODE.LOCAL, true);
};

const startGameP2P = (firstPlayer = false) => {
  // Start the game in P2P mode
  startGame(PLAY_MODE.P2P, firstPlayer);
};

const endGame = (winner) => {
  // Tracking event
  gtag('event', TRACKING_EVENTS.MATCH_RESULT, {
    winner: winner,
    playMode: gameState.playMode,
    totalMoves: gameState.completedCells.reduce((accum, currentVal) => {
      accum +
        currentVal.reduce(
          (subaccum, subcurrentVal) => subaccum + subcurrentVal,
          0
        );
    }, 0)
  });
  setupEndgameText(
    winner !== STATES.TIE
      ? `The winner is: <span id="winner">${winner}</span>`
      : 'There is no winner, it is a tie!'
  );
  gameState.winner = winner;
  // Propose a rematch
  rematchButton.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
  // Show the other classes
  turnCover.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  endCover.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
};

/* 
------------------------------------------------------------------------------------------
Game Lifecycle (Exposed)
------------------------------------------------------------------------------------------
*/
const handleRemoteMovements = (movements) => {
  movements.forEach((movement) => {
    switch (movement.type) {
      case GAME_STATES.CHOOSE_BOARD:
        handleBoardClick(undefined, ...movement.coords, true);
        break;
      case GAME_STATES.CHOOSE_CELL:
        handleCellClickWrapper(undefined, ...movement.coords, true);
        break;
    }
  });
};

const markGameAsStopped = () => {
  gameState.stopped = true;
};

const resetGame = (message) => {
  // Set the text
  setupEndgameText(message);
  // Reset state
  gameState = {};
  // Visual cues
  rematchButton.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  rematchOptionButtons.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  turnCover.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  cover.classList.add(CSS_CLASSES.ENSURE_HIDDEN);
  endCover.classList.remove(CSS_CLASSES.ENSURE_HIDDEN);
};

// Ensure to call functions as early as possible for experience
buildBoard();
