export interface Course {
  course: string;
  days: string[];
  start: string;
  end: string;
  location?: string;
  instructor?: string;
  section?: string;
}

export interface ParsedScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    course?: string;
    isPreview?: boolean;
    hasConflict?: boolean;
  };
  isPreview?: boolean;
}

// Ko-fi widget types
declare global {
  interface Window {
    kofiWidgetOverlay?: {
      draw: (username: string, config: Record<string, string>) => void;
    };
  }
}