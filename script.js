document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let playerScore = 0;
    let botScore = 0;
    let round = 1;
    let gameActive = true;
    let playerName = "Player";
    let gamesPlayed = 0;
    let gamesWon = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let soundEnabled = true;
    
    // DOM elements
    const playerScoreElement = document.getElementById('player-score');
    const botScoreElement = document.getElementById('bot-score');
    const roundElement = document.getElementById('round');
    const playerChoiceElement = document.getElementById('player-choice');
    const botChoiceElement = document.getElementById('bot-choice');
    const resultElement = document.getElementById('result');
    const choiceButtons = document.querySelectorAll('.choice-btn');
    const resetButton = document.getElementById('reset-btn');
    const playerNameElement = document.getElementById('player-name');
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = soundToggle.querySelector('.sound-icon');
    
    // Stats elements
    const gamesPlayedElement = document.getElementById('games-played');
    const winRateElement = document.getElementById('win-rate');
    const currentStreakElement = document.getElementById('current-streak');
    const bestStreakElement = document.getElementById('best-streak');
    
    // Modal elements
    const nameModal = document.getElementById('name-modal');
    const roundIndicator = document.getElementById('round-indicator');
    const roundTitle = document.getElementById('round-title');
    const playerNameInput = document.getElementById('player-name-input');
    const startGameButton = document.getElementById('start-game');
    
    // Popup elements
    const resultPopup = document.getElementById('result-popup');
    const resultTitle = document.getElementById('result-title');
    const resultDetails = document.getElementById('result-details');
    const playAgainBtn = document.getElementById('play-again-btn');
    const closePopupBtn = document.getElementById('close-popup');
    
    // Audio elements
    const winSound = document.getElementById('win-sound');
    const loseSound = document.getElementById('lose-sound');
    const clickSound = document.getElementById('click-sound');
    const tieSound = document.getElementById('tie-sound');
    const selectSound = document.getElementById('select-sound');
    
    // Initialize audio elements
    function initializeAudio() {
        // Set audio volume
        [winSound, loseSound, clickSound, tieSound, selectSound].forEach(audio => {
            audio.volume = 0.5;
        });
    }
    
    // Show name modal on page load
    nameModal.style.display = 'flex';
    playerNameInput.focus();
    
    // Initialize audio
    initializeAudio();
    
    // Start game when name is entered
    startGameButton.addEventListener('click', () => {
        if (playerNameInput.value.trim() !== '') {
            playerName = playerNameInput.value.trim();
            playerNameElement.textContent = playerName;
            nameModal.style.display = 'none';
            showRoundIndicator();
        } else {
            alert('Please enter your name to continue.');
        }
    });
    
    // Also allow Enter key to start the game
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGameButton.click();
        }
    });
    
    // Show round indicator
    function showRoundIndicator() {
        roundTitle.textContent = `Round ${round}`;
        roundIndicator.classList.remove('hidden');
        
        setTimeout(() => {
            roundIndicator.classList.add('hidden');
        }, 2000);
    }
    
    // Game choices
    const choices = ['rock', 'paper', 'scissors'];
    const choiceSymbols = {
        rock: '✊',
        paper: '✋',
        scissors: '✌️'
    };
    
    // Event listeners for choice buttons
    choiceButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!gameActive) return;
            
            const playerChoice = button.dataset.choice;
            playRound(playerChoice);
        });
        
        // Add hover sound effect
        button.addEventListener('mouseenter', () => {
            if (soundEnabled && gameActive) {
                playSound(selectSound);
            }
        });
        
        button.addEventListener('touchstart', () => {
            if (soundEnabled && gameActive) {
                playSound(selectSound);
            }
        });
    });
    
    // Event listener for reset button
    resetButton.addEventListener('click', resetGame);
    
    // Event listener for sound toggle
    soundToggle.addEventListener('click', toggleSound);
    
    // Event listeners for popup buttons
    playAgainBtn.addEventListener('click', () => {
        resultPopup.classList.add('hidden');
        resetGame();
    });
    
    closePopupBtn.addEventListener('click', () => {
        resultPopup.classList.add('hidden');
    });
    
    // Play sound with error handling
    function playSound(audioElement) {
        if (!soundEnabled) return;
        
        try {
            audioElement.currentTime = 0;
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log("Audio play failed:", e);
                });
            }
        } catch (error) {
            console.log("Audio error:", error);
        }
    }
    
    // Toggle sound on/off
    function toggleSound() {
        soundEnabled = !soundEnabled;
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
        
        // Play toggle sound
        if (soundEnabled) {
            playSound(clickSound);
        }
    }
    
    // Main game function
    function playRound(playerChoice) {
        // Play click sound
        playSound(clickSound);
        
        // Disable buttons during animation
        choiceButtons.forEach(btn => btn.disabled = true);
        
        // Get bot's random choice
        const botChoice = getBotChoice();
        
        // Display choices with delay for better UX
        setTimeout(() => {
            displayChoices(playerChoice, botChoice);
            
            // Determine winner and update game
            setTimeout(() => {
                const winner = determineWinner(playerChoice, botChoice);
                updateGame(winner, playerChoice, botChoice);
                
                // Re-enable buttons
                choiceButtons.forEach(btn => btn.disabled = false);
                
                // Check for game end
                if (round === 5 || playerScore === 3 || botScore === 3) {
                    setTimeout(() => {
                        endGame();
                    }, 1500);
                } else {
                    round++;
                    roundElement.textContent = round;
                    
                    // Show next round indicator
                    setTimeout(() => {
                        showRoundIndicator();
                    }, 1000);
                }
            }, 1000);
        }, 500);
    }
    
    // Get bot's random choice
    function getBotChoice() {
        const randomIndex = Math.floor(Math.random() * choices.length);
        return choices[randomIndex];
    }
    
    // Display player and bot choices
    function displayChoices(playerChoice, botChoice) {
        // Reset animations
        playerChoiceElement.classList.remove('pulse');
        botChoiceElement.classList.remove('pulse');
        
        // Display choices with animation
        playerChoiceElement.textContent = choiceSymbols[playerChoice];
        botChoiceElement.textContent = choiceSymbols[botChoice];
        
        // Add animation
        playerChoiceElement.classList.add('pulse');
        botChoiceElement.classList.add('pulse');
    }
    
    // Determine the winner of a round
    function determineWinner(playerChoice, botChoice) {
        if (playerChoice === botChoice) {
            return 'tie';
        }
        
        if (
            (playerChoice === 'rock' && botChoice === 'scissors') ||
            (playerChoice === 'paper' && botChoice === 'rock') ||
            (playerChoice === 'scissors' && botChoice === 'paper')
        ) {
            return 'player';
        }
        
        return 'bot';
    }
    
    // Update game state and display result
    function updateGame(winner, playerChoice, botChoice) {
        let resultText = '';
        let resultClass = '';
        
        switch (winner) {
            case 'player':
                playerScore++;
                playerScoreElement.textContent = playerScore;
                resultText = `${playerName} wins! ${capitalizeFirstLetter(playerChoice)} beats ${botChoice}`;
                resultClass = 'win';
                playSound(winSound);
                break;
            case 'bot':
                botScore++;
                botScoreElement.textContent = botScore;
                resultText = `Bot wins! ${capitalizeFirstLetter(botChoice)} beats ${playerChoice}`;
                resultClass = 'lose';
                playSound(loseSound);
                break;
            case 'tie':
                resultText = "It's a tie!";
                resultClass = 'tie';
                playSound(tieSound);
                break;
        }
        
        resultElement.textContent = resultText;
        resultElement.className = 'result ' + resultClass;
    }
    
    // Update stats
    function updateStats(won) {
        gamesPlayed++;
        gamesPlayedElement.textContent = gamesPlayed;
        
        if (won) {
            gamesWon++;
            currentStreak++;
            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
                bestStreakElement.textContent = bestStreak;
            }
        } else {
            currentStreak = 0;
        }
        
        currentStreakElement.textContent = currentStreak;
        
        const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
        winRateElement.textContent = `${winRate}%`;
    }
    
    // End the game
    function endGame() {
        gameActive = false;
        
        let finalMessage = '';
        let won = false;
        
        if (playerScore > botScore) {
            finalMessage = `Congratulations ${playerName}! You won the game! 🎉`;
            resultTitle.textContent = "Victory!";
            won = true;
            
            playSound(winSound);
            
            // Confetti explosion for win
            confettiExplosion();
        } else if (botScore > playerScore) {
            finalMessage = 'Game over! The Bot won. Try again!';
            resultTitle.textContent = "Defeat!";
            playSound(loseSound);
        } else {
            finalMessage = "It's a tie game! Well played!";
            resultTitle.textContent = "Tie Game!";
            playSound(tieSound);
        }
        
        resultDetails.textContent = `Final Score: ${playerName} ${playerScore} - ${botScore} Bot`;
        
        // Update stats
        updateStats(won);
        
        // Show result popup
        resultPopup.classList.remove('hidden');
    }
    
    // Reset the game
    function resetGame() {
        playerScore = 0;
        botScore = 0;
        round = 1;
        gameActive = true;
        
        playerScoreElement.textContent = playerScore;
        botScoreElement.textContent = botScore;
        roundElement.textContent = round;
        
        playerChoiceElement.textContent = '❓';
        botChoiceElement.textContent = '❓';
        
        resultElement.textContent = 'Make your move to start the game!';
        resultElement.className = 'result';
        
        // Enable choice buttons
        choiceButtons.forEach(button => {
            button.disabled = false;
        });
        
        // Show round indicator
        showRoundIndicator();
    }
    
    // Confetti explosion
    function confettiExplosion() {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});