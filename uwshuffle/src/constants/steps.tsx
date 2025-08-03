export const steps = [
  {
    target: ".schedule-upload-container",
    content: (
      <div>
        <img
          src="/step1.gif"
          alt="Paste your schedule demo"
          style={{ width: "100%", marginBottom: 8, borderRadius: 8 }}
        />
        <p>
          Start by pasting your <strong>current schedule</strong> in the Action Center. Watch
          the GIF above for help.
        </p>
      </div>
    ),
    placement: "top" as const,
  },
  {
    target: ".schedule-upload-course-dropdown-container",
    content: (
      <p>
        Select a course you want to <strong>swap out</strong> from your uploaded
        schedule.
      </p>
    ),
    placement: "top" as const,
  },
  {
    target: ".schedule-upload-primary",
    content: (
      <p>
        Click <strong>Scrape Swaps</strong> to preview alternatives from{" "}
        <strong>Quest</strong>.
      </p>
    ),
    placement: "top" as const,
  },
  {
    target: ".uwshuffle-stats-section",
    content: (
      <p>
        View course details and instructor ratings from{" "}
        <img
          src="/uwflow.png"
          alt="UW Flow logo"
          style={{
            height: "14px",
            marginLeft: "3px",
            verticalAlign: "middle",
            marginBottom: "4px",
          }}
        />{" "}
        <strong>
          UW <span style={{ color: "var(--color-primary-dark)" }}>Flow</span>
        </strong>
        .
      </p>
    ),
    placement: "bottom" as const,
  },
  {
    target: ".uwshuffle-calendar-card",
    content: (
      <p>
        Here is where you can preview your schedule. The selected preview course
        will show up in{" "}
        <span style={{ color: "var(--color-success)" }}>
          <strong>green</strong>
        </span>{" "}
        if it fits, or{" "}
        <span style={{ color: "var(--color-error)" }}>
          <strong>red</strong>
        </span>{" "}
        if there's a conflict.
      </p>
    ),
    placement: "top" as const,
  },

  {
    target: ".uwshuffle-share-button",
    content:
      "Click here to share your schedule with others using a UW Shuffle quick-link. This link will live permanently.",
    placement: "top" as const,
  },
  {
    target: ".uwshuffle-input-wrapper",
    content:
      "Paste a friend's quick link here to overlay their schedule on yours. This way you can see what classes you both share :)",
    placement: "bottom" as const,
  },
  {
    target: ".uwshuffle-export-buttons",
    content: (
      <p>
        Export your schedule with or without the swapped course here. It will
        download an <code>.ics</code> calendar file, which you can import into
        Google Calendar or any other calendar app.
      </p>
    ),
    placement: "top" as const,
  },
];
