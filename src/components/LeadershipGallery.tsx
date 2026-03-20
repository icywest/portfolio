import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { withBase } from "../utils/withBase";

const placeholderEventImage = withBase("/images/placeholder-event.jpg");

interface Event {
  id: string;
  name: string;
  role: string;
  type: string;
  date: string;
  location: string;
  description: string;
  purpose?: string;
  organization?: string | string[];
  myContributions?: string[];
  skills?: string[];
  highlights: string[];
  tags: string[];
  image: string;
  gallery?: string[];
  status: string;
  impact?: string[];
}

interface Props {
  events: Event[];
  types: string[];
  allTags: string[];
}

const typeIcons: Record<string, string> = {
  conference: "🎤",
  workshop: "💻",
  panel: "👥",
  hackathon: "🚀",
  series: "📅",
};

export default function LeadershipGallery({ events, types, allTags }: Props) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Check if any filters are active
  const hasActiveFilters = activeType !== null || activeTags.length > 0;

  // Toggle tag filter
  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = !activeType || event.type === activeType;
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.every((tag) => event.tags?.includes(tag));

      return matchesType && matchesTags;
    });
  }, [events, activeType, activeTags]);

  // Open modal
  const openModal = (event: Event, buttonEl: HTMLButtonElement) => {
    triggerRef.current = buttonEl;
    setSelectedEvent(event);
    setGalleryIndex(0);
  };

  // Close modal
  const closeModal = useCallback(() => {
    setSelectedEvent(null);
    triggerRef.current?.focus();
  }, []);

  // Reset all filters
  const resetFilters = () => {
    setActiveType(null);
    setActiveTags([]);
  };

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedEvent) return;

      if (e.key === "Escape") {
        closeModal();
        return;
      }

      if (selectedEvent.gallery && selectedEvent.gallery.length > 1) {
        if (e.key === "ArrowRight") {
          setGalleryIndex((prev) =>
            prev < selectedEvent.gallery!.length - 1 ? prev + 1 : 0
          );
        }
        if (e.key === "ArrowLeft") {
          setGalleryIndex((prev) =>
            prev > 0 ? prev - 1 : selectedEvent.gallery!.length - 1
          );
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedEvent, closeModal]);

  // Focus trap (modal)
  useEffect(() => {
    if (!selectedEvent || !modalRef.current) return;

    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [selectedEvent]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedEvent ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEvent]);

  // Helper to normalize organization field
  const getOrganizations = (org: string | string[] | undefined): string[] => {
    if (!org) return [];
    return Array.isArray(org) ? org : [org];
  };

  return (
    <div className="gallery">
      {/* Filter Controls */}
      <div className="gallery__controls">
        <div className="gallery__filters">
          {/* Type Filter */}
          <div className="gallery__filter-group">
            <span className="gallery__filter-label"># type</span>
            <div className="gallery__chips">
              <button
                type="button"
                className={`gallery__chip ${!activeType ? "gallery__chip--active" : ""}`}
                onClick={() => setActiveType(null)}
              >
                all
              </button>
              {types.map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`gallery__chip ${activeType === type ? "gallery__chip--active" : ""}`}
                  onClick={() =>
                    setActiveType(activeType === type ? null : type)
                  }
                >
                  {typeIcons[type] || "★"} {type}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          <div className="gallery__filter-group">
            <span className="gallery__filter-label"># tags</span>
            <div className="gallery__chips">
              {allTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`gallery__chip gallery__chip--tag ${
                    activeTags.includes(tag) ? "gallery__chip--active" : ""
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="gallery__active-filters">
            <span className="gallery__results-count">
              {filteredEvents.length} event
              {filteredEvents.length !== 1 ? "s" : ""} found
            </span>
            <button
              type="button"
              className="gallery__clear-all"
              onClick={resetFilters}
            >
              clear all
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className="gallery__grid">
        {filteredEvents.map((event, i) => (
          <article key={event.id} className="gallery__card">
            {/* Window Top Bar */}
            <div className="gallery__card-top">
              <div className="gallery__dots">
                <span className="gallery__dot gallery__dot--r" />
                <span className="gallery__dot gallery__dot--y" />
                <span className="gallery__dot gallery__dot--g" />
              </div>
              <span className="gallery__card-file">
                event_{String(i + 1).padStart(2, "0")}.story
              </span>
              <span
                className={`gallery__status ${
                  event.status === "ongoing"
                    ? "gallery__status--ongoing"
                    : "gallery__status--completed"
                }`}
              >
                {event.status}
              </span>
            </div>

            {/* Cover Image */}
            <div className="gallery__card-image">
              <img
                src={withBase(event.image)}
                alt={event.name}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderEventImage;
                }}
              />
              <div className="gallery__card-overlay">
                <span className="gallery__card-type">
                  {typeIcons[event.type] || "★"} {event.type}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="gallery__card-body">
              <div className="gallery__card-meta">
                <span className="gallery__card-date">{event.date}</span>
                <span className="gallery__card-location">
                  📍 {event.location}
                </span>
              </div>

              <h3 className="gallery__card-name">{event.name}</h3>
              <p className="gallery__card-role">{event.role}</p>

              {event.purpose && (
                <p className="gallery__card-purpose">
                  <span className="gallery__purpose-label">// purpose</span>
                  {event.purpose.length > 120
                    ? `${event.purpose.substring(0, 120)}...`
                    : event.purpose}
                </p>
              )}

              {/* Impact/Output Indicators */}
              {event.impact && event.impact.length > 0 && (
                <div className="gallery__card-impact">
                  {event.impact.map((item, idx) => (
                    <span key={idx} className="gallery__impact-tag">
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="gallery__card-tags">
                {event.tags.map((tag) => (
                  <span key={tag} className="gallery__tag">
                    {tag}
                  </span>
                ))}
              </div>

              {/* View Story Button */}
              <button
                type="button"
                className="gallery__card-btn"
                onClick={(e) => openModal(event, e.currentTarget)}
                aria-label={`View story for ${event.name}`}
              >
                <span className="gallery__btn-prompt">$</span>
                <span className="gallery__btn-cmd">cat story.md</span>
                <span className="gallery__btn-arrow">→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="gallery__empty">
          <span className="gallery__empty-icon">∅</span>
          <p>No events match your filters</p>
          <button
            type="button"
            className="gallery__empty-btn"
            onClick={resetFilters}
          >
            reset filters
          </button>
        </div>
      )}

      {/* Story Modal */}
      {selectedEvent && (
        <div
          className="modal__backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal" ref={modalRef}>
            {/* Modal Top Bar */}
            <div className="modal__top">
              <div className="gallery__dots">
                <span className="gallery__dot gallery__dot--r" />
                <span className="gallery__dot gallery__dot--y" />
                <span className="gallery__dot gallery__dot--g" />
              </div>
              <span className="modal__file">{selectedEvent.id}.story</span>
              <button
                type="button"
                className="modal__close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="modal__content">
              {/* Image Gallery */}
              <div className="modal__gallery">
                <img
                  src={
                    selectedEvent.gallery && selectedEvent.gallery.length > 0
                      ? withBase(selectedEvent.gallery[galleryIndex])
                      : withBase(selectedEvent.image)
                  }
                  alt={selectedEvent.name}
                  className="modal__image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholderEventImage;
                  }}
                />

                {selectedEvent.gallery && selectedEvent.gallery.length > 1 && (
                  <div className="modal__gallery-nav">
                    <button
                      type="button"
                      className="modal__gallery-btn"
                      onClick={() =>
                        setGalleryIndex((prev) =>
                          prev > 0
                            ? prev - 1
                            : selectedEvent.gallery!.length - 1
                        )
                      }
                      aria-label="Previous image"
                    >
                      ←
                    </button>
                    <span className="modal__gallery-count">
                      {galleryIndex + 1} / {selectedEvent.gallery.length}
                    </span>
                    <button
                      type="button"
                      className="modal__gallery-btn"
                      onClick={() =>
                        setGalleryIndex((prev) =>
                          prev < selectedEvent.gallery!.length - 1
                            ? prev + 1
                            : 0
                        )
                      }
                      aria-label="Next image"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>

              {/* Story Content */}
              <div className="modal__story">
                <header className="modal__header">
                  <div className="modal__meta">
                    <span className="modal__type">
                      {typeIcons[selectedEvent.type] || "★"}{" "}
                      {selectedEvent.type}
                    </span>
                    <span className="modal__date">{selectedEvent.date}</span>
                  </div>

                  <h2 id="modal-title" className="modal__title">
                    {selectedEvent.name}
                  </h2>
                  <p className="modal__role">{selectedEvent.role}</p>
                  <p className="modal__location">
                    📍 {selectedEvent.location}
                  </p>
                </header>

                {/* Purpose */}
                {selectedEvent.purpose && (
                  <section className="modal__section">
                    <h3 className="modal__section-title">
                      <span className="modal__section-hash">#</span> Purpose
                    </h3>
                    <p className="modal__section-text">
                      {selectedEvent.purpose}
                    </p>
                  </section>
                )}

                {/* Organization / Partners */}
                {selectedEvent.organization && (
                  <section className="modal__section">
                    <h3 className="modal__section-title">
                      <span className="modal__section-hash">#</span>{" "}
                      Organization / Partners
                    </h3>
                    <div className="modal__orgs">
                      {getOrganizations(selectedEvent.organization).map(
                        (org, idx) => (
                          <span key={idx} className="modal__org">
                            {org}
                          </span>
                        )
                      )}
                    </div>
                  </section>
                )}

                {/* My Contributions */}
                {selectedEvent.myContributions &&
                  selectedEvent.myContributions.length > 0 && (
                    <section className="modal__section">
                      <h3 className="modal__section-title">
                        <span className="modal__section-hash">#</span> What I
                        Built / Delivered
                      </h3>
                      <ul className="modal__list">
                        {selectedEvent.myContributions.map((item, idx) => (
                          <li key={idx} className="modal__list-item">
                            <span className="modal__list-marker">→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                {/* Skills */}
                {selectedEvent.skills && selectedEvent.skills.length > 0 && (
                  <section className="modal__section">
                    <h3 className="modal__section-title">
                      <span className="modal__section-hash">#</span> Skills
                      Demonstrated
                    </h3>
                    <div className="modal__skills">
                      {selectedEvent.skills.map((skill, idx) => (
                        <span key={idx} className="modal__skill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Highlights */}
                {selectedEvent.highlights &&
                  selectedEvent.highlights.length > 0 && (
                    <section className="modal__section">
                      <h3 className="modal__section-title">
                        <span className="modal__section-hash">#</span>{" "}
                        Highlights
                      </h3>
                      <ul className="modal__list">
                        {selectedEvent.highlights.map((item, idx) => (
                          <li key={idx} className="modal__list-item">
                            <span className="modal__list-marker">✦</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                {/* Tags */}
                <section className="modal__section">
                  <h3 className="modal__section-title">
                    <span className="modal__section-hash">#</span> Tags
                  </h3>
                  <div className="modal__tags">
                    {selectedEvent.tags.map((tag) => (
                      <span key={tag} className="gallery__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
