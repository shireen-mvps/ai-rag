"use client";

import { useState, Children } from "react";
import ReactMarkdown from "react-markdown";
import type { Source } from "@/types";

/* ── Inline citation badge ── */
function CitedText({ children, onCiteClick }: { children: string; onCiteClick: () => void }) {
  const parts = children.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          return (
            <sup
              key={i}
              onClick={onCiteClick}
              className="inline-flex items-center justify-center min-w-[15px] h-[15px] text-[9px] font-bold text-k-bg bg-k-accent rounded-full mx-0.5 px-0.5 cursor-pointer hover:bg-k-accent2 transition-colors select-none"
              title={`View Source ${match[1]}`}
            >
              {match[1]}
            </sup>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* Walk ReactMarkdown children and wrap plain strings with CitedText */
function processNode(node: React.ReactNode, onCiteClick: () => void): React.ReactNode {
  return Children.map(node, (child) => {
    if (typeof child === "string") return <CitedText onCiteClick={onCiteClick}>{child}</CitedText>;
    return child;
  }) ?? node;
}

export default function ChatMessage({
  role,
  content,
  sources,
}: {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}) {
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied]           = useState(false);
  const [feedback, setFeedback]       = useState<"up" | "down" | null>(null);

  const toggleSources = () => setShowSources((v) => !v);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col gap-2 ${role === "user" ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
          role === "user"
            ? "bg-k-accent text-k-bg text-sm font-medium rounded-tr-sm"
            : "bg-k-surface2 border border-white/[0.09] text-k-text text-sm rounded-tl-sm"
        }`}
      >
        {role === "assistant" ? (
          <ReactMarkdown
            components={{
              ul:     ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1.5">{children}</ul>,
              ol:     ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1.5">{children}</ol>,
              li:     ({ children }) => (
                <li className="leading-relaxed">{processNode(children, toggleSources)}</li>
              ),
              strong: ({ children }) => <strong className="font-semibold text-k-accent">{children}</strong>,
              p:      ({ children }) => (
                <p className="mb-2 last:mb-0">{processNode(children, toggleSources)}</p>
              ),
              code:   ({ children }) => (
                <code className="bg-white/[0.06] text-k-accent px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          content
        )}
      </div>

      {role === "assistant" && (
        <div className="max-w-[85%] w-full flex flex-col gap-2">
          <div className="flex items-center gap-3">

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-k-dim hover:text-k-muted transition-colors"
              title="Copy response"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3 text-k-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-k-accent">Copied</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  Copy
                </>
              )}
            </button>

            {/* Sources toggle */}
            {sources && sources.length > 0 && (
              <button
                onClick={toggleSources}
                className="flex items-center gap-1 text-xs text-k-muted hover:text-k-accent transition-colors"
              >
                <svg
                  className={`w-3 h-3 transition-transform ${showSources ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                {sources.length} source{sources.length > 1 ? "s" : ""}
              </button>
            )}

            {/* Feedback */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setFeedback(feedback === "up" ? null : "up")}
                title="Good response"
                className={`p-1 rounded-lg transition-all ${
                  feedback === "up"
                    ? "text-k-accent bg-k-accent/10"
                    : "text-k-dim hover:text-k-muted hover:bg-white/[0.04]"
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904" />
                </svg>
              </button>
              <button
                onClick={() => setFeedback(feedback === "down" ? null : "down")}
                title="Poor response"
                className={`p-1 rounded-lg transition-all ${
                  feedback === "down"
                    ? "text-red-400 bg-red-500/10"
                    : "text-k-dim hover:text-k-muted hover:bg-white/[0.04]"
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sources list */}
          {showSources && sources && sources.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              {sources.map((s, i) => (
                <div
                  key={i}
                  className="bg-k-surface2 border border-white/[0.10] rounded-xl px-4 py-3 leading-relaxed"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2">
                      <sup className="inline-flex items-center justify-center min-w-[15px] h-[15px] text-[9px] font-bold text-k-bg bg-k-accent rounded-full px-0.5">
                        {i + 1}
                      </sup>
                      <span className="text-xs font-semibold text-k-text/90 font-mono">Source {i + 1}</span>
                    </span>
                    <span className="text-xs text-k-accent/70 font-mono">{s.score}% match</span>
                  </div>
                  <p className="text-sm text-k-muted leading-relaxed line-clamp-4">{s.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
