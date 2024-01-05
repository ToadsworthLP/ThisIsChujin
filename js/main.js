// DOM ELEMENTS

const PORTRAIT_ELEMENT = document.getElementById("portrait");
const TAPE_OVERLAY_ELEMENT = document.getElementById("tape-overlay");
const END_STATIC_OVERLAY_WRAPPER_ELEMENT = document.getElementById("end-static-overlay-wrapper");
const TEXT_WRAPPER_ELEMENT = document.getElementById("text-wrapper");

// MISC CONSTANTS

const UPDATE_FREQUENCY = 1/30;

const INITIAL_STATIC_DELAY = 0.8;
const MESSAGE_END_STATIC_DELAY = 1;

const TAPE_OVERLAY_TARGET_OPACITY_UPDATE_FREQUENCY = 1/2;
const TAPE_OVERLAY_TARGET_OPACITY_MINIMUM = 0.1;
const TAPE_OVERLAY_TARGET_OPACITY_MAXIMUM = 0.7;
const TAPE_OVERLAY_OPACITY_LERP_SPEED = 10;

const TYPEWRITER_AUTO_ADVANCE_DELAY = 2;
const TYPEWRITER_DEFAULT_PAUSE = 1/30;
const TYPEWRITER_CHARACTER_PAUSE_MULTIPLIERS = {
    ',' : 4,
    '.' : 4,
    '!' : 4,
    '?' : 4,
    '\n' : 10
}

const TYPEWRITER_DIRECTIONS = {
    "Pause": (arg) => {
        let parsedDuration = Number.parseFloat(arg);
        if(Number.isNaN(parsedDuration)) {
            return () => {}
        } else {
            return typewriterAddPauseCommand(parsedDuration);
        }
    },

    "Portrait": (arg) => {
        return () => {
            console.log(arg);
            if(PORTRAIT_PATHS.hasOwnProperty(arg)) {
                setPortraitImage(PORTRAIT_PATHS[arg]);
            }
        }
    }
}

const DEFAULT_PORTRAIT = "Normal";
const PORTRAIT_PATHS = {
    "Normal": "assets/portraits/chujin/normal.png",
    "Stressed": "assets/portraits/chujin/stressed.png",
    "Anxious": "assets/portraits/chujin/anxious.png",
    "Anxious Stressed": "assets/portraits/chujin/anxious-stressed.png",
    "Look Down Stressed": "assets/portraits/chujin/look-down-stressed.png",
    "No Hands": "assets/portraits/chujin/no-hands.png",
    "Take Glasses": "assets/portraits/chujin/take-glasses.png",
    "Take Glasses Stressed": "assets/portraits/chujin/take-glasses-stressed.png",
    "No Eyes": "assets/portraits/chujin/no-eyes.png",
    "Turn Left": "assets/portraits/chujin/turn-left.png",
    "Turn Right": "assets/portraits/chujin/turn-right.png",
    "Turn Right Finger Up": "assets/portraits/chujin/turn-right-finger-up.png",
    "Look Down": "assets/portraits/chujin/look-down.png",
    "Look Left": "assets/portraits/chujin/look-left.png",
    "Lower Head": "assets/portraits/chujin/lower-head.png",
    "Lower Head Lower": "assets/portraits/chujin/lower-head-lower.png",
    "Misery": "assets/portraits/chujin/misery.png",
}

// GLOBAL VARIABLES

let TIME = 0;

// LIFECYCLE FUNCTIONS

document.addEventListener("DOMContentLoaded", function(event) {
    init();
    setInterval(() => {update(UPDATE_FREQUENCY)}, UPDATE_FREQUENCY * 1000);
});

document.addEventListener('click', function (event) {
    typewriterProceedPressed();
});

