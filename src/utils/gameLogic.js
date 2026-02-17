// Card suits and values
export const SUITS = ['♠', '♥', '♦', '♣'];
export const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function calculateHand(cards) {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.value === 'A') {
      aces += 1;
      value += 11;
    } else if (card.value === 'K' || card.value === 'Q' || card.value === 'J') {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
}

export function canSplit(hand) {
  if (hand.length !== 2) return false;
  const val1 = hand[0].value;
  const val2 = hand[1].value;
  return val1 === val2 || (val1 === 'A' && val2 === 'A');
}

export function createHand(cards, betAmount, finished = false, doubled = false, splitFrom = null) {
  return { cards, bet: betAmount, finished, doubled, splitFrom };
}

export function cloneHands(hands) {
  return hands.map(h => createHand([...h.cards], h.bet, h.finished, h.doubled, h.splitFrom));
}

export function findNextActiveHand(currentIndex, hands) {
  for (let i = currentIndex + 1; i < hands.length; i++) {
    if (!hands[i].finished) return i;
  }
  return -1;
}
