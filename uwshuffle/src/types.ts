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
export interface ProfInfo {
  name: string;
  rating: {
    clear: number;
    comment_count: number;
    engaging: number;
    filled_count: number;
    liked: number;
  };
}

export interface ProfQueryResponse {
  data: {
    prof: Array<ProfInfo>;
  };
}
export interface FriendSchedule {
  name: string;
  visible: boolean;
  color: string;
  schedule: Course[];
}
