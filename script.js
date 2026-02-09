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
const dealerHandEl = document.querySelector(".hand");
const playerHandEl = document.querySelectorAll(".hand")[1];
const dealerCardsEl = document.querySelector("#dealer-cards");
const playerCardsEl = document.querySelector("#player-cards");
const dealerTotalEl = document.querySelector("#dealer-total");
const playerTotalEl = document.querySelector("#player-total");
const playerChipsEl = document.querySelector("#player-chips");
const currentBetEl = document.querySelector("#current-bet");
const chipButtons = document.querySelectorAll(".chip");
const slotsBetInput = document.querySelector("#slots-bet");
const slotsSpinButton = document.querySelector("#slots-spin");
const slotsReelsEl = document.querySelector("#slots-reels");
const slotsStatusEl = document.querySelector("#slots-status");
const crapsBetInput = document.querySelector("#craps-bet");
const crapsRollButton = document.querySelector("#craps-roll");
const crapsStatusEl = document.querySelector("#craps-status");
const rouletteBetInput = document.querySelector("#roulette-bet");
const rouletteChoiceSelect = document.querySelector("#roulette-choice");
const rouletteNumberInput = document.querySelector("#roulette-number");
const rouletteSpinButton = document.querySelector("#roulette-spin");
const rouletteStatusEl = document.querySelector("#roulette-status");
const adminPasswordInput = document.querySelector("#admin-password");
const adminChipsInput = document.querySelector("#admin-chips");
const adminApplyButton = document.querySelector("#admin-apply");
const adminStatusEl = document.querySelector("#admin-status");

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
let crapsPoint = null;
const slotSymbols = ["★", "☢", "7", "♞", "♣", "♦"];

const adminPassword = "976532";
const rouletteRedNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18,
  19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

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

function animateHand(handEl) {
  if (!handEl) return;
  handEl.classList.remove("animate");
  void handEl.offsetWidth;
  handEl.classList.add("animate");
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

function clampBet(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) return 0;
  return Math.floor(parsed);
}

function canAffordBet(amount) {
  return amount > 0 && playerChips >= amount;
}

function updateCrapsStatus(message) {
  crapsStatusEl.textContent = message;
}

function updateSlotsStatus(message) {
  slotsStatusEl.textContent = message;
}

function updateRouletteStatus(message) {
  rouletteStatusEl.textContent = message;
}

function updateAdminStatus(message) {
  adminStatusEl.textContent = message;
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

  animateHand(dealerHandEl);
  animateHand(playerHandEl);
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
  animateHand(playerHandEl);
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
    animateHand(dealerHandEl);
    dealerTotal = calculateTotal(dealerHand);
  }
}

function playerStand() {
  if (!roundActive) return;
  animateHand(dealerHandEl);
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
  crapsPoint = null;
  slotsReelsEl.textContent = "- - -";
  updateSlotsStatus("Place a bet and spin.");
  updateCrapsStatus("Place a bet and roll.");
  updateRouletteStatus("Place a bet and spin.");
  updateAdminStatus("Awaiting credentials.");
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

slotsSpinButton.addEventListener("click", () => {
  const bet = clampBet(slotsBetInput.value);
  if (!canAffordBet(bet)) {
    updateSlotsStatus("Not enough chips for that bet.");
    return;
  }

  playerChips -= bet;
  updateBankroll();

  const reels = Array.from({ length: 3 }, () => slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
  slotsReelsEl.textContent = reels.join(" ");

  let payout = 0;
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    payout = bet * 8;
    updateSlotsStatus("Jackpot! Triple match.");
  } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
    payout = bet * 2;
    updateSlotsStatus("Two of a kind! You win.");
  } else {
    updateSlotsStatus("No match. Try again.");
  }

  if (payout > 0) {
    playerChips += payout;
  }

  updateBankroll();
});

crapsRollButton.addEventListener("click", () => {
  const bet = clampBet(crapsBetInput.value);
  if (!canAffordBet(bet)) {
    updateCrapsStatus("Not enough chips for that bet.");
    return;
  }

  playerChips -= bet;
  updateBankroll();

  const dieOne = Math.ceil(Math.random() * 6);
  const dieTwo = Math.ceil(Math.random() * 6);
  const roll = dieOne + dieTwo;

  if (crapsPoint === null) {
    if (roll === 7 || roll === 11) {
      playerChips += bet * 2;
      updateCrapsStatus(`Rolled ${roll} ( ${dieOne} + ${dieTwo} ). Natural! You win.`);
    } else if (roll === 2 || roll === 3 || roll === 12) {
      updateCrapsStatus(`Rolled ${roll} ( ${dieOne} + ${dieTwo} ). Craps! You lose.`);
    } else {
      crapsPoint = roll;
      updateCrapsStatus(`Rolled ${roll}. Point is set to ${crapsPoint}. Roll again.`);
    }
  } else if (roll === crapsPoint) {
    playerChips += bet * 2;
    updateCrapsStatus(`Rolled ${roll}. You made your point! You win.`);
    crapsPoint = null;
  } else if (roll === 7) {
    updateCrapsStatus(`Rolled 7. Seven out! You lose.`);
    crapsPoint = null;
  } else {
    updateCrapsStatus(`Rolled ${roll}. Point is ${crapsPoint}. Keep rolling.`);
  }

  updateBankroll();
});

rouletteSpinButton.addEventListener("click", () => {
  const bet = clampBet(rouletteBetInput.value);
  if (!canAffordBet(bet)) {
    updateRouletteStatus("Not enough chips for that bet.");
    return;
  }

  const choice = rouletteChoiceSelect.value;
  const chosenNumber = clampBet(rouletteNumberInput.value);
  if (choice === "number" && (chosenNumber < 0 || chosenNumber > 36)) {
    updateRouletteStatus("Choose a number from 0 to 36.");
    return;
  }

  playerChips -= bet;
  updateBankroll();

  const spin = Math.floor(Math.random() * 37);
  const color = spin === 0 ? "green" : rouletteRedNumbers.has(spin) ? "red" : "black";
  let payout = 0;
  let resultMessage = `Spin: ${spin} (${color}). `;

  if (choice === "number" && spin === chosenNumber) {
    payout = bet * 36;
    resultMessage += "Straight hit! You win.";
  } else if (choice === color && color !== "green") {
    payout = bet * 2;
    resultMessage += "Color match! You win.";
  } else {
    resultMessage += "No match. You lose.";
  }

  if (payout > 0) {
    playerChips += payout;
  }

  updateRouletteStatus(resultMessage);
  updateBankroll();
});

adminApplyButton.addEventListener("click", () => {
  const password = adminPasswordInput.value.trim();
  if (password !== adminPassword) {
    updateAdminStatus("Access denied. Incorrect password.");
    adminPasswordInput.value = "";
    return;
  }

  const chips = clampBet(adminChipsInput.value);
  if (chips < 0) {
    updateAdminStatus("Enter a valid chip amount.");
    return;
  }

  playerChips = chips;
  updateBankroll();
  updateAdminStatus(`Chip balance set to ${playerChips.toLocaleString()}.`);
  adminPasswordInput.value = "";
});

resetTable();

