const suits = [
  { symbol: "♠", color: "#1b1b1b" },
  { symbol: "♥", color: "#c1121f" },
  { symbol: "♦", color: "#c1121f" },
  { symbol: "♣", color: "#1b1b1b" },
];
const ranks = [
  { label: "A", value: 11 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "J", value: 10 },
  { label: "Q", value: 10 },
  { label: "K", value: 10 },
];

const statusEl = document.querySelector("#status");
const dealerCardsEl = document.querySelector("#dealer-cards");
const playerCardsEl = document.querySelector("#player-cards");
const dealerTotalEl = document.querySelector("#dealer-total");
const playerTotalEl = document.querySelector("#player-total");
const playerChipsEl = document.querySelector("#player-chips");
const currentBetEl = document.querySelector("#current-bet");
const chipButtons = document.querySelectorAll(".chip");

const dealButton = document.querySelector("#deal");
const hitButton = document.querySelector("#hit");
const standButton = document.querySelector("#stand");
const resetButton = document.querySelector("#reset");

let deck = [];
let dealerHand = [];
let playerHand = [];
let roundActive = false;
let playerChips = 5000;
let currentBet = 0;

function buildDeck() {
  const cards = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      cards.push({
        suit: suit.symbol,
        color: suit.color,
        label: rank.label,
        value: rank.value,
      });
    });
  });
  return cards;
}

function shuffle(cards) {
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
}

function dealCard(hand) {
  if (deck.length === 0) {
    deck = buildDeck();
    shuffle(deck);
  }
  const card = deck.pop();
  hand.push(card);
}

function calculateTotal(hand) {
  let total = hand.reduce((sum, card) => sum + card.value, 0);
  let aces = hand.filter((card) => card.label === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function renderHand(hand, container) {
  container.innerHTML = "";
  hand.forEach((card, index) => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.innerHTML = `
      <span>${card.label}</span>
      <span class="suit" style="color: ${card.color};">${card.suit}</span>
    `;
    cardEl.style.animationDelay = `${index * 0.08}s`;
    cardEl.classList.add("dealt");
    container.appendChild(cardEl);
  });
}

function updateTotals() {
  dealerTotalEl.textContent = calculateTotal(dealerHand);
  playerTotalEl.textContent = calculateTotal(playerHand);
}

function setStatus(message) {
  statusEl.textContent = message;
}

function setButtons({ canDeal, canHit, canStand }) {
  dealButton.disabled = !canDeal;
  hitButton.disabled = !canHit;
  standButton.disabled = !canStand;
}

function updateBankroll() {
  playerChipsEl.textContent = playerChips.toLocaleString();
  currentBetEl.textContent = currentBet.toLocaleString();
  chipButtons.forEach((button) => {
    const amount = Number(button.dataset.chip);
    button.disabled = roundActive || playerChips < amount;
  });
  dealButton.disabled = roundActive || currentBet === 0;
}

function startRound() {
  if (currentBet === 0 || roundActive) return;
  deck = buildDeck();
  shuffle(deck);
  dealerHand = [];
  playerHand = [];
  roundActive = true;

  dealCard(playerHand);
  dealCard(dealerHand);
  dealCard(playerHand);
  dealCard(dealerHand);

  renderHands();
  setStatus("Your move. Hit or stand?");
  setButtons({ canDeal: false, canHit: true, canStand: true });
  updateBankroll();

  checkForBlackjack();
}

function renderHands() {
  renderHand(dealerHand, dealerCardsEl);
  renderHand(playerHand, playerCardsEl);
  updateTotals();
}

function checkForBlackjack() {
  const playerTotal = calculateTotal(playerHand);
  const dealerTotal = calculateTotal(dealerHand);

  if (playerTotal === 21 && dealerTotal === 21) {
    resolvePush("Push! Both have blackjack.");
  } else if (playerTotal === 21) {
    resolveWin("Blackjack! You win!");
  } else if (dealerTotal === 21) {
    resolveLoss("Dealer has blackjack. You lose.");
  }
}

function playerHit() {
  if (!roundActive) return;
  dealCard(playerHand);
  renderHands();
  const playerTotal = calculateTotal(playerHand);
  if (playerTotal > 21) {
    resolveLoss("Bust! You went over 21.");
  }
}

function dealerTurn() {
  let dealerTotal = calculateTotal(dealerHand);
  while (dealerTotal < 17) {
    dealCard(dealerHand);
    dealerTotal = calculateTotal(dealerHand);
  }
}

function playerStand() {
  if (!roundActive) return;
  dealerTurn();
  renderHands();

  const playerTotal = calculateTotal(playerHand);
  const dealerTotal = calculateTotal(dealerHand);

  if (dealerTotal > 21) {
    resolveWin("Dealer busts! You win.");
    return;
  }

  if (dealerTotal === playerTotal) {
    resolvePush("Push! It's a tie.");
    return;
  }

  if (playerTotal > dealerTotal) {
    resolveWin("You win! Nice hand.");
    return;
  }

  resolveLoss("Dealer wins. Try again!");
}

function resolveWin(message) {
  playerChips += currentBet * 2;
  currentBet = 0;
  finishRound(message);
}

function resolvePush(message) {
  playerChips += currentBet;
  currentBet = 0;
  finishRound(message);
}

function resolveLoss(message) {
  currentBet = 0;
  finishRound(message);
}

function finishRound(message) {
  roundActive = false;
  setStatus(message);
  setButtons({ canDeal: true, canHit: false, canStand: false });
  updateBankroll();
}

function resetTable() {
  deck = buildDeck();
  shuffle(deck);
  dealerHand = [];
  playerHand = [];
  roundActive = false;
  playerChips = 5000;
  currentBet = 100;
  playerChips -= currentBet;
  dealerCardsEl.innerHTML = "";
  playerCardsEl.innerHTML = "";
  updateTotals();
  setStatus("Click Deal to start.");
  setButtons({ canDeal: true, canHit: false, canStand: false });
  updateBankroll();
}

dealButton.addEventListener("click", startRound);
hitButton.addEventListener("click", playerHit);
standButton.addEventListener("click", playerStand);
resetButton.addEventListener("click", resetTable);
chipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (roundActive) return;
    const amount = Number(button.dataset.chip);
    if (playerChips < amount) return;
    playerChips -= amount;
    currentBet += amount;
    updateBankroll();
  });
});

resetTable();
