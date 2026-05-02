// 1. App State Variables
let masterDeck = []; 
let learningPile = [];
let currentCard = null;
let preferredVoice = null;
let isShowingAnswer = false; 

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

// --- Speech Synthesis Setup ---

function setVoice() {
    const voices = window.speechSynthesis.getVoices();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
    preferredVoice = voices.find(voice => 
        voice.lang === 'zh-CN' && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang === 'zh-CN');
    } else {
        // Desktop/Laptop: Prioritize Google's Neural voices
        preferredVoice = voices.find(voice => 
            voice.lang === 'zh-CN' && voice.name.includes('Google')
        ) || voices.find(voice => voice.lang === 'zh-CN');
    }
}

window.speechSynthesis.onvoiceschanged = setVoice;
setVoice();

function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get all available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Filter for a Google-specific Chinese voice
    const googleVoice = voices.find(voice => 
        voice.lang === 'zh-CN' && voice.name.includes('Google')
    );

    if (googleVoice) {
        utterance.voice = googleVoice;
    }

    utterance.lang = 'zh-CN'; 
    utterance.rate = 0.6; 
    window.speechSynthesis.speak(utterance);
}

// --- Helper Functions ---

function cleanString(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/[',?!\s]/g, "");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- CSV Loading ---

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
        submitBtn.style.display = 'none'; 
        return;
    }
    
    currentCard = learningPile[0];
    pinyinInput.value = "";
    englishInput.value = "";
    feedbackDiv.className = "feedback hidden";
    remainingCount.innerText = learningPile.length;
    
    // Reset Button State to Submit (Red)
    submitBtn.innerText = "Submit";
    submitBtn.classList.remove('btn-next'); // This triggers the Blue -> Red transition
    isShowingAnswer = false;
    
    pinyinInput.focus(); 
}

function checkAnswer() {
    if (!currentCard || isShowingAnswer) return;

    const userPinyin = cleanString(pinyinInput.value);
    const userEnglish = cleanString(englishInput.value);

    const isPinyinCorrect = currentCard.pinyin.map(ans => cleanString(ans)).includes(userPinyin);
    const isEnglishCorrect = currentCard.english.map(ans => cleanString(ans)).includes(userEnglish);

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

    // Flip Cards
    audioCardInner.classList.add('is-flipped');
    inputCardInner.classList.add('is-flipped');
    
    // Change Button to Next (Blue)
    submitBtn.innerText = "Next";
    submitBtn.classList.add('btn-next'); // This triggers the Red -> Blue transition
    isShowingAnswer = true;
}

function handleNext() {
    audioCardInner.classList.remove('is-flipped');
    inputCardInner.classList.remove('is-flipped');
    setTimeout(loadNextCard, 400);
}

// --- Event Listeners ---

submitBtn.addEventListener('click', () => {
    if (isShowingAnswer) {
        handleNext();
    } else {
        checkAnswer();
    }
});

window.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (isShowingAnswer) {
            handleNext();
        } else {
            checkAnswer();
        }
    }
});

keys.forEach(key => {
    key.addEventListener('click', (e) => {
        if (isShowingAnswer) return; 
        const char = e.target.innerText;
        const startPos = pinyinInput.selectionStart;
        pinyinInput.value = pinyinInput.value.substring(0, startPos) + char + pinyinInput.value.substring(startPos);
        pinyinInput.focus();
        pinyinInput.setSelectionRange(startPos + 1, startPos + 1);
    });
});

playBtn.addEventListener('click', () => { if (currentCard) speakText(currentCard.textToRead); });

loadDeckFromCSV();