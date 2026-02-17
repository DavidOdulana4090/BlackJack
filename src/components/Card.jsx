import './Card.css';

function Card({ card, hidden, index }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  if (hidden) {
    return <div className="card card-back" style={{ animationDelay: `${index * 0.1}s` }}>?</div>;
  }

  return (
    <div className={`card ${isRed ? 'red' : 'black'}`} style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="card-corner top-left">
        <span>{card.value}</span>
        <span>{card.suit}</span>
      </div>
      <div className="card-center">{card.suit}</div>
      <div className="card-corner bottom-right">
        <span>{card.value}</span>
        <span>{card.suit}</span>
      </div>
    </div>
  );
}

export default Card;
