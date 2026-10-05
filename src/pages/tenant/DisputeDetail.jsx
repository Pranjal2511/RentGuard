import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Scale } from "lucide-react";
import { useProperty } from "../../context/PropertyContext";
import { useAuth } from "../../context/AuthContext";
import { getDispute, getDisputes, addComment } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import DisputeTimeline from "../../components/disputes/DisputeTimeline";
import CommentThread from "../../components/disputes/CommentThread";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, formatDate } from "../../utils/formatters";
import "./DisputeDetail.css";

export default function DisputeDetail() {
  const { disputeId } = useParams();
  const { activeProperty } = useProperty();
  const { user } = useAuth();
  const [dispute, setDispute] = useState(null);
  const [allDisputes, setAllDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  const propertyId = activeProperty?.id || dispute?.propertyId || "prop-001";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [d, all] = await Promise.all([
          getDispute(disputeId),
          getDisputes(propertyId),
        ]);
        setDispute(d);
        setAllDisputes(all || []);
      } catch (err) {
        console.error("Failed to load dispute details:", err);
        setError("Unable to load dispute details. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [disputeId, propertyId]);

  async function handleComment() {
    if (!commentText.trim() || !dispute) return;
    try {
      const commentPayload = {
        userId: user?.id || 1,
        userName: user?.name || "You",
        text: commentText.trim(),
      };
      const res = await addComment(dispute.id, commentPayload);
      const newComment = res.comment;

      setDispute((prev) => ({
        ...prev,
        comments: [...(prev?.comments || []), newComment],
      }));
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  }

  if (loading) return <LoadingState message="Loading dispute details…" />;

  if (error) {
    return (
      <div className="dispute-detail">
        <EmptyState
          icon={Scale}
          title="Error loading dispute"
          description={error}
          action={
            <Link to="/tenant/disputes" className="dispute-back-link">
              ← Back to disputes
            </Link>
          }
        />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="dispute-detail">
        <EmptyState
          icon={Scale}
          title="Dispute not found"
          description="This dispute record could not be found or does not exist."
          action={
            <Link to="/tenant/disputes" className="dispute-back-link">
              ← Back to disputes
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="dispute-detail">
      {/* Back nav to disputes list */}
      <Link to="/tenant/disputes" className="dispute-back-link" id="dispute-back">
        <ArrowLeft size={15} /> Back to disputes
      </Link>

      <div className="dispute-detail__layout">
        {/* Main column */}
        <div className="dispute-detail__main">
          <div className="dispute-detail__head">
            <h1 className="dispute-detail__title">{dispute.title}</h1>
            <StatusBadge status={dispute.status} />
          </div>

          <div className="dispute-detail__meta">
            <div className="dispute-meta-item">
              <span className="dispute-meta-item__label">Amount at stake</span>
              <span className="dispute-meta-item__value dispute-meta-item__value--amount">
                {formatCurrency(dispute.amount)}
              </span>
            </div>
            <div className="dispute-meta-item">
              <span className="dispute-meta-item__label">Raised on</span>
              <span className="dispute-meta-item__value">{formatDate(dispute.raisedAt)}</span>
            </div>
            {dispute.resolvedAt && (
              <div className="dispute-meta-item">
                <span className="dispute-meta-item__label">Resolved on</span>
                <span className="dispute-meta-item__value">{formatDate(dispute.resolvedAt)}</span>
              </div>
            )}
          </div>

          <div className="dispute-detail__divider" />

          <p className="dispute-detail__desc">{dispute.description}</p>

          <div className="dispute-detail__divider" />

          <h2 className="dispute-detail__section-title">Comments & Discussion</h2>
          <CommentThread
            comments={dispute.comments}
            commentText={commentText}
            onCommentChange={setCommentText}
            onSubmit={handleComment}
          />
        </div>

        {/* Sidebar: timeline + other disputes */}
        <div className="dispute-detail__sidebar">
          <div className="dispute-sidebar-card">
            <h3 className="dispute-sidebar-card__title">Activity Timeline</h3>
            <DisputeTimeline events={dispute.timeline} />
          </div>

          {allDisputes.length > 1 && (
            <div className="dispute-sidebar-card">
              <h3 className="dispute-sidebar-card__title">Other Disputes</h3>
              <div className="dispute-list">
                {allDisputes.map((d) => (
                  <Link
                    key={d.id}
                    to={`/tenant/disputes/${d.id}`}
                    className={`dispute-list-item ${d.id === disputeId ? "dispute-list-item--active" : ""}`}
                    id={`dispute-link-${d.id}`}
                  >
                    <span className="dispute-list-item__title">{d.title}</span>
                    <div className="dispute-list-item__row">
                      <StatusBadge status={d.status} />
                      <span className="dispute-list-item__amount">{formatCurrency(d.amount)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
