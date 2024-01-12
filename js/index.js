// DOM ELEMENTS

const PORTRAIT_ELEMENT = document.getElementById("portrait");
const TAPE_OVERLAY_ELEMENT = document.getElementById("tape-overlay");
const INITIAL_STATIC_OVERLAY_WRAPPER_ELEMENT = document.getElementById("initial-static-overlay-wrapper")
const END_STATIC_OVERLAY_WRAPPER_ELEMENT = document.getElementById("end-static-overlay-wrapper");
const TEXT_WRAPPER_ELEMENT = document.getElementById("text-wrapper");
const REPLAY_CONTAINER_ELEMENT = document.getElementById("replay-container");

//const PLAY_TOGGLE_CHECKBOX_ELEMENT = document.getElementById("play-toggle");
//const PLAY_TOGGLE_PLAY_ICON_ELEMENT = document.getElementById("play-toggle-play-icon");
//const PLAY_TOGGLE_PAUSE_ICON_ELEMENT = document.getElementById("play-toggle-pause-icon");
const MUTE_TOGGLE_CHECKBOX_ELEMENT = document.getElementById("mute-toggle");
const MUTE_TOGGLE_MUTE_ICON_ELEMENT = document.getElementById("mute-toggle-mute-icon");
const MUTE_TOGGLE_UNMUTE_ICON_ELEMENT = document.getElementById("mute-toggle-unmute-icon");

// MISC CONSTANTS

const UPDATE_FREQUENCY = 1/30;

const INITIAL_STATIC_DELAY = 0.8;
const MESSAGE_END_STATIC_DELAY = 2.0;
const MESSAGE_END_REPLAY_OVERLAY_DELAY = 3.0;

const TAPE_OVERLAY_TARGET_OPACITY_UPDATE_FREQUENCY = 1/2;
const TAPE_OVERLAY_TARGET_OPACITY_MINIMUM = 0.1;
const TAPE_OVERLAY_TARGET_OPACITY_MAXIMUM = 0.7;
const TAPE_OVERLAY_OPACITY_LERP_SPEED = 15;

// TYPEWRITER CONFIGURATION

const TYPEWRITER_PROCEED_COOLDOWN = 0.1;
const TYPEWRITER_BASE_AUTO_ADVANCE_DELAY = 1.5;
const TYPEWRITER_PER_CHARACTER_AUTO_ADVANCE_DELAY = 0.015;
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
            return () => {};
        } else {
            return typewriterAddPauseCommand(parsedDuration);
        }
    },

    "Speed": (arg) => {
        let parsedSpeed = Number.parseFloat(arg);
        if(!Number.isNaN(parsedSpeed)) {
            typewriterCurrentTalkSpeedMultiplier = parsedSpeed;
        }

        return () => {};
    },

    "Portrait": (arg) => {
        return () => {
            if(PORTRAIT_PATHS.hasOwnProperty(arg)) {
                setPortraitImage(PORTRAIT_PATHS[arg]);
            } else {
                setPortraitImage(arg);
            }
        }
    },

    "Voice": (arg) => {
        return () => {
            if(VOICE_PATHS.hasOwnProperty(arg)) {
                setVoice(VOICE_PATHS[arg]);
            } else {
                setVoice(arg)
            }
        }
    },

    "Music": (arg) => {
        return () => {
            if(arg === "Default") {
                setMusic(DEFAULT_BGM_PATH);
            }
            else if(arg === "Pause") {
                BGM_INSTANCE.pause();
            }
            else if(arg === "Play") {
                BGM_INSTANCE.play();
            }
            else if(arg === "Reset") {
                BGM_INSTANCE.pause();
                BGM_INSTANCE.currentTime = 0;
                BGM_INSTANCE.play();
            }
            else {
                setMusic(arg);
            }
        }
    },

    "Static": (arg) => {
        return () => {
            if(arg === "On") {
                tapeOverlayEnabled = true;
            } else if(arg === "Off") {
                tapeOverlayEnabled = false;
            }
        }
    }
};

