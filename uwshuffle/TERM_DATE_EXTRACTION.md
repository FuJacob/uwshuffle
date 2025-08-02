# Dynamic Term Date Extraction

## Overview
UWShuffle now automatically extracts term dates from Quest's "Meeting Dates" field instead of using hardcoded dates. This ensures ICS calendar exports always use the correct academic term boundaries.

## How It Works

### 1. Term Date Detection
- When user clicks "Preview" buttons on Quest course search results, the Quest scraper activates
- On first course element found, scraper looks for `span[id*="MTG_DATES"]` element
- Extracts date range in Quest's format: "MM/DD/YYYY - MM/DD/YYYY"
- Example: "09/09/2024 - 12/09/2024" or "01/08/2025 - 04/09/2025"

### 2. Date Parsing
- Converts Quest's MM/DD/YYYY format to YYYY-MM-DD for moment.js
- Validates date format with regex: `/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/`
- Handles edge cases and provides error logging

### 3. ICS Export Update
- Calls `updateTermDates(startDate, endDate)` to update global term boundaries
- All subsequent ICS exports use the dynamically extracted dates
- Fallback to default dates (Fall 2024) if extraction fails

## Code Flow

```
User navigates to Quest course search
↓
User uploads schedule → Quest scraper activates
↓
Quest scraper finds course elements
↓
Extracts term dates from first course's "Meeting Dates" field
↓
Updates global TERM_START_DATE and TERM_END_DATE variables
↓
User exports calendar → Uses dynamic term dates for event recurrence
```

## Benefits
- ✅ Automatically adapts to different academic terms (Fall, Winter, Spring)
- ✅ No manual date configuration required
- ✅ Always uses accurate term boundaries from Quest
- ✅ **Strict validation**: Export buttons disabled until valid term dates extracted
- ✅ Prevents calendar exports with incorrect/missing term boundaries
- ✅ Clear user feedback through button tooltips and console logging

## Files Modified
- `src/utils/icsExport.ts` - Made term dates mutable, simplified updateTermDates()
- `src/utils/questScraper.ts` - Added extractTermDatesFromElement() method
- Integration in addInteractionButtons() to extract dates on first Quest interaction