import type { Course } from "../types";

export class QuestScraper {
  private static instance: QuestScraper;

  private constructor() {}

  static getInstance(): QuestScraper {
    if (!QuestScraper.instance) {
      QuestScraper.instance = new QuestScraper();
    }
    return QuestScraper.instance;
  }

  // Scrape course information from Quest page elements
  scrapeCourseFromElement(element: Element): Course | null {
    try {
      // Extract data from Quest's specific structure
      const courseCode = this.extractQuestCourseCode(element);
      const section = this.extractQuestSection(element);
      const timeInfo = this.extractQuestTimeInfo(element);
      const location = this.extractQuestLocation(element);
      const instructor = this.extractQuestInstructor(element);

      if (!courseCode || !timeInfo) {
        return null;
      }

      return {
        course: courseCode,
        section: section || undefined,
        days: timeInfo.days,
        start: timeInfo.start,
        end: timeInfo.end,
        location: location || undefined,
        instructor: instructor || undefined,
      };
    } catch (error) {
      console.error("Error scraping course element:", error);
      return null;
    }
  }

  // Reference to the Quest main content iframe document (if present)
  private _iframeDoc: Document | null = null;

  private get iframeDoc(): Document | null {
    // Try to get iframe document if not already cached
    if (!this._iframeDoc) {
      const iframe = Array.from(document.querySelectorAll("iframe")).find(
        (f) => f.title === "Main Content"
      ) as HTMLIFrameElement | undefined;
      this._iframeDoc = iframe?.contentDocument || null;
    }
    return this._iframeDoc;
  }

  private set iframeDoc(doc: Document | null) {
    this._iframeDoc = doc;
  }

  private extractQuestCourseCode(element: Element): string | null {
    // Look for course title/code in various places on the page

    // First try: Quest course section collapse/expand buttons (most reliable)
    const collapseElements = this.iframeDoc?.querySelectorAll(
      'a[class*="PTCOLLAPSE_ARROW"], a[title*="Collapse section"], a[id*="SSR_CLSRSLT_WRK_GROUPBOX2"]'
    );
    if (collapseElements) {
      for (const collapseEl of collapseElements) {
        // Check the title attribute first
        const titleAttr = collapseEl.getAttribute("title") || "";
        const titleMatch = titleAttr.match(/([A-Z]{2,4}\s*\d{3}[A-Z]?)/i);
        if (titleMatch) {
          return titleMatch[1].replace(/\s+/g, " ").trim().toUpperCase();
        }

        // Check the text content
        const textContent = collapseEl.textContent || "";
        const textMatch = textContent.match(/([A-Z]{2,4}\s*\d{3}[A-Z]?)/i);
        if (textMatch) {
          return textMatch[1].replace(/\s+/g, " ").trim().toUpperCase();
        }

        // Check the parent element's text content
        const parentText = collapseEl.parentElement?.textContent || "";
        const parentMatch = parentText.match(/([A-Z]{2,4}\s*\d{3}[A-Z]?)/i);
        if (parentMatch) {
          return parentMatch[1].replace(/\s+/g, " ").trim().toUpperCase();
        }
      }
    }

    // Second try: Quest-specific course title elements in iframe
    const questTitleSelectors = [
      'span[id*="DERIVED_CLSMSG_COURSE_TITLE"]',
      'span[id*="COURSE_TITLE"]',
      'span[id*="CRSE_TITLE"]',
      'td[id*="DERIVED_CLSMSG_COURSE_TITLE"]',
      'div[id*="SSR_CLSRSLT_WRK_GROUPBOX2GP"]',
    ];

    for (const selector of questTitleSelectors) {
      const titleElement = this.iframeDoc?.querySelector(selector);
      if (titleElement) {
        const titleText = titleElement.textContent || "";
        const courseMatch = titleText.match(/([A-Z]{2,4}\s*\d{3}[A-Z]?)/i);
        if (courseMatch) {
          return courseMatch[1].replace(/\s+/g, " ").trim().toUpperCase();
        }
      }
    }

    // Third try: Page title
    const pageTitle = this.iframeDoc?.title || document.title;
    const pageTitleMatch = pageTitle.match(/([A-Z]{2,4}\s*\d{3}[A-Z]?)/i);
    if (pageTitleMatch) {
      return pageTitleMatch[1].replace(/\s+/g, " ").trim().toUpperCase();
    }

    // Fourth try: Look in breadcrumbs or navigation elements
    const navElements = this.iframeDoc?.querySelectorAll(
      '.breadcrumb, .navigation, [class*="nav"], [class*="crumb"]'
    );
    if (navElements) {
      for (const nav of navElements) {
        const navText = nav.textContent || "";
        const navMatch = navText.match(/([A-Z]{2,4}\s*\d{3}[A-Z]?)/i);
        if (navMatch) {
          return navMatch[1].replace(/\s+/g, " ").trim().toUpperCase();
        }
      }
    }

    // Fifth try: Look for course info in headers or other prominent elements
    const courseHeaders = this.iframeDoc?.querySelectorAll(
      'span[id*="COURSE"], span[id*="TITLE"], h1, h2, h3, .course-title, .course-info'
    );
    if (courseHeaders) {
      for (const header of courseHeaders) {
        const headerText = header.textContent || "";
        const headerMatch = headerText.match(/([A-Z]{2,4}\s*\d{3}[A-Z]?)/i);
        if (headerMatch) {
          return headerMatch[1].replace(/\s+/g, " ").trim().toUpperCase();
        }
      }
    }

    // Sixth try: Look in the page content for patterns like "MATH 101" or similar
    const bodyText = this.iframeDoc?.body?.textContent || "";
    const bodyMatch = bodyText.match(/([A-Z]{2,4}\s+\d{3}[A-Z]?)/i);
    if (bodyMatch) {
      return bodyMatch[1].replace(/\s+/g, " ").trim().toUpperCase();
    }

    // Seventh try: Look in the specific element as fallback
    const elementText = element.textContent || "";
    const elementMatch = elementText.match(/([A-Z]{2,4}\s*\d{3}[A-Z]?)/i);
    if (elementMatch) {
      return elementMatch[1].replace(/\s+/g, " ").trim().toUpperCase();
    }

    // Fallback: return a generic identifier
    return "COURSE";
  }

