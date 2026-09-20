// js/writerMain.js
//
// Starting point for writer.html (intentionally outside any class): wires
// the DOM elements and the NoteStorage together and hands them to
// WriterApp, which does everything else.

import { NoteStorage, NOTES_STORAGE_KEY } from "./noteStorage.js";
import { WriterApp } from "./writerApp.js";

const noteStorage = new NoteStorage(NOTES_STORAGE_KEY);

new WriterApp(noteStorage, {
    notesContainerElement: document.getElementById("notesContainer"),
    addButtonElement: document.getElementById("addButton"),
    backButtonElement: document.getElementById("backButton"),
    lastSavedElement: document.getElementById("lastSavedDisplay")
});
