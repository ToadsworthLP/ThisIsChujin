// DOM ELEMENTS
const PORTRAIT_ELEMENT = document.getElementById("portrait");
const TAPE_OVERLAY = document.getElementById("tape-overlay");
const TEXT_WRAPPER = document.getElementById("text-wrapper");

// MISC CONSTANTS
const UPDATE_FREQUENCY = 1/30;

const TAPE_OVERLAY_TARGET_OPACITY_UPDATE_FREQUENCY = 1/2;
const TAPE_OVERLAY_TARGET_OPACITY_MINIMUM = 0.1;
const TAPE_OVERLAY_TARGET_OPACITY_MAXIMUM = 0.7;
const TAPE_OVERLAY_OPACITY_LERP_SPEED = 10;

const TYPEWRITER_DEFAULT_SPEED = 30;
const TYPEWRITER_CHARACTER_SPEED_MULTIPLIERS = {
    ',' : 0.25,
    '.' : 0.25,
    '!' : 0.25,
    '?' : 0.25,
    '\n' : 0.1
}

// GLOBAL VARIABLES
let TIME = 0;

// LIFECYCLE FUNCTIONS
document.addEventListener("DOMContentLoaded", function(event) {
    init();
    setInterval(() => {update(UPDATE_FREQUENCY)}, UPDATE_FREQUENCY * 1000);
});

function init() {
    setTimeout(() => {
        setTypewriterText("This is Chujin.\nNothing to report for now.");
    }, 600);
}

function update(delta) {
    tapeOverlayUpdateOpacity(delta);
    updateTypewriterText(delta);
    TIME += delta;
}

// TAPE OVERLAY
let tapeOverlayNextTargetOpacityUpdate = 0;
let tapeOverlayTargetOpacity = 0;

function tapeOverlayUpdateOpacity(delta) {
    if(TIME > tapeOverlayNextTargetOpacityUpdate) {
        tapeOverlayUpdateTargetOpacity();

        if(tapeOverlayTargetOpacity > TAPE_OVERLAY.style.opacity) {
            TAPE_OVERLAY.style.opacity = lerp(TAPE_OVERLAY.style.opacity, tapeOverlayTargetOpacity, 0.5);
        }

        tapeOverlayNextTargetOpacityUpdate += TAPE_OVERLAY_TARGET_OPACITY_UPDATE_FREQUENCY;
    }

    TAPE_OVERLAY.style.opacity = lerp(TAPE_OVERLAY.style.opacity, tapeOverlayTargetOpacity, TAPE_OVERLAY_OPACITY_LERP_SPEED * delta);
}

function tapeOverlayUpdateTargetOpacity() {
    // I couldn't explain what's going on here either, I wrote this by pure trial and error
    tapeOverlayTargetOpacity = Math.max(Math.min(1 - Math.pow(Math.random() * 4, 2), TAPE_OVERLAY_TARGET_OPACITY_MAXIMUM), TAPE_OVERLAY_TARGET_OPACITY_MINIMUM);
}

// TEXT TYPEWRITER EFFECT
let typewriterText = "";
let typewriterShownCharacters = 0;
let typewriterTotalCharacters = 0;
let typewriterCharacterElements = [];
let typewriterPageFinished = true;

function setTypewriterText(text) {
    typewriterCharacterElements = [];
    TEXT_WRAPPER.innerHTML = "";

    typewriterText = text;
    typewriterShownCharacters = 0;
    typewriterTotalCharacters = text.length;
    typewriterPageFinished = false;

    let characters = text.split('');
    for (let i = 0; i < characters.length; i++) {
        let character = characters[i];

        let element;
        if(character === '\n') {
            element = document.createElement("br");
        } else {
            element = document.createElement("span");
            element.innerHTML = character;
            element.style.opacity = 0;
        }

        typewriterCharacterElements[i] = element;
        TEXT_WRAPPER.appendChild(element);
    }
}

function updateTypewriterText(delta) {
    if(typewriterPageFinished) return;
    let startIndex = Math.floor(typewriterShownCharacters);

    let typewriterSpeed;
    let nextCharacter = typewriterText[startIndex];
    if(TYPEWRITER_CHARACTER_SPEED_MULTIPLIERS.hasOwnProperty(nextCharacter)) {
        typewriterSpeed = TYPEWRITER_DEFAULT_SPEED * TYPEWRITER_CHARACTER_SPEED_MULTIPLIERS[nextCharacter];
    } else {
        typewriterSpeed = TYPEWRITER_DEFAULT_SPEED;
    }

    typewriterShownCharacters += typewriterSpeed * delta;
    if(typewriterShownCharacters >= typewriterTotalCharacters) {
        typewriterShownCharacters = typewriterTotalCharacters;
        typewriterPageFinished = true;
    }

    for (let i = startIndex; i < typewriterShownCharacters; i++) {
        typewriterCharacterElements[i].style.opacity = i < typewriterShownCharacters ? 1 : 0;
    }
}

// UTILITY FUNCTIONS
function lerp (a, b, t){
    return (1 - t) * a + t * b;
}