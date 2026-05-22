const screens = {
  empty: {
    id: "F-01",
    title: "Repo Empty",
    purpose: "First-run entry for users without local repositories.",
    next: "paste",
    notes: [
      "Do not make this a marketing page.",
      "Primary action is pasting a public GitHub URL.",
      "Public repo limitation must be visible."
    ],
    interactions: ["Paste URL -> Paste URL / Validation", "Read pack cards can later open curated routes."]
  },
  paste: {
    id: "F-02",
    title: "Paste URL / Validation",
    purpose: "Validate public GitHub repo URL before clone.",
    next: "clone",
    prev: "empty",
    notes: ["Error appears only after validation fails.", "No GitHub login in MVP."],
    interactions: ["Validate and clone -> Clone Progress", "Close -> Repo Empty"]
  },
  clone: {
    id: "F-03",
    title: "Clone Progress",
    purpose: "Show clone task progress and recovery state.",
    next: "codeMap",
    prev: "paste",
    notes: ["Index warming is weak status, not a blocking step.", "Failed clone must offer retry/delete residue."],
    interactions: ["Clone done -> Reader Default", "Cancel -> Repo List or Empty"]
  },
  repoList: {
    id: "F-04",
    title: "Repo List",
    purpose: "Local repositories and continue reading entry.",
    next: "reader",
    notes: ["Continue reading is more important than generic repo management.", "Index state should be glanceable."],
    interactions: ["Tap repo -> Reader Default", "Plus -> Paste URL"]
  },
  reader: {
    id: "F-05",
    title: "Reader Default",
    purpose: "Primary code reading canvas.",
    next: "search",
    notes: [
      "Reader has real vertical and horizontal scrolling.",
      "Search, fold, and tool handle are visible; no hidden edge gesture is required.",
      "Tap the resolveModule token to trigger the symbol menu."
    ],
    interactions: [
      "Map -> Code Map Overview",
      "Search button -> Search Sheet",
      "Tap token -> Symbol Menu",
      "Fold -> Reader Folded",
      "Tools -> Tool Rail",
      "AI -> Chat Full Screen"
    ]
  },
  codeMap: {
    id: "F-05M",
    title: "Code Map Overview",
    purpose: "Bird's-eye map of modules before opening source detail.",
    next: "codeMapModule",
    prev: "reader",
    notes: [
      "Map is a reading entry, not a report dashboard.",
      "Overview, Deps, Flow, and Hotspots are layers.",
      "Tap a module to zoom; Open Reader is a deliberate commit action."
    ],
    interactions: ["Pinch or +/- zoom", "Tap Resolver -> Module Zoom", "Guide -> Map Guide", "Reader -> Reader Default"]
  },
  codeMapModule: {
    id: "F-05Z",
    title: "Code Map Module Zoom",
    purpose: "Zoom into one module and show files, functions, and dependency edges.",
    next: "codeMapNode",
    prev: "codeMap",
    notes: [
      "The route card behaves like onboarding next/prev, not chat history.",
      "Nodes stay on the map; detail appears as a lens."
    ],
    interactions: ["Tap resolveModule -> Node Lens", "Overview -> Code Map Overview", "Reader -> Reader Default"]
  },
  codeMapNode: {
    id: "F-05L",
    title: "Code Map Node Lens",
    purpose: "Preview one symbol with high-level, dependency, flow, and risk context.",
    next: "reader",
    prev: "codeMapModule",
    notes: [
      "The lens is a tooltip-like explanation anchored to the map node.",
      "Open Reader is the only action that leaves the map."
    ],
    interactions: ["Open Reader -> Reader Default", "Explain -> Chat Full Screen", "Show deps -> Module Zoom"]
  },
  folded: {
    id: "F-06",
    title: "Reader Folded",
    purpose: "Function-level structure reading.",
    next: "reader",
    notes: ["Fold blocks show name, line count, and docstring summary.", "Fold is reachable from the Reader chrome."],
    interactions: ["Expand block -> Reader Default", "Search -> Search Sheet"]
  },
  toolRail: {
    id: "F-07",
    title: "Right Tool Rail",
    purpose: "Expose search, cards, and trail with discoverable controls.",
    next: "search",
    prev: "reader",
    notes: ["Buttons are labeled, at least 44px, and include accessible names.", "The visible handle replaces hidden edge-only discovery."],
    interactions: ["Map -> Code Map Overview", "Search -> Search Sheet", "Cards -> File Cards", "Trail -> Reading Trail"]
  },
  search: {
    id: "F-08",
    title: "Search Sheet Results",
    purpose: "Project search with result rows that preview directly.",
    next: "searchPreview",
    prev: "reader",
    notes: ["Search does not auto-focus the keyboard.", "Rows, not a separate button, open preview."],
    interactions: ["Tap result row -> Search Preview", "Close -> Reader Default"]
  },
  searchPreview: {
    id: "F-09",
    title: "Search Preview",
    purpose: "Preview a search result before committing navigation.",
    next: "reader",
    prev: "search",
    notes: ["Back returns to results with query preserved.", "Open is the commit point for reader navigation."],
    interactions: ["Back to results -> Search Sheet", "Explain -> Chat Full Screen", "Open -> Reader Default"]
  },
  symbol: {
    id: "F-10",
    title: "Symbol Action Menu",
    purpose: "Contextual semantic actions on a tapped symbol.",
    next: "definition",
    prev: "reader",
    notes: ["Triggered by a real token in the Reader.", "LSP actions are disabled or downgraded when indexing."],
    interactions: ["Go to definition -> Definition Peek", "Find references -> References Panel", "Explain symbol -> Chat Full Screen"]
  },
  definition: {
    id: "F-11",
    title: "Definition Peek",
    purpose: "Preview definition before jumping.",
    next: "chat",
    prev: "symbol",
    notes: ["Primary action is Explain definition.", "Open is the only action that commits navigation."],
    interactions: ["Explain definition -> Chat Full Screen", "Open -> Reader Default", "Close -> Reader Default"]
  },
  references: {
    id: "F-12",
    title: "References Panel",
    purpose: "References grouped by file with preview affordance.",
    next: "searchPreview",
    prev: "symbol",
    notes: ["References are heavier than definition peek, so the list is compact and preview-driven."],
    interactions: ["Tap reference -> Search Preview", "Explain -> Chat Full Screen"]
  },
  fileCards: {
    id: "F-13",
    title: "File Cards",
    purpose: "Recent file stack with preserved scroll/fold state.",
    next: "reader",
    prev: "reader",
    notes: ["File cards are official reading contexts; peeks are temporary."],
    interactions: ["Open card -> Reader Default", "Back -> Reader Default"]
  },
  trail: {
    id: "F-14",
    title: "Reading Trail Drawer",
    purpose: "Back/forward context for source navigation.",
    next: "reader",
    prev: "reader",
    notes: ["Opened through visible rail; edge gesture remains optional only."],
    interactions: ["Tap trail item -> Reader Default", "Dismiss -> Reader Default"]
  },
  selection: {
    id: "F-15",
    title: "Code Selection Toolbar",
    purpose: "Actions for selected code range.",
    next: "chat",
    prev: "reader",
    notes: ["Selection highlight must not hide syntax highlighting."],
    interactions: ["Chat -> Chat Full Screen", "Annotate -> Code Annotation", "Copy"]
  },
  chat: {
    id: "F-16",
    title: "Chat Full Screen",
    purpose: "Full-screen Chat with Context Basket, messages, and input.",
    next: "saveNote",
    prev: "definition",
    notes: [
      "Chat uses full-screen layout, not a bottom sheet.",
      "Context Basket is fixed at top, collapsible, showing kind + label chips.",
      "Quick actions row below messages.",
      "Save note appears after the AI response."
    ],
    interactions: ["Send -> AI response", "Save note -> Save Note Tray", "Back -> Reader Default", "Token warning -> Chat Token Limit", "Preview context -> Context Preview"]
  },
  tokenLimit: {
    id: "F-17",
    title: "Chat Token Limit",
    purpose: "Prevent sending oversized context in full-screen Chat.",
    next: "chat",
    prev: "chat",
    notes: ["Send is disabled until chips are removed or trimmed.", "Token limit shown in Context Basket area."],
    interactions: ["Trim context -> Chat Full Screen"]
  },
  saveNote: {
    id: "F-18",
    title: "Save Note Tray",
    purpose: "Save AI answer as anchored note without leaving reader.",
    next: "saved",
    prev: "chat",
    notes: ["Save creates anchor and gutter bookmark.", "Save does not navigate to Notes List."],
    interactions: ["Save -> Reader Saved Note Feedback", "Later -> Chat Full Screen"]
  },
  annotation: {
    id: "F-19",
    title: "Code Annotation",
    purpose: "Lightweight manual note on selected code.",
    next: "reader",
    prev: "selection",
    notes: ["Annotation is a mini sheet, not a full notes page."],
    interactions: ["Save annotation -> Reader Default with bookmark"]
  },
  notes: {
    id: "F-20",
    title: "Notes List",
    purpose: "Project knowledge entry point.",
    next: "noteDetail",
    prev: "reader",
    notes: ["Daily report, AI notes, and annotations share the list."],
    interactions: ["Tap note -> Note Detail", "Tap report -> Daily Report"]
  },
  noteDetail: {
    id: "F-21",
    title: "Note Detail with Source",
    purpose: "Read note and jump back through source chip.",
    next: "reader",
    prev: "notes",
    notes: ["Source chip is the visible anchor affordance."],
    interactions: ["Jump to source -> Reader Default", "Edit -> note editor later"]
  },
  daily: {
    id: "F-22",
    title: "Daily Report",
    purpose: "Local learning summary that does not require LLM.",
    next: "notes",
    prev: "notes",
    notes: ["Report is generated from local reading events."],
    interactions: ["Tap file -> Reader Default", "Share later"]
  },
  offline: {
    id: "F-23",
    title: "Offline State",
    purpose: "Show local reading still works when network is unavailable.",
    next: "reader",
    notes: ["Chat send disabled, but code/search/notes available."],
    interactions: ["Dismiss banner -> Reader Default"]
  },
  indexing: {
    id: "F-24",
    title: "LSP Indexing State",
    purpose: "Semantic actions degraded until LSP is ready.",
    next: "reader",
    notes: ["Do not present fallback candidates as accurate definitions."],
    interactions: ["Candidate search -> Search Preview", "Ready -> Symbol Menu"]
  },
  stale: {
    id: "F-25",
    title: "Anchor Stale State",
    purpose: "A note remains readable when source cannot be restored.",
    next: "notes",
    notes: ["Relink is explicit; never silently jump to low-confidence location."],
    interactions: ["Find candidates", "Relink manually"]
  },
  chatPreview: {
    id: "F-16P",
    title: "Context Preview",
    purpose: "Preview code alongside full Context Basket before sending.",
    next: "chat",
    prev: "chat",
    notes: [
      "Reader shows current code.",
      "Context Basket shows all chips expanded.",
      "No Chat messages or input.",
      "Confirm -> back to Chat Full Screen."
    ],
    interactions: ["Confirm -> Chat Full Screen", "Add/remove chips", "Back -> Chat Full Screen"]
  },
  landscape: {
    id: "F-26",
    title: "Landscape Reader + Chat",
    purpose: "Horizontal layout with code left and active panel right.",
    next: "reader",
    notes: ["The phone frame switches to a real landscape container.", "Right panel is fully visible."],
    interactions: ["Exit landscape -> Reader Default"]
  },
  saved: {
    id: "F-27",
    title: "Reader Saved Note Feedback",
    purpose: "Confirm note save without leaving the reading context.",
    next: "reader",
    prev: "saveNote",
    notes: ["Snackbar and gutter bookmark confirm the save.", "Reader position and chat context remain intact."],
    interactions: ["View -> Notes List", "Undo -> Reader Default", "Continue reading -> Reader Default"]
  }
};

