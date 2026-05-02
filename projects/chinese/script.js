// 1. App State Variables
let masterDeck = []; // Now starts empty
let learningPile = [];
let currentCard = null;

// Helper to strip punctuation and normalize strings
function cleanString(str) {
    // This regex looks for ' ? , ! and replaces them with an empty string
    return str.toLowerCase().replace(/[',?!]/g, "").trim();
}

// 2. UI Elements
const audioCardInner = document.getElementById('audio-card-inner'); 
const audioCardBack = document.getElementById('audio-card-back');
const playBtn = document.getElementById('play-btn');
const pinyinInput = document.getElementById('pinyin-input');
const englishInput = document.getElementById('english-input');
const submitBtn = document.getElementById('submit-btn');
const feedbackDiv = document.getElementById('feedback');
const remainingCount = document.getElementById('remaining-count');
const keys = document.querySelectorAll('.key'); 

// --- CSV Parser Logic ---
async function loadDeckFromCSV() {
    try {
        const response = await fetch('deck.csv');
        const data = await response.text();
        
        // Split by lines and remove the header row
        const rows = data.split('\n').slice(1);
        
        masterDeck = rows.map(row => {
            const columns = row.split(',');
            if (columns.length < 4) return null;

            return {
                id: columns[0].trim(),
                textToRead: columns[1].trim(),
                // Split the semicolons back into arrays
                pinyin: columns[2].trim().split(';'),
                english: columns[3].trim().split(';')
            };
        }).filter(card => card !== null); // Remove empty rows

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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- Text to Speech ---
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; 
    utterance.rate = 0.4; 
    window.speechSynthesis.speak(utterance);
}

// --- On-Screen Keyboard Logic ---
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

// --- Core Functions ---
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

function checkAnswer() {
    if (!currentCard) return;

    // 1. Clean the user's input
    const userPinyin = cleanString(pinyinInput.value);
    const userEnglish = cleanString(englishInput.value);

    // 2. Clean the deck answers before comparing
    const isPinyinCorrect = currentCard.pinyin
        .map(ans => cleanString(ans))
        .includes(userPinyin);

    const isEnglishCorrect = currentCard.english
        .map(ans => cleanString(ans))
        .includes(userEnglish);

    if (isPinyinCorrect && isEnglishCorrect) {
        // --- CORRECT ANSWER ---
        document.body.classList.add('flash-red');
        setTimeout(() => { document.body.classList.remove('flash-red'); }, 1000);

        audioCardBack.innerText = "Correct!";
        audioCardBack.style.color = "darkred";
        audioCardInner.classList.add('is-flipped'); 
        
        learningPile.shift(); 
        
        setTimeout(() => {
            audioCardInner.classList.remove('is-flipped');
            setTimeout(loadNextCard, 400); 
        }, 4000);

    } else {
        // --- INCORRECT ANSWER ---
        document.body.classList.add('flash-green');
        setTimeout(() => { document.body.classList.remove('flash-green'); }, 1000); 

        audioCardBack.innerText = "Incorrect!\nTry again.";
        audioCardBack.style.color = "darkgreen";
        audioCardInner.classList.add('is-flipped');

        const wrongCard = learningPile.shift();
        learningPile.push(wrongCard);
        
        setTimeout(() => {
            audioCardInner.classList.remove('is-flipped');
            setTimeout(loadNextCard, 400); 
        }, 4000);
    }
}

// --- Event Listeners ---
playBtn.addEventListener('click', () => {
    if (currentCard) { speakText(currentCard.textToRead); }
});

englishInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
pinyinInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
submitBtn.addEventListener('click', checkAnswer);

// Start by fetching the CSV
loadDeckFromCSV();