import { createRoot } from "react-dom/client";
import "./style.css";

import { observeUrlChange } from "../utils/urlObserver";

// Store the cleanup function from the URL observer
let cleanupUrlObserver: (() => void) | null = null;
let isLinkInjected = false;
let cardPageObserver: MutationObserver | null = null;
let urlObserver: MutationObserver | null = null;

const AI_LINK_ID = "bc-ai-assistant-link";
const REACT_ROOT_ID = "__root";

function injectAiAssistantLink(): void {

  if (isLinkInjected || document.querySelector(`#${AI_LINK_ID}`)) {
    disconnectCardPageObserver();
    return;
  }

  const actionSheet = document.querySelector(".action-sheet__content");
  const archivedLink = actionSheet?.querySelector('a[href*="/archive"]');

  if (!actionSheet || !archivedLink) return;

  const aiLink = document.createElement("a");
  aiLink.href = "#";
  aiLink.className =
    "action-sheet__action action-sheet__action--bc-ai-assistant";
  aiLink.id = AI_LINK_ID;
  aiLink.textContent = "AI Assistant";
  aiLink.onclick = (e) => {
    e.preventDefault();
    alert("AI Assistant clicked!");
    // Replace with actual functionality
  };

  archivedLink.parentNode?.insertBefore(aiLink, archivedLink.nextSibling);
  isLinkInjected = true;

  disconnectCardPageObserver();
}

function observeCardPageForActionLinks(): void {
  disconnectCardPageObserver();

  isLinkInjected = false;
  cardPageObserver = new MutationObserver(() => {
    const actionSheet = document.querySelector(".action-sheet__content");
    if (actionSheet) injectAiAssistantLink();
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
  if (cleanupUrlObserver) {
    console.log("disconnecting url observer");
    cleanupUrlObserver();
  }
  cleanupUrlObserver = observeUrlChange({
    "/card_tables/": observeCardPageForActionLinks,
  });

  return cleanupUrlObserver;
}

// function mountReactUI(): void {
//   console.log("mountReactUI");
//   if (document.getElementById(REACT_ROOT_ID)) return;

//   const rootDiv = document.createElement("div");
//   rootDiv.id = REACT_ROOT_ID;
//   document.body.appendChild(rootDiv);

//   const root = createRoot(rootDiv);
//   root.render(
//     <div className="absolute bottom-0 left-0 text-lg text-black bg-amber-400 z-50">
//       content script <span className="your-class">loaded</span>
//     </div>
//   );
// }

// Cleanup function for when extension is unloaded
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
  // Initial setup
  observeUrlChangeForCardPage();
  // mountReactUI();
  // Setup cleanup on page unload
  window.addEventListener("unload", cleanup);
} catch (error) {
  console.error("Error in content script:", error);
}