const quickPath = [
  "empty", "paste", "clone", "codeMap", "codeMapModule", "codeMapNode", "reader", "search", "searchPreview",
  "symbol", "definition", "chat", "saveNote", "saved"
];

const flowEdges = [
  ["empty", "paste", "paste url"],
  ["paste", "clone", "validate"],
  ["clone", "codeMap", "clone done"],
  ["codeMap", "codeMapModule", "tap module"],
  ["codeMapModule", "codeMapNode", "tap node"],
  ["codeMapNode", "reader", "open reader"],
  ["codeMapNode", "chat", "explain"],
  ["codeMapModule", "codeMap", "overview"],
  ["reader", "codeMap", "map"],
  ["repoList", "reader", "continue"],
  ["reader", "search", "search"],
  ["search", "searchPreview", "result row"],
  ["searchPreview", "reader", "open"],
  ["searchPreview", "chat", "explain"],
  ["reader", "symbol", "tap token"],
  ["symbol", "definition", "definition"],
  ["symbol", "references", "references"],
  ["definition", "chat", "explain"],
  ["definition", "reader", "open"],
  ["references", "searchPreview", "preview"],
  ["reader", "toolRail", "tools"],
  ["toolRail", "search", "search"],
  ["toolRail", "fileCards", "cards"],
  ["toolRail", "trail", "trail"],
  ["fileCards", "reader", "open card"],
  ["trail", "reader", "back"],
  ["reader", "selection", "select"],
  ["selection", "chat", "add chat"],
  ["chat", "tokenLimit", "limit"],
  ["chat", "saveNote", "save note"],
  ["chat", "chatPreview", "preview ctx"],
  ["chatPreview", "chat", "confirm"],
  ["saveNote", "saved", "saved"],
  ["saved", "reader", "continue"],
  ["notes", "noteDetail", "open note"],
  ["noteDetail", "reader", "source"],
  ["reader", "annotation", "annotate"],
  ["notes", "daily", "report"],
  ["noteDetail", "stale", "stale anchor"]
];

const flowLayout = {
  empty: [40, 60], paste: [250, 60], clone: [460, 60], codeMap: [690, 60],
  codeMapModule: [920, 60], codeMapNode: [1150, 60], reader: [700, 170],
  search: [500, 240], searchPreview: [700, 240], symbol: [930, 160],
  definition: [930, 300], references: [1130, 300], toolRail: [700, 440],
  fileCards: [480, 520], trail: [700, 600], selection: [900, 520],
  chat: [1120, 520], tokenLimit: [1320, 520], chatPreview: [1120, 360],
  saveNote: [1120, 680], saved: [1320, 680], notes: [1120, 840],
  noteDetail: [1320, 840], daily: [1120, 1000], annotation: [900, 680],
  repoList: [40, 240], stale: [1320, 1000]
};

let currentScreen = "empty";
const historyStack = [];
let compact = false;

const phoneFrame = document.querySelector(".phone-frame");
const phoneScreen = document.getElementById("phoneScreen");
const screenTitle = document.getElementById("screenTitle");
const screenPurpose = document.getElementById("screenPurpose");
const screenInteractions = document.getElementById("screenInteractions");
const screenNotes = document.getElementById("screenNotes");
const viewTitle = document.getElementById("viewTitle");

