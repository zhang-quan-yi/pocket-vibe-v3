import { Toast as BaseToast } from "@base-ui/react/toast";
import type { ReactNode } from "react";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <BaseToast.Provider limit={3} timeout={4200}>
      {children}
      <ToastViewport />
    </BaseToast.Provider>
  );
}

export function usePvToast() {
  const toastManager = BaseToast.useToastManager();

  return {
    addToast(options: { title: string; description?: string; type?: "success" | "danger" | "info" }) {
      toastManager.add({
        title: options.title,
        description: options.description,
        type: options.type ?? "info",
        priority: options.type === "danger" ? "high" : "low",
      });
    },
  };
}

function ToastViewport() {
  const toastManager = BaseToast.useToastManager();

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport className="pv-toast-viewport">
        {toastManager.toasts.map((toast) => (
          <BaseToast.Root key={toast.id} toast={toast} className="pv-toast" data-tone={toast.type ?? "info"}>
            <BaseToast.Content className="pv-toast__content">
              <div>
                {toast.title ? <BaseToast.Title className="pv-toast__title">{toast.title}</BaseToast.Title> : null}
                {toast.description ? (
                  <BaseToast.Description className="pv-toast__description">{toast.description}</BaseToast.Description>
                ) : null}
              </div>
              <BaseToast.Close className="pv-toast__close" aria-label="Dismiss notification">
                Close
              </BaseToast.Close>
            </BaseToast.Content>
          </BaseToast.Root>
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}
