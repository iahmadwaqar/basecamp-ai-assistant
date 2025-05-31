import { createRoot } from "react-dom/client";
import React, { useState } from "react";
import { Modal } from "./components/Modal";
import "./style.css";
import { observeUrlChange } from "../utils/urlObserver";
import { checkLoginStatus } from "../utils/auth/loginStatus";

let cleanupUrlObserver: (() => void) | null = null;
let isLinkInjected = false;
let cardPageObserver: MutationObserver | null = null;
let singleCardPageObserver: MutationObserver | null = null;
let urlObserver: MutationObserver | null = null;

const AI_LINK_ID = "bc-ai-assistant-link";
const REACT_ROOT_ID = "__root";

// Modal controller
let showModal: (() => void) | null = null;

function injectStatusesAndTagsManagementButtons(): void {
  if (isLinkInjected || document.querySelector(`#${AI_LINK_ID}`)) {
    disconnectCardPageObserver();
    return;
  }

  const actionSheet = document.querySelector(".action-sheet__content");
  const archivedLink = actionSheet?.querySelector('a[href*="/archive"]');
  if (!actionSheet || !archivedLink) return;

  const editTagsLink = document.createElement("a");
  editTagsLink.href = "#";
  editTagsLink.className =
    "action-sheet__action action-sheet__action--edit-tags";
  editTagsLink.textContent = "Edit Tags";
  editTagsLink.onclick = (e) => {
    e.preventDefault();
    showModal?.();
  };

  const editStatusesLink = document.createElement("a");
  editStatusesLink.href = "#";
  editStatusesLink.className =
    "action-sheet__action action-sheet__action--edit-statuses";
  editStatusesLink.textContent = "Edit Statuses";
  editStatusesLink.onclick = (e) => {
    e.preventDefault();
    showModal?.();
  };

  const parent = archivedLink.parentNode;
  parent?.insertBefore(editTagsLink, archivedLink.nextSibling);
  parent?.insertBefore(editStatusesLink, archivedLink.nextSibling);
  isLinkInjected = true;

  disconnectCardPageObserver();
}

function observeCardPageForActionLinks(): void {
  disconnectCardPageObserver();
  isLinkInjected = false;

  cardPageObserver = new MutationObserver(() => {
    const actionSheet = document.querySelector(".action-sheet__content");
    if (actionSheet) {
      injectStatusesAndTagsManagementButtons();
      mountReactUI();
    }
  });

  cardPageObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function disconnectCardPageObserver(): void {
  cardPageObserver?.disconnect();
  cardPageObserver = null;
}

function observeUrlChangeForCardPage() {
  if (cleanupUrlObserver) cleanupUrlObserver();
  cleanupUrlObserver = observeUrlChange({
    "^/card_tables/\\d+$": observeCardPageForActionLinks,
    "^/card_tables/cards/\\d+$": observeSingleCardPageForActionLinks,
  });
  return cleanupUrlObserver;
}

function mountReactUI(): void {
  if (document.getElementById(REACT_ROOT_ID)) return;

  const rootDiv = document.createElement("div");
  rootDiv.id = REACT_ROOT_ID;
  document.body.appendChild(rootDiv);

  const root = createRoot(rootDiv);

  function App() {
    const [visible, setVisible] = useState(false);
    showModal = () => setVisible(true);

    return visible ? <Modal onClose={() => setVisible(false)} /> : null;
  }

  root.render(<App />);
}

function cleanup() {
  if (cleanupUrlObserver) {
    cleanupUrlObserver();
    cleanupUrlObserver = null;
  }

  if (urlObserver) {
    urlObserver.disconnect();
    urlObserver = null;
  }

  disconnectCardPageObserver();
}

// Wrap the bootstrapping code in an async IIFE
(async () => {
  try {
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
      return;
    }
    observeUrlChangeForCardPage();
    window.addEventListener("unload", cleanup);
  } catch (error) {
    console.error("Error in content script:", error);
  }
})();

function observeSingleCardPageForActionLinks(): void {
  disconnectSingleCardPageObserver();

  singleCardPageObserver = new MutationObserver(() => {
    console.log("Observing single card page");
    const actionSheet = document.querySelector(".todo-perma__details");

    if (actionSheet) {
      // Defer injection after Basecamp's own rendering is more likely complete
      if (!document.querySelector("#bca-injected-tags")) {
        injectStatusAndTags();
      }
    }
  });

  singleCardPageObserver.observe(document, {
    childList: true,
    subtree: true,
  });
}

function injectStatusAndTags(): void {
  console.log("Injecting status and tags");
  const actionSheet = document.querySelector(".todo-perma__details");
  const archivedLink = actionSheet?.querySelector(
    ".todos-form__field.card-perma__content"
  );
  if (!actionSheet || !archivedLink) {
    console.log("Action sheet or archived link not found");
    return;
  }

  if (document.querySelector("#bca-injected-tags")) {
    console.log("Tags already injected");
    return;
  }
  // Create the due date field container
  const dueDateField = document.createElement("div");
  dueDateField.className = "todos-form__field";
  dueDateField.id = "bca-injected-tags";

  // Set the inner HTML structure
  dueDateField.innerHTML = `
  <div class="todos-form__field-label">
    <strong>Select Label</strong>
  </div>
  <div class="todos-form__field-content">
    <a href="#" class="due-date-link">
      <span class="todos-form__field-placeholder hide-on-print">
        Select a due date
      </span>
    </a>
  </div>
  `;

  // Add click handler for the due date link
  const link = dueDateField.querySelector(".due-date-link");
  if (link) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
    });
  }

  // Create the due date field container
  const dueDateField2 = document.createElement("div");
  dueDateField2.className = "todos-form__field";
  dueDateField2.id = "bca-injected-status";

  // Set the inner HTML structure
  dueDateField2.innerHTML = `
  <div class="todos-form__field-label">
    <strong>Select Status</strong>
  </div>
  <div class="todos-form__field-content">
    <a href="#" class="due-date-link">
      <span class="todos-form__field-placeholder hide-on-print">
        Select a due date
      </span>
    </a>
  </div>
`;

  // Add click handler for the due date link
  const link2 = dueDateField2.querySelector(".due-date-link");
  if (link2) {
    link2.addEventListener("click", (e) => {
      e.preventDefault();
    });
  }

  const parent = archivedLink.parentNode;
  parent?.insertBefore(dueDateField, archivedLink);
  parent?.insertBefore(dueDateField2, archivedLink);
  isLinkInjected = true;

  disconnectSingleCardPageObserver();
}

function disconnectSingleCardPageObserver(): void {
  console.log("Disconnecting single card page observer");
  singleCardPageObserver?.disconnect();
  singleCardPageObserver = null;
}
