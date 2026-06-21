import { useState, useRef, useCallback, useEffect } from "react";

// ============================================================
// TYPES & CONSTANTS
// ============================================================
const PAGES = {
  HOME: "HOME",
  GENERATE: "GENERATE",
  EDITOR: "EDITOR",
  HISTORY: "HISTORY",
};

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const SCRIPT_STYLES = [
  { value: "documentary", label: "Documentary" },
  { value: "tutorial", label: "Tutorial / How-to" },
  { value: "promotional", label: "Promotional" },
  { value: "narrative", label: "Narrative Story" },
  { value: "educational", label: "Educational" },
  { value: "entertainment", label: "Entertainment" },
];

const SCRIPT_TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "energetic", label: "Energetic" },
  { value: "serious", label: "Serious" },
  { value: "humorous", label: "Humorous" },
  { value: "inspirational", label: "Inspirational" },
];

const DURATIONS = [
  { value: "30", label: "30 seconds" },
  { value: "60", label: "1 minute" },
  { value: "120", label: "2 minutes" },
  { value: "300", label: "5 minutes" },
  { value: "600", label: "10 minutes" },
];

// ============================================================
// GEMINI API
// ============================================================
async function callGemini(apiKey, prompt, systemInstruction = "") {
  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    ...(systemInstruction && {
      systemInstruction: { parts: [{ text: systemInstruction }] },
    }),
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 4096,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API Error: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================
const STORAGE_KEY = "video_script_history";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function createScript(data) {
  return {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...data,
  };
}

// ============================================================
// ICONS (inline SVG)
// ============================================================
const Icon = {
  Film: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
    </svg>
  ),
  Wand: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <path d="m15 4-1 1"/><path d="m18 7 1-1"/><path d="m4 18 1-1"/><path d="m7 21 1-1"/><path d="M9.586 9.586 3 21l11.414-6.586"/><path d="m21 3-9.586 9.586"/><path d="m15 4 5 5"/><path d="M4 18 9 13"/>
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Sparkles: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em" }}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
};