function html(strings, ...values) {
  return strings.map((s, i) => s + (values[i] ?? "")).join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function token(name) {
  return `<button class="code-token" data-go="symbol" aria-label="Open actions for symbol ${name}" title="Open symbol actions">${name}</button>`;
}

function codeLines(count = 28) {
  const lines = [
    [`function ${token("resolveModule")}(specifier, parent) {`, "fn"],
    ["  const cacheKey = createKey(specifier, parent.scope, parent.platform);", ""],
    ["  if (cache.has(cacheKey)) {", ""],
    ["    return cache.get(cacheKey);", "ret"],
    ["  }", ""],
    ["  const candidate = resolver.find(parent, specifier, graph.currentWorkspaceRoot);", ""],
    ["  const fallback = candidate ?? resolver.searchCandidates(specifier);", ""],
    ["  return normalizeResult(fallback, { preserveSymlinks: false, conditions: runtimeConditions });", "ret"],
    ["}", ""],
    ["", ""],
    [`function loadModule(id) { return graph.get(id) ?? ${token("resolveModule")}(id, currentFile); }`, "fn"],
    ["const veryLongImportPath = \"packages/runtime/src/features/module-resolution/normalize-result-for-mobile-reader.ts\";", ""],
    ["function createCacheKey(specifier, scope, platform) {", "fn"],
    ["  return `${platform}:${scope}:${specifier}`;", "ret"],
    ["}", ""]
  ];

  return Array.from({ length: count }, (_, i) => {
    const [code, kind] = lines[i % lines.length];
    return `<div class="code-line"><span class="line-no">${128 + i}</span><span class="line-code ${kind}">${code}</span></div>`;
  }).join("");
}

function pathChrome(state = "ready") {
  const statusLabel = state === "indexing" ? "Indexing" : "Ready";
  return html`
    <div class="path-bar">
      <span class="path-title">react / src/runtime/core.ts</span>
      <span class="path-actions">
        <button data-go="fileCards" aria-label="Open file cards" title="File cards">Cards</button>
      </span>
    </div>
    <div class="sticky-bar">
      <span>resolveModule() L128-L184 / 57 lines</span>
      <span class="reader-actions">
        <button data-go="codeMap" aria-label="Open code map" title="Code map">Map</button>
        <button data-go="search" aria-label="Search in repository" title="Search">Search</button>
        <button data-go="folded" aria-label="Show folded reader" title="Fold functions">Fold</button>
        <button data-go="toolRail" aria-label="Open reader tools" title="Tools">Tools</button>
        <span class="status-pill ${state === "indexing" ? "indexing" : ""}">${statusLabel}</span>
      </span>
    </div>
  `;
}

function codeCanvas(rows = 30, options = {}) {
  const bookmark = options.bookmark ? `<div class="bookmark" aria-label="Saved note bookmark">N</div>` : "";
  return html`
    <div class="code-area" aria-label="Scrollable code reader">
      <div class="code-scroll">
        <div class="gutter"></div>
        <div class="code-lines">${codeLines(rows)}</div>
      </div>
      ${bookmark}
      <button class="tool-handle" data-go="toolRail" aria-label="Open reader tools" title="Tools">Tools</button>
      <button class="fab" data-go="chat" aria-label="Open AI chat" title="Ask AI">AI</button>
    </div>
  `;
}

function mobileHeader(title, right = "") {
  const action = right === "+" ? "paste" : "reader";
  return `<div class="mobile-header"><h3>${title}</h3>${right ? `<button class="right text-button" data-go="${action}" aria-label="${escapeHtml(right)}">${right}</button>` : ""}</div>`;
}

function cardBlock(title, body) {
  return `<div class="card"><h4>${title}</h4><p>${body}</p></div>`;
}

function resultRow(title, body) {
  return `<button class="result-row" data-go="searchPreview"><strong>${title}</strong><span>${body}</span></button>`;
}

function sheet(title, className, body, sub = "", snap = "Peek / Half / Full") {
  return html`
    <div class="bottom-sheet ${className}" role="dialog" aria-label="${escapeHtml(title)}">
      <button class="sheet-close" data-go="reader" aria-label="Close sheet">Close</button>
      <div class="sheet-handle" aria-hidden="true"></div>
      <div class="snap-label">${snap}</div>
      <h3>${title}</h3>
      ${sub ? `<p class="sub">${sub}</p>` : ""}
      ${body}
    </div>
  `;
}

function mapLayerTabs(active = "Overview") {
  return ["Overview", "Deps", "Flow", "Hotspots"].map(layer =>
    `<button class="${layer === active ? "active" : ""}" aria-label="Show ${layer} layer">${layer}</button>`
  ).join("");
}

function codeMapTopbar(title, active = "Overview") {
  return html`
    <div class="map-topbar">
      <div>
        <span class="map-kicker">react / code map</span>
        <h3>${title}</h3>
      </div>
      <button data-go="reader" aria-label="Open reader">Reader</button>
    </div>
    <div class="map-layer-tabs" role="tablist" aria-label="Map layers">${mapLayerTabs(active)}</div>
  `;
}

function mapControls() {
  return html`
    <div class="map-controls" aria-label="Map controls">
      <button aria-label="Zoom in">+</button>
      <button aria-label="Zoom out">-</button>
      <button aria-label="Fit map">Fit</button>
    </div>
  `;
}

function mapMini() {
  return html`
    <div class="map-mini" aria-label="Mini map">
      <span class="mini-block one"></span>
      <span class="mini-block two"></span>
      <span class="mini-block three"></span>
      <span class="mini-window"></span>
    </div>
  `;
}

function moduleNode(id, title, meta, x, y, tone = "") {
  return html`
    <button class="map-node module-node ${tone}" style="--x:${x}px;--y:${y}px" data-go="${id}" aria-label="Open ${escapeHtml(title)} module">
      <strong>${title}</strong>
      <span>${meta}</span>
    </button>
  `;
}

function symbolNode(id, title, meta, x, y, tone = "") {
  return html`
    <button class="map-node symbol-node ${tone}" style="--x:${x}px;--y:${y}px" data-go="${id}" aria-label="Open ${escapeHtml(title)} node">
      <strong>${title}</strong>
      <span>${meta}</span>
    </button>
  `;
}

function codeMapOverview() {
  return html`
    ${codeMapTopbar("Overview", "Overview")}
    <div class="code-map-canvas overview-map" aria-label="Zoomable code map overview">
      <svg class="map-edge-svg" viewBox="0 0 390 520" aria-hidden="true">
        <path d="M76 160 C130 112 170 112 220 146" />
        <path d="M220 180 C280 190 308 230 322 286" />
        <path d="M92 336 C160 286 198 274 260 320" />
        <path class="hot" d="M220 180 C206 246 180 276 128 312" />
      </svg>
      ${moduleNode("codeMapModule", "Resolver", "14 files / flow core", 164, 128, "active")}
      ${moduleNode("codeMapModule", "Runtime", "22 files / 4 risks", 26, 114)}
      ${moduleNode("codeMapModule", "Loader", "18 files / high fan-in", 248, 270, "warm")}
      ${moduleNode("codeMapModule", "Server", "31 files / APIs", 40, 326)}
      ${moduleNode("codeMapModule", "Tests", "12 files / gaps", 220, 360)}
      <div class="map-route-card">
        <span>Guide 1/6</span>
        <strong>Start at Resolver to understand module loading.</strong>
        <div><button>Prev</button><button data-go="codeMapModule">Next</button></div>
      </div>
      ${mapControls()}
      ${mapMini()}
    </div>
  `;
}

function codeMapModuleZoom() {
  return html`
    ${codeMapTopbar("Resolver Module", "Flow")}
    <div class="code-map-canvas module-map" aria-label="Resolver module zoom map">
      <svg class="map-edge-svg" viewBox="0 0 390 520" aria-hidden="true">
        <path d="M72 118 C128 98 164 104 214 138" />
        <path d="M214 166 C264 190 286 224 302 270" />
        <path d="M214 166 C182 230 156 268 104 300" />
        <path class="hot" d="M104 300 C162 344 210 354 270 330" />
      </svg>
      <button class="map-back-chip" data-go="codeMap">Overview</button>
      ${symbolNode("codeMapNode", "resolveModule", "function / L128", 140, 132, "active")}
      ${symbolNode("codeMapNode", "resolver.find", "call / L136", 238, 266)}
      ${symbolNode("codeMapNode", "cacheKey", "value / L129", 28, 96)}
      ${symbolNode("codeMapNode", "normalizeResult", "return / L140", 62, 300, "warm")}
      ${symbolNode("codeMapNode", "searchCandidates", "fallback", 238, 326)}
      <div class="map-guide-panel">
        <span>Guide 2/6</span>
        <strong>Read the cache branch before the fallback branch.</strong>
        <p>Deps layer shows why resolver.find is the load-bearing call.</p>
        <div><button data-go="codeMap">Prev</button><button data-go="codeMapNode">Next</button></div>
      </div>
      ${mapControls()}
      ${mapMini()}
    </div>
  `;
}

function codeMapNodeLens() {
  return html`
    ${codeMapTopbar("Resolver Module", "Deps")}
    <div class="code-map-canvas module-map with-lens" aria-label="Resolver module node lens">
      <svg class="map-edge-svg" viewBox="0 0 390 520" aria-hidden="true">
        <path d="M72 118 C128 98 164 104 214 138" />
        <path class="hot" d="M214 166 C264 190 286 224 302 270" />
        <path d="M214 166 C182 230 156 268 104 300" />
      </svg>
      <button class="map-back-chip" data-go="codeMapModule">Back</button>
      ${symbolNode("codeMapNode", "resolveModule", "selected", 140, 132, "active selected")}
      ${symbolNode("codeMapNode", "resolver.find", "direct dep", 238, 266)}
      ${symbolNode("codeMapNode", "cacheKey", "input", 28, 96)}
      ${symbolNode("codeMapNode", "normalizeResult", "output", 62, 300, "warm")}
      ${mapControls()}
      <div class="node-lens" role="dialog" aria-label="resolveModule node lens">
        <div class="sheet-handle" aria-hidden="true"></div>
        <div class="lens-title">
          <span>Function / L128-L184</span>
          <strong>resolveModule</strong>
        </div>
        <div class="lens-tabs"><button class="active">High-level</button><button>Deps</button><button>Flow</button><button>Risk</button></div>
        <p>Turns an import specifier into a normalized module record. Cache first, resolver second, fallback last.</p>
        <div class="lens-metrics"><span>fan-in 7</span><span>fan-out 4</span><span>risk med</span></div>
        <div class="sheet-actions"><button class="mobile-secondary" data-go="chat">Explain</button><button class="mobile-secondary" data-go="codeMapModule">Show deps</button><button class="mobile-primary" data-go="reader">Open Reader</button></div>
      </div>
    </div>
  `;
}

function renderScreen(id) {
  const isLandscape = id === "landscape";
  phoneFrame.classList.toggle("landscape-phone", isLandscape);
  phoneFrame.style.width = isLandscape ? "844px" : "";
  phoneFrame.style.height = isLandscape ? "414px" : "";
  phoneFrame.style.minWidth = isLandscape ? "844px" : "";
  phoneFrame.style.maxWidth = isLandscape ? "none" : "";
  phoneFrame.style.minHeight = isLandscape ? "414px" : "";
  phoneFrame.style.maxHeight = isLandscape ? "414px" : "";
  phoneFrame.style.borderRadius = isLandscape ? "24px" : "";

  const renderers = {
    empty: () => html`
      ${mobileHeader("Pocket Vibe", "Settings")}
      <div class="mobile-body center-copy">
        <h3>Read code anywhere</h3>
        <p>Paste a public GitHub repository URL and continue reading source on your phone.</p>
        <button class="mobile-primary" data-go="paste">Paste GitHub repo URL</button>
        <p class="hint">Only public GitHub repositories are supported in MVP.</p>
      </div>
      <div class="mobile-body stack">${cardBlock("React internals", "Official route / 15 min reading")}${cardBlock("Vue reactivity", "Official route / 15 min reading")}${cardBlock("FastAPI routing", "Official route / 15 min reading")}</div>
    `,
    paste: () => html`
      ${mobileHeader("Import GitHub repo", "Close")}
      <div class="mobile-body stack">
        <label for="repo-url">Repository URL</label>
        <input id="repo-url" class="text-field" value="https://github.com/facebook/react" />
        <p class="hint">Public GitHub repositories only. Private repos are not supported in MVP.</p>
        <button class="mobile-primary" data-go="clone">Validate and clone</button>
        <p class="hint">Error state appears only after validation fails.</p>
      </div>
    `,
    clone: () => html`
      ${mobileHeader("Import repo", "Cancel")}
      <div class="mobile-body stack">
        <div><h3>facebook/react</h3><p class="hint">github.com/facebook/react</p></div>
        <div><strong>Downloading objects</strong><div class="progress-track"><div class="progress-fill"></div></div><p class="hint">68% / 3.4 MB/s / 42s left</p></div>
        <div class="stack">
          ${cardBlock("Done  Validate URL", "Repository is public and reachable.")}
          ${cardBlock("Done  Create local repo", "Private app storage is ready.")}
          ${cardBlock("Now   Download source", "Weak network can retry safely.")}
          ${cardBlock("Next  Prepare index", "Reading is available before LSP is ready.")}
        </div>
        <button class="mobile-primary" data-go="codeMap">Simulate clone done</button>
      </div>
    `,
    repoList: () => html`
      ${mobileHeader("Pocket Vibe", "+")}
      <div class="mobile-body stack">
        <h4>Continue reading</h4>
        ${cardBlock("react", "src/runtime/core.ts / L132 / LSP indexing / 2 notes")}
        <h4>Local repos</h4>
        ${cardBlock("fastapi", "Ready / last opened 10 min ago")}
        ${cardBlock("gin", "Search only / LSP failed / Retry")}
        ${cardBlock("next.js", "Indexing / 43%")}
      </div>
    `,
    reader: () => `${pathChrome()}${codeCanvas(38)}`,
    codeMap: () => codeMapOverview(),
    codeMapModule: () => codeMapModuleZoom(),
    codeMapNode: () => codeMapNodeLens(),
    folded: () => html`
      ${pathChrome()}
      <div class="fold-list">
        <button class="fold-block" data-go="reader"><strong>parseImports()</strong><span>38 lines / reads AST comments</span></button>
        <button class="fold-block" data-go="reader"><strong>resolveModule()</strong><span>57 lines / resolves specifier</span></button>
        <button class="fold-block" data-go="reader"><strong>loadModule()</strong><span>22 lines / async loader</span></button>
        <button class="fold-block" data-go="reader"><strong>createCacheKey()</strong><span>18 lines / stable cache id</span></button>
      </div>
      <button class="fab" data-go="chat" aria-label="Open AI chat">AI</button>
    `,
    toolRail: () => html`
      ${pathChrome()}${codeCanvas(30)}
      <div class="tool-rail" role="toolbar" aria-label="Reader tools">
        <button data-go="codeMap" aria-label="Open code map" title="Code map">Map</button>
        <button data-go="search" aria-label="Search repository" title="Search">Search</button>
        <button data-go="fileCards" aria-label="Open file cards" title="File cards">Cards</button>
        <button data-go="trail" aria-label="Open reading trail" title="Reading trail">Trail</button>
      </div>
    `,
    search: () => html`
      ${pathChrome()}${codeCanvas(18)}
      ${sheet("Search in react", "search", `
        <label for="search-query" class="visually-small">Query</label>
        <input id="search-query" class="text-field" value="resolveModule" />
        <div class="stack result-list">
          ${resultRow("src/runtime/core.ts", "128 function resolveModule(specifier) / 172 cache.resolveModule(key)")}
          ${resultRow("src/server/loader.ts", "44 await resolveModule(id) / 92 return resolveModule(next)")}
        </div>
      `, "Tap a result row to preview. The Reader does not move yet.", "Half")}
    `,
    searchPreview: () => html`
      ${pathChrome()}${codeCanvas(18)}
      ${sheet("Preview src/runtime/core.ts", "search preview", `
        <div class="snippet">126 const cache = new Map()<br />127<br /><strong>128 function resolveModule(...) {</strong><br />129   const key = createKey(...)<br />130   return resolver.find(key)<br />131 }</div>
        <div class="sheet-actions"><button class="mobile-secondary" data-go="search">Back to results</button><button class="mobile-secondary" data-go="chat">Explain</button><button class="mobile-primary" data-go="reader">Open</button></div>
      `, "L128 / resolveModule", "Peek")}
    `,
    symbol: () => html`
      ${pathChrome()}${codeCanvas(28)}
      <div class="symbol-hit">resolveModule</div>
      <div class="symbol-menu" role="menu" aria-label="Symbol actions">
        <button data-go="definition">Go to definition</button>
        <button data-go="references">Find references</button>
        <button data-go="chat">Explain symbol</button>
      </div>
    `,
    definition: () => html`
      ${pathChrome()}${codeCanvas(18)}
      ${sheet("Definition", "peek", `
        <div class="snippet">36 export class Resolver {<br />37<br /><strong>38 resolveModule(specifier) {</strong><br />39   const target = lookup(...)<br />40   return target<br />41 }</div>
        <div class="sheet-actions"><button class="mobile-primary" data-go="chat">Explain definition</button><button class="mobile-secondary" data-go="reader">Open</button></div>
      `, "src/resolver/index.ts / L38 / from core.ts L132", "Peek")}
    `,
    references: () => html`
      ${pathChrome()}${codeCanvas(14)}
      ${sheet("References: resolveModule", "refs", `
        <div class="stack result-list">
          ${resultRow("src/runtime/core.ts / 4 refs", "128 function resolveModule / 172 cache.resolveModule / 210 return resolveModule")}
          ${resultRow("src/server/loader.ts / 3 refs", "44 await resolveModule / 92 return resolveModule")}
          ${resultRow("src/test/loader.test.ts / 5 refs", "Test calls and fixtures")}
        </div>
        <div class="sheet-actions"><button class="mobile-secondary">Filter</button><button class="mobile-primary" data-go="chat">Explain refs</button></div>
      `, "12 refs in 5 files", "Half")}
    `,
    fileCards: () => html`
      <div class="cards-stage">
        <h3>File Cards</h3>
        <div class="file-card back-two"></div>
        <div class="file-card back-one"></div>
        <div class="file-card">
          <h3>src/runtime/core.ts</h3>
          <p class="hint">resolveModule / L132</p>
          <div class="snippet card-snippet">128 function resolveModule<br />129 const key = ...<br />130 if (cache.has(key))<br />131 return cache.get</div>
          <button class="mobile-primary" data-go="reader">Open card</button>
        </div>
      </div>
    `,
    trail: () => html`
      ${pathChrome()}${codeCanvas(24)}
      <div class="trail-drawer">
        <h3>Reading Trail</h3>
        <div class="stack">
          ${cardBlock("Now / core.ts L132", "current")}
          ${cardBlock("2 min / loader.ts L44", "from definition")}
          ${cardBlock("5 min / index.ts L38", "from search")}
          ${cardBlock("8 min / README.md L10", "opened file")}
        </div>
        <button class="mobile-primary" data-go="reader">Back to source</button>
      </div>
    `,
    selection: () => html`
      ${pathChrome()}${codeCanvas(26)}
      <div class="selection-highlight"></div>
      <div class="selection-toolbar"><button data-go="chat">Chat</button><button data-go="annotation">Annotate</button><button>Copy</button></div>
    `,
    chat: () => html`
      <div class="chat-full">
        <div class="chat-header">
          <button class="chat-back" data-go="reader" aria-label="Back to reader">&larr; Back</button>
          <h3>Chat</h3>
          <button class="chat-back" data-go="chatPreview" aria-label="Preview context">Context</button>
        </div>
        <div class="chat-basket">
          <div class="chat-basket-label"><span>Context Basket</span><span class="token-estimate">~1.2k tok</span></div>
          <div class="chips">
            <span class="ctx-chip"><span class="chip-kind">def</span><span class="chip-label">resolveModule L38-L41</span></span>
            <span class="ctx-chip"><span class="chip-kind">file</span><span class="chip-label">core.ts</span></span>
            <button class="basket-add" data-go="chatPreview" aria-label="Add context">+ Add</button>
          </div>
        </div>
        <div class="chat-mode-tabs" role="tablist" aria-label="Chat modes">
          <button class="active" aria-label="Ask mode">Ask</button><button aria-label="Agentic Reading mode">Agentic</button><button aria-label="Plan mode">Plan</button>
        </div>
        <div class="chat-messages">
          <div class="chat-msg chat-msg-user"><div class="chat-bubble">Explain the definition of resolveModule</div></div>
          <div class="chat-msg chat-msg-ai">
            <div class="chat-bubble">resolveModule checks the cache, asks the resolver for a candidate, and normalizes the result before returning it to the module graph.</div>
          </div>
          <div class="chat-tool-log">
            <div class="chat-tool-header"><span>ToolCallLog</span><span class="tool-status">Done</span></div>
            <div class="chat-tool-body">find_definition: resolver/index.ts L38 / find_references: 12 refs in 5 files</div>
          </div>
        </div>
        <div class="chat-quick-actions">
          <button>Explain</button><button>Next file</button><button>Call chain</button>
        </div>
        <div class="chat-input-bar">
          <textarea class="chat-textarea" aria-label="Ask about this code">Ask about this code...</textarea>
          <button class="send-btn" aria-label="Send">Send</button>
        </div>
        <div class="chat-input-meta">
          <span class="token-info">~1.2k tok / est. $0.01</span>
          <span>Ask with context</span>
        </div>
        <div class="chat-save-bar">
          <button class="mobile-secondary" data-go="tokenLimit">Token limit</button>
          <button class="mobile-primary" data-go="saveNote">Save note</button>
        </div>
      </div>
    `,
    tokenLimit: () => html`
      <div class="chat-full">
        <div class="chat-header">
          <button class="chat-back" data-go="reader" aria-label="Back to reader">&larr; Back</button>
          <h3>Chat</h3>
          <button class="chat-back" data-go="chatPreview" aria-label="Preview context">Context</button>
        </div>
        <div class="chat-basket">
          <div class="chat-basket-label"><span>Context Basket</span><span class="token-estimate" style="color:var(--danger)">Over limit</span></div>
          <div class="chips">
            <span class="ctx-chip"><span class="chip-kind">file</span><span class="chip-label">core.ts ~9k</span></span>
            <span class="ctx-chip"><span class="chip-kind">def</span><span class="chip-label">resolveModule ~420</span></span>
            <span class="ctx-chip over-limit"><span class="chip-kind">refs</span><span class="chip-label">references ~6k</span></span>
          </div>
        </div>
        <div class="chat-mode-tabs" role="tablist" aria-label="Chat modes">
          <button class="active" aria-label="Ask mode">Ask</button><button aria-label="Agentic Reading mode">Agentic</button><button aria-label="Plan mode">Plan</button>
        </div>
        <div class="chat-messages">
          <div class="error-box" style="margin:16px"><strong>Token limit exceeded</strong><br />Remove chips or trim context before sending.</div>
        </div>
        <div class="chat-input-bar">
          <textarea class="chat-textarea" aria-label="Ask about this code" disabled>Ask about this code...</textarea>
          <button class="send-btn" disabled aria-label="Send disabled">Send</button>
        </div>
        <div class="chat-input-meta">
          <span class="token-info" style="color:var(--danger)">~15.4k tok / limit exceeded</span>
          <span>Send disabled</span>
        </div>
        <div class="chat-save-bar">
          <button class="mobile-primary" data-go="chat">Trim context</button>
        </div>
      </div>
    `,
    saveNote: () => html`
      ${pathChrome()}${codeCanvas(12)}
      ${sheet("Save as note", "save", `
        <label for="note-title">Title</label>
        <input id="note-title" class="text-field" value="resolveModule explained" />
        <p><strong>Source</strong></p>
        <span class="ctx-chip anchor-chip"><span class="chip-kind">src</span><span class="chip-label">resolver/index.ts / resolveModule L38-L41</span></span>
        <p class="hint">This function resolves a module specifier, checks cache, and normalizes the result...</p>
        <div class="sheet-actions"><button class="mobile-secondary" data-go="chat">Later</button><button class="mobile-primary" data-go="saved">Save</button></div>
      `, "AI answer linked to source anchor", "Peek")}
    `,
    saved: () => html`
      ${pathChrome()}${codeCanvas(32, { bookmark: true })}
      <div class="snackbar" role="status">Saved to notes <button data-go="notes">View</button><button data-go="reader">Undo</button></div>
    `,
    annotation: () => html`
      ${pathChrome()}${codeCanvas(18)}
      <div class="selection-highlight annotation-range"></div>
      <div class="bookmark">N</div>
      ${sheet("Annotation", "annotation", `
        <textarea class="chat-input annotation-input" aria-label="Annotation text">This cache branch is the key to read first.</textarea>
        <div class="sheet-actions"><button class="mobile-primary" data-go="reader">Save annotation</button></div>
      `, "core.ts / L132-L134", "Mini")}
    `,
    notes: () => html`
      ${mobileHeader("react / Notes", "Filter")}
      <div class="mobile-body stack">
        <h4>Today</h4>
        ${cardBlock("Daily report", "6 files / 3 questions / 2 notes")}
        ${cardBlock("resolveModule explained", "resolver/index.ts / L38-L41 / AI note")}
        ${cardBlock("Annotation", "loader.ts / L44 / manual note")}
        <button class="mobile-primary" data-go="noteDetail">Open selected note</button>
        <button class="mobile-secondary" data-go="daily">Open daily report</button>
      </div>
    `,
    noteDetail: () => html`
      ${mobileHeader("Note", "Edit")}
      <div class="mobile-body stack">
        <h3>resolveModule explained</h3>
        <button class="ctx-chip anchor-chip" data-go="reader"><span class="chip-kind">src</span><span class="chip-label">resolver/index.ts / resolveModule L38-L41</span></button>
        <h4>Summary</h4>
        <p>This function resolves a module specifier, checks cache, then normalizes the resolver output before returning it to the module graph.</p>
        <h4>My understanding</h4>
        <textarea class="chat-input note-body">Tap the source chip to jump back to code.</textarea>
        <button class="mobile-secondary" data-go="stale">Show stale state</button>
      </div>
    `,
    daily: () => html`
      ${mobileHeader("Daily report", "Share")}
      <div class="mobile-body stack">
        <h3>May 15</h3>
        <div class="metric-grid"><div class="metric-card"><strong>6</strong>Files read</div><div class="metric-card"><strong>38m</strong>Reading time</div><div class="metric-card"><strong>3</strong>Questions</div><div class="metric-card"><strong>2</strong>Notes</div></div>
        ${cardBlock("src/runtime/core.ts", "visited / source anchors available")}
        ${cardBlock("src/server/loader.ts", "visited / source anchors available")}
      </div>
    `,
    offline: () => `${pathChrome()}<div class="info-box offline-banner">Offline mode: code, search and notes are available. Chat send is disabled.</div>${codeCanvas(24)}`,
    indexing: () => html`
      ${pathChrome("indexing")}${codeCanvas(20)}
      <div class="symbol-menu"><button disabled>Go to definition</button><button disabled>Find references</button><button data-go="searchPreview">Candidate search</button></div>
      <div class="warning-box floating-warning">Indexing. Accurate LSP results are not ready yet.</div>
    `,
    stale: () => html`
      ${mobileHeader("Note", "Edit")}
      <div class="mobile-body stack">
        <h3>resolveModule explained</h3>
        <span class="ui-chip stale-chip">Source moved or deleted / relink</span>
        <p>The note is still available, but Pocket Vibe cannot confidently restore the original code position.</p>
        <button class="mobile-secondary">Find candidates</button>
        <button class="mobile-primary">Relink manually</button>
      </div>
    `,
    chatPreview: () => html`
      ${pathChrome()}${codeCanvas(24)}
      <div class="bottom-sheet peek" role="dialog" aria-label="Context preview">
        <button class="sheet-close" data-go="chat" aria-label="Close preview">Close</button>
        <div class="sheet-handle" aria-hidden="true"></div>
        <h3>Context Preview</h3>
        <p class="sub">All context that will be sent. Add or remove chips.</p>
        <div class="chips">
          <span class="ctx-chip"><span class="chip-kind">def</span><span class="chip-label">resolveModule L38-L41</span></span>
          <span class="ctx-chip"><span class="chip-kind">file</span><span class="chip-label">core.ts</span></span>
          <span class="ctx-chip anchor-chip"><span class="chip-kind">saved</span><span class="chip-label">previous note</span></span>
          <button class="basket-add">+ Add</button>
        </div>
        <div class="chat-basket-label"><span>Token estimate</span><span class="token-estimate">~1.2k tok</span></div>
        <div class="sheet-actions"><button class="mobile-primary" data-go="chat">Confirm</button></div>
      </div>
    `,
    landscape: () => html`
      <div class="landscape-frame">
        <section class="landscape-code">
          <strong>react / src/runtime/core.ts</strong><p class="hint">resolveModule() L128-L184</p>
          <div class="landscape-code-scroll">${codeLines(14)}</div>
        </section>
        <section class="landscape-panel">
          <h3>Chat / Results Panel</h3>
          <div class="chips">
            <span class="ctx-chip"><span class="chip-kind">sel</span><span class="chip-label">resolveModule L128-L142</span></span>
            <span class="ctx-chip"><span class="chip-kind">file</span><span class="chip-label">core.ts</span></span>
          </div>
          <div class="chat-mode-tabs">
            <button class="active">Ask</button><button>Agentic</button><button>Plan</button>
          </div>
          <div class="card"><p>resolveModule checks the cache, asks the resolver for a candidate, and normalizes the result.</p></div>
          <div class="chat-input-bar">
            <textarea class="chat-textarea" aria-label="Ask">Ask about code...</textarea>
            <button class="send-btn">Send</button>
          </div>
          <button class="mobile-primary" data-go="reader">Exit landscape</button>
        </section>
      </div>
    `,
  };

  phoneScreen.innerHTML = renderers[id] ? renderers[id]() : renderers.reader();
  bindGoButtons(phoneScreen);
  updateInspector(id);
  updateQuickLinks();
}

function goTo(id, push = true) {
  if (!screens[id]) return;
  if (push && id !== currentScreen) historyStack.push(currentScreen);
  currentScreen = id;
  renderScreen(id);
}

function back() {
  const prev = historyStack.pop() || screens[currentScreen].prev || "reader";
  currentScreen = prev;
  renderScreen(prev);
}

function bindGoButtons(root) {
  root.querySelectorAll("[data-go]").forEach(el => {
    el.addEventListener("click", event => {
      event.preventDefault();
      goTo(el.dataset.go);
    });
  });
}

function updateInspector(id) {
  const screen = screens[id];
  screenTitle.textContent = `${screen.id} / ${screen.title}`;
  screenPurpose.textContent = screen.purpose;
  screenInteractions.innerHTML = screen.interactions.map(item => `<li>${item}</li>`).join("");
  screenNotes.innerHTML = screen.notes.map(item => `<li>${item}</li>`).join("");
}

function updateQuickLinks() {
  document.querySelectorAll(".quick-link").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === currentScreen);
  });
}

