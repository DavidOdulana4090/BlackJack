import './Controls.css';

function Controls({ 
  gameState, 
  currentHand, 
  playerHands, 
  currentHandIndex, 
  wallet, 
  onHit, 
  onStand, 
  onDoubleDown, 
  onSplit,
  onNewGame 
}) {
  const canDouble = currentHand && 
    currentHand.cards.length === 2 && 
    !currentHand.doubled && 
    wallet >= currentHand.bet;
    
  const canSplitHand = currentHand && 
    currentHand.cards.length === 2 &&
    currentHand.cards[0].value === currentHand.cards[1].value &&
    wallet >= currentHand.bet;

  if (gameState === 'playing') {
    return (
      <div className="controls">
        <div className="hand-info">
          <span>Hand {currentHandIndex + 1} of {playerHands.length}</span>
          <span className="current-bet">Bet: ${currentHand?.bet || 0}</span>
        </div>
        <div className="button-row">
          <button className="btn btn-hit" onClick={onHit}>Hit</button>
          <button className="btn btn-stand" onClick={onStand}>Stand</button>
          {canDouble && (
            <button className="btn btn-double" onClick={onDoubleDown}>Double</button>
          )}
          {canSplitHand && (
            <button className="btn btn-split" onClick={onSplit}>Split</button>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="controls">
        <button className="btn btn-primary" onClick={onNewGame}>
          New Game
        </button>
      </div>
    );
  }

  return null;
}

export default Controls;
