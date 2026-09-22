import { useEffect, useState } from "react";
import { getDocuments, uploadDocument } from "../services/documentService";
import { logout } from "../services/authService";

/* ─────────────────────────────────────────────────────────────────────────────
   Keyframe styles injected once — keeps the file self-contained, no new deps.
───────────────────────────────────────────────────────────────────────────── */
const MODAL_STYLE = `
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.96) translateY(6px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }
  @keyframes backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .modal-backdrop { animation: backdropIn 0.18s ease; }
  .modal-card     { animation: modalIn   0.2s  cubic-bezier(0.16,1,0.3,1); }
  .doc-card {
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .doc-card:hover {
    transform: scale(1.015);
    box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    border-color: #4B5563 !important;
  }
  .doc-card:active { transform: scale(1.005); }
`;

// ── PDF icon ─────────────────────────────────────────────────────────────────
function PdfIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="#6366F1"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <text x="7" y="19" fontSize="6" fontWeight="bold" fill="#6366F1" stroke="none">
                PDF
            </text>
        </svg>
    );
}

// ── Inline spinner ────────────────────────────────────────────────────────────
function Spinner({ size = 14 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animation: "spin 0.75s linear infinite" }}
        >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
    );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const colors = {
        ready: { bg: "#14532D", text: "#86EFAC" },
        processing: { bg: "#1E3A5F", text: "#93C5FD" },
        failed: { bg: "#450A0A", text: "#FCA5A5" },
    };
    const key = (status || "").toLowerCase();
    const { bg, text } = colors[key] || { bg: "#1E293B", text: "#94A3B8" };
    return (
        <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
            style={{ backgroundColor: bg, color: text }}
        >
            {status || "unknown"}
        </span>
    );
}

// ── Document card ─────────────────────────────────────────────────────────────
function DocumentCard({ doc, onOpenDoc }) {
    return (
        <div
            className="doc-card flex flex-col gap-3 rounded-xl p-5"
            style={{
                backgroundColor: "#1E293B",
                border: "1px solid #334155",
            }}
            onClick={() => onOpenDoc(doc)}
        >
            {/* Top row: icon + status */}
            <div className="flex items-start justify-between">
                <PdfIcon />
                <StatusBadge status={doc.status} />
            </div>

            {/* Title */}
            <p
                className="text-sm font-semibold leading-snug line-clamp-2"
                style={{ color: "#F1F5F9" }}
            >
                {doc.title || "Untitled Document"}
            </p>

            {/* File name */}
            <p
                className="text-xs truncate"
                style={{ color: "#94A3B8" }}
                title={doc.fileName}
            >
                {doc.fileName || "—"}
            </p>
        </div>
    );
}

