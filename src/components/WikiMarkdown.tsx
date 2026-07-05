import React from "react";
import Markdown from "react-markdown";
import { preprocessWikiLinks } from "../lib/wikiApi";

interface WikiMarkdownProps {
  content: string;
  onWikiLink: (pageId: string) => void;
}

export default function WikiMarkdown({ content, onWikiLink }: WikiMarkdownProps) {
  const processed = preprocessWikiLinks(content);

  return (
    <Markdown
      components={{
        a: ({ href, children, ...props }) => {
          if (href?.startsWith("wiki:")) {
            const pageId = decodeURIComponent(href.slice(5));
            return (
              <button
                type="button"
                onClick={() => onWikiLink(pageId)}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 font-semibold cursor-pointer"
              >
                {children}
              </button>
            );
          }

          if (href?.startsWith("http")) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline" {...props}>
                {children}
              </a>
            );
          }

          return (
            <span className="text-slate-400" {...props}>
              {children}
            </span>
          );
        },
      }}
    >
      {processed}
    </Markdown>
  );
}
