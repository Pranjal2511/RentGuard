import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Minus } from "lucide-react";
import { useProperty } from "../../context/PropertyContext";
import { getRoomsByProperty, getEvidence } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/formatters";
import "./MoveOutComparison.css";

export default function MoveOutComparison() {
  const { activeProperty } = useProperty();
  const [rooms, setRooms] = useState([]);
  const [moveInMap, setMoveInMap] = useState({});
  const [moveOutMap, setMoveOutMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const propertyId = activeProperty?.id || "prop-001";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [r, ev] = await Promise.all([
          getRoomsByProperty(propertyId),
          getEvidence(propertyId),
        ]);
        setRooms(r || []);

        const inMap = {};
        const outMap = {};
        (ev || []).forEach((e) => {
          if (e.type === "move-in") {
            if (!inMap[e.roomId]) inMap[e.roomId] = e;
          }
          if (e.type === "move-out") {
            if (!outMap[e.roomId]) outMap[e.roomId] = e;
          }
        });
        setMoveInMap(inMap);
        setMoveOutMap(outMap);
      } catch (err) {
        console.error("Failed to load move-out comparison data:", err);
        setError("Unable to load condition comparison data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [propertyId]);

  function conditionDelta(inCondition, outCondition) {
    // 3-tier consistent condition ranking
    const rank = { good: 2, fair: 1, damaged: 0 };
    if (!outCondition) return "no-data";
    const diff = (rank[outCondition] ?? 1) - (rank[inCondition] ?? 1);
    if (diff < 0) return "worse";
    if (diff > 0) return "better";
    return "same";
  }

  if (loading) return <LoadingState message="Comparing move-in and move-out records…" />;

  const roomsWithData = rooms.filter((r) => moveInMap[r.id]);

  return (
    <div className="move-out-comparison">
      <div className="move-out-comparison__header">
        <h1 className="move-out-comparison__title">Move-Out Comparison</h1>
        <p className="move-out-comparison__sub">
          Side-by-side comparison of room conditions at move-in vs. move-out. Use this to verify
          legitimate wear-and-tear versus claimed damage.
        </p>
      </div>

      {error && <div className="move-out-error-banner">{error}</div>}

      {roomsWithData.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No move-in report found"
          description="Complete the Move-In Report first to enable side-by-side comparison."
        />
      ) : (
        <div className="comparison-table">
          {/* Header */}
          <div className="comparison-table__header">
            <div className="comparison-col comparison-col--room">Room</div>
            <div className="comparison-col">Move-In Condition</div>
            <div className="comparison-col">Move-Out Condition</div>
            <div className="comparison-col comparison-col--change">Change</div>
          </div>

          {roomsWithData.map((room) => {
            const inEv = moveInMap[room.id];
            const outEv = moveOutMap[room.id];
            const delta = conditionDelta(inEv?.condition, outEv?.condition);

            return (
              <div key={room.id} className={`comparison-row comparison-row--${delta}`}>
                <div className="comparison-col comparison-col--room">
                  <span className="comparison-room-name">{room.name}</span>
                </div>

                <div className="comparison-col">
                  <div className="condition-cell">
                    <StatusBadge status={inEv.condition} />
                    <span className="condition-cell__date">{formatDate(inEv.createdAt)}</span>
                    {inEv.notes && <p className="condition-cell__notes">{inEv.notes}</p>}
                    {inEv.photos?.length > 0 && (
                      <span className="condition-cell__photos">
                        {inEv.photos.length} photo{inEv.photos.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div className="comparison-col">
                  {outEv ? (
                    <div className="condition-cell">
                      <StatusBadge status={outEv.condition} />
                      <span className="condition-cell__date">{formatDate(outEv.createdAt)}</span>
                      {outEv.notes && <p className="condition-cell__notes">{outEv.notes}</p>}
                      {outEv.photos?.length > 0 && (
                        <span className="condition-cell__photos">
                          {outEv.photos.length} photo{outEv.photos.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="comparison-no-data">Not yet recorded</span>
                  )}
                </div>

                <div className="comparison-col comparison-col--change">
                  {delta === "worse" && (
                    <span className="delta delta--worse">
                      <AlertTriangle size={14} /> Worse
                    </span>
                  )}
                  {delta === "same" && (
                    <span className="delta delta--same">
                      <Minus size={14} /> Same
                    </span>
                  )}
                  {delta === "better" && (
                    <span className="delta delta--better">
                      <CheckCircle2 size={14} /> Better
                    </span>
                  )}
                  {delta === "no-data" && (
                    <span className="delta delta--nodata">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
