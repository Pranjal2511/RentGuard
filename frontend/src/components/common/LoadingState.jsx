import { Loader2 } from "lucide-react";
import "./LoadingState.css";

export default function LoadingState({ message = "Loading…" }) {
  return (
    <div className="loading-state">
      <Loader2 size={28} className="loading-state__icon" />
      <p className="loading-state__text">{message}</p>
    </div>
  );
}
