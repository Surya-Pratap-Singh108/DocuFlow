import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { logout } from "../services/authService";
import { getDocuments, getConversation, queryDocument } from "../services/documentService";


/* ─────────────────────────────────────────────────────────────────────────────
   Injected styles
───────────────────────────────────────────────────────────────────────────── */
const CHAT_STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes dot-bounce {
    0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
    40%            { transform: translateY(-5px); opacity: 1;   }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .msg-in { animation: fadeUp 0.2s ease; }
  .dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%;
         background: #6366F1; animation: dot-bounce 1.2s infinite; }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  .skeleton-line {
    border-radius: 6px;
    background: linear-gradient(90deg, #1E293B 25%, #273548 50%, #1E293B 75%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite linear;
  }
  .send-btn:not(:disabled):hover  { opacity: 0.85; transform: scale(1.04); }
  .send-btn:not(:disabled):active { transform: scale(0.97); }
  .send-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
`;

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return ""; }
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <div className="flex gap-3 items-start max-w-xl">
        <div className="w-7 h-7 rounded-full flex-shrink-0 skeleton-line" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="skeleton-line h-3 w-3/4" />
          <div className="skeleton-line h-3 w-full" />
          <div className="skeleton-line h-3 w-1/2" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="flex flex-col gap-2 w-48">
          <div className="skeleton-line h-3 w-full" style={{ borderRadius: "12px 12px 4px 12px" }} />
          <div className="skeleton-line h-3 w-3/4 self-end" />
        </div>
      </div>
      <div className="flex gap-3 items-start max-w-xl">
        <div className="w-7 h-7 rounded-full flex-shrink-0 skeleton-line" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="skeleton-line h-3 w-full" />
          <div className="skeleton-line h-3 w-5/6" />
        </div>
      </div>
    </div>
  );
}

/* ── Thinking indicator ───────────────────────────────────────────────────── */
function ThinkingIndicator() {
  return (
    <div className="flex gap-3 items-start msg-in">
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: "#312E81", color: "#A5B4FC" }}
      >
        ✨
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 flex flex-col gap-1"
        style={{ backgroundColor: "#1E293B", border: "1px solid #334155", minWidth: "80px" }}
      >
        <span className="text-xs font-medium" style={{ color: "#A5B4FC" }}>DocuFlow</span>
        <span className="text-xs" style={{ color: "#94A3B8" }}>Thinking...</span>
        <div className="flex gap-1.5 mt-1">
          <span className="dot" /><span className="dot" /><span className="dot" />
        </div>
      </div>
    </div>
  );
}

/* ── Friendly AI error bubble ─────────────────────────────────────────────── */
function AiErrorBubble() {
  return (
    <div className="flex gap-3 items-start msg-in">
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: "#312E81", color: "#A5B4FC" }}
      >
        ✨
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 flex flex-col gap-1"
        style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
      >
        <span className="text-xs font-medium" style={{ color: "#A5B4FC" }}>DocuFlow</span>
        <span className="text-sm" style={{ color: "#94A3B8" }}>
          Unable to generate an answer right now.
        </span>
        <span className="text-xs" style={{ color: "#64748B" }}>
          Please try again later.
        </span>
      </div>
    </div>
  );
}

/* ── Message bubble ───────────────────────────────────────────────────────── */
function MessageBubble({ msg }) {
  if (msg.role === "error") return <AiErrorBubble />;

  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end msg-in">
        <div className="flex flex-col items-end gap-1" style={{ maxWidth: "75%" }}>
          <div
            className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
            style={{ backgroundColor: "#4F46E5", color: "#F1F5F9" }}
          >
            {msg.content}
          </div>
          {msg.createdAt && (
            <span className="text-xs" style={{ color: "#475569" }}>
              {formatTime(msg.createdAt)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start msg-in">
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: "#312E81", color: "#A5B4FC" }}
        title="DocuFlow AI"
      >
        ✨
      </div>
      <div className="flex flex-col gap-1" style={{ maxWidth: "75%" }}>
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
          style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#E2E8F0" }}
        >
          {msg.content}
        </div>
        <div className="flex items-center gap-3 px-1">
          {msg.createdAt && (
            <span className="text-xs" style={{ color: "#475569" }}>
              {formatTime(msg.createdAt)}
            </span>
          )}
          {typeof msg.similarityScore === "number" && (
            <span className="text-xs" style={{ color: "#475569" }}>
              Similarity: {msg.similarityScore.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── DocumentChat page ───────────────────────────────────────────────────── */
export default function DocumentChat({ user, onBack, onLogout }) {
  // documentId comes from the URL: /documents/:documentId
  const { documentId } = useParams();

  const [doc,           setDoc]           = useState(null);
  const [docLoading,    setDocLoading]    = useState(true);
  const [docError,      setDocError]      = useState("");

  const [messages,      setMessages]      = useState([]);
  const [convLoading,   setConvLoading]   = useState(true);

  const [query,         setQuery]         = useState("");
  const [querying,      setQuerying]      = useState(false);

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError,   setLogoutError]   = useState("");

  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  const scrollToBottom = () =>
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  /* ── Load document metadata via GET /documents then find by ID ───────────── */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDocuments();
        const all = data.documents || [];
        const found = all.find((d) => (d._id || d.id) === documentId);
        if (!found) {
          setDocError("Document not found.");
        } else {
          setDoc(found);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "Unable to load document. Please try again.";
        setDocError(msg);
      } finally {
        setDocLoading(false);
      }
    };
    load();
  }, [documentId]);

  /* ── Load conversation history ───────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getConversation(documentId);
        setMessages(data?.conversation?.messages || []);
      } catch {
        // Conversation may not exist yet — treat as empty, not an error
        setMessages([]);
      } finally {
        setConvLoading(false);
      }
    };
    load();
  }, [documentId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  /* ── Submit a query ──────────────────────────────────────────────────────── */
  const handleQuery = async (e) => {
    e?.preventDefault();
    const text = query.trim();
    if (!text || querying) return;

    const userMsg = { role: "user", content: text, createdAt: new Date().toISOString() };

    setMessages((prev) => [...prev, userMsg, { role: "thinking" }]);
    setQuery("");
    setQuerying(true);

    try {
      const data = await queryDocument(documentId, text);
      const aiMsg = {
        role: "assistant",
        content: data.answer,
        similarityScore: data.similarityScore,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "thinking"),
        aiMsg,
      ]);
    } catch {
      // Replace thinking indicator with a friendly error bubble — never expose
      // raw Axios errors, HTTP codes, model names, or backend traces to the user.
      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "thinking"),
        { role: "error" },
      ]);
    } finally {
      setQuerying(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleQuery(); }
  };

  /* ── Logout ──────────────────────────────────────────────────────────────── */
  const handleLogout = async () => {
    setLogoutError("");
    setLogoutLoading(true);
    try {
      await logout();
      onLogout();
    } catch (err) {
      const msg = err?.response?.data?.message || "Logout failed. Please try again.";
      setLogoutError(msg);
    } finally {
      setLogoutLoading(false);
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0F172A" }}>
      <style>{CHAT_STYLES}</style>

      {/* ── Top header ────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid #334155" }}
      >
        <span className="text-lg font-semibold tracking-tight" style={{ color: "#F1F5F9" }}>
          DocuFlow
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "#94A3B8" }}>{user?.name || "User"}</span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "#6366F1", color: "#F1F5F9" }}
          >
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            style={{
              border: "1px solid #334155", color: "#94A3B8", borderRadius: "0.5rem",
              padding: "0.375rem 0.75rem", fontSize: "0.75rem", fontWeight: 500,
              background: "transparent", cursor: logoutLoading ? "not-allowed" : "pointer",
              opacity: logoutLoading ? 0.5 : 1,
              transition: "border-color 0.15s ease, color 0.15s ease, opacity 0.15s ease",
            }}
            onMouseEnter={(e) => { if (!logoutLoading) { e.currentTarget.style.borderColor = "#6366F1"; e.currentTarget.style.color = "#F1F5F9"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94A3B8"; }}
          >
            {logoutLoading ? "Logging out…" : "Logout"}
          </button>
        </div>
      </header>

      {logoutError && (
        <div className="px-6 py-2 flex-shrink-0" style={{ backgroundColor: "#450A0A" }}>
          <p className="text-xs text-center" style={{ color: "#FCA5A5" }}>{logoutError}</p>
        </div>
      )}

      {/* ── Document header ───────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 px-6 py-3 flex-shrink-0 flex-wrap"
        style={{ borderBottom: "1px solid #1E293B" }}
      >
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: "0.375rem",
            color: "#94A3B8", background: "transparent", border: "none",
            cursor: "pointer", fontSize: "0.8rem", fontWeight: 500,
            padding: "0.25rem 0.5rem", borderRadius: "0.375rem",
            transition: "color 0.15s ease, background 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#F1F5F9"; e.currentTarget.style.background = "#1E293B"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Documents
        </button>

        <span style={{ color: "#334155" }}>|</span>

        {/* PDF icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
          fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>

        {/* Title + filename */}
        {docLoading ? (
          <div className="flex flex-col gap-1">
            <div className="skeleton-line h-3 w-40" />
            <div className="skeleton-line h-2.5 w-28" />
          </div>
        ) : docError ? (
          <span className="text-sm" style={{ color: "#F87171" }}>{docError}</span>
        ) : (
          <div className="flex flex-col" style={{ minWidth: 0 }}>
            <span
              className="text-sm font-semibold truncate"
              style={{ color: "#F1F5F9", maxWidth: "280px" }}
              title={doc?.title}
            >
              {doc?.title || "Untitled Document"}
            </span>
            {doc?.fileName && (
              <span
                className="text-xs truncate"
                style={{ color: "#64748B", maxWidth: "280px" }}
                title={doc.fileName}
              >
                {doc.fileName}
              </span>
            )}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Open PDF button */}
        {doc?.fileUrl && (
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              color: "#94A3B8", border: "1px solid #334155", borderRadius: "0.5rem",
              padding: "0.375rem 0.75rem", fontSize: "0.75rem", fontWeight: 500,
              textDecoration: "none", cursor: "pointer", flexShrink: 0,
              transition: "color 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#F1F5F9"; e.currentTarget.style.borderColor = "#6366F1"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.borderColor = "#334155"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open PDF
          </a>
        )}
      </div>

      {/* ── Chat area ─────────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-6"
        style={{ maxHeight: "calc(100vh - 220px)" }}
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-5">

          {/* Show skeleton while EITHER doc or conversation is loading */}
          {(docLoading || convLoading) && <ChatSkeleton />}

          {/* Document-not-found error — give user a back button */}
          {!docLoading && docError && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-sm" style={{ color: "#F87171" }}>{docError}</p>
              <button
                type="button"
                onClick={onBack}
                style={{
                  color: "#6366F1", background: "transparent", border: "1px solid #6366F1",
                  borderRadius: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                ← Back to Documents
              </button>
            </div>
          )}

          {/* Empty conversation state */}
          {!docLoading && !convLoading && !docError && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
              >
                💬
              </div>
              <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>
                Ask a question about this document
              </p>
              <p className="text-xs" style={{ color: "#475569" }}>
                DocuFlow will search the document and answer based on its content.
              </p>
            </div>
          )}

          {/* Messages */}
          {!docLoading && !convLoading && !docError &&
            messages.map((msg, i) =>
              msg.role === "thinking"
                ? <ThinkingIndicator key="thinking" />
                : <MessageBubble key={i} msg={msg} />
            )
          }

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ── Query input ───────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-4 sm:px-8 py-4"
        style={{ borderTop: "1px solid #1E293B", backgroundColor: "#0F172A" }}
      >
        <form onSubmit={handleQuery} className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document..."
            disabled={querying}
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none resize-none"
            style={{
              backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F1F5F9",
              lineHeight: "1.5", cursor: querying ? "not-allowed" : "text",
              opacity: querying ? 0.7 : 1,
              transition: "border-color 0.15s ease, opacity 0.15s ease", overflowY: "hidden",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
            onBlur={(e) => (e.target.style.borderColor = "#334155")}
          />

          <button
            type="submit"
            disabled={querying || !query.trim()}
            className="send-btn rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: querying || !query.trim() ? "#1E293B" : "#6366F1",
              color: querying || !query.trim() ? "#475569" : "#F1F5F9",
              border: "1px solid",
              borderColor: querying || !query.trim() ? "#334155" : "#6366F1",
              cursor: querying || !query.trim() ? "not-allowed" : "pointer",
              width: "46px", height: "46px",
              transition: "background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease",
            }}
            title="Send (Enter)"
          >
            {querying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: "spin 0.75s linear infinite" }}>
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </form>
        <p className="text-center mt-2 text-xs" style={{ color: "#334155" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
