import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useProperty } from "../../context/PropertyContext";
import { useAuth } from "../../context/AuthContext";
import { getRoomsByProperty, getEvidence, uploadEvidence } from "../../services/api";
import PhotoUploader from "../../components/evidence/PhotoUploader";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import { formatDate, CONDITIONS } from "../../utils/formatters";
import "./MoveInReport.css";

export default function MoveInReport() {
  const { activeProperty } = useProperty();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [evidenceMap, setEvidenceMap] = useState({}); // roomId -> evidence[]
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state for new evidence entry
  const [condition, setCondition] = useState("good");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState([]);

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
        // Build a map: roomId -> move-in evidence array
        const map = {};
        (ev || [])
          .filter((e) => e.type === "move-in")
          .forEach((e) => {
            if (!map[e.roomId]) map[e.roomId] = [];
            map[e.roomId].push(e);
          });
        setEvidenceMap(map);
      } catch (err) {
        console.error("Failed to load move-in report:", err);
        setError("Unable to load move-in inspection data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [propertyId]);

  function openModal(room) {
    setSelectedRoom(room);
    setCondition("good");
    setNotes("");
    setPhotos([]);
    setShowModal(true);
  }

  async function handleSave() {
    if (!selectedRoom) return;
    setSaving(true);
    try {
      const res = await uploadEvidence({
        propertyId,
        roomId: selectedRoom.id,
        type: "move-in",
        condition,
        notes,
        photos,
        createdBy: user?.id || 1,
      });

      const newEv = res.evidence;
      setEvidenceMap((prev) => ({
        ...prev,
        [selectedRoom.id]: [
          ...(prev[selectedRoom.id] || []),
          newEv,
        ],
      }));
      setShowModal(false);
    } catch (err) {
      console.error("Failed to upload evidence:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Loading move-in condition report…" />;

  const completedRooms = rooms.filter((r) => evidenceMap[r.id]?.length > 0).length;

  return (
    <div className="move-in-report">
      <div className="move-in-report__header">
        <div>
          <h1 className="move-in-report__title">Move-In Report</h1>
          <p className="move-in-report__sub">
            Document the condition of each room at move-in. Photos and notes create a tamper-evident record.
          </p>
        </div>
        <div className="move-in-report__progress">
          <span className="progress__fraction">
            {completedRooms} / {rooms.length}
          </span>
          <span className="progress__label">rooms documented</span>
        </div>
      </div>

      {error && <div className="move-in-error-banner">{error}</div>}

      {rooms.length === 0 ? (
        <EmptyState
          title="No rooms found"
          description="There are no rooms listed for this property yet."
        />
      ) : (
        <div className="move-in-report__rooms">
          {rooms.map((room) => {
            const roomEvidence = evidenceMap[room.id] || [];
            const isDone = roomEvidence.length > 0;
            const latest = roomEvidence[roomEvidence.length - 1];

            return (
              <div key={room.id} className={`room-row ${isDone ? "room-row--done" : ""}`}>
                <div className="room-row__info">
                  <div className="room-row__name-row">
                    {isDone && <CheckCircle2 size={16} className="room-row__check" />}
                    <span className="room-row__name">{room.name}</span>
                  </div>
                  {isDone && latest && (
                    <div className="room-row__meta">
                      <StatusBadge status={latest.condition} />
                      <span className="room-row__date">{formatDate(latest.createdAt)}</span>
                      {latest.photos?.length > 0 && (
                        <span className="room-row__photo-count">
                          {latest.photos.length} photo{latest.photos.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}
                  {latest?.notes && (
                    <p className="room-row__notes">{latest.notes}</p>
                  )}
                </div>
                <Button
                  variant={isDone ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => openModal(room)}
                  id={`room-btn-${room.id}`}
                >
                  {isDone ? "Update" : "Add Report"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && selectedRoom && (
        <Modal
          title={`${selectedRoom.name} — Condition Report`}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                id="save-evidence"
              >
                {saving ? "Saving…" : "Save Report"}
              </Button>
            </>
          }
        >
          <div className="evidence-form">
            <div className="evidence-form__group">
              <label className="evidence-form__label">Condition</label>
              <div className="condition-selector">
                {CONDITIONS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`condition-btn ${condition === c ? "condition-btn--active" : ""}`}
                    onClick={() => setCondition(c)}
                    id={`condition-${c}`}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="evidence-form__group">
              <label htmlFor="evidence-notes" className="evidence-form__label">
                Notes
              </label>
              <textarea
                id="evidence-notes"
                className="evidence-form__textarea"
                rows={3}
                placeholder="Describe any damage, wear, or notable features…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="evidence-form__group">
              <label className="evidence-form__label">Photos</label>
              <PhotoUploader onPhotosSelected={setPhotos} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
