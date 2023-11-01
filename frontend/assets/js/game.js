// Local copy of the game state
const gameState = {};
let gameBox = undefined;

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
    `handleBoardClick(event, this, ${offsetX}, ${offsetY})`
  );
  board.classList.add('board');
  for (let i = 0; i < 3; i++) {
    const divRow = document.createElement('div');
    board.appendChild(divRow);
    divRow.classList.add('board_row');
    for (let j = 0; j < 3; j++) {
      const buttonCell = document.createElement('button');
      buttonCell.setAttribute('cellX', i);
      buttonCell.setAttribute('cellY', j);
      buttonCell.setAttribute('boardX', offsetX);
      buttonCell.setAttribute('boardY', offsetY);
      buttonCell.setAttribute('state', STATES.EMPTY);
      buttonCell.setAttribute('onclick', 'handleCellClick(event, this)');
      buttonCell.classList.add('board_cell');
      divRow.appendChild(buttonCell);
    }
  }
  return board;
};

const buildBoard = () => {
  const gameBox = document.getElementById(IDS.GAME_BOX);
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
const handleCellClick = (e, elem) => {
  // Ensure it fires only on choose cell
  if (gameState.state !== GAME_STATES.CHOOSE_CELL) return;
  // Ensure it can only be clicked if on an EMPTY state.
  if (elem.getAttribute('state') !== STATES.EMPTY) return;
  // Ensure the cell clicked is one of the ones from the selected board.
  const boardX = parseInt(elem.getAttribute('boardx'));
  const boardY = parseInt(elem.getAttribute('boardy'));
  const cellX = parseInt(elem.getAttribute('cellx'));
  const cellY = parseInt(elem.getAttribute('celly'));
  if (
    boardX !== gameState.selectedBoardX ||
    boardY !== gameState.selectedBoardY
  )
    return;
  // Make the necessary state changes
  elem.setAttribute('state', gameState.turn);
  elem.setAttribute('disabled', 'true');
  // Update the internal state
  gameState.board[boardX][boardY][cellX][cellY] = gameState.turn;
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
        if (overallWinner) {
          console.log(`${overallWinner} won the game!`);
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
  e.stopPropagation();
};

const handleBoardClick = (e, elem, x, y) => {
  // Ensure this fires only on choose board
  // It can also happen if the player has the opportunity to choose the board
  if (!gameState.canChooseBoard) {
    return;
  }
  console.log("BOARD CLICK");
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
};

const getOppositeState = (currState) => {
  return currState === STATES.X ? STATES.O : STATES.X;
};

const getBoardId = (x, y) => `board_${x}_${y}`;

const getNextPlayingBoard = (x, y) => {
  // Ensure the types for the variables, which must be integers
  if (typeof x === 'string') x = parseInt(x);
  if (typeof y === 'string') y = parseInt(y);

  // If the next one is empty, player is forced to go there.
  // Update visual state of old board.
  // Always remove the highlight from the previous one
  gameState.selectedBoardElem.setAttribute('selected', 'false');
  console.log(gameState.selectedBoardElem);

  // If the next one is not empty, next player can choose any one
  console.log(gameState.overallBoard[x][y]);
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

/* 
------------------------------------------------------------------------------------------
Game Lifecycle
------------------------------------------------------------------------------------------
*/
const startGame = () => {
  gameState.turn = STATES.X;
  gameState.state = GAME_STATES.CHOOSE_BOARD;
  gameState.board = buildInternalBoard();
  gameState.overallBoard = buildInternalOverallBoard(STATES.EMPTY);
  gameState.completedCells = buildInternalOverallBoard(0);
  gameState.completedBoards = 0;
  gameState.canChooseBoard = true;
  // Get the game box
  gameBox = document.getElementById(IDS.GAME_BOX);
  // Switch turn to the current player, this will leave the player
  switchPlayerTurn(STATES.X);
};

// Ensure to call functions as early as possible for experience
buildBoard();
startGame();