const DEFAULT_PORTRAIT = "Normal";
const PORTRAIT_PATHS = {
    "Normal": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/normal.png",
    "Stressed": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/stressed.png",
    "Anxious": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/anxious.png",
    "Anxious Stressed": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/anxious-stressed.png",
    "Look Down Stressed": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/look-down-stressed.png",
    "No Hands": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/no-hands.png",
    "Take Glasses": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/take-glasses.png",
    "Take Glasses Stressed": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/take-glasses-stressed.png",
    "Creepy": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/creepy.png",
    "Turn Left": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/turn-left.png",
    "Turn Right": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/turn-right.png",
    "Turn Right Finger Up": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/turn-right-finger-up.png",
    "Look Down": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/look-down.png",
    "Look Left": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/look-left.png",
    "Lower Head": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/lower-head.png",
    "Lower Head Lower": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/lower-head-lower.png",
    "Misery": "https://toadsworthlp.github.io/ThisIsChujin/assets/portraits/chujin/misery.png",
}

// AUDIO PATHS

const VOICE_PATHS = {
    "Chujin": "https://toadsworthlp.github.io/ThisIsChujin/assets/sounds/talk/chujin.wav",
    "Axis": "https://toadsworthlp.github.io/ThisIsChujin/assets/sounds/talk/axis.wav",
    "Ceroba": "https://toadsworthlp.github.io/ThisIsChujin/assets/sounds/talk/ceroba.wav",
    "Kanako": "https://toadsworthlp.github.io/ThisIsChujin/assets/sounds/talk/kanako.wav",
    "Other": "https://toadsworthlp.github.io/ThisIsChujin/assets/sounds/talk/other.wav"
}

const DEFAULT_BGM_PATH = "https://toadsworthlp.github.io/ThisIsChujin/assets/sounds/bgm/nothing-but-the-truth.mp3";
const DEFAULT_TALK_SOUND_PATH = VOICE_PATHS["Chujin"];
const STATIC_SOUND_PATH = "https://toadsworthlp.github.io/ThisIsChujin/assets/sounds/sfx/static.wav";
const GLITCH_SOUND_PATH = "https://toadsworthlp.github.io/ThisIsChujin/assets/sounds/sfx/glitch.wav";

// AUDIO CONFIGURATION

const BGM_BASE_VOLUME = 1.0;
const TALK_SOUND_BASE_VOLUME = 0.7;
const STATIC_SOUND_BASE_VOLUME = 0.5;
const GLITCH_SOUND_BASE_VOLUME = 0.3;

const INITIAL_STATIC_SOUND_DURATION = 0.3;

const TALK_SOUND_EXCLUDED_CHARACTERS = [' ', '.']

// AUDIO INSTANCES

let STATIC_SOUND_INSTANCE;
let GLITCH_SOUND_INSTANCE;
let BGM_INSTANCE;
let TALK_SOUND_INSTANCE;

// COOKIE NAMES

const AUDIO_MUTED_COOKIE_NAME = "muted";

// GLOBAL VARIABLES

let TIME = 0
let MESSAGE_OVER = false;
let AUDIO_MUTED = false;
let ALLOW_REPLAY = false;
let DISABLE_PROCEED_INPUT = false;

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
    initAudio();
    let script;

    try {
        script = loadScriptFromUrl();
        onScriptLoaded(script)
    } catch (e) {
        STATIC_SOUND_INSTANCE.play();
        return;
    }
}

function onScriptLoaded(script) {
    playInitialStaticSound(INITIAL_STATIC_SOUND_DURATION);

    setTimeout(() => {
        typewriterSetScript(script);
    }, INITIAL_STATIC_DELAY * 1000);
}

function update(delta) {
    tapeOverlayUpdateOpacity(delta);
    typewriterUpdate(delta);
    TIME += delta;
}

function reset() {
    INITIAL_STATIC_OVERLAY_WRAPPER_ELEMENT.style.animation = "none";
    INITIAL_STATIC_OVERLAY_WRAPPER_ELEMENT.offsetHeight;
    INITIAL_STATIC_OVERLAY_WRAPPER_ELEMENT.style.animation = null;

    END_STATIC_OVERLAY_WRAPPER_ELEMENT.style.display = "none";

    TIME = 0;
    MESSAGE_OVER = false;
    ALLOW_REPLAY = false;
    DISABLE_PROCEED_INPUT = false;

    typewriterReset();
    tapeOverlayReset();
    setVoice(DEFAULT_TALK_SOUND_PATH);
    setMusic(DEFAULT_BGM_PATH);

    init();
}