  private extractQuestSection(element: Element): string | null {
    // Find the Section cell in the Quest table row
    const sectionSpan = element.querySelector('span[id*="MTG_CLASSNAME"]');
    if (!sectionSpan) {
      return null;
    }

    const sectionText = sectionSpan.textContent || "";
    // Extract section info like "003-LEC" from "003-LEC\nRegular"
    const lines = sectionText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    if (lines.length > 0) {
      return lines[0]; // Return the first line which should be the section identifier
    }

    return sectionText.trim() || null;
  }

  private extractQuestTimeInfo(
    element: Element
  ): { days: string[]; start: string; end: string } | null {
    // Find the Days & Times cell in the Quest table row
    const dayTimeSpan = element.querySelector('span[id*="MTG_DAYTIME"]');
    if (!dayTimeSpan) {
      return null;
    }

    const timeText = dayTimeSpan.textContent || "";

    // Handle Quest's format: "MoWeFr 11:30AM - 12:20PM" or "Fr 2:30PM - 3:20PM"
    // Also handle multi-line format for tests
    const lines = timeText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    if (lines.length === 0) {
      return null; // Online courses may have empty time
    }

    // Use the first time entry
    const firstLine = lines[0];
    const timeMatch = firstLine.match(
      /([A-Za-z]+)\s+(\d{1,2}:\d{2}[AP]M)\s*[-–]\s*(\d{1,2}:\d{2}[AP]M)/i
    );

    if (!timeMatch) {
      return null;
    }

    const [, dayString, startTime, endTime] = timeMatch;

    return {
      days: this.parseQuestDayString(dayString),
      start: this.convertTo24Hour(startTime),
      end: this.convertTo24Hour(endTime),
    };
  }

