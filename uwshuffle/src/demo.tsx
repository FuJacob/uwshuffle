// import React from "react";
// import ReactDOM from "react-dom/client";
// import "./index.css";
// import "react-big-calendar/lib/css/react-big-calendar.css";

// // Import components
// import Sidebar from "./components/Sidebar";
// import PasteZone from "./components/PasteZone";
// import ActionBar from "./components/ActionBar";
// import CalendarView from "./components/CalendarView";
// import type { Course } from "./types";

// // Mock data for sidebar demo
// const mockCourses: Course[] = [
//   {
//     course: "CS 135",
//     days: ["Mo", "We", "Fr"],
//     start: "09:30",
//     end: "10:20",
//     location: "MC 2065",
//     instructor: "Dr. Smith",
//   },
//   {
//     course: "MATH 137",
//     days: ["Tu", "Th"],
//     start: "11:30",
//     end: "12:50",
//     location: "MC 2038",
//     instructor: "Prof. Johnson",
//   },
//   {
//     course: "PHYS 111",
//     days: ["Mo", "We", "Fr"],
//     start: "14:30",
//     end: "15:20",
//     location: "PHY 150",
//     instructor: "Dr. Brown",
//   },
// ];

// const mockPreviewCourse: Course = {
//   course: "CS 136",
//   days: ["Mo", "We", "Fr"],
//   start: "10:30",
//   end: "11:20",
//   location: "MC 2066",
//   instructor: "Dr. Wilson",
// };

// const mockFriendSchedules = [
//   {
//     name: "Alice",
//     courses: [
//       {
//         course: "CS 135",
//         days: ["Mo", "We", "Fr"],
//         start: "09:30",
//         end: "10:20",
//         location: "MC 2065",
//         instructor: "Dr. Smith",
//       },
//     ],
//   },
//   {
//     name: "Bob",
//     courses: [
//       {
//         course: "MATH 137",
//         days: ["Tu", "Th"],
//         start: "11:30",
//         end: "12:50",
//         location: "MC 2038",
//         instructor: "Prof. Johnson",
//       },
//     ],
//   },
// ];

// // Demo state management
// let demoState = {
//   pasteZoneActive: false,
//   pastedText: "",
//   darkMode: false,
//   courses: mockCourses,
//   previewCourse: mockPreviewCourse,
//   friendSchedules: mockFriendSchedules,
//   sidebarCollapsed: false,
//   currentStep: 1,
//   totalSteps: 4,
// };

// // Global functions for HTML buttons
// (window as any).restartLogoAnimation = () => {
//   const logoDemo = document.getElementById("logo-demo");
//   if (logoDemo) {
//     logoDemo.innerHTML = "";
//     ReactDOM.createRoot(logoDemo).render(<LogoDemo />);
//   }
// };

// (window as any).togglePasteZoneActive = () => {
//   demoState.pasteZoneActive = !demoState.pasteZoneActive;
//   updatePasteZoneDemo();
//   updateStatus(
//     "pastezone-status",
//     `Status: ${demoState.pasteZoneActive ? "Active" : "Inactive"}`
//   );
// };

// (window as any).clearPastedText = () => {
//   demoState.pastedText = "";
//   updatePasteZoneDemo();
//   updateStatus("pastezone-status", "Status: Cleared");
// };

// (window as any).toggleDarkMode = () => {
//   demoState.darkMode = !demoState.darkMode;
//   updateActionBarDemo();
//   updateStatus(
//     "actionbar-status",
//     `Dark Mode: ${demoState.darkMode ? "On" : "Off"}`
//   );
// };

// (window as any).simulateRateClick = () => {
//   console.log("Rate button clicked!");
//   updateStatus("actionbar-status", "Rate clicked! Check console.");
// };

// (window as any).addSampleCourse = () => {
//   const sampleCourse: Course = {
//     course: "CS 135",
//     days: ["Mo", "We", "Fr"],
//     start: "09:30",
//     end: "10:20",
//     location: "MC 2065",
//     instructor: "Dr. Smith",
//   };
//   demoState.courses.push(sampleCourse);
//   updateCalendarDemo();
//   updateStatus("calendar-status", `Courses: ${demoState.courses.length}`);
// };

