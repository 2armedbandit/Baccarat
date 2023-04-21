class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }

  get value() {
    if (this.rank > 9) {
      return 0;
    } else {
      return this.rank;
    }
  }
  
  getFileName() {
    let fileName = "";
    switch (this.rank) {
      case 1:
        fileName += "ace";
        break;
      case 11:
        fileName += "jack";
        break;
      case 12:
        fileName += "queen";
        break;
      case 13:
        fileName += "king";
        break;
      default:
        fileName += this.rank;
        break;
    }
    fileName += "_of_" + this.suit + ".svg";
    return fileName.toLowerCase(); // added to make file names consistent
  }
}

function initGame() {
  // Add event listener for expanding/collapsing natural rules
  document.getElementById("expand-natural-rules").addEventListener("click", () => {
    const naturalRules = document.getElementById("natural-rules");
    naturalRules.style.display = naturalRules.style.display === "block" ? "none" : "block";
  });

  // Add event listener for expanding/collapsing third card rules
  document.getElementById("expand-third-card-rules").addEventListener("click", () => {
    const thirdCardRules = document.getElementById("third-card-rules");
    thirdCardRules.style.display = thirdCardRules.style.display === "block" ? "none" : "block";
  });

  // Add event listener for closing rules
  document.getElementById("close-rules").addEventListener("click", () => {
    const naturalRules = document.getElementById("natural-rules");
    naturalRules.style.display = "none";

    const thirdCardRules = document.getElementById("third-card-rules");
    thirdCardRules.style.display = "none";
  });

  // Rest of game initialization code goes here
}

// Call initGame() when page loads
window.addEventListener("load", initGame);
	

const suits = ["hearts", "diamonds", "clubs", "spades"];
const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

let deck = generateDeck();

