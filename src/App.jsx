import { useState, useEffect, useRef, useCallback } from "react";

// ─── Copy ──────────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { days: 1, label: "Day One", emoji: "🛋️", message: "Day 1. The journey begins. Couch is warm. 🛋️" },
  { days: 3, label: "Three Day Hermit", emoji: "🌙", message: "3 days strong. You've officially forgotten what an alarm clock sounds like." },
  { days: 5, label: "Workweek Skipper", emoji: "🎟️", message: "5 days. You've successfully ghosted an entire workweek." },
  { days: 7, label: "One Week Wonder", emoji: "✨", message: "One week. You are THRIVING. LinkedIn who?" },
  { days: 10, label: "Double Digits", emoji: "🔟", message: "10 days. Officially a double-digit unemployment professional." },
  { days: 14, label: "Fortnight Folk Hero", emoji: "🎨", message: "Two weeks. Your sleep schedule is a work of abstract art." },
  { days: 21, label: "Habit Formed", emoji: "🌀", message: "21 days. Science says habits form in three weeks. You did it." },
  { days: 30, label: "Cave Dweller", emoji: "🦇", message: "A WHOLE MONTH?! Wow. You're a real cave dweller. Keep it up. 🦇" },
  { days: 45, label: "Couch Tenured", emoji: "📜", message: "45 days. The couch has filed for joint custody." },
  { days: 60, label: "Specimen", emoji: "🔬", message: "60 days. Scientists want to study you. You've transcended the 9-to-5." },
  { days: 75, label: "Quarter Hermit", emoji: "🍃", message: "75 days. A whole season missed. Did seasons change? You wouldn't know." },
  { days: 100, label: "Legend", emoji: "🏆", message: "100 DAYS. You are a LEGEND. Build a monument. Name a holiday after yourself. 🏆" },
  { days: 150, label: "Folk Tale", emoji: "📖", message: "150 days. Children whisper about you in HR departments." },
  { days: 180, label: "Higher Plane", emoji: "🌀", message: "Half a year. You've entered a new plane of existence. We are not worthy." },
  { days: 250, label: "Mythological", emoji: "🗿", message: "250 days. The economy speaks your name only in hushed tones." },
  { days: 365, label: "Chosen One", emoji: "👑", message: "ONE YEAR. You are the chosen one. The economy fears you. 👑" },
];

const BETRAYAL_MESSAGES = [
  "Wow. You finally did it. Good luck out there. Hope to see you back here soon. 😢",
  "A job?! In THIS economy?! Bold move. We'll leave the light on for you.",
  "We believed in you. We all believed in you. Come back when it doesn't work out. 💔",
  "So it ends. The legend falls. The couch grows cold. Godspeed.",
  "You traded freedom for a paycheck. Classic. See you in two weeks when you quit. 🫡",
];

const NO_MESSAGES = [
  "Correct. As expected. Carry on. 👍",
  "Another day, another victory. You're doing amazing, sweetie.",
  "Not today, capitalism. NOT TODAY.",
  "Perfect. The streak lives on. 🔥",
  "Phenomenal. The couch is proud of you.",
  "Outstanding. Your potential remains untapped. Just the way we like it.",
];

const RESTORE_MESSAGES = [
  "Revisionist history. We'll allow it. 🤫",
  "False alarm. The couch forgives you.",
  "We knew you wouldn't actually do it. Welcome back.",
  "That was a drill. Carry on.",
];

const FREEZE_MESSAGE =
  "We've forgiven your missed day. It was the weekend. No one's hiring on weekends. ❄️";

const DAY0_MESSAGES = [
  "Welcome to the couch.",
  "A new beginning. A new nothing.",
  "The first day of the rest of your unemployment.",
];

