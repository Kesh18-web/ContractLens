import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Plus, Upload, Search, FileText, MessageSquare, Trash2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Document } from "@/hooks/useDocumentManagement";

export interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onNewChat: () => void;
  onUploadClick: () => void;
  filteredDocs: Document[];
  selectedDocs: string[];
  docQuery: string;
  onDocQueryChange: (query: string) => void;
  onToggleDoc: (id: string) => void;
  onDeleteDocument?: (docId: string) => void;
  chatSessions?: Array<{ session_id: string; created_at: string; total_messages: number }>;
  currentChatSessionId?: string | null;
  onSelectChatSession?: (sessionId: string) => void;
  onDeleteChatSession?: (sessionId: string) => void;
  appTitle: string;
  newChatLabel: string;
  uploadLabel: string;
  recentDocumentsLabel: string;
  searchPlaceholder: string;
  noDocumentsText: string;
}

/**
 * Sidebar component with document list and navigation
 */
export const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  onNewChat,
  onUploadClick,
  filteredDocs,
  selectedDocs,
  docQuery,
  onDocQueryChange,
  onToggleDoc,
  onDeleteDocument,
  chatSessions = [],
  currentChatSessionId,
  onSelectChatSession,
  onDeleteChatSession,
  appTitle,
  newChatLabel,
  uploadLabel,
  recentDocumentsLabel,
  searchPlaceholder,
  noDocumentsText,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 bg-[#050505] border-r border-white/10 p-4 transition-all duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:static ${
        isCollapsed ? "md:w-20" : "md:w-80"
      } flex flex-col h-full overflow-hidden`}
    >
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {appTitle}
              </h2>
            </div>
          )}
          <div className={`flex items-center gap-1.5 ${isCollapsed ? "w-full justify-center" : ""}`}>
            {!isCollapsed && <LanguageSelector />}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-white/60 hover:text-white h-8 w-8"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4 text-purple-400" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button className="flex-1" onClick={onNewChat}>
            <Plus className="mr-2 h-4 w-4" /> {newChatLabel}
          </Button>
          <Button variant="secondary" onClick={onUploadClick}>
            <Upload className="mr-2 h-4 w-4" /> {uploadLabel}
          </Button>
        </div>

        {/* Recent Chats Section */}
        {chatSessions && chatSessions.length > 0 && (
          <div className="flex flex-col shrink-0 max-h-64 overflow-hidden">
            <label className="text-xs uppercase tracking-wide text-white/60 mb-2 shrink-0 flex items-center justify-between">
              <span>Recent Chats</span>
              <span className="text-[10px] text-purple-400 font-normal">{chatSessions.length} sessions</span>
            </label>
            <div className="overflow-y-auto no-scrollbar space-y-1 pr-1">
              {chatSessions.map((session, idx) => {
                const isActive = session.session_id === currentChatSessionId;
                const formattedDate = session.created_at
                  ? new Date(session.created_at).toLocaleDateString([], { month: "short", day: "numeric" })
                  : "";
                let rawTitle = ((session as any).title || "").trim();
                rawTitle = rawTitle.replace(/^[\{\}\[\]"']+|[\{\}\[\]"']+$/g, "").replace(/^topic:\s*/i, "").trim();
                const isGenericTitle = !rawTitle || /^Chat \d{2}\/\d{2}/.test(rawTitle) || rawTitle === "New Chat Started" || rawTitle.toLowerCase() === "new chat";
                const title = !isGenericTitle ? rawTitle : "New Chat";
                return (
                  <div
                    key={session.session_id}
                    onClick={() => onSelectChatSession?.(session.session_id)}
                    className={`group w-full flex items-center justify-between rounded-lg border px-3 py-1.5 text-left text-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-purple-500/70 bg-purple-500/20 text-white font-medium shadow-md shadow-purple-500/10"
                        : "border-white/5 bg-[#0F0F0F] text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2">
                      <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-purple-400" : "text-white/50"}`} />
                      <span className="truncate">{title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-white/40">{formattedDate}</span>
                      {onDeleteChatSession && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChatSession(session.session_id);
                          }}
                          className="p-1 text-white/30 hover:text-red-400 transition-colors rounded"
                          title="Delete Chat"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col min-h-0 flex-1">
          <label className="text-xs uppercase tracking-wide text-white/60 shrink-0">
            {recentDocumentsLabel}
          </label>
          <div className="mt-2 flex items-center gap-2 shrink-0">
            <Input
              placeholder={searchPlaceholder}
              value={docQuery}
              onChange={(e) => onDocQueryChange(e.target.value)}
              className="bg-[#0F0F0F] border-white/10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="border border-white/10"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 overflow-y-auto no-scrollbar flex-1 pr-1 space-y-1">
            {filteredDocs.length === 0 && (
              <div className="text-xs text-white/50">{noDocumentsText}</div>
            )}
            {filteredDocs.map((doc) => {
              const checked = selectedDocs.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => onToggleDoc(doc.id)}
                  className={`group flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-all duration-200 cursor-pointer ${
                    checked
                      ? "border-purple-500/70 bg-gradient-to-r from-purple-500/20 to-purple-600/10 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20 scale-[1.02]"
                      : "border-white/5 bg-[#0F0F0F] hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <FileText
                      className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                        checked ? "text-purple-400" : "text-white/70"
                      }`}
                    />
                    <div className="truncate">
                      <div
                        className={`text-sm leading-tight truncate transition-colors duration-200 ${
                          checked ? "text-white" : "text-white/90"
                        }`}
                      >
                        {doc.name}
                      </div>
                      <div
                        className={`text-[10px] transition-colors duration-200 ${
                          checked ? "text-purple-200/80" : "text-white/50"
                        }`}
                      >
                        {doc.date} {doc.status ? `• ${doc.status}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleDoc(doc.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 accent-purple-500 rounded border-white/20 bg-[#0F0F0F]"
                    />
                    {onDeleteDocument && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDocument(doc.id);
                        }}
                        className="p-1 text-white/30 hover:text-red-400 transition-colors rounded"
                        title="Delete Document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
