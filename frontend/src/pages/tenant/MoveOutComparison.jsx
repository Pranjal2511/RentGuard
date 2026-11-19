import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Minus, Eye, Sparkles } from "lucide-react";
import axios from "axios";
import { useProperty } from "../../context/PropertyContextValue";
import { getRoomsByProperty, getEvidence } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { formatDate } from "../../utils/formatters";
import "./MoveOutComparison.css";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

export default function MoveOutComparison() {
  const { activeProperty } = useProperty();
  const [rooms, setRooms] = useState([]);
  const [moveInMap, setMoveInMap] = useState({});
  const [moveOutMap, setMoveOutMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Interactive Comparison Modal State
  const [activeModalRoom, setActiveModalRoom] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);

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
          const rId = e.roomId?.id || e.roomId?._id || e.roomId;
          if (e.type === "move-in" || e.type === "MOVE_IN") {
            if (!inMap[rId]) inMap[rId] = e;
          }
          if (e.type === "move-out" || e.type === "MOVE_OUT") {
            if (!outMap[rId]) outMap[rId] = e;
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
    const rank = { excellent: 3, good: 2, fair: 1, poor: 0, damaged: 0 };
    if (!outCondition) return "no-data";
    const inRank = rank[inCondition] ?? 2;
    const outRank = rank[outCondition] ?? 2;
    const diff = outRank - inRank;
    if (diff < 0) return "worse";
    if (diff > 0) return "better";
    return "same";
  }

  function openComparisonModal(room) {
    setActiveModalRoom(room);
    setAiAnalysis(null);
  }

  async function handleRunAiComparison(inEv, outEv, room) {
    setAnalyzingAi(true);
    setAiAnalysis(null);
    try {
      const res = await axios.post(`${API_BASE}/ai/compare-inspections`, {
        moveInPhoto: inEv?.photos?.[0]?.url || null,
        moveOutPhoto: outEv?.photos?.[0]?.url || null,
        room: room.name,
        component: "Walls / Fixtures",
        moveInNotes: inEv?.notes || "",
        moveOutNotes: outEv?.notes || "",
      });

      if (res.data?.success && res.data.data) {
        setAiAnalysis(res.data.data);
      }
    } catch {
      setAiAnalysis({
        isAvailable: false,
        message: "AI service offline. Visual baseline preserved for mutual human inspection.",
        requiresHumanReview: true,
      });
    } finally {
      setAnalyzingAi(false);
    }
  }

  if (loading) return <LoadingState message="Comparing move-in and move-out records…" />;

  const roomsWithData = rooms.filter((r) => moveInMap[r.id || r._id]);

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
            <div className="comparison-col comparison-col--actions">Inspection</div>
          </div>

          {roomsWithData.map((room) => {
            const roomId = room.id || room._id;
            const inEv = moveInMap[roomId];
            const outEv = moveOutMap[roomId];
            const delta = conditionDelta(inEv?.condition, outEv?.condition);

            return (
              <div key={roomId} className={`comparison-row comparison-row--${delta}`}>
                <div className="comparison-col comparison-col--room">
                  <span className="comparison-room-name">{room.name}</span>
                </div>

                <div className="comparison-col">
                  <div className="condition-cell">
                    <StatusBadge status={inEv?.condition || "good"} />
                    <span className="condition-cell__date">{formatDate(inEv?.createdAt)}</span>
                    {inEv?.notes && <p className="condition-cell__notes">{inEv.notes}</p>}
                    {inEv?.photos?.length > 0 && (
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

                <div className="comparison-col comparison-col--actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openComparisonModal(room)}
                  >
                    <Eye size={14} /> Compare
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Visual Comparison Modal */}
      {activeModalRoom && (
        <Modal
          title={`Visual Comparison — ${activeModalRoom.name}`}
          onClose={() => setActiveModalRoom(null)}
          footer={
            <Button variant="secondary" onClick={() => setActiveModalRoom(null)}>
              Close Inspection
            </Button>
          }
        >
          {(() => {
            const rId = activeModalRoom.id || activeModalRoom._id;
            const inEv = moveInMap[rId];
            const outEv = moveOutMap[rId];
            const inPhoto = inEv?.photos?.[0]?.url;
            const outPhoto = outEv?.photos?.[0]?.url;

            return (
              <div className="modal-comparison-content">
                <div className="comparison-slider-header">
                  <div>
                    <span className="comparison-slider-title">Before vs After Comparison</span>
                    <p className="comparison-slider-sub">
                      Compare baseline move-in condition against final handover state.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={analyzingAi}
                    onClick={() => handleRunAiComparison(inEv, outEv, activeModalRoom)}
                  >
                    <Sparkles size={14} /> {analyzingAi ? "Analyzing…" : "Run AI Vision Check"}
                  </Button>
                </div>

                {/* Side-by-side or slider images */}
                <div className="visual-comparison-box">
                  <div className="visual-half visual-half--in">
                    <span className="visual-tag">Move-In ({formatDate(inEv?.createdAt)})</span>
                    {inPhoto ? (
                      <img src={inPhoto} alt="Move-in state" className="visual-img" />
                    ) : (
                      <div className="visual-img-placeholder">No Move-In Photo Uploaded</div>
                    )}
                    <p className="visual-caption">{inEv?.notes || "No notes recorded."}</p>
                  </div>

                  <div className="visual-half visual-half--out">
                    <span className="visual-tag">Move-Out ({outEv ? formatDate(outEv?.createdAt) : "Pending"})</span>
                    {outPhoto ? (
                      <img src={outPhoto} alt="Move-out state" className="visual-img" />
                    ) : (
                      <div className="visual-img-placeholder">No Move-Out Photo Uploaded</div>
                    )}
                    <p className="visual-caption">{outEv?.notes || "No move-out notes recorded."}</p>
                  </div>
                </div>

                {/* AI Assistant Output Card */}
                {aiAnalysis && (
                  <div className="ai-analysis-card">
                    <div className="ai-analysis-header">
                      <Sparkles size={16} />
                      <span className="ai-analysis-title">AI Vision Inspection Analysis</span>
                      {aiAnalysis.confidence && (
                        <span className="ai-confidence-badge">
                          Confidence: {Math.round(aiAnalysis.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    {aiAnalysis.observations?.map((obs, idx) => (
                      <p key={idx} className="ai-observation-text">• {obs}</p>
                    ))}
                    {aiAnalysis.message && (
                      <p className="ai-observation-text">{aiAnalysis.message}</p>
                    )}
                    <div className="ai-disclaimer">
                      Note: AI comparisons assist human review and do not determine contractual or legal liability.
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