// ============================================================
// DESIGN TOKENS
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0A0B0F;
    --surface:  #111318;
    --surface2: #181B22;
    --border:   #252830;
    --border2:  #2E3240;
    --text:     #E8EAF0;
    --muted:    #6B7280;
    --accent:   #7C6AF7;
    --accent2:  #5B8CF7;
    --grad:     linear-gradient(135deg, #7C6AF7 0%, #5B8CF7 100%);
    --danger:   #F75B5B;
    --success:  #5BF7A0;
    --font:     'Space Grotesk', sans-serif;
    --mono:     'JetBrains Mono', monospace;
    --r:        10px;
    --r2:       16px;
    --shadow:   0 4px 24px rgba(0,0,0,0.4);
  }

  html, body, #root { height: 100%; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* Layout */
  .app { display: flex; flex-direction: column; min-height: 100vh; }

  /* Nav */
  .nav {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 24px;
    background: rgba(17,19,24,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
  }
  .nav-logo {
    display: flex; align-items: center; gap: 8px;
    font-size: 17px; font-weight: 700; letter-spacing: -0.3px;
    background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    cursor: pointer; margin-right: 16px;
  }
  .nav-logo-icon { font-size: 20px; -webkit-text-fill-color: initial; }
  .nav-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: var(--r);
    background: transparent; border: none; color: var(--muted);
    font-family: var(--font); font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .nav-btn:hover { color: var(--text); background: var(--surface2); }
  .nav-btn.active { color: var(--text); background: var(--surface2); }
  .nav-spacer { flex: 1; }

  /* Page */
  .page { flex: 1; max-width: 900px; margin: 0 auto; padding: 40px 24px; width: 100%; }
  .page-wide { max-width: 1100px; }

  /* Hero */
  .hero { text-align: center; padding: 60px 0 48px; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px; border-radius: 100px;
    background: rgba(124,106,247,0.12); border: 1px solid rgba(124,106,247,0.3);
    font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
    color: var(--accent); margin-bottom: 24px;
  }
  .hero h1 {
    font-size: clamp(32px, 6vw, 54px); font-weight: 700; letter-spacing: -1.5px;
    line-height: 1.1; margin-bottom: 20px;
  }
  .hero h1 span { background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .hero-sub { font-size: 17px; color: var(--muted); max-width: 480px; margin: 0 auto 40px; }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  /* Feature cards */
  .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 56px; }
  .feature-card {
    padding: 24px; border-radius: var(--r2);
    background: var(--surface); border: 1px solid var(--border);
    transition: border-color 0.2s, transform 0.2s;
  }
  .feature-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .feature-icon {
    width: 44px; height: 44px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 14px;
    background: rgba(124,106,247,0.12); color: var(--accent);
  }
  .feature-card h3 { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
  .feature-card p { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: var(--r);
    font-family: var(--font); font-size: 14px; font-weight: 600;
    border: none; cursor: pointer; transition: all 0.15s; text-decoration: none;
  }
  .btn-primary { background: var(--grad); color: #fff; }
  .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,106,247,0.35); }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border2); }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { color: var(--text); border-color: var(--border2); }
  .btn-danger { background: rgba(247,91,91,0.12); color: var(--danger); border: 1px solid rgba(247,91,91,0.2); }
  .btn-danger:hover { background: rgba(247,91,91,0.2); }
  .btn-sm { padding: 6px 12px; font-size: 13px; }
  .btn-lg { padding: 13px 28px; font-size: 15px; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  /* Card */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r2); padding: 24px;
  }

  /* Form */
  .form-section { margin-bottom: 28px; }
  .form-row { display: grid; gap: 16px; }
  .form-row-2 { grid-template-columns: 1fr 1fr; }
  .form-row-3 { grid-template-columns: 1fr 1fr 1fr; }
  .form-group { display: flex; flex-direction: column; gap: 8px; }
  .form-label { font-size: 13px; font-weight: 600; color: var(--muted); letter-spacing: 0.3px; text-transform: uppercase; }
  .form-input, .form-textarea, .form-select {
    padding: 10px 14px;
    background: var(--surface2); border: 1px solid var(--border2);
    border-radius: var(--r); color: var(--text);
    font-family: var(--font); font-size: 14px;
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none; width: 100%;
  }
  .form-input:focus, .form-textarea:focus, .form-select:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(124,106,247,0.15);
  }
  .form-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
  .form-select { appearance: none; cursor: pointer; }
  .form-hint { font-size: 12px; color: var(--muted); }
  .input-wrap { position: relative; }
  .input-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); cursor: pointer; display: flex; }

  /* API Key input */
  .apikey-banner {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px; margin-bottom: 28px;
    background: rgba(124,106,247,0.08); border: 1px solid rgba(124,106,247,0.2);
    border-radius: var(--r2); font-size: 13px;
  }
  .apikey-banner.valid { background: rgba(91,247,160,0.07); border-color: rgba(91,247,160,0.2); }
  .apikey-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
  .apikey-dot.valid { background: var(--success); }

  /* Progress / loading */
  .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px; }
  .spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--border2); border-top-color: var(--accent);
    border-radius: 50%; animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 14px; color: var(--muted); }
  .progress-steps { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 320px; margin-top: 8px; }
  .progress-step { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); }
  .progress-step.done { color: var(--success); }
  .progress-step.active { color: var(--text); }

  /* Script output */
  .script-output {
    font-family: var(--mono); font-size: 13.5px; line-height: 1.8;
    white-space: pre-wrap; color: var(--text);
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--r); padding: 24px;
    min-height: 300px; max-height: 520px; overflow-y: auto;
  }
  .script-editor {
    font-family: var(--mono); font-size: 13.5px; line-height: 1.8;
    white-space: pre-wrap; color: var(--text);
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--r); padding: 24px;
    min-height: 400px; resize: vertical; width: 100%;
    outline: none; transition: border-color 0.15s;
  }
  .script-editor:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(124,106,247,0.1); }

  /* Toolbar */
  .toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
  .toolbar-spacer { flex: 1; }

  /* History */
  .history-list { display: flex; flex-direction: column; gap: 12px; }
  .history-item {
    padding: 18px 20px; border-radius: var(--r2);
    background: var(--surface); border: 1px solid var(--border);
    cursor: pointer; transition: border-color 0.15s, transform 0.15s;
    display: flex; gap: 16px; align-items: flex-start;
  }
  .history-item:hover { border-color: var(--border2); transform: translateX(2px); }
  .history-item-meta { flex: 1; min-width: 0; }
  .history-item-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .history-item-sub { font-size: 12px; color: var(--muted); display: flex; gap: 12px; flex-wrap: wrap; }
  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 100px;
    font-size: 11px; font-weight: 600;
    background: rgba(124,106,247,0.12); color: var(--accent); border: 1px solid rgba(124,106,247,0.2);
  }
  .history-item-actions { display: flex; gap: 6px; flex-shrink: 0; }

  /* Divider */
  .divider { height: 1px; background: var(--border); margin: 28px 0; }

  /* Section title */
  .section-title { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px; }

  /* Toast */
  .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
  .toast {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 18px; border-radius: var(--r);
    background: var(--surface); border: 1px solid var(--border2);
    box-shadow: var(--shadow); font-size: 14px;
    animation: slideIn 0.2s ease; max-width: 340px;
  }
  .toast.success { border-color: rgba(91,247,160,0.3); }
  .toast.error { border-color: rgba(247,91,91,0.3); }
  @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }

  /* Empty state */
  .empty { text-align: center; padding: 60px 24px; color: var(--muted); }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.4; }
  .empty h3 { font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
  .empty p { font-size: 14px; margin-bottom: 24px; }

  /* Error */
  .error-box {
    padding: 14px 18px; border-radius: var(--r);
    background: rgba(247,91,91,0.08); border: 1px solid rgba(247,91,91,0.25);
    color: var(--danger); font-size: 13px; margin-top: 12px;
  }

  /* Page header */
  .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
  .page-header h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
  .page-header-sub { color: var(--muted); font-size: 14px; margin-top: 2px; }

  /* Responsive */
  @media (max-width: 640px) {
    .nav { padding: 10px 16px; }
    .page { padding: 24px 16px; }
    .form-row-2, .form-row-3 { grid-template-columns: 1fr; }
    .hero { padding: 40px 0 32px; }
    .hero-actions { flex-direction: column; align-items: stretch; }
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--muted); }
`;

// ============================================================
// TOAST
// ============================================================
function useToast() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === "success" ? <Icon.Check /> : "⚠"}
          {t.message}
        </div>
      ))}
    </div>
  );

  return { show, ToastContainer };
}

// ============================================================
// API KEY SECTION
// ============================================================
function ApiKeySection({ apiKey, setApiKey, isValid }) {
  const [show, setShow] = useState(false);
  const [input, setInput] = useState(apiKey);

  const handleSave = () => {
    setApiKey(input.trim());
  };

  return (
    <div className={`apikey-banner ${isValid ? "valid" : ""}`}>
      <div className={`apikey-dot ${isValid ? "valid" : ""}`} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
          Gemini API Key {isValid ? "✓ Connected" : "— Not set"}
        </div>
        <div className="input-wrap" style={{ display: "flex", gap: 8 }}>
          <input
            className="form-input"
            type={show ? "text" : "password"}
            placeholder="AIza..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            style={{ fontFamily: "var(--mono)", fontSize: 13 }}
          />
          <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} onClick={() => setShow(!show)}>
            {show ? <Icon.EyeOff /> : <Icon.Eye />}
          </button>
          <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HOME PAGE
// ============================================================
function HomePage({ navigate, apiKey, setApiKey }) {
  const isValid = apiKey.length > 10;

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-badge">
          <Icon.Sparkles /> AI-Powered Script Writing
        </div>
        <h1>
          Turn Videos into<br />
          <span>Professional Scripts</span>
        </h1>
        <p className="hero-sub">
          Describe your video concept and let Gemini AI craft a compelling, ready-to-use script in seconds.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate(PAGES.GENERATE)} disabled={!isValid}>
            <Icon.Wand /> Generate Script
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate(PAGES.HISTORY)}>
            <Icon.History /> View History
          </button>
        </div>
        {!isValid && <p style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>Set your API key below to get started.</p>}
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <div className="section-title">API Configuration</div>
        <ApiKeySection apiKey={apiKey} setApiKey={setApiKey} isValid={isValid} />
        <p className="form-hint">
          Get your free API key from{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
            Google AI Studio
          </a>
          . Your key is stored locally and never sent anywhere except Google's API.
        </p>
      </div>

      <div className="features">
        {[
          { icon: <Icon.Wand />, title: "AI-Powered Generation", desc: "Gemini 2.5 Flash generates natural, engaging scripts tailored to your style and tone." },
          { icon: <Icon.Edit />, title: "In-Browser Editor", desc: "Refine your script with AI assistance — improve, shorten, expand, or change tone." },
          { icon: <Icon.History />, title: "Script History", desc: "All generated scripts are saved locally so you can revisit and reuse them anytime." },
          { icon: <Icon.Download />, title: "Export Ready", desc: "Copy to clipboard or download as a text file — ready for your production workflow." },
        ].map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// GENERATE PAGE
// ============================================================
function GeneratePage({ navigate, apiKey, onSave }) {
  const { show, ToastContainer } = useToast();
  const [form, setForm] = useState({
    topic: "",
    description: "",
    style: "documentary",
    tone: "professional",
    duration: "60",
    targetAudience: "",
    keywords: "",
    language: "English",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const STEPS = [
    "Analyzing your brief…",
    "Structuring the narrative…",
    "Writing the script…",
    "Polishing the output…",
  ];

  const generate = async () => {
    if (!form.topic.trim()) return setError("Please enter a video topic.");
    setError("");
    setLoading(true);
    setResult(null);
    setStep(0);

    const stepInterval = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1800);

    try {
      const prompt = `Create a ${form.duration}-second video script for the following:

