import fs from "fs";
import path from "path";

const WIKI_ROOT = path.join(process.cwd(), "llm-wiki-lotto", "wiki");

export interface WikiPageMeta {
  id: string;
  title: string;
  description?: string;
  type?: string;
  tags?: string[];
}

export interface WikiNavItem {
  id: string;
  title: string;
  summary: string;
  category: string;
}

export interface WikiPageResponse {
  id: string;
  title: string;
  description?: string;
  type?: string;
  category: string;
  content: string;
}

function normalizeId(raw: string): string {
  return raw.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\.md$/i, "");
}

function parseSimpleFrontmatter(raw: string): { meta: Record<string, string | string[]>; body: string } {
  const normalized = raw.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { meta: {}, body: raw };
  }

  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    return { meta: {}, body: raw };
  }

  const meta: Record<string, string | string[]> = {};
  const block = normalized.slice(4, end);

  for (const line of block.split("\n")) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    const trimmed = value.trim();

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      meta[key] = trimmed
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    } else {
      meta[key] = trimmed.replace(/^['"]|['"]$/g, "");
    }
  }

  return { meta, body: normalized.slice(end + 5) };
}

export function readPageFile(id: string): { meta: Record<string, string | string[]>; body: string } | null {
  const normalized = normalizeId(id);
  const filePath = path.join(WIKI_ROOT, `${normalized}.md`);

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return parseSimpleFrontmatter(raw);
}

function titleFromId(id: string): string {
  const base = id.split("/").pop() ?? id;
  return base.replace(/-/g, " ");
}

export function listWikiPageIds(): string[] {
  const ids: string[] = [];

  function walk(dir: string, prefix: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, rel.replace(/\.md$/, ""));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        ids.push(normalizeId(rel));
      }
    }
  }

  walk(WIKI_ROOT, "");
  return ids.sort();
}

export function getWikiPage(id: string): WikiPageResponse | null {
  const normalized = normalizeId(id);
  const parsed = readPageFile(normalized);
  if (!parsed) return null;

  const title = String(parsed.meta.title ?? titleFromId(normalized));

  return {
    id: normalized,
    title,
    description: parsed.meta.description ? String(parsed.meta.description) : undefined,
    type: parsed.meta.type ? String(parsed.meta.type) : undefined,
    category: inferCategory(normalized),
    content: parsed.body.trim(),
  };
}

function inferCategory(id: string): string {
  if (id === "index" || id === "overview" || id === "log" || id === "POLICY") return "Overview";
  if (id.startsWith("sources/")) return "Sources";
  if (id.startsWith("entities/")) return "Entities";
  if (id.startsWith("concepts/")) return "Concepts";
  if (id.startsWith("analyses/")) return "Analyses";
  return "Wiki";
}

export function parseWikiNav(): WikiNavItem[] {
  const indexPath = path.join(WIKI_ROOT, "index.md");
  if (!fs.existsSync(indexPath)) {
    return listWikiPageIds().map((id) => ({
      id,
      title: titleFromId(id),
      summary: "",
      category: inferCategory(id),
    }));
  }

  const raw = fs.readFileSync(indexPath, "utf-8");
  const { body } = parseSimpleFrontmatter(raw);
  const items: WikiNavItem[] = [];
  let category = "Wiki";

  for (const line of body.split("\n")) {
    const section = line.match(/^##\s+(.+)$/);
    if (section) {
      category = section[1].trim();
      continue;
    }

    if (line.startsWith("### ")) {
      continue;
    }

    const link = line.match(/^-\s+\[\[([^\]|]+)(?:\|[^\]]+)?\]\]\s*(?:—\s*(.+))?$/);
    if (!link) continue;

    const id = normalizeId(link[1].trim());
    const summary = (link[2] ?? "").trim();
    const parsed = readPageFile(id);
    const title = parsed ? String(parsed.meta.title ?? titleFromId(id)) : titleFromId(id);
    items.push({
      id,
      title,
      summary,
      category,
    });
  }

  return items;
}