function renderQuickLinks() {
  const root = document.getElementById("quickLinks");
  root.innerHTML = quickPath.map(id => `<button class="quick-link" data-screen="${id}">${screens[id].id} ${screens[id].title}</button>`).join("");
  root.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => goTo(btn.dataset.screen)));
}

function setMode(mode) {
  document.querySelectorAll(".mode-button").forEach(btn => btn.classList.toggle("active", btn.dataset.mode === mode));
  document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
  document.getElementById(`${mode}View`).classList.add("active");
  viewTitle.textContent = {
    prototype: "Prototype",
    flow: "Flow Map",
    screens: "Screens",
    annotations: "Annotations",
    components: "Components"
  }[mode];
}

function renderFlowMap() {
  const root = document.getElementById("flowMap");
  const node = (id) => {
    const [x, y] = flowLayout[id];
    return `<g class="flow-node" data-screen="${id}"><rect x="${x}" y="${y}" width="170" height="64"></rect><text x="${x + 85}" y="${y + 38}" text-anchor="middle">${screens[id].title}</text></g>`;
  };
  const edge = ([a, b]) => {
    const [ax, ay] = flowLayout[a];
    const [bx, by] = flowLayout[b];
    return `<line class="flow-edge" x1="${ax + 170}" y1="${ay + 32}" x2="${bx}" y2="${by + 32}"></line>`;
  };
  root.innerHTML = `<svg class="flow-svg" viewBox="0 0 1540 1120">${flowEdges.map(edge).join("")}${Object.keys(flowLayout).map(node).join("")}</svg>`;
  root.querySelectorAll(".flow-node").forEach(node => node.addEventListener("click", () => {
    setMode("prototype");
    goTo(node.dataset.screen);
  }));
}

