// 1. Define your flashcards database
const masterDeck = [
    { id: 1, textToRead: "你好", pinyin: ["ni hao", "ni3 hao3", "nǐ hǎo"], english: ["hello", "hi"] },
    { id: 2, textToRead: "谢谢", pinyin: ["xie xie", "xie4 xie", "xiè xiè", "xiè xie"], english: ["thank you", "thanks"] },
    { id: 3, textToRead: "再见", pinyin: ["zai jian", "zai4 jian4", "zài jiàn"], english: ["goodbye", "bye"] }
];

// 2. App State Variables
let learningPile = [...masterDeck]; 

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

shuffleArray(learningPile);
let currentCard = null;

// 3. UI Elements
const audioCardInner = document.getElementById('audio-card-inner'); 
const audioCardBack = document.getElementById('audio-card-back'); // NEW: Grabs the back of the card
const playBtn = document.getElementById('play-btn');
const pinyinInput = document.getElementById('pinyin-input');
const englishInput = document.getElementById('english-input');
const submitBtn = document.getElementById('submit-btn');
const feedbackDiv = document.getElementById('feedback');
const remainingCount = document.getElementById('remaining-count');
const keys = document.querySelectorAll('.key'); 

// --- Text to Speech ---
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; 
    utterance.rate = 0.8; 
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

// 4. Core Functions
function loadNextCard() {
    if (learningPile.length === 0) {
        feedbackDiv.innerText = "Congratulations! You finished the deck!";
        feedbackDiv.className = "feedback";
        feedbackDiv.style.color = "green";
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

    const userPinyin = pinyinInput.value.toLowerCase().trim();
    const userEnglish = englishInput.value.toLowerCase().trim();

    const isPinyinCorrect = currentCard.pinyin.map(ans => ans.toLowerCase()).includes(userPinyin);
    const isEnglishCorrect = currentCard.english.map(ans => ans.toLowerCase()).includes(userEnglish);

    if (isPinyinCorrect && isEnglishCorrect) {
        // --- CORRECT ANSWER ---
        document.body.classList.add('flash-red');
        setTimeout(() => { document.body.classList.remove('flash-red'); }, 800);

        // Set the text and spin the card
        audioCardBack.innerText = "Correct!";
        audioCardBack.style.color = "darkred";
        audioCardInner.classList.add('is-flipped'); 
        
        learningPile.shift(); 
        
        setTimeout(() => {
            audioCardInner.classList.remove('is-flipped');
            setTimeout(loadNextCard, 400); 
        }, 2000);

    } else {
        // --- INCORRECT ANSWER ---
        document.body.classList.add('flash-green');
        setTimeout(() => { document.body.classList.remove('flash-green'); }, 800); 

        // Set the text to incorrect and spin the card!
        audioCardBack.innerText = "Incorrect!\nTry again.";
        audioCardBack.style.color = "darkgreen";
        audioCardInner.classList.add('is-flipped');

        const wrongCard = learningPile.shift();
        learningPile.push(wrongCard);
        
        // Wait 2 seconds, flip it back, then load the next card
        setTimeout(() => {
            audioCardInner.classList.remove('is-flipped');
            setTimeout(loadNextCard, 400); 
        }, 2000);
    }
}

// 5. Event Listeners
playBtn.addEventListener('click', () => {
    if (currentCard) { speakText(currentCard.textToRead); }
});

englishInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') { checkAnswer(); }
});

pinyinInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') { checkAnswer(); }
});

submitBtn.addEventListener('click', checkAnswer);

// Start the app
loadNextCard();