function generateDeck() {
  const newDeck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      newDeck.push(new Card(suit, rank));
    }
  }
  return shuffle(newDeck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function drawCard() {
  if (deck.length === 0) {
    deck = generateDeck();
  }
  return deck.pop();
}

function getHandTotal(hand) {
  return (hand.reduce((total, card) => total + card.value, 0)) % 10;
}

function displayHands(playerHand, bankerHand, playerTotal, bankerTotal) {
  const playerHandDiv = document.getElementById("player-hand");
  const bankerHandDiv = document.getElementById("banker-hand");
  const playerTotalDiv = document.getElementById("player-total");
  const bankerTotalDiv = document.getElementById("banker-total");

  playerHandDiv.innerHTML = "";
  bankerHandDiv.innerHTML = "";

  playerHand.forEach((card, index) => {
    const cardElement = document.createElement("img");
    cardElement.src = `SVG-cards-1.3/${card.getFileName()}`;
    cardElement.className = "card";
    cardElement.style.order = index;
    playerHandDiv.appendChild(cardElement);
  });

  bankerHand.forEach((card, index) => {
    const cardElement = document.createElement("img");
    cardElement.src = `SVG-cards-1.3/${card.getFileName()}`;
    cardElement.className = "card";
    cardElement.style.order = index;
    bankerHandDiv.appendChild(cardElement);
  });

  playerTotalDiv.textContent = `Player total: ${playerTotal}`;
  bankerTotalDiv.textContent = `Banker total: ${bankerTotal}`;
}


function thirdCardRules(hand, role, playerThirdCard) {
  const total = getHandTotal(hand);

  if (role === "player") {
    if (total < 6) {
      hand.push(drawCard());
    }
  } else if (role === "banker") {
    if (total < 3) {
      hand.push(drawCard());
    } else if (total === 3 && playerThirdCard !== 8) {
      hand.push(drawCard());
    } else if (total === 4 && playerThirdCard >= 2 && playerThirdCard <= 7) {
      hand.push(drawCard());
    } else if (total === 5 && playerThirdCard >= 4 && playerThirdCard <= 7) {
      hand.push(drawCard());
    } else if (total === 6 && (playerThirdCard === 6 || playerThirdCard === 7)) {
      hand.push(drawCard());
    }
  }

  return hand;
}

function getOutcome(playerTotal, bankerTotal) {
  if (playerTotal > bankerTotal) {
    return "player";
  } else if (playerTotal < bankerTotal) {
    return "banker";
  } else {
    return "tie";
  }
  window.addEventListener("load", initGame);
}

function resetGame() {
  const playerHandDiv = document.getElementById("player-hand");
  const bankerHandDiv = document.getElementById("banker-hand");
  const playerScoreDiv = document.getElementById("player-score");
  const bankerScoreDiv = document.getElementById("banker-score");
  const gameStatusDiv = document.querySelector(".game-status");

  playerHandDiv.textContent = "";
  bankerHandDiv.textContent = "";
  gameStatusDiv.textContent = "";
}

async function playRound() {
  resetGame();

  // Deal initial two cards to both player and banker
  const playerInitialCards = [drawCard(), drawCard()];
  const bankerInitialCards = [drawCard(), drawCard()];

  displayHands(playerInitialCards, bankerInitialCards, getHandTotal(playerInitialCards), getHandTotal(bankerInitialCards));

  // Calculate the initial scores
  let playerScore = getHandTotal(playerInitialCards);
  let bankerScore = getHandTotal(bankerInitialCards);

  // Check for natural hand
  if (playerScore >= 8 || bankerScore >= 8) {
    return getOutcome(playerScore, bankerScore);
  }

  // Add a delay before drawing the third card
  await new Promise(resolve => setTimeout(resolve, 1000));

  const playerInitialCardsAfterThird = thirdCardRules(playerInitialCards, 'player');
  playerScore = getHandTotal(playerInitialCardsAfterThird);
  displayHands(playerInitialCardsAfterThird, bankerInitialCards, playerScore, bankerScore);

  const playerThirdCard = playerInitialCardsAfterThird.length === 3 ? playerInitialCardsAfterThird[2].value : null;
  const bankerInitialCardsAfterThird = thirdCardRules(bankerInitialCards, 'banker', playerThirdCard);
  bankerScore = getHandTotal(bankerInitialCardsAfterThird);
  displayHands(playerInitialCardsAfterThird, bankerInitialCardsAfterThird, playerScore, bankerScore);

  return getOutcome(playerScore, bankerScore);
}



let currentBalance = 100;
let gameInProgress = false;

document.getElementById("place-bet").addEventListener("click", async () => {
  const betAmount = parseFloat(document.getElementById("bet-amount").value);
  const betOutcome = document.getElementById("bet-outcome").value;

  if (betAmount <= currentBalance && betAmount > 0) {
    // Disable the button and set the game in progress flag to true
    document.getElementById("place-bet").disabled = true;
    gameInProgress = true;

    const roundOutcome = await playRound();
    const gameStatusDiv = document.querySelector(".game-status");

    if (betOutcome === roundOutcome) {
      let winnings = 0;
      if (roundOutcome === "player") {
        winnings = betAmount * 2;
      } else if (roundOutcome === "banker") {
        winnings = betAmount * 1.95;
      } else {
        winnings = betAmount * 8;
      }
      currentBalance += winnings; 
      document.getElementById("scoreboard-outcome").textContent = `You won $${(winnings).toFixed(2)}!`;
      gameStatusDiv.textContent = `The round outcome was ${roundOutcome}.`;
    } else {
      currentBalance -= betAmount;
      document.getElementById("scoreboard-outcome").textContent = `You lost $${betAmount.toFixed(2)}.`;
      gameStatusDiv.textContent = `The round outcome was ${roundOutcome}.`;
    }

    currentBalance = parseFloat(currentBalance.toFixed(2));
    document.getElementById("scoreboard-balance").textContent = `Balance: $${currentBalance}`;

    // Enable the button and set the game in progress flag to false
    document.getElementById("place-bet").disabled = false;
    gameInProgress = false;
  } else {
    alert("Invalid bet amount.");
  }
  
  document.getElementById("expand-natural-rules").addEventListener("click", () => {
  const naturalRules = document.getElementById("natural-rules");
  naturalRules.style.display = naturalRules.style.display === "block" ? "none" : "block";
});

document.getElementById("expand-third-card-rules").addEventListener("click", () => {
  const thirdCardRules = document.getElementById("third-card-rules");
  thirdCardRules.style.display = thirdCardRules.style.display === "block" ? "none" : "block";
});

document.getElementById("close-rules").addEventListener("click", () => {
  const naturalRules = document.getElementById("natural-rules");
  naturalRules.style.display = "none";

  const thirdCardRules = document.getElementById("third-card-rules");
  thirdCardRules.style.display = "none";
});




});

