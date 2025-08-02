# How uwshuffle Works - Technical Deep Dive

This document explains the technical architecture and implementation details of the uwshuffle Chrome extension.

## Architecture Overview

uwshuffle is a Chrome Extension (Manifest V3) that consists of three main components:

1. **Content Script** (`content.ts`) - Runs on Quest pages
2. **Sidebar React App** (`sidebar.tsx` + components) - The main UI
3. **Quest Scraper** (`questScraper.ts`) - Extracts class data from Quest

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Quest Page    │◄──►│  Content Script  │◄──►│  Sidebar App    │
│                 │    │                  │    │   (React)       │
│ - Class listings│    │ - Injects sidebar│    │ - Calendar view │
│ - Course details│    │ - Scrapes data   │    │ - Schedule mgmt │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Component Breakdown

### 1. Chrome Extension Manifest (`manifest.json`)

```json
{
  "manifest_version": 3,
  "permissions": ["scripting", "activeTab", "storage"],
  "host_permissions": ["https://quest.pecs.uwaterloo.ca/*"],
  "content_scripts": [
    {
      "matches": ["https://quest.pecs.uwaterloo.ca/*"],
      "js": ["content.js"]
    }
  ]
}
```

**Key Permissions:**

- `scripting`: Allows injection of sidebar
- `activeTab`: Access to current Quest tab
- `storage`: Persist user's course schedule
- `host_permissions`: Restricts to Quest domain only

### 2. Content Script (`src/content.ts`)

The content script is the bridge between Quest pages and the sidebar.

#### **Sidebar Injection**

```typescript
function createSidebar() {
  const sidebar = document.createElement("iframe");
  sidebar.src = chrome.runtime.getURL("sidebar.html");
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    z-index: 10000;
  `;
  document.body.appendChild(sidebar);
}
```

#### **Page Content Adjustment**

```typescript
function adjustMainContent() {
  document.body.style.marginRight = "400px";
  document.body.style.transition = "margin-right 0.3s ease";
}
```

#### **Quest Scraper Integration**

```typescript
const scraper = QuestScraper.getInstance();
scraper.init(); // Adds "Preview" buttons to course listings
```

### 3. Quest Scraper (`src/utils/questScraper.ts`)

The scraper uses pattern matching to extract course information from Quest pages.

#### **Quest-Specific Course Detection Algorithm**

```typescript
private findCourseElements(): Element[] {
  // Target Quest's specific table structure
  const questRows = document.querySelectorAll('tr[id*="trSSR_CLSRCH_MTG1"]');

  questRows.forEach(row => {
    // Check if this row contains actual course data (not headers)
    const hasSelectButton = row.querySelector('input[name*="SSR_PB_SELECT"]');
    const hasDayTime = row.querySelector('span[id*="MTG_DAYTIME"]');

    if (hasSelectButton && hasDayTime) {
      elements.push(row);
    }
  });
}
```

#### **Quest-Specific Data Extraction Process**

1. **Course Code**: Extracted from page title/breadcrumb (since rows don't contain course code)
2. **Time Parsing**: Extracts from `span[id*="MTG_DAYTIME"]` - handles "MoWeFr 11:30AM - 12:20PM"
3. **Day Conversion**: Converts Quest format "MoWeFr" → ["Mon", "Wed", "Fri"]
4. **Location**: Extracted from `span[id*="MTG_ROOM"]` - gets "UTD 105", "DC 1351", etc.
5. **Instructor**: Extracted from `span[id*="MTG_INSTR"]` - gets instructor name

```typescript
private extractQuestTimeInfo(element: Element) {
  const dayTimeSpan = element.querySelector('span[id*="MTG_DAYTIME"]');
  const timeText = dayTimeSpan.textContent; // "MoWeFr 11:30AM - 12:20PM"

  const timeMatch = firstLine.match(/([A-Za-z]+)\s+(\d{1,2}:\d{2}[AP]M)\s*[-–]\s*(\d{1,2}:\d{2}[AP]M)/i);

  return {
    days: this.parseQuestDayString(dayString), // "MoWeFr" → ["Mon", "Wed", "Fri"]
    start: this.convertTo24Hour(startTime),    // "11:30AM" → "11:30"
    end: this.convertTo24Hour(endTime)         // "12:20PM" → "12:20"
  };
}
```

#### **Quest-Specific Button Injection**

```typescript
addInteractionButtons() {
  courseElements.forEach(element => {
    // Find the last cell (where the Select button is) to add our Preview button
    const selectButtonCell = element.querySelector('td:last-child');

    const addButton = document.createElement('button');
    addButton.textContent = 'Preview';
    addButton.style.cssText = `
      margin-left: 4px;
      padding: 4px 8px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 3px;
      font-size: 10px;
    `;

    addButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const course = this.scrapeCourseFromElement(element);
      this.notifySidebar('add_preview_course', course);
    });

    // Add button after the existing Select button
    selectButtonCell.appendChild(addButton);
  });
}
```

### 4. React Sidebar App

#### **Main Sidebar Component** (`src/components/Sidebar.tsx`)

The sidebar manages three key states:

- `courses`: User's current schedule
- `previewCourse`: Course being previewed
- Chrome storage synchronization

```typescript
// Message listener for content script communication
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === "uwshuffle_action") {
      switch (event.data.action) {
        case "add_preview_course":
          setPreviewCourse(event.data.data);
          break;
      }
    }
  };

  window.addEventListener("message", handleMessage);
}, []);
```

#### **Schedule Upload Component** (`src/components/ScheduleUpload.tsx`)

Parses text input into structured course data:

```typescript
const parseScheduleText = (text: string): Course[] => {
  const lines = text.trim().split("\n");
  const courses: Course[] = [];

  for (const line of lines) {
    // Match: "AFM 272 MW 10:00AM - 11:20AM HH 2107"
    const courseMatch = line.match(/^([A-Z]{2,4}\s*\d{3}[A-Z]?)/);
    const timeMatch = line.match(
      /([MTWRF]+)\s+(\d{1,2}:\d{2}[AP]M)\s*-\s*(\d{1,2}:\d{2}[AP]M)/
    );

    if (courseMatch && timeMatch) {
      courses.push({
        course: courseMatch[1],
        days: parseDayString(timeMatch[1]),
        start: convertTo24Hour(timeMatch[2]),
        end: convertTo24Hour(timeMatch[3]),
      });
    }
  }

  return courses;
};
```

#### **Calendar View Component** (`src/components/CalendarView.tsx`)

Uses `react-big-calendar` to display weekly schedule:

##### **Event Conversion**

```typescript
const convertCourseToEvents = (course: Course, isPreview = false) => {
  const startOfWeek = moment().startOf("week").add(1, "day"); // Monday

  return course.days.map((day) => {
    const dayOffset = dayMap[day]; // Mon=0, Tue=1, etc.
    const eventDate = startOfWeek.clone().add(dayOffset, "days");

    return {
      title: `${course.course} (${course.location})`,
      start: eventDate.clone().hour(startHour).minute(startMinute).toDate(),
      end: eventDate.clone().hour(endHour).minute(endMinute).toDate(),
      isPreview,
    };
  });
};
```

##### **Conflict Detection Algorithm**

```typescript
// Check if preview course conflicts with existing courses
previewEvents.forEach((previewEvent) => {
  const hasConflict = allEvents.some(
    (existingEvent) =>
      !existingEvent.isPreview &&
      existingEvent.start < previewEvent.end &&
      existingEvent.end > previewEvent.start
  );

  previewEvent.resource.hasConflict = hasConflict;
});
```

##### **Visual Styling**

```typescript
const eventStyleGetter = (event: ParsedScheduleEvent) => {
  if (event.isPreview) {
    return {
      style: {
        backgroundColor: event.resource?.hasConflict ? "#dc3545" : "#28a745",
      },
    };
  }
  return { style: { backgroundColor: "#3174ad" } };
};
```

## Data Flow

### 1. Initial Load

```
User visits Quest → Content script detects → Sidebar injected → React app loads → Courses loaded from Chrome storage
```

### 2. Schedule Upload

```
User pastes schedule → ScheduleUpload parses text → Courses saved to state → Chrome storage updated → Calendar rerenders
```

### 3. Course Preview

```
User clicks "Preview" on Quest → Scraper extracts data → Message sent to sidebar → Preview course set → Calendar shows preview with conflict detection
```

### 4. Schedule Confirmation

```
User clicks "Add to Schedule" → Preview course added to courses array → Chrome storage updated → Preview cleared
```

## Technical Implementation Details

### **Chrome Storage Usage**

```typescript
// Save courses
chrome.storage.local.set({ uwshuffle_courses: courses });