Topic: ${form.topic}
${form.description ? `Description: ${form.description}` : ""}
Style: ${form.style}
Tone: ${form.tone}
Target Audience: ${form.targetAudience || "General audience"}
${form.keywords ? `Keywords to include: ${form.keywords}` : ""}
Language: ${form.language}

Format the script with:
- [INTRO] section
- [MAIN CONTENT] with clear scene directions in brackets like [Scene: ...]
- [OUTRO] section
- Estimated read time and pacing notes at the end
- Mark pauses with (pause) and emphasis with *word*

Write a complete, production-ready script.`;

      const text = await callGemini(
        apiKey,
        prompt,
        "You are a professional video script writer with 10+ years of experience creating compelling content for YouTube, documentaries, corporate videos, and social media. Write scripts that are natural, engaging, and tailored to the specified style and audience."
      );

      const scriptData = createScript({
        topic: form.topic,
        style: form.style,
        tone: form.tone,
        duration: form.duration,
        language: form.language,
        content: text,
      });

      onSave(scriptData);
      setResult(scriptData);
      show("Script generated successfully!");
    } catch (e) {
      setError(e.message || "Failed to generate script. Check your API key.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <ToastContainer />

      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(PAGES.HOME)}>
          <Icon.ArrowLeft /> Back
        </button>
        <div>
          <h2>Generate Script</h2>
          <div className="page-header-sub">Describe your video and let AI do the writing.</div>
        </div>
      </div>

      {!result ? (
        <div className="card">
          <div className="section-title">Video Brief</div>

          <div className="form-section">
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Video Topic *</label>
              <input className="form-input" placeholder="e.g. How to brew the perfect pour-over coffee" value={form.topic} onChange={set("topic")} />
            </div>
            <div className="form-group">
              <label className="form-label">Additional Description</label>
              <textarea className="form-textarea" placeholder="Extra context, key points to cover, or specific angles..." value={form.description} onChange={set("description")} rows={3} />
            </div>
          </div>

          <div className="divider" />
          <div className="section-title">Script Settings</div>

          <div className="form-section">
            <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Style</label>
                <select className="form-select" value={form.style} onChange={set("style")}>
                  {SCRIPT_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tone</label>
                <select className="form-select" value={form.tone} onChange={set("tone")}>
                  {SCRIPT_TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <select className="form-select" value={form.duration} onChange={set("duration")}>
                  {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <input className="form-input" placeholder="e.g. Coffee enthusiasts, beginners" value={form.targetAudience} onChange={set("targetAudience")} />
              </div>
              <div className="form-group">
                <label className="form-label">Language</label>
                <input className="form-input" placeholder="e.g. English, Burmese, Japanese" value={form.language} onChange={set("language")} />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Keywords / Key Points</label>
            <input className="form-input" placeholder="Comma-separated keywords to include in the script" value={form.keywords} onChange={set("keywords")} />
            <span className="form-hint">These will be naturally woven into the script.</span>
          </div>

          {error && <div className="error-box">{error}</div>}

          {loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <div className="loading-text">Generating your script…</div>
              <div className="progress-steps">
                {STEPS.map((s, i) => (
                  <div key={i} className={`progress-step ${i < step ? "done" : i === step ? "active" : ""}`}>
                    {i < step ? <Icon.Check /> : <span style={{ width: "1em", display: "inline-block" }}>·</span>}
                    {s}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={generate}>
              <Icon.Sparkles /> Generate Script
            </button>
          )}
        </div>
      ) : (
        <ScriptResultView
          script={result}
          onEdit={() => navigate(PAGES.EDITOR, { script: result })}
          onNew={() => setResult(null)}
          onHistory={() => navigate(PAGES.HISTORY)}
          showToast={show}
        />
      )}
    </div>
  );
}

// ============================================================
// SCRIPT RESULT VIEW
// ============================================================
function ScriptResultView({ script, onEdit, onNew, onHistory, showToast }) {
  const copy = () => {
    navigator.clipboard.writeText(script.content);
    showToast("Copied to clipboard!");
  };

  const download = () => {
    const blob = new Blob([script.content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${script.topic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_script.txt`;
    a.click();
    showToast("Downloaded!");
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{script.topic}</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge">{script.style}</span>
            <span className="badge">{script.tone}</span>
            <span className="badge">{script.duration}s</span>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <button className="btn btn-ghost btn-sm" onClick={copy}><Icon.Copy /> Copy</button>
        <button className="btn btn-ghost btn-sm" onClick={download}><Icon.Download /> Download</button>
        <div className="toolbar-spacer" />
        <button className="btn btn-secondary btn-sm" onClick={onEdit}><Icon.Edit /> Edit in Editor</button>
      </div>

      <pre className="script-output">{script.content}</pre>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button className="btn btn-primary" onClick={onNew}><Icon.Wand /> Generate Another</button>
        <button className="btn btn-secondary" onClick={onHistory}><Icon.History /> View History</button>
      </div>
    </div>
  );
}