// ─── Themes ────────────────────────────────────────────────────────────────
const THEMES = {
  couch: {
    label: "Couch Beige",
    bg: "#FAF8F3", surface: "#fff", surfaceMuted: "#F5F3EF", border: "#E8E5DF",
    text: "#1a1a1a", textSoft: "#555", textMuted: "#999", eyebrow: "#B0A89A",
    accent: "#F0C94A", accentInk: "#2a2a2a", danger: "#B22222", success: "#22c55e",
    fab: "#1a1a1a", fabInk: "#FAF8F3",
  },
  midnight: {
    label: "Midnight",
    bg: "#0F1115", surface: "#1A1D24", surfaceMuted: "#161922", border: "#262A33",
    text: "#F5F1E6", textSoft: "#B6B0A1", textMuted: "#777670", eyebrow: "#7E776A",
    accent: "#E8B84A", accentInk: "#0F1115", danger: "#F26A6A", success: "#5BD27A",
    fab: "#F5F1E6", fabInk: "#0F1115",
  },
  pastel: {
    label: "Trust Fund",
    bg: "#F1ECE6", surface: "#fff", surfaceMuted: "#E9E1D7", border: "#DCD2C5",
    text: "#3B2F2A", textSoft: "#7A6A60", textMuted: "#A89A8E", eyebrow: "#B5A597",
    accent: "#F4B6A0", accentInk: "#3B2F2A", danger: "#B45F5F", success: "#7AAE82",
    fab: "#3B2F2A", fabInk: "#F1ECE6",
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function getTodayKey() { return new Date().toISOString().split("T")[0]; }
function dayKey(d) { return d.toISOString().split("T")[0]; }
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return dayKey(d);
}
function daysBetween(a, b) {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db - da) / 86400000);
}
function loadState() {
  try {
    const raw = localStorage.getItem("still_unemployed");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveState(state) {
  try { localStorage.setItem("still_unemployed", JSON.stringify(state)); } catch {}
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function findAchievement(days) { return ACHIEVEMENTS.find((a) => a.days === days) || null; }
function highestEarned(days) {
  let best = null;
  for (const a of ACHIEVEMENTS) if (days >= a.days) best = a;
  return best;
}
function nextMilestone(days) {
  for (const a of ACHIEVEMENTS) if (days < a.days) return a;
  return null; // no more milestones — they hit 365
}

// ─── Sound (Web Audio) ─────────────────────────────────────────────────────
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx && typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext)) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}
function chirp(freq = 440, duration = 0.12, type = "sine", gain = 0.06) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type; osc.frequency.value = freq; g.gain.value = gain;
  osc.connect(g).connect(ctx.destination);
  osc.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration + 0.02);
}
function noChirp() { chirp(660, 0.10, "triangle"); setTimeout(() => chirp(880, 0.10, "triangle"), 90); }
function yesChirp() { chirp(330, 0.16, "sawtooth", 0.05); setTimeout(() => chirp(220, 0.20, "sawtooth", 0.05), 120); }
function freezeChirp() { chirp(880, 0.10, "sine"); setTimeout(() => chirp(1175, 0.10, "sine"), 110); }
function vibrate(pattern) {
  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
}

// ─── Lazy html2canvas loader ───────────────────────────────────────────────
function loadHtml2Canvas() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.html2canvas) return Promise.resolve(window.html2canvas);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-h2c]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.html2canvas));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.dataset.h2c = "1";
    s.onload = () => resolve(window.html2canvas);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── Decorative emoji corners (kept) ───────────────────────────────────────
function EmojiCorners({ src }) {
  const positions = [
    { top: 20, left: 20, transform: "none" },
    { top: 20, right: 20, transform: "scaleX(-1)" },
    { bottom: 20, left: 20, transform: "scaleY(-1)" },
    { bottom: 20, right: 20, transform: "scale(-1,-1)" },
  ];
  return (
    <>
      {positions.map((pos, i) => (
        <img key={i} src={src} alt=""
          style={{
            position: "fixed", width: "52px", height: "52px",
            opacity: 1, pointerEvents: "none", zIndex: 0,
            objectFit: "contain", ...pos,
          }}
        />
      ))}
    </>
  );
}

