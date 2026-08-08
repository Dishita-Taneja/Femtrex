import { MessageSquare, Plus, Sparkles } from "lucide-react";
import { conversations } from "@/shared/constants/demo-data";

export function ConversationRail() {
  return (
    <aside className="hidden border-r border-femtrex-line bg-femtrex-navy lg:block lg:w-[324px]">
      <div className="flex h-[72px] items-center justify-between border-b border-femtrex-line px-5">
        <h2 className="flex items-center gap-3 text-xl font-semibold text-white"><Sparkles className="size-5 text-femtrex-violet" /> Conversations</h2>
        <Plus className="size-5 text-femtrex-violet" />
      </div>
      <div className="space-y-2 p-4">
        {conversations.map((conversation, index) => (
          <button key={conversation.id} className={`w-full rounded-2xl p-4 text-left ${index === 0 ? "border-r-2 border-femtrex-violet bg-white/[0.03]" : ""}`}>
            <p className="flex items-center gap-3 font-medium text-white"><MessageSquare className="size-4 text-femtrex-violet" /> {conversation.title}</p>
            <p className="mt-2 truncate pl-7 text-sm text-femtrex-soft">{conversation.preview}</p>
            <p className="mt-2 pl-7 text-sm text-femtrex-soft">{conversation.time}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
