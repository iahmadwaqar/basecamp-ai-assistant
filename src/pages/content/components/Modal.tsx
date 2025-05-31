import { useEffect, useState } from "react";

const statuses = [
  { label: "Announcement", color: "#FFFFFF", backgroundColor: "#E74C3C" }, // Red
  { label: "Brainstorming", color: "#000000", backgroundColor: "#FBBF24" }, // Amber
  { label: "Documentation", color: "#FFFFFF", backgroundColor: "#3B82F6" }, // Blue
  { label: "FYI", color: "#000000", backgroundColor: "#A5B4FC" }, // Light Indigo
  { label: "Heartbeat", color: "#FFFFFF", backgroundColor: "#EC4899" }, // Pink
  { label: "Pitch", color: "#000000", backgroundColor: "#8B5CF6" }, // Violet
  { label: "Project Review", color: "#FFFFFF", backgroundColor: "#10B981" }, // Emerald
  { label: "Project Status", color: "#000000", backgroundColor: "#06B6D4" }, // Cyan
  { label: "Question", color: "#FFFFFF", backgroundColor: "#6366F1" }, // Indigo
];

export function Modal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <div className="loading"></div>;
  }
  function getContrastColor(hexColor: string): string {
    // Convert hex to RGB
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);

    // Calculate relative luminance (perceived brightness)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }
  return (
    <div className="bca-modal-overlay">
      <div
        className="modal-sheet modal-sheet--w-medium"
        style={{ overflowY: "scroll" }}
      >
        <header className="modal-sheet__header">
          <h2 className="flush app-mobile__hide">Card Table Statuses</h2>
          <p className="push_half--top flush--bottom">
            Set up statuses for this Card Table below.
          </p>
        </header>
        <section className="u-full-width">
          {statuses.map((status) => (
            <div
              key={status.label}
              className="list-actionable list-actionable--open-ends flush--bottom"
            >
              <div className="list-actionable__row-group">
                <div className="bca-list-actionable__row">
                  <div className="bca-list-actionable__details">
                    <h4 className="bca-list-actionable__label">
                      {status.label}
                    </h4>
                    <span
                      className="list-actionable__badge"
                      style={{
                        backgroundColor: status.color,
                        color: getContrastColor(status.color),
                      }}
                    >
                      Font
                    </span>
                    <span
                      className="list-actionable__badge"
                      style={{
                        backgroundColor: status.backgroundColor,
                        color: getContrastColor(status.backgroundColor),
                      }}
                    >
                      Background
                    </span>
                  </div>
                  <span className="list-actionable__actions" style={{ border: "unset" }}>
                    <a
                      data-action="category#edit"
                      className="list-actionable__action-icon"
                      title="Edit it"
                      href="#"
                    >
                      <svg
                        className="svg-icon svg-icon--pencil-solid u-display-b txt--x-large"
                        aria-hidden="true"
                      >
                        <use href="/assets/icons/sprites-58db03ea7cb30d39556f89b77a3cb3889e6df66a44ff725ca8d3afae7951f735.svg#pencil-solid"></use>
                      </svg>
                      <span className="list-actionable__accessibility-label">
                        Edit
                      </span>
                    </a>
                    <a
                      data-action="category#destroy"
                      className="list-actionable__action-icon"
                      title="Delete it"
                      href="#"
                    >
                      <svg
                        className="svg-icon svg-icon--trash-solid u-display-b txt--x-large"
                        aria-hidden="true"
                      >
                        <use href="/assets/icons/sprites-58db03ea7cb30d39556f89b77a3cb3889e6df66a44ff725ca8d3afae7951f735.svg#trash-solid"></use>
                      </svg>
                      <span className="list-actionable__accessibility-label">
                        Delete
                      </span>
                    </a>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>
        <div id="new_category">
          <div className="collapsed_content push_half--top">
            <button className="btn btn--small" data-behavior="expand_on_click">
              Add a category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