// SCRIPT LOADING

function loadScriptFromUrl() {
    return parseShareableUrl(window.location.href);
}

// BUTTONS

function toggleMuted(checkboxElement) {
    if(checkboxElement.checked) {
        MUTE_TOGGLE_MUTE_ICON_ELEMENT.style.display = "unset";
        MUTE_TOGGLE_UNMUTE_ICON_ELEMENT.style.display = "none";

        setAudioMuted(true);
    } else {
        MUTE_TOGGLE_MUTE_ICON_ELEMENT.style.display = "none";
        MUTE_TOGGLE_UNMUTE_ICON_ELEMENT.style.display = "unset";

        setAudioMuted(false);
    }
}

function clickRestartButton() {
    if(ALLOW_REPLAY) {
        REPLAY_CONTAINER_ELEMENT.style.display = "none";
        reset();
    }
}

function toggleAutoAdvance(checkboxElement) {
    // TODO add this (using setAutoAdvance())
}

// AUDIO

let currentGlobalVolume;
let bgmStartInterval;

function initAudio() {
    AUDIO_MUTED = isAudioMutedByCookie();
    MUTE_TOGGLE_CHECKBOX_ELEMENT.checked = AUDIO_MUTED;
    toggleMuted(MUTE_TOGGLE_CHECKBOX_ELEMENT);

    if(STATIC_SOUND_INSTANCE === undefined) STATIC_SOUND_INSTANCE = new Audio(STATIC_SOUND_PATH);
    if(GLITCH_SOUND_INSTANCE === undefined) GLITCH_SOUND_INSTANCE = new Audio(GLITCH_SOUND_PATH);
    if(BGM_INSTANCE === undefined) BGM_INSTANCE = new Audio(DEFAULT_BGM_PATH);
    if(TALK_SOUND_INSTANCE === undefined) TALK_SOUND_INSTANCE = new Audio(DEFAULT_TALK_SOUND_PATH);

    setAudioVolume(AUDIO_MUTED ? 0 : 1);

    BGM_INSTANCE.loop = true;

    attemptToStartBgm();
    bgmStartInterval = setInterval(attemptToStartBgm, 500);
}

function attemptToStartBgm() {
    if(!AUDIO_MUTED) {
        BGM_INSTANCE.play();

        if(BGM_INSTANCE.currentTime > 0.01) {
            clearInterval(bgmStartInterval);
        }
    }
}

function playInitialStaticSound() {
    STATIC_SOUND_INSTANCE.play();

    setTimeout(() => {
        STATIC_SOUND_INSTANCE.volume = 0;
    }, INITIAL_STATIC_SOUND_DURATION * 1000)
}

function playEndStaticSound() {
    STATIC_SOUND_INSTANCE.loop = false;
    STATIC_SOUND_INSTANCE.play();
    STATIC_SOUND_INSTANCE.volume = STATIC_SOUND_BASE_VOLUME * currentGlobalVolume;
}

function setAudioVolume(volume) {
    currentGlobalVolume = volume;

    if(STATIC_SOUND_INSTANCE !== undefined) STATIC_SOUND_INSTANCE.volume = STATIC_SOUND_BASE_VOLUME * volume;
    if(GLITCH_SOUND_INSTANCE !== undefined) GLITCH_SOUND_INSTANCE.volume = GLITCH_SOUND_BASE_VOLUME * volume;
    if(BGM_INSTANCE !== undefined) BGM_INSTANCE.volume = BGM_BASE_VOLUME * volume;
    if(TALK_SOUND_INSTANCE !== undefined) TALK_SOUND_INSTANCE.volume = TALK_SOUND_BASE_VOLUME * volume;
}

function setAudioMuted(muted) {
    if(muted) {
        setAudioVolume(0.0);
        setCookie(AUDIO_MUTED_COOKIE_NAME, "true", 365);
    } else {
        setAudioVolume(1.0);
        setCookie(AUDIO_MUTED_COOKIE_NAME, "false", 365);
    }
}

function isAudioMutedByCookie() {
    let cookie = getCookie(AUDIO_MUTED_COOKIE_NAME)
    return cookie === "true";
}

function setVoice(path) {
    TALK_SOUND_INSTANCE.src = path;
}

