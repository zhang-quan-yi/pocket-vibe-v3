import { CAppShellContainer } from "./modules/phase1/Phase1App";
import { ToastProvider } from "./shared/ui";

export function App() {
  return (
    <ToastProvider>
      <CAppShellContainer />
    </ToastProvider>
  );
}