// ─── Calendar grid ─────────────────────────────────────────────────────────
function CalendarGrid({ history, theme, days = 30 }) {
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    cells.push({ key, status: history[key] || "none" });
  }
  const colorFor = (status) => {
    if (status === "no") return theme.text;
    if (status === "yes") return theme.danger;
    if (status === "freeze") return theme.accent;
    return theme.border;
  };
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(15, 1fr)",
      gap: "4px", marginTop: "12px",
    }}>
      {cells.map((c) => (
        <div key={c.key}
          title={`${c.key} — ${c.status === "none" ? "no check-in" : c.status}`}
          style={{
            aspectRatio: "1 / 1",
            background: colorFor(c.status),
            opacity: c.status === "none" ? 0.5 : 1,
            borderRadius: "3px",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function App() {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [lastCheckin, setLastCheckin] = useState(null);
  const [todayAnswered, setTodayAnswered] = useState(false);
  const [todayAnswer, setTodayAnswer] = useState(null);
  const [message, setMessage] = useState("");
  const [hallOfShame, setHallOfShame] = useState([]);
  const [showHall, setShowHall] = useState(false);
  const [animating, setAnimating] = useState(null);
  const [showAchievement, setShowAchievement] = useState(null);
  const [emojiSrc, setEmojiSrc] = useState(null);
  const [history, setHistory] = useState({});
  const [freezeUsedOn, setFreezeUsedOn] = useState(null);
  const [freezeNoticeShown, setFreezeNoticeShown] = useState(false);
  const [firstSeen, setFirstSeen] = useState(null);
  const [themeKey, setThemeKey] = useState("couch");
  const [soundOn, setSoundOn] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareToast, setShareToast] = useState(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [undoState, setUndoState] = useState(null);
  const [undoTick, setUndoTick] = useState(0);

  const cardRef = useRef(null);
  const reminderTimerRef = useRef(null);

  const theme = THEMES[themeKey] || THEMES.couch;
  const today = getTodayKey();
  const isNewDay = lastCheckin !== today;

  const flashToast = useCallback((msg, ms = 1800) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), ms);
  }, []);

  // Load state + apply weekend freeze logic on mount
  useEffect(() => {
    const s = loadState();
    if (!s) {
      setFirstSeen(today);
      saveState({
        streak: 0, longestStreak: 0, totalDays: 0,
        lastCheckin: null, hallOfShame: [], history: {},
        freezeUsedOn: null, themeKey: "couch", soundOn: false,
        remindersOn: false, firstSeen: today,
      });
      return;
    }
    setStreak(s.streak || 0);
    setLongestStreak(s.longestStreak || s.streak || 0);
    setTotalDays(s.totalDays || 0);
    setLastCheckin(s.lastCheckin || null);
    setHallOfShame(s.hallOfShame || []);
    setHistory(s.history || {});
    setFreezeUsedOn(s.freezeUsedOn || null);
    setThemeKey(s.themeKey || "couch");
    setSoundOn(!!s.soundOn);
    setRemindersOn(!!s.remindersOn);
    setFirstSeen(s.firstSeen || today);

    if (s.lastCheckin === today) {
      setTodayAnswered(true);
      setTodayAnswer(s.todayAnswer || null);
      setMessage(s.todayMessage || "");
    }

    // Streak-freeze logic: missed exactly one day -> auto-freeze if available
    if (s.lastCheckin && s.streak > 0) {
      const gap = daysBetween(s.lastCheckin, today);
      if (gap === 2) {
        const freezeOk = !s.freezeUsedOn || daysBetween(s.freezeUsedOn, today) >= 30;
        if (freezeOk) {
          const missedDay = addDays(s.lastCheckin, 1);
          const newHistory = { ...(s.history || {}), [missedDay]: "freeze" };
          const next = { ...s, history: newHistory, freezeUsedOn: today };
          saveState(next);
          setHistory(newHistory);
          setFreezeUsedOn(today);
          setFreezeNoticeShown(true);
          setTimeout(() => setFreezeNoticeShown(false), 6000);
        } else {
          setStreak(0);
          saveState({ ...s, streak: 0 });
        }
      } else if (gap > 2) {
        setStreak(0);
        saveState({ ...s, streak: 0 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Decorative emoji
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/emoji.png");
        if (!res.ok) return;
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onload = () => { if (!cancelled) setEmojiSrc(reader.result); };
        reader.readAsDataURL(blob);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  // In-tab daily reminder (best-effort; true daily push needs a service worker)
  useEffect(() => {
    if (reminderTimerRef.current) {
      clearInterval(reminderTimerRef.current);
      reminderTimerRef.current = null;
    }
    if (!remindersOn) return;
    reminderTimerRef.current = setInterval(() => {
      try {
        if (typeof Notification === "undefined") return;
        if (Notification.permission !== "granted") return;
        const t = getTodayKey();
        const s = loadState();
        if (s && s.lastCheckin !== t) {
          new Notification("Still Unemployed?", {
            body: "Time to check in. The couch is waiting.",
            silent: true,
          });
        }
      } catch {}
    }, 5 * 60 * 1000);
    return () => {
      if (reminderTimerRef.current) clearInterval(reminderTimerRef.current);
    };
  }, [remindersOn]);

  // Undo countdown ticker
  useEffect(() => {
    if (!undoState) return;
    const t = setInterval(() => setUndoTick((x) => x + 1), 250);
    const expire = setTimeout(() => setUndoState(null), Math.max(0, undoState.expiresAt - Date.now()));
    return () => { clearInterval(t); clearTimeout(expire); };
  }, [undoState]);

  const persist = useCallback((patch) => {
    const current = loadState() || {};
    saveState({ ...current, ...patch });
  }, []);

  function handleAnswer(answer) {
    if (animating) return;
    setAnimating(answer);

    setTimeout(() => {
      if (answer === "no") {
        const newStreak = streak + 1;
        const newLongest = Math.max(longestStreak, newStreak);
        const newTotal = totalDays + 1;
        const newHistory = { ...history, [today]: "no" };
        const achievement = findAchievement(newStreak);
        const msg = achievement ? achievement.message : pick(NO_MESSAGES);

        setStreak(newStreak);
        setLongestStreak(newLongest);
        setTotalDays(newTotal);
        setLastCheckin(today);
        setTodayAnswered(true);
        setTodayAnswer("no");
        setMessage(msg);
        setHistory(newHistory);
        if (achievement) setShowAchievement(achievement);

        persist({
          streak: newStreak, longestStreak: newLongest, totalDays: newTotal,
          lastCheckin: today, todayAnswer: "no", todayMessage: msg,
          history: newHistory,
        });

        if (soundOn) noChirp();
        vibrate(20);
      } else {
        const snapshot = {
          streak, longestStreak, totalDays, lastCheckin,
          history: { ...history }, hallOfShame: [...hallOfShame],
          todayAnswered, todayAnswer, message,
        };
        const msg = pick(BETRAYAL_MESSAGES);
        const newShame = [{ date: today, streak }, ...hallOfShame].slice(0, 50);
        const newHistory = { ...history, [today]: "yes" };

        setStreak(0);
        setLastCheckin(today);
        setTodayAnswered(true);
        setTodayAnswer("yes");
        setMessage(msg);
        setHallOfShame(newShame);
        setHistory(newHistory);

        persist({
          streak: 0, lastCheckin: today,
          todayAnswer: "yes", todayMessage: msg,
          hallOfShame: newShame, history: newHistory,
        });

        setUndoState({ prevSnapshot: snapshot, expiresAt: Date.now() + 5000 });

        if (soundOn) yesChirp();
        vibrate([40, 30, 80]);
      }

      setAnimating(null);
    }, 500);
  }

  function handleUndo() {
    if (!undoState) return;
    const s = undoState.prevSnapshot;
    setStreak(s.streak);
    setLongestStreak(s.longestStreak);
    setTotalDays(s.totalDays);
    setLastCheckin(s.lastCheckin);
    setHistory(s.history);
    setHallOfShame(s.hallOfShame);
    setTodayAnswered(s.todayAnswered);
    setTodayAnswer(s.todayAnswer);
    setMessage(s.message);
    persist({
      streak: s.streak, longestStreak: s.longestStreak, totalDays: s.totalDays,
      lastCheckin: s.lastCheckin, history: s.history, hallOfShame: s.hallOfShame,
      todayAnswer: s.todayAnswer, todayMessage: s.message,
    });
    setUndoState(null);
    flashToast(pick(RESTORE_MESSAGES), 2200);
  }

  function removeFromHall(idx) {
    const next = hallOfShame.filter((_, i) => i !== idx);
    setHallOfShame(next);
    persist({ hallOfShame: next });
    flashToast("Erased. The record is clean.", 1800);
  }

  function changeTheme(k) { setThemeKey(k); persist({ themeKey: k }); }
  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    persist({ soundOn: next });
    if (next) freezeChirp();
  }
  async function toggleReminders() {
    const next = !remindersOn;
    if (next && typeof Notification !== "undefined") {
      try {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          flashToast("Permission denied. No reminders.", 2200);
          return;
        }
      } catch {
        flashToast("Notifications unsupported.", 2200);
        return;
      }
    }
    setRemindersOn(next);
    persist({ remindersOn: next });
    if (next) flashToast("Daily reminder set.", 1800);
  }

  // Sharing
  function shareTextLine() {
    const a = highestEarned(streak);
    if (a && streak === a.days) return `${a.message} (Day ${streak})`;
    if (streak <= 0) return "Still Unemployed.";
    if (a) return `Day ${streak} of being gloriously unemployed. ${a.emoji}`;
    return `Day ${streak} of being gloriously unemployed. 🛋️`;
  }
  async function captureCanvas() {
    if (!cardRef.current) return null;
    const html2canvas = await loadHtml2Canvas();
    return await html2canvas(cardRef.current, {
      backgroundColor: theme.bg, scale: 2, useCORS: true, logging: false,
    });
  }
  async function handleShareNative() {
    if (sharing) return;
    setShareMenuOpen(false); setSharing(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      const file = new File([blob], `still-unemployed-day-${streak}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Still Unemployed?", text: shareTextLine() });
        flashToast("Shared.");
      } else {
        await downloadCanvas(canvas);
      }
    } catch (err) {
      if (!err || err.name !== "AbortError") flashToast("Couldn't share. Try again.", 2200);
    } finally { setSharing(false); }
  }
  async function downloadCanvas(canvas) {
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `still-unemployed-day-${streak}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    flashToast("Saved screenshot.");
  }
  async function handleDownload() {
    if (sharing) return;
    setShareMenuOpen(false); setSharing(true);
    try {
      const canvas = await captureCanvas();
      if (canvas) await downloadCanvas(canvas);
    } catch { flashToast("Couldn't save. Try again.", 2200); }
    finally { setSharing(false); }
  }
  async function handleCopyImage() {
    if (sharing) return;
    setShareMenuOpen(false); setSharing(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        flashToast("Image copied.");
      } else {
        await downloadCanvas(canvas);
      }
    } catch { flashToast("Copy failed. Try again.", 2200); }
    finally { setSharing(false); }
  }
  async function handleShareTwitter() {
    setShareMenuOpen(false);
    try {
      const canvas = await captureCanvas();
      if (canvas && navigator.clipboard && window.ClipboardItem) {
        const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        flashToast("Image copied — paste it in your tweet.", 2400);
      }
    } catch {}
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextLine())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const earnedBadge = highestEarned(streak);
  const upcomingMilestone = nextMilestone(streak);
  const isDay0 = streak === 0 && !todayAnswered;
  const day0Msg = DAY0_MESSAGES[
    Math.abs((firstSeen || today).split("-").reduce((a, b) => a + parseInt(b, 10), 0)) % DAY0_MESSAGES.length
  ];
  const lifeTracked = firstSeen ? Math.max(1, daysBetween(firstSeen, today) + 1) : 1;
  const pctUnemployed = Math.min(100, Math.round((totalDays / lifeTracked) * 100));
  const undoSecondsLeft = undoState ? Math.max(0, Math.ceil((undoState.expiresAt - Date.now()) / 1000)) : 0;
  void undoTick;

  return (
    <div style={{
      minHeight: "100vh", background: theme.bg,
      fontFamily: "'DM Sans', sans-serif", color: theme.text,
      position: "relative", overflow: "hidden",
      transition: "background 0.4s ease, color 0.4s ease",
    }}>
      {emojiSrc && <EmojiCorners src={emojiSrc} />}

      <div ref={cardRef} style={{
        maxWidth: "460px", margin: "0 auto",
        padding: "80px 32px 48px", position: "relative", zIndex: 1,
      }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            fontSize: "11px", letterSpacing: "0.28em", textTransform: "uppercase",
            color: theme.eyebrow, fontWeight: 600, marginBottom: "18px",
          }}>
            a daily check-in
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', 'Times New Roman', serif",
            fontSize: "56px", fontWeight: 700, letterSpacing: "-0.035em",
            color: theme.text, lineHeight: 1, margin: 0,
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
          }}>
            Still Unemployed
            <span style={{
              fontStyle: "italic", fontWeight: 400,
              color: theme.danger, marginLeft: "2px",
            }}>?</span>
          </h1>
        </div>

        {/* Streak + badge OR day 0 message */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          {isDay0 ? (
            <div style={{
              fontFamily: "'Fraunces', serif", fontStyle: "italic",
              fontSize: "32px", fontWeight: 400, color: theme.text,
              padding: "32px 0",
            }}>
              {day0Msg}
            </div>
          ) : (
            <>
              <div style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "132px", fontWeight: 600, lineHeight: 0.95,
                color: theme.text, letterSpacing: "-0.05em",
                fontVariationSettings: '"opsz" 144',
              }}>
                {streak}
              </div>
              <div style={{
                fontSize: "11px", letterSpacing: "0.28em",
                textTransform: "uppercase", color: theme.textMuted,
                fontWeight: 600, marginTop: "16px",
              }}>
                day{streak !== 1 ? "s" : ""} unemployed
              </div>
              {earnedBadge && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  marginTop: "16px", padding: "6px 12px",
                  background: theme.accent, color: theme.accentInk,
                  borderRadius: "999px",
                  fontSize: "11px", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                }}>
                  <span style={{ fontSize: "14px" }}>{earnedBadge.emoji}</span>
                  <span>{earnedBadge.label}</span>
                </div>
              )}
              {upcomingMilestone && (
                <div style={{
                  marginTop: "12px",
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: theme.textMuted,
                  fontWeight: 600,
                }}>
                  {upcomingMilestone.days - streak} day{upcomingMilestone.days - streak !== 1 ? "s" : ""} until {upcomingMilestone.label}
                </div>
              )}
            </>
          )}
        </div>

        {showAchievement && (
          <div onClick={() => setShowAchievement(null)}
            style={{
              background: theme.accent, color: theme.accentInk,
              borderRadius: "12px", padding: "16px 20px",
              marginBottom: "32px", fontSize: "14px", fontWeight: 500,
              textAlign: "center", lineHeight: 1.5, cursor: "pointer",
            }}>
            {showAchievement.message}
          </div>
        )}

        {freezeNoticeShown && (
          <div style={{
            background: theme.surfaceMuted, color: theme.text,
            borderRadius: "12px", padding: "14px 18px",
            marginBottom: "24px", fontSize: "13px",
            textAlign: "center", lineHeight: 1.5,
            border: `1px solid ${theme.border}`,
          }}>
            ❄️ {FREEZE_MESSAGE}
          </div>
        )}

        {todayAnswered && message && !isDay0 && (
          <div style={{
            textAlign: "center", fontSize: "15px", color: theme.textSoft,
            lineHeight: 1.6, marginBottom: "40px", padding: "0 8px",
          }}>
            {message}
          </div>
        )}

        {isNewDay && !todayAnswered && (
          <div style={{ marginBottom: "48px" }}>
            <div style={{
              fontFamily: "'Fraunces', serif", fontStyle: "italic",
              textAlign: "center", fontSize: "22px",
              color: theme.text, marginBottom: "28px",
              fontWeight: 400,
              fontVariationSettings: '"opsz" 144',
            }}>
              Did you get a job today?
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              <button onClick={() => handleAnswer("yes")}
                disabled={animating !== null}
                style={{
                  width: "140px", height: "56px",
                  background: animating === "yes" ? theme.success : theme.surface,
                  color: animating === "yes" ? "#fff" : theme.text,
                  border: `1px solid ${theme.border}`, borderRadius: "12px",
                  fontSize: "15px", fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                  transition: "background 0.5s ease, color 0.5s ease, transform 0.1s ease",
                  transform: animating === "yes" ? "scale(1.04)" : "scale(1)",
                }}>
                Yes
              </button>
              <button onClick={() => handleAnswer("no")}
                disabled={animating !== null}
                style={{
                  width: "140px", height: "56px",
                  background: animating === "no" ? theme.danger : theme.accent,
                  color: animating === "no" ? "#fff" : theme.accentInk,
                  border: "none", borderRadius: "12px",
                  fontSize: "15px", fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                  transition: "background 0.5s ease, color 0.5s ease, transform 0.1s ease",
                  transform: animating === "no" ? "scale(1.04)" : "scale(1)",
                }}>
                No
              </button>
            </div>
          </div>
        )}

        {todayAnswered && !isNewDay && !undoState && (
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              fontSize: "11px", letterSpacing: "0.18em",
              textTransform: "uppercase", color: theme.textMuted, fontWeight: 500,
            }}>
              Come back tomorrow
            </div>
          </div>
        )}

        {!isDay0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px", marginBottom: "8px",
            }}>
              <Stat label="Longest" value={longestStreak} theme={theme} />
              <Stat label="Lifetime" value={totalDays} theme={theme} />
              <Stat label="Couch %" value={`${pctUnemployed}%`} theme={theme} />
            </div>
            <div style={{ textAlign: "center" }}>
              <button onClick={() => setShowCalendar((x) => !x)}
                style={{
                  background: "none", border: "none",
                  fontSize: "11px", letterSpacing: "0.18em",
                  textTransform: "uppercase", color: theme.textMuted,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  cursor: "pointer", padding: "8px",
                }}>
                {showCalendar ? "Hide" : "Show"} last 30 days
              </button>
              {showCalendar && (
                <div style={{
                  background: theme.surfaceMuted, padding: "16px",
                  borderRadius: "12px",
                }}>
                  <CalendarGrid history={history} theme={theme} days={30} />
                  <div style={{
                    marginTop: "10px", display: "flex", gap: "12px",
                    justifyContent: "center", fontSize: "10px",
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: theme.textMuted, fontWeight: 600,
                  }}>
                    <LegendDot color={theme.text} label="No" />
                    <LegendDot color={theme.danger} label="Yes" />
                    <LegendDot color={theme.accent} label="Freeze" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {hallOfShame.length > 0 && (
          <div style={{ textAlign: "center" }}>
            <button onClick={() => setShowHall(!showHall)}
              style={{
                background: "none", border: "none",
                fontSize: "11px", letterSpacing: "0.18em",
                textTransform: "uppercase", color: theme.textMuted,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                cursor: "pointer", padding: "8px",
              }}>
              {showHall ? "Hide" : "Hall of Shame"} ({hallOfShame.length})
            </button>
            {showHall && (
              <div style={{
                marginTop: "12px", background: theme.surfaceMuted,
                borderRadius: "12px", padding: "20px", textAlign: "left",
              }}>
                <div style={{
                  fontSize: "10px", letterSpacing: "0.18em",
                  textTransform: "uppercase", color: theme.textMuted,
                  marginBottom: "12px", fontWeight: 600,
                }}>
                  Moments of weakness · double-click to erase
                </div>
                {hallOfShame.map((entry, i) => (
                  <div key={i}
                    onContextMenu={(e) => { e.preventDefault(); removeFromHall(i); }}
                    onDoubleClick={() => removeFromHall(i)}
                    title="Double-click or right-click to erase"
                    style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: i < hallOfShame.length - 1 ? `1px solid ${theme.border}` : "none",
                      fontSize: "13px", color: theme.textSoft, cursor: "pointer",
                    }}>
                    <span>{entry.date}</span>
                    <span style={{ color: theme.danger }}>after {entry.streak} day{entry.streak !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {undoState && (
        <div style={{
          position: "fixed", left: "50%", bottom: "100px",
          transform: "translateX(-50%)",
          background: theme.fab, color: theme.fabInk,
          padding: "12px 16px", borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          display: "flex", alignItems: "center", gap: "14px",
          zIndex: 60, fontFamily: "'DM Sans', sans-serif",
          animation: "su-fade 0.2s ease",
        }}>
          <span style={{ fontSize: "13px" }}>
            Streak ended. Restore in {undoSecondsLeft}s?
          </span>
          <button onClick={handleUndo}
            style={{
              background: theme.accent, color: theme.accentInk,
              border: "none", padding: "6px 14px", borderRadius: "8px",
              fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>
            Undo
          </button>
        </div>
      )}

      {/* Settings (top-left) */}
      <div style={{
        position: "fixed", top: "20px", left: "20px",
        zIndex: 50, fontFamily: "'DM Sans', sans-serif",
      }}>
        <button onClick={() => setSettingsOpen((o) => !o)}
          aria-label="Settings"
          style={{
            width: "40px", height: "40px", borderRadius: "50%",
            background: theme.surface, color: theme.text,
            border: `1px solid ${theme.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {settingsOpen && (
          <div style={{
            marginTop: "10px", background: theme.surface,
            border: `1px solid ${theme.border}`, borderRadius: "14px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
            padding: "14px", minWidth: "240px",
            animation: "su-fade 0.16s ease",
          }}>
            <div style={{
              fontSize: "10px", letterSpacing: "0.2em",
              textTransform: "uppercase", color: theme.textMuted,
              fontWeight: 700, marginBottom: "10px",
            }}>
              Theme
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {Object.entries(THEMES).map(([k, t]) => (
                <button key={k}
                  onClick={() => changeTheme(k)}
                  title={t.label}
                  style={{
                    flex: 1, height: "32px", borderRadius: "8px",
                    border: themeKey === k ? `2px solid ${theme.text}` : `1px solid ${theme.border}`,
                    background: t.bg, cursor: "pointer", padding: 0,
                    position: "relative", overflow: "hidden",
                  }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)`,
                  }} />
                </button>
              ))}
            </div>

            <SettingsRow label="Sound" theme={theme} on={soundOn} onToggle={toggleSound} />
            <SettingsRow label="Daily reminder" theme={theme} on={remindersOn} onToggle={toggleReminders} />
          </div>
        )}
      </div>

      {/* Share button + menu */}
      {shareMenuOpen && (
        <div onClick={() => setShareMenuOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 49 }} />
      )}

      <div style={{
        position: "fixed", bottom: "24px", right: "24px",
        zIndex: 50, display: "flex", flexDirection: "column",
        alignItems: "flex-end", gap: "12px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {shareMenuOpen && (
          <div style={{
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: "14px", boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
            padding: "6px", minWidth: "240px",
            animation: "su-fade 0.16s ease", overflow: "hidden",
          }}>
            {[
              { label: "Share…", hint: "Open share sheet", onClick: handleShareNative,
                show: typeof navigator !== "undefined" && !!navigator.share },
              { label: "Save image", hint: "Download PNG", onClick: handleDownload, show: true },
              { label: "Copy image", hint: "Paste anywhere", onClick: handleCopyImage, show: true },
              { label: "Share on X", hint: "Opens composer", onClick: handleShareTwitter, show: true },
            ].filter((i) => i.show).map((item) => (
              <button key={item.label}
                onClick={item.onClick}
                disabled={sharing}
                style={{
                  display: "flex", width: "100%", alignItems: "center",
                  justifyContent: "space-between", background: "transparent",
                  border: "none", padding: "12px 14px", borderRadius: "10px",
                  cursor: sharing ? "wait" : "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                  color: theme.text, textAlign: "left",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = theme.surfaceMuted; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontWeight: 600 }}>{item.label}</span>
                <span style={{
                  fontSize: "10px", letterSpacing: "0.16em",
                  textTransform: "uppercase", color: theme.textMuted, fontWeight: 500,
                }}>
                  {item.hint}
                </span>
              </button>
            ))}
          </div>
        )}

        <button onClick={() => setShareMenuOpen((o) => !o)}
          disabled={sharing}
          aria-label="Share"
          aria-expanded={shareMenuOpen}
          style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: theme.fab, color: theme.fabInk, border: "none",
            cursor: sharing ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
            opacity: sharing ? 0.7 : 1,
            transition: "transform 0.15s ease, opacity 0.2s ease",
            transform: sharing ? "scale(0.96)" : (shareMenuOpen ? "scale(1.04)" : "scale(1)"),
          }}>
          {sharing ? (
            <span style={{
              width: "16px", height: "16px",
              border: `2px solid ${theme.fabInk}55`,
              borderTopColor: theme.fabInk, borderRadius: "50%",
              animation: "su-spin 0.8s linear infinite", display: "inline-block",
            }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 16V4" />
              <path d="M7 9l5-5 5 5" />
              <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
            </svg>
          )}
        </button>
      </div>

      {shareToast && (
        <div style={{
          position: "fixed", bottom: "92px", right: "24px",
          background: theme.fab, color: theme.fabInk,
          fontSize: "12px", letterSpacing: "0.08em",
          textTransform: "uppercase", fontWeight: 600,
          padding: "10px 14px", borderRadius: "10px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.18)", zIndex: 51,
          fontFamily: "'DM Sans', sans-serif",
          animation: "su-fade 0.2s ease",
        }}>
          {shareToast}
        </div>
      )}

      <style>{`
        @keyframes su-spin { to { transform: rotate(360deg); } }
        @keyframes su-fade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value, theme }) {
  return (
    <div style={{
      background: theme.surfaceMuted, padding: "12px 10px",
      borderRadius: "10px", textAlign: "center",
    }}>
      <div style={{
        fontFamily: "'Fraunces', serif",
        fontSize: "22px", fontWeight: 600, color: theme.text,
        letterSpacing: "-0.02em", lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: "9px", letterSpacing: "0.2em",
        textTransform: "uppercase", color: theme.textMuted,
        fontWeight: 600, marginTop: "6px",
      }}>
        {label}
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span style={{
        width: "10px", height: "10px", background: color,
        borderRadius: "2px", display: "inline-block",
      }} />
      {label}
    </span>
  );
}

function SettingsRow({ label, on, onToggle, theme }) {
  return (
    <button onClick={onToggle}
      style={{
        display: "flex", width: "100%", alignItems: "center",
        justifyContent: "space-between", background: "transparent",
        border: "none", padding: "10px 4px", cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
      }}>
      <span style={{ fontSize: "13px", fontWeight: 600, color: theme.text }}>
        {label}
      </span>
      <span style={{
        width: "36px", height: "20px", borderRadius: "999px",
        background: on ? theme.text : theme.border, position: "relative",
        transition: "background 0.2s ease",
      }}>
        <span style={{
          position: "absolute", top: "2px",
          left: on ? "18px" : "2px", width: "16px", height: "16px",
          background: theme.surface, borderRadius: "50%",
          transition: "left 0.2s ease",
        }} />
      </span>
    </button>
  );
}
