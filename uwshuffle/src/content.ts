// Content script that runs on quest.pecs.uwaterloo.ca
// Detects the site and injects the sidebar iframe

import QuestScraper from './utils/questScraper'

const SIDEBAR_ID = 'uwshuffle-sidebar';
const SIDEBAR_WIDTH = '600px';

function createSidebar() {
  // Check if sidebar already exists
  if (document.getElementById(SIDEBAR_ID)) {
    return;
  }

  // Create iframe for sidebar
  const sidebar = document.createElement('iframe');
  sidebar.id = SIDEBAR_ID;
  sidebar.src = chrome.runtime.getURL('sidebar.html');
  
  // Style the sidebar
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: ${SIDEBAR_WIDTH};
    height: 100vh;
    border: none;
    z-index: 10000;
    background: white;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    resize: horizontal;
    min-width: 300px;
    max-width: 50vw;
  `;

  // Add sidebar to page
  document.body.appendChild(sidebar);

  // Adjust main content to accommodate sidebar
  adjustMainContent();
}

function adjustMainContent() {
  // Find the main content area and adjust its width
  const body = document.body;
  if (body) {
    body.style.marginRight = SIDEBAR_WIDTH;
    body.style.transition = 'margin-right 0.3s ease';
  }
}

function removeSidebar() {
  const sidebar = document.getElementById(SIDEBAR_ID);
  if (sidebar) {
    sidebar.remove();
    // Reset main content
    document.body.style.marginRight = '0';
  }
}

// Check if we're on Quest
function isQuestSite(): boolean {
  return window.location.hostname === 'quest.pecs.uwaterloo.ca';
}

// Initialize sidebar when DOM is ready
function init() {
  console.log('UWShuffle: Content script initializing...');
  console.log('UWShuffle: Current URL:', window.location.href);
  console.log('UWShuffle: Is Quest site?', isQuestSite());
  
  if (isQuestSite()) {
    console.log('UWShuffle: Creating sidebar...');
    createSidebar();
    
    // Quest scraper will only be initialized after schedule upload
    console.log('UWShuffle: Quest scraper available but waiting for schedule upload to activate');
    
    // Listen for page navigation changes (for SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        console.log('UWShuffle: URL changed to:', url);
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
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Function to start Quest scraper after schedule upload
function startQuestScraper() {
  if (isQuestSite()) {
    console.log('UWShuffle: Starting Quest scraper after schedule upload...');
    const scraper = QuestScraper.getInstance();
    scraper.startAfterScheduleUpload();
  } else {
    console.log('UWShuffle: Not on Quest site, scraper not started');
  }
}

// Listen for messages from sidebar iframe
window.addEventListener('message', (event) => {
  // Only accept messages from our sidebar
  if (event.data && event.data.type === 'uwshuffle_start_scraper') {
    console.log('UWShuffle: Received message to start Quest scraper:', event.data);
    startQuestScraper();
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
  }
};