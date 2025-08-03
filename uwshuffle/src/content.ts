// Content script that runs on quest.pecs.uwaterloo.ca
// Detects the site and injects the sidebar iframe

import QuestScraper from "./utils/questScraper";

const SIDEBAR_ID = "uwshuffle-sidebar";
const SIDEBAR_WIDTH = "25vw";

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
  if (isQuestSite()) {
    createSidebar();

    // Quest scraper will only be initialized after schedule upload
    // Listen for page navigation changes (for SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
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
  console.log("uwshuffle: startQuestScraper called in content script");
  console.log("uwshuffle: isQuestSite():", isQuestSite());

  if (isQuestSite()) {
    console.log("uwshuffle: Getting QuestScraper instance");
    const scraper = QuestScraper.getInstance();
    scraper.startAfterScheduleUpload();
  } else {
    console.log("uwshuffle: Not on Quest site, not starting scraper");
  }
}

// Listen for messages from sidebar iframe
window.addEventListener("message", (event) => {
  // Only accept messages from our sidebar
  if (event.data && event.data.type === "uwshuffle_start_scraper") {
    console.log(
      "uwshuffle: Received uwshuffle_start_scraper message",
      event.data
    );
    startQuestScraper();
  }

  // Handle sidebar minimize/expand events
  if (event.data && event.data.type === "uwshuffle_sidebar_state") {
    // Sidebar state change handled
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
