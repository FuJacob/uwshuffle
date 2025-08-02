# uwshuffle Troubleshooting Guide

## Debug Mode Installation & Testing

The extension now includes comprehensive logging to help debug issues.

### 1. Install the Debug Version

1. **Build the extension:**

   ```bash
   npm run build
   ```

2. **Load in Chrome:**

   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

3. **Check Extension Loaded:**
   - Extension should appear in the extensions list
   - Should show "uwshuffle" with version 1.0

### 2. Test on Quest

1. **Navigate to Quest:**

   - Go to `https://quest.pecs.uwaterloo.ca/`
   - Log in and navigate to a course search results page

2. **Open Developer Console:**
   - Press `F12` or right-click → "Inspect"
   - Go to "Console" tab
   - Look for messages starting with "uwshuffle:"

### 3. Expected Debug Output

You should see console messages like:

```
uwshuffle: Content script initializing...
uwshuffle: Current URL: https://quest.pecs.uwaterloo.ca/...
uwshuffle: Is Quest site? true
uwshuffle: Creating sidebar...
uwshuffle: Initializing Quest scraper...
uwshuffle: Finding course elements...
uwshuffle: Found X Quest table rows
uwshuffle: Checking row 1: trSSR_CLSRCH_MTG1$0_row1
uwshuffle: Has select button: true
uwshuffle: Has day/time: true
uwshuffle: Valid course row found
uwshuffle: Total valid course elements found: X
uwshuffle: Adding interaction buttons...
uwshuffle: Found X course elements
uwshuffle: Processing element 1: [object HTMLTableRowElement]
uwshuffle: Scraped course data: {course: "COURSE", days: ["Mon", "Wed", "Fri"], ...}
uwshuffle: Select button cell: [object HTMLTableCellElement]
uwshuffle: Preview button added successfully
```

## Common Issues & Solutions

### Issue 1: No Console Messages at All

**Problem:** Extension not loading or content script not executing

**Solutions:**

1. **Check Extension Permissions:**

   - Go to `chrome://extensions/`
   - Find uwshuffle extension
   - Ensure it's enabled
   - Check that it has access to Quest site

2. **Reload Extension:**

   - Click refresh button on extension in `chrome://extensions/`
   - Reload the Quest page

3. **Check Manifest:**
   - Verify `dist/manifest.json` contains correct host permissions
   - Should include `"https://quest.pecs.uwaterloo.ca/*"`

### Issue 2: "Found 0 Quest table rows"

**Problem:** Can't find Quest course table elements

**Solutions:**

1. **Check Page Structure:**

   - Are you on a course search results page?
   - Do you see course listings with "Select" buttons?

2. **Manual Check:**

   - In console, run: `document.querySelectorAll('tr[id*="trSSR_CLSRCH_MTG1"]').length`
   - Should return > 0 if course rows exist

3. **Timing Issues:**
   - Content may load dynamically
   - Wait 5-10 seconds for periodic rescan

### Issue 3: "Has select button: false" or "Has day/time: false"

**Problem:** Quest page structure different than expected

**Solutions:**

1. **Inspect HTML:**

   - Right-click on a course row → "Inspect"
   - Check if structure matches expected format
   - Look for `input[name*="SSR_PB_SELECT"]` and `span[id*="MTG_DAYTIME"]`

2. **Update Selectors:**
   - If structure is different, selectors in `questScraper.ts` may need updating

### Issue 4: CORS/Origin Errors in Console

**Problem:** Browser security blocking cross-origin requests

**Solutions:**

1. **Check Manifest Permissions:**

   - Extension should have `activeTab` and `scripting` permissions
   - Host permissions should include Quest domain

2. **Chrome Security:**
   - Some features may be blocked in development mode
   - Try in regular browsing (not incognito)

### Issue 5: Sidebar Not Appearing

**Problem:** Sidebar iframe not injecting

**Solutions:**

1. **Check Console for Sidebar Messages:**

   - Should see "uwshuffle: Creating sidebar..."

2. **Manual Check:**

   - In console, run: `document.getElementById('uwshuffle-sidebar')`
   - Should return an iframe element

3. **Check Sidebar HTML:**
   - Verify `dist/sidebar.html` exists
   - Check `dist/sidebar.js` and `dist/sidebar.css` exist

### Issue 6: Preview Buttons Not Appearing

**Problem:** Buttons not being added to course rows

**Solutions:**

1. **Check Scraper Data:**

   - Look for "uwshuffle: Scraped course data: null"
   - If null, course data extraction is failing

2. **Check Cell Selection:**

   - Look for "uwshuffle: No select button cell found"
   - Table structure may be different

3. **Visual Check:**
   - Look for buttons with blue background next to "Select" buttons
   - Buttons should have "Preview" text

## Manual Testing Commands

Run these in the browser console while on Quest:

```javascript
// Check if content script loaded
window.uwshuffleSidebar;

// Find course rows manually
document.querySelectorAll('tr[id*="trSSR_CLSRCH_MTG1"]');

// Check for select buttons
document.querySelectorAll('input[name*="SSR_PB_SELECT"]');

// Check for time spans
document.querySelectorAll('span[id*="MTG_DAYTIME"]');

// Check if sidebar exists
document.getElementById("uwshuffle-sidebar");

// Test scraper manually
QuestScraper.getInstance().addInteractionButtons();
```

## Getting Help

If issues persist:

1. **Share Console Output:**

   - Copy all "uwshuffle:" messages from console
   - Include any error messages (red text)

2. **Share Page Info:**

   - Current Quest URL
   - Screenshot of course listings page
   - Browser version and OS

3. **Check File Structure:**
   - Verify all files exist in `dist/` folder:
     - `manifest.json`
     - `sidebar.html`
     - `content.js`
     - `sidebar.js`
     - `sidebar.css`
