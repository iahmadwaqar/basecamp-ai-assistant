import { createRoot } from "react-dom/client";
import React, { useState } from "react";
import { Modal } from "./components/Modal";
import "./style.css";
import { observeUrlChange } from "../utils/urlObserver";

let cleanupUrlObserver: (() => void) | null = null;
let isLinkInjected = false;
let cardPageObserver: MutationObserver | null = null;
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
    "/card_tables/": observeCardPageForActionLinks,
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

// Bootstrapping
try {
  observeUrlChangeForCardPage();
  window.addEventListener("unload", cleanup);
} catch (error) {
  console.error("Error in content script:", error);
}
