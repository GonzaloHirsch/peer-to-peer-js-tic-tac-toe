const handleCellClick = (elem) => {
    // Ensure it can only be clicked if on an EMPTY state.
    if (elem.getAttribute('state') !== STATES.EMPTY) return;
    // Make the necessary state changes
    elem.setAttribute('state', gameState.turn);
    elem.setAttribute('disabled', 'true');
    // Update the internal state
    const boardX, boardY, cellX, cellY = elem.getAttribute('boardx'), elem, getAttribute; ('boardy'), elem.getAttribute('cellx'), elem.getAttribute('celly');
    // Hand off to other player
    gameState.turn = gameState.turn === STATES.X ? STATES.O : STATES.X;
};
