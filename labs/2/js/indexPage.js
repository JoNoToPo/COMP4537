// js/indexPage.js
import { USER_STRINGS } from "../lang/messages/en/user.js";

// Applies all the user-facing text on index.html. A tiny class, but it
// keeps index.html free of any hard-coded text or inline JavaScript,
// same as every other page in this app.
export class IndexPage {
    constructor(elements) {
        this.studentNameElement = elements.studentNameElement;
        this.headingElement = elements.headingElement;
        this.writerLinkElement = elements.writerLinkElement;
        this.readerLinkElement = elements.readerLinkElement;

        this.applyStaticText();
    }

    applyStaticText() {
        document.title = USER_STRINGS.PAGE_TITLE_INDEX;
        this.headingElement.textContent = USER_STRINGS.PAGE_TITLE_INDEX;
        this.studentNameElement.textContent = USER_STRINGS.STUDENT_NAME;
        this.writerLinkElement.textContent = USER_STRINGS.LINK_WRITER;
        this.readerLinkElement.textContent = USER_STRINGS.LINK_READER;
    }
}

// --- Starting point for index.html (intentionally outside any class) ---
new IndexPage({
    studentNameElement: document.getElementById("studentName"),
    headingElement: document.getElementById("pageHeading"),
    writerLinkElement: document.getElementById("writerLink"),
    readerLinkElement: document.getElementById("readerLink")
});
