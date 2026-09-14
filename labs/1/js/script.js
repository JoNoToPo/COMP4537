// js/script.js
//
// Disclosure: this file was produced with the assistance of an AI
// assistant (Claude). The overall design, class breakdown and logic
// were reviewed and are understood by the author.
//
// Everything below lives inside a class, except the few lines at the
// very bottom that wire the classes together to start the app.

import { USER_STRINGS } from "../lang/messages/en/strings.js";

/**
 * Validates the "how many buttons" input against an inclusive range.
 * Single responsibility: turning raw user input into a trustworthy number.
 */
class InputValidator {
    constructor(minValue, maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    validate(rawValue) {
        const trimmedValue = String(rawValue).trim();

        if (trimmedValue === "") {
            return { isValid: false };
        }

        const parsedNumber = Number(trimmedValue);
        const isWholeNumber = Number.isInteger(parsedNumber);
        const isInRange = parsedNumber >= this.minValue && parsedNumber <= this.maxValue;

        if (!isWholeNumber || !isInRange) {
            return { isValid: false };
        }

        return { isValid: true, value: parsedNumber };
    }
}

/**
 * Represents a single memory-game button: its identity (original order),
 * its color, its DOM element, and the behaviours it supports (moving,
 * revealing/hiding its number, becoming clickable).
 */
class GameButton {
    constructor(order, colorValue) {
        this.order = order;
        this.colorValue = colorValue;
        this.element = document.createElement("button");
        this.element.type = "button";
        this.element.className = "memory-button";
        this.element.style.backgroundColor = this.colorValue;
        this.revealNumber();
    }

    static generateRandomColor() {
        const redChannel = Math.floor(Math.random() * 256);
        const greenChannel = Math.floor(Math.random() * 256);
        const blueChannel = Math.floor(Math.random() * 256);
        return `rgb(${redChannel}, ${greenChannel}, ${blueChannel})`;
    }

    revealNumber() {
        this.element.textContent = String(this.order);
    }

    hideNumber() {
        this.element.textContent = "";
    }

    moveTo(leftPx, topPx) {
        this.element.classList.add("scrambled");
        this.element.style.left = `${leftPx}px`;
        this.element.style.top = `${topPx}px`;
    }

    setClickable(isClickable) {
        this.element.classList.toggle("clickable", isClickable);
    }

    attachClickHandler(handlerFn) {
        this.element.addEventListener("click", handlerFn);
    }

    getWidthPx() {
        return this.element.offsetWidth;
    }

    getHeightPx() {
        return this.element.offsetHeight;
    }
}

/**
 * Owns every DOM lookup and DOM mutation for the page chrome (label,
 * input, Go button, status/error text, button container). GameEngine
 * never touches document.* directly; it goes through this class.
 */
class UIManager {
    constructor() {
        this.labelElement = document.getElementById("numButtonsLabel");
        this.inputElement = document.getElementById("numButtonsInput");
        this.goButtonElement = document.getElementById("goButton");
        this.errorElement = document.getElementById("errorMessage");
        this.statusElement = document.getElementById("statusMessage");
        this.containerElement = document.getElementById("buttonContainer");

        this.applyStaticText();
    }

    applyStaticText() {
        document.title = USER_STRINGS.PAGE_TITLE;
        this.labelElement.textContent = USER_STRINGS.LABEL_NUM_BUTTONS;
        this.goButtonElement.textContent = USER_STRINGS.BUTTON_GO;
    }

    onGoClicked(handlerFn) {
        this.goButtonElement.addEventListener("click", () => {
            handlerFn(this.inputElement.value);
        });
    }

    showError(message) {
        this.errorElement.textContent = message;
    }

    clearError() {
        this.errorElement.textContent = "";
    }

    showStatus(message) {
        this.statusElement.textContent = message;
    }

    clearStatus() {
        this.statusElement.textContent = "";
    }

    clearButtonContainer() {
        this.containerElement.innerHTML = "";
    }

    appendButton(gameButton) {
        this.containerElement.appendChild(gameButton.element);
    }

    getWindowDimensions() {
        return { width: window.innerWidth, height: window.innerHeight };
    }
}

/**
 * Runs the actual game: creating buttons, timing the pause/scramble
 * sequence, tracking the expected click order, and deciding win/lose.
 */
class GameEngine {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.inputValidator = new InputValidator(3, 7);
        this.buttons = [];
        this.expectedIndex = 0;
        this.sessionId = 0;
        this.isGameOver = true;
    }