function setMusic(path) {
    BGM_INSTANCE.pause();
    BGM_INSTANCE.currentTime = 0;
    BGM_INSTANCE.src = path;
    BGM_INSTANCE.play();
}

// TAPE OVERLAY

let tapeOverlayEnabled = true;
let tapeOverlayNextTargetOpacityUpdate = 0;
let tapeOverlayTargetOpacity = 0;

function tapeOverlayUpdateOpacity(delta) {
    if(!tapeOverlayEnabled) {
        TAPE_OVERLAY_ELEMENT.style.opacity = 0;
        return;
    }

    if(TIME > tapeOverlayNextTargetOpacityUpdate) {
        tapeOverlayUpdateTargetOpacity();

        if(tapeOverlayTargetOpacity > TAPE_OVERLAY_ELEMENT.style.opacity) {
            TAPE_OVERLAY_ELEMENT.style.opacity = lerp(TAPE_OVERLAY_ELEMENT.style.opacity, tapeOverlayTargetOpacity, 0.75);

            if(!MESSAGE_OVER) {
                GLITCH_SOUND_INSTANCE.currentTime = 0;
                GLITCH_SOUND_INSTANCE.play();
            }
        }

        tapeOverlayNextTargetOpacityUpdate += TAPE_OVERLAY_TARGET_OPACITY_UPDATE_FREQUENCY;
    }

    TAPE_OVERLAY_ELEMENT.style.opacity = lerp(TAPE_OVERLAY_ELEMENT.style.opacity, tapeOverlayTargetOpacity, TAPE_OVERLAY_OPACITY_LERP_SPEED * delta);
}

function tapeOverlayUpdateTargetOpacity() {
    // I couldn't explain what's going on here either, I wrote this by pure trial and error
    tapeOverlayTargetOpacity = Math.max(Math.min(1 - Math.pow(Math.random() * 4, 2), TAPE_OVERLAY_TARGET_OPACITY_MAXIMUM), TAPE_OVERLAY_TARGET_OPACITY_MINIMUM);
}

function tapeOverlayReset() {
    tapeOverlayNextTargetOpacityUpdate = 0;
    tapeOverlayTargetOpacity = 0;
    tapeOverlayEnabled = true;
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
let typewriterEndStaticDisplayTimeout = undefined;
let typewriterReplayDisplayTimeout = undefined;
let typewriterLastProceedPressTime = -TYPEWRITER_PROCEED_COOLDOWN;
let typewriterCurrentPagePrintableCharacters = 0;
let typewriterCurrentTalkSpeedMultiplier = 1.0;

class TypewriterCommand {
    constructor(time, command) {
        this.time = time;
        this.command = command;
    }
}

function typewriterSetScript(script) {
    let rawPages = script.split('\n\n');
    for (let i = 0; i < rawPages.length; i++) {
        let page = rawPages[i];
        if (page.trim() !== '') {
            typewriterPages.push(page);
        }
    }

    if(typewriterPages.length > 0) typewriterSetPage(typewriterPages[0]);
}

function typewriterReset() {
    typewriterPages = [];
    typewriterCommandBuffer = [];
    typewriterPageFinished = false;
    typewriterCurrentPage = 0;
    typewriterTime = 0;
    typewriterRemainingPause = 0;
    typewriterLastProceedPressTime = -TYPEWRITER_PROCEED_COOLDOWN;
    typewriterCurrentPagePrintableCharacters = 0;
    typewriterCurrentTalkSpeedMultiplier = 1.0;

    clearTimeout(typewriterAutoAdvanceTimeout);
    clearTimeout(typewriterEndStaticDisplayTimeout);
    clearTimeout(typewriterReplayDisplayTimeout);

    typewriterAutoAdvanceTimeoutRunningAlready = false;
    typewriterMessageEndTimeoutRunningAlready = false;
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
    let printableChars = 0;

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
        printableChars++;

        commandBuffer.push(new TypewriterCommand(time, typewriterPrintCommand(element)));
        if (typewriterShouldPlaySound(character)) commandBuffer.push(new TypewriterCommand(time, typewriterPlayTalkSoundCommand(character)));

        let pause = typewriterGetPause(character);
        time += pause;
    }

    commandBuffer.push(new TypewriterCommand(time, typewriterPageFinishedCommand()));
    typewriterCurrentPagePrintableCharacters = printableChars;
    typewriterCommandBuffer = commandBuffer;
}

