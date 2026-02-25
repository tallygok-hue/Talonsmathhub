import { useState, useEffect, useCallback } from 'react';
import { MathHome } from './components/MathHome';
import { SecretLogin } from './components/SecretLogin';
import { GamePortal } from './components/GamePortal';
import { AdminPanel } from './components/AdminPanel';

export type AppView = 'math' | 'login' | 'games' | 'admin';

export interface LogEntry {
  user: string;
  code: string;
  time: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
}

// ── HARDCODED built-in codes (always work, any device) ──────────────
export const VALID_CODES = ['talon2024', 'mathgamer', 'unblockedftw', 'letmein99', 'gamer123'];
export const DEFAULT_ADMIN_CODE = 'admintalon';

// ── SINGLE SOURCE OF TRUTH: Apps Script URL ─────────────────────────
// Hardcoded so it works on EVERY device with zero setup
export const HARDCODED_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHHZ2yFOGX1bvk6Ow7YgX1Rk_7-P4TRde6sCBBrgoxFqTZ97RA3fjxJNCTv6cLQMo0/exec';

// ── Get the active Apps Script URL (hardcoded beats localStorage) ───
export function getScriptUrl(): string {
  return HARDCODED_SCRIPT_URL || localStorage.getItem('tmh_script_url') || '';
}

// ── Get admin code: cloud (sheet) > localStorage > default ──────────
// Cloud codes are fetched from Apps Script on load and cached in sessionStorage
function getAdminCode(): string {
  return sessionStorage.getItem('tmh_cloud_admin') ||
    localStorage.getItem('tmh_admin_code') ||
    DEFAULT_ADMIN_CODE;
}

// ── Get all valid user codes: built-in + local + cloud ───────────────
// Cloud codes are fetched fresh from Google Sheets on every page load
// and cached in sessionStorage so they're always up to date
export function getAllValidCodes(): string[] {
  const local: string[] = (() => {
    try { return JSON.parse(localStorage.getItem('tmh_custom_codes') || '[]'); }
    catch { return []; }
  })();
  const cloud: string[] = (() => {
    try { return JSON.parse(sessionStorage.getItem('tmh_cloud_codes') || '[]'); }
    catch { return []; }
  })();
  return [...new Set([...VALID_CODES, ...local, ...cloud])];
}

// ── Force-fetch latest cloud codes (called before every login check) ─
// This ensures codes added on another device are always seen
async function refreshCloudCodes(): Promise<string[]> {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) return getAllValidCodes();
  try {
    const res = await fetch(`${scriptUrl}?action=getConfig`, { mode: 'cors' });
    const data = await res.json();
    if (data.adminCode) sessionStorage.setItem('tmh_cloud_admin', data.adminCode);
    if (Array.isArray(data.customCodes)) {
      sessionStorage.setItem('tmh_cloud_codes', JSON.stringify(data.customCodes));
    }
  } catch {
    // silent - falls back to cached/local
  }
  return getAllValidCodes();
}

// ══════════════════════════════════════════════════════════════
// GOOGLE SHEETS LOGGING
// Uses multiple methods to ensure logs get through:
// 1. Google Apps Script Web App (primary - set your URL below)
// 2. Google Forms submission (backup - set your form URL below)
// 3. Local storage (always works as fallback)
// ══════════════════════════════════════════════════════════════

// ── Get user IP for logging ──────────────────────────────────────────
async function getUserIP(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}

// ── Log to Google Sheets via Apps Script ────────────────────────────
// Uses GET + no-cors so it works from any browser without CORS issues
async function logToGoogleSheet(entry: LogEntry) {
  const scriptUrl = getScriptUrl();

  if (!scriptUrl) {
    console.log('[TMH] No Apps Script URL set — log saved locally only.');
    return;
  }

  try {
    const ip = await getUserIP();
    const params = new URLSearchParams({
      action: 'log',
      username: entry.user,
      code: entry.code,
      status: entry.success ? 'SUCCESS' : 'FAILED',
      timestamp: entry.time,
      ip,
      userAgent: navigator.userAgent.substring(0, 150),
    });

    await fetch(`${scriptUrl}?${params.toString()}`, {
      method: 'GET',
      mode: 'no-cors',
    });
    console.log('[TMH] Logged to sheet:', entry.success ? '✅' : '❌', entry.user);
  } catch (err) {
    console.warn('[TMH] Sheet log failed (saved locally):', err);
  }
}

// ── Fetch cloud config from Apps Script on app load ─────────────────
// This syncs codes and admin password from the Sheet to any device
async function fetchCloudConfig() {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) return;
  try {
    const res = await fetch(`${scriptUrl}?action=getConfig`, { mode: 'cors' });
    const data = await res.json();
    if (data.adminCode) sessionStorage.setItem('tmh_cloud_admin', data.adminCode);
    if (Array.isArray(data.customCodes)) {
      sessionStorage.setItem('tmh_cloud_codes', JSON.stringify(data.customCodes));
    }
    console.log('[TMH] Cloud config synced ✅');
  } catch {
    // Silent — falls back to local/default values
    console.log('[TMH] Cloud config unavailable — using local/default values');
  }
}