// ============================================================
// EDITOR PAGE
// ============================================================
function EditorPage({ navigate, apiKey, script: initialScript, onSave }) {
  const { show, ToastContainer } = useToast();
  const [script, setScript] = useState(initialScript || null);
  const [content, setContent] = useState(initialScript?.content || "");
  const [aiPrompt, setAiPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const AI_ACTIONS = [
    { label: "Make it shorter", prompt: "Shorten this script while keeping all key points. Reduce by about 30%." },
    { label: "Make it longer", prompt: "Expand this script with more detail, examples, and depth. Add about 40% more content." },
    { label: "More energetic", prompt: "Rewrite this script with more energy, enthusiasm, and dynamic language." },
    { label: "More formal", prompt: "Rewrite this script in a more professional and formal tone." },
    { label: "Add hooks", prompt: "Add stronger opening hooks and compelling calls-to-action throughout the script." },
    { label: "Fix flow", prompt: "Improve the narrative flow, transitions, and pacing of this script." },
  ];

  const runAI = async (customPrompt) => {
    const p = customPrompt || aiPrompt;
    if (!p.trim()) return;
    setError("");
    setLoading(true);
    try {
      const result = await callGemini(
        apiKey,
        `Here is a video script:\n\n${content}\n\n---\nInstruction: ${p}\n\nReturn ONLY the revised script, no explanation.`,
        "You are a professional script editor. Apply the requested changes precisely and return only the improved script."
      );
      setContent(result);
      setAiPrompt("");
      show("Script updated!");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!script) return;
    const updated = { ...script, content };
    onSave(updated);
    show("Saved to history!");
  };

  const copy = () => {
    navigator.clipboard.writeText(content);
    show("Copied!");
  };

  const download = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `script_${Date.now()}.txt`;
    a.click();
  };

  if (!script) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty-icon"><Icon.Edit /></div>
          <h3>No script to edit</h3>
          <p>Generate a script first, then open it in the editor.</p>
          <button className="btn btn-primary" onClick={() => navigate(PAGES.GENERATE)}><Icon.Wand /> Generate Script</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-wide">
      <ToastContainer />

      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(PAGES.HISTORY)}><Icon.ArrowLeft /> Back</button>
        <div style={{ flex: 1 }}>
          <h2>Script Editor</h2>
          <div className="page-header-sub">{script.topic}</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={save}><Icon.Check /> Save</button>
        <button className="btn btn-ghost btn-sm" onClick={copy}><Icon.Copy /></button>
        <button className="btn btn-ghost btn-sm" onClick={download}><Icon.Download /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div>
          <textarea
            className="script-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Quick AI Edits</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {AI_ACTIONS.map((a) => (
                <button key={a.label} className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start" }} onClick={() => runAI(a.prompt)} disabled={loading}>
                  <Icon.Sparkles /> {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Custom AI Instruction</div>
            <textarea
              className="form-textarea"
              placeholder="e.g. Add a product comparison table in the middle section…"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={4}
              style={{ marginBottom: 8 }}
            />
            {error && <div className="error-box" style={{ marginBottom: 8 }}>{error}</div>}
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => runAI()} disabled={loading || !aiPrompt.trim()}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing…</> : <><Icon.Sparkles /> Apply</>}
            </button>
          </div>

          <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--surface)", borderRadius: "var(--r)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Word count</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{content.split(/\s+/).filter(Boolean).length}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              ~{Math.ceil(content.split(/\s+/).filter(Boolean).length / 130)} min read time
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .editor-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

