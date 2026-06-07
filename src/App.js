import { useState, useRef, useEffect, useCallback } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const THEME_NORMAL = {
  bg: "#0D1F10", surface: "#162B1A", surfaceAlt: "#1E3822",
  border: "#2A5C34", accent: "#00FF77", accentDim: "#00CC60",
  accentGlow: "rgba(0,255,119,0.2)", text: "#FFFFFF",
  textMuted: "#9ECBA8", textDim: "#4A7A55",
  warning: "#FFD000", error: "#FF4455",
  cardBg: "#1A3320", headerBg: "#112216",
};

const THEME_OUTDOOR = {
  bg: "#000000", surface: "#0D0D0D", surfaceAlt: "#1A1A1A",
  border: "#404040", accent: "#00FF55", accentDim: "#007722",
  accentGlow: "rgba(0,255,85,0.2)", text: "#FFFFFF",
  textMuted: "#CCCCCC", textDim: "#666666",
  warning: "#FFD700", error: "#FF4444",
};

// theme is now computed from React state — see getTheme(outdoorMode) usage
const getTheme = (outdoor) => outdoor ? THEME_OUTDOOR : THEME_NORMAL;
// Default theme for module-level style objects
let theme = THEME_NORMAL;

const s = {
  app: { background: theme.bg, minHeight: "100vh", maxWidth: "430px", margin: "0 auto", display: "flex", flexDirection: "column", fontFamily: "'DM Mono','Courier New',monospace", color: theme.text },
  header: { padding: "52px 24px 16px", borderBottom: `1px solid ${theme.border}`, background: `linear-gradient(180deg,${theme.surface} 0%,${theme.bg} 100%)`, position: "relative" },
  htitle: { fontSize: "11px", letterSpacing: "0.25em", color: theme.accent, textTransform: "uppercase", marginBottom: "4px", fontWeight: "500" },
  hmain: { fontSize: "26px", fontWeight: "700", color: theme.text, letterSpacing: "-0.02em", fontFamily: "'DM Sans',sans-serif" },
  content: { flex: 1, overflowY: "auto", padding: "24px", paddingBottom: "100px" },
  card: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "20px", marginBottom: "16px" },
  cardAccent: { background: theme.accentGlow, border: `1px solid ${theme.accentDim}`, borderRadius: "16px", padding: "20px", marginBottom: "16px" },
  slabel: { fontSize: "10px", letterSpacing: "0.2em", color: theme.textMuted, textTransform: "uppercase", marginBottom: "12px", fontWeight: "500" },
  btn: { background: theme.accent, color: theme.bg, border: "none", borderRadius: "12px", padding: "14px 24px", fontSize: "13px", fontWeight: "700", letterSpacing: "0.05em", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },
  btnOut: { background: "transparent", color: theme.accent, border: `1px solid ${theme.accentDim}`, borderRadius: "12px", padding: "13px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },
  btnDanger: { background: "transparent", color: theme.error, border: `1px solid rgba(255,77,77,0.3)`, borderRadius: "12px", padding: "13px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },
  input: { background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: theme.text, width: "100%", fontFamily: "'DM Mono',monospace", outline: "none", boxSizing: "border-box" },
  label: { fontSize: "10px", letterSpacing: "0.15em", color: theme.textMuted, textTransform: "uppercase", marginBottom: "6px", display: "block", fontWeight: "500" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${theme.border}` },
  tag: { display: "inline-block", background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "3px 10px", fontSize: "11px", color: theme.textMuted },
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: theme.surface, borderTop: `1px solid ${theme.border}`, display: "flex", padding: "12px 0 24px", zIndex: 100 },
  navItem: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer", padding: "4px 0" },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const DISC_TYPES = [
  { key: "distance_driver", label: "Distance Driver", icon: "💨" },
  { key: "fairway_driver", label: "Fairway Driver", icon: "🌬️" },
  { key: "midrange", label: "Midrange", icon: "🎯" },
  { key: "putter", label: "Putter", icon: "🕳️" },
];

const BRANDS = ["Innova","Discraft","Dynamic Discs","MVP","Axiom","Latitude 64","Westside","Prodigy","Kastaplast","Other"];

const PLASTICS_BY_BRAND = {
  "Innova":["Star","Champion","DX","GStar","Blizzard","Halo","XT","Pro","Other"],
  "Discraft":["Z","ESP","Big Z","Jawbreaker","Cryztal","Putter Line","Soft","Other"],
  "Dynamic Discs":["Lucid","Classic","Fuzion","Moonshine","Biofuzion","Gold","Other"],
  "MVP":["Neutron","Proton","Electron","Plasma","Other"],
  "Axiom":["Neutron","Proton","Electron","Plasma","Other"],
  "Latitude 64":["Gold","Opto","Royal","Zero","Recycled","Other"],
  "Westside":["VIP","Tournament","BT","Origio","Other"],
  "Prodigy":["400","300","200","400G","750","Other"],
  "Kastaplast":["K1","K3","K1 Soft","Other"],
  "Other":["Other"],
};

const DISC_DATABASE = [
  // ── INNOVA Distance Drivers ──
  {name:"Destroyer",brand:"Innova",type:"distance_driver",speed:12,glide:5,turn:-1,fade:3},
  {name:"Boss",brand:"Innova",type:"distance_driver",speed:13,glide:5,turn:-1,fade:3},
  {name:"Wraith",brand:"Innova",type:"distance_driver",speed:11,glide:5,turn:-1,fade:3},
  {name:"Tern",brand:"Innova",type:"distance_driver",speed:12,glide:6,turn:-2,fade:2},
  {name:"Thunderbird",brand:"Innova",type:"distance_driver",speed:11,glide:5,turn:0,fade:3},
  {name:"Firebird",brand:"Innova",type:"distance_driver",speed:9,glide:3,turn:0,fade:4},
  {name:"Eagle",brand:"Innova",type:"distance_driver",speed:10,glide:4,turn:-1,fade:3},
  {name:"Shryke",brand:"Innova",type:"distance_driver",speed:13,glide:6,turn:-2,fade:2},
  {name:"Colossus",brand:"Innova",type:"distance_driver",speed:13,glide:6,turn:-3,fade:1},
  {name:"Katana",brand:"Innova",type:"distance_driver",speed:13,glide:5,turn:-3,fade:2},
  {name:"Corvette",brand:"Innova",type:"distance_driver",speed:14,glide:6,turn:-2,fade:2},
  // ── DISCRAFT Distance Drivers ──
  {name:"Nuke",brand:"Discraft",type:"distance_driver",speed:13,glide:5,turn:-1,fade:3},
  {name:"Zeus",brand:"Discraft",type:"distance_driver",speed:12,glide:5,turn:-1,fade:2},
  {name:"Anax",brand:"Discraft",type:"distance_driver",speed:12,glide:6,turn:-2,fade:2},
  {name:"Hades",brand:"Discraft",type:"distance_driver",speed:12,glide:6,turn:-3,fade:2},
  {name:"Force",brand:"Discraft",type:"distance_driver",speed:11,glide:5,turn:0,fade:3},
  {name:"Crank",brand:"Discraft",type:"distance_driver",speed:13,glide:5,turn:-2,fade:2},
  {name:"Nuke SS",brand:"Discraft",type:"distance_driver",speed:13,glide:5,turn:-3,fade:3},
  {name:"Predator",brand:"Discraft",type:"distance_driver",speed:13,glide:4,turn:0,fade:3},
  // ── DYNAMIC DISCS Distance Drivers ──
  {name:"Maverick",brand:"Dynamic Discs",type:"distance_driver",speed:11,glide:5,turn:-2,fade:2},
  {name:"Escape",brand:"Dynamic Discs",type:"distance_driver",speed:11,glide:5,turn:-2,fade:2},
  {name:"Trespass",brand:"Dynamic Discs",type:"distance_driver",speed:12,glide:5,turn:-1,fade:3},
  {name:"Sheriff",brand:"Dynamic Discs",type:"distance_driver",speed:14,glide:5,turn:-0.5,fade:3},
  {name:"Renegade",brand:"Dynamic Discs",type:"distance_driver",speed:11,glide:6,turn:-3,fade:2},
  // ── MVP/AXIOM Distance Drivers ──
  {name:"Octane",brand:"MVP",type:"distance_driver",speed:13,glide:5,turn:-1,fade:3},
  {name:"Tesla",brand:"MVP",type:"distance_driver",speed:12,glide:5,turn:-1,fade:2},
  {name:"Catalyst",brand:"MVP",type:"distance_driver",speed:13,glide:6,turn:-2,fade:2},
  {name:"Fission Fireball",brand:"MVP",type:"distance_driver",speed:12,glide:5,turn:-2,fade:3},
  {name:"Defy",brand:"Axiom",type:"distance_driver",speed:14,glide:6,turn:-2,fade:2},
  {name:"Mayhem",brand:"Axiom",type:"distance_driver",speed:12,glide:6,turn:-2,fade:2},
  // ── KASTAPLAST Distance Drivers ──
  {name:"Falk",brand:"Kastaplast",type:"distance_driver",speed:11,glide:5,turn:-1,fade:2},
  {name:"Lots",brand:"Kastaplast",type:"distance_driver",speed:13,glide:5,turn:-1,fade:3},
  // ── LATITUDE 64 Distance Drivers ──
  {name:"Ballista",brand:"Latitude 64",type:"distance_driver",speed:14,glide:6,turn:-1,fade:3},
  {name:"Missilen",brand:"Latitude 64",type:"distance_driver",speed:14,glide:4,turn:0,fade:4},
  {name:"Raketen",brand:"Latitude 64",type:"distance_driver",speed:14,glide:5,turn:-2,fade:3},
  // ── PRODIGY Distance Drivers ──
  {name:"D1",brand:"Prodigy",type:"distance_driver",speed:12,glide:5,turn:-1,fade:3},
  {name:"D2",brand:"Prodigy",type:"distance_driver",speed:12,glide:5,turn:-2,fade:2},
  {name:"D3",brand:"Prodigy",type:"distance_driver",speed:12,glide:6,turn:-3,fade:2},
  {name:"D4",brand:"Prodigy",type:"distance_driver",speed:12,glide:6,turn:-4,fade:1},

  // ── INNOVA Fairway Drivers ──
  {name:"Leopard",brand:"Innova",type:"fairway_driver",speed:7,glide:5,turn:-2,fade:1},
  {name:"Leopard3",brand:"Innova",type:"fairway_driver",speed:7,glide:5,turn:-2,fade:1},
  {name:"Valkyrie",brand:"Innova",type:"fairway_driver",speed:9,glide:4,turn:-2,fade:2},
  {name:"Roadrunner",brand:"Innova",type:"fairway_driver",speed:9,glide:5,turn:-4,fade:1},
  {name:"Teebird",brand:"Innova",type:"fairway_driver",speed:7,glide:5,turn:0,fade:2},
  {name:"Teebird3",brand:"Innova",type:"fairway_driver",speed:7,glide:5,turn:-1,fade:2},
  {name:"Kite",brand:"Innova",type:"fairway_driver",speed:7,glide:6,turn:-3,fade:1},
  {name:"Archangel",brand:"Innova",type:"fairway_driver",speed:8,glide:6,turn:-4,fade:1},
  {name:"Sidewinder",brand:"Innova",type:"fairway_driver",speed:9,glide:5,turn:-3,fade:1},
  {name:"Banshee",brand:"Innova",type:"fairway_driver",speed:9,glide:4,turn:0,fade:3},
  {name:"Mystere",brand:"Innova",type:"fairway_driver",speed:11,glide:6,turn:-2,fade:2},
  // ── DISCRAFT Fairway Drivers ──
  {name:"Surge",brand:"Discraft",type:"fairway_driver",speed:9,glide:5,turn:-2,fade:2},
  {name:"Undertaker",brand:"Discraft",type:"fairway_driver",speed:9,glide:5,turn:-1,fade:2},
  {name:"Thrasher",brand:"Discraft",type:"fairway_driver",speed:10,glide:5,turn:-2,fade:2},
  {name:"Stalker",brand:"Discraft",type:"fairway_driver",speed:9,glide:5,turn:-1,fade:2},
  {name:"Heat",brand:"Discraft",type:"fairway_driver",speed:9,glide:6,turn:-3,fade:1},
  {name:"Avenger SS",brand:"Discraft",type:"fairway_driver",speed:10,glide:5,turn:-3,fade:2},
  {name:"XL",brand:"Discraft",type:"fairway_driver",speed:9,glide:6,turn:-4,fade:1},
  {name:"Buzzz SS",brand:"Discraft",type:"fairway_driver",speed:6,glide:5,turn:-2,fade:1},
  // ── DYNAMIC DISCS Fairway Drivers ──
  {name:"Insanity",brand:"Dynamic Discs",type:"fairway_driver",speed:9,glide:5,turn:-2,fade:2},
  {name:"Getaway",brand:"Dynamic Discs",type:"fairway_driver",speed:9,glide:5,turn:-2,fade:1},
  {name:"Freedom",brand:"Dynamic Discs",type:"fairway_driver",speed:9,glide:6,turn:-3,fade:1},
  {name:"Defender",brand:"Dynamic Discs",type:"fairway_driver",speed:9,glide:4,turn:0,fade:3},
  // ── MVP/AXIOM Fairway Drivers ──
  {name:"Servo",brand:"MVP",type:"fairway_driver",speed:8,glide:5,turn:-2,fade:2},
  {name:"Volt",brand:"MVP",type:"fairway_driver",speed:9,glide:5,turn:-1,fade:2},
  {name:"Shock",brand:"Axiom",type:"fairway_driver",speed:9,glide:5,turn:-2,fade:2},
  {name:"Crave",brand:"Axiom",type:"fairway_driver",speed:9,glide:6,turn:-3,fade:1},
  // ── KASTAPLAST Fairway Drivers ──
  {name:"Rask",brand:"Kastaplast",type:"fairway_driver",speed:9,glide:4,turn:0,fade:3},
  {name:"Stal",brand:"Kastaplast",type:"fairway_driver",speed:8,glide:5,turn:-1,fade:2},
  // ── LATITUDE 64 Fairway Drivers ──
  {name:"Saint",brand:"Latitude 64",type:"fairway_driver",speed:10,glide:6,turn:-2,fade:2},
  {name:"Saint Pro",brand:"Latitude 64",type:"fairway_driver",speed:10,glide:5,turn:0,fade:3},
  {name:"River",brand:"Latitude 64",type:"fairway_driver",speed:9,glide:7,turn:-3,fade:1},
  {name:"Compass",brand:"Latitude 64",type:"fairway_driver",speed:8,glide:6,turn:-2,fade:1},
  // ── WESTSIDE Fairway Drivers ──
  {name:"Hatchet",brand:"Westside",type:"fairway_driver",speed:11,glide:5,turn:-2,fade:2},
  {name:"Warship",brand:"Westside",type:"fairway_driver",speed:9,glide:5,turn:-1,fade:3},
  {name:"Stag",brand:"Westside",type:"fairway_driver",speed:9,glide:5,turn:-2,fade:2},
  // ── PRODIGY Fairway Drivers ──
  {name:"H1",brand:"Prodigy",type:"fairway_driver",speed:10,glide:4,turn:0,fade:4},
  {name:"H2",brand:"Prodigy",type:"fairway_driver",speed:10,glide:5,turn:-2,fade:2},
  {name:"H3",brand:"Prodigy",type:"fairway_driver",speed:9,glide:6,turn:-3,fade:2},
  {name:"H4",brand:"Prodigy",type:"fairway_driver",speed:9,glide:5,turn:-4,fade:2},

  // ── INNOVA Midranges ──
  {name:"Roc",brand:"Innova",type:"midrange",speed:4,glide:4,turn:0,fade:3},
  {name:"Roc3",brand:"Innova",type:"midrange",speed:5,glide:4,turn:0,fade:3},
  {name:"Mako3",brand:"Innova",type:"midrange",speed:5,glide:5,turn:0,fade:0},
  {name:"Stingray",brand:"Innova",type:"midrange",speed:4,glide:6,turn:-3,fade:0},
  {name:"Shark",brand:"Innova",type:"midrange",speed:4,glide:4,turn:0,fade:2},
  {name:"Wolf",brand:"Innova",type:"midrange",speed:4,glide:4,turn:0,fade:2},
  {name:"Skeeter",brand:"Innova",type:"midrange",speed:5,glide:6,turn:-3,fade:0},
  {name:"Viper",brand:"Innova",type:"midrange",speed:4,glide:3,turn:0,fade:4},
  {name:"Atlas",brand:"Innova",type:"midrange",speed:5,glide:5,turn:-1,fade:1},
  // ── DISCRAFT Midranges ──
  {name:"Buzzz",brand:"Discraft",type:"midrange",speed:5,glide:4,turn:-1,fade:1},
  {name:"Meteor",brand:"Discraft",type:"midrange",speed:5,glide:5,turn:-3,fade:1},
  {name:"Comet",brand:"Discraft",type:"midrange",speed:4,glide:5,turn:-2,fade:1},
  {name:"Wasp",brand:"Discraft",type:"midrange",speed:5,glide:4,turn:0,fade:3},
  {name:"Hornet",brand:"Discraft",type:"midrange",speed:4,glide:3,turn:0,fade:3},
  {name:"Sol",brand:"Discraft",type:"midrange",speed:4,glide:6,turn:-3,fade:0},
  {name:"Buzzz GT",brand:"Discraft",type:"midrange",speed:5,glide:4,turn:0,fade:2},
  {name:"Passion",brand:"Discraft",type:"midrange",speed:5,glide:5,turn:-2,fade:1},
  // ── DYNAMIC DISCS Midranges ──
  {name:"Truth",brand:"Dynamic Discs",type:"midrange",speed:5,glide:5,turn:-1,fade:1},
  {name:"Verdict",brand:"Dynamic Discs",type:"midrange",speed:5,glide:4,turn:-1,fade:2},
  {name:"Witness",brand:"Dynamic Discs",type:"midrange",speed:5,glide:5,turn:0,fade:2},
  {name:"Emac Truth",brand:"Dynamic Discs",type:"midrange",speed:5,glide:5,turn:-1,fade:2},
  // ── MVP/AXIOM Midranges ──
  {name:"Servo",brand:"MVP",type:"midrange",speed:6,glide:5,turn:-2,fade:1},
  {name:"Axis",brand:"MVP",type:"midrange",speed:5,glide:5,turn:-1,fade:1},
  {name:"Signal",brand:"MVP",type:"midrange",speed:5,glide:6,turn:-2,fade:1},
  {name:"Hex",brand:"Axiom",type:"midrange",speed:5,glide:6,turn:-2,fade:1},
  {name:"Envy",brand:"Axiom",type:"midrange",speed:4,glide:5,turn:-1,fade:1},
  // ── KASTAPLAST Midranges ──
  {name:"Berg",brand:"Kastaplast",type:"midrange",speed:3,glide:1,turn:0,fade:3},
  {name:"Grym",brand:"Kastaplast",type:"midrange",speed:9,glide:5,turn:-1,fade:2},
  {name:"Grym X",brand:"Kastaplast",type:"midrange",speed:9,glide:5,turn:0,fade:3},
  // ── LATITUDE 64 Midranges ──
  {name:"Jade",brand:"Latitude 64",type:"midrange",speed:8,glide:6,turn:-2,fade:1},
  {name:"Claymore",brand:"Latitude 64",type:"midrange",speed:8,glide:5,turn:-1,fade:3},
  // ── WESTSIDE Midranges ──
  {name:"Swan",brand:"Westside",type:"midrange",speed:4,glide:5,turn:-2,fade:1},
  {name:"Warship",brand:"Westside",type:"midrange",speed:6,glide:5,turn:-1,fade:3},
  // ── PRODIGY Midranges ──
  {name:"M1",brand:"Prodigy",type:"midrange",speed:6,glide:5,turn:-1,fade:2},
  {name:"M2",brand:"Prodigy",type:"midrange",speed:5,glide:6,turn:-2,fade:1},
  {name:"M3",brand:"Prodigy",type:"midrange",speed:5,glide:5,turn:0,fade:2},
  {name:"M4",brand:"Prodigy",type:"midrange",speed:5,glide:6,turn:-3,fade:1},

  // ── INNOVA Putters ──
  {name:"Aviar",brand:"Innova",type:"putter",speed:2,glide:3,turn:0,fade:1},
  {name:"Aviar3",brand:"Innova",type:"putter",speed:2,glide:3,turn:0,fade:1},
  {name:"KC Pro Aviar",brand:"Innova",type:"putter",speed:2,glide:3,turn:0,fade:2},
  {name:"Pig",brand:"Innova",type:"putter",speed:3,glide:1,turn:0,fade:3},
  {name:"Nova",brand:"Innova",type:"putter",speed:2,glide:5,turn:-2,fade:0},
  {name:"Dart",brand:"Innova",type:"putter",speed:3,glide:4,turn:-2,fade:0},
  {name:"Rhyno",brand:"Innova",type:"putter",speed:2,glide:2,turn:0,fade:4},
  {name:"JK Aviar",brand:"Innova",type:"putter",speed:2,glide:3,turn:0,fade:2},
  // ── DISCRAFT Putters ──
  {name:"Luna",brand:"Discraft",type:"putter",speed:3,glide:3,turn:0,fade:2},
  {name:"Zone",brand:"Discraft",type:"putter",speed:4,glide:3,turn:0,fade:3},
  {name:"Banger GT",brand:"Discraft",type:"putter",speed:2,glide:3,turn:0,fade:2},
  {name:"Challenger",brand:"Discraft",type:"putter",speed:2,glide:3,turn:0,fade:1},
  {name:"Magnet",brand:"Discraft",type:"putter",speed:2,glide:5,turn:-2,fade:0},
  {name:"Zone OS",brand:"Discraft",type:"putter",speed:4,glide:3,turn:0,fade:4},
  {name:"Fierce",brand:"Discraft",type:"putter",speed:3,glide:4,turn:-1,fade:1},
  // ── DYNAMIC DISCS Putters ──
  {name:"Judge",brand:"Dynamic Discs",type:"putter",speed:2,glide:4,turn:0,fade:1},
  {name:"Warden",brand:"Dynamic Discs",type:"putter",speed:2,glide:4,turn:0,fade:1},
  {name:"Emac Judge",brand:"Dynamic Discs",type:"putter",speed:2,glide:4,turn:0,fade:1},
  {name:"Trespass",brand:"Dynamic Discs",type:"putter",speed:3,glide:3,turn:0,fade:2},
  {name:"Marshal",brand:"Dynamic Discs",type:"putter",speed:3,glide:4,turn:0,fade:2},
  // ── MVP/AXIOM Putters ──
  {name:"Anode",brand:"MVP",type:"putter",speed:2,glide:4,turn:-1,fade:0},
  {name:"Atom",brand:"MVP",type:"putter",speed:2,glide:4,turn:0,fade:1},
  {name:"Electron",brand:"MVP",type:"putter",speed:2,glide:3,turn:0,fade:1},
  {name:"Axiom Envy",brand:"Axiom",type:"putter",speed:3,glide:4,turn:-1,fade:1},
  // ── KASTAPLAST Putters ──
  {name:"Lots",brand:"Kastaplast",type:"putter",speed:3,glide:4,turn:0,fade:1},
  {name:"Gote",brand:"Kastaplast",type:"putter",speed:2,glide:3,turn:0,fade:2},
  // ── LATITUDE 64 Putters ──
  {name:"Pure",brand:"Latitude 64",type:"putter",speed:2,glide:4,turn:0,fade:0},
  {name:"Royal Pure",brand:"Latitude 64",type:"putter",speed:2,glide:4,turn:0,fade:0},
  {name:"Mercy",brand:"Latitude 64",type:"putter",speed:2,glide:3,turn:0,fade:1},
  // ── WESTSIDE Putters ──
  {name:"Swan 1",brand:"Westside",type:"putter",speed:2,glide:4,turn:-1,fade:1},
  {name:"Swan 2",brand:"Westside",type:"putter",speed:3,glide:5,turn:-2,fade:1},
  {name:"Harp",brand:"Westside",type:"putter",speed:3,glide:4,turn:0,fade:3},
  // ── PRODIGY Putters ──
  {name:"PA1",brand:"Prodigy",type:"putter",speed:3,glide:3,turn:0,fade:2},
  {name:"PA2",brand:"Prodigy",type:"putter",speed:3,glide:4,turn:-1,fade:1},
  {name:"PA3",brand:"Prodigy",type:"putter",speed:3,glide:4,turn:0,fade:1},
  {name:"PA4",brand:"Prodigy",type:"putter",speed:2,glide:4,turn:-1,fade:0},
  // ── STREAMLINE Putters ──
  {name:"Pilot",brand:"Streamline",type:"putter",speed:2,glide:4,turn:-1,fade:1},
  {name:"Drift",brand:"Streamline",type:"midrange",speed:5,glide:7,turn:-3,fade:0},
  {name:"Trace",brand:"Streamline",type:"fairway_driver",speed:10,glide:5,turn:-2,fade:2},
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
const TEST_BAG = [
  {id:"t1",name:"Destroyer",brand:"Innova",type:"distance_driver",speed:12,glide:5,turn:-1,fade:3,plastic:"Star",color:"red",notes:"Overstable driver",addedAt:"2026-05-29"},
  {id:"t2",name:"Hades",brand:"Discraft",type:"distance_driver",speed:12,glide:6,turn:-3,fade:2,plastic:"ESP",color:"blue",notes:"Understable driver",addedAt:"2026-05-29"},
  {id:"t3",name:"Teebird",brand:"Innova",type:"fairway_driver",speed:7,glide:5,turn:0,fade:2,plastic:"Champion",color:"yellow",notes:"Overstable fairway",addedAt:"2026-05-29"},
  {id:"t4",name:"Leopard",brand:"Innova",type:"fairway_driver",speed:7,glide:5,turn:-2,fade:1,plastic:"Star",color:"green",notes:"Understable fairway",addedAt:"2026-05-29"},
  {id:"t5",name:"Roc",brand:"Innova",type:"midrange",speed:4,glide:4,turn:0,fade:3,plastic:"Pro",color:"orange",notes:"Overstable midrange",addedAt:"2026-05-29"},
  {id:"t6",name:"Buzzz",brand:"Discraft",type:"midrange",speed:5,glide:4,turn:-1,fade:1,plastic:"Z",color:"white",notes:"Neutral midrange",addedAt:"2026-05-29"},
  {id:"t7",name:"Aviar",brand:"Innova",type:"putter",speed:2,glide:3,turn:0,fade:1,plastic:"DX",color:"pink",notes:"Neutral putter",addedAt:"2026-05-29"},
  {id:"t8",name:"Judge",brand:"Dynamic Discs",type:"putter",speed:2,glide:4,turn:0,fade:1,plastic:"Lucid",color:"purple",notes:"Neutral putter",addedAt:"2026-05-29"},
];

const loadBag = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("chainhound_bag")||"[]");
    // Pre-load test bag if empty
    if (saved.length === 0) {
      localStorage.setItem("chainhound_bag", JSON.stringify(TEST_BAG));
      return TEST_BAG;
    }
    return saved;
  } catch { return TEST_BAG; }
};
const saveBag = b => localStorage.setItem("chainhound_bag", JSON.stringify(b));
const TEST_COURSES = [
  {
    id:"beach-city-dam",
    name:"Beach City Dam",
    createdAt:"2026-05-29",
    holes:[
      {number:1,distance:333,par:3,shape:"straight",teeLabel:"Short",name:"Opening Hole",notes:"333ft par 3. Straight wooded corridor — trees line both sides of the fairway the entire length. Road/path runs on the RIGHT (OB). Aim straight down the center of the fairway. RHBH — keep it flat and straight, your natural fade will bring it back left. Stay away from the road on the right.",hazards:"trees_both_sides ob_right",allTees:[{label:"Short",distance:333},{label:"Long",distance:333}]},
      {number:2,distance:327,par:3,shape:"slight_dogleg_left",teeLabel:"Short",name:"Unknown",notes:"327ft par 3. Tee on right, fairway runs south and bends LEFT toward basket. Trees and road on the RIGHT entire length. Open Pollinator Grassland on the LEFT — wide open safe side. RHBH — natural backhand fade finishes LEFT which follows the fairway bend perfectly. Aim straight off tee, let disc work left to basket. Long tee 441ft.",hazards:"trees_right ob_right",allTees:[{label:"Short",distance:327},{label:"Long",distance:441}]},
      {number:3,distance:414,par:3,shape:"straight",teeLabel:"Short",name:"The Eye of the Needle",notes:"414ft par 3. Long straight tight corridor. Dense trees line BOTH sides entire length. MANDO near basket — disc must pass LEFT of mando tree. Drop zone left of tree. RHBH backhand flat release, trust the natural fade left to clear the mando. Long tee 540ft.",hazards:"trees_both_sides mando_pole tight",allTees:[{label:"Short",distance:414},{label:"Long",distance:540}]},
      {number:4,distance:357,par:3,shape:"slight_dogleg_left",teeLabel:"Short",name:"McKinley's Meadow",notes:"357ft par 3. Slight dogleg left. Trees both sides but more open than neighboring holes — meadow-like in center section. Fairway bends left toward basket at top. RHBH — backhand fade naturally follows the left bend. Long tee 456ft.",hazards:"trees_both_sides",allTees:[{label:"Short",distance:357},{label:"Long",distance:456}]},
      {number:5,distance:231,par:3,shape:"straight",teeLabel:"Short",name:"President's Glen",notes:"SHORT: 231ft / LONG: 324ft. Extremely tight wooded tunnel — trees crowd both sides completely. Chain link fence OB right near tee area. No room to work any angle. Straight flat release only. Putter or straight midrange. This is the tightest hole on the front 9.",hazards:"trees_both_sides ob_right tight",allTees:[{label:"Short",distance:231},{label:"Long",distance:324}]},
      {number:6,distance:282,par:3,shape:"straight",teeLabel:"Short",name:"Free Flight",notes:"SHORT: 282ft / LONG: 405ft. Open fairway with road OB on both sides. Most open hole on the course — hence the name. Gravel and road OB left AND right. Stay in the fairway corridor. Perfect hole to let it fly. Long tee adds 123ft.",hazards:"ob_right ob_left",allTees:[{label:"Short",distance:282},{label:"Long",distance:405}]},
      {number:7,distance:237,par:3,shape:"slight_dogleg_left",teeLabel:"Short",name:"In Plain Sight",notes:"SHORT: 237ft / LONG: 366ft. Slight dogleg left. Trees on the right side, more open left. Fairway bends left near basket. RHBH — natural backhand fade follows the left bend perfectly. Aim straight, let disc work left. Long tee 366ft.",hazards:"trees_right",allTees:[{label:"Short",distance:237},{label:"Long",distance:366}]},
      {number:8,distance:336,par:3,shape:"straight",teeLabel:"Short",name:"The Wall",notes:"336ft par 3. Straight uphill shot. Trees both sides. Gravel pathway runs alongside — landing ON gravel is CASUAL (free relief, not OB). This hole plays longer than 336ft due to elevation gain. Add distance to your selection. Steady straight flight up the hill.",hazards:"trees_both_sides",allTees:[{label:"Short",distance:336},{label:"Long",distance:336}]},
      {number:9,distance:363,par:3,shape:"straight",teeLabel:"Short",name:"Sugar Ridge",notes:"363ft par 3. Straight. Gravel path alongside right — landing ON path is CASUAL. Gravel AREA to right is OUT OF BOUNDS. Stay left of the gravel. Open left side is safe. Long tee 510ft adds the gravel challenge.",hazards:"ob_right",allTees:[{label:"Short",distance:363},{label:"Long",distance:510}]},
      {number:10,distance:384,par:3,shape:"slight_dogleg_left",teeLabel:"Short",name:"Campaign Trail",notes:"SHORT: 384ft par 3. LONG: 546ft par 4 — two shots required on long. Fairway sweeps left. Trees cluster right side. Open left. Aim center, let disc work left toward basket. On long tee this is a legitimate par 4 needing a strong drive and accurate approach.",hazards:"trees_right",allTees:[{label:"Short",distance:384},{label:"Long",distance:546}]},
      {number:11,distance:267,par:3,shape:"slight_dogleg_left",teeLabel:"Short",name:"Hunter Run",notes:"SHORT: 267ft par 3. LONG: 414ft par 3 with MANDO — disc must go RIGHT of mando tree. Drop zone at short tee if missed. Trees line both sides. Slight left bend to basket.",hazards:"trees_both_sides mando_pole",allTees:[{label:"Short",distance:267},{label:"Long",distance:414}]},
      {number:12,distance:276,par:3,shape:"straight",teeLabel:"Short",name:"Knight Moves",notes:"Straight wooded hole. Trees completely surround fairway. Tight corridor. Straight neutral flight essential.",hazards:"trees_both_sides tight",allTees:[{label:"Short",distance:276},{label:"Long",distance:276}]},
      {number:13,distance:476,par:4,shape:"straight",teeLabel:"Short",name:"The Dam Ditch",notes:"Par 4. SHORT: 476ft / LONG: 608ft. Straight long hole. Road runs alongside on BOTH sides — OB if disc lands ON the road (not flying over). Keep center fairway entire length. Two shots minimum. One of the most demanding holes on the course.",hazards:"ob_left ob_right",allTees:[{label:"Short",distance:476},{label:"Long",distance:608}]},
      {number:14,distance:267,par:3,shape:"straight",teeLabel:"Short",name:"Lookout Point",notes:"267ft par 3. Straight uphill. Trees right side. Open left. Both short and long tees aim to same basket at the top of the hill. Elevation gain makes this play longer than 267ft. Aim slightly left — disc will fall right as it crests the hill.",hazards:"trees_right",allTees:[{label:"Short",distance:267},{label:"Long",distance:267}]},
      {number:15,distance:700,par:5,shape:"dogleg_left",teeLabel:"Short",name:"Tribal Trail",notes:"MONSTER 700ft par 5 (short) / 918ft (long). Big sweeping left bend. Cement pad OB — if disc lands ON cement must re-tee from short tee box. Drop zone marked. Three shots minimum.",hazards:"ob_right_cement trees_right",allTees:[{label:"Short",distance:700},{label:"Long",distance:918}]},
      {number:16,distance:200,par:3,shape:"straight",teeLabel:"Short",name:"Memorial Boulevard",notes:"SHORT: 200ft / LONG: 252ft. Extremely tight wooded tunnel. Trees completely surround narrow corridor. Putter only — precision essential. No room for any curve.",hazards:"trees_both_sides tight",allTees:[{label:"Short",distance:200},{label:"Long",distance:252}]},
      {number:17,distance:615,par:4,shape:"straight",teeLabel:"Short",name:"The Great Escape",notes:"SHORT: 615ft par 4 / LONG: 744ft par 5. Straight through tight wooded corridor. Trees both sides entire length. Long tee adds 129ft. Two-three shots.",hazards:"trees_both_sides tight",allTees:[{label:"Short",distance:615},{label:"Long",distance:744}]},
      {number:18,distance:369,par:3,shape:"straight",teeLabel:"Short",name:"McKinley's Monument",notes:"Finishing hole. SHORT: 369ft / LONG: 525ft. Straight to basket near parking area. Trees both sides. Make it count. Back to parking after basket. Thank you for playing!",hazards:"trees_both_sides",allTees:[{label:"Short",distance:369},{label:"Long",distance:525}]},
    ]
  },
  {
    id:"sabo-park",
    name:"Sabo Park",
    createdAt:"2026-05-29",
    holes:[
      {number:1,distance:213,par:3,shape:"slight_dogleg_left",teeLabel:"Default",notes:"Slight dogleg left. Tee at bottom, basket upper left. Trees right, road OB left. Keep center-right off tee.",hazards:"trees_right ob_left",allTees:[{label:"Default",distance:213}]},
      {number:2,distance:345,par:3,shape:"dogleg_left",teeLabel:"Default",notes:"Big sweeping dogleg left. Mando pole — must throw correct side or rethrow. OB road on far right. Trees heavy left. Aim center, let disc work left.",hazards:"ob_right ob_left mando_pole trees_left",allTees:[{label:"Default",distance:345}]},
      {number:3,distance:132,par:3,shape:"straight",teeLabel:"Default",notes:"Shortest hole 132ft but extremely tight. Narrow green corridor surrounded by trees. Path curves right (OB). Putter only — precision over power. Flat straight release.",hazards:"trees_both_sides ob_right tight",allTees:[{label:"Default",distance:132}]},
      {number:4,distance:241,par:3,shape:"straight",teeLabel:"Default",notes:"Straight with trees heavy both sides. Very tight fairway. Straight neutral flight essential. Tee at bottom, basket upper center.",hazards:"trees_both_sides tight",allTees:[{label:"Default",distance:241}]},
      {number:5,distance:238,par:3,shape:"straight",teeLabel:"Default",notes:"Tunnel hole — trees completely surround narrow corridor. Chain link fence OB right. Keep it straight down the middle. No room to work either side.",hazards:"trees_both_sides ob_right tight",allTees:[{label:"Default",distance:238}]},
      {number:6,distance:294,par:3,shape:"slight_dogleg_left",teeLabel:"Default",notes:"Slight dogleg left. Trees heavy right side. More open left. Aim center-left off tee. OB markers left side.",hazards:"trees_right ob_left",allTees:[{label:"Default",distance:294}]},
      {number:7,distance:270,par:3,shape:"straight",teeLabel:"Default",notes:"Straight hole. Trees very heavy on LEFT side. More open right. Building lower left is OB. Favor right side of fairway.",hazards:"trees_left ob_left",allTees:[{label:"Default",distance:270}]},
      {number:8,distance:162,par:3,shape:"straight",teeLabel:"Default",notes:"Short 162ft. Water Dept Building is OB on LEFT (upper left on sign). OB asterisk markers left. Parking lot OB right. Stay center. Putter straight and flat.",hazards:"ob_left ob_right_parking trees_both_sides",allTees:[{label:"Default",distance:162}]},
      {number:9,distance:171,par:3,shape:"straight",teeLabel:"Default",notes:"Finishing hole. Trees both sides, narrow corridor. Parking structure OB right — asterisk OB markers right. Basket center of green zone. Flat straight putter.",hazards:"trees_both_sides ob_right_parking",allTees:[{label:"Default",distance:171}]},
    ]
  }
];

const loadCourses = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("chainhound_courses")||"[]");
    if (saved.length === 0) {
      localStorage.setItem("chainhound_courses", JSON.stringify(TEST_COURSES));
      return TEST_COURSES;
    }
    return saved;
  } catch { return TEST_COURSES; }
};
const saveCourses = c => localStorage.setItem("chainhound_courses", JSON.stringify(c));
const DEFAULT_SETTINGS = { dominantHand: "right", skillLevel: "intermediate", driverDistance: "200to300" };

const loadSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("chainhound_settings")||"{}");
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch { return DEFAULT_SETTINGS; }
};
const saveSettings = s => localStorage.setItem("chainhound_settings", JSON.stringify(s));
const loadActiveRound = () => { try { return JSON.parse(localStorage.getItem("chainhound_active_round")||"null"); } catch { return null; } };
const saveActiveRound = r => r ? localStorage.setItem("chainhound_active_round", JSON.stringify(r)) : localStorage.removeItem("chainhound_active_round");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const GlowOrb = ({top,left,size=200,opacity=0.08}) => (
  <div style={{position:"absolute",top,left,width:size,height:size,borderRadius:"50%",background:`radial-gradient(circle,${theme.accent} 0%,transparent 70%)`,opacity,pointerEvents:"none",filter:"blur(40px)"}}/>
);

function getStability(turn, fade) {
  if (turn<=-3&&fade<=1) return {label:"Flippy",color:"#60BFFF"};
  if (turn<=-2&&fade<=2) return {label:"Understable",color:"#3DFF7A"};
  if (fade>=3&&turn>=-1) return {label:"Overstable",color:"#FF7A3D"};
  if ((fade-turn)>=4) return {label:"Overstable",color:"#FF7A3D"};
  return {label:"Neutral",color:"#FFB830"};
}

// ─── Hole Diagram (Fixed — visual only, accurate SVG) ─────────────────────────
function HoleDiagram({ hole, shots = [] }) {
  const W = 280, H = 200;
  const shape = hole?.shape || "straight";
  const dist = hole?.distance || 300;
  
  // FIXED: Parse hazards as exact word array — prevents "ob_left" matching "water_left_ob"
  const hazardList = (hole?.hazards || "").split(/\s+/).filter(Boolean);
  const has = (key) => hazardList.includes(key);
  const hasAny = (...keys) => keys.some(k => hazardList.includes(k));

  const tee = { x: 24, y: H/2 };
  
  const getBasket = () => {
    if (shape === "dogleg_left") return { x: W-24, y: H*0.18 };
    if (shape === "slight_dogleg_left") return { x: W-24, y: H*0.33 };
    if (shape === "dogleg_right") return { x: W-24, y: H*0.82 };
    if (shape === "slight_dogleg_right") return { x: W-24, y: H*0.67 };
    return { x: W-24, y: H/2 };
  };
  const basket = getBasket();
  const mid = { x: (tee.x + basket.x)/2, y: (tee.y + basket.y)/2 };

  const getFairway = () => {
    if (shape === "straight") return `M${tee.x},${tee.y} L${basket.x},${basket.y}`;
    if (shape === "dogleg_left")
      return `M${tee.x},${tee.y} L${mid.x-10},${tee.y} Q${mid.x+40},${tee.y-10} ${basket.x},${basket.y}`;
    if (shape === "slight_dogleg_left")
      return `M${tee.x},${tee.y} L${mid.x},${tee.y} Q${mid.x+35},${tee.y} ${basket.x},${basket.y}`;
    if (shape === "dogleg_right")
      return `M${tee.x},${tee.y} L${mid.x-10},${tee.y} Q${mid.x+40},${tee.y+10} ${basket.x},${basket.y}`;
    if (shape === "slight_dogleg_right")
      return `M${tee.x},${tee.y} L${mid.x},${tee.y} Q${mid.x+35},${tee.y} ${basket.x},${basket.y}`;
    return `M${tee.x},${tee.y} L${basket.x},${basket.y}`;
  };

  // Shot position — interpolate along the actual path curve, not just linear
  const getShotPos = (shot) => {
    const pct = Math.min(1, Math.max(0, shot.distFromTee / dist));
    // Linear interpolation between tee and basket (good enough for marker placement)
    const x = tee.x + pct * (basket.x - tee.x);
    const y = tee.y + pct * (basket.y - tee.y);
    // Left/right offset perpendicular to fairway direction
    const dx = basket.x - tee.x, dy = basket.y - tee.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    const perpX = -dy/len, perpY = dx/len;
    const offsetAmt = shot.position === "left" ? -20 : shot.position === "right" ? 20 : 0;
    return { x: x + perpX*offsetAmt, y: y + perpY*offsetAmt };
  };

  // Determine tree/hazard zones — USING EXACT WORD MATCHING
  const treesTop = has("trees_left") || has("trees_both_sides") || has("tight");
  const treesBottom = has("trees_right") || has("trees_both_sides") || has("tight");
  const obTop = has("water_left_ob") || has("ob_left");  // NOT ob_right_parking etc
  const obBottom = hasAny("ob_right", "ob_right_parking", "ob_right_building", "ob_right_cement");
  const hasMando = has("mando_pole");
  const isWater = has("water_left_ob");

  const fairwayPath = getFairway();

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* Background */}
        <rect width={W} height={H} fill={theme.surfaceAlt} rx="10"/>

        {/* Trees top — LEFT side of fairway (render always when present) */}
        {treesTop && (
          <>
            <rect x={tee.x} y={0} width={basket.x - tee.x} height={H*0.24} fill="rgba(20,70,20,0.65)" rx="4"/>
            <text x={tee.x+6} y={15} fontSize="10" fill="#6ABF6A">🌲</text>
          </>
        )}

        {/* Trees bottom — RIGHT side of fairway (render always when present) */}
        {treesBottom && (
          <>
            <rect x={tee.x} y={H*0.76} width={basket.x - tee.x} height={H*0.24} fill="rgba(20,70,20,0.65)" rx="4"/>
            <text x={tee.x+6} y={H-3} fontSize="10" fill="#6ABF6A">🌲</text>
          </>
        )}

        {/* OB left — renders ON TOP of trees with different color */}
        {obTop && (
          <>
            <rect x={tee.x} y={0} width={basket.x - tee.x} height={H*0.18} fill={isWater ? "rgba(30,100,200,0.4)" : "rgba(220,60,60,0.35)"} rx="4"/>
            <text x={tee.x+6} y={14} fontSize="9" fill={isWater ? "#60BFFF" : "#FF8888"}>{isWater ? "💧 OB" : "⚠️ OB"}</text>
          </>
        )}

        {/* OB right — renders ON TOP of trees with different color */}
        {obBottom && (
          <>
            <rect x={tee.x} y={H*0.82} width={basket.x - tee.x} height={H*0.18} fill="rgba(220,60,60,0.35)" rx="4"/>
            <text x={tee.x+6} y={H-2} fontSize="9" fill="#FF8888">⚠️ OB</text>
          </>
        )}

        {/* Fairway — 3 layer for depth */}
        <path d={fairwayPath} stroke="#0F3318" strokeWidth="36" fill="none" strokeLinecap="round"/>
        <path d={fairwayPath} stroke="#1A5C32" strokeWidth="28" fill="none" strokeLinecap="round"/>
        <path d={fairwayPath} stroke="#22783E" strokeWidth="20" fill="none" strokeLinecap="round"/>

        {/* Distance markers */}
        {[0.33, 0.66].map(pct => {
          const x = tee.x + pct * (basket.x - tee.x);
          const y = tee.y + pct * (basket.y - tee.y);
          return (
            <g key={pct}>
              <line x1={x} y1={y-12} x2={x} y2={y+12} stroke={theme.textDim} strokeWidth="1" strokeDasharray="3,2"/>
              <text x={x} y={y-15} textAnchor="middle" fontSize="8" fill={theme.textDim}>{Math.round(dist*pct)}ft</text>
            </g>
          );
        })}

        {/* Mando indicator */}
        {hasMando && (
          <g>
            <circle cx={mid.x} cy={mid.y} r="7" fill="rgba(255,184,48,0.3)" stroke={theme.warning} strokeWidth="1.5"/>
            <text x={mid.x} y={mid.y+4} textAnchor="middle" fontSize="8" fill={theme.warning} fontWeight="bold">M</text>
          </g>
        )}

        {/* Shot markers — FIXED position calculation */}
        {shots.map((shot, i) => {
          const pos = getShotPos(shot);
          const isLast = i === shots.length - 1;
          return (
            <g key={i}>
              <circle cx={pos.x} cy={pos.y} r="12" fill={isLast ? theme.warning : theme.accentDim}
                stroke={isLast ? "#FFF" : theme.accent} strokeWidth="2" opacity="0.95"/>
              <text x={pos.x} y={pos.y+4} textAnchor="middle" fontSize="9" fill={theme.bg} fontWeight="bold">{i+1}</text>
            </g>
          );
        })}

        {/* Tee box */}
        <rect x={tee.x-10} y={tee.y-7} width={20} height={14} fill={theme.accentDim} rx="4"/>
        <text x={tee.x} y={tee.y+4} textAnchor="middle" fontSize="7" fill={theme.accent} fontWeight="bold">TEE</text>

        {/* Basket */}
        <circle cx={basket.x} cy={basket.y} r="12" fill="none" stroke={theme.accent} strokeWidth="2.5"/>
        <circle cx={basket.x} cy={basket.y} r="5" fill={theme.accent}/>
        <text x={basket.x} y={basket.y+23} textAnchor="middle" fontSize="11">⛳</text>

        {/* Hole name + info */}
        <text x={W/2} y={H-4} textAnchor="middle" fontSize="9" fill={theme.textMuted}>
          {hole?.name && hole.name !== "Unknown" ? `${hole.name} · ` : ""}{dist}ft · Par {hole?.par}
        </text>
      </svg>
    </div>
  );
}

// ─── Full Screen Tap Diagram ─────────────────────────────────────────────────
// Lie is inferred from where player taps:
//   Fairway corridor → "fairway"
//   Tree zone (dark green) → "trees"
//   OB zone (red strip) → "ob"
//   Basket circle → "basket" (hole complete)
//   Rough (outside fairway but not trees/OB) → "rough"
function TapLogger({ hole, remainingDist, previousShots, onLog, onCancel }) {
  const holeDist = hole?.distance || 300;
  const svgRef = useRef(null);
  const [tapPos, setTapPos] = useState(null);
  const [mode, setMode] = useState("tap");

  // Slider fallback
  const defaultThrow = Math.min(Math.round(remainingDist * 0.75), remainingDist);
  const [sliderDist, setSliderDist] = useState(defaultThrow);
  const [sliderPos, setSliderPos] = useState("center");
  const sliderRemaining = Math.max(0, remainingDist - sliderDist);

  const W = 320, H = 520;

  // Hazard parsing
  const hazardList = (hole?.hazards || "").split(" ").filter(Boolean);
  const has = (k) => hazardList.includes(k);
  const hasAny = (...ks) => ks.some(k => hazardList.includes(k));
  const treesLeft  = has("trees_left")  || has("trees_both_sides") || has("tight");
  const treesRight = has("trees_right") || has("trees_both_sides") || has("tight");
  const obLeft     = has("water_left_ob") || has("ob_left");
  const obRight    = hasAny("ob_right","ob_right_parking","ob_right_building","ob_right_cement");
  const isWater    = has("water_left_ob");
  const hasMando   = has("mando_pole");
  const isTight    = has("tight");

  // Layout
  const TEE_Y = H - 60, BASKET_Y = 55;
  const shape = hole?.shape || "straight";
  const getBasketX = () => {
    if (shape === "dogleg_left")         return W * 0.28;
    if (shape === "slight_dogleg_left")  return W * 0.38;
    if (shape === "dogleg_right")        return W * 0.72;
    if (shape === "slight_dogleg_right") return W * 0.62;
    return W / 2;
  };
  const TEE_X = W / 2;
  const BASKET_X = getBasketX();
  const MID_X = (TEE_X + BASKET_X) / 2;
  const MID_Y = (TEE_Y + BASKET_Y) / 2;
  const FW = isTight ? 32 : 46; // fairway stroke width

  const getFairwayPath = () => {
    if (shape === "straight") return `M${TEE_X},${TEE_Y} L${BASKET_X},${BASKET_Y}`;
    if (shape === "dogleg_left")
      return `M${TEE_X},${TEE_Y} L${TEE_X},${MID_Y+40} Q${TEE_X-10},${MID_Y} ${BASKET_X},${BASKET_Y}`;
    if (shape === "slight_dogleg_left")
      return `M${TEE_X},${TEE_Y} L${TEE_X},${MID_Y+20} Q${TEE_X-5},${MID_Y-10} ${BASKET_X},${BASKET_Y}`;
    if (shape === "dogleg_right")
      return `M${TEE_X},${TEE_Y} L${TEE_X},${MID_Y+40} Q${TEE_X+10},${MID_Y} ${BASKET_X},${BASKET_Y}`;
    if (shape === "slight_dogleg_right")
      return `M${TEE_X},${TEE_Y} L${TEE_X},${MID_Y+20} Q${TEE_X+5},${MID_Y-10} ${BASKET_X},${BASKET_Y}`;
    return `M${TEE_X},${TEE_Y} L${BASKET_X},${BASKET_Y}`;
  };

  // ── Infer lie from tap position ──────────────────────────────────────────────
  const inferLie = (relX, relY, pctFromTee) => {
    if (relY < 0.15) return "basket";
    // OB — outer 8% each side
    if (relX < 0.08 && obLeft)  return "ob";
    if (relX > 0.92 && obRight) return "ob";
    // Trees — outer 25% each side (inside OB)
    if (relX < 0.25 && treesLeft)  return "trees";
    if (relX > 0.75 && treesRight) return "trees";
    // Rough — 25-38% each side
    if (relX < 0.38 || relX > 0.62) return "rough";
    // Fairway — center 24%
    return "fairway";
  };

  // ── Convert tap to shot data ──────────────────────────────────────────────────
  const tapToData = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    // Use raw screen coordinates mapped to full rect dimensions
    // This gives true full-screen left/right range
    const relY = Math.max(0, Math.min(1, (clientY - rect.top)  / rect.height));
    const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    // Basket detection — tap near basket icon (top 15% of screen)
    if (relY < 0.15) {
      return {
        pct: 1.0, distFromTee: remainingDist, distRemaining: 0,
        position: "center", lie: "basket", isBasket: true,
      };
    }

    // Distance from tee — Y axis only (top=basket, bottom=tee)
    const pctFromTee    = Math.min(0.99, Math.max(0.01, 1 - relY));
    const alreadyThrown = holeDist - remainingDist;
    const minPct        = alreadyThrown / holeDist;
    const clampedPct    = Math.max(minPct + 0.01, pctFromTee);
    const clampedDist   = Math.round(clampedPct * holeDist);
    const distThisShot  = Math.max(0, clampedDist - alreadyThrown);
    const distRemaining = Math.max(0, holeDist - clampedDist);

    // LEFT / RIGHT — generous zones across full screen width
    // Left third = left, right third = right, middle = center
    const position = relX < 0.33 ? "left" : relX > 0.67 ? "right" : "center";

    // Lie from zone
    const lie = inferLie(relX, relY, clampedPct);

    return { pct: clampedPct, distFromTee: distThisShot, distRemaining, position, lie, isBasket: false };
  };

  const handleTap = (e) => {
    e.preventDefault(); e.stopPropagation();
    const touch = e.touches ? e.touches[0] : e;
    const data = tapToData(touch.clientX, touch.clientY);
    setTapPos(data);
  };

  // Lie label + color for display
  const lieInfo = (lie) => {
    switch(lie) {
      case "basket":  return { label: "🎯 In Basket!", color: theme.accent };
      case "fairway": return { label: "✅ Fairway",    color: theme.accent };
      case "rough":   return { label: "🌿 Rough",      color: theme.warning };
      case "trees":   return { label: "🌲 In Trees",   color: "#5A9A5A" };
      case "ob":      return { label: "⚠️ Out of Bounds", color: theme.error };
      default:        return { label: "📍 Fairway",    color: theme.accent };
    }
  };

  // Previous shot marker positions
  const getShotXY = (shot) => {
    const pct = Math.min(1, shot.distFromTee / holeDist);
    const y   = TEE_Y - pct * (TEE_Y - BASKET_Y);
    const x   = TEE_X + pct * (BASKET_X - TEE_X);
    const dx  = BASKET_X - TEE_X, dy = BASKET_Y - TEE_Y;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const perpX = -dy/len, perpY = dx/len;
    const offset = shot.position === "left" ? -28 : shot.position === "right" ? 28 : 0;
    return { x: x + perpX*offset, y };
  };

  // Current tap marker position
  const tapMarkerY = tapPos ? TEE_Y - tapPos.pct * (TEE_Y - BASKET_Y) : null;
  const tapMarkerX = tapPos ? (() => {
    const base = TEE_X + tapPos.pct * (BASKET_X - TEE_X);
    const dx = BASKET_X - TEE_X, dy = BASKET_Y - TEE_Y;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const perpX = -dy/len;
    const offset = tapPos.position === "left" ? -28 : tapPos.position === "right" ? 28 : 0;
    return base + perpX * offset;
  })() : null;

  const tapLie = tapPos ? lieInfo(tapPos.lie) : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 250, display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "12px 16px 8px", background: "#0A0F0D", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: "10px", color: theme.textMuted, letterSpacing: "0.12em" }}>
            {hole?.name && hole.name !== "Unknown" ? hole.name.toUpperCase() : `HOLE ${hole?.number}`} · {remainingDist}ft REMAINING
          </div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: theme.text, fontFamily: "'DM Sans',sans-serif" }}>
            {tapPos ? (tapPos.isBasket ? "🎯 Tap basket to finish hole" : `Tap confirmed — ${tapPos.distRemaining}ft left`) : "Tap where your disc landed"}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <div onClick={() => setMode(mode === "tap" ? "slider" : "tap")} style={{ padding: "6px 10px", background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "10px", color: theme.textMuted, cursor: "pointer" }}>
            {mode === "tap" ? "📏" : "👆"}
          </div>
          <div onClick={onCancel} style={{ padding: "6px 10px", background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "10px", color: theme.textMuted, cursor: "pointer" }}>✕</div>
        </div>
      </div>

      {mode === "tap" ? (
        <>
          {/* Tap SVG — full screen */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <svg
              ref={svgRef}
              width="100%" height="100%"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ touchAction: "none", display: "block" }}
              onTouchStart={handleTap}
              onClick={handleTap}
            >
              {/* Base background */}
              <rect width={W} height={H} fill="#060E06"/>

              {/* ── HAZARD BACKGROUNDS — full height fills ── */}
              {/* Trees left — dark green fills left half */}
              {treesLeft  && <rect x={0}    y={0} width={W*0.40} height={H} fill="rgba(8,35,8,0.95)"/>}
              {/* Trees right — dark green fills right half */}
              {treesRight && <rect x={W*0.60} y={0} width={W*0.40} height={H} fill="rgba(8,35,8,0.95)"/>}
              {/* Rough zones — medium green between trees and fairway */}
              {(treesLeft || obLeft) && <rect x={W*0.22} y={0} width={W*0.16} height={H} fill="rgba(15,50,15,0.7)"/>}
              {(treesRight || obRight) && <rect x={W*0.62} y={0} width={W*0.16} height={H} fill="rgba(15,50,15,0.7)"/>}
              {/* OB strips — bright red at very edges */}
              {obLeft  && <rect x={0}    y={0} width={W*0.10} height={H} fill={isWater ? "rgba(20,80,180,0.75)" : "rgba(180,30,30,0.75)"}/>}
              {obRight && <rect x={W*0.90} y={0} width={W*0.10} height={H} fill="rgba(180,30,30,0.75)"/>}

              {/* ── FAIRWAY — bright corridor over hazards ── */}
              <path d={getFairwayPath()} stroke="#061A0A" strokeWidth={FW+18} fill="none" strokeLinecap="round"/>
              <path d={getFairwayPath()} stroke="#155228" strokeWidth={FW+8}  fill="none" strokeLinecap="round"/>
              <path d={getFairwayPath()} stroke="#1E7A3A" strokeWidth={FW}    fill="none" strokeLinecap="round"/>
              <path d={getFairwayPath()} stroke="#28A050" strokeWidth={FW-10} fill="none" strokeLinecap="round"/>
              {/* Fairway highlight */}
              <path d={getFairwayPath()} stroke="rgba(255,255,255,0.07)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="10,10"/>

              {/* ── TREE CANOPY DOTS ── */}
              {treesLeft && [0.1,0.22,0.35,0.48,0.61,0.74,0.87].map((p,i) => {
                const cy = BASKET_Y + p*(TEE_Y-BASKET_Y);
                return <g key={i}>
                  <circle cx={18} cy={cy} r={16} fill="rgba(15,60,15,0.9)" stroke="rgba(30,90,30,0.7)" strokeWidth="1.5"/>
                  <circle cx={40} cy={cy+12} r={12} fill="rgba(12,50,12,0.8)"/>
                </g>;
              })}
              {treesRight && [0.1,0.22,0.35,0.48,0.61,0.74,0.87].map((p,i) => {
                const cy = BASKET_Y + p*(TEE_Y-BASKET_Y);
                return <g key={i}>
                  <circle cx={W-18} cy={cy} r={16} fill="rgba(15,60,15,0.9)" stroke="rgba(30,90,30,0.7)" strokeWidth="1.5"/>
                  <circle cx={W-40} cy={cy+12} r={12} fill="rgba(12,50,12,0.8)"/>
                </g>;
              })}

              {/* ── HAZARD LABELS ── */}
              {obLeft && (
                <text x={W*0.05} y={MID_Y} textAnchor="middle" fontSize="11" fontWeight="bold"
                  fill={isWater ? "#60BFFF" : "#FF7777"} transform={`rotate(-90,${W*0.05},${MID_Y})`}>
                  {isWater ? "💧 OB WATER" : "⚠️ OB"}
                </text>
              )}
              {treesLeft && !obLeft && (
                <text x={W*0.08} y={MID_Y} textAnchor="middle" fontSize="11" fontWeight="bold"
                  fill="#55CC55" transform={`rotate(-90,${W*0.08},${MID_Y})`}>🌲 TREES</text>
              )}
              {obRight && (
                <text x={W*0.95} y={MID_Y} textAnchor="middle" fontSize="11" fontWeight="bold"
                  fill="#FF7777" transform={`rotate(90,${W*0.95},${MID_Y})`}>⚠️ OB</text>
              )}
              {treesRight && !obRight && (
                <text x={W*0.92} y={MID_Y} textAnchor="middle" fontSize="11" fontWeight="bold"
                  fill="#55CC55" transform={`rotate(90,${W*0.92},${MID_Y})`}>🌲 TREES</text>
              )}

              {/* ── DISTANCE MARKERS ── */}
              {[0.25,0.5,0.75].map(pct => {
                const y = TEE_Y - pct*(TEE_Y-BASKET_Y);
                const x = TEE_X + pct*(BASKET_X-TEE_X);
                return <g key={pct}>
                  <line x1={W*0.12} y1={y} x2={W*0.88} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="5,4"/>
                  <text x={x+FW/2+8} y={y+4} fontSize="11" fill="rgba(255,255,255,0.35)">{Math.round(holeDist*pct)}ft</text>
                </g>;
              })}

              {/* ── MANDO ── */}
              {hasMando && (
                <g>
                  <circle cx={MID_X} cy={MID_Y} r="14" fill="rgba(255,184,48,0.2)" stroke={theme.warning} strokeWidth="2"/>
                  <text x={MID_X} y={MID_Y+5} textAnchor="middle" fontSize="12" fill={theme.warning} fontWeight="bold">M</text>
                </g>
              )}

              {/* ── PREVIOUS SHOTS ── */}
              {(previousShots||[]).map((shot,i) => {
                const pos = getShotXY(shot);
                return <g key={i}>
                  <circle cx={pos.x} cy={pos.y} r="15" fill={theme.accentDim} stroke={theme.accent} strokeWidth="2" opacity="0.85"/>
                  <text x={pos.x} y={pos.y+5} textAnchor="middle" fontSize="11" fill="#FFF" fontWeight="bold">{i+1}</text>
                </g>;
              })}

              {/* ── CURRENT TAP MARKER ── */}
              {tapPos && tapMarkerX !== null && tapMarkerY !== null && !tapPos.isBasket && (
                <g>
                  <line x1={tapMarkerX-24} y1={tapMarkerY} x2={tapMarkerX+24} y2={tapMarkerY} stroke={tapLie.color} strokeWidth="2.5"/>
                  <line x1={tapMarkerX} y1={tapMarkerY-24} x2={tapMarkerX} y2={tapMarkerY+24} stroke={tapLie.color} strokeWidth="2.5"/>
                  <circle cx={tapMarkerX} cy={tapMarkerY} r="18" fill={`${tapLie.color}30`} stroke={tapLie.color} strokeWidth="2.5"/>
                  <text x={tapMarkerX} y={tapMarkerY+5} textAnchor="middle" fontSize="12" fill={tapLie.color} fontWeight="bold">
                    {(previousShots?.length||0)+1}
                  </text>
                  {/* Callout bubble */}
                  <rect x={tapMarkerX-44} y={tapMarkerY-50} width={88} height={26} fill="rgba(0,0,0,0.85)" rx="6"/>
                  <text x={tapMarkerX} y={tapMarkerY-32} textAnchor="middle" fontSize="12" fill={tapLie.color} fontWeight="bold">
                    {tapPos.distRemaining === 0 ? "At basket!" : `${tapPos.distRemaining}ft left`}
                  </text>
                </g>
              )}

              {/* ── TEE ── */}
              <rect x={TEE_X-22} y={TEE_Y+12} width={44} height={20} fill={theme.accentDim} rx="5"/>
              <text x={TEE_X} y={TEE_Y+26} textAnchor="middle" fontSize="9" fill={theme.accent} fontWeight="bold">TEE</text>

              {/* ── BASKET — tappable, pulses ── */}
              <circle cx={BASKET_X} cy={BASKET_Y} r="28" fill="rgba(61,255,122,0.06)" stroke="rgba(61,255,122,0.2)" strokeWidth="1.5"/>
              <circle cx={BASKET_X} cy={BASKET_Y} r="18" fill="none" stroke={theme.accent} strokeWidth="3"/>
              <circle cx={BASKET_X} cy={BASKET_Y} r="7"  fill={theme.accent}/>
              <text x={BASKET_X} y={BASKET_Y-30} textAnchor="middle" fontSize="16">⛳</text>
              <text x={BASKET_X} y={BASKET_Y+36} textAnchor="middle" fontSize="10" fill={theme.accent}>TAP TO FINISH</text>

              {/* Basket tap highlight */}
              {tapPos?.isBasket && (
                <circle cx={BASKET_X} cy={BASKET_Y} r="30" fill="rgba(61,255,122,0.25)" stroke={theme.accent} strokeWidth="3"/>
              )}

              {/* ── INSTRUCTION ── */}
              {!tapPos && (
                <text x={W/2} y={H/2+10} textAnchor="middle" fontSize="15" fill="rgba(255,255,255,0.2)">
                  Tap where disc landed
                </text>
              )}
            </svg>
          </div>

          {/* ── BOTTOM CONFIRM BAR ── */}
          {tapPos ? (
            <div style={{ padding: "14px 16px", background: "#0A0F0D", borderTop: `1px solid ${theme.border}`, flexShrink: 0 }}>
              {/* Lie indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ flex: 1, padding: "10px 14px", background: `${tapLie.color}18`, border: `1px solid ${tapLie.color}55`, borderRadius: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: tapLie.color }}>{tapLie.label}</div>
                  <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>
                    {tapPos.isBasket ? "Hole complete!" : `${tapPos.distFromTee}ft thrown · ${tapPos.position} · ${tapPos.distRemaining}ft left`}
                  </div>
                </div>
                <div onClick={() => setTapPos(null)} style={{ padding: "10px 14px", background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: "10px", fontSize: "12px", color: theme.textMuted, cursor: "pointer" }}>
                  Re-tap
                </div>
              </div>
              <div
                onClick={() => onLog({ distFromTee: tapPos.distFromTee, distRemaining: tapPos.distRemaining, position: tapPos.position, lie: tapPos.lie })}
                style={{ background: tapPos.isBasket ? theme.accent : theme.accent, color: "#000", borderRadius: "12px", padding: "15px", textAlign: "center", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}
              >
                {tapPos.isBasket ? "🎯 Finish Hole!" : "Confirm Shot →"}
              </div>
            </div>
          ) : (
            <div style={{ padding: "10px 16px", background: "#0A0F0D", borderTop: `1px solid ${theme.border}`, flexShrink: 0, textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: theme.textMuted }}>Tap fairway · trees · rough · OB · or basket ⛳ to finish hole</span>
            </div>
          )}
        </>
      ) : (
        /* Slider mode fallback */
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: theme.textMuted }}>Distance thrown</span>
              <span style={{ fontSize: "24px", fontWeight: "700", color: theme.accent, fontFamily: "'DM Sans',sans-serif" }}>{sliderDist}ft</span>
            </div>
            <input type="range" min={10} max={remainingDist} step={5} value={sliderDist}
              onChange={e => setSliderDist(Number(e.target.value))}
              style={{ width: "100%", accentColor: theme.accent, height: "10px" }}/>
            <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
              {[0.25,0.5,0.75,1.0].map(pct => {
                const d = Math.round(remainingDist*pct);
                const active = Math.abs(sliderDist-d)<15;
                return <div key={pct} onClick={()=>setSliderDist(d)} style={{ flex:1, textAlign:"center", padding:"10px 4px", background:active?theme.accentGlow:theme.surfaceAlt, border:`1px solid ${active?theme.accentDim:theme.border}`, borderRadius:"8px", cursor:"pointer", fontSize:"11px", color:active?theme.accent:theme.textMuted }}>
                  {pct===1.0 ? "All" : `${d}ft`}
                </div>;
              })}
            </div>
          </div>
          <div style={{ background:theme.accentGlow, border:`1px solid ${theme.accentDim}`, borderRadius:"10px", padding:"14px 16px", marginBottom:"16px", display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:"12px", color:theme.textMuted }}>Remaining</span>
            <span style={{ fontSize:"22px", fontWeight:"700", color:theme.accent, fontFamily:"'DM Sans',sans-serif" }}>{sliderRemaining}ft</span>
          </div>
          <div style={{ marginBottom:"16px" }}>
            <div style={{ fontSize:"11px", color:theme.textMuted, marginBottom:"10px", letterSpacing:"0.1em", textTransform:"uppercase" }}>Landing position</div>
            <div style={{ display:"flex", gap:"8px" }}>
              {[{key:"left",label:"Left",icon:"⬅️"},{key:"center",label:"Center",icon:"⬆️"},{key:"right",label:"Right",icon:"➡️"}].map(p => (
                <div key={p.key} onClick={()=>setSliderPos(p.key)} style={{ flex:1, padding:"14px 8px", textAlign:"center", background:sliderPos===p.key?theme.accentGlow:theme.surfaceAlt, border:`1px solid ${sliderPos===p.key?theme.accentDim:theme.border}`, borderRadius:"12px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
                  <div style={{ fontSize:"22px" }}>{p.icon}</div>
                  <div style={{ fontSize:"11px", color:sliderPos===p.key?theme.accent:theme.textMuted, fontWeight:"600" }}>{p.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div onClick={()=>onLog({distFromTee:sliderDist,distRemaining:sliderRemaining,position:sliderPos,lie:"fairway"})} style={{ background:theme.accent, color:"#000", borderRadius:"12px", padding:"16px", textAlign:"center", fontSize:"14px", fontWeight:"700", cursor:"pointer", fontFamily:"'DM Mono',monospace", textTransform:"uppercase" }}>
            Confirm Shot →
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Disc Picker ──────────────────────────────────────────────────────────────
function DiscPicker({ bag, selected, onSelect, onCancel }) {
  const byType = DISC_TYPES.map(t => ({ ...t, discs: bag.filter(d => d.type === t.key) }));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: theme.surface, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: "430px", margin: "0 auto", padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
        <div style={{ ...s.slabel, marginBottom: "16px" }}>Choose a Different Disc</div>
        {byType.map(type => type.discs.length > 0 && (
          <div key={type.key} style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "10px", color: theme.textMuted, marginBottom: "6px" }}>{type.icon} {type.label}</div>
            {type.discs.map(disc => {
              const stab = getStability(disc.turn, disc.fade);
              const isSelected = selected?.id === disc.id;
              return (
                <div key={disc.id} onClick={() => onSelect(disc)} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", marginBottom: "6px",
                  background: isSelected ? theme.accentGlow : theme.surfaceAlt,
                  border: `1px solid ${isSelected ? theme.accentDim : theme.border}`,
                  borderRadius: "10px", cursor: "pointer",
                }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: theme.text }}>{disc.name}</div>
                    <div style={{ fontSize: "11px", color: theme.textMuted }}>{disc.brand} · {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}</div>
                  </div>
                  <span style={{ fontSize: "10px", color: stab.color, background: `${stab.color}22`, border: `1px solid ${stab.color}44`, borderRadius: "6px", padding: "2px 8px" }}>{stab.label}</span>
                </div>
              );
            })}
          </div>
        ))}
        <button style={{ ...s.btnOut, marginTop: "8px" }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Voice Input Hook ─────────────────────────────────────────────────────────
function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        onResult(transcript);
        setListening(false);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recRef.current = rec;
    }
  }, []);

  const startListening = () => {
    if (recRef.current && !listening) {
      try {
        recRef.current.start();
        setListening(true);
      } catch (err) {
        // Ignore "already started" errors
        setListening(false);
      }
    }
  };

  return { listening, supported, startListening };
}

// ─── AI Recommender ───────────────────────────────────────────────────────────
function useRecommender() {
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecommendation = async ({ hole, bag, settings, remainingDist, wind, lie, lastShots, position }) => {
    if (!bag || bag.length === 0) {
      setRec({ disc: null, throwType: null, reason: "Add discs to your bag to get recommendations.", confidence: "low" });
      return;
    }

    setLoading(true);
    setError(null);
    setRec(null);

    const dominantHand = settings?.dominantHand === "left" ? "LHBH (left hand backhand — discs fade RIGHT)" : "RHBH (right hand backhand — discs fade LEFT)";
    const skillLevel = settings?.skillLevel || "intermediate";
    const driverDist = settings?.driverDistance || "200to300";

    const bagDesc = bag.map(d => {
      const stab = (() => {
        if (d.turn <= -3 && d.fade <= 1) return "Flippy";
        if (d.turn <= -2 && d.fade <= 2) return "Understable";
        if (d.fade >= 3 && d.turn >= -1) return "Overstable";
        if ((d.fade - d.turn) >= 4) return "Overstable";
        return "Neutral";
      })();
      return `${d.name} (${d.brand}, ${d.type.replace("_"," ")}, ${d.speed}/${d.glide}/${d.turn}/${d.fade}, ${stab}${d.plastic ? ", "+d.plastic : ""})`;
    }).join("\n");

    const lastShotsDesc = lastShots?.length > 0
      ? lastShots.slice(-3).map(s => `Shot ${s.shotNumber}: ${s.discName}, ${s.distFromTee}ft, landed ${s.position}, ${s.lie}`).join("\n")
      : "No shots yet this hole — tee shot";

    const preferredDisc = settings?._preferredDisc;
    const prompt = `You are Chain Hound, an expert disc golf caddy AI. Give a disc recommendation for this exact situation.
${preferredDisc ? `IMPORTANT: The player has manually selected the ${preferredDisc} for this shot. Give your best advice FOR THIS SPECIFIC DISC — throw type, release angle, and why it works (or a warning if it's a poor choice). Do NOT suggest a different disc.` : ""}

PLAYER PROFILE:
- Dominant hand: ${dominantHand}
- Skill level: ${skillLevel}
- Typical driver distance: ${driverDist.replace("to","–").replace("under","Under ").replace("over","")}ft

CURRENT HOLE:
- Hole ${hole.number}, Par ${hole.par}
- Total distance: ${hole.distance}ft
- Remaining distance to basket: ${remainingDist}ft
- Hole shape: ${hole.shape || "straight"}
- Hazards: ${hole.hazards || "none noted"}
- Hole notes: ${hole.notes || "none"}

CURRENT CONDITIONS:
- Wind: ${wind || "none"}
- Current lie: ${lie || "tee"}
- Landing position: ${position || "center"}

RECENT SHOTS THIS HOLE:
${lastShotsDesc}

PLAYER'S BAG (choose ONLY from these discs):
${bagDesc}

THROW TYPES AVAILABLE:
- Backhand: most common, fades based on dominant hand direction above
- Forehand: finishes OPPOSITE direction to backhand — good for shaping away from trouble
- Tomahawk: overhand, clears obstacles, steep drop, use overstable disc only
- Thumber: overhand, opposite finish to tomahawk, use overstable disc only
- Roller: low ceiling situations, runs along ground

INSTRUCTIONS:
1. Pick the single best disc from the bag above for this exact situation
2. Pick the best throw type
3. Give a 1-2 sentence plain English reason that a recreational player would understand
4. Consider: remaining distance, hazards, wind, lie, hole shape, player's dominant hand fade direction, disc stability
5. For short shots under 150ft always recommend a putter or midrange — never a driver
6. For wooded tight gaps recommend straight/neutral flight discs
7. Be specific about WHY this disc over the others

${(!hole.hazards || hole.hazards === "" || hole.hazards === "none noted") ? `
NOTE: Limited hazard data for this hole. Be conservative with recommendations and mention uncertainty.
` : ""}
${remainingDist <= 60 ? `
PUTTING MODE — Player is within putting range (${remainingDist}ft):
- Disc selection is obvious (putter) — focus your advice on EXECUTION
- Specify: release angle (flat/slight hyzer/slight anhyzer)
- Specify: power (soft touch / medium / firm push putt)  
- Specify: where to aim on the basket (center chains / low chains / back of basket)
- Account for wind effect on short putts
- Example: "Soft touch putt, slight hyzer angle, aim center chains. The ${wind} wind won't affect much at this distance."
` : `
RELEASE ANGLE GUIDANCE — Always include one of these:
- Hyzer: release edge high — disc fades harder, more reliable, fights headwind
- Flat: standard release — disc flies as designed
- Anhyzer: release edge low — disc turns/glides more, extra distance, curves away from fade
When to use each:
- Hyzer: overstable disc + headwind + need reliable fade + tight gap left
- Anhyzer: understable disc + tailwind + need extra distance + curve right (RHBH)  
- Flat: neutral conditions, straight shot, calm wind
`}

Respond with ONLY this JSON, no other text:
{"disc":"exact disc name from bag","throwType":"Backhand or Forehand or Tomahawk or Thumber or Roller","releaseAngle":"Flat or Hyzer or Anhyzer","reason":"plain English 1-2 sentence reason including release angle advice","confidence":"high or medium or low","alternative":"name of second best disc from bag","puttingTip":"only if within 60ft — specific aim and power advice"}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!response.ok) {
        const t = await response.text();
        throw new Error(`API ${response.status}: ${t.slice(0,100)}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || data.error.type);

      const text = (data.content || []).find(b => b.type === "text")?.text || "";
      const a = text.indexOf("{");
      const b2 = text.lastIndexOf("}");
      if (a === -1 || b2 === -1) throw new Error("No JSON in response");

      const result = JSON.parse(text.slice(a, b2 + 1));

      // Validate disc is actually in bag
      const discInBag = bag.find(d => d.name.toLowerCase() === result.disc?.toLowerCase());
      if (!discInBag) {
        // Fallback to first disc if AI hallucinated a disc not in bag
        result.disc = bag[0]?.name;
        result.reason = "(AI suggested a disc not in your bag — defaulting to first disc. Add more discs for better recommendations.) " + result.reason;
        result.confidence = "low";
      }

      setRec(result);
    } catch (err) {
      // Demo mode fallback when API is blocked by iframe
      const preferredDiscName = settings?._preferredDisc;
      const isLong = remainingDist > 300;
      const hazardWords = (hole?.hazards || "").split(" ").filter(Boolean);
      const hasWoodsRight = hazardWords.includes("trees_right") || hazardWords.includes("trees_both_sides") || hazardWords.includes("tight");
      const hasWoodsLeft = hazardWords.includes("trees_left") || hazardWords.includes("trees_both_sides");
      const hasOBRight = hazardWords.some(h => h.startsWith("ob_right"));
      const hasOBLeft = hazardWords.includes("ob_left") || hazardWords.includes("water_left_ob");

      let fallbackDisc, fallbackThrow, fallbackReason, releaseAngle;

      // If player swapped to a specific disc, give advice FOR that disc
      if (preferredDiscName) {
        fallbackDisc = bag.find(d => d.name === preferredDiscName) || bag[0];
        const stab = getStability(fallbackDisc.turn, fallbackDisc.fade);
        fallbackThrow = "Backhand";
        releaseAngle = stab.label === "Overstable" ? "Hyzer" : stab.label === "Understable" ? "Flat" : "Flat";
        if (hasWoodsRight && stab.label === "Overstable") {
          fallbackReason = `Good choice for this hole — the ${fallbackDisc.name} is ${stab.label.toLowerCase()} and will fade left (RHBH), away from the woods right. Throw ${releaseAngle} for a reliable predictable finish.`;
        } else if (hasWoodsRight && stab.label !== "Overstable") {
          fallbackReason = `The ${fallbackDisc.name} is ${stab.label.toLowerCase()} — be careful with woods right. It may turn right instead of fading left. Consider throwing hyzer to fight the understability.`;
          releaseAngle = "Hyzer";
        } else if (remainingDist <= 150) {
          fallbackReason = `${remainingDist}ft — the ${fallbackDisc.name} will work here. Soft smooth release, aim straight at the basket, let the disc do the work.`;
        } else {
          fallbackReason = `Throwing your ${fallbackDisc.name} (${stab.label}) for ${remainingDist}ft. ${stab.label === "Overstable" ? "Expect a left finish (RHBH) — aim right of target." : stab.label === "Understable" ? "Expect some right turn — let it work." : "Neutral flight — aim straight at target."}`;
        }
      } else if (remainingDist <= 60) {
        fallbackDisc = bag.find(d => d.type === "putter") || bag[0];
        fallbackThrow = "Backhand";
        releaseAngle = "Flat";
        fallbackReason = `${remainingDist}ft — putting range. Smooth soft putt, slight hyzer for reliability. Aim center chains.`;
      } else if (remainingDist <= 150) {
        fallbackDisc = bag.find(d => d.type === "putter") || bag[0];
        fallbackThrow = "Backhand";
        releaseAngle = "Flat";
        fallbackReason = `${remainingDist}ft — putter distance. More control than any other disc at this range. Flat release, trust the disc.`;
      } else if (remainingDist <= 250) {
        fallbackDisc = bag.find(d => d.type === "midrange") || bag[0];
        fallbackThrow = "Backhand";
        releaseAngle = "Flat";
        fallbackReason = `${remainingDist}ft — midrange distance. Better control than a driver. Aim ${hasWoodsRight ? "center-left, away from trees right" : hasOBRight ? "left of center, OB right" : "center fairway"}.`;
      } else if (hazardWords.includes("tight") || (hasWoodsRight && hasWoodsLeft)) {
        fallbackDisc = bag.find(d => { const s = getStability(d.turn, d.fade); return s.label === "Neutral" && (d.type === "midrange" || d.type === "fairway_driver"); }) || bag.find(d => d.type === "midrange") || bag[0];
        fallbackThrow = "Backhand";
        releaseAngle = "Flat";
        fallbackReason = `Tight wooded tunnel — straight neutral disc essential. No room to work either side. Flat release straight down the middle.`;
      } else if (hasWoodsRight || hasOBRight) {
        fallbackDisc = bag.find(d => { const s = getStability(d.turn, d.fade); return s.label === "Overstable" && (d.type === "fairway_driver" || d.type === "distance_driver"); }) || bag[0];
        fallbackThrow = "Backhand";
        releaseAngle = "Hyzer";
        const stab = getStability(fallbackDisc.turn, fallbackDisc.fade);
        fallbackReason = `${remainingDist}ft — ${hasOBRight ? "OB right" : "trees right"}. Throw ${fallbackDisc.name} (${stab.label}) on a hyzer angle — it will fade left (RHBH) away from trouble.`;
      } else if (hasWoodsLeft || hasOBLeft) {
        fallbackDisc = bag.find(d => { const s = getStability(d.turn, d.fade); return (s.label === "Understable" || s.label === "Neutral") && (d.type === "fairway_driver" || d.type === "distance_driver"); }) || bag[0];
        fallbackThrow = "Forehand";
        releaseAngle = "Flat";
        const stab = getStability(fallbackDisc.turn, fallbackDisc.fade);
        fallbackReason = `${remainingDist}ft — ${hasOBLeft ? "OB left" : "trees left"}. Forehand with ${fallbackDisc.name} finishes right (RHBH), away from the trouble left.`;
      } else {
        fallbackDisc = bag.find(d => d.type === "fairway_driver" || d.type === "distance_driver") || bag[0];
        fallbackThrow = "Backhand";
        releaseAngle = "Flat";
        fallbackReason = `${remainingDist}ft open fairway. Good distance driver hole. Smooth release, flat angle, let the disc work.`;
      }

      setRec({
        disc: fallbackDisc?.name || bag[0]?.name,
        throwType: fallbackThrow,
        releaseAngle: releaseAngle || "Flat",
        reason: fallbackReason,
        confidence: preferredDiscName ? "high" : "medium",
        alternative: bag.find(d => d.id !== fallbackDisc?.id && d.type === fallbackDisc?.type)?.name,
        isDemo: true,
      });
    }
    setLoading(false);
  };

  return { rec, loading, error, getRecommendation, setRec };
}

// ─── Recommendation Card ──────────────────────────────────────────────────────
// ─── Throw type info popup ────────────────────────────────────────────────────
const THROW_INFO = {
  Backhand: {
    icon: "🔄",
    title: "Backhand",
    how: "Grip disc in palm, pull across your body left to right (RHBH).",
    result: "Most common throw. Disc fades LEFT at the end for RHBH.",
    when: "Your default throw — highest control and distance for most players."
  },
  Forehand: {
    icon: "↩️",
    title: "Forehand (Sidearm)",
    how: "Two fingers under disc, throw like skipping a stone.",
    result: "Disc fades RIGHT for RHBH — opposite of backhand.",
    when: "Use when trouble is on the LEFT — disc finishes away from it."
  },
  Tomahawk: {
    icon: "🪓",
    title: "Tomahawk (Overhand)",
    how: "Hold disc vertically, throw overhead like a tomahawk chop.",
    result: "Disc flips and drops steeply. Clears tall obstacles.",
    when: "Use only when you need to get over something — trees, hills."
  },
  Thumber: {
    icon: "👍",
    title: "Thumber (Overhand)",
    how: "Thumb on top of disc, throw overhead with thumb leading.",
    result: "Similar to tomahawk but curves opposite direction.",
    when: "Alternative to tomahawk for clearing obstacles."
  },
  Roller: {
    icon: "🎳",
    title: "Roller",
    how: "Release disc at steep angle so it rolls on its edge along ground.",
    result: "Disc rolls instead of flies — gets under low branches.",
    when: "Use in heavily wooded areas when air space is blocked."
  },
};

const RELEASE_INFO = {
  Hyzer: {
    color: "#FF7A3D",
    bg: "rgba(255,122,61,0.15)",
    border: "rgba(255,122,61,0.3)",
    icon: "↘️",
    how: "Tilt the top edge of the disc DOWN toward the ground on release.",
    result: "Disc fades harder and more reliably. Fights headwind.",
    when: "Use when you need a predictable left finish (RHBH) or in wind."
  },
  Anhyzer: {
    color: "#60BFFF",
    bg: "rgba(96,191,255,0.15)",
    border: "rgba(96,191,255,0.3)",
    icon: "↗️",
    how: "Tilt the top edge of the disc UP away from the ground on release.",
    result: "Disc turns and glides more. Extra distance. Curves right (RHBH).",
    when: "Use for extra distance or when you need to curve right."
  },
  Flat: {
    color: "#00FF77",
    bg: "rgba(0,255,119,0.1)",
    border: "rgba(0,255,119,0.2)",
    icon: "➡️",
    how: "Keep disc level and parallel to the ground on release.",
    result: "Standard neutral flight. Disc flies its natural path.",
    when: "Your default release — use when no special shaping is needed."
  },
};

const POWER_INFO = {
  100: { label: "Full Power", color: "#FF4455", desc: "Everything you've got. Max distance." },
  75:  { label: "75% Power",  color: "#FFD000", desc: "Strong controlled throw. Most accuracy." },
  50:  { label: "50% Power",  color: "#00FF77", desc: "Medium smooth throw. High accuracy." },
  25:  { label: "25% Power",  color: "#60BFFF", desc: "Touch shot. For short precise throws." },
};

function InfoPopup({ title, lines, learnMoreUrl, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{ background: "#1A3320", border: "2px solid #00CC60", borderRadius: "20px 20px 0 0", padding: "24px", width: "100%", maxWidth: "430px" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "20px", fontWeight: "800", color: "#00FF77", fontFamily: "'DM Sans',sans-serif" }}>{title}</div>
          <div onClick={onClose} style={{ fontSize: "20px", color: "#4A7A55", cursor: "pointer", padding: "4px 8px" }}>✕</div>
        </div>
        {/* Content */}
        {lines.map((line, i) => (
          <div key={i} style={{ marginBottom: "14px", padding: "10px 14px", background: "#162B1A", borderRadius: "10px" }}>
            <div style={{ fontSize: "10px", color: "#9ECBA8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px", fontWeight: "600" }}>{line.label}</div>
            <div style={{ fontSize: "14px", color: "#FFFFFF", lineHeight: 1.6 }}>{line.text}</div>
          </div>
        ))}
        {/* Learn More — future instructor/training partner link */}
        <a
          href={learnMoreUrl || "https://www.pdga.com/knowledge-base/how-to-play"}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", width: "100%", padding: "14px", background: "transparent", color: "#00FF77", border: "2px solid #00CC60", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", marginBottom: "10px", textAlign: "center", textDecoration: "none", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", boxSizing: "border-box" }}
        >
          📚 Learn More — Disc Golf Academy
        </a>
        <button onClick={onClose} style={{ width: "100%", padding: "14px", background: "#00FF77", color: "#000", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          Got It ✓
        </button>
      </div>
    </div>
  );
}

function RecommendationCard({ rec, loading, bag, onConfirm, onSwap, onThrowTypeChange, onFeedback }) {
  const [selectedThrow, setSelectedThrow] = useState(rec?.throwType || "Backhand");
  const [throwPopup, setThrowPopup] = useState(null);
  const [releasePopup, setReleasePopup] = useState(null);

  const handleThrowChange = (throwType) => {
    setSelectedThrow(throwType);
    onThrowTypeChange && onThrowTypeChange(throwType);
  };

  if (loading) return (
    <div style={{ background: "#162B1A", border: "2px solid #00CC60", borderRadius: "20px", padding: "28px 20px", marginBottom: "16px", textAlign: "center" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>🐕</div>
      <div style={{ fontSize: "16px", fontWeight: "700", fontFamily: "'DM Sans',sans-serif", color: "#FFFFFF", marginBottom: "6px" }}>Chain Hound is thinking...</div>
      <div style={{ fontSize: "13px", color: "#9ECBA8", marginBottom: "20px" }}>Analyzing your bag and hole</div>
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        {[0,1,2].map(i => <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#00FF77", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.2;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  );

  if (!rec) return null;

  const discInBag = bag.find(d => d.name === rec.disc);
  const altDisc = bag.find(d => d.name === rec.alternative);
  const stab = discInBag ? getStability(discInBag.turn, discInBag.fade) : null;
  const displayThrow = selectedThrow || rec?.throwType;
  const releaseInfo = RELEASE_INFO[rec.releaseAngle] || RELEASE_INFO.Flat;
  const throwInfo = THROW_INFO[displayThrow];
  const power = rec.power || 75;
  const powerInfo = POWER_INFO[power] || POWER_INFO[75];
  const THROW_TYPES = ["Backhand", "Forehand", "Tomahawk", "Thumber", "Roller"];

  return (
    <>
      {/* Throw type info popup */}
      {throwPopup && (
        <InfoPopup
          title={`${THROW_INFO[throwPopup].icon} ${THROW_INFO[throwPopup].title}`}
          lines={[
            { label: "How to throw", text: THROW_INFO[throwPopup].how },
            { label: "What it does", text: THROW_INFO[throwPopup].result },
            { label: "When to use it", text: THROW_INFO[throwPopup].when },
          ]}
          onClose={() => setThrowPopup(null)}
        />
      )}

      {/* Release angle info popup */}
      {releasePopup && (
        <InfoPopup
          title={`${RELEASE_INFO[releasePopup].icon} ${releasePopup} Release`}
          lines={[
            { label: "How to do it", text: RELEASE_INFO[releasePopup].how },
            { label: "What happens", text: RELEASE_INFO[releasePopup].result },
            { label: "When to use it", text: RELEASE_INFO[releasePopup].when },
          ]}
          onClose={() => setReleasePopup(null)}
        />
      )}

      <div style={{ background: "#162B1A", border: "2px solid #00CC60", borderRadius: "20px", padding: "0", marginBottom: "16px", overflow: "hidden" }}>

        {/* ── CADDIE HEADER BANNER ── */}
        <div style={{ background: "#00FF77", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "22px" }}>🐕</span>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "#000", letterSpacing: "0.05em", fontFamily: "'DM Sans',sans-serif" }}>CHAIN HOUND SAYS</span>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {rec.isDemo && <span style={{ fontSize: "9px", color: "#000", background: "rgba(0,0,0,0.2)", borderRadius: "4px", padding: "2px 6px", fontWeight: "700" }}>DEMO</span>}
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#000", background: "rgba(0,0,0,0.15)", borderRadius: "6px", padding: "2px 8px" }}>
              {rec.confidence === "high" ? "✓ Confident" : rec.confidence === "medium" ? "~ Good Guess" : "? Uncertain"}
            </span>
          </div>
        </div>

        <div style={{ padding: "20px" }}>

          {/* ── HERO: THROW THIS DISC ── */}
          <div style={{ background: "rgba(0,255,119,0.12)", border: "2px solid #00FF77", borderRadius: "16px", padding: "18px", marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", color: "#00FF77", letterSpacing: "0.15em", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>🥏 Throw This Disc</div>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "#FFFFFF", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.1, marginBottom: "6px" }}>{rec.disc}</div>
            {discInBag && (
              <div style={{ fontSize: "12px", color: "#9ECBA8", marginBottom: "8px" }}>
                {discInBag.brand} · {discInBag.speed}/{discInBag.glide}/{discInBag.turn}/{discInBag.fade}
                {stab && <span style={{ marginLeft: "8px", fontSize: "10px", color: stab.color, background: `${stab.color}22`, border: `1px solid ${stab.color}44`, borderRadius: "4px", padding: "1px 6px", fontWeight: "700" }}>{stab.label}</span>}
              </div>
            )}
            {/* Power badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: `${powerInfo.color}22`, border: `1px solid ${powerInfo.color}55`, borderRadius: "8px", padding: "4px 10px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: powerInfo.color }}>{powerInfo.label}</span>
              <span style={{ fontSize: "10px", color: "#9ECBA8" }}>{powerInfo.desc}</span>
            </div>
          </div>

          {/* ── HOW TO THROW — Throw type + Release ── */}
          <div style={{ background: "#1E3822", border: "1px solid #2A5C34", borderRadius: "14px", padding: "14px", marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", color: "#9ECBA8", letterSpacing: "0.12em", fontWeight: "600", textTransform: "uppercase", marginBottom: "10px" }}>How to Throw</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {/* Throw type */}
              <div onClick={() => setThrowPopup(displayThrow)} style={{ flex: 1, background: "#162B1A", border: "1px solid #00CC60", borderRadius: "10px", padding: "10px 12px", cursor: "pointer", position: "relative" }}>
                <div style={{ position: "absolute", top: "8px", right: "8px", width: "18px", height: "18px", borderRadius: "50%", background: "rgba(0,255,119,0.2)", border: "1px solid #00CC60", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#00FF77", fontWeight: "700" }}>?</div>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{throwInfo?.icon}</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#00FF77" }}>{displayThrow}</div>
              </div>
              {/* Release angle */}
              {rec.releaseAngle && (
                <div onClick={() => setReleasePopup(rec.releaseAngle)} style={{ flex: 1, background: "#162B1A", border: `1px solid ${releaseInfo.border}`, borderRadius: "10px", padding: "10px 12px", cursor: "pointer", position: "relative" }}>
                  <div style={{ position: "absolute", top: "8px", right: "8px", width: "18px", height: "18px", borderRadius: "50%", background: `${releaseInfo.color}22`, border: `1px solid ${releaseInfo.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: releaseInfo.color, fontWeight: "700" }}>?</div>
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>{releaseInfo.icon}</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: releaseInfo.color }}>{rec.releaseAngle}</div>
                </div>
              )}
            </div>
            {displayThrow !== rec?.throwType && (
              <div style={{ fontSize: "10px", color: "#FFD000", marginTop: "8px" }}>⚠️ Changed from AI suggestion ({rec?.throwType})</div>
            )}
          </div>

          {/* ── CADDIE REASON ── */}
          <div style={{ background: "#1A3320", border: "1px solid #2A5C34", borderRadius: "12px", padding: "14px", marginBottom: "14px" }}>
            <div style={{ fontSize: "10px", color: "#9ECBA8", letterSpacing: "0.12em", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>📋 Why This Shot</div>
            <div style={{ fontSize: "13px", color: "#FFFFFF", lineHeight: 1.7 }}>{rec.reason}</div>
          </div>

          {/* ── PUTTING TIP ── */}
          {rec.puttingTip && (
            <div style={{ background: "rgba(0,255,119,0.08)", border: "1px solid #00CC60", borderRadius: "12px", padding: "14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "10px", color: "#00FF77", fontWeight: "700", letterSpacing: "0.1em", marginBottom: "6px" }}>🎯 PUTTING ADVICE</div>
              <div style={{ fontSize: "13px", color: "#FFFFFF", lineHeight: 1.7 }}>{rec.puttingTip}</div>
            </div>
          )}

          {/* ── THROW TYPE SELECTOR ── */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "10px", color: "#9ECBA8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Change Throw Type</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {THROW_TYPES.map(tt => {
                const active = displayThrow === tt;
                return (
                  <div key={tt} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div onClick={() => handleThrowChange(tt)} style={{
                      padding: "8px 12px",
                      background: active ? "#00FF77" : "transparent",
                      border: `2px solid ${active ? "#00FF77" : "#2A5C34"}`,
                      borderRadius: "8px", cursor: "pointer",
                      fontSize: "12px", fontWeight: "700",
                      color: active ? "#000" : "#9ECBA8",
                      display: "flex", alignItems: "center", gap: "4px",
                    }}>
                      <span>{THROW_INFO[tt]?.icon}</span> {tt}
                    </div>
                    <div onClick={() => setThrowPopup(tt)} style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(0,255,119,0.15)", border: "1px solid #2A5C34", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#9ECBA8", cursor: "pointer", fontWeight: "700", flexShrink: 0 }}>?</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── ALTERNATIVE DISC ── */}
          {altDisc && (
            <div style={{ fontSize: "12px", color: "#9ECBA8", marginBottom: "14px", padding: "8px 12px", background: "#1E3822", borderRadius: "8px" }}>
              Also consider: <span style={{ color: "#00FF77", fontWeight: "700" }}>{rec.alternative}</span>
            </div>
          )}

          {/* ── FEEDBACK ── */}
          {onFeedback && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#9ECBA8" }}>Was this helpful?</span>
              <button onClick={() => onFeedback("good")} style={{ background: "rgba(0,255,119,0.15)", border: "1px solid #00CC60", borderRadius: "8px", padding: "6px 14px", fontSize: "16px", cursor: "pointer" }}>👍</button>
              <button onClick={() => onFeedback("bad")} style={{ background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.3)", borderRadius: "8px", padding: "6px 14px", fontSize: "16px", cursor: "pointer" }}>👎</button>
            </div>
          )}

          {/* ── AFFILIATE ── */}
          {rec.disc && !discInBag && (
            <div style={{ marginBottom: "14px", padding: "12px 14px", background: "rgba(255,184,48,0.1)", border: "1px solid rgba(255,184,48,0.35)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#9ECBA8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Not in your bag</div>
                <div style={{ fontSize: "13px", color: "#FFD000", fontWeight: "700" }}>{rec.disc}</div>
              </div>
              <a href={`https://infinitediscs.com/search?q=${encodeURIComponent(rec.disc)}`} target="_blank" rel="noopener noreferrer"
                style={{ padding: "10px 16px", background: "#FFD000", color: "#000", borderRadius: "10px", fontSize: "12px", fontWeight: "800", textDecoration: "none", whiteSpace: "nowrap" }}>
                Buy It →
              </a>
            </div>
          )}

          {/* ── CONFIRM BUTTON ── */}
          <button onClick={() => onConfirm(discInBag || bag[0], displayThrow)} style={{
            width: "100%", background: "#00FF77", color: "#000", border: "none",
            borderRadius: "14px", padding: "18px", fontSize: "16px", fontWeight: "800",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            marginBottom: "10px",
          }}>
            ✓ Throw {rec.disc} — {displayThrow}
          </button>

          <button onClick={onSwap} style={{
            width: "100%", background: "transparent", color: "#00FF77",
            border: "2px solid #00CC60", borderRadius: "14px",
            padding: "14px", fontSize: "13px", fontWeight: "700",
            cursor: "pointer", fontFamily: "'DM Mono',monospace", textTransform: "uppercase",
          }}>
            🔄 Throw a Different Disc
          </button>

        </div>
      </div>
    </>
  );
}

const styles_rec = {
  card: {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "16px",
  }
};

// ─── Active Round — Hole Screen ───────────────────────────────────────────────
function HoleScreen({ round, setRound, course, courses, saveCourses, bag, settings, onEndRound }) {
  const hole = course.holes?.find(h => h.number === round.currentHole) || { number: round.currentHole, distance: 300, par: 3, shape: "straight" };
  const holeShots = round.shots.filter(s => s.hole === round.currentHole);
  const shotCount = holeShots.length;
  const lastShot = holeShots[holeShots.length - 1];
  const remainingDist = lastShot ? lastShot.remaining : hole.distance;

  const [phase, setPhase] = useState("where_are_you"); // where_are_you | recommend | tee | log_shot | lie_wind | complete
  const [tapPos, setTapPos] = useState(null);
  const [pendingShot, setPendingShot] = useState(null);
  const [selectedDisc, setSelectedDisc] = useState(bag[0] || null);
  const [showDiscPicker, setShowDiscPicker] = useState(false);
  const [wind, setWind] = useState("none");
  const [windSet, setWindSet] = useState(false);
  const [penalty, setPenalty] = useState(0);

  // AI Recommender
  const { rec, loading: recLoading, getRecommendation, setRec } = useRecommender();
  const isSwapping = useRef(false); // prevents useEffect from double-firing on swap

  const fireRecommendation = useCallback((overrideRemaining, overrideLie, overridePosition) => {
    getRecommendation({
      hole,
      bag,
      settings,
      remainingDist: overrideRemaining != null ? overrideRemaining : remainingDist,
      wind,
      lie: overrideLie != null ? overrideLie : (lastShot ? lastShot.lie : "tee"),
      lastShots: holeShots,
      position: overridePosition != null ? overridePosition : (lastShot ? lastShot.position : "center"),
    });
  }, [hole, bag, settings, remainingDist, wind, lastShot, holeShots, getRecommendation]);

  // Auto-fire recommendation when phase becomes recommend and wind is set
  // Skip if we're in a swap — swap fires its own recommendation directly
  useEffect(() => {
    if (phase === "recommend" && windSet && !isSwapping.current) {
      fireRecommendation();
    }
  }, [phase, windSet]);

  // Voice input
  const { listening, supported, startListening } = useVoiceInput((transcript) => {
    // Parse voice: "threw 150 fairway headwind"
    const distMatch = transcript.match(/(\d+)/);
    if (distMatch) {
      const dist = parseInt(distMatch[1]);
      const remaining = Math.max(0, (lastShot?.remaining || hole.distance) - dist);
      const pos = transcript.includes("left") ? "left" : transcript.includes("right") ? "right" : "center";
      const lie = transcript.includes("rough") ? "rough" : transcript.includes("tree") ? "trees" : transcript.includes("basket") || transcript.includes("made") ? "basket" : "fairway";
      setPendingShot({ distFromTee: dist, distRemaining: remaining, position: pos });
      logShot({ distFromTee: dist, distRemaining: remaining, position: pos }, lie);
    }
  });

  // Skip where_are_you if no shots yet — go straight to recommend
  useEffect(() => {
    if (shotCount === 0) {
      setPhase("tee");
    }
  }, [round.currentHole]);

  const handleDiagramTap = (tapResult) => {
    setTapPos(tapResult);
    setPendingShot(tapResult);
  };

  const confirmTap = () => {
    if (!pendingShot) return;
    setPhase("lie_wind");
  };

  const logShot = (shotData, lie) => {
    const discUsed = selectedDisc;
    // FIXED: Calculate CUMULATIVE distance from tee for diagram positioning
    // remainingDist = distance still to basket before this shot
    // shotData.distFromTee = how far they threw on THIS shot
    // So cumulative from tee = hole.distance - remainingDist + shotData.distFromTee
    const cumulativeFromTee = Math.min(
      hole.distance,
      Math.max(0, hole.distance - remainingDist + shotData.distFromTee)
    );
    const newShot = {
      hole: round.currentHole,
      shotNumber: shotCount + 1,
      discId: discUsed?.id,
      discName: discUsed?.name,
      distFromTee: cumulativeFromTee,   // cumulative from tee — used by diagram
      distThisShot: shotData.distFromTee, // just this throw — used by stats
      remaining: shotData.distRemaining,
      position: shotData.position,
      lie,
      wind,
      result: lie === "basket" ? "in" : "out",
    };

    const updatedShots = [...round.shots, newShot];
    const updatedRound = { ...round, shots: updatedShots };

    if (lie === "basket") {
      // Hole complete
      const totalThrows = shotCount + 1 + penalty;
      const updatedScores = { ...round.scores, [round.currentHole]: totalThrows };
      const finalRound = { ...updatedRound, scores: updatedScores };
      setRound(finalRound);
      saveActiveRound(finalRound);
      setPhase("complete");
    } else {
      setRound(updatedRound);
      saveActiveRound(updatedRound);
      setPendingShot(null);
      setTapPos(null);
      setRec(null);
      // Fire next recommendation for approach shot
      getRecommendation({
        hole,
        bag,
        settings,
        remainingDist: shotData.distRemaining,
        wind,
        lie,
        lastShots: [...holeShots, newShot],
        position: shotData.position,
      });
      setPhase("recommend");
    }
  };

  const advanceHole = () => {
    const next = round.currentHole + 1;
    const maxHole = course.holes?.length || 18;
    if (next > maxHole) {
      onEndRound();
    } else {
      const updatedRound = { ...round, currentHole: next };
      setRound(updatedRound);
      saveActiveRound(updatedRound);
      setPhase("tee");
      setPendingShot(null);
      setTapPos(null);
      setPenalty(0);
      setWindSet(false);
      setRec(null);
    }
  };

  // Hole shape editor state
  const [editingHole, setEditingHole] = useState(false);
  const [editHoleForm, setEditHoleForm] = useState({});
  const [feedbackToast, setFeedbackToast] = useState(null);

  const HOLE_SHAPES = [
    { key: "straight", label: "Straight", icon: "⬆️" },
    { key: "slight_dogleg_left", label: "Slight Left", icon: "↖️" },
    { key: "dogleg_left", label: "Dogleg Left", icon: "⬅️" },
    { key: "slight_dogleg_right", label: "Slight Right", icon: "↗️" },
    { key: "dogleg_right", label: "Dogleg Right", icon: "➡️" },
  ];

  const HAZARD_OPTIONS = [
    { key: "trees_left", label: "Trees Left", icon: "🌲⬅️" },
    { key: "trees_right", label: "Trees Right", icon: "🌲➡️" },
    { key: "trees_both_sides", label: "Trees Both", icon: "🌲🌲" },
    { key: "water_left_ob", label: "Water Left", icon: "💧⬅️" },
    { key: "ob_right", label: "OB Right", icon: "⚠️➡️" },
    { key: "ob_left", label: "OB Left", icon: "⚠️⬅️" },
    { key: "tight", label: "Tight Gap", icon: "😬" },
  ];

  const saveHoleEdit = () => {
    const updatedHoles = [...(course.holes||[])];
    const idx = updatedHoles.findIndex(h=>h.number===round.currentHole);
    if (idx>=0) {
      updatedHoles[idx] = {...updatedHoles[idx], ...editHoleForm};
    } else {
      updatedHoles.push({number:round.currentHole, par:3, distance:300, ...editHoleForm});
    }
    const updatedCourse = {...course, holes:updatedHoles};
    const allCourses = (courses||[]).map(c=>c.id===course.id?updatedCourse:c);
    if (saveCourses) saveCourses(allCourses);
    setEditingHole(false);
    setEditHoleForm({});
    // Small delay then re-fire recommendation with updated hole data
    setTimeout(() => { setRec(null); fireRecommendation(); }, 100);
  };

  const LIE_OPTIONS = [
    { key: "fairway", label: "Fairway", icon: "✅", color: theme.accent },
    { key: "rough", label: "Rough", icon: "🌿", color: theme.warning },
    { key: "trees", label: "In Trees", icon: "🌲", color: "#4A8C4A" },
    { key: "tight", label: "Tight Gap", icon: "😬", color: "#FF9A3D" },
    { key: "ob", label: "OB", icon: "⚠️", color: theme.error },
    { key: "basket", label: "In Basket!", icon: "🎯", color: theme.accent },
  ];

  const WIND_OPTIONS = [
    { key: "none", label: "No Wind", icon: "😶" },
    { key: "headwind", label: "Headwind", icon: "🌬️⬆️" },
    { key: "tailwind", label: "Tailwind", icon: "🌬️⬇️" },
    { key: "crosswind_left", label: "Cross Left", icon: "🌬️⬅️" },
    { key: "crosswind_right", label: "Cross Right", icon: "🌬️➡️" },
  ];

  // ── Where are you? ──
  if (phase === "where_are_you") return (
    <div style={s.content}>
      <div style={{ ...s.cardAccent, textAlign: "center", padding: "28px 20px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>📍</div>
        <div style={{ fontSize: "16px", fontWeight: "700", fontFamily: "'DM Sans',sans-serif", marginBottom: "8px" }}>
          Where are you on Hole {round.currentHole}?
        </div>
        <div style={{ fontSize: "13px", color: theme.textMuted, marginBottom: "24px", lineHeight: 1.6 }}>
          Did you already throw, or are you starting fresh at the tee?
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ ...s.btn, flex: 1 }} onClick={() => setPhase("tee")}>
            🏌️ At the Tee
          </button>
          <button style={{ ...s.btnOut, flex: 1 }} onClick={() => setPhase("log_shot")}>
            📍 Already Threw
          </button>
        </div>
      </div>
    </div>
  );

  // ── Hole complete ──
  if (phase === "complete") {
    const score = (round.scores?.[round.currentHole] || 0);
    const scoreToPar = score - hole.par;
    const scoreLabel = scoreToPar === 0 ? "Par" : scoreToPar === -1 ? "Birdie 🐦" : scoreToPar === -2 ? "Eagle 🦅" : scoreToPar < 0 ? `${Math.abs(scoreToPar)} Under` : scoreToPar === 1 ? "Bogey" : scoreToPar === 2 ? "Double Bogey" : `+${scoreToPar}`;
    const scoreColor = scoreToPar < 0 ? theme.accent : scoreToPar === 0 ? theme.warning : theme.error;
    const maxHole = course.holes?.length || 18;
    return (
      <div style={s.content}>
        <div style={{ ...s.cardAccent, textAlign: "center", padding: "32px 20px" }}>
          <div style={{ fontSize: "56px", marginBottom: "8px" }}>⛓️</div>
          <div style={{ fontSize: "14px", color: theme.textMuted, marginBottom: "4px" }}>Hole {round.currentHole} Complete</div>
          <div style={{ fontSize: "48px", fontWeight: "700", color: scoreColor, fontFamily: "'DM Sans',sans-serif", lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: "14px", color: scoreColor, fontWeight: "600", marginTop: "4px", marginBottom: "20px" }}>{scoreLabel}</div>
          <div style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "20px" }}>Par {hole.par} · {score} throws{penalty > 0 ? ` (incl. ${penalty} penalty)` : ""}</div>
          <button style={s.btn} onClick={advanceHole}>
            {round.currentHole >= maxHole ? "Finish Round 🏁" : `Hole ${round.currentHole + 1} → `}
          </button>
        </div>

        {/* Hole summary */}
        <div style={s.card}>
          <div style={s.slabel}>Hole {round.currentHole} Summary</div>
          {holeShots.map((shot, i) => (
            <div key={i} style={{ ...s.row, borderBottom: i < holeShots.length-1 ? `1px solid ${theme.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "24px", height: "24px", background: theme.accentDim, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: theme.accent, fontWeight: "700" }}>{i+1}</div>
                <div>
                  <div style={{ fontSize: "12px", color: theme.text }}>{shot.discName || "Unknown disc"}</div>
                  <div style={{ fontSize: "11px", color: theme.textMuted }}>{shot.distFromTee}ft · {shot.position} · {shot.lie}</div>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: theme.textMuted }}>{shot.remaining}ft left</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Recommend phase ──
  if (phase === "recommend") return (
    <div style={s.content}>
      {/* Hole info bar */}
      <div style={{ ...s.cardAccent, padding: "14px 16px", marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", color: theme.textMuted, letterSpacing: "0.1em" }}>HOLE {round.currentHole} · PAR {hole.par}</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: theme.accent, fontFamily: "'DM Sans',sans-serif" }}>
              {remainingDist}ft
              <span style={{ fontSize: "13px", color: theme.textMuted, fontWeight: "400", marginLeft: "6px" }}>remaining</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: theme.textMuted }}>SHOT</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: theme.text, fontFamily: "'DM Sans',sans-serif" }}>{shotCount + 1}</div>
          </div>
        </div>
        {hole.notes && <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "8px", lineHeight: 1.5 }}>📝 {hole.notes}</div>}
      </div>

      {/* ── AI RECOMMENDATION — first thing player sees ── */}
      <RecommendationCard
        rec={rec}
        loading={recLoading}
        bag={bag}
        onConfirm={(disc, throwType) => {
          if (disc) setSelectedDisc(disc);
          setRec(null);
          setPhase("log_shot");
        }}
        onSwap={() => setShowDiscPicker(true)}
        onFeedback={(rating) => {
          // Save feedback to localStorage for review
          const fb = JSON.parse(localStorage.getItem("chainhound_feedback")||"[]");
          fb.push({
            date: new Date().toISOString(),
            hole: round.currentHole,
            course: course.name,
            disc: rec?.disc,
            throwType: rec?.throwType,
            releaseAngle: rec?.releaseAngle,
            reason: rec?.reason,
            rating,
            remainingDist,
            wind,
          });
          localStorage.setItem("chainhound_feedback", JSON.stringify(fb));
          setFeedbackToast(rating === "good" ? "👍 Got it — thanks!" : "👎 Noted — will improve");
          setTimeout(() => setFeedbackToast(null), 2500);
        }}
      />

      {/* ── HOLE DIAGRAM — below recommendation ── */}
      <div style={s.card}>
        <div style={s.slabel}>Hole Layout</div>
        <HoleDiagram hole={hole} shots={holeShots} tapMode={false} />
      </div>

      {/* Selected disc indicator */}
      {selectedDisc && (
        <div style={{ background: theme.accentGlow, border: `1px solid ${theme.accentDim}`, borderRadius: "12px", padding: "10px 16px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "10px", color: theme.textMuted, letterSpacing: "0.1em" }}>THROWING</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: theme.accent, fontFamily: "'DM Sans',sans-serif" }}>{selectedDisc.name}</div>
          </div>
          <button onClick={() => setShowDiscPicker(true)} style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`, color: theme.textMuted, borderRadius: "8px", padding: "6px 12px", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
            CHANGE
          </button>
        </div>
      )}

      {/* Manual override */}
      {!recLoading && (
        <button style={{ ...s.btnOut, marginBottom: "12px" }} onClick={() => setPhase("log_shot")}>
          Skip — Log Shot Manually
        </button>
      )}

      <button style={{...s.btnOut, marginBottom:"10px"}} onClick={() => {
        setEditHoleForm({});
        setEditingHole(true);
      }}>
        ✏️ Edit Hole Shape & Hazards
      </button>
      <button style={s.btnDanger} onClick={onEndRound}>End Round</button>

      {showDiscPicker && (
        <DiscPicker
          bag={bag}
          selected={selectedDisc}
          onSelect={d => {
            isSwapping.current = true;
            setSelectedDisc(d);
            setShowDiscPicker(false);
            setRec(null);
            // Stay in recommend phase — fire new rec for this specific disc
            getRecommendation({
              hole,
              bag,
              settings: {...settings, _preferredDisc: d.name},
              remainingDist,
              wind,
              lie: lastShot ? lastShot.lie : "tee",
              lastShots: holeShots,
              position: lastShot ? lastShot.position : "center",
            });
            setTimeout(() => { isSwapping.current = false; }, 500);
          }}
          onCancel={() => setShowDiscPicker(false)}
        />
      )}

      {/* Feedback toast */}
      {feedbackToast && (
        <div style={{ position:"fixed", bottom:"120px", left:"50%", transform:"translateX(-50%)", background:theme.surface, border:`1px solid ${theme.accentDim}`, borderRadius:"12px", padding:"12px 20px", fontSize:"13px", color:theme.accent, fontWeight:"600", zIndex:400, boxShadow:"0 4px 20px rgba(0,0,0,0.5)" }}>
          {feedbackToast}
        </div>
      )}
    </div>
  );

  // ── Tee / shot setup ──
  return (
    <div style={s.content}>
      {/* Hole info bar */}
      <div style={{ ...s.cardAccent, padding: "14px 16px", marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", color: theme.textMuted, letterSpacing: "0.1em" }}>HOLE {round.currentHole} · PAR {hole.par}</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: theme.accent, fontFamily: "'DM Sans',sans-serif" }}>
              {remainingDist}ft
              <span style={{ fontSize: "13px", color: theme.textMuted, fontWeight: "400", marginLeft: "6px" }}>remaining</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: theme.textMuted }}>SHOT</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: theme.text, fontFamily: "'DM Sans',sans-serif" }}>{shotCount + 1}</div>
          </div>
        </div>
        {hole.notes && <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "8px", lineHeight: 1.5 }}>📝 {hole.notes}</div>}
      </div>

      {/* Wind setter — shown once per hole */}
      {!windSet && (
        <div style={s.card}>
          <div style={s.slabel}>Set Wind for This Hole</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {WIND_OPTIONS.map(w => (
              <div key={w.key} onClick={() => { setWind(w.key); setWindSet(true); setPhase("recommend"); }} style={{
                flex: "1 0 calc(33% - 6px)", padding: "10px 6px", textAlign: "center",
                background: wind === w.key ? theme.accentGlow : theme.surfaceAlt,
                border: `1px solid ${wind === w.key ? theme.accentDim : theme.border}`,
                borderRadius: "10px", cursor: "pointer",
              }}>
                <div style={{ fontSize: "16px" }}>{w.icon}</div>
                <div style={{ fontSize: "10px", color: theme.textMuted, marginTop: "4px" }}>{w.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disc selector */}
      <div style={s.card}>
        <div style={s.slabel}>Disc for This Shot</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: theme.surfaceAlt, border: `1px solid ${theme.accentDim}`, borderRadius: "12px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: theme.text, fontFamily: "'DM Sans',sans-serif" }}>{selectedDisc?.name || "No disc selected"}</div>
            <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>
              {selectedDisc ? `${selectedDisc.brand} · ${selectedDisc.speed}/${selectedDisc.glide}/${selectedDisc.turn}/${selectedDisc.fade}` : "Add discs to your bag"}
            </div>
          </div>
          <button onClick={() => setShowDiscPicker(true)} style={{ background: theme.accentDim, color: theme.accent, border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
            SWAP
          </button>
        </div>
        {selectedDisc && (() => { const stab = getStability(selectedDisc.turn, selectedDisc.fade); return (
          <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "10px", color: stab.color, background: `${stab.color}22`, border: `1px solid ${stab.color}44`, borderRadius: "6px", padding: "2px 8px" }}>{stab.label}</span>
            <span style={{ fontSize: "10px", color: theme.textMuted }}>Fades {settings?.dominantHand === "left" ? "right" : "left"} (RHBH)</span>
          </div>
        )})()}
      </div>

      {/* Hole diagram — always visible for reference */}
      <div style={s.card}>
        <div style={{ ...s.slabel, display: "flex", justifyContent: "space-between" }}>
          <span>Hole Layout</span>
          {supported && (
            <button disabled style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "4px 10px", fontSize: "11px", color: theme.textDim, cursor: "not-allowed", fontFamily: "'DM Mono',monospace", opacity: 0.5 }}>
              🎤 Voice (Soon)
            </button>
          )}
        </div>
        <HoleDiagram hole={hole} shots={holeShots} />
      </div>

      {/* TapLogger — full screen tap with lie inference + basket tap ends hole */}
      {phase === "log_shot" && (
        <TapLogger
          hole={hole}
          remainingDist={remainingDist}
          previousShots={holeShots}
          onLog={(shotData) => {
            // Lie comes from tap position — skip lie picker entirely
            if (shotData.lie === "basket" || shotData.isBasket) {
              logShot(shotData, "basket");
            } else {
              setPendingShot(shotData);
              setPhase("lie_wind");
            }
          }}
          onCancel={() => setPhase(windSet ? "recommend" : "tee")}
        />
      )}

      {/* Action buttons */}
      {phase === "tee" && !windSet && null}
      {phase === "tee" && windSet && (
        <button style={s.btn} onClick={() => { setRec(null); fireRecommendation(); setPhase("recommend"); }}>
          🐕 Get Recommendation
        </button>
      )}

      {/* Lie selector — shown after confirming tap */}
      {phase === "lie_wind" && pendingShot && (
        <div style={s.card}>
          <div style={s.slabel}>Where did it land?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {LIE_OPTIONS.map(lie => (
              <div key={lie.key} onClick={() => logShot(pendingShot, lie.key)} style={{
                padding: "14px 8px", textAlign: "center",
                background: theme.surfaceAlt,
                border: `1px solid ${theme.border}`,
                borderRadius: "12px", cursor: "pointer",
                minHeight: "64px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px",
              }}>
                <div style={{ fontSize: "20px" }}>{lie.icon}</div>
                <div style={{ fontSize: "10px", color: theme.textMuted, letterSpacing: "0.05em" }}>{lie.label}</div>
              </div>
            ))}
          </div>
          {/* Penalty stroke */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", padding: "10px 14px", background: theme.surfaceAlt, borderRadius: "10px", border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: "12px", color: theme.textMuted }}>Add Penalty Stroke</span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => setPenalty(Math.max(0, penalty-1))} style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer", fontSize: "14px" }}>-</button>
              <span style={{ fontSize: "14px", color: penalty > 0 ? theme.error : theme.textMuted, fontWeight: "700", minWidth: "20px", textAlign: "center" }}>{penalty}</span>
              <button onClick={() => setPenalty(penalty+1)} style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer", fontSize: "14px" }}>+</button>
            </div>
          </div>
        </div>
      )}

      {/* Score card for current round */}
      {Object.keys(round.scores||{}).length > 0 && (
        <div style={s.card}>
          <div style={s.slabel}>Scorecard</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {course.holes?.map(h => {
              const sc = round.scores?.[h.number];
              const diff = sc ? sc - h.par : null;
              return (
                <div key={h.number} onClick={() => {
                  const updated = { ...round, currentHole: h.number };
                  setRound(updated);
                  saveActiveRound(updated);
                  setPhase("tee");
                  setPendingShot(null);
                  setTapPos(null);
                }} style={{
                  width: "44px", height: "44px",
                  background: h.number === round.currentHole ? theme.accentGlow : sc ? (diff < 0 ? "rgba(61,255,122,0.15)" : diff === 0 ? "rgba(255,184,48,0.15)" : "rgba(255,77,77,0.1)") : theme.surfaceAlt,
                  border: `1px solid ${h.number === round.currentHole ? theme.accentDim : sc ? (diff < 0 ? theme.accentDim : diff === 0 ? "#5C4A00" : "rgba(255,77,77,0.3)") : theme.border}`,
                  borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                  <div style={{ fontSize: "11px", color: theme.textMuted }}>{h.number}</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: sc ? (diff < 0 ? theme.accent : diff === 0 ? theme.warning : theme.error) : theme.textDim }}>
                    {sc || "·"}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Running total */}
          {Object.keys(round.scores||{}).length > 0 && (() => {
            const total = Object.values(round.scores).reduce((a,b) => a+b, 0);
            const parTotal = course.holes?.filter(h => round.scores?.[h.number]).reduce((a,h) => a+h.par, 0) || 0;
            const diff = total - parTotal;
            return (
              <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${theme.border}` }}>
                <span style={{ fontSize: "12px", color: theme.textMuted }}>Total ({Object.keys(round.scores).length} holes)</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: diff < 0 ? theme.accent : diff === 0 ? theme.warning : theme.error }}>
                  {total} ({diff > 0 ? "+" : ""}{diff})
                </span>
              </div>
            );
          })()}
        </div>
      )}

      <div style={{ height: "12px" }} />
      {/* Feedback toast */}
      {feedbackToast && (
        <div style={{
          position:"fixed", bottom:"120px", left:"50%", transform:"translateX(-50%)",
          background:theme.surface, border:`1px solid ${theme.accentDim}`,
          borderRadius:"12px", padding:"12px 20px",
          fontSize:"13px", color:theme.accent, fontWeight:"600",
          zIndex:400, boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
          animation:"fadeIn 0.2s ease",
        }}>
          {feedbackToast}
        </div>
      )}

      <button style={s.btnDanger} onClick={onEndRound}>End Round</button>

      {/* Hole shape editor modal */}
      {editingHole && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
          <div style={{background:theme.surface,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:"430px",margin:"0 auto",padding:"24px",maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{...s.slabel,marginBottom:"16px"}}>Edit Hole {round.currentHole} Layout</div>

            <div style={{marginBottom:"16px"}}>
              <label style={s.label}>Distance (ft)</label>
              <input style={s.input} type="number" value={editHoleForm.distance||hole.distance||""} onChange={e=>setEditHoleForm(f=>({...f,distance:Number(e.target.value)}))} placeholder="340"/>
            </div>

            <div style={{marginBottom:"16px"}}>
              <label style={s.label}>Hole Shape</label>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                {HOLE_SHAPES.map(sh=>(
                  <div key={sh.key} onClick={()=>setEditHoleForm(f=>({...f,shape:sh.key}))} style={{
                    flex:"1 0 calc(33% - 6px)",padding:"10px 4px",textAlign:"center",
                    background:(editHoleForm.shape||hole.shape)===sh.key?theme.accentGlow:theme.surfaceAlt,
                    border:`1px solid ${(editHoleForm.shape||hole.shape)===sh.key?theme.accentDim:theme.border}`,
                    borderRadius:"10px",cursor:"pointer",
                    fontSize:"10px",color:(editHoleForm.shape||hole.shape)===sh.key?theme.accent:theme.textMuted,
                  }}>
                    <div style={{fontSize:"18px",marginBottom:"3px"}}>{sh.icon}</div>{sh.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={{marginBottom:"16px"}}>
              <label style={s.label}>Hazards</label>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                {HAZARD_OPTIONS.map(h=>{
                  const currentHazards = editHoleForm.hazards||hole.hazards||"";
                  const active = currentHazards.includes(h.key);
                  return (
                    <div key={h.key} onClick={()=>{
                      const curr = (editHoleForm.hazards||hole.hazards||"").split(" ").filter(Boolean);
                      const upd = active?curr.filter(x=>x!==h.key):[...curr,h.key];
                      setEditHoleForm(f=>({...f,hazards:upd.join(" ")}));
                    }} style={{
                      padding:"7px 10px",
                      background:active?theme.accentGlow:theme.surfaceAlt,
                      border:`1px solid ${active?theme.accentDim:theme.border}`,
                      borderRadius:"8px",cursor:"pointer",
                      fontSize:"11px",color:active?theme.accent:theme.textMuted,
                      display:"flex",alignItems:"center",gap:"4px",
                    }}>{h.icon} {h.label}</div>
                  );
                })}
              </div>
            </div>

            <div style={{marginBottom:"16px"}}>
              <label style={s.label}>Notes</label>
              <input style={s.input} value={editHoleForm.notes||hole.notes||""} onChange={e=>setEditHoleForm(f=>({...f,notes:e.target.value}))} placeholder="Uphill, mando pole..."/>
            </div>

            <button style={s.btn} onClick={saveHoleEdit}>Save & Update Recommendation</button>
            <div style={{height:"10px"}}/>
            <button style={s.btnOut} onClick={()=>setEditingHole(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Disc picker modal */}
      {showDiscPicker && (
        <DiscPicker bag={bag} selected={selectedDisc} onSelect={d => { setSelectedDisc(d); setShowDiscPicker(false); }} onCancel={() => setShowDiscPicker(false)} />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.1)}}`}</style>
    </div>
  );
}

// ─── Round Screen ─────────────────────────────────────────────────────────────
function RoundScreen({ bag, settings }) {
  const [view, setView] = useState("home");
  const [courses, setCourses] = useState(loadCourses);
  const [round, setRound] = useState(loadActiveRound);
  const [activeCourse, setActiveCourse] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [showNewCourse, setShowNewCourse] = useState(false);

  useEffect(() => {
    if (round) {
      const course = courses.find(c => c.id === round.courseId);
      if (course) { setActiveCourse(course); setView("active"); }
    }
  }, []);

  const [verifyBag, setVerifyBag] = useState(false);
  const [pendingCourse, setPendingCourse] = useState(null);

  const startRound = (course) => {
    // Show bag verify before starting round
    setPendingCourse(course);
    setVerifyBag(true);
  };

  const confirmStartRound = (course) => {
    const newRound = { id: Date.now().toString(), courseId: course.id, courseName: course.name, date: new Date().toISOString().split("T")[0], currentHole: 1, shots: [], scores: {} };
    setRound(newRound);
    setActiveCourse(course);
    saveActiveRound(newRound);
    setVerifyBag(false);
    setPendingCourse(null);
    setView("active");
  };

  const createCourse = () => {
    if (!courseName.trim()) return;
    const newCourse = { id: Date.now().toString(), name: courseName.trim(), createdAt: new Date().toISOString().split("T")[0], holes: [] };
    const updated = [...courses, newCourse];
    setCourses(updated);
    saveCourses(updated);
    startRound(newCourse);
    setCourseName("");
    setShowNewCourse(false);
  };

  const endRound = () => {
    saveActiveRound(null);
    setRound(null);
    setActiveCourse(null);
    setView("summary");
  };

  // Round summary
  if (view === "summary" && round) {
    const course = courses.find(c => c.id === round.courseId);
    const totalThrows = Object.values(round.scores||{}).reduce((a,b)=>a+b,0);
    const parTotal = course?.holes?.filter(h=>round.scores?.[h.number]).reduce((a,h)=>a+h.par,0)||0;
    const diff = totalThrows - parTotal;
    const allShots = round.shots || [];

    // Stats calculations
    const drivers = allShots.filter(s => {
      const disc = TEST_BAG.find(d => d.name === s.discName) || bag.find(d => d.name === s.discName);
      return disc?.type === "distance_driver" || disc?.type === "fairway_driver";
    });
    const midranges = allShots.filter(s => {
      const disc = TEST_BAG.find(d => d.name === s.discName) || bag.find(d => d.name === s.discName);
      return disc?.type === "midrange";
    });
    const putts = allShots.filter(s => {
      const disc = TEST_BAG.find(d => d.name === s.discName) || bag.find(d => d.name === s.discName);
      return disc?.type === "putter";
    });

    const longestDrive = drivers.length > 0 ? drivers.reduce((a,b) => a.distFromTee > b.distFromTee ? a : b) : null;
    const longestMid = midranges.length > 0 ? midranges.reduce((a,b) => a.distFromTee > b.distFromTee ? a : b) : null;
    const longestPutt = putts.length > 0 ? putts.reduce((a,b) => a.distFromTee > b.distFromTee ? a : b) : null;

    // Disc usage
    const discUsage = {};
    allShots.forEach(s => { if(s.discName) discUsage[s.discName] = (discUsage[s.discName]||0)+1; });
    const mostUsed = Object.entries(discUsage).sort((a,b)=>b[1]-a[1]).slice(0,3);

    // Disc avg distances
    const discDistances = {};
    allShots.forEach(s => {
      if(!s.discName) return;
      if(!discDistances[s.discName]) discDistances[s.discName] = [];
      discDistances[s.discName].push(s.distFromTee);
    });

    // Score breakdown
    const birdies = Object.entries(round.scores||{}).filter(([h,sc]) => {
      const hole = course?.holes?.find(x=>x.number===Number(h));
      return hole && sc < hole.par;
    }).length;
    const pars = Object.entries(round.scores||{}).filter(([h,sc]) => {
      const hole = course?.holes?.find(x=>x.number===Number(h));
      return hole && sc === hole.par;
    }).length;
    const bogeys = Object.entries(round.scores||{}).filter(([h,sc]) => {
      const hole = course?.holes?.find(x=>x.number===Number(h));
      return hole && sc === hole.par + 1;
    }).length;
    const doubles = Object.entries(round.scores||{}).filter(([h,sc]) => {
      const hole = course?.holes?.find(x=>x.number===Number(h));
      return hole && sc >= hole.par + 2;
    }).length;

    return (
      <div>
        <div style={s.header}>
          <div style={s.htitle}>Round Complete</div>
          <div style={s.hmain}>{round.courseName}</div>
        </div>
        <div style={s.content}>

          {/* Score card */}
          <div style={{ ...s.cardAccent, textAlign: "center", padding: "28px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🐕⛓️</div>
            <div style={{ fontSize: "13px", color: theme.textMuted, marginBottom: "4px" }}>{round.date} · {Object.keys(round.scores||{}).length} holes</div>
            <div style={{ fontSize: "56px", fontWeight: "700", color: diff <= 0 ? theme.accent : theme.error, fontFamily: "'DM Sans',sans-serif", lineHeight: 1 }}>{totalThrows}</div>
            <div style={{ fontSize: "16px", color: diff <= 0 ? theme.accent : theme.error, fontWeight: "600", marginTop: "4px" }}>
              {diff === 0 ? "Even Par 🎯" : diff > 0 ? `+${diff} over par` : `${Math.abs(diff)} under par 🔥`}
            </div>

            {/* Score breakdown */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "16px" }}>
              {[
                { label: "Birdies", val: birdies, color: theme.accent },
                { label: "Pars", val: pars, color: theme.warning },
                { label: "Bogeys", val: bogeys, color: theme.error },
                { label: "Doubles+", val: doubles, color: "#FF4444" },
              ].map(item => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: "700", color: item.color, fontFamily: "'DM Sans',sans-serif" }}>{item.val}</div>
                  <div style={{ fontSize: "9px", color: theme.textMuted, letterSpacing: "0.05em" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Best shots */}
          <div style={s.card}>
            <div style={s.slabel}>Best Shots This Round</div>
            {longestDrive && (
              <div style={{ ...s.row }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>💨</span>
                  <div>
                    <div style={{ fontSize: "12px", color: theme.text, fontWeight: "600" }}>Longest Drive</div>
                    <div style={{ fontSize: "11px", color: theme.textMuted }}>{longestDrive.discName} · Hole {longestDrive.hole}</div>
                  </div>
                </div>
                <span style={{ fontSize: "18px", fontWeight: "700", color: theme.accent, fontFamily: "'DM Sans',sans-serif" }}>{longestDrive.distFromTee}ft</span>
              </div>
            )}
            {longestMid && (
              <div style={{ ...s.row }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>🎯</span>
                  <div>
                    <div style={{ fontSize: "12px", color: theme.text, fontWeight: "600" }}>Best Midrange</div>
                    <div style={{ fontSize: "11px", color: theme.textMuted }}>{longestMid.discName} · Hole {longestMid.hole}</div>
                  </div>
                </div>
                <span style={{ fontSize: "18px", fontWeight: "700", color: theme.accent, fontFamily: "'DM Sans',sans-serif" }}>{longestMid.distFromTee}ft</span>
              </div>
            )}
            {longestPutt && (
              <div style={{ ...s.row, borderBottom: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>🕳️</span>
                  <div>
                    <div style={{ fontSize: "12px", color: theme.text, fontWeight: "600" }}>Longest Putt Made</div>
                    <div style={{ fontSize: "11px", color: theme.textMuted }}>{longestPutt.discName} · Hole {longestPutt.hole}</div>
                  </div>
                </div>
                <span style={{ fontSize: "18px", fontWeight: "700", color: theme.accent, fontFamily: "'DM Sans',sans-serif" }}>{longestPutt.distFromTee}ft</span>
              </div>
            )}
            {!longestDrive && !longestMid && !longestPutt && (
              <div style={{ fontSize: "12px", color: theme.textMuted, textAlign: "center", padding: "12px 0" }}>No shot data recorded this round</div>
            )}
          </div>

          {/* Most used discs */}
          {mostUsed.length > 0 && (
            <div style={s.card}>
              <div style={s.slabel}>Most Used Discs</div>
              {mostUsed.map(([discName, count], i) => {
                const avgDist = discDistances[discName] ? Math.round(discDistances[discName].reduce((a,b)=>a+b,0)/discDistances[discName].length) : 0;
                return (
                  <div key={discName} style={{ ...s.row, borderBottom: i < mostUsed.length-1 ? `1px solid ${theme.border}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "28px", height: "28px", background: theme.accentDim, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: theme.accent, fontWeight: "700" }}>{i+1}</div>
                      <div>
                        <div style={{ fontSize: "13px", color: theme.text, fontWeight: "600" }}>{discName}</div>
                        <div style={{ fontSize: "11px", color: theme.textMuted }}>{count} throw{count!==1?"s":""} · avg {avgDist}ft</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", color: theme.accent, fontWeight: "700" }}>{avgDist}ft</div>
                      <div style={{ fontSize: "10px", color: theme.textDim }}>avg</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Hole by hole */}
          {course?.holes && (
            <div style={s.card}>
              <div style={s.slabel}>Hole by Hole</div>
              {course.holes.map(h => {
                const sc = round.scores?.[h.number];
                if (!sc) return null;
                const scoreDiff = sc - h.par;
                return (
                  <div key={h.number} style={{ ...s.row, borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: theme.textMuted, width: "24px" }}>H{h.number}</span>
                      <span style={{ fontSize: "11px", color: theme.textDim }}>Par {h.par} · {h.distance}ft</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: scoreDiff < 0 ? theme.accent : scoreDiff === 0 ? theme.warning : theme.error }}>{sc}</span>
                      <span style={{ fontSize: "11px", color: theme.textDim }}>{scoreDiff === 0 ? "par" : scoreDiff < 0 ? `${scoreDiff}` : `+${scoreDiff}`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button style={s.btn} onClick={() => { setRound(null); setView("home"); }}>Done</button>
        </div>
      </div>
    );
  }

  // Active round
  if (view === "active" && round && activeCourse) return (
    <div>
      <div style={s.header}>
        <div style={s.htitle}>{activeCourse.name}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={s.hmain}>Hole {round.currentHole}</div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: theme.textMuted }}>HOLES PLAYED</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: theme.accent, fontFamily: "'DM Sans',sans-serif" }}>{Object.keys(round.scores||{}).length}</div>
          </div>
        </div>
      </div>
      <HoleScreen
        round={round}
        setRound={(r) => { setRound(r); if (activeCourse) { const c = courses.find(x => x.id === activeCourse.id); if(c) setActiveCourse(c); } }}
        course={activeCourse}
        courses={courses}
        saveCourses={(updatedCourses) => { saveCourses(updatedCourses); setCourses(updatedCourses); const updatedCourse = updatedCourses.find(c=>c.id===activeCourse.id); if(updatedCourse) setActiveCourse(updatedCourse); }}
        bag={bag}
        settings={settings}
        onEndRound={endRound}
      />
    </div>
  );

  // Bag verify screen
  if (verifyBag && pendingCourse) return (
    <div>
      <div style={s.header}>
        <div style={s.htitle}>Starting Round</div>
        <div style={s.hmain}>Verify Your Bag</div>
      </div>
      <div style={s.content}>
        <div style={s.cardAccent}>
          <div style={s.slabel}>Before you tee off</div>
          <div style={{fontSize:"13px",color:theme.textMuted,lineHeight:1.6,marginBottom:"16px"}}>
            Make sure your bag looks right. Chain Hound uses these flight numbers for every recommendation.
          </div>
          <div style={{fontSize:"12px",color:theme.accent,fontWeight:"600"}}>{pendingCourse.name} · {pendingCourse.holes?.length||0} holes</div>
        </div>

        <div style={s.card}>
          <div style={s.slabel}>Your Bag ({bag.length} discs)</div>
          {bag.length === 0 ? (
            <div style={{fontSize:"13px",color:theme.error,textAlign:"center",padding:"16px 0"}}>
              ⚠️ No discs in bag — add discs before starting a round!
            </div>
          ) : (
            bag.map((disc, i) => {
              const stab = getStability(disc.turn, disc.fade);
              const t = DISC_TYPES.find(t=>t.key===disc.type);
              return (
                <div key={disc.id} style={{...s.row, borderBottom: i<bag.length-1?`1px solid ${theme.border}`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <span>{t?.icon}</span>
                    <div>
                      <div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>{disc.name}</div>
                      <div style={{fontSize:"11px",color:theme.textMuted}}>{disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}</div>
                    </div>
                  </div>
                  <span style={{fontSize:"10px",color:stab.color,background:`${stab.color}22`,border:`1px solid ${stab.color}44`,borderRadius:"6px",padding:"2px 8px"}}>{stab.label}</span>
                </div>
              );
            })
          )}
        </div>

        <button style={s.btn} onClick={()=>confirmStartRound(pendingCourse)} disabled={bag.length===0}>
          ✓ Bag Looks Good — Start Round
        </button>
        <div style={{height:"10px"}}/>
        <button style={s.btnOut} onClick={()=>{setVerifyBag(false);setPendingCourse(null);}}>
          ← Edit Bag First
        </button>
      </div>
    </div>
  );

  // Home
  return (
    <div>
      <div style={s.header}>
        <GlowOrb top={-60} left={200} size={250} opacity={0.06}/>
        <div style={s.htitle}>On Course</div>
        <div style={s.hmain}>Round</div>
      </div>
      <div style={s.content}>
        {round && (
          <div style={{ ...s.cardAccent, marginBottom: "16px" }}>
            <div style={s.slabel}>Resume Round</div>
            <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: "'DM Sans',sans-serif", marginBottom: "4px" }}>{round.courseName}</div>
            <div style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "16px" }}>Hole {round.currentHole} · {Object.keys(round.scores||{}).length} holes played</div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ ...s.btn, flex: 1 }} onClick={() => { const c = courses.find(x => x.id === round.courseId); if(c){setActiveCourse(c);setView("active");} }}>Resume →</button>
              <button style={{ ...s.btnDanger, flex: 1, padding: "13px" }} onClick={() => { saveActiveRound(null); setRound(null); }}>Discard</button>
            </div>
          </div>
        )}

        {courses.length > 0 && (
          <div style={{ marginBottom: "8px" }}>
            <div style={s.slabel}>Saved Courses</div>
            {courses.map(course => (
              <div key={course.id} style={{ ...s.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => startRound(course)}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: "'DM Sans',sans-serif" }}>{course.name}</div>
                  <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "3px" }}>{course.holes?.length || 0} holes · {course.createdAt}</div>
                </div>
                <div style={{ fontSize: "20px", color: theme.accent }}>▶</div>
              </div>
            ))}
          </div>
        )}

        {showNewCourse ? (
          <div style={s.card}>
            <div style={s.slabel}>New Course</div>
            <div style={{ marginBottom: "16px" }}>
              <label style={s.label}>Course Name</label>
              <input style={s.input} value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Beach City Dam, Sabo Park..." autoFocus/>
            </div>
            <button style={s.btn} onClick={createCourse}>Start Round →</button>
            <div style={{ height: "10px" }}/>
            <button style={s.btnOut} onClick={() => setShowNewCourse(false)}>Cancel</button>
          </div>
        ) : (
          <div style={s.cardAccent}>
            <div style={s.slabel}>Ready to Play?</div>
            <div style={{ fontSize: "16px", fontWeight: "700", fontFamily: "'DM Sans',sans-serif", marginBottom: "8px" }}>Start a New Round</div>
            <div style={{ fontSize: "13px", color: theme.textMuted, lineHeight: 1.6, marginBottom: "20px" }}>Chain Hound tracks every shot and helps you choose the right disc. AI caddie active 🐕 — add discs to your bag for best results.</div>
            <button style={s.btn} onClick={() => setShowNewCourse(true)}>+ New Round</button>
          </div>
        )}

        {bag.length === 0 && <div style={{ ...s.card, textAlign: "center" }}><div style={{ fontSize: "13px", color: theme.textMuted }}>⚠️ Add discs to your bag before starting a round.</div></div>}
      </div>
    </div>
  );
}

// ─── Bag Screen ───────────────────────────────────────────────────────────────
const FlightBar = ({label,value,min,max,color=theme.accent}) => {
  const pct = Math.min(100,Math.max(0,((value-min)/(max-min))*100));
  return (
    <div style={{marginBottom:"10px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
        <span style={{fontSize:"10px",color:theme.textMuted,letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</span>
        <span style={{fontSize:"12px",color,fontWeight:"700"}}>{value}</span>
      </div>
      <div style={{height:"4px",background:theme.surfaceAlt,borderRadius:"2px",overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:"2px"}}/>
      </div>
    </div>
  );
};

function DiscCard({disc,onDelete}) {
  const [exp,setExp] = useState(false);
  const t = DISC_TYPES.find(t=>t.key===disc.type);
  const stab = getStability(disc.turn,disc.fade);
  return (
    <div style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:"14px",marginBottom:"12px",overflow:"hidden"}}>
      <div style={{padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px"}} onClick={()=>setExp(!exp)}>
        <div style={{width:"42px",height:"42px",background:theme.surfaceAlt,border:`1px solid ${theme.border}`,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>{t?.icon}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:"14px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif"}}>{disc.name}</div>
          <div style={{fontSize:"11px",color:theme.textMuted,marginTop:"2px"}}>{disc.brand} · {disc.plastic||t?.label}</div>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <span style={{fontSize:"10px",color:stab.color,background:`${stab.color}22`,border:`1px solid ${stab.color}44`,borderRadius:"6px",padding:"2px 8px",fontWeight:"600"}}>{stab.label}</span>
          <div style={{color:theme.textDim}}>{exp?"▲":"▼"}</div>
        </div>
      </div>
      {exp&&(
        <div style={{padding:"0 16px 16px",borderTop:`1px solid ${theme.border}`}}>
          <div style={{paddingTop:"16px"}}>
            <FlightBar label="Speed" value={disc.speed} min={1} max={14}/>
            <FlightBar label="Glide" value={disc.glide} min={1} max={7} color="#60BFFF"/>
            <FlightBar label="Turn" value={disc.turn} min={-5} max={1} color={disc.turn<0?theme.warning:theme.accent}/>
            <FlightBar label="Fade" value={disc.fade} min={0} max={5} color="#FF7A3D"/>
          </div>
          {disc.notes&&<div style={{background:theme.surfaceAlt,borderRadius:"8px",padding:"10px 12px",fontSize:"12px",color:theme.textMuted,marginTop:"8px"}}>{disc.notes}</div>}
          <button style={{...s.btnDanger,padding:"10px",marginTop:"12px"}} onClick={()=>onDelete(disc.id)}>Remove</button>
        </div>
      )}
    </div>
  );
}

function AddDiscForm({onAdd,onCancel}) {
  const [search,setSearch]=useState("");
  const [sugg,setSugg]=useState([]);
  const [form,setForm]=useState({name:"",brand:"Innova",type:"distance_driver",speed:"",glide:"",turn:"",fade:"",weight:"",plastic:"",color:"",notes:""});
  const [filled,setFilled]=useState(false);
  const plastics=PLASTICS_BY_BRAND[form.brand]||["Other"];
  const handleSearch=v=>{setSearch(v);setFilled(false);if(v.length<2){setSugg([]);return;}setSugg(DISC_DATABASE.filter(d=>d.name.toLowerCase().includes(v.toLowerCase())||d.brand.toLowerCase().includes(v.toLowerCase())).slice(0,5));};
  const pick=d=>{setForm(f=>({...f,name:d.name,brand:d.brand,type:d.type,speed:d.speed,glide:d.glide,turn:d.turn,fade:d.fade}));setSearch(d.name);setSugg([]);setFilled(true);};
  const submit=()=>{if(!form.name||!form.speed)return;onAdd({...form,id:Date.now().toString(),addedAt:new Date().toISOString().split("T")[0],speed:Number(form.speed),glide:Number(form.glide),turn:Number(form.turn),fade:Number(form.fade),weight:form.weight?Number(form.weight):null});};
  const stab=form.turn!==""&&form.fade!==""?getStability(Number(form.turn),Number(form.fade)):null;
  return (
    <div>
      <div style={s.header}><div style={s.htitle}>My Bag</div><div style={s.hmain}>Add Disc</div></div>
      <div style={s.content}>
        <div style={s.card}>
          <div style={s.slabel}>Search Database</div>
          <div style={{position:"relative"}}>
            <input style={s.input} placeholder="e.g. Destroyer, Buzzz..." value={search} onChange={e=>handleSearch(e.target.value)}/>
            {sugg.length>0&&(
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:"10px",zIndex:50,marginTop:"4px",overflow:"hidden"}}>
                {sugg.map((sg,i)=>(
                  <div key={i} onClick={()=>pick(sg)} style={{padding:"12px 14px",cursor:"pointer",borderBottom:i<sugg.length-1?`1px solid ${theme.border}`:"none",display:"flex",justifyContent:"space-between"}}>
                    <div><div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>{sg.name}</div><div style={{fontSize:"11px",color:theme.textMuted}}>{sg.brand}</div></div>
                    <div style={{fontSize:"11px",color:theme.textMuted}}>{sg.speed}/{sg.glide}/{sg.turn}/{sg.fade}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {filled&&<div style={{marginTop:"10px",padding:"8px 12px",background:theme.accentGlow,border:`1px solid ${theme.accentDim}`,borderRadius:"8px",fontSize:"11px",color:theme.accent}}>✓ Auto-filled from database</div>}
        </div>
        <div style={s.card}>
          <div style={s.slabel}>Disc Details</div>
          <div style={{marginBottom:"16px"}}><label style={s.label}>Disc Name *</label><input style={s.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Destroyer"/></div>
          <div style={{marginBottom:"16px"}}><label style={s.label}>Brand</label>
            <select style={{...s.input,appearance:"none"}} value={form.brand} onChange={e=>setForm(f=>({...f,brand:e.target.value,plastic:""}))}>
              {BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{marginBottom:"16px"}}><label style={s.label}>Type</label>
            <select style={{...s.input,appearance:"none"}} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
              {DISC_TYPES.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div style={{marginBottom:"0"}}><label style={s.label}>Plastic</label>
            <select style={{...s.input,appearance:"none"}} value={form.plastic} onChange={e=>setForm(f=>({...f,plastic:e.target.value}))}>
              <option value="">Select plastic...</option>
              {plastics.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div style={s.card}>
          <div style={s.slabel}>Flight Numbers *</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
            {[{key:"speed",label:"Speed",hint:"1–14"},{key:"glide",label:"Glide",hint:"1–7"},{key:"turn",label:"Turn",hint:"-5–1"},{key:"fade",label:"Fade",hint:"0–5"}].map(f=>(
              <div key={f.key}><label style={s.label}>{f.label} <span style={{color:theme.textDim}}>({f.hint})</span></label><input style={s.input} type="number" value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder="0"/></div>
            ))}
          </div>
          {stab&&<div style={{background:`${stab.color}11`,border:`1px solid ${stab.color}33`,borderRadius:"8px",padding:"8px 12px",marginTop:"12px"}}><span style={{fontSize:"11px",color:stab.color,fontWeight:"600"}}>{stab.label}</span></div>}
        </div>
        <div style={s.card}>
          <div style={s.slabel}>Optional</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
            <div><label style={s.label}>Weight (g)</label><input style={s.input} type="number" value={form.weight} onChange={e=>setForm(f=>({...f,weight:e.target.value}))} placeholder="175"/></div>
            <div><label style={s.label}>Color</label><input style={s.input} value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))} placeholder="Red..."/></div>
          </div>
          <div><label style={s.label}>Notes</label><input style={s.input} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="My go-to driver..."/></div>
        </div>
        <button style={s.btn} onClick={submit}>+ Add to Bag</button>
        <div style={{height:"12px"}}/>
        <button style={s.btnOut} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function BagScreen({bag,setBag}) {
  const [view,setView]=useState("overview");
  const add=d=>{const nb=[...bag,d];setBag(nb);saveBag(nb);setView("overview");};
  const del=id=>{const nb=bag.filter(d=>d.id!==id);setBag(nb);saveBag(nb);};
  if(view==="add") return <AddDiscForm onAdd={add} onCancel={()=>setView("overview")}/>;
  const byType=DISC_TYPES.map(t=>({...t,discs:bag.filter(d=>d.type===t.key)}));
  return (
    <div>
      <div style={s.header}>
        <GlowOrb top={-40} left={220} size={200} opacity={0.06}/>
        <div style={s.htitle}>Equipment</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div style={s.hmain}>My Bag</div>
          <div style={{fontSize:"28px",fontWeight:"700",color:theme.accent,fontFamily:"'DM Sans',sans-serif"}}>{bag.length}</div>
        </div>
      </div>
      <div style={s.content}>
        {bag.length===0?(
          <div style={{...s.cardAccent,textAlign:"center",padding:"32px 20px"}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>🎒</div>
            <div style={{fontSize:"16px",fontWeight:"600",fontFamily:"'DM Sans',sans-serif",marginBottom:"8px"}}>Your bag is empty</div>
            <div style={{fontSize:"13px",color:theme.textMuted,marginBottom:"24px"}}>Add your discs to get started.</div>
            <button style={s.btn} onClick={()=>setView("add")}>+ Add Your First Disc</button>
          </div>
        ):(
          <>
            <button style={{...s.btn,marginBottom:"20px"}} onClick={()=>setView("add")}>+ Add Disc</button>
            {byType.map(type=>type.discs.length>0&&(
              <div key={type.key} style={{marginBottom:"8px"}}>
                <div style={{...s.slabel,display:"flex",alignItems:"center",gap:"6px"}}><span>{type.icon}</span>{type.label}<span style={{color:theme.textDim}}>({type.discs.length})</span></div>
                {type.discs.map(disc=><DiscCard key={disc.id} disc={disc} onDelete={del}/>)}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({setTab,bag,settings}) {
  const activeRound = loadActiveRound();
  return (
    <div>
      <div style={s.header}>
        <GlowOrb top={-60} left={200} size={250} opacity={0.06}/>
        <div style={s.htitle}>Chain Hound 🐕</div>
        <div style={s.hmain}>Ready to play?</div>
      </div>
      <div style={s.content}>
        {activeRound && (
          <div style={{...s.cardAccent,marginBottom:"16px"}}>
            <div style={s.slabel}>⚡ Active Round</div>
            <div style={{fontSize:"15px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",marginBottom:"4px"}}>{activeRound.courseName}</div>
            <div style={{fontSize:"12px",color:theme.textMuted,marginBottom:"12px"}}>Hole {activeRound.currentHole} in progress</div>
            <button style={s.btn} onClick={()=>setTab("round")}>Resume Round →</button>
          </div>
        )}
        <div style={{...s.cardAccent,position:"relative",overflow:"hidden"}}>
          <GlowOrb top={-40} left={-40} size={180} opacity={0.12}/>
          <div style={s.slabel}>Quick Start</div>
          <div style={{fontSize:"20px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",marginBottom:"8px"}}>Start a Round</div>
          <div style={{fontSize:"13px",color:theme.textMuted,marginBottom:"20px",lineHeight:1.6}}>Track every shot. Chain Hound learns your game and recommends the right disc every time.</div>
          <button style={s.btn} onClick={()=>setTab("round")}>🥏 Begin Round</button>
        </div>
        <div style={s.card}>
          <div style={s.slabel}>My Bag</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:"16px",marginBottom:"16px"}}>
            <div>
              <div style={{fontSize:"48px",fontWeight:"700",color:theme.accent,fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{bag.length}</div>
              <div style={{fontSize:"12px",color:theme.textMuted,marginTop:"4px"}}>{bag.length===1?"Disc in bag":"Discs in bag"}</div>
            </div>
            <div style={{flex:1}}/>
            <span style={{...s.tag,...(bag.length>0?{background:theme.accentGlow,border:`1px solid ${theme.accentDim}`,color:theme.accent}:{})}}>{bag.length===0?"Setup needed":"Ready"}</span>
          </div>
          <button style={bag.length===0?s.btn:s.btnOut} onClick={()=>setTab("bag")}>{bag.length===0?"Add Your Discs":"Manage Bag"}</button>
        </div>
        <div style={s.card}>
          <div style={s.slabel}>Player Profile</div>
          <div style={{...s.row,borderBottom:`1px solid ${theme.border}`}}>
            <span style={{fontSize:"12px",color:theme.textMuted}}>Dominant Hand</span>
            <span style={{fontSize:"13px",color:theme.accent,fontWeight:"600"}}>{settings?.dominantHand==="left"?"Left (LHBH)":"Right (RHBH)"}</span>
          </div>
          <div style={{...s.row,borderBottom:"none"}}>
            <span style={{fontSize:"12px",color:theme.textMuted}}>Fade direction (backhand)</span>
            <span style={{fontSize:"13px",color:theme.text}}>{settings?.dominantHand==="left"?"Fades right →":"Fades left ←"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
function SettingsScreen({bag,setBag,settings,setSettings}) {
  const clearAll=()=>{if(window.confirm("Clear all data?")){setBag([]);localStorage.removeItem("chainhound_bag");localStorage.removeItem("chainhound_courses");localStorage.removeItem("chainhound_active_round");}};
  const updateSetting=(key,val)=>{const ns={...settings,[key]:val};setSettings(ns);saveSettings(ns);};
  return (
    <div>
      <div style={s.header}><div style={s.htitle}>App</div><div style={s.hmain}>Settings</div></div>
      <div style={s.content}>

        {/* Dominant Hand */}
        <div style={{marginBottom:"24px"}}>
          <div style={s.slabel}>Player Profile</div>
          <div style={s.card}>
            <div style={{...s.row,borderBottom:"none"}}>
              <div>
                <div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>Dominant Hand</div>
                <div style={{fontSize:"11px",color:theme.textMuted,marginTop:"2px"}}>Affects all disc recommendations</div>
              </div>
              <div style={{display:"flex",gap:"8px"}}>
                {["right","left"].map(hand=>(
                  <div key={hand} onClick={()=>updateSetting("dominantHand",hand)} style={{
                    padding:"10px 16px",
                    background:settings?.dominantHand===hand?theme.accentGlow:theme.surfaceAlt,
                    border:`1px solid ${settings?.dominantHand===hand?theme.accentDim:theme.border}`,
                    borderRadius:"10px",cursor:"pointer",
                    fontSize:"12px",fontWeight:"600",
                    color:settings?.dominantHand===hand?theme.accent:theme.textMuted,
                    fontFamily:"'DM Mono',monospace",textTransform:"uppercase",
                  }}>
                    {hand}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Level */}
        <div style={{marginBottom:"24px"}}>
          <div style={s.slabel}>Skill Level</div>
          <div style={s.card}>
            <div style={{fontSize:"11px",color:theme.textMuted,marginBottom:"12px"}}>Helps calibrate disc recommendations</div>
            <div style={{display:"flex",gap:"8px"}}>
              {["beginner","intermediate","advanced"].map(level=>(
                <div key={level} onClick={()=>updateSetting("skillLevel",level)} style={{
                  flex:1,padding:"12px 6px",textAlign:"center",
                  background:settings?.skillLevel===level?theme.accentGlow:theme.surfaceAlt,
                  border:`1px solid ${settings?.skillLevel===level?theme.accentDim:theme.border}`,
                  borderRadius:"10px",cursor:"pointer",
                  fontSize:"10px",fontWeight:"600",color:settings?.skillLevel===level?theme.accent:theme.textMuted,
                  fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",
                }}>
                  {level}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Throw Distance Baseline */}
        <div style={{marginBottom:"24px"}}>
          <div style={s.slabel}>Typical Driver Distance</div>
          <div style={s.card}>
            <div style={{fontSize:"11px",color:theme.textMuted,marginBottom:"12px"}}>Seeds recommendations before round history builds up</div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {[{key:"under200",label:"Under 200ft"},{key:"200to300",label:"200–300ft"},{key:"300to400",label:"300–400ft"},{key:"over400",label:"400ft+"}].map(opt=>(
                <div key={opt.key} onClick={()=>updateSetting("driverDistance",opt.key)} style={{
                  flex:"1 0 calc(50% - 4px)",padding:"12px 8px",textAlign:"center",
                  background:settings?.driverDistance===opt.key?theme.accentGlow:theme.surfaceAlt,
                  border:`1px solid ${settings?.driverDistance===opt.key?theme.accentDim:theme.border}`,
                  borderRadius:"10px",cursor:"pointer",
                  fontSize:"11px",color:settings?.driverDistance===opt.key?theme.accent:theme.textMuted,
                  fontFamily:"'DM Mono',monospace",
                }}>
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outdoor Mode Toggle */}
        <div style={{marginBottom:"24px"}}>
          <div style={s.slabel}>On-Course Mode</div>
          <div style={s.card}>
            <div style={{...s.row,borderBottom:"none"}}>
              <div>
                <div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>Outdoor Mode</div>
                <div style={{fontSize:"11px",color:theme.textMuted,marginTop:"2px"}}>Maximum contrast for sunlight. Larger text and buttons.</div>
              </div>
              <div onClick={()=>updateSetting("outdoorMode",!settings.outdoorMode)} style={{
                width:"52px",height:"28px",borderRadius:"14px",cursor:"pointer",
                background:settings.outdoorMode?theme.accent:theme.surfaceAlt,
                border:`1px solid ${settings.outdoorMode?theme.accentDim:theme.border}`,
                position:"relative",transition:"all 0.2s",flexShrink:0,
              }}>
                <div style={{
                  position:"absolute",top:"3px",
                  left:settings.outdoorMode?"26px":"3px",
                  width:"20px",height:"20px",borderRadius:"50%",
                  background:settings.outdoorMode?theme.bg:"#555",
                  transition:"left 0.2s",
                }}/>
              </div>
            </div>
          </div>
        </div>

        {[
          {label:"Preferences",items:[{icon:"📏",label:"Distance Units",value:"Feet"},{icon:"💨",label:"Wind Display",value:"mph"}]},
          {label:"Integrations",items:[{icon:"🔗",label:"UDisc",value:"Coming Soon"}]},
          {label:"About",items:[{icon:"📱",label:"Version",value:"0.8.0 (Week 8)"},{icon:"🏗️",label:"Build",value:"May 2026"}]},
        ].map(group=>(
          <div key={group.label} style={{marginBottom:"24px"}}>
            <div style={s.slabel}>{group.label}</div>
            <div style={s.card}>
              {group.items.map((item,i)=>(
                <div key={item.label} style={{...s.row,borderBottom:i===group.items.length-1?"none":`1px solid ${theme.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span style={{fontSize:"16px"}}>{item.icon}</span><span style={{fontSize:"12px",color:theme.textMuted}}>{item.label}</span></div>
                  <span style={{fontSize:"12px",color:theme.textMuted}}>{item.value} ›</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{marginBottom:"24px"}}>
          <div style={s.slabel}>Data</div>
          <div style={s.card}>
            <div style={{...s.row,borderBottom:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span>🎒</span><span style={{fontSize:"12px",color:theme.textMuted}}>Discs in bag</span></div>
              <span style={{fontSize:"13px",color:theme.accent,fontWeight:"700"}}>{bag.length}</span>
            </div>
          </div>
          <button style={s.btnDanger} onClick={clearAll}>🗑️ Clear All Data</button>
        </div>

        <div style={{...s.card,textAlign:"center"}}>
          <div style={{fontSize:"11px",color:theme.textDim,lineHeight:1.8}}>Chain Hound 🐕⛓️<br/>Week 8 of 11 · Built with Claude AI<br/>AI caddie active — add discs + go play! 🐕</div>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
const navItems = [
  {key:"home",label:"Home",icon:"⛳"},
  {key:"bag",label:"Bag",icon:"🎒"},
  {key:"round",label:"Round",icon:"🥏"},
  {key:"settings",label:"Settings",icon:"⚙️"},
];

export default function App() {
  const [tab,setTab] = useState("home");
  const [bag,setBag] = useState(loadBag);
  const [settings,setSettings] = useState(() => {
    const s = loadSettings();
    return { dominantHand: "right", skillLevel: "intermediate", driverDistance: "200to300", outdoorMode: false, ...s };
  });

  // Apply outdoor theme globally when setting changes
  useEffect(() => {
    theme = settings.outdoorMode ? THEME_OUTDOOR : THEME_NORMAL;
  }, [settings.outdoorMode]);

  const t = getTheme(settings.outdoorMode);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        body{background:${t.bg};}
        ::-webkit-scrollbar{width:0;}
        input::placeholder{color:${t.textDim};}
        select option{background:${t.surface};}
      `}</style>
      <div style={{...s.app, background: t.bg, color: t.text, fontFamily:"'DM Mono','Courier New',monospace"}}>
        <div style={{flex:1,overflowY:"auto"}}>
          {tab==="home" && <HomeScreen setTab={setTab} bag={bag} settings={settings} outdoor={settings.outdoorMode}/>}
          {tab==="bag" && <BagScreen bag={bag} setBag={setBag} outdoor={settings.outdoorMode}/>}
          {tab==="round" && <RoundScreen bag={bag} settings={settings} outdoor={settings.outdoorMode}/>}
          {tab==="settings" && <SettingsScreen bag={bag} setBag={setBag} settings={settings} setSettings={setSettings} outdoor={settings.outdoorMode}/>}
        </div>
        <div style={{...s.nav, background:t.surface, borderTop:`1px solid ${t.border}`}}>
          {navItems.map(item=>{
            const active=tab===item.key;
            return (
              <div key={item.key} style={s.navItem} onClick={()=>setTab(item.key)}>
                <div style={{fontSize:"22px",lineHeight:1,filter:active?"none":"grayscale(1) opacity(0.4)",transform:active?"scale(1.15)":"scale(1)",transition:"all 0.2s"}}>{item.icon}</div>
                <div style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"500",color:active?t.accent:t.textDim}}>{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
