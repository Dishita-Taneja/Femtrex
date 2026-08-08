"use client";

import ReactMarkdown from "react-markdown";
import { ArrowUp, FileUp, Sparkles, Wrench, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConversationRail } from "@/features/ai-founder-copilot/components/ConversationRail";
import { promptSuggestions } from "@/features/ai-founder-copilot/constants/prompts";
import { useCopilot } from "@/features/ai-founder-copilot/hooks/useCopilot";

export function CopilotPage() {
  const { input, setInput, messages, streaming, error, send } = useCopilot("priya-demo");

  return (
    <div className="flex min-h-[calc(100vh-78px)]">
      <ConversationRail />
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[72px] items-center justify-between border-b border-femtrex-line px-6">
          <div>
            <h1 className="text-xl font-semibold text-white">AI Founder Copilot</h1>
            <p className="text-xs text-femtrex-soft">ReAct Tool-Assisted Agent Engine</p>
          </div>
          <Badge variant="violet" className="flex items-center gap-1.5">
            <Sparkles className="size-3" /> LangChain ReAct Agent
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {messages.length === 0 && (
              <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-8 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-femtrex-violet to-femtrex-pink text-white mb-4">
                  <Sparkles className="size-8" />
                </div>
                <h3 className="text-xl font-semibold text-white">Ask Anything, Get Tool-Verified Answers</h3>
                <p className="mt-2 text-femtrex-soft max-w-lg mx-auto">
                  Equipped with live platform tools: <span className="text-femtrex-violet">scheme_lookup</span>, <span className="text-femtrex-mint">mentor_lookup</span>, and <span className="text-femtrex-pink">passport_lookup</span>.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={message.role === "user" ? "max-w-2xl rounded-[24px] bg-gradient-to-r from-femtrex-violet to-femtrex-pink px-6 py-4 text-white" : "max-w-4xl rounded-[24px] border border-femtrex-line bg-femtrex-panel px-6 py-5 text-white w-full"}>
                  
                  {/* Tool transparency badge */}
                  {message.role === "assistant" && message.tools_called && message.tools_called.length > 0 && (
                    <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-femtrex-line/50 pb-2">
                      <span className="flex items-center gap-1 text-xs text-femtrex-soft font-mono">
                        <Wrench className="size-3 text-femtrex-violet" /> Tools Invoked:
                      </span>
                      {message.tools_called.map((toolName) => (
                        <span key={toolName} className="rounded-full border border-femtrex-violet/40 bg-femtrex-violet/10 px-2.5 py-0.5 text-xs text-femtrex-violet font-mono font-medium">
                          {toolName}
                        </span>
                      ))}
                    </div>
                  )}

                  <ReactMarkdown className="markdown max-w-none prose prose-invert leading-relaxed text-sm md:text-base">{message.content}</ReactMarkdown>
                  <p className="mt-3 text-right text-xs text-femtrex-soft font-mono">{message.createdAt}</p>
                </div>
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                <AlertTriangle className="size-5 shrink-0 text-red-400" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {streaming && (
              <div className="flex items-center gap-3 rounded-[24px] border border-femtrex-line bg-femtrex-panel p-5 text-femtrex-soft">
                <Loader2 className="size-5 animate-spin text-femtrex-violet" />
                <span>Femtrex AI Agent is querying tools and generating response...</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-femtrex-line p-4">
          <div className="mb-4 flex gap-3 overflow-x-auto pb-1">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                className="whitespace-nowrap rounded-full border border-femtrex-line bg-femtrex-elevated px-4 py-2 text-sm text-femtrex-soft hover:text-white transition hover:border-femtrex-violet"
                onClick={() => send(suggestion.prompt)}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-3">
            <Button variant="outline" size="icon" aria-label="Upload file"><FileUp className="size-5" /></Button>
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder="Ask your AI Co-founder anything... (e.g. 'What schemes am I eligible for?')"
              className="min-h-24 flex-1"
            />
            <Button variant="gradient" size="icon" className="size-14 rounded-full shrink-0" onClick={() => send()} disabled={streaming || !input.trim()}>
              <ArrowUp className="size-5" />
            </Button>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-femtrex-soft">
            <Sparkles className="size-4 text-femtrex-pink" />
            Femtrex ReAct Agent queries live backend databases (ChromaDB, Firestore) via tools.
          </p>
        </div>
      </section>
    </div>
  );
}
