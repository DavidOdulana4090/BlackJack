import Card from './Card';
import { calculateHand } from '../utils/gameLogic';
import './PlayerHand.css';

function PlayerHand({ hand, handIndex, isActive, onSelect, bet, isFinished }) {
  const value = calculateHand(hand);
  
  return (
    <div 
      className={`player-hand ${isActive ? 'active' : ''} ${isFinished ? 'finished' : ''}`}
      onClick={() => isActive && onSelect()}
    >
      <div className="hand-header">
        <span className="hand-label">Hand {handIndex + 1}</span>
        <span className="hand-bet">Bet: ${bet}</span>
      </div>
      <div className="cards">
        {hand.map((card, index) => (
          <Card key={`${handIndex}-${index}`} card={card} index={index} />
        ))}
      </div>
      <div className="hand-value">{value}</div>
    </div>
  );
}

export default PlayerHand;
