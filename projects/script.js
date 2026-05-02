// 1. Define your flashcards database
const masterDeck = [
    {
        id: 1,
        textToRead: "你好", 
        pinyin: ["ni hao", "ni3 hao3"], 
        english: ["hello", "hi"]
    },
    {
        id: 2,
        textToRead: "谢谢",
        pinyin: ["xie xie", "xie4 xie"],
        english: ["thank you", "thanks"]
    },
    {
        id: 3,
        textToRead: "再见",
        pinyin: ["zai jian", "zai4 jian4"],
        english: ["goodbye", "bye"]
    }
];

// 2. App State Variables
let learningPile = [...masterDeck]; 

// --- Randomize the deck ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Shuffle the learning pile immediately before starting
shuffleArray(learningPile);

let currentCard = null;

// 3. UI Elements
const playBtn = document.getElementById('play-btn');
const pinyinInput = document.getElementById('pinyin-input');
const englishInput = document.getElementById('english-input');
const submitBtn = document.getElementById('submit-btn');
const feedbackDiv = document.getElementById('feedback');
const remainingCount = document.getElementById('remaining-count');

// --- Text to Speech ---
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; 
    utterance.rate = 0.8; 
    window.speechSynthesis.speak(utterance);
}

// 4. Core Functions
function loadNextCard() {
    if (learningPile.length === 0) {
        feedbackDiv.innerText = "Congratulations! You finished the deck!";
        feedbackDiv.className = "feedback";
        feedbackDiv.style.color = "green";
        return;
    }
    
    currentCard = learningPile[0];
    
    // *** REMOVED THE AUTO-SPEAK LINE HERE ***
    
    // Reset UI
    pinyinInput.value = "";
    englishInput.value = "";
    feedbackDiv.className = "feedback hidden";
    remainingCount.innerText = learningPile.length;
    
    // Automatically put the cursor in the Pinyin box
    pinyinInput.focus(); 
}

function checkAnswer() {
    if (!currentCard) return;

    const userPinyin = pinyinInput.value.toLowerCase().trim();
    const userEnglish = englishInput.value.toLowerCase().trim();

    const isPinyinCorrect = currentCard.pinyin.includes(userPinyin);
    const isEnglishCorrect = currentCard.english.includes(userEnglish);

    if (isPinyinCorrect && isEnglishCorrect) {
        feedbackDiv.innerText = "Correct!";
        feedbackDiv.style.color = "green";
        learningPile.shift(); 
    } else {
        feedbackDiv.innerText = `Incorrect. Pinyin: ${currentCard.pinyin[0]} | English: ${currentCard.english[0]}`;
        feedbackDiv.style.color = "red";
        const wrongCard = learningPile.shift();
        learningPile.push(wrongCard);
    }
    
    feedbackDiv.classList.remove('hidden');
    
    // Wait 2 seconds, then load the next card
    setTimeout(loadNextCard, 2000);
}

// 5. Event Listeners
playBtn.addEventListener('click', () => {
    if (currentCard) {
        // Now, this is the ONLY way the audio plays!
        speakText(currentCard.textToRead);
    }
});

englishInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

submitBtn.addEventListener('click', checkAnswer);

// Start the app
loadNextCard();
