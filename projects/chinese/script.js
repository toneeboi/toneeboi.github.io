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
 * Normalizes strings. Specifically excludes parentheses from removal 
 * to support notes like "(polite)" or "(formal)".
 */
function cleanString(str) {
    if (!str) return "";
    // Removes standard punctuation but PRESERVES ( )
    return str.toLowerCase().replace(/[',?!]/g, "").trim();
}

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
        const rows = data.split('\n').slice(1);
        
        masterDeck = rows.map(row => {
            const columns = row.split(',');
            if (columns.length < 4) return null;

            return {
                id: columns[0].trim(),
                textToRead: columns[1].trim(),
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

function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; 
    utterance.rate = 0.4; // Preserved slow rate for clear tones
    window.speechSynthesis.speak(utterance);
}

function checkAnswer() {
    if (!currentCard) return;

    const userPinyin = cleanString(pinyinInput.value);
    const userEnglish = cleanString(englishInput.value);

    const isPinyinCorrect = currentCard.pinyin.map(ans => cleanString(ans)).includes(userPinyin);
    const isEnglishCorrect = currentCard.english.map(ans => cleanString(ans)).includes(userEnglish);

    // Update the back of the input card (Ma Shan Zheng font used in CSS)
    displayChars.innerText = currentCard.textToRead;
    displayPinyin.innerText = currentCard.pinyin[0]; 
    displayEnglish.innerText = currentCard.english[0];

    if (isPinyinCorrect && isEnglishCorrect) {
        document.body.classList.add('flash-red');
        setTimeout(() => { document.body.classList.remove('flash-red'); }, 2000);
        audioCardBack.innerText = "Correct!";
        audioCardBack.style.color = "darkred";
        learningPile.shift(); 
    } else {
        document.body.classList.add('flash-green');
        setTimeout(() => { document.body.classList.remove('flash-green'); }, 2000); 
        audioCardBack.innerText = "Incorrect!";
        audioCardBack.style.color = "darkgreen";
        const wrongCard = learningPile.shift();
        learningPile.push(wrongCard);
    }

    // Synchronized flip
    audioCardInner.classList.add('is-flipped');
    inputCardInner.classList.add('is-flipped');

    // Wait exactly 2 seconds before resetting
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
        pinyinInput.value = pinyinInput.value.substring(0, startPos) + char + pinyinInput.value.substring(endPos);
        pinyinInput.focus();
        pinyinInput.setSelectionRange(startPos + 1, startPos + 1);
    });
});

playBtn.addEventListener('click', () => { if (currentCard) speakText(currentCard.textToRead); });
englishInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
pinyinInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
submitBtn.addEventListener('click', checkAnswer);

loadDeckFromCSV();