function typewriterGetPause(character) {
    let pause;
    if(TYPEWRITER_CHARACTER_PAUSE_MULTIPLIERS.hasOwnProperty(character)) {
        pause = TYPEWRITER_DEFAULT_PAUSE * TYPEWRITER_CHARACTER_PAUSE_MULTIPLIERS[character];
    } else {
        pause = TYPEWRITER_DEFAULT_PAUSE;
    }

    return pause * (1 / typewriterCurrentTalkSpeedMultiplier);
}

function typewriterShouldPlaySound(character) {
    return !TALK_SOUND_EXCLUDED_CHARACTERS.includes(character)
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

function setAutoAdvance(enabled) {
    if(enabled) {
        typewriterAutoAdvance();
    } else {
        clearTimeout(typewriterAutoAdvanceTimeout);
    }
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
    return () => {
        TALK_SOUND_INSTANCE.currentTime = 0;
        TALK_SOUND_INSTANCE.play();
    };
}

function typewriterAddPauseCommand(pauseDuration) {
    return () => { typewriterRemainingPause += pauseDuration; }
}

// TYPEWRITER PROCESS PROCEED INPUT

function typewriterProceedPressed() {
    if(!DISABLE_PROCEED_INPUT) {
        if(typewriterLastProceedPressTime + TYPEWRITER_PROCEED_COOLDOWN > TIME) return;

        typewriterLastProceedPressTime = TIME;

        if(typewriterPageFinished) {
            if(typewriterAutoAdvanceTimeoutRunningAlready) {
                clearTimeout(typewriterAutoAdvanceTimeout);
                typewriterAutoAdvanceTimeoutRunningAlready = false;
            }

            typewriterNextPage();
        } else {
            typewriterSkipToEndOfPage();
        }
    }
}

function typewriterSkipToEndOfPage() {
    typewriterPageFinished = true;

    while(typewriterCommandBuffer.length > 0) {
        let command = typewriterCommandBuffer.shift().command;
        command();
    }
}

function typewriterNextPage() {
    if(typewriterPages.length === 0) return;

    if(typewriterCurrentPage + 1 < typewriterPages.length) {
        typewriterCurrentPage++;

        typewriterSetPage(typewriterPages[typewriterCurrentPage]);
        typewriterPageFinished = false;
    } else {
        typewriterMessageEnd();
    }
}

let typewriterAutoAdvanceTimeoutRunningAlready = false;
function typewriterAutoAdvance() {
    if(!typewriterAutoAdvanceTimeoutRunningAlready) {
        clearTimeout(typewriterAutoAdvanceTimeout);

        typewriterAutoAdvanceTimeout = setTimeout(() => {
            typewriterNextPage();
            typewriterAutoAdvanceTimeoutRunningAlready = false;
        }, (TYPEWRITER_BASE_AUTO_ADVANCE_DELAY + TYPEWRITER_PER_CHARACTER_AUTO_ADVANCE_DELAY * typewriterCurrentPagePrintableCharacters) * 1000)

        typewriterAutoAdvanceTimeoutRunningAlready = true;
    }
}

let typewriterMessageEndTimeoutRunningAlready = false;
function typewriterMessageEnd() {
    if(!typewriterMessageEndTimeoutRunningAlready) {
        MESSAGE_OVER = true;

        clearTimeout(typewriterEndStaticDisplayTimeout);
        clearTimeout(typewriterReplayDisplayTimeout);

        typewriterEndStaticDisplayTimeout = setTimeout(() => {
            playEndStaticSound();
            END_STATIC_OVERLAY_WRAPPER_ELEMENT.style.display = "unset";
        }, MESSAGE_END_STATIC_DELAY * 1000);

        typewriterReplayDisplayTimeout = setTimeout(() => {
            REPLAY_CONTAINER_ELEMENT.style.display = "flex";
            typewriterMessageEndTimeoutRunningAlready = false;
            ALLOW_REPLAY = true;
            DISABLE_PROCEED_INPUT = true;
        }, MESSAGE_END_REPLAY_OVERLAY_DELAY * 1000);

        typewriterMessageEndTimeoutRunningAlready = true;
    }
}

// UTILITY FUNCTIONS

function lerp(a, b, t){
    return (1 - t) * a + t * b;
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}