function renderScreenWall() {
  const root = document.getElementById("screenWall");
  root.innerHTML = Object.entries(screens).map(([id, screen]) => `
    <article class="screen-tile" data-screen="${id}">
      <div class="mini-phone"><div class="phone-screen">${miniScreen(id)}</div></div>
      <h4>${screen.id} / ${screen.title}</h4>
      <p>${screen.purpose}</p>
    </article>
  `).join("");
  root.querySelectorAll(".screen-tile").forEach(tile => tile.addEventListener("click", () => {
    setMode("prototype");
    goTo(tile.dataset.screen);
  }));
}

function miniScreen(id) {
  const rendererMap = {
    codeMap: codeMapOverview(),
    codeMapModule: codeMapModuleZoom(),
    codeMapNode: codeMapNodeLens(),
    reader: `${pathChrome()}${codeCanvas(18)}`,
    chat: `<div class="chat-full"><div class="chat-header"><h3>Chat</h3></div><div class="chat-basket"><div class="chips"><span class="ctx-chip"><span class="chip-kind">def</span><span class="chip-label">context</span></span></div></div><div class="chat-messages"><div class="chat-msg chat-msg-ai"><div class="chat-bubble">AI response</div></div></div><div class="chat-input-bar"><textarea class="chat-textarea">Ask...</textarea><button class="send-btn">Send</button></div></div>`,
    search: `${pathChrome()}${codeCanvas(8)}${sheet("Search", "search", `<input class="text-field" value="query" /><div class="stack">${resultRow("result.ts", "line 128")}</div>`)}`,
    definition: `${pathChrome()}${codeCanvas(8)}${sheet("Definition", "peek", `<div class="snippet">function resolveModule()</div>`)}`,
    saved: `${pathChrome()}${codeCanvas(12, { bookmark: true })}<div class="snackbar">Saved to notes</div>`,
    notes: `${mobileHeader("Notes")}<div class="mobile-body stack">${cardBlock("Daily report", "6 files")}${cardBlock("AI note", "source anchor")}</div>`
  };
  return rendererMap[id] || `<div class="mobile-header"><h3>${screens[id].title}</h3></div><div class="mobile-body">${cardBlock(screens[id].id, screens[id].purpose)}</div>`;
}