// (window as any).clearCalendar = () => {
//   demoState.courses = [];
//   updateCalendarDemo();
//   updateStatus("calendar-status", "Courses: 0");
// };

// (window as any).toggleSidebarCollapsed = () => {
//   demoState.sidebarCollapsed = !demoState.sidebarCollapsed;
//   updateSidebarDemo();
//   updateStatus(
//     "sidebar-status",
//     `Sidebar: ${demoState.sidebarCollapsed ? "Collapsed" : "Expanded"}`
//   );
// };

// (window as any).resetSidebar = () => {
//   demoState.sidebarCollapsed = false;
//   updateSidebarDemo();
//   updateStatus("sidebar-status", "Sidebar: Reset");
// };

// (window as any).nextStep = () => {
//   demoState.currentStep = Math.min(
//     demoState.currentStep + 1,
//     demoState.totalSteps
//   );
//   updateSidebarDemo();
//   updateStatus(
//     "sidebar-status",
//     `Step: ${demoState.currentStep}/${demoState.totalSteps}`
//   );
// };

// (window as any).prevStep = () => {
//   demoState.currentStep = Math.max(demoState.currentStep - 1, 1);
//   updateSidebarDemo();
//   updateStatus(
//     "sidebar-status",
//     `Step: ${demoState.currentStep}/${demoState.totalSteps}`
//   );
// };

// // Helper functions
// function updateStatus(elementId: string, text: string) {
//   const element = document.getElementById(elementId);
//   if (element) {
//     element.textContent = text;
//   }
// }

// function updatePasteZoneDemo() {
//   const pasteZoneDemo = document.getElementById("pastezone-demo");
//   if (pasteZoneDemo) {
//     ReactDOM.createRoot(pasteZoneDemo).render(
//       <PasteZoneDemo
//         isActive={demoState.pasteZoneActive}
//         pastedText={demoState.pastedText}
//         onPaste={(e) => {
//           const text = e.clipboardData.getData("text");
//           demoState.pastedText = text;
//           updatePasteZoneDemo();
//           updateStatus(
//             "pastezone-status",
//             `Pasted: ${text.substring(0, 50)}...`
//           );
//         }}
//       />
//     );
//   }
// }

// function updateActionBarDemo() {
//   const actionBarDemo = document.getElementById("actionbar-demo");
//   if (actionBarDemo) {
//     ReactDOM.createRoot(actionBarDemo).render(
//       <ActionBarDemo isDarkMode={demoState.darkMode} />
//     );
//   }
// }

// function updateCalendarDemo() {
//   const calendarDemo = document.getElementById("calendar-demo");
//   if (calendarDemo) {
//     ReactDOM.createRoot(calendarDemo).render(
//       <CalendarDemo courses={demoState.courses} />
//     );
//   }
// }

// function updateSidebarDemo() {
//   const sidebarDemo = document.getElementById("sidebar-demo");
//   if (sidebarDemo) {
//     ReactDOM.createRoot(sidebarDemo).render(
//       <SidebarDemo
//         collapsed={demoState.sidebarCollapsed}
//         courses={demoState.courses}
//         previewCourse={demoState.previewCourse}
//         friendSchedules={demoState.friendSchedules}
//         currentStep={demoState.currentStep}
//       />
//     );
//   }
// }

// // Demo Components
// const LogoDemo: React.FC = () => {
//   return (
//     <div
//       style={{
//         height: "200px",
//         width: "100%",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: "#f0f4ff",
//         borderRadius: "8px",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "32px",
//           animation: "fadeIn 0.2s ease-out",
//         }}
//       >
//         <img
//           src="/logo.svg"
//           alt="UW Shuffle Logo"
//           style={{
//             width: "80px",
//             height: "80px",
//             animation: "slideFromRight 0.8s ease-out 0.1s forwards",
//           }}
//         />
//         <div
//           style={{
//             fontSize: "48px",
//             fontWeight: "800",
//             color: "#0f172a",
//             animation: "slideFromLeft 0.8s ease-out 0.1s forwards",
//             letterSpacing: "-0.025em",
//             whiteSpace: "nowrap",
//           }}
//         >
//           UW Shuffle
//         </div>
//       </div>
//     </div>
//   );
// };

