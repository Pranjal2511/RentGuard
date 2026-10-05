import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Scale } from "lucide-react";
import { getDispute, getDisputes, addComment } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import DisputeTimeline from "../../components/disputes/DisputeTimeline";
import CommentThread from "../../components/disputes/CommentThread";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, formatDate } from "../../utils/formatters";
import "./DisputeDetail.css";

const PROPERTY_ID = "prop-001";

export default function DisputeDetail() {
  const { disputeId } = useParams();
  const [dispute, setDispute] = useState(null);
  const [allDisputes, setAllDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    async function load() {
      const [d, all] = await Promise.all([
        getDispute(disputeId),
        getDisputes(PROPERTY_ID),
      ]);
      setDispute(d);
      setAllDisputes(all);
      setLoading(false);
    }
    load();
  }, [disputeId]);

  async function handleComment() {
    if (!commentText.trim() || !dispute) return;
    await addComment(dispute.id, commentText);
    const newComment = {
      id: "dc-opt-" + Date.now(),
      userId: 1,
      userName: "You",
      text: commentText,
      createdAt: new Date().toISOString(),
    };
    setDispute((prev) => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
    setCommentText("");
  }

  if (loading) return <LoadingState />;

  if (!dispute) {
    return (
      <div className="dispute-detail">
        <EmptyState
          icon={Scale}
          title="Dispute not found"
          description="This dispute may have been removed or doesn't exist."
          action={<Link to="/tenant/dashboard" className="dispute-back-link">← Back to dashboard</Link>}
        />
      </div>
    );
  }

  return (
    <div className="dispute-detail">
      {/* Back nav */}
      <Link to="/tenant/dashboard" className="dispute-back-link" id="dispute-back">
        <ArrowLeft size={15} /> Back to dashboard
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

          <h2 className="dispute-detail__section-title">Comments</h2>
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
            <h3 className="dispute-sidebar-card__title">Timeline</h3>
            <DisputeTimeline events={dispute.timeline} />
          </div>

          {allDisputes.length > 1 && (
            <div className="dispute-sidebar-card">
              <h3 className="dispute-sidebar-card__title">All Disputes</h3>
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
