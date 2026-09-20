// js/readerMain.js
//
// Starting point for reader.html (intentionally outside any class): wires
// the DOM elements and the NoteStorage together and hands them to
// ReaderApp, which does everything else.

import { NoteStorage, NOTES_STORAGE_KEY } from "./noteStorage.js";
import { ReaderApp } from "./readerApp.js";

const noteStorage = new NoteStorage(NOTES_STORAGE_KEY);

new ReaderApp(noteStorage, {
    notesListElement: document.getElementById("notesList"),
    backButtonElement: document.getElementById("backButton"),
    lastRetrievedElement: document.getElementById("lastRetrievedDisplay")
});
