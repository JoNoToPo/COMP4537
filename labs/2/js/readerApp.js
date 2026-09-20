// js/readerApp.js
import { USER_STRINGS } from "../lang/messages/en/user.js";

// Controls the reader.html page: renders whatever is currently in
// localStorage, refreshing on a 2-second timer (as required) and also
// instantly whenever another tab on the same origin changes storage,
// via the browser's native "storage" event - this is what lets reader
// update itself without the user ever refreshing the page.
export class ReaderApp {
    constructor(noteStorage, elements) {
        this.noteStorage = noteStorage;
        this.notesListElement = elements.notesListElement;
        this.backButtonElement = elements.backButtonElement;
        this.lastRetrievedElement = elements.lastRetrievedElement;

        this.applyStaticText();
        this.renderNotes();
        this.startPollingLoop();
        this.listenForCrossTabUpdates();
    }

    applyStaticText() {
        document.title = USER_STRINGS.PAGE_TITLE_READER;
        this.backButtonElement.textContent = USER_STRINGS.BACK_BUTTON;
    }

    renderNotes() {
        const storedNotes = this.noteStorage.loadNotes();
        this.notesListElement.innerHTML = "";

        if (storedNotes.length === 0) {
            const emptyMessageElement = document.createElement("p");
            emptyMessageElement.className = "empty-message";
            emptyMessageElement.textContent = USER_STRINGS.NO_NOTES_MESSAGE;
            this.notesListElement.appendChild(emptyMessageElement);
        } else {
            storedNotes.forEach((noteData) => {
                const noteElement = document.createElement("div");
                noteElement.className = "reader-note";
                noteElement.textContent = noteData.text;
                this.notesListElement.appendChild(noteElement);
            });
        }

        this.updateLastRetrievedDisplay();
    }

    updateLastRetrievedDisplay() {
        const now = new Date();
        this.lastRetrievedElement.textContent = USER_STRINGS.LAST_RETRIEVED_PREFIX + now.toLocaleTimeString();
    }

    startPollingLoop() {
        setInterval(() => this.renderNotes(), 2000);
    }

    listenForCrossTabUpdates() {
        window.addEventListener("storage", (storageEvent) => {
            if (storageEvent.key === this.noteStorage.storageKey) {
                this.renderNotes();
            }
        });
    }
}
