import { Circle } from "lucide-react";
import { formatDate } from "../../utils/formatters";
import "./DisputeTimeline.css";

export default function DisputeTimeline({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="dispute-timeline">
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <div key={event.id} className="timeline-event">
            <div className="timeline-event__track">
              <div className="timeline-event__dot">
                {isLast ? <Circle size={10} fill="#2F4F3D" color="#2F4F3D" /> : <Circle size={10} fill="#D8D4C9" color="#D8D4C9" />}
              </div>
              {!isLast && <div className="timeline-event__line" />}
            </div>
            <div className="timeline-event__content">
              <p className="timeline-event__text">{event.event}</p>
              <span className="timeline-event__date">{formatDate(event.date)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
