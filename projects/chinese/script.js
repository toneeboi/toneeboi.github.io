// 1. App State Variables
let masterDeck = []; 
let learningPile = [];
let currentCard = null;

// 2. UI Elements
const audioCardInner = document.getElementById('audio-card-inner'); 
const audioCardBack = document.getElementById('audio-card-back');
const inputCardInner = document.getElementById('input-card-inner');
const displayChars = document.getElementById('display-chars');
const displayPinyin = document.getElementById('display-pinyin');
const displayEnglish = document.getElementById('display-english');

const playBtn = document.getElementById('play-btn');
const pinyinInput = document.getElementById('pinyin-input');
const englishInput = document.getElementById('english-input');
const submitBtn = document.getElementById('submit-btn');
const feedbackDiv = document.getElementById('feedback');
const remainingCount = document.getElementById('remaining-count');
const keys = document.querySelectorAll('.key'); 

// --- Helper Functions ---

/**
 * Normalizes strings by removing specified punctuation and lowercasing
 * to ensure robust answer matching.
 */
function cleanString(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/[',?!]/g, "").trim();
}

/**
 * Shuffles the deck using the Fisher-Yates algorithm for random order.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- CSV Loading & Game Initialization ---

async function loadDeckFromCSV() {
    try {
        const response = await fetch('deck.csv');
        const data = await response.text();
        
        // Split by line and skip header row
        const rows = data.split('\n').slice(1);
        
        masterDeck = rows.map(row => {
            const columns = row.split(',');
            if (columns.length < 4) return null;

            return {
                id: columns[0].trim(),
                textToRead: columns[1].trim(),
                // Semicolons used in CSV to allow multiple correct answers
                pinyin: columns[2].trim().split(';'),
                english: columns[3].trim().split(';')
            };
        }).filter(card => card !== null);

        initGame();
    } catch (error) {
        console.error("Error loading CSV:", error);
        feedbackDiv.innerText = "Error loading vocabulary deck.";
        feedbackDiv.classList.remove('hidden');
    }
}

function initGame() {
    learningPile = [...masterDeck];
    shuffleArray(learningPile);
    loadNextCard();
}

// --- Core Gameplay Loop ---

function loadNextCard() {
    if (learningPile.length === 0) {
        feedbackDiv.innerText = "Congratulations! You finished the deck!";
        feedbackDiv.className = "feedback";
        feedbackDiv.style.color = "green";
        feedbackDiv.classList.remove('hidden');
        return;
    }
    
    currentCard = learningPile[0];
    pinyinInput.value = "";
    englishInput.value = "";
    feedbackDiv.className = "feedback hidden";
    remainingCount.innerText = learningPile.length;
    pinyinInput.focus(); 
}

/**
 * Pronunciation logic with slow speech rate for clear tone distinction.
 */
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; 
    utterance.rate = 0.4; 
    window.speechSynthesis.speak(utterance);
}

function checkAnswer() {
    if (!currentCard) return;

    const userPinyin = cleanString(pinyinInput.value);
    const userEnglish = cleanString(englishInput.value);

    const isPinyinCorrect = currentCard.pinyin.map(ans => cleanString(ans)).includes(userPinyin);
    const isEnglishCorrect = currentCard.english.map(ans => cleanString(ans)).includes(userEnglish);

    // Populate display for the input card's back face
    displayChars.innerText = currentCard.textToRead;
    displayPinyin.innerText = currentCard.pinyin[0]; 
    displayEnglish.innerText = currentCard.english[0];

    if (isPinyinCorrect && isEnglishCorrect) {
        // --- CORRECT ANSWER ---
        document.body.classList.add('flash-red');
        setTimeout(() => { document.body.classList.remove('flash-red'); }, 2000);

        audioCardBack.innerText = "Correct!";
        audioCardBack.style.color = "darkred";
        
        learningPile.shift(); 
    } else {
        // --- INCORRECT ANSWER ---
        document.body.classList.add('flash-green');
        setTimeout(() => { document.body.classList.remove('flash-green'); }, 2000); 

        audioCardBack.innerText = "Incorrect!";
        audioCardBack.style.color = "darkgreen";

        // Re-queue the card for later review
        const wrongCard = learningPile.shift();
        learningPile.push(wrongCard);
    }

    // Synchronized flip for both cards
    audioCardInner.classList.add('is-flipped');
    inputCardInner.classList.add('is-flipped');

    // Wait exactly 2 seconds before resetting for the next card
    setTimeout(() => {
        audioCardInner.classList.remove('is-flipped');
        inputCardInner.classList.remove('is-flipped');
        setTimeout(loadNextCard, 400); 
    }, 2000);
}

// --- Event Listeners ---

keys.forEach(key => {
    key.addEventListener('click', (e) => {
        const char = e.target.innerText;
        const startPos = pinyinInput.selectionStart;
        const endPos = pinyinInput.selectionEnd;
        
        pinyinInput.value = pinyinInput.value.substring(0, startPos) 
            + char 
            + pinyinInput.value.substring(endPos, pinyinInput.value.length);
        
        pinyinInput.focus();
        pinyinInput.setSelectionRange(startPos + 1, startPos + 1);
    });
});

playBtn.addEventListener('click', () => {
    if (currentCard) { speakText(currentCard.textToRead); }
});

englishInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
pinyinInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
submitBtn.addEventListener('click', checkAnswer);

// Start the fetch process
loadDeckFromCSV();