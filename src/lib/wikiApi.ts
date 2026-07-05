export interface WikiNavItem {
  id: string;
  title: string;
  summary: string;
  category: string;
}

export interface WikiPage {
  id: string;
  title: string;
  description?: string;
  type?: string;
  category: string;
  content: string;
}

export type WikiCoverage = "ok" | "partial" | "none";

export interface WikiCitation {
  id: string;
  title: string;
  excerpt: string;
}

export interface WikiAskResponse {
  success: boolean;
  answer?: string;
  error?: string;
  citations?: WikiCitation[];
  coverage?: WikiCoverage;
}

export interface WikiIndexMeta {
  pageCount: number;
  chunkCount: number;
  builtAt: string;
}

export async function fetchWikiNav(): Promise<WikiNavItem[]> {
  const res = await fetch("/api/wiki/pages");
  if (!res.ok) {
    throw new Error("Failed to load wiki navigation");
  }
  const data = (await res.json()) as { pages: WikiNavItem[] };
  return data.pages;
}

export async function fetchWikiPage(id: string): Promise<WikiPage> {
  const res = await fetch(`/api/wiki/page?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to load wiki page: ${id}`);
  }
  return (await res.json()) as WikiPage;
}

export async function askWikiQuestion(question: string): Promise<WikiAskResponse> {
  const res = await fetch("/api/wiki/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return (await res.json()) as WikiAskResponse;
}

/** Convert Obsidian [[wikilink]] and [[link|label]] to markdown links for WikiMarkdown. */
export function preprocessWikiLinks(markdown: string): string {
  return markdown.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, slug, label) => {
    const id = slug.trim();
    const text = (label ?? id.split("/").pop() ?? id).trim();
    return `[${text}](wiki:${id})`;
  });
}
