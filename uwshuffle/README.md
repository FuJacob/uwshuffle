# uwshuffle Chrome Extension

A Chrome extension that improves class swapping on Quest by providing a sidebar with calendar view and conflict detection.

## Features

- **Site Detection**: Automatically detects when you're on quest.pecs.uwaterloo.ca
- **Schedule Upload**: Upload/paste your current course schedule in text format
- **Calendar View**: Visual weekly calendar showing your class schedule
- **Conflict Detection**: Highlights time conflicts when previewing new classes
- **Quest Integration**: Scrapes class information from Quest pages and adds "Preview" buttons

## Installation

1. Build the extension:

   ```bash
   npm install
   npm run build
   ```

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Usage

1. **Visit Quest**: Navigate to quest.pecs.uwaterloo.ca
2. **Sidebar Appears**: The uwshuffle sidebar will automatically appear on the right side
3. **Upload Schedule**: Click "Upload Schedule" and paste your current course schedule:
   ```
   AFM 272 MW 10:00AM - 11:20AM HH 2107
   F 10:30AM - 11:20AM HH 1101
   CS 136 TR 2:30PM - 3:50PM MC 4020
   ```
4. **View Calendar**: Your schedule will appear in the calendar view
5. **Preview Classes**: Look for "+ Preview" buttons on Quest class listings to simulate adding them to your schedule
6. **Check Conflicts**: Preview classes will show in green (no conflict) or red (conflict detected)

## Schedule Format

The extension can parse course schedules in this format:

- Course code (e.g., "AFM 272", "CS 136")
- Days using MTWRF format (e.g., "MW", "TR", "MWF")
- Time in 12-hour format (e.g., "10:00AM - 11:20AM")
- Optional location (e.g., "HH 2107")

Example:

```
AFM 272 MW 10:00AM - 11:20AM HH 2107
F 10:30AM - 11:20AM HH 1101
CS 136 TR 2:30PM - 3:50PM MC 4020
MATH 239 MWF 1:00PM - 1:50PM MC 4040
```

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint

## Tech Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Calendar**: react-big-calendar
- **Extension**: Chrome Extension Manifest V3

## File Structure

```
src/
├── content.ts              # Content script (injected into Quest)
├── sidebar.tsx             # React app entry point
├── types.ts                # TypeScript type definitions
├── components/
│   ├── Sidebar.tsx         # Main sidebar component
│   ├── CalendarView.tsx    # Calendar display component
│   └── ScheduleUpload.tsx  # Schedule upload/parsing component
└── utils/
    └── questScraper.ts     # Quest page scraping utilities
```

## Browser Permissions

This extension requires:

- `activeTab`: To access the current Quest tab
- `storage`: To save your course schedule
- `scripting`: To inject the sidebar
- `https://quest.pecs.uwaterloo.ca/*`: To run on Quest pages only
