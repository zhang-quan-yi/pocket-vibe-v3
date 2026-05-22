import type {
  ChatSession,
  ContextChip,
  Note,
  ReaderPayload,
  Repo,
  ResolvedContext,
  SearchResult,
  SourceRange,
} from "../schema";

const fallbackApiBase = "http://localhost:8080";

export const apiBase = import.meta.env.VITE_API_BASE || fallbackApiBase;

async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getMockRepos(): Promise<Repo[]> {
  const result = await requestJSON<{ repos: Repo[] }>("/mock/repos");
  return result.repos;
}

export function getReaderPayload(projectId: string, filePath: string): Promise<ReaderPayload> {
  const params = new URLSearchParams({ projectId, filePath });
  return requestJSON<ReaderPayload>(`/reader/payload?${params}`);
}

export async function search(projectId: string, query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({ projectId, query });
  const result = await requestJSON<{ results: SearchResult[] }>(`/search?${params}`);
  return result.results;
}

export function resolveContext(chips: ContextChip[]): Promise<ResolvedContext> {
  return requestJSON<ResolvedContext>("/context/resolve", {
    method: "POST",
    body: JSON.stringify({ chips }),
  });
}

export function createChatSession(): Promise<ChatSession> {
  return requestJSON<ChatSession>("/chat/sessions", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function saveNote(title: string, body: string, anchors: SourceRange[]): Promise<Note> {
  return requestJSON<Note>("/notes", {
    method: "POST",
    body: JSON.stringify({ title, body, anchors }),
  });
}

export function chatEventURL(sessionId: string, question: string, chips: ContextChip[]): string {
  const params = new URLSearchParams({
    question,
    context: chips.map((chip) => chip.label).join(", "),
  });
  return `${apiBase}/chat/sessions/${sessionId}/events?${params}`;
}