// const PasteZoneDemo: React.FC<{
//   isActive: boolean;
//   pastedText: string;
//   onPaste: (e: React.ClipboardEvent) => void;
// }> = ({ isActive, pastedText, onPaste }) => {
//   return (
//     <div style={{ width: "100%" }}>
//       <PasteZone onPaste={onPaste} isActive={isActive} />
//       {pastedText && (
//         <div
//           style={{
//             marginTop: "16px",
//             padding: "12px",
//             backgroundColor: "#f8faff",
//             borderRadius: "8px",
//             fontSize: "14px",
//             border: "1px solid #e1e8ff",
//             color: "#475569",
//           }}
//         >
//           <strong>Pasted Text:</strong> {pastedText}
//         </div>
//       )}
//     </div>
//   );
// };

// const ActionBarDemo: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
//   return (
//     <ActionBar
//       isDarkMode={isDarkMode}
//       onToggleDarkMode={() => {
//         demoState.darkMode = !demoState.darkMode;
//         updateActionBarDemo();
//         updateStatus(
//           "actionbar-status",
//           `Dark Mode: ${demoState.darkMode ? "On" : "Off"}`
//         );
//       }}
//       onRateClick={() => {
//         console.log("Rate clicked!");
//         updateStatus("actionbar-status", "Rate clicked! Check console.");
//       }}
//       onKofiClick={() => {
//         console.log("Kofi clicked!");
//         updateStatus("actionbar-status", "Kofi clicked! Check console.");
//       }}
//       onHelpClick={() => {
//         console.log("Help clicked!");
//         updateStatus("actionbar-status", "Help clicked! Check console.");
//       }}
//       onCloseSidebar={() => {
//         console.log("Close sidebar clicked!");
//         updateStatus("actionbar-status", "Close clicked! Check console.");
//       }}
//     />
//   );
// };

// const CalendarDemo: React.FC<{ courses: Course[] }> = ({ courses }) => {
//   return (
//     <div style={{ height: "100%", width: "100%" }}>
//       <CalendarView
//         courses={courses}
//         previewCourse={null}
//         friendSchedules={[]}
//         selectedCourseToSwap={null}
//       />
//     </div>
//   );
// };

// const SidebarDemo: React.FC<{
//   collapsed: boolean;
//   courses: Course[];
//   previewCourse: Course | null;
//   friendSchedules: any[];
//   currentStep: number;
// }> = ({ collapsed, courses, previewCourse, friendSchedules, currentStep }) => {
//   return (
//     <div style={{ height: "100%", width: "100%" }}>
//       <Sidebar />
//     </div>
//   );
// };

// // Initialize all demos
// document.addEventListener("DOMContentLoaded", () => {
//   // Logo Demo
//   const logoDemo = document.getElementById("logo-demo");
//   if (logoDemo) {
//     ReactDOM.createRoot(logoDemo).render(<LogoDemo />);
//   }

//   // PasteZone Demo
//   updatePasteZoneDemo();

//   // ActionBar Demo
//   updateActionBarDemo();

//   // Calendar Demo
//   updateCalendarDemo();

//   // Sidebar Demo
//   updateSidebarDemo();
// });

// // Add CSS animations
// const style = document.createElement("style");
// style.textContent = `
//   @keyframes fadeIn {
//     from { opacity: 0; }
//     to { opacity: 1; }
//   }

//   @keyframes slideFromLeft {
//     from {
//       opacity: 0;
//       transform: translateX(-100px);
//     }
//     to {
//       opacity: 1;
//       transform: translateX(0);
//     }
//   }

//   @keyframes slideFromRight {
//     from {
//       opacity: 0;
//       transform: translateX(100px);
//     }
//     to {
//       opacity: 1;
//       transform: translateX(0);
//     }
//   }
// `;
// document.head.appendChild(style);
