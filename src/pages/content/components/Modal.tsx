import { useEffect, useState } from "react";

const categories = [
  { emoji: "📢", label: "Announcement" },
  { emoji: "🌟", label: "Brainstorming" },
  { emoji: "✨", label: "Documentation" },
  { emoji: "✨", label: "FYI" },
  { emoji: "❤️", label: "Heartbeat" },
  { emoji: "💡", label: "Pitch" },
  { emoji: "✨", label: "Project Review" },
  { emoji: "📈", label: "Project Status" },
  { emoji: "👋", label: "Question" },
];

export function Modal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <div className="loading"></div>;
  }

  return (
    <div className="bca-modal-overlay" onClick={onClose}>
      <div className="modal-sheet modal-sheet--w-small">
        <header className="modal-sheet__header">
          <h2 className="flush app-mobile__hide">Message Board categories</h2>
          <p className="push_half--top flush--bottom">
            Set up categories for this Message Board below.
          </p>
        </header>
        <section className="u-full-width">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="list-actionable list-actionable--open-ends flush--bottom"
            >
              <div className="list-actionable__row-group">
                <div className="list-actionable__row list-actionable__row--hide-when-editing">
                  <div className="list-actionable__details">
                    <h4 className="flush">
                      <span className="list-actionable__emoji">✨</span>
                      {cat.label}
                    </h4>
                  </div>
                  <span className="list-actionable__actions">
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
