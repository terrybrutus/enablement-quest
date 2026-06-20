import type { Toast } from "@/game/types";
import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

interface NotificationToastProps {
  toast: Toast;
  onDismiss: () => void;
}

export function NotificationToast({
  toast,
  onDismiss,
}: NotificationToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 3600);
    return () => window.clearTimeout(timeout);
  }, [onDismiss]);

  return (
    <aside className="eq-toast" aria-live="polite">
      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </aside>
  );
}