  private extractQuestLocation(element: Element): string | null {
    // Find the Room cell in the Quest table row
    const roomSpan = element.querySelector('span[id*="MTG_ROOM"]');
    if (!roomSpan) {
      return null;
    }

    const roomText = roomSpan.textContent || "";
    return roomText.trim() || null;
  }

  private extractQuestInstructor(element: Element): string | null {
    // Find the Instructor cell in the Quest table row
    const instrSpan = element.querySelector('span[id*="MTG_INSTR"]');
    if (!instrSpan) {
      return null;
    }

    const instrText = instrSpan.textContent || "";
    return instrText.trim() || null;
  }

  // Extract term dates from Quest Meeting Dates field
  private extractTermDatesFromElement(
    element: Element
  ): { startDate: string; endDate: string } | null {
    try {
      // Look for Meeting Dates span in the Quest table row
      const meetingDatesSpan = element.querySelector('span[id*="MTG_TOPIC$0"]');
      if (!meetingDatesSpan) {
        return null;
      }

      const datesText = meetingDatesSpan.textContent || "";
      console.log("uwshuffle: Found Meeting Dates text:", datesText);

      // Quest meeting dates format is typically "MM/DD/YYYY - MM/DD/YYYY"
      // Examples: "09/09/2024 - 12/09/2024" or "01/08/2025 - 04/09/2025"
      const dateRangeMatch = datesText.match(
        /(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/
      );

      if (!dateRangeMatch) {
        console.log(
          "uwshuffle: Could not parse meeting dates format:",
          datesText
        );
        return null;
      }

      const [, startDateStr, endDateStr] = dateRangeMatch;

      // Convert MM/DD/YYYY to YYYY-MM-DD format for moment.js
      const startParts = startDateStr.split("/");
      const endParts = endDateStr.split("/");

      const startDate = `${startParts[2]}-${startParts[0].padStart(
        2,
        "0"
      )}-${startParts[1].padStart(2, "0")}`;
      const endDate = `${endParts[2]}-${endParts[0].padStart(
        2,
        "0"
      )}-${endParts[1].padStart(2, "0")}`;

      console.log(
        `uwshuffle: Extracted term dates - Start: ${startDate}, End: ${endDate}`
      );

      return { startDate, endDate };
    } catch (error) {
      console.error("uwshuffle: Error extracting term dates:", error);
      return null;
    }
  }

  private parseQuestDayString(dayString: string): string[] {
    // Quest uses full day names like "MoWeFr", "Tu", "Th", etc.
    const dayMap: { [key: string]: string } = {
      Mo: "M",
      Tu: "Tu",
      We: "W",
      Th: "Th",
      Fr: "F",
      Sa: "Sa",
      Su: "Su",
    };

    const days: string[] = [];
    let i = 0;

    while (i < dayString.length) {
      // Try to match 2-character day codes first
      const twoChar = dayString.substring(i, i + 2);
      if (dayMap[twoChar]) {
        days.push(dayMap[twoChar]);
        i += 2;
      } else {
        // Single character fallback (shouldn't happen in Quest format)
        const oneChar = dayString.charAt(i);
        const singleDayMap: { [key: string]: string } = {
          M: "M",
          T: "Tu",
          W: "W",
          R: "Th",
          F: "F",
        };
        if (singleDayMap[oneChar]) {
          days.push(singleDayMap[oneChar]);
        }
        i += 1;
      }
    }

    return days;
  }

  private convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(/([AP]M)/i);
    let [hours] = time.split(":");
    const [, minutes] = time.split(":");

    if (hours === "12") {
      hours = "00";
    }

    if (modifier.toUpperCase() === "PM") {
      hours = (parseInt(hours, 10) + 12).toString();
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  // Add "Add to Schedule" buttons to course elements on the page
  addInteractionButtons() {
    console.log("uwshuffle: Adding interaction buttons...");

    // Find Quest course table rows
    const courseElements = this.findCourseElements();
    console.log("uwshuffle: Found", courseElements.length, "course elements");

    // Extract term dates from the first course element (all courses in the same term will have the same dates)
    if (courseElements.length > 0) {
      const termDates = this.extractTermDatesFromElement(courseElements[0]);
      if (termDates) {
        console.log("uwshuffle: Saving term dates to localStorage");
        localStorage.setItem("uwshuffle-term-start", termDates.startDate);
        localStorage.setItem("uwshuffle-term-end", termDates.endDate);
      } else {
        console.log(
          "uwshuffle: Could not extract term dates from Quest - export buttons will remain disabled"
        );
      }
    }

    courseElements.forEach((element, index) => {
      const course = this.scrapeCourseFromElement(element);

      if (!course) {
        console.log(
          `uwshuffle: No course data found for element ${index + 1}, skipping`
        );
        return;
      }

      // Find the last cell (where the Select button is) to add our Preview button
      const selectButtonCell = element.querySelector("td:last-child");

      if (!selectButtonCell) {
        console.log(
          `uwshuffle: No select button cell found for element ${
            index + 1
          }, skipping`
        );
        return;
      }

      const addButton = document.createElement("button");
      addButton.className = "uwshuffle-add-btn";
      addButton.textContent = "Preview";
      addButton.style.cssText = `
        width: 100%;
        margin-top: 8px;
        margin-left: 0;
        padding: 8px 12px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        z-index: 1000;
        position: relative;
        white-space: nowrap;
        display: block;
        font-family: inherit;
        transition: background-color 0.15s ease;
      `;

      addButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("uwshuffle: Preview button clicked for course:", course);
        this.notifySidebar("add_preview_course", course);
      });

      // Add hover effects
      addButton.addEventListener("mouseenter", () => {
        addButton.style.backgroundColor = "#0056b3";
      });

      addButton.addEventListener("mouseleave", () => {
        addButton.style.backgroundColor = "#007bff";
      });

      // Add button after the Select button
      selectButtonCell.appendChild(addButton);
    });

    console.log(`uwshuffle: Added ${courseElements.length} preview buttons`);
  }