function init() {
    setPortraitImage(PORTRAIT_PATHS[DEFAULT_PORTRAIT]);
    setTimeout(() => {
        typewriterSetScript("This is [Pause 0.2][Portrait Look Down]*ugh*[Pause 0.2][Portrait Normal] Chujin.\n\n[Portrait Misery]...I have not made much progress,\nand my time is about to run out.\n\n[Portrait Normal]That is all.");
    }, INITIAL_STATIC_DELAY * 1000);
}

function update(delta) {
    tapeOverlayUpdateOpacity(delta);
    typewriterUpdate(delta);
    TIME += delta;
}

// TAPE OVERLAY

let tapeOverlayNextTargetOpacityUpdate = 0;
let tapeOverlayTargetOpacity = 0;

function tapeOverlayUpdateOpacity(delta) {
    if(TIME > tapeOverlayNextTargetOpacityUpdate) {
        tapeOverlayUpdateTargetOpacity();

        if(tapeOverlayTargetOpacity > TAPE_OVERLAY_ELEMENT.style.opacity) {
            TAPE_OVERLAY_ELEMENT.style.opacity = lerp(TAPE_OVERLAY_ELEMENT.style.opacity, tapeOverlayTargetOpacity, 0.5);
        }

        tapeOverlayNextTargetOpacityUpdate += TAPE_OVERLAY_TARGET_OPACITY_UPDATE_FREQUENCY;
    }

    TAPE_OVERLAY_ELEMENT.style.opacity = lerp(TAPE_OVERLAY_ELEMENT.style.opacity, tapeOverlayTargetOpacity, TAPE_OVERLAY_OPACITY_LERP_SPEED * delta);
}

function tapeOverlayUpdateTargetOpacity() {
    // I couldn't explain what's going on here either, I wrote this by pure trial and error
    tapeOverlayTargetOpacity = Math.max(Math.min(1 - Math.pow(Math.random() * 4, 2), TAPE_OVERLAY_TARGET_OPACITY_MAXIMUM), TAPE_OVERLAY_TARGET_OPACITY_MINIMUM);
}

// PORTRAIT

function setPortraitImage(path) {
    PORTRAIT_ELEMENT.src = path;
}

// TEXT TYPEWRITER EFFECT

let typewriterPages = [];
let typewriterCommandBuffer = [];
let typewriterPageFinished = false;
let typewriterCurrentPage = 0;
let typewriterTime = 0;
let typewriterRemainingPause = 0;
let typewriterAutoAdvanceTimeout = undefined;

class TypewriterCommand {
    constructor(time, command) {
        this.time = time;
        this.command = command;
    }
}

function typewriterSetScript(script) {
    typewriterCurrentPage = 0;

    let rawPages = script.split('\n\n');
    for (let i = 0; i < rawPages.length; i++) {
        let page = rawPages[i];
        if (page.trim() !== '') {
            typewriterPages.push(page);
        }
    }

    if(typewriterPages.length > 0) typewriterSetPage(typewriterPages[0]);
}

function typewriterSetPage(text) {
    TEXT_WRAPPER_ELEMENT.innerHTML = "";
    typewriterTime = 0;

    typewriterPageFinished = false;

    typewriterParsePage(text);
}

function typewriterParsePage(text) {
    let commandBuffer = [];
    let time = 0;

    let characters = text.split('');
    for (let i = 0; i < characters.length; i++) {
        let character = characters[i];

        if(character === '[' && i < characters.length && (i === 0 || characters[i - 1] !== '\\')) {
            let direction = "";

            let j = 1;
            let firstSpaceIndex = undefined;
            while(i + j < characters.length && characters[i + j] !== ']') {
                if(characters[i + j] === ' ' && firstSpaceIndex === undefined) firstSpaceIndex = j - 1;

                direction += characters[i + j];
                j++;
            }

            let directionName = direction.substring(0, firstSpaceIndex);
            let directionArgs = direction.substring(firstSpaceIndex + 1);
            if(TYPEWRITER_DIRECTIONS.hasOwnProperty(directionName)) {
                let command = TYPEWRITER_DIRECTIONS[directionName](directionArgs);
                commandBuffer.push(new TypewriterCommand(time, command));
                i += j;
                continue;
            }
        }

        let element;
        if(character === '\n') {
            element = document.createElement("br");
        } else {
            element = document.createElement("span");
            element.innerHTML = character;
            element.style.opacity = 0;
        }

        TEXT_WRAPPER_ELEMENT.appendChild(element);

        commandBuffer.push(new TypewriterCommand(time, typewriterPrintCommand(element)));
        if (typewriterShouldPlaySound(character)) commandBuffer.push(new TypewriterCommand(time, typewriterPlayTalkSoundCommand(character)));

        let pause = typewriterGetPause(character);
        time += pause;
    }

    commandBuffer.push(new TypewriterCommand(time, typewriterPageFinishedCommand()));
    typewriterCommandBuffer = commandBuffer;
}