    handleGoPressed(rawValue) {
        const validationResult = this.inputValidator.validate(rawValue);

        if (!validationResult.isValid) {
            this.uiManager.showError(USER_STRINGS.ERROR_REQUIRED_RANGE);
            return;
        }

        this.uiManager.clearError();
        this.startNewGame(validationResult.value);
    }

    startNewGame(numberOfButtons) {
        // Bumping the session id invalidates any pending timers/loops
        // from a previous, still-running game (removed "from memory").
        this.sessionId += 1;
        const currentSessionId = this.sessionId;

        this.isGameOver = false;
        this.expectedIndex = 0;

        this.uiManager.clearButtonContainer();
        this.uiManager.clearStatus();

        this.buttons = this.createButtons(numberOfButtons);
        this.buttons.forEach((gameButton) => this.uiManager.appendButton(gameButton));

        this.uiManager.showStatus(USER_STRINGS.MSG_MEMORIZE_ORDER);

        this.runScrambleSequence(numberOfButtons, currentSessionId);
    }

    createButtons(numberOfButtons) {
        const newButtons = [];
        for (let orderIndex = 1; orderIndex <= numberOfButtons; orderIndex += 1) {
            const randomColor = GameButton.generateRandomColor();
            newButtons.push(new GameButton(orderIndex, randomColor));
        }
        return newButtons;
    }

    sleep(durationMs) {
        return new Promise((resolve) => setTimeout(resolve, durationMs));
    }

    async runScrambleSequence(numberOfButtons, currentSessionId) {
        // Initial pause: n seconds for n buttons, buttons stay in their row.
        await this.sleep(numberOfButtons * 1000);
        if (currentSessionId !== this.sessionId) {
            return;
        }

        this.uiManager.showStatus(USER_STRINGS.MSG_SCRAMBLING);

        // Move the buttons n times, two seconds apart, re-reading the
        // current window size immediately before every move so buttons
        // always land inside the *current* browser window.
        for (let roundIndex = 0; roundIndex < numberOfButtons; roundIndex += 1) {
            if (currentSessionId !== this.sessionId) {
                return;
            }
            this.scrambleButtonsOnce();
            await this.sleep(2000);
            if (currentSessionId !== this.sessionId) {
                return;
            }
        }

        this.finishScrambling(currentSessionId);
    }

    scrambleButtonsOnce() {
        const { width, height } = this.uiManager.getWindowDimensions();

        this.buttons.forEach((gameButton) => {
            const buttonWidth = gameButton.getWidthPx();
            const buttonHeight = gameButton.getHeightPx();
            const maxLeft = Math.max(width - buttonWidth, 0);
            const maxTop = Math.max(height - buttonHeight, 0);
            const randomLeft = Math.floor(Math.random() * (maxLeft + 1));
            const randomTop = Math.floor(Math.random() * (maxTop + 1));
            gameButton.moveTo(randomLeft, randomTop);
        });
    }

    finishScrambling(currentSessionId) {
        this.buttons.forEach((gameButton) => {
            gameButton.hideNumber();
            gameButton.setClickable(true);
            gameButton.attachClickHandler(() => this.handleButtonClicked(gameButton, currentSessionId));
        });

        this.uiManager.showStatus(USER_STRINGS.MSG_YOUR_TURN);
    }

    handleButtonClicked(gameButton, currentSessionId) {
        if (currentSessionId !== this.sessionId || this.isGameOver) {
            return;
        }

        const expectedOrder = this.expectedIndex + 1;

        if (gameButton.order === expectedOrder) {
            gameButton.revealNumber();
            gameButton.setClickable(false);
            this.expectedIndex += 1;

            if (this.expectedIndex === this.buttons.length) {
                this.endGame(USER_STRINGS.MSG_EXCELLENT);
            }
        } else {
            this.revealAllButtons();
            this.endGame(USER_STRINGS.MSG_WRONG_ORDER);
        }
    }

    revealAllButtons() {
        this.buttons.forEach((gameButton) => gameButton.revealNumber());
    }

    endGame(message) {
        this.isGameOver = true;
        this.buttons.forEach((gameButton) => gameButton.setClickable(false));
        this.uiManager.showStatus(message);
    }
}

// --- Starting point of the program (intentionally outside any class) ---
const uiManager = new UIManager();
const gameEngine = new GameEngine(uiManager);
uiManager.onGoClicked((rawValue) => gameEngine.handleGoPressed(rawValue));