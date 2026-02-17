import { useState, useCallback } from 'react';
import Card from './components/Card';
import PlayerHand from './components/PlayerHand';
import Controls from './components/Controls';
import { 
  createDeck, 
  calculateHand, 
  canSplit, 
  createHand, 
  cloneHands, 
  findNextActiveHand 
} from './utils/gameLogic';
import './css/App.css';

function App() {
  const [deck, setDeck] = useState([]);
  const [playerHands, setPlayerHands] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameState, setGameState] = useState('betting');
  const [message, setMessage] = useState('');
  const [wallet, setWallet] = useState(1000);
  const [defaultBet, setDefaultBet] = useState(100);
  const [playerBets, setPlayerBets] = useState({});
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [numPlayers, setNumPlayers] = useState(1);

  const endGame = useCallback((hands, dHand) => {
    let newDeck = [...deck];
    let newDealerHand = [...dHand];
    
    while (calculateHand(newDealerHand) < 17) {
      newDealerHand.push(newDeck.pop());
    }

    setDeck(newDeck);
    setDealerHand(newDealerHand);

    const dValue = calculateHand(newDealerHand);
    let totalWinnings = 0;
    let results = [];

    hands.forEach((hand, index) => {
      const pValue = calculateHand(hand.cards);
      
      if (hand.bet === 0) return;
      
      if (dValue > 21) {
        results.push(`Hand ${index + 1}: Dealer busts! You win!`);
        totalWinnings += hand.bet * 2;
      } else if (pValue > dValue) {
        results.push(`Hand ${index + 1}: You win!`);
        totalWinnings += hand.bet * 2;
      } else if (pValue < dValue) {
        results.push(`Hand ${index + 1}: Dealer wins!`);
      } else {
        results.push(`Hand ${index + 1}: Push!`);
        totalWinnings += hand.bet;
      }
    });

    setWallet(prev => prev + totalWinnings);
    setMessage(results.join(' | '));
    setGameState('finished');
  }, [deck]);

  const checkBlackjack = useCallback((handIndex, hands, dHand) => {
    const pValue = calculateHand(hands[handIndex].cards);
    const dValue = calculateHand(dHand);
    
    if (pValue === 21) {
      const newHands = cloneHands(hands);
      newHands[handIndex] = createHand(
        newHands[handIndex].cards,
        newHands[handIndex].bet,
        true,
        newHands[handIndex].doubled,
        newHands[handIndex].splitFrom
      );
      
      if (dValue === 21) {
        setMessage(`Hand ${handIndex + 1}: Push! Both have Blackjack!`);
        setWallet(prev => prev + hands[handIndex].bet);
      } else {
        setMessage(`Hand ${handIndex + 1}: Blackjack! You win!`);
        setWallet(prev => prev + hands[handIndex].bet * 2.5);
        newHands[handIndex] = createHand(newHands[handIndex].cards, 0, true, false, newHands[handIndex].splitFrom);
      }
      
      setPlayerHands(newHands);
      
      const nextHand = findNextActiveHand(handIndex, newHands);
      if (nextHand === -1) {
        endGame(newHands, dHand);
      } else {
        setCurrentHandIndex(nextHand);
      }
    }
  }, [endGame]);

  const startGame = useCallback(() => {
    const newDeck = createDeck();
    
    const hands = [];
    let totalBet = 0;
    for (let i = 0; i < numPlayers; i++) {
      const betAmount = playerBets[i] || defaultBet;
      const pHand = [newDeck.pop(), newDeck.pop()];
      hands.push(createHand(pHand, betAmount));
      totalBet += betAmount;
    }
    
    const dHand = [newDeck.pop(), newDeck.pop()];
    
    setDeck(newDeck);
    setPlayerHands(hands);
    setDealerHand(dHand);
    setGameState('playing');
    setCurrentHandIndex(0);
    setMessage('');

    setWallet(prev => prev - totalBet);

    checkBlackjack(0, hands, dHand);
  }, [numPlayers, playerBets, defaultBet, checkBlackjack]);

  const handleBetChange = (playerIndex, value) => {
    setPlayerBets(prev => ({
      ...prev,
      [playerIndex]: Math.max(1, Math.min(wallet, parseInt(value) || 1))
    }));
  };

  const hit = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const newDeck = [...deck];
    const card = newDeck.pop();
    const newHands = cloneHands(playerHands);
    
    newHands[currentHandIndex] = createHand(
      [...newHands[currentHandIndex].cards, card],
      newHands[currentHandIndex].bet,
      newHands[currentHandIndex].finished,
      newHands[currentHandIndex].doubled,
      newHands[currentHandIndex].splitFrom
    );
    
    setDeck(newDeck);
    setPlayerHands(newHands);

    if (calculateHand(newHands[currentHandIndex].cards) > 21) {
      newHands[currentHandIndex] = createHand(
        newHands[currentHandIndex].cards,
        0,
        true,
        newHands[currentHandIndex].doubled,
        newHands[currentHandIndex].splitFrom
      );
      setPlayerHands(newHands);
      setMessage('Bust!');
      
      const nextHand = findNextActiveHand(currentHandIndex, newHands);
      if (nextHand === -1) {
        endGame(newHands, dealerHand);
      } else {
        setCurrentHandIndex(nextHand);
      }
    }
  }, [gameState, deck, playerHands, currentHandIndex, dealerHand, endGame]);

  const doubleDown = useCallback(() => {
    if (gameState !== 'playing') return;
    if (playerHands[currentHandIndex].cards.length !== 2) return;
    if (wallet < playerHands[currentHandIndex].bet) return;
    
    const newDeck = [...deck];
    const card = newDeck.pop();
    const newHands = cloneHands(playerHands);
    const currentBet = newHands[currentHandIndex].bet;
    
    newHands[currentHandIndex] = createHand(
      [...newHands[currentHandIndex].cards, card],
      currentBet * 2,
      false,
      true,
      newHands[currentHandIndex].splitFrom
    );
    
    setDeck(newDeck);
    setPlayerHands(newHands);
    setWallet(prev => prev - currentBet);

    if (calculateHand(newHands[currentHandIndex].cards) > 21) {
      newHands[currentHandIndex] = createHand(
        newHands[currentHandIndex].cards,
        0,
        true,
        true,
        newHands[currentHandIndex].splitFrom
      );
      setPlayerHands(newHands);
      setMessage('Bust!');
    }
    
    const nextHand = findNextActiveHand(currentHandIndex, newHands);
    if (nextHand === -1) {
      endGame(newHands, dealerHand);
    } else {
      setCurrentHandIndex(nextHand);
    }
  }, [gameState, playerHands, currentHandIndex, wallet, deck, dealerHand, endGame]);

  const split = useCallback(() => {
    if (gameState !== 'playing') return;
    if (!canSplit(playerHands[currentHandIndex].cards)) return;
    if (wallet < playerHands[currentHandIndex].bet) return;
    
    const newDeck = [...deck];
    const newHands = cloneHands(playerHands);
    const currentHand = newHands[currentHandIndex];
    const currentBet = currentHand.bet;
    
    const card1 = currentHand.cards[0];
    const card2 = currentHand.cards[1];
    
    const hand1Cards = [card1, newDeck.pop()];
    const hand2Cards = [card2, newDeck.pop()];
    
    newHands[currentHandIndex] = createHand(hand1Cards, currentBet, false, false, currentHandIndex);
    newHands.splice(currentHandIndex + 1, 0, createHand(hand2Cards, currentBet, false, false, currentHandIndex));
    
    setDeck(newDeck);
    setPlayerHands(newHands);
    
    setWallet(prev => prev - currentBet);
    
    if (card1.value === 'A') {
      checkBlackjack(currentHandIndex, newHands, dealerHand);
      checkBlackjack(currentHandIndex + 1, newHands, dealerHand);
    }
  }, [gameState, playerHands, currentHandIndex, wallet, deck, dealerHand, checkBlackjack]);

  const stand = useCallback(() => {
    if (gameState !== 'playing') return;

    const newHands = cloneHands(playerHands);
    newHands[currentHandIndex] = createHand(
      newHands[currentHandIndex].cards,
      newHands[currentHandIndex].bet,
      true,
      newHands[currentHandIndex].doubled,
      newHands[currentHandIndex].splitFrom
    );
    setPlayerHands(newHands);
    
    const nextHand = findNextActiveHand(currentHandIndex, newHands);
    if (nextHand === -1) {
      endGame(newHands, dealerHand);
    } else {
      setCurrentHandIndex(nextHand);
    }
  }, [gameState, playerHands, currentHandIndex, dealerHand, endGame]);

  const newGame = useCallback(() => {
    setPlayerHands([]);
    setDealerHand([]);
    setGameState('betting');
    setMessage('');
    setCurrentHandIndex(0);
  }, []);

  const currentHand = playerHands[currentHandIndex];
  const dealerValue = gameState === 'playing' 
    ? calculateHand([dealerHand[0]])
    : calculateHand(dealerHand);

  return (
    <div className="app">
      <header>
        <h1>BLACKJACK</h1>
        <div className="wallet">${wallet}</div>
      </header>

      <main>
        <section className="hand-section dealer-section">
          <h2>Dealer's Hand <span className="hand-value">({dealerValue})</span></h2>
          <div className="cards">
            {dealerHand.map((card, index) => (
              <Card 
                key={index} 
                card={card} 
                hidden={index === 1 && gameState === 'playing'}
                index={index}
              />
            ))}
          </div>
        </section>

        {message && (
          <div className="message">
            <h3>{message}</h3>
          </div>
        )}

        <section className="hands-section">
          {gameState === 'betting' && (
            <div className="setup-panel">
              <div className="setup-row">
                <label>Players:</label>
                <div className="player-buttons">
                  {[1, 2, 3, 4].map(n => (
                    <button 
                      key={n}
                      className={`player-btn ${numPlayers === n ? 'active' : ''}`}
                      onClick={() => setNumPlayers(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bet-setup">
                <div className="default-bet-row">
                  <label>Default Bet: $</label>
                  <input 
                    type="number" 
                    value={defaultBet} 
                    onChange={(e) => setDefaultBet(Math.max(1, Math.min(wallet, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={wallet}
                  />
                </div>
                
                {Array.from({ length: numPlayers }, (_, i) => (
                  <div key={i} className="player-bet-row">
                    <span className="player-label">Player {i + 1}</span>
                    <input 
                      type="number" 
                      value={playerBets[i] || ''} 
                      placeholder={`$${defaultBet}`}
                      onChange={(e) => handleBetChange(i, e.target.value)}
                      min="1"
                      max={wallet}
                    />
                  </div>
                ))}
              </div>
              
              <button className="btn btn-primary" onClick={startGame}>
                Deal Cards
              </button>
            </div>
          )}

          {gameState !== 'betting' && playerHands.map((hand, index) => (
            <PlayerHand
              key={index}
              hand={hand.cards}
              handIndex={index}
              isActive={currentHandIndex === index && gameState === 'playing'}
              bet={hand.bet}
              isFinished={hand.finished}
              onSelect={() => setCurrentHandIndex(index)}
            />
          ))}
        </section>

        <Controls 
          gameState={gameState}
          currentHand={currentHand}
          playerHands={playerHands}
          currentHandIndex={currentHandIndex}
          wallet={wallet}
          onHit={hit}
          onStand={stand}
          onDoubleDown={doubleDown}
          onSplit={split}
          onNewGame={newGame}
        />
      </main>

      <footer>
        <p>Blackjack pays 3:2 • Dealer stands on 17 • For you addicts ( me )</p>
      </footer>
    </div>
  );
}

export default App;
