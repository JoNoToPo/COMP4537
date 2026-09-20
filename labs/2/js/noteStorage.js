// js/noteStorage.js
//
// Wraps all reading/writing of the notes array to HTML5 localStorage.
// Both writer.html and reader.html use the same class (with the same
// storage key) so the serialization format only exists in one place.

// Not a user-facing string, so it does not belong in the messages file -
// it is just the internal localStorage key, defined once here so writer
// and reader can never accidentally drift onto different keys.
export const NOTES_STORAGE_KEY = "comp4537_lab2_notes";

export class NoteStorage {
    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    // Returns an array of plain data objects: [{ text: "..." }, ...]
    loadNotes() {
        const rawValue = localStorage.getItem(this.storageKey);

        if (!rawValue) {
            return [];
        }

        try {
            const parsedValue = JSON.parse(rawValue);
            return Array.isArray(parsedValue) ? parsedValue : [];
        } catch (parseError) {
            return [];
        }
    }

    // Accepts an array of plain data objects and serializes it to JSON.
    saveNotes(noteDataArray) {
        localStorage.setItem(this.storageKey, JSON.stringify(noteDataArray));
    }
}