// ── Session tracking ─────────────────────────────────────────────────
function saveSession(username: string, isAdmin: boolean) {
  try {
    const sessions = JSON.parse(localStorage.getItem('tmh_sessions') || '[]');
    const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const entry = {
      id: sessionId,
      username,
      loginTime: new Date().toLocaleString(),
      device: navigator.userAgent.substring(0, 80),
      isAdmin,
      active: true,
    };
    sessions.push(entry);
    if (sessions.length > 200) sessions.splice(0, sessions.length - 200);
    localStorage.setItem('tmh_sessions', JSON.stringify(sessions));
    sessionStorage.setItem('tmh_session_id', sessionId);

    // Log session to sheet if URL configured
    const scriptUrl = getScriptUrl();
    if (scriptUrl) {
      const params = new URLSearchParams({
        action: 'logSession',
        sessionId,
        username,
        loginTime: entry.loginTime,
        device: entry.device,
        isAdmin: String(isAdmin),
      });
      fetch(`${scriptUrl}?${params}`, { mode: 'no-cors' }).catch(() => {});
    }
  } catch { /* ignore */ }
}

// Save log to localStorage for persistence
function saveLogLocally(entry: LogEntry) {
  try {
    const existing = JSON.parse(localStorage.getItem('tmh_login_logs') || '[]');
    existing.push(entry);
    // Keep last 500 entries
    if (existing.length > 500) existing.splice(0, existing.length - 500);
    localStorage.setItem('tmh_login_logs', JSON.stringify(existing));
  } catch {
    // ignore
  }
}

// Load logs from localStorage
function loadLocalLogs(): LogEntry[] {
  try {
    return JSON.parse(localStorage.getItem('tmh_login_logs') || '[]');
  } catch {
    return [];
  }
}

export function App() {
  const [view, setView] = useState<AppView>('math');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [loginLog, setLoginLog] = useState<LogEntry[]>(() => loadLocalLogs());

  // On mount: restore session + sync cloud config
  useEffect(() => {
    const auth = sessionStorage.getItem('tmh_auth');
    const admin = sessionStorage.getItem('tmh_admin');
    const user = sessionStorage.getItem('tmh_user');
    if (auth === 'true') {
      setIsAuthenticated(true);
      setCurrentUser(user || 'Unknown');
    }
    if (admin === 'true') {
      setIsAdmin(true);
    }
    // Pull cloud config (codes + admin password) in background
    fetchCloudConfig();
  }, []);

  const handleLogin = useCallback(async (username: string, code: string): Promise<{ success: boolean; isAdmin: boolean; message: string }> => {
    // Always refresh cloud codes before checking — ensures cross-device codes work
    const validCodes = await refreshCloudCodes();
    const adminCode = getAdminCode();

    const logEntry: LogEntry = {
      user: username,
      code: code,
      time: new Date().toLocaleString(),
      success: false,
    };

    // ── Admin check ──────────────────────────────────────────────────
    if (code === adminCode || code.toLowerCase() === adminCode.toLowerCase()) {
      logEntry.success = true;
      logEntry.code = '***ADMIN***';
      setLoginLog(prev => [...prev, logEntry]);
      saveLogLocally(logEntry);
      logToGoogleSheet(logEntry);
      saveSession(username, true);
      setIsAuthenticated(true);
      setIsAdmin(true);
      setCurrentUser(username);
      sessionStorage.setItem('tmh_auth', 'true');
      sessionStorage.setItem('tmh_admin', 'true');
      sessionStorage.setItem('tmh_user', username);
      return { success: true, isAdmin: true, message: 'Admin access granted.' };
    }

    // ── User code check (case-insensitive) ───────────────────────────
    // validCodes includes: built-in + localStorage custom + cloud custom (just refreshed)
    const codeMatch = validCodes.some(
      c => c.toLowerCase() === code.toLowerCase() || c === code
    );

    if (codeMatch) {
      logEntry.success = true;
      setLoginLog(prev => [...prev, logEntry]);
      saveLogLocally(logEntry);
      logToGoogleSheet(logEntry);
      saveSession(username, false);
      setIsAuthenticated(true);
      setCurrentUser(username);
      sessionStorage.setItem('tmh_auth', 'true');
      sessionStorage.setItem('tmh_user', username);
      return { success: true, isAdmin: false, message: 'Access granted!' };
    }

    // ── Failed attempt ───────────────────────────────────────────────
    setLoginLog(prev => [...prev, logEntry]);
    saveLogLocally(logEntry);
    logToGoogleSheet(logEntry);
    return { success: false, isAdmin: false, message: 'Invalid access code. Try again.' };
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser('');
    setView('math');
    sessionStorage.removeItem('tmh_auth');
    sessionStorage.removeItem('tmh_admin');
    sessionStorage.removeItem('tmh_user');
  }, []);

  const clearLogs = useCallback(() => {
    setLoginLog([]);
    localStorage.removeItem('tmh_login_logs');
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {view === 'math' && (
        <MathHome
          onSecretAccess={() => setView('login')}
          isAuthenticated={isAuthenticated}
          onGoToGames={() => setView('games')}
        />
      )}
      {view === 'login' && (
        <SecretLogin
          onLogin={handleLogin}
          onBack={() => setView('math')}
          onSuccess={(admin: boolean) => setView(admin ? 'admin' : 'games')}
        />
      )}
      {view === 'games' && isAuthenticated && (
        <GamePortal
          username={currentUser}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          onAdminPanel={() => setView('admin')}
        />
      )}
      {view === 'admin' && isAdmin && (
        <AdminPanel
          loginLog={loginLog}
          onBack={() => setView('games')}
          onLogout={handleLogout}
          onClearLogs={clearLogs}
        />
      )}
    </div>
  );
}