function renderAnnotations() {
  const root = document.getElementById("annotationList");
  const items = [
    ["Reader First", "Default screen keeps code readable and scrollable; tools remain visible but lightweight."],
    ["Map First Option", "After clone, Code Map can become the repo orientation surface before source detail."],
    ["Map / Lens / Reader", "Tap a map node to open a lens; Open Reader is the commit point for source navigation."],
    ["AI as Route", "Guide cards use next/prev over map nodes, keeping chat as secondary ask mode."],
    ["Jump / Ask / Save", "Tap token or search, preview first, explain, then save without leaving the reader."],
    ["Preview Before Jump", "Search and LSP use preview first. Only Open changes reader and trail."],
    ["Chat Full Screen", "Chat is a full-screen view with Context Basket at top, messages, quick actions, and input bar."],
    ["Context Visible", "Context Basket shows kind + label chips (def, file, sel, refs). Users preview before sending."],
    ["State Honesty", "LSP indexing and anchor stale states must never pretend to be accurate."],
    ["Anchor Recovery", "Saved notes show snackbar and gutter bookmark; stale source requires explicit relink."]
  ];
  root.innerHTML = items.map(item => `<article class="annotation-card"><h4>${item[0]}</h4><p>${item[1]}</p></article>`).join("");
}

function renderComponents() {
  const root = document.getElementById("componentList");
  const layers = [
    ["Primitive", "ActionButton / TextField / StatusPill / InlineNotice"],
    ["Layout", "Panel / BottomSheet / App and Workbench surfaces"],
    ["Reader", "CodeLine / SourceAnchorBadge / SearchResultItem"],
    ["Context", "ContextChip / TokenMeter / Context Basket preview"],
    ["Agent", "ChatPanel / ToolCallLog / mode tabs"],
    ["Knowledge", "SaveAnswerTray / ReadingTrailCard / anchored note"]
  ];
  const productComponents = [
    ["CodeLine", "Read-only source row with line number, selection, current line, and anchor state."],
    ["ContextChip", "Visible AI context unit; always shows kind, label, and status text."],
    ["SourceAnchorBadge", "Source reference for saved answers, annotations, and jump-back paths."],
    ["SearchResultItem", "Preview-first row with file, line, snippet, Explain, and Open affordances."],
    ["DefinitionPeek", "Short lived semantic preview; Open is the only navigation commit."],
    ["ToolCallLog", "Inspectable agent work, collapsed by default but never hidden."],
    ["SaveAnswerTray", "Anchored note save surface that keeps the Reader position intact."],
    ["ReadingTrailCard", "Compact file/session card that can re-enter source context."]
  ];

  root.innerHTML = html`
    <article class="component-card wide component-intro-card">
      <div>
        <p class="eyebrow">Base component direction</p>
        <h4>Reader-first components for the MVP prototype</h4>
        <p>These examples make the low-level design language explicit before the walking skeleton grows into a larger UI kit.</p>
      </div>
      <div class="component-layer-strip">
        ${layers.map(([name, desc]) => `<span><strong>${name}</strong>${desc}</span>`).join("")}
      </div>
    </article>

    <article class="component-card wide">
      <h4>Foundation Tokens</h4>
      <p>Light, cool-neutral app chrome; dark Reader canvas; teal actions; blue context; amber source anchors; direct status colors.</p>
      <div class="token-board">
        <div class="token-swatch bg"><span>Background</span><strong>#eef2f7</strong></div>
        <div class="token-swatch surface"><span>Surface</span><strong>#ffffff</strong></div>
        <div class="token-swatch reader"><span>Reader</span><strong>#171717</strong></div>
        <div class="token-swatch accent"><span>Accent</span><strong>#167a72</strong></div>
        <div class="token-swatch context"><span>Context</span><strong>#2f6fed</strong></div>
        <div class="token-swatch anchor"><span>Anchor</span><strong>#b76b00</strong></div>
        <div class="token-swatch danger"><span>Danger</span><strong>#b42318</strong></div>
      </div>
      <div class="component-note-row">
        <span>Radius: 6px controls / 8px repeated items</span>
        <span>Motion: 120ms, 180ms, 240ms</span>
        <span>Minimum touch target: 44px</span>
      </div>
    </article>

    <article class="component-card">
      <div class="component-card-head">
        <h4>ActionButton</h4>
        <span class="component-tag">primitive</span>
      </div>
      <div class="sample-stack">
        <button class="pv-button primary">Ask with context</button>
        <button class="pv-button secondary">Preview context</button>
        <button class="pv-button quiet">Later</button>
        <button class="pv-button danger">Remove chip</button>
        <button class="pv-button secondary" disabled>Send disabled</button>
      </div>
      <p>Use primary sparingly for the next committed action. Quiet actions stay visible without stealing Reader focus.</p>
    </article>

    <article class="component-card">
      <div class="component-card-head">
        <h4>Fields</h4>
        <span class="component-tag">primitive</span>
      </div>
      <div class="sample-stack">
        <label class="component-label" for="component-search">Search code</label>
        <input id="component-search" class="component-input" value="resolveModule" />
        <label class="component-label" for="component-question">Question</label>
        <textarea id="component-question" class="component-textarea">Explain how this function recovers from missing resolver candidates.</textarea>
      </div>
      <p>Fields are compact, readable, and never imply source editing.</p>
    </article>

    <article class="component-card">
      <div class="component-card-head">
        <h4>StatusPill</h4>
        <span class="component-tag">primitive</span>
      </div>
      <div class="component-pill-grid">
        <span class="component-pill success">Ready</span>
        <span class="component-pill running">Running</span>
        <span class="component-pill warning">Indexing</span>
        <span class="component-pill danger">Failed</span>
        <span class="component-pill neutral">Offline read-only</span>
      </div>
      <p>Status text is explicit; color is secondary reinforcement.</p>
    </article>

    <article class="component-card">
      <div class="component-card-head">
        <h4>InlineNotice</h4>
        <span class="component-tag">primitive</span>
      </div>
      <div class="sample-stack">
        <div class="component-notice info"><strong>Context visible</strong><span>2 chips will be sent with this ask.</span></div>
        <div class="component-notice warning"><strong>Indexing</strong><span>Definition is unavailable; candidate search is still available.</span></div>
        <div class="component-notice danger"><strong>Token limit</strong><span>Trim references before sending.</span></div>
      </div>
    </article>

    <article class="component-card">
      <div class="component-card-head">
        <h4>Panel</h4>
        <span class="component-tag">layout</span>
      </div>
      <div class="component-panel-sample">
        <div class="component-panel-head"><span>Context Basket</span><button class="pv-button quiet">Add</button></div>
        <div class="chips">
          <span class="ctx-chip"><span class="chip-kind">sel</span><span class="chip-label">resolveModule L128-L142</span></span>
          <span class="ctx-chip anchor-chip"><span class="chip-kind">src</span><span class="chip-label">core.ts</span></span>
        </div>
        <div class="token-meter"><span style="width:42%"></span></div>
        <p class="hint">~1.2k tok / 16k budget</p>
      </div>
      <p>Panels are temporary work surfaces with light borders and clear titles.</p>
    </article>

    <article class="component-card">
      <div class="component-card-head">
        <h4>BottomSheet</h4>
        <span class="component-tag">layout</span>
      </div>
      <div class="component-sheet-sample">
        <div class="sheet-handle" aria-hidden="true"></div>
        <span class="snap-label">Half</span>
        <button class="sheet-close">Close</button>
        <h5>Definition Peek</h5>
        <p>Preview definition before navigation.</p>
        <div class="snippet">function resolveModule(specifier, parent) { ... }</div>
        <div class="sheet-actions"><button class="mobile-secondary">Open</button><button class="mobile-primary">Explain</button></div>
      </div>
    </article>

    <article class="component-card wide">
      <h4>Reader and Context Product Components</h4>
      <div class="component-showcase-grid">
        <div class="reader-sample">
          <div class="code-line selected"><span class="line-no">128</span><code>function resolveModule(specifier, parent) {</code></div>
          <div class="code-line"><span class="line-no">129</span><code>  const cacheKey = createKey(specifier, parent.scope);</code></div>
          <div class="code-line highlighted"><span class="line-no">130</span><code>  return normalizeResult(candidate);</code></div>
        </div>
        <div class="sample-stack">
          <div class="chips">
            <span class="ctx-chip"><span class="chip-kind">sel</span><span class="chip-label">selection ready</span></span>
            <span class="ctx-chip over-limit"><span class="chip-kind">refs</span><span class="chip-label">oversized references</span></span>
            <span class="ctx-chip stale-chip"><span class="chip-kind">src</span><span class="chip-label">stale anchor</span></span>
          </div>
          <button class="result-row"><strong>resolver/index.ts:132</strong><span>Preview result row with Explain and Open actions.</span></button>
          <div class="chat-tool-log">
            <div class="chat-tool-header"><span>ToolCallLog</span><span class="tool-status">Done</span></div>
            <div class="chat-tool-body">find_definition: resolver/index.ts L38 / search_related: 12 refs</div>
          </div>
          <div class="saved-note"><strong>Saved answer</strong><span>Anchored to resolver/index.ts / resolveModule L38-L41.</span></div>
        </div>
      </div>
    </article>

    <article class="component-card wide">
      <h4>Inventory Checklist</h4>
      <div class="component-inventory">
        ${productComponents.map(([name, desc]) => `<div><strong>${name}</strong><span>${desc}</span></div>`).join("")}
      </div>
    </article>
  `;
}

document.querySelectorAll(".mode-button").forEach(btn => btn.addEventListener("click", () => setMode(btn.dataset.mode)));
document.getElementById("resetFlow").addEventListener("click", () => {
  historyStack.length = 0;
  goTo("empty", false);
});
document.getElementById("backButton").addEventListener("click", back);
document.getElementById("nextButton").addEventListener("click", () => goTo(screens[currentScreen].next || "reader"));
document.getElementById("toggleScale").addEventListener("click", () => {
  compact = !compact;
  document.querySelector(".phone-stage").classList.toggle("compact", compact);
  document.getElementById("toggleScale").textContent = compact ? "Full size" : "Compact";
});

renderQuickLinks();
renderFlowMap();
renderScreenWall();
renderAnnotations();
renderComponents();
renderScreen(currentScreen);