// Load courses
chrome.storage.local.get(["uwshuffle_courses"], (result) => {
  setCourses(result.uwshuffle_courses || []);
});
```

### **Cross-Frame Communication**

Content script ↔ Sidebar communication via `postMessage`:

```typescript
// Content script sends
sidebar.contentWindow.postMessage(
  {
    type: "uwshuffle_action",
    action: "add_preview_course",
    data: courseData,
  },
  "*"
);

// Sidebar receives
window.addEventListener("message", (event) => {
  if (event.data?.type === "uwshuffle_action") {
    // Handle action
  }
});
```

### **Time Format Conversion**

```typescript
// 12-hour to 24-hour conversion
const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(/([AP]M)/);
  let [hours, minutes] = time.split(":");

  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString();

  return `${hours.padStart(2, "0")}:${minutes}`;
};
```

### **Responsive Design**

The sidebar adjusts to different screen sizes:

- Minimum width: 300px
- Maximum width: 50% of viewport
- Horizontal resizing enabled
- Main content automatically adjusted

## Build Process

### **Vite Configuration** (`vite.config.ts`)

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        sidebar: resolve(__dirname, "sidebar.html"),
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
```

### **Output Structure**

```
dist/
├── manifest.json     # Extension manifest
├── sidebar.html      # Sidebar HTML entry
├── sidebar.js        # React app bundle
├── sidebar.css       # Compiled styles
└── content.js        # Content script
```

## Error Handling & Edge Cases

### **Graceful Degradation**

- Works without Chrome API in development
- Handles missing course data gracefully
- Continues functioning if scraping fails

### **Quest Page Variations**

- Multiple selector fallbacks for course detection
- Handles dynamic content loading
- Periodic re-scanning for new elements

### **User Input Validation**

- Robust schedule text parsing
- Handles various time formats
- Ignores malformed course entries

This architecture ensures a robust, maintainable Chrome extension that seamlessly integrates with Quest while providing a powerful scheduling interface.
