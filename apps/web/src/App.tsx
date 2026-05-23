import {
  Button,
  Dialog,
  Field,
  IconButton,
  Popover,
  Sheet,
  StatusPill,
  Tabs,
  Textarea,
  ToastProvider,
  usePvToast,
} from "./shared/ui";

const tabItems = [
  {
    value: "ask",
    label: "Ask",
    content: "Use a visible context basket and answer the current code question.",
  },
  {
    value: "plan",
    label: "Plan",
    content: "Generate a short reading plan without executing multi-step tools yet.",
  },
  {
    value: "agentic",
    label: "Agentic",
    content: "Run a permissioned reading investigation with inspectable ToolCallLog rows.",
  },
];

export function App() {
  return (
    <ToastProvider>
      <ComponentWorkbench />
    </ToastProvider>
  );
}

function ComponentWorkbench() {
  const { addToast } = usePvToast();

  return (
    <main className="pv-app">
      <header className="pv-app__header">
        <div className="pv-brand">
          <span className="pv-brand__mark">PV</span>
          <div>
            <p className="eyebrow">React + Base UI foundation</p>
            <h1>Pocket Vibe Components</h1>
          </div>
        </div>
        <div className="pv-app__status">
          <StatusPill tone="ready">Ready</StatusPill>
          <StatusPill tone="context">Context visible</StatusPill>
        </div>
      </header>

      <section className="pv-workbench">
        <section className="pv-reader-demo" aria-label="Reader preview">
          <div className="pv-reader-demo__bar">
            <div>
              <span className="pv-reader-demo__path">mock-pocket-vibe / src/reader/context.ts</span>
              <strong>resolveContextChip() L38-L64</strong>
            </div>
            <div className="pv-reader-demo__actions">
              <IconButton icon={<span aria-hidden="true">?</span>} label="Search code" />
              <Button variant="primary">Ask</Button>
            </div>
          </div>
          <pre className="pv-code-surface" aria-label="Read-only code sample">
            <code>{`38  export function resolveContextChip(chip, reader) {
39    const source = reader.findSourceRange(chip.anchor);
40    if (!source) return markMissing(chip);
41
42    return {
43      ...chip,
44      status: chip.pinned ? "pinned" : "ready",
45      sourceRange: source,
46    };
47  }`}</code>
          </pre>
          <div className="pv-context-row" aria-label="Context chips">
            <span className="pv-context-chip">
              <span>sel</span>
              resolveContextChip L38-L47
            </span>
            <span className="pv-context-chip pv-context-chip--anchor">
              <span>src</span>
              context.ts
            </span>
          </div>
        </section>

        <aside className="pv-panel-stack" aria-label="Component primitives">
          <section className="pv-panel">
            <div className="pv-panel__head">
              <div>
                <p className="eyebrow">Primitive controls</p>
                <h2>Buttons, fields, status</h2>
              </div>
              <StatusPill tone="running">Motion v0.1</StatusPill>
            </div>
            <div className="pv-control-grid">
              <Button variant="primary">Ask with context</Button>
              <Button>Preview context</Button>
              <Button variant="quiet">Later</Button>
              <Button variant="danger">Remove chip</Button>
            </div>
            <Field label="Search code" defaultValue="resolveContextChip" description="Compact field for reader tools." />
            <Textarea
              label="Question"
              defaultValue="Explain why stale anchors must not jump automatically."
              description="Textarea keeps Send reachable in keyboard-aware layouts."
            />
          </section>

          <section className="pv-panel">
            <div className="pv-panel__head">
              <div>
                <p className="eyebrow">Base UI behavior layer</p>
                <h2>Sheets, dialogs, popovers, tabs</h2>
              </div>
            </div>
            <div className="pv-control-grid">
              <Sheet
                triggerLabel="Open sheet"
                title="Context Preview"
                description="All context that will be sent with this ask."
                footer={<Button variant="primary">Confirm context</Button>}
              >
                <div className="pv-stack">
                  <StatusPill tone="context">~1.2k tokens</StatusPill>
                  <p className="muted">Selection and current file are ready. Stale anchors would be marked here.</p>
                </div>
              </Sheet>
              <Dialog
                triggerLabel="Open dialog"
                title="Trim oversized context"
                description="Blocking states need explicit copy and actions."
                triggerVariant="secondary"
              >
                <p className="muted">
                  This dialog uses Base UI for focus and dismissal while Pocket Vibe owns all visual language.
                </p>
              </Dialog>
              <Popover trigger="Symbol actions" title="resolveContextChip" description="Token actions stay near source.">
                <div className="pv-stack">
                  <Button variant="quiet">Explain symbol</Button>
                  <Button variant="quiet">Add to context</Button>
                  <Button variant="quiet">Find references</Button>
                </div>
              </Popover>
              <Button
                variant="primary"
                onClick={() =>
                  addToast({
                    title: "Saved",
                    description: "Answer anchored to context.ts L38-L47.",
                    type: "success",
                  })
                }
              >
                Show toast
              </Button>
            </div>
            <Tabs items={tabItems} />
          </section>
        </aside>
      </section>
    </main>
  );
}