function typewriterGetPause(character) {
    let pause;
    if(TYPEWRITER_CHARACTER_PAUSE_MULTIPLIERS.hasOwnProperty(character)) {
        pause = TYPEWRITER_DEFAULT_PAUSE * TYPEWRITER_CHARACTER_PAUSE_MULTIPLIERS[character];
    } else {
        pause = TYPEWRITER_DEFAULT_PAUSE;
    }

    return pause;
}

function typewriterShouldPlaySound(character) {
    return false; // TODO check if a talk sound should be played for the current character
}

function typewriterUpdate(delta) {
    while(typewriterCommandBuffer.length > 0) {
        if(typewriterRemainingPause > 0) {
            typewriterRemainingPause -= delta;
            typewriterRemainingPause = Math.max(typewriterRemainingPause, 0);

            return;
        }

        if(typewriterPageFinished) break;
        if(typewriterCommandBuffer[0].time > typewriterTime) break;

        let command = typewriterCommandBuffer.shift().command;
        command();
    }

    typewriterTime += delta;
}

// TYPEWRITER COMMANDS

function typewriterPrintCommand(element) {
    return () => { element.style.opacity = 1; }
}

function typewriterPageFinishedCommand() {
    return () => {
        typewriterPageFinished = true;

        if(typewriterCurrentPage === typewriterPages.length - 1) {
            typewriterMessageEnd();
        } else {
            typewriterAutoAdvance();
        }
    }
}

function typewriterPlayTalkSoundCommand() {
    return () => {  }; // TODO play the talk sound
}

function typewriterAddPauseCommand(pauseDuration) {
    return () => { typewriterRemainingPause += pauseDuration; }
}

// TYPEWRITER PROCESS PROCEED INPUT

function typewriterProceedPressed() {
    if(typewriterPageFinished) {
        typewriterNextPage();
    } else {
        typewriterSkipToEndOfPage();
    }

    clearTimeout(typewriterAutoAdvanceTimeout);
}

function typewriterSkipToEndOfPage() {
    typewriterPageFinished = true;

    while(typewriterCommandBuffer.length > 0) {
        let command = typewriterCommandBuffer.shift().command;
        command();
    }
}

function typewriterNextPage() {
    typewriterCurrentPage++;

    if(typewriterCurrentPage < typewriterPages.length) {
        typewriterSetPage(typewriterPages[typewriterCurrentPage]);
        typewriterPageFinished = false;
    } else {
        typewriterMessageEnd();
    }
}

function typewriterAutoAdvance() {
    typewriterAutoAdvanceTimeout = setTimeout(() => {
        typewriterNextPage();
    }, TYPEWRITER_AUTO_ADVANCE_DELAY * 1000)
}

function typewriterMessageEnd() {
    setTimeout(() => {
        END_STATIC_OVERLAY_WRAPPER_ELEMENT.style.display = "unset";
    }, MESSAGE_END_STATIC_DELAY * 1000);
}

// UTILITY FUNCTIONS
function lerp(a, b, t){
    return (1 - t) * a + t * b;
}