// ============================================================
// HISTORY PAGE
// ============================================================
function HistoryPage({ navigate, history, onDelete, onEdit }) {
  const { show, ToastContainer } = useToast();
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);

  const filtered = history.filter((s) =>
    s.topic.toLowerCase().includes(search.toLowerCase()) ||
    s.style.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    onDelete(id);
    setConfirm(null);
    show("Script deleted.", "error");
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="page">
      <ToastContainer />

      <div className="page-header">
        <div style={{ flex: 1 }}>
          <h2>Script History</h2>
          <div className="page-header-sub">{history.length} script{history.length !== 1 ? "s" : ""} saved</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate(PAGES.GENERATE)}><Icon.Wand /> New Script</button>
      </div>

      {history.length > 0 && (
        <input
          className="form-input"
          placeholder="Search scripts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 20 }}
        />
      )}

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon" style={{ fontSize: 40 }}>📄</div>
          <h3>{history.length === 0 ? "No scripts yet" : "No results"}</h3>
          <p>{history.length === 0 ? "Generate your first script to see it here." : "Try a different search term."}</p>
          {history.length === 0 && <button className="btn btn-primary" onClick={() => navigate(PAGES.GENERATE)}><Icon.Wand /> Generate Script</button>}
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((s) => (
            <div key={s.id} className="history-item" onClick={() => onEdit(s)}>
              <div className="history-item-meta">
                <div className="history-item-title">{s.topic}</div>
                <div className="history-item-sub">
                  <span className="badge">{s.style}</span>
                  <span className="badge">{s.tone}</span>
                  <span>{s.duration}s</span>
                  <span>{formatDate(s.createdAt)}</span>
                  <span>{s.content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
              <div className="history-item-actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-secondary btn-sm" onClick={() => onEdit(s)}><Icon.Edit /></button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirm(s.id)}><Icon.Trash /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div className="card" style={{ maxWidth: 360, width: "calc(100% - 48px)" }}>
            <h3 style={{ marginBottom: 10 }}>Delete script?</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(confirm)}>Delete</button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ROOT APP
// ============================================================
export default function App() {
  const [page, setPage] = useState(PAGES.HOME);
  const [pageProps, setPageProps] = useState({});
  const [history, setHistory] = useState(loadHistory);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || import.meta.env?.VITE_GEMINI_API_KEY || "");

  // Persist API key
  useEffect(() => {
    if (apiKey) localStorage.setItem("gemini_api_key", apiKey);
  }, [apiKey]);

  const navigate = (p, props = {}) => {
    setPage(p);
    setPageProps(props);
    window.scrollTo(0, 0);
  };

  const saveScript = (script) => {
    setHistory((h) => {
      const existing = h.findIndex((x) => x.id === script.id);
      const next = existing >= 0
        ? h.map((x) => (x.id === script.id ? script : x))
        : [script, ...h];
      saveHistory(next);
      return next;
    });
  };

  const deleteScript = (id) => {
    setHistory((h) => {
      const next = h.filter((x) => x.id !== id);
      saveHistory(next);
      return next;
    });
  };

  const editScript = (script) => navigate(PAGES.EDITOR, { script });

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-logo" onClick={() => navigate(PAGES.HOME)}>
            <span className="nav-logo-icon">🎬</span>
            ScriptAI
          </div>
          <button className={`nav-btn ${page === PAGES.HOME ? "active" : ""}`} onClick={() => navigate(PAGES.HOME)}>
            Home
          </button>
          <button className={`nav-btn ${page === PAGES.GENERATE ? "active" : ""}`} onClick={() => navigate(PAGES.GENERATE)}>
            <Icon.Wand /> Generate
          </button>
          <button className={`nav-btn ${page === PAGES.EDITOR ? "active" : ""}`} onClick={() => navigate(PAGES.EDITOR, pageProps)}>
            <Icon.Edit /> Editor
          </button>
          <button className={`nav-btn ${page === PAGES.HISTORY ? "active" : ""}`} onClick={() => navigate(PAGES.HISTORY)}>
            <Icon.History /> History
            {history.length > 0 && (
              <span style={{ background: "var(--accent)", color: "#fff", fontSize: 11, padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                {history.length}
              </span>
            )}
          </button>
        </nav>

        {page === PAGES.HOME && <HomePage navigate={navigate} apiKey={apiKey} setApiKey={setApiKey} />}
        {page === PAGES.GENERATE && <GeneratePage navigate={navigate} apiKey={apiKey} onSave={saveScript} />}
        {page === PAGES.EDITOR && <EditorPage navigate={navigate} apiKey={apiKey} script={pageProps.script} onSave={saveScript} />}
        {page === PAGES.HISTORY && <HistoryPage navigate={navigate} history={history} onDelete={deleteScript} onEdit={editScript} />}
      </div>
    </>
  );
}
