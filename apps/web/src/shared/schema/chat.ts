export type ChatSession = {
  sessionId: string;
  createdAt: string;
};

export type ToolCallLogEntry = {
  name: string;
  summary: string;
};

export type ChatToolEventPayload = ToolCallLogEntry;

export type ChatDeltaEventPayload = {
  text: string;
};
