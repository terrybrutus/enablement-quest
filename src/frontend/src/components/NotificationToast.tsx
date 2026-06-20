import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

interface NotificationToastProps {
  message: string;
  onDismiss: () => void;
}

export function NotificationToast({
  message,
  onDismiss,
}: NotificationToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-card/95 border border-success/30 rounded-lg shadow-elevated backdrop-blur-sm">
        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
        <span className="text-sm text-foreground">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          data-ocid="notification.close_button"
          className="p-0.5 rounded hover:bg-muted transition-smooth ml-1"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
