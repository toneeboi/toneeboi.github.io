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
let learningPile = [...masterDeck]; // Start with all cards here

// --- NEW FUNCTION: Randomize the deck ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap the elements
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

// --- NEW FUNCTION: Text to Speech ---
function speakText(text) {
    // Create a new speech request
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Force the language to Mandarin Chinese
    utterance.lang = 'zh-CN'; 
    
    // Optional: Slow down the speech rate slightly for learning (0.8 is good, 1.0 is normal speed)
    utterance.rate = 0.8; 
    
    // Tell the browser to speak
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
    
    // Pick the first card in the pile
    currentCard = learningPile[0];
    
    // Automatically speak the word when the card loads
    speakText(currentCard.textToRead);
    
    // Reset UI
    pinyinInput.value = "";
    englishInput.value = "";
    feedbackDiv.className = "feedback hidden";
    remainingCount.innerText = learningPile.length;
    
    // Automatically put the cursor in the Pinyin box so you can start typing immediately
    pinyinInput.focus(); 
}

function checkAnswer() {
    if (!currentCard) return;

    // Clean inputs: convert to lowercase and remove extra spaces
    const userPinyin = pinyinInput.value.toLowerCase().trim();
    const userEnglish = englishInput.value.toLowerCase().trim();

    // Check if the user's input exists in our array of accepted answers
    const isPinyinCorrect = currentCard.pinyin.includes(userPinyin);
    const isEnglishCorrect = currentCard.english.includes(userEnglish);

    if (isPinyinCorrect && isEnglishCorrect) {
        feedbackDiv.innerText = "Correct!";
        feedbackDiv.style.color = "green";
        // Remove from learning pile (moves to "correct" pile implicitly by deletion)
        learningPile.shift(); 
    } else {
        feedbackDiv.innerText = `Incorrect. Pinyin: ${currentCard.pinyin[0]} | English: ${currentCard.english[0]}`;
        feedbackDiv.style.color = "red";
        // Move the current card to the back of the pile rotation
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
        // Speak the characters again if the user clicks the button
        speakText(currentCard.textToRead);
    }
});

// Allow hitting "Enter" in the English input to submit
englishInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

submitBtn.addEventListener('click', checkAnswer);

// Start the app
loadNextCard();
