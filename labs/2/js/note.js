// js/note.js
import { USER_STRINGS } from "../lang/messages/en/user.js";

// A single note: encapsulates its own textarea, its own remove button,
// and the behaviour that belongs to them. One instance of this class is
// created per note, dynamically, in response to user actions (Add
// button, or an existing note found in localStorage) - never a fixed,
// pre-defined number of instances.
export class NoteItem {
    constructor(initialText, containerElement, onRemoveCallback) {
        this.onRemoveCallback = onRemoveCallback;

        this.rowElement = document.createElement("div");
        this.rowElement.className = "note-row";

        this.textAreaElement = document.createElement("textarea");
        this.textAreaElement.className = "note-textarea";
        this.textAreaElement.value = initialText;

        this.removeButtonElement = document.createElement("button");
        this.removeButtonElement.type = "button";
        this.removeButtonElement.className = "note-remove-button";
        this.removeButtonElement.textContent = USER_STRINGS.REMOVE_BUTTON;
        this.removeButtonElement.addEventListener("click", () => this.remove());

        this.rowElement.appendChild(this.textAreaElement);
        this.rowElement.appendChild(this.removeButtonElement);
        containerElement.appendChild(this.rowElement);
    }

    getText() {
        return this.textAreaElement.value;
    }

    // The shape that gets JSON-serialized into localStorage.
    toData() {
        return { text: this.getText() };
    }

    // Removes this note's DOM elements immediately and tells whoever
    // created this NoteItem that it is gone, so it can be dropped from
    // the in-memory array and persisted to storage right away.
    remove() {
        this.rowElement.remove();
        if (typeof this.onRemoveCallback === "function") {
            this.onRemoveCallback(this);
        }
    }
}
