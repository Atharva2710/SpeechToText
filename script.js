// Global variables
let recognition = null;
let isListening = false;
let savedNotes = [];

// DOM Elements
const micBtn = document.getElementById('micBtn');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const transcript = document.getElementById('transcript');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const wordCount = document.getElementById('wordCount');
const errorMessage = document.getElementById('errorMessage');
const savedNotesSection = document.getElementById('savedNotes');
const notesList = document.getElementById('notesList');
const noteCount = document.getElementById('noteCount');

// Initialize Speech Recognition
function initSpeechRecognition() {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showError('Speech Recognition is not supported in your browser. Please use Chrome or Edge.');
        micBtn.disabled = true;
        return;
    }

    // Create Speech Recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Handle results
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcriptPiece + ' ';
            } else {
                interimTranscript += transcriptPiece;
            }
        }

        if (finalTranscript) {
            transcript.value += finalTranscript;
            updateWordCount();
        }
    };

    // Handle errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        showError(`Error: ${event.error}`);
        stopListening();
    };

    // Handle end
    recognition.onend = () => {
        if (isListening) {
            stopListening();
        }
    };
}

// Start listening
function startListening() {
    if (!recognition) {
        showError('Speech Recognition is not available.');
        return;
    }

    hideError();
    
    try {
        recognition.start();
        isListening = true;
        updateUI();
    } catch (err) {
        showError('Could not start listening. Please try again.');
    }
}

// Stop listening
function stopListening() {
    if (recognition) {
        recognition.stop();
    }
    isListening = false;
    updateUI();
}

// Toggle listening
function toggleListening() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

// Update UI based on listening state
function updateUI() {
    if (isListening) {
        micBtn.textContent = '🔴 Stop Listening';
        micBtn.classList.add('listening');
        statusDot.classList.add('active');
        statusText.textContent = 'Listening...';
    } else {
        micBtn.textContent = '🎤 Start Listening';
        micBtn.classList.remove('listening');
        statusDot.classList.remove('active');
        statusText.textContent = 'Not listening';
    }

    // Enable/disable save and clear buttons
    saveBtn.disabled = !transcript.value.trim();
    clearBtn.disabled = !transcript.value;
}

// Update word count
function updateWordCount() {
    const text = transcript.value.trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    wordCount.textContent = `${words.length} words`;
    updateUI();
}

// Save note
function saveNote() {
    const text = transcript.value.trim();
    if (!text) return;

    const note = {
        id: Date.now(),
        text: text,
        timestamp: new Date().toLocaleString()
    };

    savedNotes.unshift(note);
    renderNotes();
    transcript.value = '';
    updateWordCount();
    updateUI();
}

// Delete note
function deleteNote(id) {
    savedNotes = savedNotes.filter(note => note.id !== id);
    renderNotes();
}

// Render saved notes
function renderNotes() {
    if (savedNotes.length === 0) {
        savedNotesSection.classList.remove('show');
        return;
    }

    savedNotesSection.classList.add('show');
    noteCount.textContent = savedNotes.length;

    notesList.innerHTML = savedNotes.map(note => `
        <div class="note-item">
            <div class="note-header">
                <span class="note-timestamp">${note.timestamp}</span>
                <button class="btn-delete" onclick="deleteNote(${note.id})">🗑️ Delete</button>
            </div>
            <div class="note-text">${note.text}</div>
        </div>
    `).join('');
}

// Clear transcript
function clearTranscript() {
    transcript.value = '';
    updateWordCount();
    updateUI();
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

// Hide error
function hideError() {
    errorMessage.classList.remove('show');
}

// Event Listeners
micBtn.addEventListener('click', toggleListening);
saveBtn.addEventListener('click', saveNote);
clearBtn.addEventListener('click', clearTranscript);
transcript.addEventListener('input', updateWordCount);

// Initialize on page load
initSpeechRecognition();