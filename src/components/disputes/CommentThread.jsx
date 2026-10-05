import { formatDate } from "../../utils/formatters";
import "./CommentThread.css";

export default function CommentThread({ comments, commentText, onCommentChange, onSubmit }) {
  return (
    <div className="comment-thread">
      {(comments || []).length === 0 ? (
        <p className="comment-thread__empty">No comments yet. Start the conversation.</p>
      ) : (
        <div className="comment-thread__list">
          {comments.map((c) => (
            <div key={c.id} className="thread-comment">
              <div className="thread-comment__avatar">{c.userName?.[0] ?? "?"}</div>
              <div className="thread-comment__bubble">
                <div className="thread-comment__header">
                  <span className="thread-comment__author">{c.userName}</span>
                  <span className="thread-comment__date">{formatDate(c.createdAt)}</span>
                </div>
                <p className="thread-comment__text">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="comment-thread__compose">
        <textarea
          className="comment-thread__input"
          rows={2}
          placeholder="Write a comment…"
          value={commentText}
          onChange={(e) => onCommentChange(e.target.value)}
          id="dispute-comment-input"
        />
        <button className="comment-thread__submit" onClick={onSubmit} id="dispute-comment-submit">
          Send
        </button>
      </div>
    </div>
  );
}