// ── Documents page ────────────────────────────────────────────────────────────
export default function Documents({ user, onLogout, onOpenDoc }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    // ── Upload form state ──────────────────────────────────────────────────────
    const [showUpload, setShowUpload] = useState(false);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const handleCancel = () => {
        if (uploading) return; // don't let cancel interrupt an in-flight upload
        setShowUpload(false);
        setUploadTitle("");
        setUploadFile(null);
        setUploadError("");
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadTitle.trim() || !uploadFile) return;

        setUploadError("");
        setUploading(true);
        try {
            await uploadDocument(uploadFile, uploadTitle.trim());
            const data = await getDocuments();
            setDocuments(data.documents || []);
            // success → close modal and reset
            setShowUpload(false);
            setUploadTitle("");
            setUploadFile(null);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                "Unable to upload the document. Please try again.";
            setUploadError(message);
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        setLogoutError("");
        setLogoutLoading(true);
        try {
            await logout();
            onLogout(); // clears user in App → renders Auth
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                "Logout failed. Please try again.";
            setLogoutError(message);
        } finally {
            setLogoutLoading(false);
        }
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const data = await getDocuments();
                setDocuments(data.documents || []);
            } catch (err) {
                const message =
                    err?.response?.data?.message ||
                    "Failed to load documents. Please try again.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#0F172A" }}>
            {/* Inject keyframe styles */}
            <style>{MODAL_STYLE}</style>

            {/* ── Top bar ─────────────────────────────────────────────────────────── */}
            <header
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid #334155" }}
            >
                {/* Brand */}
                <span
                    className="text-lg font-semibold tracking-tight"
                    style={{ color: "#F1F5F9" }}
                >
                    DocuFlow
                </span>

                {/* User name + avatar + logout */}
                <div className="flex items-center gap-3">
                    {/* Name */}
                    <span className="text-sm" style={{ color: "#94A3B8" }}>
                        {user?.name || "User"}
                    </span>

                    {/* Avatar */}
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                            backgroundColor: "#6366F1",
                            color: "#F1F5F9",
                            transition: "opacity 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                        {(user?.name || "U")[0].toUpperCase()}
                    </div>

                    {/* Logout button */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        style={{
                            border: "1px solid #334155",
                            color: "#94A3B8",
                            cursor: logoutLoading ? "not-allowed" : "pointer",
                            opacity: logoutLoading ? 0.5 : 1,
                            transition: "opacity 0.15s ease, border-color 0.15s ease, color 0.15s ease",
                            borderRadius: "0.5rem",
                            padding: "0.375rem 0.75rem",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                            if (!logoutLoading) {
                                e.currentTarget.style.borderColor = "#6366F1";
                                e.currentTarget.style.color = "#F1F5F9";
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#334155";
                            e.currentTarget.style.color = "#94A3B8";
                        }}
                    >
                        {logoutLoading ? "Logging out…" : "Logout"}
                    </button>
                </div>
            </header>

            {/* Logout error banner */}
            {logoutError && (
                <div className="px-6 py-2" style={{ backgroundColor: "#450A0A" }}>
                    <p className="text-xs text-center" style={{ color: "#FCA5A5" }}>
                        {logoutError}
                    </p>
                </div>
            )}

            {/* ── Main content ─────────────────────────────────────────────────────── */}
            <main className="max-w-5xl mx-auto px-6 py-10">

                {/* Page heading + upload button */}
                <div className="flex items-center justify-between mb-8">
                    <h1
                        className="text-2xl font-semibold tracking-tight"
                        style={{ color: "#F1F5F9" }}
                    >
                        Your Documents
                    </h1>

                    {/* Upload PDF button */}
                    <button
                        type="button"
                        onClick={() => setShowUpload(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            backgroundColor: "#6366F1",
                            color: "#F1F5F9",
                            border: "none",
                            borderRadius: "0.5rem",
                            padding: "0.625rem 1rem",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "transform 0.15s ease, opacity 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.02)";
                            e.currentTarget.style.opacity = "0.92";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.opacity = "1";
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Upload PDF
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div
                            className="w-8 h-8 rounded-full border-4 animate-spin"
                            style={{ borderColor: "#334155", borderTopColor: "#6366F1" }}
                        />
                        <p className="text-sm" style={{ color: "#94A3B8" }}>
                            Loading documents…
                        </p>
                    </div>
                )}

                {/* Fetch error */}
                {!loading && error && (
                    <p className="text-sm text-center py-24" style={{ color: "#F87171" }}>
                        {error}
                    </p>
                )}

                {/* Empty state */}
                {!loading && !error && documents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <p className="text-base font-medium" style={{ color: "#F1F5F9" }}>
                            No documents yet.
                        </p>
                        <p className="text-sm" style={{ color: "#94A3B8" }}>
                            Upload your first PDF to get started.
                        </p>
                    </div>
                )}

                {/* Document grid */}
                {!loading && !error && documents.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {documents.map((doc) => (
                            <DocumentCard key={doc._id || doc.id} doc={doc} onOpenDoc={onOpenDoc} />
                        ))}
                    </div>
                )}
            </main>

            {/* ── Upload modal ─────────────────────────────────────────────────────── */}
            {showUpload && (
                <div
                    className="modal-backdrop fixed inset-0 flex items-center justify-center px-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 50 }}
                    onClick={handleCancel}
                >
                    <div
                        className="modal-card w-full max-w-md rounded-2xl p-8 flex flex-col gap-6"
                        style={{
                            backgroundColor: "#1E293B",
                            border: "1px solid #334155",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Heading */}
                        <h2 className="text-base font-semibold" style={{ color: "#F1F5F9" }}>
                            Upload PDF
                        </h2>

                        <form className="flex flex-col gap-5" onSubmit={handleUpload}>

                            {/* ── Document Title ── */}
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="upload-title"
                                    className="text-sm font-medium"
                                    style={{ color: "#94A3B8" }}
                                >
                                    Document Title
                                </label>
                                <input
                                    id="upload-title"
                                    type="text"
                                    placeholder="Enter document title"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    disabled={uploading}
                                    className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
                                    style={{
                                        backgroundColor: "#0F172A",
                                        border: "1px solid #334155",
                                        color: "#F1F5F9",
                                        cursor: uploading ? "not-allowed" : "text",
                                        opacity: uploading ? 0.6 : 1,
                                        transition: "opacity 0.15s ease",
                                    }}
                                    onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #6366F1")}
                                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                                />
                            </div>

                            {/* ── PDF File picker ── */}
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="upload-file"
                                    className="text-sm font-medium"
                                    style={{ color: "#94A3B8" }}
                                >
                                    PDF File
                                </label>

                                {/*
                  Visually styled label acts as the click target.
                  The real <input> is hidden but still functional.
                */}
                                <label
                                    htmlFor="upload-file"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.625rem",
                                        backgroundColor: "#0F172A",
                                        border: uploadFile ? "1px solid #6366F1" : "1px dashed #475569",
                                        borderRadius: "0.5rem",
                                        padding: "0.625rem 0.875rem",
                                        cursor: uploading ? "not-allowed" : "pointer",
                                        opacity: uploading ? 0.6 : 1,
                                        transition: "border-color 0.15s ease, opacity 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!uploading && !uploadFile)
                                            e.currentTarget.style.borderColor = "#6366F1";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!uploadFile)
                                            e.currentTarget.style.borderColor = "#475569";
                                    }}
                                >
                                    {/* Upload cloud icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={uploadFile ? "#6366F1" : "#64748B"}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ flexShrink: 0 }}
                                    >
                                        <polyline points="16 16 12 12 8 16" />
                                        <line x1="12" y1="12" x2="12" y2="21" />
                                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                    </svg>

                                    <span
                                        className="text-sm truncate"
                                        style={{ color: uploadFile ? "#F1F5F9" : "#64748B" }}
                                    >
                                        {uploadFile ? uploadFile.name : "Click to choose a PDF…"}
                                    </span>

                                    {/* Hidden native input */}
                                    <input
                                        id="upload-file"
                                        type="file"
                                        accept="application/pdf"
                                        disabled={uploading}
                                        onChange={(e) => {
                                            setUploadFile(e.target.files[0] || null);
                                            setUploadError("");
                                        }}
                                        style={{ display: "none" }}
                                    />
                                </label>
                            </div>

                            {/* Upload error message */}
                            {uploadError && (
                                <p className="text-xs" style={{ color: "#F87171" }}>
                                    {uploadError}
                                </p>
                            )}

                            {/* ── Action buttons ── */}
                            <div className="flex gap-3 justify-end">
                                {/* Cancel */}
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={uploading}
                                    style={{
                                        border: "1px solid #334155",
                                        color: "#94A3B8",
                                        borderRadius: "0.5rem",
                                        padding: "0.5rem 1rem",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        background: "transparent",
                                        cursor: uploading ? "not-allowed" : "pointer",
                                        opacity: uploading ? 0.4 : 1,
                                        transition: "opacity 0.15s ease, border-color 0.15s ease, color 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!uploading) {
                                            e.currentTarget.style.borderColor = "#6366F1";
                                            e.currentTarget.style.color = "#F1F5F9";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "#334155";
                                        e.currentTarget.style.color = "#94A3B8";
                                    }}
                                >
                                    Cancel
                                </button>

                                {/* Upload / Uploading… */}
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.375rem",
                                        backgroundColor: "#6366F1",
                                        color: "#F1F5F9",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        padding: "0.5rem 1rem",
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        cursor: uploading ? "not-allowed" : "pointer",
                                        opacity: uploading ? 0.7 : 1,
                                        transition: "opacity 0.15s ease, transform 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!uploading) e.currentTarget.style.opacity = "0.9";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!uploading) e.currentTarget.style.opacity = "1";
                                    }}
                                >
                                    {uploading && <Spinner size={13} />}
                                    {uploading ? "Uploading…" : "Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
