// Content script that runs on quest.pecs.uwaterloo.ca
// Detects the site and injects the sidebar iframe

import QuestScraper from "./utils/questScraper";

const SIDEBAR_ID = "uwshuffle-sidebar";
const SIDEBAR_WIDTH = "20vw";

function createSidebar() {
  // Check if sidebar already exists
  if (document.getElementById(SIDEBAR_ID)) {
    return;
  }

  // Create iframe for sidebar
  const sidebar = document.createElement("iframe");
  sidebar.id = SIDEBAR_ID;
  sidebar.src = chrome.runtime.getURL("sidebar.html");

  sidebar.style.cssText = `
  position: fixed;
  top: 0;
  right: 0;
  width: ${SIDEBAR_WIDTH};
  height: 100vh;
  border: none;
  z-index: 10000;
  background: transparent;
  border-radius: 16px 0 0 16px;
  resize: horizontal;
  min-width: 20vw;
  max-width: 60vw;
`;
  // Add sidebar to page
  document.body.appendChild(sidebar);

  // Adjust main content to accommodate sidebar
  adjustMainContent();
}
  
function adjustMainContent(isMinimized = false) {
  // Find the main content area and adjust its width
  const body = document.body;
  if (body) {
    body.style.marginRight = isMinimized ? "0" : SIDEBAR_WIDTH;
    body.style.transition = "margin-right 0.3s ease";
  }
}

function removeSidebar() {
  const sidebar = document.getElementById(SIDEBAR_ID);
  if (sidebar) {
    sidebar.remove();
    // Reset main content
    document.body.style.marginRight = "0";
  }
}

// Check if we're on Quest
function isQuestSite(): boolean {
  return window.location.hostname === "quest.pecs.uwaterloo.ca";
}

// Initialize sidebar when DOM is ready
function init() {
  console.log("uwshuffle: Content script initializing...");
  console.log("uwshuffle: Current URL:", window.location.href);
  console.log("uwshuffle: Is Quest site?", isQuestSite());

  if (isQuestSite()) {
    console.log("uwshuffle: Creating sidebar...");
    createSidebar();

    // Quest scraper will only be initialized after schedule upload
    console.log(
      "uwshuffle: Quest scraper available but waiting for schedule upload to activate"
    );

    // Listen for page navigation changes (for SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        console.log("uwshuffle: URL changed to:", url);
        // Recreate sidebar if needed after navigation
        setTimeout(() => {
          if (!document.getElementById(SIDEBAR_ID)) {
            createSidebar();
          }
        }, 1000);
      }
    }).observe(document, { subtree: true, childList: true });
  }
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Function to start Quest scraper after schedule upload
function startQuestScraper() {
  if (isQuestSite()) {
    console.log("uwshuffle: Starting Quest scraper after schedule upload...");
    const scraper = QuestScraper.getInstance();
    scraper.startAfterScheduleUpload();
  } else {
    console.log("uwshuffle: Not on Quest site, scraper not started");
  }
}

// Listen for messages from sidebar iframe
window.addEventListener("message", (event) => {
  // Only accept messages from our sidebar
  if (event.data && event.data.type === "uwshuffle_start_scraper") {
    console.log(
      "uwshuffle: Received message to start Quest scraper:",
      event.data
    );
    startQuestScraper();
  }

  // Handle sidebar minimize/expand events
  if (event.data && event.data.type === "uwshuffle_sidebar_state") {
    console.log(
      "uwshuffle: Received sidebar state change:",
      event.data.isMinimized
    );
    adjustMainContent(event.data.isMinimized);
  }
});

// Export functions for potential use by other parts of the extension
(window as unknown as { uwshuffleSidebar: unknown }).uwshuffleSidebar = {
  create: createSidebar,
  remove: removeSidebar,
  toggle: () => {
    const sidebar = document.getElementById(SIDEBAR_ID);
    if (sidebar) {
      removeSidebar();
    } else {
      createSidebar();
    }
  },
};
