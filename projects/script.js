// 1. Define your flashcards database
const masterDeck = [
    { id: 1, textToRead: "你好", pinyin: ["ni hao", "ni3 hao3"], english: ["hello", "hi"] },
    { id: 2, textToRead: "谢谢", pinyin: ["xie xie", "xie4 xie"], english: ["thank you", "thanks"] },
    { id: 3, textToRead: "再见", pinyin: ["zai jian", "zai4 jian4"], english: ["goodbye", "bye"] }
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
        // --- CORRECT ANSWER ---
        // Flash the background red
        document.body.classList.add('flash-red');
        setTimeout(() => {
            document.body.classList.remove('flash-red');
        }, 300);

        audioCardInner.classList.add('is-flipped'); // Spins the card
        feedbackDiv.classList.add('hidden'); 
        learningPile.shift(); 
        
        setTimeout(() => {
            audioCardInner.classList.remove('is-flipped');
            setTimeout(loadNextCard, 400); 
        }, 2000);

To change the incorrect answer flash from gray to a dark green vignette, we need to update the colors in your CSS and change the class name in your JavaScript so it makes sense.

Here are the quick updates for both files.

1. Update style.css
Find the body.flash-gray::before section in your CSS file and replace it entirely with this new body.flash-green::before rule. We will use RGB values for dark green (0, 100, 0) with the same transparency trick to keep the center glow.

CSS
/* WRONG answers: Dark green vignette fading to transparent edges */
body.flash-green::before {
    background: radial-gradient(circle at center, rgba(0, 100, 0, 0.4) 0%, rgba(0, 100, 0, 0) 70%);
    opacity: 1;
    transition: opacity 0.1s ease; 
}
2. Update script.js
Now, we just need to tell your JavaScript to use the new "green" class instead of the "gray" one when you get an answer wrong.

Find the checkAnswer() function in your script.js file, look for the else block (the INCORRECT ANSWER section), and update it to this:

JavaScript
    } else {
        // --- INCORRECT ANSWER ---
        // Flash the background dark green
        document.body.classList.add('flash-green');
        setTimeout(() => {
            document.body.classList.remove('flash-green');
        }, 300); 

        feedbackDiv.innerText = "Incorrect. Try again!";
        feedbackDiv.style.color = "red";
        feedbackDiv.classList.remove('hidden');

        const wrongCard = learningPile.shift();
        learningPile.push(wrongCard);
        
        // Wait 2 seconds, then load the next card
        setTimeout(loadNextCard, 2000);
    }
}

// 5. Event Listeners
playBtn.addEventListener('click', () => {
    if (currentCard) {
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
