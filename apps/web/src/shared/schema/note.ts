import type { Anchor } from "./source";

export type Note = {
  id: string;
  title: string;
  body: string;
  anchors: Anchor[];
  createdAt: string;
};