  private findCourseElements(): Element[] {
    console.log("uwshuffle: Finding course elements...");

    // First try to use the cached iframe document if available
    if (this.iframeDoc) {
      console.log("uwshuffle: Using cached iframe document");
      return this.findCourseElementsInDocument(this.iframeDoc);
    }

    // Add comprehensive DOM debugging
    console.log("uwshuffle: DOM Debug Info:");
    console.log("uwshuffle: - Document ready state:", document.readyState);
    console.log("uwshuffle: - Document URL:", document.URL);
    console.log(
      "uwshuffle: - Total elements in document:",
      document.querySelectorAll("*").length
    );
    console.log(
      "uwshuffle: - Total table rows:",
      document.querySelectorAll("tr").length
    );
    console.log(
      "uwshuffle: - Total tables:",
      document.querySelectorAll("table").length
    );
    console.log(
      "uwshuffle: - Total inputs:",
      document.querySelectorAll("input").length
    );
    console.log(
      "uwshuffle: - Total buttons:",
      document.querySelectorAll("button").length
    );
    console.log(
      "uwshuffle: - Total spans:",
      document.querySelectorAll("span").length
    );

    // Check for common Quest elements in main document
    console.log("uwshuffle: Quest-specific elements in main document:");
    console.log(
      'uwshuffle: - Elements with "SSR":',
      document.querySelectorAll('[id*="SSR"]').length
    );
    console.log(
      'uwshuffle: - Elements with "MTG":',
      document.querySelectorAll('[id*="MTG"]').length
    );
    console.log(
      'uwshuffle: - Elements with "CLSRCH":',
      document.querySelectorAll('[id*="CLSRCH"]').length
    );
    console.log(
      'uwshuffle: - Inputs with "SELECT":',
      document.querySelectorAll('input[name*="SELECT"]').length
    );
    console.log(
      'uwshuffle: - Elements with "Select" value:',
      document.querySelectorAll('input[value="Select"]').length
    );

    // Check for iframes and try to search within them
    const iframes = document.querySelectorAll("iframe");
    console.log("uwshuffle: - Total iframes:", iframes.length);
    if (iframes.length > 0) {
      console.log(
        "uwshuffle: - Iframe sources/titles:",
        Array.from(iframes).map((f) => ({ src: f.src, title: f.title }))
      );

      // Try to search in iframes, prioritizing "Main Content" iframe
      const mainContentIframe = Array.from(iframes).find(
        (f) => f.title === "Main Content"
      );

      const iframesToCheck = mainContentIframe
        ? [
            mainContentIframe,
            ...Array.from(iframes).filter((f) => f !== mainContentIframe),
          ]
        : Array.from(iframes);

      for (const iframe of iframesToCheck) {
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            console.log(
              "uwshuffle: - Searching in iframe:",
              iframe.title || iframe.src || "no-title-no-src"
            );
            console.log(
              "uwshuffle: - Iframe elements:",
              iframeDoc.querySelectorAll("*").length
            );
            console.log(
              "uwshuffle: - Iframe table rows:",
              iframeDoc.querySelectorAll("tr").length
            );
            console.log(
              "uwshuffle: - Iframe SSR elements:",
              iframeDoc.querySelectorAll('[id*="SSR"]').length
            );
            console.log(
              "uwshuffle: - Iframe MTG elements:",
              iframeDoc.querySelectorAll('[id*="MTG"]').length
            );

            // If iframe has the elements we need, use that document instead
            const iframeSelectButtons = iframeDoc.querySelectorAll(
              'input[value="Select"]'
            );
            if (iframeSelectButtons.length > 0) {
              console.log(
                "uwshuffle: - Found Select buttons in iframe! Using iframe document."
              );

              // Cache the iframe document for future use
              this.iframeDoc = iframeDoc;

              return this.findCourseElementsInDocument(iframeDoc);
            }
          } else {
            console.log(
              "uwshuffle: - Cannot access iframe document (cross-origin?)"
            );
          }
        } catch (error) {
          console.log("uwshuffle: - Error accessing iframe:", error);
        }
      }
    }

    // Check if we can find the course title in main document
    const titleElements = document.querySelectorAll("*");
    const titleFound = Array.from(titleElements).find(
      (el) =>
        el.textContent &&
        el.textContent.includes("STAT") &&
        el.textContent.includes("230")
    );
    console.log("uwshuffle: - Found STAT 230 title element:", !!titleFound);
    if (titleFound) {
      console.log(
        "uwshuffle: - Title element:",
        titleFound.tagName,
        titleFound.id,
        titleFound.className
      );
    }

    // Fallback to main document search
    console.log(
      "uwshuffle: No iframe content found, falling back to main document"
    );
    return this.findCourseElementsInDocument(document);
  }

  private findCourseElementsInDocument(doc: Document): Element[] {
    console.log("uwshuffle: Searching in document:", doc.URL || "unknown-url");

    // First, try to expand any collapsed course sections
    this.expandCollapsedSections(doc);

    // Target Quest's specific table structure
    const elements: Element[] = [];

    // Enhanced debugging - check what elements exist
    console.log("uwshuffle: Enhanced debugging:");
    console.log(
      "uwshuffle: - Total elements:",
      doc.querySelectorAll("*").length
    );
    console.log(
      "uwshuffle: - Elements with SSR:",
      doc.querySelectorAll('[id*="SSR"]').length
    );
    console.log(
      "uwshuffle: - Elements with MTG:",
      doc.querySelectorAll('[id*="MTG"]').length
    );
    console.log(
      "uwshuffle: - Elements with CLSRCH:",
      doc.querySelectorAll('[id*="CLSRCH"]').length
    );
    console.log(
      "uwshuffle: - Select inputs:",
      doc.querySelectorAll('input[value="Select"]').length
    );
    console.log(
      "uwshuffle: - All inputs:",
      doc.querySelectorAll("input").length
    );

    // Check for the specific elements we saw in the HTML
    const specificElements = [
      'div[id*="win0divSSR_CLSRCH_MTG1"]',
      'table[id*="SSR_CLSRCH_MTG1"]',
      'tr[id*="trSSR_CLSRCH_MTG1"]',
      'span[id*="MTG_CLASS_NBR"]',
      'span[id*="MTG_DAYTIME"]',
      'input[name*="SSR_PB_SELECT"]',
    ];

    for (const selector of specificElements) {
      const found = doc.querySelectorAll(selector);
      console.log(`uwshuffle: - ${selector}: ${found.length} elements`);
      if (found.length > 0 && found.length < 5) {
        Array.from(found).forEach((el, i) => {
          console.log(
            `uwshuffle:   [${i}] id="${el.id}" class="${el.className}"`
          );
        });
      }
    }

    // Find all course table rows with IDs matching Quest's pattern - be more specific
    const questRowSelectors = [
      'tr[id*="trSSR_CLSRCH_MTG1$"][id*="_row"]', // Main pattern: trSSR_CLSRCH_MTG1$0_row1, etc.
      'tr[id^="trSSR_CLSRCH_MTG1$"]', // Alternative: starts with trSSR_CLSRCH_MTG1$
      'tr[id*="SSR_CLSRCH_MTG1"]', // Backup: contains SSR_CLSRCH_MTG1
    ];

    let questRows: NodeListOf<Element> = doc.querySelectorAll("tr");

    // Try each selector until we find rows
    for (const selector of questRowSelectors) {
      questRows = doc.querySelectorAll(selector);
      console.log(
        `uwshuffle: Found ${questRows.length} rows with selector: ${selector}`
      );
      if (questRows.length > 0) break;
    }

    // If still no rows found, try a broader search for table rows containing course data
    if (questRows.length === 0) {
      console.log(
        "uwshuffle: No rows found with specific selectors, trying broader search..."
      );
      const allRows = doc.querySelectorAll("tr");
      console.log(
        "uwshuffle: Total table rows for broader search:",
        allRows.length
      );

      const courseRows: Element[] = [];

      allRows.forEach((row, index) => {
        const hasSelectButton = row.querySelector(
          'input[name*="SSR_PB_SELECT"], input[value="Select"]'
        );
        const hasClassNumber = row.querySelector(
          'span[id*="MTG_CLASS_NBR"], a[id*="MTG_CLASS_NBR"]'
        );
        const hasDayTime = row.querySelector('span[id*="MTG_DAYTIME"]');

        if (index < 10) {
          // Debug first 10 rows instead of 5
          console.log(`uwshuffle: Debug row ${index}:`, {
            id: row.id,
            className: row.className,
            hasSelectButton: !!hasSelectButton,
            hasClassNumber: !!hasClassNumber,
            hasDayTime: !!hasDayTime,
            textContent: row.textContent?.substring(0, 100),
            innerHTML: row.innerHTML.substring(0, 200),
          });
        }

        if (hasSelectButton && (hasClassNumber || hasDayTime)) {
          courseRows.push(row);
        }
      });

      questRows = courseRows as unknown as NodeListOf<Element>;
      console.log(
        `uwshuffle: Found ${questRows.length} rows with broader search`
      );
    }

    questRows.forEach((row, index) => {
      console.log(`uwshuffle: Checking row ${index + 1}:`, row.id || "no-id");

      // Check if this row contains actual course data (not headers)
      const hasSelectButton = row.querySelector(
        'input[name*="SSR_PB_SELECT"], input[value="Select"]'
      );
      const hasDayTime = row.querySelector('span[id*="MTG_DAYTIME"]');
      const hasClassNumber = row.querySelector(
        'span[id*="MTG_CLASS_NBR"], a[id*="MTG_CLASS_NBR"]'
      );

      console.log("uwshuffle: Has select button:", !!hasSelectButton);
      console.log("uwshuffle: Has day/time:", !!hasDayTime);
      console.log("uwshuffle: Has class number:", !!hasClassNumber);

      // Row is valid if it has a select button and either day/time or class number
      if (hasSelectButton && (hasDayTime || hasClassNumber)) {
        console.log("uwshuffle: Valid course row found");
        elements.push(row);
      } else {
        console.log("uwshuffle: Row rejected - missing required elements");
      }
    });

    console.log(
      "uwshuffle: Total valid course elements found:",
      elements.length
    );
    return elements;
  }

  private expandCollapsedSections(doc: Document): void {
    console.log("uwshuffle: Attempting to expand collapsed sections...");

    // Look for collapse/expand buttons and click them to expand sections
    const collapseButtons = doc.querySelectorAll(
      'a[class*="PTCOLLAPSE_ARROW"], a[title*="Collapse section"], a[id*="GROUPBOX2"]'
    );

    console.log(
      `uwshuffle: Found ${collapseButtons.length} potential collapse buttons`
    );

    collapseButtons.forEach((button, index) => {
      try {
        const isExpanded = button.getAttribute("aria-expanded");
        const title = button.getAttribute("title") || "";

        console.log(
          `uwshuffle: Button ${index}: title="${title}" aria-expanded="${isExpanded}"`
        );

        // If it's collapsed, try to expand it
        if (isExpanded === "false" || title.includes("Expand")) {
          console.log("uwshuffle: Attempting to expand collapsed section");
          (button as HTMLElement).click();
        }
      } catch (error) {
        console.log("uwshuffle: Error expanding section:", error);
      }
    });

    // Wait a moment for any dynamic content to load
    setTimeout(() => {
      console.log("uwshuffle: Finished expanding sections");
    }, 100);
  }

  private notifySidebar(action: string, data: unknown) {
    // Send message to the sidebar iframe
    const sidebar = document.getElementById(
      "uwshuffle-sidebar"
    ) as HTMLIFrameElement;
    if (sidebar && sidebar.contentWindow) {
      sidebar.contentWindow.postMessage(
        {
          type: "uwshuffle_action",
          action,
          data,
        },
        "*"
      );
    }
  }

  // Check if we're on a Quest course search results page
  private isOnCourseSearchPage(): boolean {
    // Check URL patterns for course search pages
    const url = window.location.href;
    const iframeUrl = this.iframeDoc?.URL || "";

    console.log("uwshuffle: Current URL:", url);
    console.log("uwshuffle: Iframe URL:", iframeUrl);

    // Quest course search URLs typically contain these patterns
    const coursePageScname = "ADMN_CLASS_SCHEDULE";

    const isOnSchedulePage = url.includes(coursePageScname);
    // Also check if we can find course-related elements in the page
    const hasCourseElements =
      this.iframeDoc?.querySelectorAll('tr[id*="SSR_CLSRCH_MTG1"]').length || 0;
    const hasSelectButtons =
      this.iframeDoc?.querySelectorAll('input[value="Select"]').length || 0;

    console.log("uwshuffle: Course elements found:", hasCourseElements);
    console.log("uwshuffle: Select buttons found:", hasSelectButtons);

    return isOnSchedulePage || (hasCourseElements > 0 && hasSelectButtons > 0);
  }

  // Start Quest scraper after schedule upload (called manually)
  startAfterScheduleUpload() {
    console.log("uwshuffle: Starting Quest scraper after schedule upload...");

    // Check if we're on the right page and start scraping
    if (this.isOnCourseSearchPage()) {
      console.log("uwshuffle: On course search page, starting scraper");
      this.startScraping();
    } else {
      console.log("uwshuffle: Not on a course search page, no action taken");
    }
  }

  // Legacy init method (now does nothing - scraper only starts after schedule upload)
  init() {
    console.log(
      "uwshuffle: Quest scraper init called, but waiting for schedule upload to activate"
    );
    // Do nothing - scraper will only start when startAfterScheduleUpload() is called
  }

  private startScraping() {
    console.log("uwshuffle: Starting simple scraping without polling...");

    // Add buttons immediately if elements exist
    const elementsFound = this.findCourseElements().length;
    if (elementsFound > 0) {
      console.log(`uwshuffle: Found ${elementsFound} elements, adding buttons`);
      this.addInteractionButtons();
    } else {
      console.log("uwshuffle: No course elements found");
    }

    console.log("uwshuffle: Quest scraper initialized successfully");
  }
}

// Export for use in content script
export default QuestScraper;
