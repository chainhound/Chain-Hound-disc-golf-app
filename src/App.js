import { useState, useRef, useEffect, useCallback } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const THEME_NORMAL = {
  bg: "#FFFFFF",           // white background everywhere
  surface: "#00A651",      // green cards/boxes
  surfaceAlt: "#007A3D",   // darker green for inner boxes
  border: "#007A3D",       // green border
  accent: "#FFFFFF",       // white text on green
  accentDim: "#00C860",    // lighter green for highlights
  accentGlow: "rgba(0,166,81,0.15)",
  text: "#111111",         // dark text on white backgrounds
  textMuted: "#FFFFFF",    // white text on green surfaces
  textDim: "#555555",      // medium gray for secondary text on white
  warning: "#F5A623",
  error: "#E53935",
  cardBg: "#00A651",
  headerBg: "#FFFFFF",
  // Extra tokens for the light theme
  greenDark: "#007A3D",
  greenMid: "#00A651",
  greenLight: "#00C860",
  onGreen: "#FFFFFF",      // text color when on green background
  onWhite: "#111111",      // text color when on white background
};
const THEME_OUTDOOR = {
  bg: "#000000", surface: "#0D0D0D", surfaceAlt: "#1A1A1A",
  border: "#404040", accent: "#00FF55", accentDim: "#007722",
  accentGlow: "rgba(0,255,85,0.2)", text: "#FFFFFF",
  textMuted: "#CCCCCC", textDim: "#666666",
  warning: "#FFD700", error: "#FF4444",
};
const getTheme = (outdoor) => outdoor ? THEME_OUTDOOR : THEME_NORMAL;
let theme = THEME_NORMAL;

const s = {
  app: { background: "#FFFFFF", minHeight: "100vh", maxWidth: "430px", margin: "0 auto", display: "flex", flexDirection: "column", fontFamily: "'DM Mono','Courier New',monospace", color: "#111111" },
  header: { padding: "52px 24px 16px", borderBottom: "1px solid #E0E0E0", background: "#FFFFFF", position: "relative" },
  htitle: { fontSize: "11px", letterSpacing: "0.25em", color: theme.accent, textTransform: "uppercase", marginBottom: "4px", fontWeight: "500" },
  hmain: { fontSize: "26px", fontWeight: "700", color: theme.text, letterSpacing: "-0.02em", fontFamily: "'DM Sans',sans-serif" },
  content: { flex: 1, overflowY: "auto", padding: "24px", paddingBottom: "100px" },
  card: { background: "#00A651", border: "1px solid #007A3D", borderRadius: "16px", padding: "20px", marginBottom: "16px" },
  cardAccent: { background: "#007A3D", border: "1px solid #005C2E", borderRadius: "16px", padding: "20px", marginBottom: "16px" },
  slabel: { fontSize: "10px", letterSpacing: "0.2em", color: "#FFFFFF", textTransform: "uppercase", marginBottom: "12px", fontWeight: "500" },
  btn: { background: "#00A651", color: "#FFFFFF", border: "none", borderRadius: "12px", padding: "14px 24px", fontSize: "13px", fontWeight: "700", letterSpacing: "0.05em", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },
  btnOut: { background: "transparent", color: "#00A651", border: "1px solid #00A651", borderRadius: "12px", padding: "13px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },
  btnDanger: { background: "transparent", color: "#E53935", border: "1px solid rgba(229,57,53,0.4)", borderRadius: "12px", padding: "13px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },
  input: { background: "#F5F5F5", border: "1px solid #CCCCCC", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#111111", width: "100%", fontFamily: "'DM Mono',monospace", outline: "none", boxSizing: "border-box" },
  label: { fontSize: "10px", letterSpacing: "0.15em", color: "#FFFFFF", textTransform: "uppercase", marginBottom: "6px", display: "block", fontWeight: "500" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.2)" },
  tag: { display: "inline-block", background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: "6px", padding: "3px 10px", fontSize: "11px", color: theme.textMuted },
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "#FFFFFF", borderTop: "1px solid #E0E0E0", display: "flex", padding: "12px 0 24px", zIndex: 100 },
  navItem: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer", padding: "4px 0" },
};

// ─── Disc Types & Brands ──────────────────────────────────────────────────────
const DISC_TYPES = [
  { key: "distance_driver", label: "Distance Driver", icon: "💨" },
  { key: "fairway_driver", label: "Fairway Driver", icon: "🌬️" },
  { key: "midrange", label: "Midrange", icon: "🎯" },
  { key: "putter", label: "Putter", icon: "🕳️" },
];
const BRANDS = ["Innova","Discraft","Dynamic Discs","MVP","Axiom","Latitude 64","Westside","Prodigy","Kastaplast","Disc Mania","Viking Discs","Other"];
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
  "Disc Mania":["C-Line","S-Line","P-Line","D-Line","Metal Flake","Other"],
  "Viking Discs":["Ground","Ocean","Storm","Neon","Other"],
  "Other":["Other"],
};

// ─── Disc Database (existing + Disc Mania + Viking) ───────────────────────────
const DISC_DATABASE = [
  // INNOVA Distance Drivers
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
  // DISCRAFT Distance Drivers
  {name:"Nuke",brand:"Discraft",type:"distance_driver",speed:13,glide:5,turn:-1,fade:3},
  {name:"Zeus",brand:"Discraft",type:"distance_driver",speed:12,glide:5,turn:-1,fade:2},
  {name:"Anax",brand:"Discraft",type:"distance_driver",speed:12,glide:6,turn:-2,fade:2},
  {name:"Hades",brand:"Discraft",type:"distance_driver",speed:12,glide:6,turn:-3,fade:2},
  {name:"Force",brand:"Discraft",type:"distance_driver",speed:11,glide:5,turn:0,fade:3},
  {name:"Crank",brand:"Discraft",type:"distance_driver",speed:13,glide:5,turn:-2,fade:2},
  {name:"Nuke SS",brand:"Discraft",type:"distance_driver",speed:13,glide:5,turn:-3,fade:3},
  {name:"Predator",brand:"Discraft",type:"distance_driver",speed:13,glide:4,turn:0,fade:3},
  // DYNAMIC DISCS Distance Drivers
  {name:"Maverick",brand:"Dynamic Discs",type:"distance_driver",speed:11,glide:5,turn:-2,fade:2},
  {name:"Escape",brand:"Dynamic Discs",type:"distance_driver",speed:11,glide:5,turn:-2,fade:2},
  {name:"Trespass",brand:"Dynamic Discs",type:"distance_driver",speed:12,glide:5,turn:-1,fade:3},
  {name:"Sheriff",brand:"Dynamic Discs",type:"distance_driver",speed:14,glide:5,turn:-0.5,fade:3},
  {name:"Renegade",brand:"Dynamic Discs",type:"distance_driver",speed:11,glide:6,turn:-3,fade:2},
  // MVP/AXIOM Distance Drivers
  {name:"Octane",brand:"MVP",type:"distance_driver",speed:13,glide:5,turn:-1,fade:3},
  {name:"Tesla",brand:"MVP",type:"distance_driver",speed:12,glide:5,turn:-1,fade:2},
  {name:"Catalyst",brand:"MVP",type:"distance_driver",speed:13,glide:6,turn:-2,fade:2},
  {name:"Defy",brand:"Axiom",type:"distance_driver",speed:14,glide:6,turn:-2,fade:2},
  {name:"Mayhem",brand:"Axiom",type:"distance_driver",speed:12,glide:6,turn:-2,fade:2},
  // KASTAPLAST
  {name:"Falk",brand:"Kastaplast",type:"distance_driver",speed:11,glide:5,turn:-1,fade:2},
  {name:"Lots",brand:"Kastaplast",type:"distance_driver",speed:13,glide:5,turn:-1,fade:3},
  // LATITUDE 64
  {name:"Ballista",brand:"Latitude 64",type:"distance_driver",speed:14,glide:6,turn:-1,fade:3},
  {name:"Missilen",brand:"Latitude 64",type:"distance_driver",speed:14,glide:4,turn:0,fade:4},
  // DISC MANIA Distance Drivers
  {name:"Toro",brand:"Disc Mania",type:"distance_driver",speed:11,glide:5,turn:0,fade:3},
  {name:"Essence",brand:"Disc Mania",type:"distance_driver",speed:12,glide:6,turn:-2,fade:1},
  {name:"Escape DD",brand:"Disc Mania",type:"distance_driver",speed:12,glide:5,turn:-2,fade:2},
  {name:"Exo",brand:"Disc Mania",type:"distance_driver",speed:13,glide:6,turn:-2,fade:2},
  {name:"PD",brand:"Disc Mania",type:"distance_driver",speed:10,glide:4,turn:0,fade:3},
  {name:"PD2",brand:"Disc Mania",type:"distance_driver",speed:12,glide:5,turn:0,fade:4},
  {name:"DD",brand:"Disc Mania",type:"distance_driver",speed:13,glide:5,turn:-1,fade:3},
  {name:"DD2",brand:"Disc Mania",type:"distance_driver",speed:13,glide:6,turn:-2,fade:2},
  {name:"DD3",brand:"Disc Mania",type:"distance_driver",speed:13,glide:6,turn:-1,fade:3},
  // VIKING Distance Drivers
  {name:"Dragon",brand:"Viking Discs",type:"distance_driver",speed:13,glide:5,turn:-1,fade:3},
  {name:"Barbarian",brand:"Viking Discs",type:"distance_driver",speed:12,glide:5,turn:0,fade:3},
  {name:"Berserker",brand:"Viking Discs",type:"distance_driver",speed:14,glide:6,turn:-2,fade:2},
  {name:"Warship",brand:"Viking Discs",type:"distance_driver",speed:11,glide:5,turn:-2,fade:2},
  {name:"Ragnarok",brand:"Viking Discs",type:"distance_driver",speed:11,glide:5,turn:-1,fade:2},
  // INNOVA Fairway Drivers
  {name:"Leopard",brand:"Innova",type:"fairway_driver",speed:7,glide:5,turn:-2,fade:1},
  {name:"Leopard3",brand:"Innova",type:"fairway_driver",speed:7,glide:5,turn:-2,fade:1},
  {name:"Valkyrie",brand:"Innova",type:"fairway_driver",speed:9,glide:4,turn:-2,fade:2},
  {name:"Roadrunner",brand:"Innova",type:"fairway_driver",speed:9,glide:5,turn:-4,fade:1},
  {name:"Teebird",brand:"Innova",type:"fairway_driver",speed:7,glide:5,turn:0,fade:2},
  {name:"Teebird3",brand:"Innova",type:"fairway_driver",speed:7,glide:5,turn:-1,fade:2},
  {name:"Sidewinder",brand:"Innova",type:"fairway_driver",speed:9,glide:5,turn:-3,fade:1},
  {name:"Banshee",brand:"Innova",type:"fairway_driver",speed:9,glide:4,turn:0,fade:3},
  // DISCRAFT Fairway Drivers
  {name:"Surge",brand:"Discraft",type:"fairway_driver",speed:9,glide:5,turn:-2,fade:2},
  {name:"Undertaker",brand:"Discraft",type:"fairway_driver",speed:9,glide:5,turn:-1,fade:2},
  {name:"Thrasher",brand:"Discraft",type:"fairway_driver",speed:10,glide:5,turn:-2,fade:2},
  {name:"Stalker",brand:"Discraft",type:"fairway_driver",speed:9,glide:5,turn:-1,fade:2},
  {name:"Heat",brand:"Discraft",type:"fairway_driver",speed:9,glide:6,turn:-3,fade:1},
  // DYNAMIC DISCS Fairway Drivers
  {name:"Insanity",brand:"Dynamic Discs",type:"fairway_driver",speed:9,glide:5,turn:-2,fade:2},
  {name:"Getaway",brand:"Dynamic Discs",type:"fairway_driver",speed:9,glide:5,turn:-2,fade:1},
  {name:"Freedom",brand:"Dynamic Discs",type:"fairway_driver",speed:9,glide:6,turn:-3,fade:1},
  {name:"Crave",brand:"Dynamic Discs",type:"fairway_driver",speed:10,glide:6,turn:-2,fade:2},
  // DISC MANIA Fairway Drivers
  {name:"FD",brand:"Disc Mania",type:"fairway_driver",speed:9,glide:6,turn:-3,fade:1},
  {name:"FD2",brand:"Disc Mania",type:"fairway_driver",speed:9,glide:5,turn:-1,fade:2},
  {name:"FD3",brand:"Disc Mania",type:"fairway_driver",speed:9,glide:5,turn:0,fade:3},
  {name:"CD",brand:"Disc Mania",type:"fairway_driver",speed:8,glide:6,turn:-2,fade:1},
  {name:"CD2",brand:"Disc Mania",type:"fairway_driver",speed:9,glide:5,turn:-2,fade:2},
  {name:"CD3",brand:"Disc Mania",type:"fairway_driver",speed:10,glide:5,turn:-1,fade:3},
  // VIKING Fairway Drivers
  {name:"Shield",brand:"Viking Discs",type:"fairway_driver",speed:9,glide:5,turn:-1,fade:2},
  {name:"Storm",brand:"Viking Discs",type:"fairway_driver",speed:9,glide:6,turn:-3,fade:1},
  {name:"Valhalla",brand:"Viking Discs",type:"fairway_driver",speed:8,glide:5,turn:-2,fade:2},
  // INNOVA Midranges
  {name:"Roc",brand:"Innova",type:"midrange",speed:4,glide:4,turn:0,fade:3},
  {name:"Roc3",brand:"Innova",type:"midrange",speed:5,glide:4,turn:0,fade:3},
  {name:"Mako3",brand:"Innova",type:"midrange",speed:5,glide:5,turn:0,fade:0},
  {name:"Stingray",brand:"Innova",type:"midrange",speed:4,glide:6,turn:-3,fade:0},
  {name:"Shark",brand:"Innova",type:"midrange",speed:4,glide:4,turn:0,fade:2},
  {name:"Atlas",brand:"Innova",type:"midrange",speed:5,glide:5,turn:-1,fade:1},
  // DISCRAFT Midranges
  {name:"Buzzz",brand:"Discraft",type:"midrange",speed:5,glide:4,turn:-1,fade:1},
  {name:"Meteor",brand:"Discraft",type:"midrange",speed:5,glide:5,turn:-3,fade:1},
  {name:"Comet",brand:"Discraft",type:"midrange",speed:4,glide:5,turn:-2,fade:1},
  {name:"Wasp",brand:"Discraft",type:"midrange",speed:5,glide:4,turn:0,fade:3},
  // DYNAMIC DISCS Midranges
  {name:"Truth",brand:"Dynamic Discs",type:"midrange",speed:5,glide:5,turn:-1,fade:1},
  {name:"Verdict",brand:"Dynamic Discs",type:"midrange",speed:5,glide:4,turn:-1,fade:2},
  // KASTAPLAST Midranges
  {name:"Berg",brand:"Kastaplast",type:"midrange",speed:3,glide:1,turn:0,fade:3},
  {name:"Grym",brand:"Kastaplast",type:"midrange",speed:9,glide:5,turn:-1,fade:2},
  // DISC MANIA Midranges
  {name:"MD",brand:"Disc Mania",type:"midrange",speed:5,glide:5,turn:0,fade:2},
  {name:"MD2",brand:"Disc Mania",type:"midrange",speed:5,glide:6,turn:-2,fade:1},
  {name:"MD3",brand:"Disc Mania",type:"midrange",speed:5,glide:6,turn:-3,fade:1},
  {name:"MD4",brand:"Disc Mania",type:"midrange",speed:5,glide:5,turn:0,fade:3},
  {name:"MD5",brand:"Disc Mania",type:"midrange",speed:5,glide:5,turn:-1,fade:1},
  // VIKING Midranges
  {name:"Lynx",brand:"Viking Discs",type:"midrange",speed:5,glide:5,turn:-1,fade:2},
  {name:"Wolf",brand:"Viking Discs",type:"midrange",speed:4,glide:4,turn:0,fade:2},
  {name:"Axe",brand:"Viking Discs",type:"midrange",speed:4,glide:3,turn:0,fade:1},
  // INNOVA Putters
  {name:"Aviar",brand:"Innova",type:"putter",speed:2,glide:3,turn:0,fade:1},
  {name:"Aviar3",brand:"Innova",type:"putter",speed:2,glide:3,turn:0,fade:1},
  {name:"KC Pro Aviar",brand:"Innova",type:"putter",speed:2,glide:3,turn:0,fade:2},
  {name:"Pig",brand:"Innova",type:"putter",speed:3,glide:1,turn:0,fade:3},
  {name:"Nova",brand:"Innova",type:"putter",speed:2,glide:5,turn:-2,fade:0},
  {name:"Dart",brand:"Innova",type:"putter",speed:3,glide:4,turn:-2,fade:0},
  // DISCRAFT Putters
  {name:"Luna",brand:"Discraft",type:"putter",speed:3,glide:3,turn:0,fade:2},
  {name:"Zone",brand:"Discraft",type:"putter",speed:4,glide:3,turn:0,fade:3},
  {name:"Banger GT",brand:"Discraft",type:"putter",speed:2,glide:3,turn:0,fade:2},
  {name:"Challenger",brand:"Discraft",type:"putter",speed:2,glide:3,turn:0,fade:1},
  {name:"Magnet",brand:"Discraft",type:"putter",speed:2,glide:5,turn:-2,fade:0},
  {name:"Fierce",brand:"Discraft",type:"putter",speed:3,glide:4,turn:-1,fade:1},
  // DYNAMIC DISCS Putters
  {name:"Judge",brand:"Dynamic Discs",type:"putter",speed:2,glide:4,turn:0,fade:1},
  {name:"Warden",brand:"Dynamic Discs",type:"putter",speed:2,glide:4,turn:0,fade:1},
  {name:"Marshal",brand:"Dynamic Discs",type:"putter",speed:3,glide:4,turn:0,fade:2},
  // MVP/AXIOM Putters
  {name:"Anode",brand:"MVP",type:"putter",speed:2,glide:4,turn:-1,fade:0},
  {name:"Atom",brand:"MVP",type:"putter",speed:2,glide:4,turn:0,fade:1},
  {name:"Axiom Envy",brand:"Axiom",type:"putter",speed:3,glide:4,turn:-1,fade:1},
  // KASTAPLAST Putters
  {name:"Gote",brand:"Kastaplast",type:"putter",speed:2,glide:3,turn:0,fade:2},
  // LATITUDE 64 Distance Drivers
  {name:"Ballista Pro",brand:"Latitude 64",type:"distance_driver",speed:14,glide:6,turn:-1,fade:3},
  {name:"Flow",brand:"Latitude 64",type:"distance_driver",speed:11,glide:5,turn:-2,fade:2},
  {name:"Raketen",brand:"Latitude 64",type:"distance_driver",speed:14,glide:5,turn:0,fade:4},
  // LATITUDE 64 Fairway Drivers
  {name:"River",brand:"Latitude 64",type:"fairway_driver",speed:9,glide:6,turn:-3,fade:1},
  {name:"Jade",brand:"Latitude 64",type:"fairway_driver",speed:9,glide:5,turn:-2,fade:2},
  {name:"Saint Pro",brand:"Latitude 64",type:"fairway_driver",speed:9,glide:6,turn:-1,fade:2},
  {name:"Compass",brand:"Latitude 64",type:"fairway_driver",speed:7,glide:5,turn:-1,fade:2},
  // LATITUDE 64 Midranges
  {name:"Fuse",brand:"Latitude 64",type:"midrange",speed:5,glide:6,turn:-2,fade:1},
  {name:"Keystone",brand:"Latitude 64",type:"midrange",speed:4,glide:5,turn:-1,fade:2},
  // LATITUDE 64 Putters
  {name:"Pure",brand:"Latitude 64",type:"putter",speed:2,glide:4,turn:0,fade:0},
  {name:"Mercy",brand:"Latitude 64",type:"putter",speed:2,glide:3,turn:0,fade:1},
  {name:"Royal Pure",brand:"Latitude 64",type:"putter",speed:2,glide:4,turn:0,fade:0},
  // DISC MANIA Putters
  {name:"P1",brand:"Disc Mania",type:"putter",speed:3,glide:3,turn:0,fade:2},
  {name:"P2",brand:"Disc Mania",type:"putter",speed:3,glide:4,turn:-1,fade:1},
  {name:"P1x",brand:"Disc Mania",type:"putter",speed:3,glide:3,turn:0,fade:1},
  {name:"Psycho",brand:"Disc Mania",type:"putter",speed:2,glide:4,turn:-1,fade:1},
  // VIKING Putters
  {name:"Rune",brand:"Viking Discs",type:"putter",speed:2,glide:4,turn:0,fade:1},
  {name:"Plow",brand:"Viking Discs",type:"putter",speed:3,glide:3,turn:0,fade:2},
];

// ─── Week 3: Sabo Park Hole Data (field test June 7, 2026) ────────────────────
const SABO_PARK_HOLES = [
  {
    number:1, distance:213, par:3, elevation:"flat",
    ob:["road right entire hole","OB cuts left near basket"],
    obstacles:[
      {type:"trees",location:"left of tee",distance:10},
      {type:"trees",location:"right of tee",distance:10},
      {type:"tree cluster",location:"around basket",distance:0},
    ],
    shotLines:[
      {id:"A",label:"Safe left hyzer",description:"Avoid OB road right, controlled hyzer fade into basket",throwType:"backhand"},
      {id:"B",label:"Forehand fade right",description:"Tight window right of tee trees, avoids left line, forehand finish",throwType:"forehand"},
    ],
    notes:"Road OB right entire hole. OB cuts left near basket. Trees bunched around basket. Tight hole — control over distance.",
    shape:"straight", hazards:"trees_both_sides ob_right",
  },
  {
    number:2, distance:345, par:3, elevation:"flat",
    ob:[],
    obstacles:[
      {type:"trees",location:"right (heavy)",distance:15},
      {type:"low hanging trees",location:"fairway",distance:0},
      {type:"pine cluster",location:"in front of basket",distance:20},
    ],
    shotLines:[
      {id:"A",label:"Straight forehand low",description:"Low release under hanging trees, basket right side, forehand ideal",throwType:"forehand"},
      {id:"B",label:"Short straight backhand",description:"Narrow pathway straight from tee, putter or midrange only",throwType:"backhand"},
    ],
    notes:"Short narrow pathway. Low hanging trees — forehand ideal. Pine cluster in front of basket. Within 30ft just putt.",
    shape:"straight", hazards:"trees_right tight",
  },
  {
    number:3, distance:132, par:3, elevation:"flat",
    ob:[],
    obstacles:[
      {type:"2 big trees",location:"left, 10-15ft from tee",distance:12},
      {type:"tree",location:"right of tee, 5-10ft",distance:7},
      {type:"tree",location:"right, 25ft up fairway",distance:25},
      {type:"skinny tree",location:"directly in front of basket ~25ft out",distance:195},
    ],
    shotLines:[
      {id:"A",label:"Thread right of left trees",description:"Aim right of the two big left trees, avoid skinny basket blocker",throwType:"backhand"},
      {id:"B",label:"Left hyzer approach",description:"Clear left trees high, land left of basket blocker on approach angle",throwType:"backhand"},
    ],
    notes:"132ft short hole. Two big trees left 10-15ft from tee. Tree right of tee 5-10ft. Skinny tree directly in front of basket ~25ft out. RIGHT SIDE SWAMP — OB right slopes into swamp/poison ivy. Stay left.",
    shape:"straight", hazards:"trees_both_sides",
  },
  {
    number:4, distance:241, par:3, elevation:"uphill",
    ob:["OB right"],
    obstacles:[
      {type:"tree line",location:"left fairway",distance:0},
      {type:"tree",location:"front left, ~10ft from tee",distance:10},
      {type:"tree",location:"front right, ~10ft from tee",distance:10},
    ],
    shotLines:[
      {id:"A",label:"Safe center hyzer",description:"Avoid OB right and tree line left, uphill hyzer fade to basket",throwType:"backhand"},
      {id:"B",label:"Forehand push right",description:"Risky — OB right, needs very controlled fade, more distance",throwType:"forehand"},
    ],
    notes:"262ft uphill. Tree line left. OB right. Trees front left and right ~10ft. Plays longer than 262ft — add 20-30ft to disc selection.",
    shape:"straight", hazards:"trees_left ob_right",
  },
  {
    number:5, distance:238, par:3, elevation:"flat",
    ob:[],
    obstacles:[
      {type:"trees",location:"left of tee, ~10ft",distance:10},
      {type:"trees",location:"right of tee, ~10ft",distance:10},
      {type:"trees",location:"both sides every 20-30ft down fairway",distance:25},
      {type:"trees",location:"surrounding basket left-center",distance:0},
    ],
    shotLines:[
      {id:"A",label:"Center tunnel backhand",description:"Thread the fairway corridor straight, basket left-center in trees",throwType:"backhand"},
      {id:"B",label:"Slight left approach",description:"Slight left angle to reach basket through gap in surrounding trees",throwType:"backhand"},
    ],
    notes:"Trees left and right of tee ~10ft. Trees both sides every 20-30ft. Basket left-center surrounded by trees. Pure tunnel hole.",
    shape:"straight", hazards:"trees_both_sides tight",
  },
  {
    number:6, distance:294, par:3, elevation:"flat",
    ob:[],
    obstacles:[
      {type:"tree",location:"right of tee, 20-30ft",distance:25},
      {type:"tree",location:"left of tee, 20-30ft",distance:25},
      {type:"BIG OAK",location:"middle of fairway ~130ft out",distance:130},
      {type:"tree",location:"30ft behind oak",distance:160},
      {type:"trees",location:"near basket right",distance:0},
    ],
    shotLines:[
      {id:"A",label:"Left of oak",description:"Go left around big oak ~130ft, approach basket from left side",throwType:"backhand"},
      {id:"B",label:"Right of oak (tight)",description:"Forehand right of oak, need controlled curve back to basket right",throwType:"forehand"},
      {id:"C",label:"High over oak",description:"Understable disc on anhyzer, get height over oak, ride fade down",throwType:"backhand"},
    ],
    notes:"294ft par 3. BIG OAK dead center ~130ft out — must go around or over. BARBED WIRE CHAIN LINK FENCE behind basket — high shots go behind fence OB. Scattered trees. Basket right.",
    shape:"straight", hazards:"trees_both_sides",
  },
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
    if (saved.length === 0) { localStorage.setItem("chainhound_bag", JSON.stringify(TEST_BAG)); return TEST_BAG; }
    return saved;
  } catch { return TEST_BAG; }
};
const saveBag = b => localStorage.setItem("chainhound_bag", JSON.stringify(b));

// ─── Week 3: Hole data storage ────────────────────────────────────────────────
const HOLES_KEY = "chainhound_holes_v2";

const loadHoleData = () => {
  try {
    const stored = localStorage.getItem(HOLES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  // Seed with Sabo Park on first load
  localStorage.setItem(HOLES_KEY, JSON.stringify(SABO_PARK_HOLES));
  return SABO_PARK_HOLES;
};
const saveHoleData = (holes) => localStorage.setItem(HOLES_KEY, JSON.stringify(holes));

const TEST_COURSES = [
  {
    id:"sabo-park", name:"Sabo Park", location:"Massillon, OH",
    createdAt:"2026-06-07", type:"par3",
    holes: SABO_PARK_HOLES.map(h => ({
      number: h.number, distance: h.distance, par: h.par,
      shape: h.shape, hazards: h.hazards, notes: h.notes,
      allTees:[{label:"Default",distance:h.distance}]
    }))
  },
  {
    id:"beach-city-dam", name:"Beach City Dam", createdAt:"2026-05-29",
    holes:[
      {number:1,distance:333,par:3,shape:"straight",notes:"333ft straight wooded corridor. Road OB right.",hazards:"trees_both_sides ob_right",allTees:[{label:"Short",distance:333},{label:"Long",distance:333}]},
      {number:2,distance:327,par:3,shape:"slight_dogleg_left",notes:"327ft slight dogleg left. Trees and road OB right. Open pollinator grassland left.",hazards:"trees_right ob_right",allTees:[{label:"Short",distance:327},{label:"Long",distance:441}]},
      {number:3,distance:414,par:3,shape:"straight",notes:"414ft long tight corridor. MANDO near basket — pass LEFT of mando tree.",hazards:"trees_both_sides tight",allTees:[{label:"Short",distance:414},{label:"Long",distance:540}]},
      {number:4,distance:357,par:3,shape:"slight_dogleg_left",notes:"357ft slight dogleg left. More open than neighboring holes.",hazards:"trees_both_sides",allTees:[{label:"Short",distance:357},{label:"Long",distance:456}]},
      {number:5,distance:231,par:3,shape:"straight",notes:"231ft extremely tight wooded tunnel. Chain link fence OB right. Putter only.",hazards:"trees_both_sides ob_right tight",allTees:[{label:"Short",distance:231},{label:"Long",distance:324}]},
      {number:6,distance:282,par:3,shape:"straight",notes:"282ft open fairway. Road OB both sides. Most open hole.",hazards:"ob_right ob_left",allTees:[{label:"Short",distance:282},{label:"Long",distance:405}]},
      {number:7,distance:237,par:3,shape:"slight_dogleg_left",notes:"237ft slight dogleg left. Trees right, open left.",hazards:"trees_right",allTees:[{label:"Short",distance:237},{label:"Long",distance:366}]},
      {number:8,distance:336,par:3,shape:"straight",notes:"336ft uphill. Trees both sides. Gravel path alongside — CASUAL relief.",hazards:"trees_both_sides",allTees:[{label:"Short",distance:336},{label:"Long",distance:336}]},
      {number:9,distance:363,par:3,shape:"straight",notes:"363ft straight. Gravel OB right. Stay left of gravel.",hazards:"ob_right",allTees:[{label:"Short",distance:363},{label:"Long",distance:510}]},
      {number:10,distance:384,par:3,shape:"slight_dogleg_left",notes:"384ft slight dogleg left. Trees cluster right.",hazards:"trees_right",allTees:[{label:"Short",distance:384},{label:"Long",distance:546}]},
      {number:11,distance:267,par:3,shape:"slight_dogleg_left",notes:"267ft slight left. MANDO on long tee — disc must go RIGHT.",hazards:"trees_both_sides",allTees:[{label:"Short",distance:267},{label:"Long",distance:414}]},
      {number:12,distance:276,par:3,shape:"straight",notes:"276ft straight wooded. Tight corridor.",hazards:"trees_both_sides tight",allTees:[{label:"Short",distance:276},{label:"Long",distance:276}]},
      {number:13,distance:476,par:4,shape:"straight",notes:"Par 4, 476ft. Road OB BOTH sides. Keep center.",hazards:"ob_left ob_right",allTees:[{label:"Short",distance:476},{label:"Long",distance:608}]},
      {number:14,distance:267,par:3,shape:"straight",notes:"267ft uphill. Trees right. Aim slightly left.",hazards:"trees_right",allTees:[{label:"Short",distance:267},{label:"Long",distance:267}]},
      {number:15,distance:700,par:5,shape:"dogleg_left",notes:"MONSTER 700ft par 5. Big sweeping left. Cement OB.",hazards:"ob_right trees_right",allTees:[{label:"Short",distance:700},{label:"Long",distance:918}]},
      {number:16,distance:200,par:3,shape:"straight",notes:"200ft extremely tight wooded tunnel. Putter only.",hazards:"trees_both_sides tight",allTees:[{label:"Short",distance:200},{label:"Long",distance:252}]},
      {number:17,distance:615,par:4,shape:"straight",notes:"615ft par 4. Tight wooded corridor.",hazards:"trees_both_sides tight",allTees:[{label:"Short",distance:615},{label:"Long",distance:744}]},
      {number:18,distance:369,par:3,shape:"straight",notes:"Finishing hole. 369ft straight to basket near parking.",hazards:"trees_both_sides",allTees:[{label:"Short",distance:369},{label:"Long",distance:525}]},
    ]
  }
];

const loadCourses = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("chainhound_courses")||"[]");
    if (saved.length === 0) { localStorage.setItem("chainhound_courses", JSON.stringify(TEST_COURSES)); return TEST_COURSES; }
    return saved;
  } catch { return TEST_COURSES; }
};
const saveCourses = c => localStorage.setItem("chainhound_courses", JSON.stringify(c));

const DEFAULT_SETTINGS = { dominantHand: "right", skillLevel: "intermediate", driverDistance: "200to300" };
const loadSettings = () => { try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("chainhound_settings")||"{}") }; } catch { return DEFAULT_SETTINGS; } };
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

// ─── Hole Diagram SVG ─────────────────────────────────────────────────────────
function HoleDiagram({ hole, shots = [] }) {
  const W = 280, H = 200;
  const shape = hole?.shape || "straight";
  const dist = hole?.distance || 300;
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
    if (shape === "dogleg_left") return `M${tee.x},${tee.y} L${mid.x-10},${tee.y} Q${mid.x+40},${tee.y-10} ${basket.x},${basket.y}`;
    if (shape === "slight_dogleg_left") return `M${tee.x},${tee.y} L${mid.x},${tee.y} Q${mid.x+35},${tee.y} ${basket.x},${basket.y}`;
    if (shape === "dogleg_right") return `M${tee.x},${tee.y} L${mid.x-10},${tee.y} Q${mid.x+40},${tee.y+10} ${basket.x},${basket.y}`;
    if (shape === "slight_dogleg_right") return `M${tee.x},${tee.y} L${mid.x},${tee.y} Q${mid.x+35},${tee.y} ${basket.x},${basket.y}`;
    return `M${tee.x},${tee.y} L${basket.x},${basket.y}`;
  };
  const getShotPos = (shot) => {
    const pct = Math.min(1, Math.max(0, shot.distFromTee / dist));
    const x = tee.x + pct * (basket.x - tee.x);
    const y = tee.y + pct * (basket.y - tee.y);
    const dx = basket.x - tee.x, dy = basket.y - tee.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    const perpX = -dy/len, perpY = dx/len;
    const offsetAmt = shot.position === "left" ? -20 : shot.position === "right" ? 20 : 0;
    return { x: x + perpX*offsetAmt, y: y + perpY*offsetAmt };
  };
  const treesTop = has("trees_left") || has("trees_both_sides") || has("tight");
  const treesBottom = has("trees_right") || has("trees_both_sides") || has("tight");
  const obTop = has("water_left_ob") || has("ob_left");
  const obBottom = hasAny("ob_right", "ob_right_parking", "ob_right_building", "ob_right_cement");
  const hasMando = has("mando_pole");
  const isWater = has("water_left_ob");
  const fairwayPath = getFairway();
  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <rect width={W} height={H} fill="#F0F0F0" rx="10"/>
        {treesTop && (<><rect x={tee.x} y={0} width={basket.x - tee.x} height={H*0.24} fill="rgba(20,70,20,0.65)" rx="4"/><text x={tee.x+6} y={15} fontSize="10" fill="#6ABF6A">🌲</text></>)}
        {treesBottom && (<><rect x={tee.x} y={H*0.76} width={basket.x - tee.x} height={H*0.24} fill="rgba(20,70,20,0.65)" rx="4"/><text x={tee.x+6} y={H-3} fontSize="10" fill="#6ABF6A">🌲</text></>)}
        {obTop && (<><rect x={tee.x} y={0} width={basket.x - tee.x} height={H*0.18} fill={isWater ? "rgba(30,100,200,0.4)" : "rgba(220,60,60,0.35)"} rx="4"/><text x={tee.x+6} y={14} fontSize="9" fill={isWater ? "#60BFFF" : "#FF8888"}>{isWater ? "💧 OB" : "⚠️ OB"}</text></>)}
        {obBottom && (<><rect x={tee.x} y={H*0.82} width={basket.x - tee.x} height={H*0.18} fill="rgba(220,60,60,0.35)" rx="4"/><text x={tee.x+6} y={H-2} fontSize="9" fill="#FF8888">⚠️ OB</text></>)}
        <path d={fairwayPath} stroke="#0F3318" strokeWidth="36" fill="none" strokeLinecap="round"/>
        <path d={fairwayPath} stroke="#1A5C32" strokeWidth="28" fill="none" strokeLinecap="round"/>
        <path d={fairwayPath} stroke="#22783E" strokeWidth="20" fill="none" strokeLinecap="round"/>
        {[0.33, 0.66].map(pct => {
          const x = tee.x + pct * (basket.x - tee.x);
          const y = tee.y + pct * (basket.y - tee.y);
          return (<g key={pct}><line x1={x} y1={y-12} x2={x} y2={y+12} stroke={theme.textDim} strokeWidth="1" strokeDasharray="3,2"/><text x={x} y={y-15} textAnchor="middle" fontSize="8" fill={theme.textDim}>{Math.round(dist*pct)}ft</text></g>);
        })}
        {hasMando && (<g><circle cx={mid.x} cy={mid.y} r="7" fill="rgba(255,184,48,0.3)" stroke={theme.warning} strokeWidth="1.5"/><text x={mid.x} y={mid.y+4} textAnchor="middle" fontSize="8" fill={theme.warning} fontWeight="bold">M</text></g>)}
        {shots.map((shot, i) => {
          const pos = getShotPos(shot);
          const isLast = i === shots.length - 1;
          return (<g key={i}><circle cx={pos.x} cy={pos.y} r="12" fill={isLast ? theme.warning : theme.accentDim} stroke={isLast ? "#FFF" : theme.accent} strokeWidth="2" opacity="0.95"/><text x={pos.x} y={pos.y+4} textAnchor="middle" fontSize="9" fill={theme.bg} fontWeight="bold">{i+1}</text></g>);
        })}
        <rect x={tee.x-10} y={tee.y-7} width={20} height={14} fill={theme.accentDim} rx="4"/>
        <text x={tee.x} y={tee.y+4} textAnchor="middle" fontSize="7" fill={theme.accent} fontWeight="bold">TEE</text>
        <circle cx={basket.x} cy={basket.y} r="12" fill="none" stroke={theme.accent} strokeWidth="2.5"/>
        <circle cx={basket.x} cy={basket.y} r="5" fill={theme.accent}/>
        <text x={basket.x} y={basket.y+23} textAnchor="middle" fontSize="11">⛳</text>
        <text x={W/2} y={H-4} textAnchor="middle" fontSize="9" fill={theme.textMuted}>
          {hole?.name && hole.name !== "Unknown" ? `${hole.name} · ` : ""}{dist}ft · Par {hole?.par}
          {hole?.elevation === "uphill" ? " ↑" : hole?.elevation === "downhill" ? " ↓" : ""}
        </text>
      </svg>
    </div>
  );
}

// ─── TapLogger (full screen shot logger) ─────────────────────────────────────
function TapLogger({ hole, remainingDist, previousShots, onLog, onCancel }) {
  const holeDist = hole?.distance || 300;
  const svgRef = useRef(null);
  const [tapPos, setTapPos] = useState(null);
  const [mode, setMode] = useState("tap");
  const defaultThrow = Math.min(Math.round(remainingDist * 0.75), remainingDist);
  const [sliderDist, setSliderDist] = useState(defaultThrow);
  const [sliderPos, setSliderPos] = useState("center");
  const sliderRemaining = Math.max(0, remainingDist - sliderDist);
  const W = 320, H = 520;
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
  const TEE_Y = H - 60, BASKET_Y = 55;
  const shape = hole?.shape || "straight";
  const getBasketX = () => {
    if (shape === "dogleg_left") return W * 0.28;
    if (shape === "slight_dogleg_left") return W * 0.38;
    if (shape === "dogleg_right") return W * 0.72;
    if (shape === "slight_dogleg_right") return W * 0.62;
    return W / 2;
  };
  const TEE_X = W / 2, BASKET_X = getBasketX();
  const MID_X = (TEE_X + BASKET_X) / 2, MID_Y = (TEE_Y + BASKET_Y) / 2;
  const FW = isTight ? 32 : 46;
  const getFairwayPath = () => {
    if (shape === "straight") return `M${TEE_X},${TEE_Y} L${BASKET_X},${BASKET_Y}`;
    if (shape === "dogleg_left") return `M${TEE_X},${TEE_Y} L${TEE_X},${MID_Y+40} Q${TEE_X-10},${MID_Y} ${BASKET_X},${BASKET_Y}`;
    if (shape === "slight_dogleg_left") return `M${TEE_X},${TEE_Y} L${TEE_X},${MID_Y+20} Q${TEE_X-5},${MID_Y-10} ${BASKET_X},${BASKET_Y}`;
    if (shape === "dogleg_right") return `M${TEE_X},${TEE_Y} L${TEE_X},${MID_Y+40} Q${TEE_X+10},${MID_Y} ${BASKET_X},${BASKET_Y}`;
    if (shape === "slight_dogleg_right") return `M${TEE_X},${TEE_Y} L${TEE_X},${MID_Y+20} Q${TEE_X+5},${MID_Y-10} ${BASKET_X},${BASKET_Y}`;
    return `M${TEE_X},${TEE_Y} L${BASKET_X},${BASKET_Y}`;
  };
  const inferLie = (relX, relY) => {
    if (relY < 0.15) return "basket";
    if (relX < 0.08 && obLeft) return "ob";
    if (relX > 0.92 && obRight) return "ob";
    if (relX < 0.25 && treesLeft) return "trees";
    if (relX > 0.75 && treesRight) return "trees";
    if (relX < 0.38 || relX > 0.62) return "rough";
    return "fairway";
  };
  const tapToData = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (relY < 0.15) return { pct: 1.0, distFromTee: remainingDist, distRemaining: 0, position: "center", lie: "basket", isBasket: true };
    const pctFromTee = Math.min(0.99, Math.max(0.01, 1 - relY));
    const alreadyThrown = holeDist - remainingDist;
    const minPct = alreadyThrown / holeDist;
    const clampedPct = Math.max(minPct + 0.01, pctFromTee);
    const clampedDist = Math.round(clampedPct * holeDist);
    const distThisShot = Math.max(0, clampedDist - alreadyThrown);
    const distRemaining = Math.max(0, holeDist - clampedDist);
    const position = relX < 0.33 ? "left" : relX > 0.67 ? "right" : "center";
    const lie = inferLie(relX, relY);
    return { pct: clampedPct, distFromTee: distThisShot, distRemaining, position, lie, isBasket: false };
  };
  const handleTap = (e) => {
    e.preventDefault(); e.stopPropagation();
    const touch = e.touches ? e.touches[0] : e;
    setTapPos(tapToData(touch.clientX, touch.clientY));
  };
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
  const getShotXY = (shot) => {
    const pct = Math.min(1, shot.distFromTee / holeDist);
    const y = TEE_Y - pct * (TEE_Y - BASKET_Y);
    const x = TEE_X + pct * (BASKET_X - TEE_X);
    const dx = BASKET_X - TEE_X, dy = BASKET_Y - TEE_Y;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const perpX = -dy/len;
    const offset = shot.position === "left" ? -28 : shot.position === "right" ? 28 : 0;
    return { x: x + perpX*offset, y };
  };
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
      <div style={{ padding: "12px 16px 8px", background: "#0A0F0D", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: "10px", color: theme.textMuted, letterSpacing: "0.12em" }}>HOLE {hole?.number} · {remainingDist}ft REMAINING</div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: theme.text, fontFamily: "'DM Sans',sans-serif" }}>
            {tapPos ? (tapPos.isBasket ? "🎯 Tap basket to finish" : `${tapPos.distRemaining}ft left`) : "Tap where disc landed"}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <div onClick={() => setMode(mode === "tap" ? "slider" : "tap")} style={{ padding: "6px 10px", background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "10px", color: theme.textMuted, cursor: "pointer" }}>{mode === "tap" ? "📏" : "👆"}</div>
          <div onClick={onCancel} style={{ padding: "6px 10px", background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "10px", color: theme.textMuted, cursor: "pointer" }}>✕</div>
        </div>
      </div>
      {mode === "tap" ? (
        <>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ touchAction: "none", display: "block" }} onTouchStart={handleTap} onClick={handleTap}>
              <rect width={W} height={H} fill="#060E06"/>
              {treesLeft  && <rect x={0}    y={0} width={W*0.40} height={H} fill="rgba(8,35,8,0.95)"/>}
              {treesRight && <rect x={W*0.60} y={0} width={W*0.40} height={H} fill="rgba(8,35,8,0.95)"/>}
              {(treesLeft||obLeft)   && <rect x={W*0.22} y={0} width={W*0.16} height={H} fill="rgba(15,50,15,0.7)"/>}
              {(treesRight||obRight) && <rect x={W*0.62} y={0} width={W*0.16} height={H} fill="rgba(15,50,15,0.7)"/>}
              {obLeft  && <rect x={0}    y={0} width={W*0.10} height={H} fill={isWater?"rgba(20,80,180,0.75)":"rgba(180,30,30,0.75)"}/>}
              {obRight && <rect x={W*0.90} y={0} width={W*0.10} height={H} fill="rgba(180,30,30,0.75)"/>}
              <path d={getFairwayPath()} stroke="#061A0A" strokeWidth={FW+18} fill="none" strokeLinecap="round"/>
              <path d={getFairwayPath()} stroke="#155228" strokeWidth={FW+8}  fill="none" strokeLinecap="round"/>
              <path d={getFairwayPath()} stroke="#1E7A3A" strokeWidth={FW}    fill="none" strokeLinecap="round"/>
              <path d={getFairwayPath()} stroke="#28A050" strokeWidth={FW-10} fill="none" strokeLinecap="round"/>
              <path d={getFairwayPath()} stroke="rgba(255,255,255,0.07)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="10,10"/>
              {treesLeft && [0.1,0.22,0.35,0.48,0.61,0.74,0.87].map((p,i) => { const cy=BASKET_Y+p*(TEE_Y-BASKET_Y); return <g key={i}><circle cx={18} cy={cy} r={16} fill="rgba(15,60,15,0.9)" stroke="rgba(30,90,30,0.7)" strokeWidth="1.5"/><circle cx={40} cy={cy+12} r={12} fill="rgba(12,50,12,0.8)"/></g>; })}
              {treesRight && [0.1,0.22,0.35,0.48,0.61,0.74,0.87].map((p,i) => { const cy=BASKET_Y+p*(TEE_Y-BASKET_Y); return <g key={i}><circle cx={W-18} cy={cy} r={16} fill="rgba(15,60,15,0.9)" stroke="rgba(30,90,30,0.7)" strokeWidth="1.5"/><circle cx={W-40} cy={cy+12} r={12} fill="rgba(12,50,12,0.8)"/></g>; })}
              {obLeft && <text x={W*0.05} y={MID_Y} textAnchor="middle" fontSize="11" fontWeight="bold" fill={isWater?"#60BFFF":"#FF7777"} transform={`rotate(-90,${W*0.05},${MID_Y})`}>{isWater?"💧 OB":"⚠️ OB"}</text>}
              {treesLeft && !obLeft && <text x={W*0.08} y={MID_Y} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#55CC55" transform={`rotate(-90,${W*0.08},${MID_Y})`}>🌲 TREES</text>}
              {obRight && <text x={W*0.95} y={MID_Y} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FF7777" transform={`rotate(90,${W*0.95},${MID_Y})`}>⚠️ OB</text>}
              {treesRight && !obRight && <text x={W*0.92} y={MID_Y} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#55CC55" transform={`rotate(90,${W*0.92},${MID_Y})`}>🌲 TREES</text>}
              {[0.25,0.5,0.75].map(pct => { const y=TEE_Y-pct*(TEE_Y-BASKET_Y); const x=TEE_X+pct*(BASKET_X-TEE_X); return <g key={pct}><line x1={W*0.12} y1={y} x2={W*0.88} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="5,4"/><text x={x+FW/2+8} y={y+4} fontSize="11" fill="rgba(255,255,255,0.35)">{Math.round(holeDist*pct)}ft</text></g>; })}
              {hasMando && <g><circle cx={MID_X} cy={MID_Y} r="14" fill="rgba(255,184,48,0.2)" stroke={theme.warning} strokeWidth="2"/><text x={MID_X} y={MID_Y+5} textAnchor="middle" fontSize="12" fill={theme.warning} fontWeight="bold">M</text></g>}
              {(previousShots||[]).map((shot,i) => { const pos=getShotXY(shot); return <g key={i}><circle cx={pos.x} cy={pos.y} r="15" fill={theme.accentDim} stroke={theme.accent} strokeWidth="2" opacity="0.85"/><text x={pos.x} y={pos.y+5} textAnchor="middle" fontSize="11" fill="#FFF" fontWeight="bold">{i+1}</text></g>; })}
              {tapPos && tapMarkerX !== null && tapMarkerY !== null && !tapPos.isBasket && (
                <g>
                  <line x1={tapMarkerX-24} y1={tapMarkerY} x2={tapMarkerX+24} y2={tapMarkerY} stroke={tapLie.color} strokeWidth="2.5"/>
                  <line x1={tapMarkerX} y1={tapMarkerY-24} x2={tapMarkerX} y2={tapMarkerY+24} stroke={tapLie.color} strokeWidth="2.5"/>
                  <circle cx={tapMarkerX} cy={tapMarkerY} r="18" fill={`${tapLie.color}30`} stroke={tapLie.color} strokeWidth="2.5"/>
                  <text x={tapMarkerX} y={tapMarkerY+5} textAnchor="middle" fontSize="12" fill={tapLie.color} fontWeight="bold">{(previousShots?.length||0)+1}</text>
                  <rect x={tapMarkerX-44} y={tapMarkerY-50} width={88} height={26} fill="rgba(0,0,0,0.85)" rx="6"/>
                  <text x={tapMarkerX} y={tapMarkerY-32} textAnchor="middle" fontSize="12" fill={tapLie.color} fontWeight="bold">{tapPos.distRemaining===0?"At basket!":`${tapPos.distRemaining}ft left`}</text>
                </g>
              )}
              <rect x={TEE_X-22} y={TEE_Y+12} width={44} height={20} fill={theme.accentDim} rx="5"/>
              <text x={TEE_X} y={TEE_Y+26} textAnchor="middle" fontSize="9" fill={theme.accent} fontWeight="bold">TEE</text>
              <circle cx={BASKET_X} cy={BASKET_Y} r="28" fill="rgba(61,255,122,0.06)" stroke="rgba(61,255,122,0.2)" strokeWidth="1.5"/>
              <circle cx={BASKET_X} cy={BASKET_Y} r="18" fill="none" stroke={theme.accent} strokeWidth="3"/>
              <circle cx={BASKET_X} cy={BASKET_Y} r="7" fill={theme.accent}/>
              <text x={BASKET_X} y={BASKET_Y-30} textAnchor="middle" fontSize="16">⛳</text>
              <text x={BASKET_X} y={BASKET_Y+36} textAnchor="middle" fontSize="10" fill={theme.accent}>TAP TO FINISH</text>
              {tapPos?.isBasket && <circle cx={BASKET_X} cy={BASKET_Y} r="30" fill="rgba(61,255,122,0.25)" stroke={theme.accent} strokeWidth="3"/>}
              {!tapPos && <text x={W/2} y={H/2+10} textAnchor="middle" fontSize="15" fill="rgba(255,255,255,0.2)">Tap where disc landed</text>}
            </svg>
          </div>
          {tapPos ? (
            <div style={{ padding: "14px 16px", background: "#0A0F0D", borderTop: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ flex: 1, padding: "10px 14px", background: `${tapLie.color}18`, border: `1px solid ${tapLie.color}55`, borderRadius: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: tapLie.color }}>{tapLie.label}</div>
                  <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px" }}>{tapPos.isBasket?"Hole complete!":`${tapPos.distFromTee}ft · ${tapPos.position} · ${tapPos.distRemaining}ft left`}</div>
                </div>
                <div onClick={() => setTapPos(null)} style={{ padding: "10px 14px", background: theme.surfaceAlt, border: `1px solid ${theme.border}`, borderRadius: "10px", fontSize: "12px", color: theme.textMuted, cursor: "pointer" }}>Re-tap</div>
              </div>
              <div onClick={() => onLog({ distFromTee: tapPos.distFromTee, distRemaining: tapPos.distRemaining, position: tapPos.position, lie: tapPos.lie })} style={{ background: theme.accent, color: "#000", borderRadius: "12px", padding: "15px", textAlign: "center", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
                {tapPos.isBasket ? "🎯 Finish Hole!" : "Confirm Shot →"}
              </div>
            </div>
          ) : (
            <div style={{ padding: "10px 16px", background: "#0A0F0D", borderTop: `1px solid ${theme.border}`, flexShrink: 0, textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: theme.textMuted }}>Tap fairway · trees · rough · OB · or basket ⛳ to finish</span>
            </div>
          )}
        </>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: theme.textMuted }}>Distance thrown</span>
              <span style={{ fontSize: "24px", fontWeight: "700", color: theme.accent, fontFamily: "'DM Sans',sans-serif" }}>{sliderDist}ft</span>
            </div>
            <input type="range" min={10} max={remainingDist} step={5} value={sliderDist} onChange={e => setSliderDist(Number(e.target.value))} style={{ width: "100%", accentColor: theme.accent, height: "10px" }}/>
            <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
              {[0.25,0.5,0.75,1.0].map(pct => { const d=Math.round(remainingDist*pct); const active=Math.abs(sliderDist-d)<15; return <div key={pct} onClick={()=>setSliderDist(d)} style={{flex:1,textAlign:"center",padding:"10px 4px",background:active?theme.accentGlow:theme.surfaceAlt,border:`1px solid ${active?theme.accentDim:theme.border}`,borderRadius:"8px",cursor:"pointer",fontSize:"11px",color:active?theme.accent:theme.textMuted}}>{pct===1.0?"All":`${d}ft`}</div>; })}
            </div>
          </div>
          <div style={{ background:theme.accentGlow,border:`1px solid ${theme.accentDim}`,borderRadius:"10px",padding:"14px 16px",marginBottom:"16px",display:"flex",justifyContent:"space-between" }}>
            <span style={{fontSize:"12px",color:theme.textMuted}}>Remaining</span>
            <span style={{fontSize:"22px",fontWeight:"700",color:theme.accent,fontFamily:"'DM Sans',sans-serif"}}>{sliderRemaining}ft</span>
          </div>
          <div style={{ marginBottom:"16px" }}>
            <div style={{fontSize:"11px",color:theme.textMuted,marginBottom:"10px",letterSpacing:"0.1em",textTransform:"uppercase"}}>Landing position</div>
            <div style={{display:"flex",gap:"8px"}}>
              {[{key:"left",label:"Left",icon:"⬅️"},{key:"center",label:"Center",icon:"⬆️"},{key:"right",label:"Right",icon:"➡️"}].map(p => (
                <div key={p.key} onClick={()=>setSliderPos(p.key)} style={{flex:1,padding:"14px 8px",textAlign:"center",background:sliderPos===p.key?theme.accentGlow:theme.surfaceAlt,border:`1px solid ${sliderPos===p.key?theme.accentDim:theme.border}`,borderRadius:"12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"6px"}}>
                  <div style={{fontSize:"22px"}}>{p.icon}</div>
                  <div style={{fontSize:"11px",color:sliderPos===p.key?theme.accent:theme.textMuted,fontWeight:"600"}}>{p.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div onClick={()=>onLog({distFromTee:sliderDist,distRemaining:sliderRemaining,position:sliderPos,lie:"fairway"})} style={{background:theme.accent,color:"#000",borderRadius:"12px",padding:"16px",textAlign:"center",fontSize:"14px",fontWeight:"700",cursor:"pointer",fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>Confirm Shot →</div>
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
                <div key={disc.id} onClick={() => onSelect(disc)} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",marginBottom:"6px",background:isSelected?theme.accentGlow:theme.surfaceAlt,border:`1px solid ${isSelected?theme.accentDim:theme.border}`,borderRadius:"10px",cursor:"pointer" }}>
                  <div><div style={{fontSize:"13px",fontWeight:"700",color:theme.text}}>{disc.name}</div><div style={{fontSize:"11px",color:theme.textMuted}}>{disc.brand} · {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}</div></div>
                  <span style={{fontSize:"10px",color:stab.color,background:`${stab.color}22`,border:`1px solid ${stab.color}44`,borderRadius:"6px",padding:"2px 8px"}}>{stab.label}</span>
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
      rec.continuous = false; rec.interimResults = false; rec.lang = "en-US";
      rec.onresult = (e) => { onResult(e.results[0][0].transcript); setListening(false); };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recRef.current = rec;
    }
  }, []);
  const startListening = () => { if (recRef.current && !listening) { try { recRef.current.start(); setListening(true); } catch { setListening(false); } } };
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

    // ── Within 30ft: just putt — no AI needed (field test rule) ──────────────
    if (remainingDist <= 30) {
      const putter = bag.find(d => d.type === "putter") || bag[0];
      setRec({
        disc: putter?.name,
        throwType: "Backhand",
        releaseAngle: "Flat",
        reason: `${remainingDist}ft — just putt it. Smooth soft throw, aim center chains. Don't overthink it.`,
        puttingTip: "Step up, look at the chains, trust the throw.",
        confidence: "high",
        isPutt: true,
      });
      return;
    }

    setLoading(true); setError(null); setRec(null);

    const dominantHand = settings?.dominantHand === "left" ? "LHBH (left hand — discs fade RIGHT)" : "RHBH (right hand — discs fade LEFT)";
    const bagDesc = bag.map(d => {
      const stab = getStability(d.turn, d.fade);
      return `${d.name} (${d.brand}, ${d.type.replace("_"," ")}, ${d.speed}/${d.glide}/${d.turn}/${d.fade}, ${stab.label})`;
    }).join("\n");

    // ── Week 3: Build rich hole context from new data model ───────────────────
    const holeData = window.__chainHoundHoles?.find(h => h.number === hole?.number);
    const obStr = holeData?.ob?.length ? holeData.ob.join("; ") : (hole?.hazards || "none");
    const obsStr = holeData?.obstacles?.length
      ? holeData.obstacles.map(o => `${o.type} at ${o.location}${o.distance ? ` (~${o.distance}ft)` : ""}`).join("; ")
      : "none";
    const shotLineStr = holeData?.shotLines?.length
      ? holeData.shotLines.map(sl => `${sl.id}) ${sl.label} [${sl.throwType}]: ${sl.description}`).join("\n")
      : "none defined";
    const notesStr = holeData?.notes || hole?.notes || "none";
    const elevation = holeData?.elevation || "flat";

    const lastShotsDesc = lastShots?.length > 0
      ? lastShots.slice(-3).map(s => `Shot ${s.shotNumber}: ${s.discName}, ${s.distFromTee}ft, ${s.position}, ${s.lie}`).join("\n")
      : "No shots yet — tee shot";

    const preferredDisc = settings?._preferredDisc;

    const prompt = `You are Chain Hound, an expert disc golf caddy AI. Be concise — the player is on the course RIGHT NOW. One tap, instant answer.
${preferredDisc ? `IMPORTANT: Player chose ${preferredDisc} — give advice FOR THIS DISC specifically.` : ""}

HOLE ${hole?.number}: ${remainingDist}ft remaining · Par ${hole?.par} · ${elevation}
OB ZONES: ${obStr}
OBSTACLES: ${obsStr}
SHOT LINES:
${shotLineStr}
HOLE NOTES: ${notesStr}
WIND: ${wind || "none"} · LIE: ${lie || "tee"} · POSITION: ${position || "center"}
PLAYER: ${dominantHand} · ${settings?.skillLevel || "intermediate"} · ${settings?.driverDistance || "200to300"}ft driver

RECENT SHOTS:
${lastShotsDesc}

CRITICAL DISTANCE RULES — MUST FOLLOW:
- Under 30ft: putter only, say "just putt it"
- 30-120ft: ONLY recommend putters or midranges
- 120-200ft: ONLY recommend midranges or fairway drivers
- 200ft+: any disc appropriate for the shot
- NEVER recommend a distance driver or fairway driver for shots under 200ft
- ONLY recommend discs from the bag list below — never suggest a disc not in the bag

BAG (choose ONLY from these):
${bagDesc}

Respond ONLY with this JSON — no other text:
{"disc":"exact disc name from bag","throwType":"Backhand or Forehand or Roller","releaseAngle":"Flat or Hyzer or Anhyzer","shotLine":"A or B or C or null","reason":"1-2 plain English sentences including which shot line and why","confidence":"high or medium or low","alternative":"second best disc name","puttingTip":"only if under 60ft"}`;

    try {
      const response = await fetch("/.netlify/functions/claude-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          system: "You are Chain Hound, an expert disc golf caddy. Respond ONLY with valid JSON. No preamble, no markdown, no explanation."
        })
      });
      if (!response.ok) throw new Error(`Proxy ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Proxy error");
      const text = (data.content || []).find(b => b.type === "text")?.text || "";
      const a = text.indexOf("{"), b2 = text.lastIndexOf("}");
      if (a === -1 || b2 === -1) throw new Error("No JSON");
      const result = JSON.parse(text.slice(a, b2 + 1));
      const discInBag = bag.find(d => d.name.toLowerCase() === result.disc?.toLowerCase());
      if (!discInBag) { result.disc = bag[0]?.name; result.confidence = "low"; result.reason = "(Disc not in bag — defaulting.) " + result.reason; }
      // Enforce distance rules even on AI response — catch any regression
      if (remainingDist < 200) {
        const recommended = bag.find(d => d.name === result.disc);
        if (recommended && (recommended.type === "distance_driver" || recommended.type === "fairway_driver") && remainingDist < 200) {
          const betterDisc = remainingDist <= 120
            ? bag.find(d => d.type === "putter") || bag.find(d => d.type === "midrange")
            : bag.find(d => d.type === "midrange") || bag.find(d => d.type === "fairway_driver");
          if (betterDisc) {
            result.disc = betterDisc.name;
            result.confidence = "medium";
            result.reason = `${remainingDist}ft — ${betterDisc.name} is the right choice for this distance. ` + result.reason;
          }
        }
      }
      setRec(result);
    } catch (err) {
      // ── Smart offline fallback using Week 3 hole data ─────────────────────
      const hd = window.__chainHoundHoles?.find(h => h.number === hole?.number);
      const hazardWords = (hole?.hazards || "").split(" ").filter(Boolean);
      const hasOBRight = hazardWords.some(h => h.startsWith("ob_right"));
      const hasOBLeft  = hazardWords.includes("ob_left") || hazardWords.includes("water_left_ob");
      const hasTrees   = hazardWords.includes("trees_both_sides") || hazardWords.includes("tight");
      const hasLeft    = hazardWords.includes("trees_left");
      const hasRight   = hazardWords.includes("trees_right");
      const pref = settings?._preferredDisc;

      let fallbackDisc, fallbackThrow, releaseAngle, fallbackReason, shotLine;

      // Pick recommended shot line from hole data
      const lines = hd?.shotLines || [];
      const defaultLine = lines[0];

      if (pref) {
        fallbackDisc = bag.find(d => d.name === pref) || bag[0];
        const stab = getStability(fallbackDisc.turn, fallbackDisc.fade);
        fallbackThrow = hasOBRight && stab.label !== "Overstable" ? "Backhand" : hasOBLeft ? "Forehand" : "Backhand";
        releaseAngle = stab.label === "Overstable" ? "Hyzer" : "Flat";
        fallbackReason = `${fallbackDisc.name} (${stab.label}) for ${remainingDist}ft. ${defaultLine ? `Take shot line ${defaultLine.id}: ${defaultLine.label}.` : ""} ${stab.label === "Overstable" ? "Hyzer release for reliable left fade." : "Flat release, trust the disc."}`;
        shotLine = defaultLine?.id || null;
      } else if (remainingDist <= 60) {
        fallbackDisc = bag.find(d => d.type === "putter") || bag[0];
        fallbackThrow = "Backhand"; releaseAngle = "Flat";
        fallbackReason = `${remainingDist}ft — smooth putt. Aim center chains.`;
        shotLine = null;
      } else if (remainingDist <= 120) {
        // Short — putter only
        fallbackDisc = bag.find(d => d.type === "putter") || bag[0];
        fallbackThrow = "Backhand"; releaseAngle = "Flat";
        fallbackReason = `${remainingDist}ft — putter distance. ${defaultLine ? `Shot line ${defaultLine.id}: ${defaultLine.label}.` : "Smooth flat release."}`;
        shotLine = defaultLine?.id || null;
      } else if (remainingDist <= 200) {
        // Medium — midrange only, never a driver
        fallbackDisc = bag.find(d => d.type === "midrange") || bag.find(d => d.type === "putter") || bag[0];
        fallbackThrow = "Backhand"; releaseAngle = "Flat";
        fallbackReason = `${remainingDist}ft — midrange distance. ${defaultLine ? `Shot line ${defaultLine.id}: ${defaultLine.label}.` : "Controlled flat release."}`;
        shotLine = defaultLine?.id || null;
      } else if (hasTrees || (hasLeft && hasRight)) {
        fallbackDisc = bag.find(d => { const s=getStability(d.turn,d.fade); return s.label==="Neutral"&&(d.type==="midrange"||d.type==="fairway_driver"); }) || bag.find(d=>d.type==="midrange") || bag[0];
        fallbackThrow = "Backhand"; releaseAngle = "Flat";
        fallbackReason = `Tight tunnel — straight neutral disc. ${defaultLine ? `Shot line ${defaultLine.id}: ${defaultLine.description}.` : "Flat release down the center."}`;
        shotLine = defaultLine?.id || null;
      } else if (hasOBRight || hasRight) {
        fallbackDisc = bag.find(d => { const s=getStability(d.turn,d.fade); return s.label==="Overstable"&&(d.type==="fairway_driver"||d.type==="distance_driver"); }) || bag[0];
        fallbackThrow = "Backhand"; releaseAngle = "Hyzer";
        const stab = getStability(fallbackDisc.turn, fallbackDisc.fade);
        fallbackReason = `OB/trees right — ${fallbackDisc.name} (${stab.label}) on hyzer, fades left (RHBH) away from trouble. ${defaultLine ? `Shot line ${defaultLine.id}.` : ""}`;
        shotLine = defaultLine?.id || null;
      } else if (hasOBLeft || hasLeft) {
        fallbackDisc = bag.find(d => { const s=getStability(d.turn,d.fade); return (s.label==="Understable"||s.label==="Neutral")&&(d.type==="fairway_driver"||d.type==="distance_driver"); }) || bag[0];
        fallbackThrow = "Forehand"; releaseAngle = "Flat";
        fallbackReason = `OB/trees left — forehand finishes right (RHBH), away from trouble. ${defaultLine ? `Shot line ${defaultLine.id}.` : ""}`;
        shotLine = lines.find(sl => sl.throwType === "forehand")?.id || defaultLine?.id || null;
      } else {
        fallbackDisc = bag.find(d=>d.type==="fairway_driver"||d.type==="distance_driver") || bag[0];
        fallbackThrow = "Backhand"; releaseAngle = "Flat";
        fallbackReason = `${remainingDist}ft. ${defaultLine ? `Shot line ${defaultLine.id}: ${defaultLine.label} — ${defaultLine.description}.` : "Smooth flat release."}`;
        shotLine = defaultLine?.id || null;
      }

      setRec({
        disc: fallbackDisc?.name || bag[0]?.name,
        throwType: fallbackThrow, releaseAngle: releaseAngle || "Flat",
        shotLine, reason: fallbackReason, confidence: pref ? "high" : "medium",
        alternative: bag.find(d=>d.id!==fallbackDisc?.id&&d.type===fallbackDisc?.type)?.name,
        isDemo: true,
      });
    }
    setLoading(false);
  };

  return { rec, loading, error, getRecommendation, setRec };
}

// ─── Info Popup ───────────────────────────────────────────────────────────────
const THROW_INFO = {
  Backhand: { icon:"🔄", title:"Backhand", how:"Grip disc in palm, pull across body left to right (RHBH).", result:"Disc fades LEFT at end for RHBH.", when:"Your default throw — highest control for most players." },
  Forehand: { icon:"↩️", title:"Forehand (Sidearm)", how:"Two fingers under disc, throw like skipping a stone.", result:"Disc fades RIGHT for RHBH — opposite of backhand.", when:"Use when trouble is LEFT — disc finishes away from it." },
  Roller:   { icon:"🎳", title:"Roller", how:"Release disc at steep angle so it rolls on its edge.", result:"Disc rolls instead of flies — gets under low branches.", when:"Use in heavily wooded areas when air space is blocked." },
};
const RELEASE_INFO = {
  Hyzer:   { color:"#FF7A3D", bg:"rgba(255,122,61,0.15)", border:"rgba(255,122,61,0.3)", icon:"↘️", how:"Tilt the top edge of the disc DOWN toward the ground.", result:"Disc fades harder and more reliably. Fights headwind.", when:"Use for predictable left finish (RHBH) or in wind." },
  Anhyzer: { color:"#60BFFF", bg:"rgba(96,191,255,0.15)", border:"rgba(96,191,255,0.3)", icon:"↗️", how:"Tilt the top edge of the disc UP away from the ground.", result:"Disc turns and glides more. Extra distance. Curves right (RHBH).", when:"Use for extra distance or when you need to curve right." },
  Flat:    { color:"#00FF77", bg:"rgba(0,255,119,0.1)", border:"rgba(0,255,119,0.2)", icon:"➡️", how:"Keep disc level and parallel to the ground.", result:"Standard neutral flight. Disc flies its natural path.", when:"Your default release — use when no special shaping needed." },
};

function InfoPopup({ title, lines, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#1A3320",border:"2px solid #00CC60",borderRadius:"20px 20px 0 0",padding:"24px",width:"100%",maxWidth:"430px" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
          <div style={{ fontSize:"20px",fontWeight:"800",color:"#00FF77",fontFamily:"'DM Sans',sans-serif" }}>{title}</div>
          <div onClick={onClose} style={{ fontSize:"20px",color:"#4A7A55",cursor:"pointer",padding:"4px 8px" }}>✕</div>
        </div>
        {lines.map((line,i) => (
          <div key={i} style={{ marginBottom:"14px",padding:"10px 14px",background:"#162B1A",borderRadius:"10px" }}>
            <div style={{ fontSize:"10px",color:"#9ECBA8",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"4px",fontWeight:"600" }}>{line.label}</div>
            <div style={{ fontSize:"14px",color:"#FFFFFF",lineHeight:1.6 }}>{line.text}</div>
          </div>
        ))}
        <button onClick={onClose} style={{ width:"100%",padding:"14px",background:"#00FF77",color:"#000",border:"none",borderRadius:"12px",fontSize:"14px",fontWeight:"700",cursor:"pointer" }}>Got It ✓</button>
      </div>
    </div>
  );
}

// ─── Week 4: ONE-TAP Recommendation Card ─────────────────────────────────────
function RecommendationCard({ rec, loading, bag, onConfirm, onSwap, onThrowTypeChange, onFeedback }) {
  const [selectedThrow, setSelectedThrow] = useState(rec?.throwType || "Backhand");
  const [throwPopup, setThrowPopup] = useState(null);
  const [releasePopup, setReleasePopup] = useState(null);

  useEffect(() => { if (rec?.throwType) setSelectedThrow(rec.throwType); }, [rec?.throwType]);

  const handleThrowChange = (t) => { setSelectedThrow(t); onThrowTypeChange && onThrowTypeChange(t); };

  if (loading) return (
    <div style={{ background:"#00A651",border:"2px solid #007A3D",borderRadius:"20px",padding:"28px 20px",marginBottom:"16px",textAlign:"center" }}>
      <div style={{ fontSize:"40px",marginBottom:"12px" }}>🐕</div>
      <div style={{ fontSize:"16px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",color:"#FFFFFF",marginBottom:"6px" }}>Chain Hound thinking...</div>
      <div style={{ fontSize:"13px",color:"rgba(255,255,255,0.85)",marginBottom:"20px" }}>Reading the hole layout</div>
      <div style={{ display:"flex",justifyContent:"center",gap:"8px" }}>
        {[0,1,2].map(i=><div key={i} style={{width:"10px",height:"10px",borderRadius:"50%",background:"#00FF77",animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
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
  const THROW_TYPES = ["Backhand","Forehand","Roller"];

  return (
    <>
      {throwPopup && <InfoPopup title={`${THROW_INFO[throwPopup]?.icon} ${THROW_INFO[throwPopup]?.title}`} lines={[{label:"How to throw",text:THROW_INFO[throwPopup]?.how},{label:"What it does",text:THROW_INFO[throwPopup]?.result},{label:"When to use",text:THROW_INFO[throwPopup]?.when}]} onClose={()=>setThrowPopup(null)}/>}
      {releasePopup && <InfoPopup title={`${RELEASE_INFO[releasePopup]?.icon} ${releasePopup} Release`} lines={[{label:"How to do it",text:RELEASE_INFO[releasePopup]?.how},{label:"What happens",text:RELEASE_INFO[releasePopup]?.result},{label:"When to use",text:RELEASE_INFO[releasePopup]?.when}]} onClose={()=>setReleasePopup(null)}/>}

      <div style={{ background:"#FFFFFF",border:"2px solid #00A651",borderRadius:"20px",marginBottom:"16px",overflow:"hidden",boxShadow:"0 2px 12px rgba(0,166,81,0.15)" }}>
        {/* Banner */}
        <div style={{ background:"#00A651",padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"0" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
            <span style={{ fontSize:"22px" }}>🐕</span>
            <span style={{ fontSize:"14px",fontWeight:"800",color:"#FFFFFF",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif" }}>CHAIN HOUND SAYS</span>
          </div>
          <div style={{ display:"flex",gap:"6px",alignItems:"center" }}>
            {rec.isDemo && <span style={{ fontSize:"9px",color:"#FFFFFF",background:"rgba(0,0,0,0.2)",borderRadius:"4px",padding:"2px 6px",fontWeight:"700" }}>OFFLINE</span>}
            <span style={{ fontSize:"10px",fontWeight:"700",color:"#FFFFFF",background:"rgba(0,0,0,0.15)",borderRadius:"6px",padding:"2px 8px" }}>
              {rec.confidence==="high"?"✓ Confident":rec.confidence==="medium"?"~ Good Guess":"? Uncertain"}
            </span>
          </div>
        </div>

        <div style={{ padding:"20px" }}>

          {/* Shot Line badge — Week 3 integration */}
          {rec.shotLine && (
            <div style={{ marginBottom:"14px",padding:"10px 14px",background:"#00A651",border:"1px solid #007A3D",borderRadius:"10px",display:"flex",alignItems:"center",gap:"10px" }}>
              <div style={{ width:"28px",height:"28px",borderRadius:"50%",background:"#00FF77",color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"800",flexShrink:0 }}>{rec.shotLine}</div>
              <div>
                <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.8)",letterSpacing:"0.1em",fontWeight:"600" }}>RECOMMENDED SHOT LINE</div>
                <div style={{ fontSize:"13px",color:"#FFFFFF",fontWeight:"600" }}>
                  {window.__chainHoundHoles?.find(h=>h.number===window.__currentHoleNumber)?.shotLines?.find(sl=>sl.id===rec.shotLine)?.label || `Line ${rec.shotLine}`}
                </div>
              </div>
            </div>
          )}

          {/* Hero disc */}
          <div style={{ background:"#00A651",border:"2px solid #007A3D",borderRadius:"16px",padding:"18px",marginBottom:"16px" }}>
            <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.85)",letterSpacing:"0.15em",fontWeight:"700",textTransform:"uppercase",marginBottom:"8px" }}>🥏 Throw This Disc</div>
            <div style={{ fontSize:"32px",fontWeight:"800",color:"#FFFFFF",fontFamily:"'DM Sans',sans-serif",lineHeight:1.1,marginBottom:"6px" }}>{rec.disc}</div>
            {discInBag && (
              <div style={{ fontSize:"12px",color:"#9ECBA8",marginBottom:"8px" }}>
                {discInBag.brand} · {discInBag.speed}/{discInBag.glide}/{discInBag.turn}/{discInBag.fade}
                {stab && <span style={{ marginLeft:"8px",fontSize:"10px",color:stab.color,background:`${stab.color}22`,border:`1px solid ${stab.color}44`,borderRadius:"4px",padding:"1px 6px",fontWeight:"700" }}>{stab.label}</span>}
              </div>
            )}
          </div>

          {/* How to throw */}
          <div style={{ background:"#F5F5F5",border:"1px solid #00A651",borderRadius:"14px",padding:"14px",marginBottom:"16px" }}>
            <div style={{ fontSize:"11px",color:"#007A3D",letterSpacing:"0.12em",fontWeight:"600",textTransform:"uppercase",marginBottom:"10px" }}>How to Throw</div>
            <div style={{ display:"flex",gap:"8px" }}>
              <div onClick={()=>setThrowPopup(displayThrow)} style={{ flex:1,background:"#00A651",border:"1px solid #007A3D",borderRadius:"10px",padding:"10px 12px",cursor:"pointer",position:"relative" }}>
                <div style={{ position:"absolute",top:"8px",right:"8px",width:"18px",height:"18px",borderRadius:"50%",background:"rgba(0,255,119,0.2)",border:"1px solid #00CC60",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",color:"#00FF77",fontWeight:"700" }}>?</div>
                <div style={{ fontSize:"20px",marginBottom:"4px" }}>{throwInfo?.icon}</div>
                <div style={{ fontSize:"14px",fontWeight:"700",color:"#FFFFFF" }}>{displayThrow}</div>
              </div>
              {rec.releaseAngle && (
                <div onClick={()=>setReleasePopup(rec.releaseAngle)} style={{ flex:1,background:"#162B1A",border:`1px solid ${releaseInfo.border}`,borderRadius:"10px",padding:"10px 12px",cursor:"pointer",position:"relative" }}>
                  <div style={{ position:"absolute",top:"8px",right:"8px",width:"18px",height:"18px",borderRadius:"50%",background:`${releaseInfo.color}22`,border:`1px solid ${releaseInfo.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",color:releaseInfo.color,fontWeight:"700" }}>?</div>
                  <div style={{ fontSize:"20px",marginBottom:"4px" }}>{releaseInfo.icon}</div>
                  <div style={{ fontSize:"14px",fontWeight:"700",color:releaseInfo.color }}>{rec.releaseAngle}</div>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div style={{ background:"#F5F5F5",border:"1px solid #00A651",borderRadius:"12px",padding:"14px",marginBottom:"14px" }}>
            <div style={{ fontSize:"10px",color:"#007A3D",letterSpacing:"0.12em",fontWeight:"600",textTransform:"uppercase",marginBottom:"8px" }}>📋 Why This Shot</div>
            <div style={{ fontSize:"13px",color:"#111111",lineHeight:1.7 }}>{rec.reason}</div>
          </div>

          {/* Putting tip */}
          {rec.puttingTip && (
            <div style={{ background:"#00A651",border:"1px solid #007A3D",borderRadius:"12px",padding:"14px",marginBottom:"14px" }}>
              <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.85)",fontWeight:"700",letterSpacing:"0.1em",marginBottom:"6px" }}>🎯 PUTTING ADVICE</div>
              <div style={{ fontSize:"13px",color:"#FFFFFF",lineHeight:1.7 }}>{rec.puttingTip}</div>
            </div>
          )}

          {/* Throw type selector */}
          <div style={{ marginBottom:"14px" }}>
            <div style={{ fontSize:"10px",color:"#9ECBA8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Change Throw Type</div>
            <div style={{ display:"flex",gap:"6px" }}>
              {THROW_TYPES.map(tt => {
                const active = displayThrow === tt;
                return (
                  <div key={tt} style={{ display:"flex",alignItems:"center",gap:"4px" }}>
                    <div onClick={()=>handleThrowChange(tt)} style={{ padding:"8px 12px",background:active?"#00FF77":"transparent",border:`2px solid ${active?"#00FF77":"#2A5C34"}`,borderRadius:"8px",cursor:"pointer",fontSize:"12px",fontWeight:"700",color:active?"#000":"#9ECBA8",display:"flex",alignItems:"center",gap:"4px" }}>
                      <span>{THROW_INFO[tt]?.icon}</span>{tt}
                    </div>
                    <div onClick={()=>setThrowPopup(tt)} style={{ width:"20px",height:"20px",borderRadius:"50%",background:"rgba(0,255,119,0.15)",border:"1px solid #2A5C34",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",color:"#9ECBA8",cursor:"pointer",fontWeight:"700",flexShrink:0 }}>?</div>
                  </div>
                );
              })}
            </div>
          </div>

          {altDisc && <div style={{ fontSize:"12px",color:"#111111",marginBottom:"14px",padding:"8px 12px",background:"#F0F0F0",border:"1px solid #00A651",borderRadius:"8px" }}>Also consider: <span style={{ color:"#007A3D",fontWeight:"700" }}>{rec.alternative}</span></div>}

          {onFeedback && (
            <div style={{ display:"flex",gap:"8px",marginBottom:"14px",alignItems:"center" }}>
              <span style={{ fontSize:"11px",color:"#9ECBA8" }}>Helpful?</span>
              <button onClick={()=>onFeedback("good")} style={{ background:"rgba(0,255,119,0.15)",border:"1px solid #00CC60",borderRadius:"8px",padding:"6px 14px",fontSize:"16px",cursor:"pointer" }}>👍</button>
              <button onClick={()=>onFeedback("bad")} style={{ background:"rgba(255,77,77,0.1)",border:"1px solid rgba(255,77,77,0.3)",borderRadius:"8px",padding:"6px 14px",fontSize:"16px",cursor:"pointer" }}>👎</button>
            </div>
          )}

          {/* Confirm */}
          <button onClick={() => onConfirm(discInBag || bag[0], displayThrow)} style={{ width:"100%",background:"#00A651",color:"#FFFFFF",border:"none",borderRadius:"14px",padding:"18px",fontSize:"16px",fontWeight:"800",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:"10px" }}>
            ✓ Throw {rec.disc}{rec.shotLine ? ` — Line ${rec.shotLine}` : ""}
          </button>
          <button onClick={onSwap} style={{ width:"100%",background:"transparent",color:"#00A651",border:"2px solid #00A651",borderRadius:"14px",padding:"14px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"'DM Mono',monospace",textTransform:"uppercase" }}>
            🔄 Different Disc
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Week 4: Active Round Hole Screen ─────────────────────────────────────────
// Key change: One-tap caddy button is the FIRST thing on screen.
// Wind defaults to "none" — no picker friction. Player just taps the button.

const WIND_OPTIONS=[
  {key:"none",label:"No Wind",icon:"😶"},{key:"headwind",label:"Headwind",icon:"🌬️⬆️"},
  {key:"tailwind",label:"Tailwind",icon:"🌬️⬇️"},{key:"crosswind_left",label:"Cross Left",icon:"🌬️⬅️"},
  {key:"crosswind_right",label:"Cross Right",icon:"🌬️➡️"},
];

function HoleScreen({ round, setRound, course, courses, saveCourses, bag, settings, onEndRound }) {
  // Merge Week 3 hole detail data with course hole metadata
  const holeData = loadHoleData();
  const courseHole = course.holes?.find(h => h.number === round.currentHole) || { number: round.currentHole, distance: 300, par: 3, shape: "straight" };
  // Prefer the rich Week 3 data if available for this hole number
  const richHole = holeData.find(h => h.number === round.currentHole);
  const hole = richHole ? { ...courseHole, ...richHole } : courseHole;

  // Expose to AI recommender via window globals (avoids prop drilling into useRecommender)
  useEffect(() => {
    window.__chainHoundHoles = holeData;
    window.__currentHoleNumber = round.currentHole;
  }, [round.currentHole, holeData]);

  const holeShots = round.shots.filter(s => s.hole === round.currentHole);
  const shotCount = holeShots.length;
  const lastShot = holeShots[holeShots.length - 1];
  const remainingDist = lastShot ? lastShot.remaining : hole.distance;

  const [phase, setPhase] = useState("caddy"); // caddy | log_shot | lie_wind | complete
  const [pendingShot, setPendingShot] = useState(null);
  const [selectedDisc, setSelectedDisc] = useState(bag[0] || null);
  const [showDiscPicker, setShowDiscPicker] = useState(false);
  const [wind, setWind] = useState("none");
  const [penalty, setPenalty] = useState(0);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [editingHole, setEditingHole] = useState(false);
  const [editHoleForm, setEditHoleForm] = useState({});

  const { rec, loading: recLoading, getRecommendation, setRec } = useRecommender();
  const isSwapping = useRef(false);

  const fireRecommendation = useCallback((overrideRemaining, overrideLie, overridePosition) => {
    getRecommendation({
      hole, bag, settings,
      remainingDist: overrideRemaining != null ? overrideRemaining : remainingDist,
      wind,
      lie: overrideLie != null ? overrideLie : (lastShot ? lastShot.lie : "tee"),
      lastShots: holeShots,
      position: overridePosition != null ? overridePosition : (lastShot ? lastShot.position : "center"),
    });
  }, [hole, bag, settings, remainingDist, wind, lastShot, holeShots]);

  // Week 5: No auto-fire — player sets wind first, then taps Ask My Caddie
  // useEffect removed intentionally — caddy button triggers recommendation

  // Reset on new hole
  useEffect(() => {
    setPhase("caddy");
    setPendingShot(null);
    setSelectedDisc(bag[0] || null);
    setRec(null);
    setPenalty(0);
    setWind("none");
  }, [round.currentHole]);

  const { listening, supported } = useVoiceInput((transcript) => {
    const distMatch = transcript.match(/(\d+)/);
    if (distMatch) {
      const dist = parseInt(distMatch[1]);
      const remaining = Math.max(0, remainingDist - dist);
      const pos = transcript.includes("left") ? "left" : transcript.includes("right") ? "right" : "center";
      const lie = transcript.includes("rough") ? "rough" : transcript.includes("tree") ? "trees" : transcript.includes("basket") ? "basket" : "fairway";
      logShot({ distFromTee: dist, distRemaining: remaining, position: pos }, lie);
    }
  });

  const logShot = (shotData, lie) => {
    const discUsed = selectedDisc;
    const cumulativeFromTee = Math.min(hole.distance, Math.max(0, hole.distance - remainingDist + shotData.distFromTee));
    const newShot = {
      hole: round.currentHole, shotNumber: shotCount + 1,
      discId: discUsed?.id, discName: discUsed?.name,
      distFromTee: cumulativeFromTee, distThisShot: shotData.distFromTee,
      remaining: shotData.distRemaining, position: shotData.position,
      lie, wind, result: lie === "basket" ? "in" : "out",
    };
    const updatedShots = [...round.shots, newShot];
    const updatedRound = { ...round, shots: updatedShots };
    if (lie === "basket") {
      const totalThrows = shotCount + 1 + penalty;
      const updatedScores = { ...round.scores, [round.currentHole]: totalThrows };
      const finalRound = { ...updatedRound, scores: updatedScores };
      setRound(finalRound); saveActiveRound(finalRound);
      setPhase("complete");
    } else {
      setRound(updatedRound); saveActiveRound(updatedRound);
      setPendingShot(null); setRec(null);
      getRecommendation({ hole, bag, settings, remainingDist: shotData.distRemaining, wind, lie, lastShots: [...holeShots, newShot], position: shotData.position });
      setPhase("caddy");
    }
  };

  const advanceHole = () => {
    const next = round.currentHole + 1;
    const maxHole = course.holes?.length || 18;
    if (next > maxHole) { onEndRound(); return; }
    const updatedRound = { ...round, currentHole: next };
    setRound(updatedRound); saveActiveRound(updatedRound);
  };

  const HOLE_SHAPES = [
    {key:"straight",label:"Straight",icon:"⬆️"},{key:"slight_dogleg_left",label:"Slight Left",icon:"↖️"},
    {key:"dogleg_left",label:"Dogleg Left",icon:"⬅️"},{key:"slight_dogleg_right",label:"Slight Right",icon:"↗️"},
    {key:"dogleg_right",label:"Dogleg Right",icon:"➡️"},
  ];
  const HAZARD_OPTIONS = [
    {key:"trees_left",label:"Trees Left",icon:"🌲⬅️"},{key:"trees_right",label:"Trees Right",icon:"🌲➡️"},
    {key:"trees_both_sides",label:"Trees Both",icon:"🌲🌲"},{key:"water_left_ob",label:"Water Left",icon:"💧⬅️"},
    {key:"ob_right",label:"OB Right",icon:"⚠️➡️"},{key:"ob_left",label:"OB Left",icon:"⚠️⬅️"},
    {key:"tight",label:"Tight Gap",icon:"😬"},
  ];

  const saveHoleEdit = () => {
    // Save to Week 3 hole data store
    const updatedHoles = holeData.map(h => h.number === round.currentHole ? { ...h, ...editHoleForm } : h);
    saveHoleData(updatedHoles);
    window.__chainHoundHoles = updatedHoles;
    // Also update course holes for diagram
    const updatedCourseHoles = [...(course.holes||[])];
    const idx = updatedCourseHoles.findIndex(h => h.number === round.currentHole);
    if (idx >= 0) updatedCourseHoles[idx] = { ...updatedCourseHoles[idx], ...editHoleForm };
    const updatedCourse = { ...course, holes: updatedCourseHoles };
    const allCourses = (courses||[]).map(c => c.id === course.id ? updatedCourse : c);
    if (saveCourses) saveCourses(allCourses);
    setEditingHole(false); setEditHoleForm({});
    setTimeout(() => { setRec(null); fireRecommendation(); }, 100);
  };

  const LIE_OPTIONS = [
    {key:"fairway",label:"Fairway",icon:"✅",color:theme.accent},
    {key:"rough",label:"Rough",icon:"🌿",color:theme.warning},
    {key:"trees",label:"In Trees",icon:"🌲",color:"#4A8C4A"},
    {key:"ob",label:"OB",icon:"⚠️",color:theme.error},
    {key:"basket",label:"In Basket!",icon:"🎯",color:theme.accent},
  ];

  const WIND_OPTIONS = [
    {key:"none",label:"No Wind",icon:"😶"},{key:"headwind",label:"Headwind",icon:"🌬️⬆️"},
    {key:"tailwind",label:"Tailwind",icon:"🌬️⬇️"},{key:"crosswind_left",label:"Cross Left",icon:"🌬️⬅️"},
    {key:"crosswind_right",label:"Cross Right",icon:"🌬️➡️"},
  ];

  // ── Hole complete ─────────────────────────────────────────────────────────
  if (phase === "complete") {
    const score = round.scores?.[round.currentHole] || 0;
    const scoreToPar = score - hole.par;
    const scoreLabel = scoreToPar===0?"Par":scoreToPar===-1?"Birdie 🐦":scoreToPar===-2?"Eagle 🦅":scoreToPar<0?`${Math.abs(scoreToPar)} Under`:scoreToPar===1?"Bogey":scoreToPar===2?"Double Bogey":`+${scoreToPar}`;
    const scoreColor = scoreToPar<0?theme.accent:scoreToPar===0?theme.warning:theme.error;
    const maxHole = course.holes?.length || 18;
    return (
      <div style={s.content}>
        <div style={{ ...s.cardAccent, textAlign:"center", padding:"32px 20px" }}>
          <div style={{ fontSize:"56px", marginBottom:"8px" }}>⛓️</div>
          <div style={{ fontSize:"14px", color:theme.textMuted, marginBottom:"4px" }}>Hole {round.currentHole} Complete</div>
          <div style={{ fontSize:"48px", fontWeight:"700", color:scoreColor, fontFamily:"'DM Sans',sans-serif", lineHeight:1 }}>{score}</div>
          <div style={{ fontSize:"14px", color:scoreColor, fontWeight:"600", marginTop:"4px", marginBottom:"20px" }}>{scoreLabel}</div>
          <button style={s.btn} onClick={advanceHole}>{round.currentHole >= maxHole ? "Finish Round 🏁" : `Hole ${round.currentHole + 1} →`}</button>
        </div>
        <div style={s.card}>
          <div style={s.slabel}>Hole {round.currentHole} shots</div>
          {holeShots.map((shot, i) => (
            <div key={i} style={{ ...s.row, borderBottom:i<holeShots.length-1?`1px solid ${theme.border}`:"none" }}>
              <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
                <div style={{ width:"24px",height:"24px",background:theme.accentDim,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",color:theme.accent,fontWeight:"700" }}>{i+1}</div>
                <div><div style={{fontSize:"12px",color:theme.text}}>{shot.discName||"Unknown"}</div><div style={{fontSize:"11px",color:theme.textMuted}}>{shot.distThisShot||shot.distFromTee}ft · {shot.position} · {shot.lie}</div></div>
              </div>
              <div style={{ fontSize:"12px",color:theme.textMuted }}>{shot.remaining}ft left</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Main caddy + shot view ────────────────────────────────────────────────
  return (
    <div style={s.content}>

      {/* ── HOLE HEADER ── */}
      <div style={{ background:"#00A651", border:"1px solid #007A3D", borderRadius:"16px", padding:"14px 16px", marginBottom:"12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.8)", letterSpacing:"0.1em" }}>HOLE {round.currentHole} · PAR {hole.par}{hole.elevation==="uphill"?" ↑":hole.elevation==="downhill"?" ↓":""}</div>
            <div style={{ fontSize:"22px", fontWeight:"700", color:"#FFFFFF", fontFamily:"'DM Sans',sans-serif" }}>
              {remainingDist}ft <span style={{fontSize:"13px",color:"rgba(255,255,255,0.8)",fontWeight:"400"}}>remaining</span>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.8)" }}>SHOT</div>
            <div style={{ fontSize:"28px", fontWeight:"700", color:"#FFFFFF", fontFamily:"'DM Sans',sans-serif" }}>{shotCount + 1}</div>
          </div>
        </div>
        {hole.notes && <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.85)",marginTop:"8px",lineHeight:1.5 }}>📝 {hole.notes}</div>}
      </div>

      {/* ── Week 3: Shot Lines Reference ── */}
      {hole.shotLines?.length > 0 && (
        <div style={{ ...s.card, marginBottom:"12px", padding:"14px 16px" }}>
          <div style={s.slabel}>Shot Lines</div>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {hole.shotLines.map((sl, i) => {
              const colors = ["#185FA5","#D85A30","#3B6D11"];
              const c = colors[i % colors.length];
              return (
                <div key={sl.id} style={{ flex:"1 0 calc(50% - 4px)", padding:"10px 12px", background:`${c}18`, border:`1px solid ${c}44`, borderRadius:"10px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px" }}>
                    <div style={{ width:"20px",height:"20px",borderRadius:"50%",background:c,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",flexShrink:0 }}>{sl.id}</div>
                    <span style={{ fontSize:"12px",fontWeight:"600",color:theme.text }}>{sl.label}</span>
                  </div>
                  <div style={{ fontSize:"11px",color:theme.textMuted,lineHeight:1.4 }}>{sl.description}</div>
                  <div style={{ fontSize:"10px",color:c,marginTop:"4px",fontWeight:"600" }}>{sl.throwType}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Week 5: WIND FIRST, THEN CADDY BUTTON ── */}
      {phase === "caddy" && !rec && !recLoading && (
        <div style={{ marginBottom:"16px" }}>
          <div style={{ ...s.card, marginBottom:"12px", padding:"14px 16px" }}>
            <div style={{ ...s.slabel, marginBottom:"10px" }}>Wind Conditions</div>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {WIND_OPTIONS.map(w => (
                <div key={w.key} onClick={() => setWind(w.key)}
                  style={{ flex:"1 0 calc(33% - 4px)", padding:"8px 4px", textAlign:"center",
                    background:wind===w.key?theme.accentGlow:theme.surfaceAlt,
                    border:`1px solid ${wind===w.key?theme.accentDim:theme.border}`,
                    borderRadius:"8px", cursor:"pointer", fontSize:"10px",
                    color:wind===w.key?theme.accent:theme.textMuted }}>
                  <div style={{fontSize:"14px"}}>{w.icon}</div>
                  <div style={{marginTop:"2px"}}>{w.label}</div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => fireRecommendation()}
            style={{ background:"#00A651", color:"#FFFFFF", border:"none", borderRadius:"16px", padding:"20px", fontSize:"18px", fontWeight:"700", letterSpacing:"0.08em", cursor:"pointer", width:"100%", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}
          >
            🐕 ASK MY CADDIE
          </button>
          <div style={{ textAlign:"center", fontSize:"11px", color:theme.textDim, marginTop:"8px" }}>Set wind above, then tap for instant advice</div>
        </div>
      )}

      {/* AI Recommendation card */}
      {(rec || recLoading) && (
        <RecommendationCard
          rec={rec} loading={recLoading} bag={bag}
          onConfirm={(disc, throwType) => {
            if (disc) setSelectedDisc(disc);
            setPhase("log_shot");
          }}
          onSwap={() => setShowDiscPicker(true)}
          onFeedback={(rating) => {
            const fb = JSON.parse(localStorage.getItem("chainhound_feedback")||"[]");
            fb.push({ date:new Date().toISOString(), hole:round.currentHole, disc:rec?.disc, throwType:rec?.throwType, reason:rec?.reason, rating, remainingDist, wind });
            localStorage.setItem("chainhound_feedback", JSON.stringify(fb));
            setFeedbackToast(rating==="good"?"👍 Thanks!":"👎 Noted — will improve");
            setTimeout(()=>setFeedbackToast(null), 2500);
          }}
        />
      )}

      {/* Wind quick-set — only show after getting rec, before logging */}
      {rec && !recLoading && (
        <div style={{ ...s.card, marginBottom:"12px", padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
            <div style={s.slabel}>Wind</div>
            <span style={{ fontSize:"12px", color:theme.accent }}>{WIND_OPTIONS.find(w=>w.key===wind)?.icon} {WIND_OPTIONS.find(w=>w.key===wind)?.label}</span>
          </div>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            {WIND_OPTIONS.map(w => (
              <div key={w.key} onClick={() => { setWind(w.key); setRec(null); setTimeout(()=>getRecommendation({hole,bag,settings,remainingDist,wind:w.key,lie:lastShot?lastShot.lie:"tee",lastShots:holeShots,position:lastShot?lastShot.position:"center"}),50); }}
                style={{ flex:"1 0 calc(33% - 4px)", padding:"8px 4px", textAlign:"center", background:wind===w.key?"#00A651":"#F5F5F5", border:`1px solid ${wind===w.key?"#007A3D":"#00A651"}`, borderRadius:"8px", cursor:"pointer", fontSize:"10px", color:wind===w.key?"#FFFFFF":"#007A3D" }}>
                <div style={{fontSize:"14px"}}>{w.icon}</div>
                <div style={{marginTop:"2px"}}>{w.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hole diagram */}
      <div style={s.card}>
        <div style={{ ...s.slabel, display:"flex", justifyContent:"space-between" }}>
          <span>Hole Layout</span>
          <span onClick={()=>{setEditHoleForm({});setEditingHole(true);}} style={{ fontSize:"11px",color:theme.textMuted,cursor:"pointer" }}>✏️ Edit</span>
        </div>
        <HoleDiagram hole={hole} shots={holeShots} />
      </div>

      {/* Log shot button */}
      {rec && !recLoading && (
        <button style={{ ...s.btn, marginBottom:"10px" }} onClick={() => setPhase("log_shot")}>
          📍 Log Shot
        </button>
      )}
      {!rec && !recLoading && (
        <button style={{ ...s.btnOut, marginBottom:"10px" }} onClick={() => setPhase("log_shot")}>
          📍 Log Shot Manually
        </button>
      )}

      {/* Lie wind picker */}
      {phase === "lie_wind" && pendingShot && (
        <div style={s.card}>
          <div style={s.slabel}>Where did it land?</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {LIE_OPTIONS.map(lie => (
              <div key={lie.key} onClick={()=>logShot(pendingShot, lie.key)} style={{ padding:"14px 8px", textAlign:"center", background:theme.surfaceAlt, border:`1px solid ${theme.border}`, borderRadius:"12px", cursor:"pointer", minHeight:"64px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"4px" }}>
                <div style={{fontSize:"20px"}}>{lie.icon}</div>
                <div style={{fontSize:"10px",color:theme.textMuted,letterSpacing:"0.05em"}}>{lie.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"12px",padding:"10px 14px",background:theme.surfaceAlt,borderRadius:"10px",border:`1px solid ${theme.border}` }}>
            <span style={{fontSize:"12px",color:theme.textMuted}}>Penalty stroke</span>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <button onClick={()=>setPenalty(Math.max(0,penalty-1))} style={{background:theme.surfaceAlt,border:`1px solid ${theme.border}`,color:theme.text,borderRadius:"6px",width:"28px",height:"28px",cursor:"pointer",fontSize:"14px"}}>-</button>
              <span style={{fontSize:"14px",color:penalty>0?theme.error:theme.textMuted,fontWeight:"700",minWidth:"20px",textAlign:"center"}}>{penalty}</span>
              <button onClick={()=>setPenalty(penalty+1)} style={{background:theme.surfaceAlt,border:`1px solid ${theme.border}`,color:theme.text,borderRadius:"6px",width:"28px",height:"28px",cursor:"pointer",fontSize:"14px"}}>+</button>
            </div>
          </div>
        </div>
      )}

      {/* Scorecard */}
      {Object.keys(round.scores||{}).length > 0 && (
        <div style={s.card}>
          <div style={s.slabel}>Scorecard</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
            {course.holes?.map(h => {
              const sc = round.scores?.[h.number];
              const diff = sc ? sc - h.par : null;
              return (
                <div key={h.number} onClick={()=>{const updated={...round,currentHole:h.number};setRound(updated);saveActiveRound(updated);}} style={{ width:"44px",height:"44px",background:h.number===round.currentHole?"#00A651":sc?(diff<0?"rgba(0,166,81,0.2)":diff===0?"rgba(245,166,35,0.2)":"rgba(229,57,53,0.15)"):"#F0F0F0", border:`1px solid ${h.number===round.currentHole?theme.accentDim:sc?(diff<0?theme.accentDim:diff===0?"#5C4A00":"rgba(255,77,77,0.3)"):theme.border}`, borderRadius:"10px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
                  <div style={{fontSize:"11px",color:theme.textMuted}}>{h.number}</div>
                  <div style={{fontSize:"13px",fontWeight:"700",color:sc?(diff<0?theme.accent:diff===0?theme.warning:theme.error):theme.textDim}}>{sc||"·"}</div>
                </div>
              );
            })}
          </div>
          {(() => {
            const total = Object.values(round.scores||{}).reduce((a,b)=>a+b,0);
            const parTotal = course.holes?.filter(h=>round.scores?.[h.number]).reduce((a,h)=>a+h.par,0)||0;
            const diff = total-parTotal;
            return <div style={{marginTop:"12px",display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:`1px solid ${theme.border}`}}><span style={{fontSize:"12px",color:theme.textMuted}}>Total ({Object.keys(round.scores).length} holes)</span><span style={{fontSize:"14px",fontWeight:"700",color:diff<0?theme.accent:diff===0?theme.warning:theme.error}}>{total} ({diff>0?"+":""}{diff})</span></div>;
          })()}
        </div>
      )}

      <button style={{ ...s.btnDanger, marginTop:"8px" }} onClick={onEndRound}>End Round</button>

      {/* Feedback toast */}
      {feedbackToast && (
        <div style={{ position:"fixed",bottom:"120px",left:"50%",transform:"translateX(-50%)",background:theme.surface,border:`1px solid ${theme.accentDim}`,borderRadius:"12px",padding:"12px 20px",fontSize:"13px",color:theme.accent,fontWeight:"600",zIndex:400 }}>
          {feedbackToast}
        </div>
      )}

      {/* TapLogger overlay */}
      {phase === "log_shot" && (
        <TapLogger hole={hole} remainingDist={remainingDist} previousShots={holeShots}
          onLog={(shotData) => {
            if (shotData.lie === "basket") { logShot(shotData, "basket"); }
            else { setPendingShot(shotData); setPhase("lie_wind"); }
          }}
          onCancel={() => setPhase("caddy")}
        />
      )}

      {/* Hole editor modal */}
      {editingHole && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
          <div style={{background:theme.surface,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:"430px",margin:"0 auto",padding:"24px",maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{...s.slabel,marginBottom:"16px"}}>Edit Hole {round.currentHole}</div>
            <div style={{marginBottom:"16px"}}><label style={s.label}>Distance (ft)</label><input style={s.input} type="number" value={editHoleForm.distance||hole.distance||""} onChange={e=>setEditHoleForm(f=>({...f,distance:Number(e.target.value)}))}/></div>
            <div style={{marginBottom:"16px"}}>
              <label style={s.label}>Hole Shape</label>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                {HOLE_SHAPES.map(sh=>(
                  <div key={sh.key} onClick={()=>setEditHoleForm(f=>({...f,shape:sh.key}))} style={{flex:"1 0 calc(33% - 6px)",padding:"10px 4px",textAlign:"center",background:(editHoleForm.shape||hole.shape)===sh.key?theme.accentGlow:theme.surfaceAlt,border:`1px solid ${(editHoleForm.shape||hole.shape)===sh.key?theme.accentDim:theme.border}`,borderRadius:"10px",cursor:"pointer",fontSize:"10px",color:(editHoleForm.shape||hole.shape)===sh.key?theme.accent:theme.textMuted}}>
                    <div style={{fontSize:"18px",marginBottom:"3px"}}>{sh.icon}</div>{sh.label}
                  </div>
                ))}
              </div>
            </div>
            <div style={{marginBottom:"16px"}}>
              <label style={s.label}>Hazards</label>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                {HAZARD_OPTIONS.map(h=>{
                  const curr=(editHoleForm.hazards||hole.hazards||"").split(" ").filter(Boolean);
                  const active=curr.includes(h.key);
                  return <div key={h.key} onClick={()=>{const upd=active?curr.filter(x=>x!==h.key):[...curr,h.key];setEditHoleForm(f=>({...f,hazards:upd.join(" ")}));}} style={{padding:"7px 10px",background:active?theme.accentGlow:theme.surfaceAlt,border:`1px solid ${active?theme.accentDim:theme.border}`,borderRadius:"8px",cursor:"pointer",fontSize:"11px",color:active?theme.accent:theme.textMuted,display:"flex",alignItems:"center",gap:"4px"}}>{h.icon} {h.label}</div>;
                })}
              </div>
            </div>
            <div style={{marginBottom:"16px"}}><label style={s.label}>Notes</label><input style={s.input} value={editHoleForm.notes||hole.notes||""} onChange={e=>setEditHoleForm(f=>({...f,notes:e.target.value}))} placeholder="Uphill, mando..."/></div>
            <button style={s.btn} onClick={saveHoleEdit}>Save & Update Rec</button>
            <div style={{height:"10px"}}/>
            <button style={s.btnOut} onClick={()=>setEditingHole(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Disc picker */}
      {showDiscPicker && (
        <DiscPicker bag={bag} selected={selectedDisc}
          onSelect={d => {
            isSwapping.current = true;
            setSelectedDisc(d); setShowDiscPicker(false); setRec(null);
            getRecommendation({ hole, bag, settings: { ...settings, _preferredDisc: d.name }, remainingDist, wind, lie: lastShot?lastShot.lie:"tee", lastShots: holeShots, position: lastShot?lastShot.position:"center" });
            setTimeout(() => { isSwapping.current = false; }, 500);
          }}
          onCancel={() => setShowDiscPicker(false)}
        />
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
  const [verifyBag, setVerifyBag] = useState(false);
  const [pendingCourse, setPendingCourse] = useState(null);

  useEffect(() => {
    if (round) { const course = courses.find(c => c.id === round.courseId); if (course) { setActiveCourse(course); setView("active"); } }
  }, []);

  const startRound = (course) => { setPendingCourse(course); setVerifyBag(true); };

  const confirmStartRound = (course) => {
    const newRound = { id: Date.now().toString(), courseId: course.id, courseName: course.name, date: new Date().toISOString().split("T")[0], currentHole: 1, shots: [], scores: {} };
    setRound(newRound); setActiveCourse(course); saveActiveRound(newRound);
    setVerifyBag(false); setPendingCourse(null); setView("active");
  };

  const createCourse = () => {
    if (!courseName.trim()) return;
    const newCourse = { id: Date.now().toString(), name: courseName.trim(), createdAt: new Date().toISOString().split("T")[0], holes: [] };
    const updated = [...courses, newCourse];
    setCourses(updated); saveCourses(updated);
    startRound(newCourse); setCourseName(""); setShowNewCourse(false);
  };

  const endRound = () => { saveActiveRound(null); setRound(null); setActiveCourse(null); setView("summary"); };

  if (view === "summary" && round) {
    const course = courses.find(c => c.id === round.courseId);
    const totalThrows = Object.values(round.scores||{}).reduce((a,b)=>a+b,0);
    const parTotal = course?.holes?.filter(h=>round.scores?.[h.number]).reduce((a,h)=>a+h.par,0)||0;
    const diff = totalThrows-parTotal;
    const allShots = round.shots || [];
    const drivers = allShots.filter(s=>{const d=bag.find(x=>x.name===s.discName);return d?.type==="distance_driver"||d?.type==="fairway_driver";});
    const longestDrive = drivers.length>0?drivers.reduce((a,b)=>a.distThisShot>b.distThisShot?a:b):null;
    const discUsage = {}; allShots.forEach(s=>{if(s.discName)discUsage[s.discName]=(discUsage[s.discName]||0)+1;});
    const mostUsed = Object.entries(discUsage).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const birdies = Object.entries(round.scores||{}).filter(([h,sc])=>{const hole=course?.holes?.find(x=>x.number===Number(h));return hole&&sc<hole.par;}).length;
    const pars = Object.entries(round.scores||{}).filter(([h,sc])=>{const hole=course?.holes?.find(x=>x.number===Number(h));return hole&&sc===hole.par;}).length;
    const bogeys = Object.entries(round.scores||{}).filter(([h,sc])=>{const hole=course?.holes?.find(x=>x.number===Number(h));return hole&&sc===hole.par+1;}).length;
    return (
      <div>
        <div style={s.header}><div style={s.htitle}>Round Complete</div><div style={s.hmain}>{round.courseName}</div></div>
        <div style={s.content}>
          <div style={{...s.cardAccent,textAlign:"center",padding:"28px 20px"}}>
            <div style={{fontSize:"48px",marginBottom:"8px"}}>🐕⛓️</div>
            <div style={{fontSize:"56px",fontWeight:"700",color:diff<=0?theme.accent:theme.error,fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{totalThrows}</div>
            <div style={{fontSize:"16px",color:diff<=0?theme.accent:theme.error,fontWeight:"600",marginTop:"4px"}}>{diff===0?"Even Par 🎯":diff>0?`+${diff} over par`:`${Math.abs(diff)} under par 🔥`}</div>
            <div style={{display:"flex",justifyContent:"center",gap:"16px",marginTop:"16px"}}>
              {[{label:"Birdies",val:birdies,color:theme.accent},{label:"Pars",val:pars,color:theme.warning},{label:"Bogeys",val:bogeys,color:theme.error}].map(item=>(
                <div key={item.label} style={{textAlign:"center"}}><div style={{fontSize:"22px",fontWeight:"700",color:item.color,fontFamily:"'DM Sans',sans-serif"}}>{item.val}</div><div style={{fontSize:"9px",color:theme.textMuted,letterSpacing:"0.05em"}}>{item.label}</div></div>
              ))}
            </div>
          </div>
          {longestDrive && (
            <div style={s.card}>
              <div style={s.slabel}>Best Drive</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>{longestDrive.discName}</div><div style={{fontSize:"11px",color:theme.textMuted}}>Hole {longestDrive.hole}</div></div>
                <span style={{fontSize:"24px",fontWeight:"700",color:theme.accent,fontFamily:"'DM Sans',sans-serif"}}>{longestDrive.distThisShot||longestDrive.distFromTee}ft</span>
              </div>
            </div>
          )}
          {mostUsed.length>0&&(
            <div style={s.card}>
              <div style={s.slabel}>Most Used Discs</div>
              {mostUsed.map(([n,c],i)=>(
                <div key={n} style={{...s.row,borderBottom:i<mostUsed.length-1?`1px solid ${theme.border}`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <div style={{width:"24px",height:"24px",background:theme.accentDim,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",color:theme.accent,fontWeight:"700"}}>{i+1}</div>
                    <span style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>{n}</span>
                  </div>
                  <span style={{fontSize:"13px",color:theme.textMuted}}>{c} throws</span>
                </div>
              ))}
            </div>
          )}
          <button style={s.btn} onClick={()=>{setRound(null);setView("home");}}>Done</button>
        </div>
      </div>
    );
  }

  if (view === "active" && round && activeCourse) return (
    <div>
      <div style={s.header}>
        <div style={s.htitle}>{activeCourse.name}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div style={s.hmain}>Hole {round.currentHole}</div>
          <div style={{textAlign:"right"}}><div style={{fontSize:"11px",color:theme.textMuted}}>HOLES PLAYED</div><div style={{fontSize:"20px",fontWeight:"700",color:theme.accent,fontFamily:"'DM Sans',sans-serif"}}>{Object.keys(round.scores||{}).length}</div></div>
        </div>
      </div>
      <HoleScreen round={round} setRound={(r)=>{setRound(r);const c=courses.find(x=>x.id===activeCourse.id);if(c)setActiveCourse(c);}} course={activeCourse} courses={courses}
        saveCourses={(updatedCourses)=>{saveCourses(updatedCourses);setCourses(updatedCourses);const updatedCourse=updatedCourses.find(c=>c.id===activeCourse.id);if(updatedCourse)setActiveCourse(updatedCourse);}}
        bag={bag} settings={settings} onEndRound={endRound}/>
    </div>
  );

  if (verifyBag && pendingCourse) return (
    <div>
      <div style={s.header}><div style={s.htitle}>Starting Round</div><div style={s.hmain}>Verify Your Bag</div></div>
      <div style={s.content}>
        <div style={s.cardAccent}>
          <div style={s.slabel}>Before you tee off</div>
          <div style={{fontSize:"13px",color:theme.textMuted,lineHeight:1.6,marginBottom:"12px"}}>Chain Hound uses these discs for every recommendation.</div>
          <div style={{fontSize:"12px",color:theme.accent,fontWeight:"600"}}>{pendingCourse.name}</div>
        </div>
        <div style={s.card}>
          <div style={s.slabel}>Your Bag ({bag.length} discs)</div>
          {bag.length===0?<div style={{fontSize:"13px",color:theme.error,textAlign:"center",padding:"16px"}}>⚠️ No discs — add discs first!</div>:
            bag.map((disc,i)=>{const stab=getStability(disc.turn,disc.fade);const t=DISC_TYPES.find(t=>t.key===disc.type);return(
              <div key={disc.id} style={{...s.row,borderBottom:i<bag.length-1?`1px solid ${theme.border}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span>{t?.icon}</span><div><div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>{disc.name}</div><div style={{fontSize:"11px",color:theme.textMuted}}>{disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}</div></div></div>
                <span style={{fontSize:"10px",color:stab.color,background:`${stab.color}22`,border:`1px solid ${stab.color}44`,borderRadius:"6px",padding:"2px 8px"}}>{stab.label}</span>
              </div>
            );})}
        </div>
        <button style={s.btn} onClick={()=>confirmStartRound(pendingCourse)} disabled={bag.length===0}>✓ Start Round</button>
        <div style={{height:"10px"}}/>
        <button style={s.btnOut} onClick={()=>{setVerifyBag(false);setPendingCourse(null);}}>← Edit Bag First</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={s.header}><GlowOrb top={-60} left={200} size={250} opacity={0.06}/><div style={s.htitle}>On Course</div><div style={s.hmain}>Round</div></div>
      <div style={s.content}>
        {round && (
          <div style={{...s.cardAccent,marginBottom:"16px"}}>
            <div style={s.slabel}>Resume Round</div>
            <div style={{fontSize:"15px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",marginBottom:"4px"}}>{round.courseName}</div>
            <div style={{fontSize:"12px",color:theme.textMuted,marginBottom:"16px"}}>Hole {round.currentHole} · {Object.keys(round.scores||{}).length} holes played</div>
            <div style={{display:"flex",gap:"10px"}}>
              <button style={{...s.btn,flex:1}} onClick={()=>{const c=courses.find(x=>x.id===round.courseId);if(c){setActiveCourse(c);setView("active");}}}>Resume →</button>
              <button style={{...s.btnDanger,flex:1,padding:"13px"}} onClick={()=>{saveActiveRound(null);setRound(null);}}>Discard</button>
            </div>
          </div>
        )}
        {courses.length>0&&(
          <div style={{marginBottom:"8px"}}>
            <div style={s.slabel}>Saved Courses</div>
            {courses.map(course=>(
              <div key={course.id} style={{...s.card,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}} onClick={()=>startRound(course)}>
                <div><div style={{fontSize:"15px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif"}}>{course.name}</div><div style={{fontSize:"11px",color:theme.textMuted,marginTop:"3px"}}>{course.holes?.length||0} holes · {course.location||course.createdAt}</div></div>
                <div style={{fontSize:"20px",color:theme.accent}}>▶</div>
              </div>
            ))}
          </div>
        )}
        {showNewCourse?(
          <div style={s.card}>
            <div style={s.slabel}>New Course</div>
            <div style={{marginBottom:"16px"}}><label style={s.label}>Course Name</label><input style={s.input} value={courseName} onChange={e=>setCourseName(e.target.value)} placeholder="e.g. Sabo Park..." autoFocus/></div>
            <button style={s.btn} onClick={createCourse}>Start Round →</button>
            <div style={{height:"10px"}}/><button style={s.btnOut} onClick={()=>setShowNewCourse(false)}>Cancel</button>
          </div>
        ):(
          <div style={s.cardAccent}>
            <div style={s.slabel}>Ready to Play?</div>
            <div style={{fontSize:"16px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",marginBottom:"8px"}}>Start a New Round</div>
            <div style={{fontSize:"13px",color:theme.textMuted,lineHeight:1.6,marginBottom:"20px"}}>Chain Hound tracks every shot. AI caddie active 🐕</div>
            <button style={s.btn} onClick={()=>setShowNewCourse(true)}>+ New Round</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bag Screen ───────────────────────────────────────────────────────────────
const FlightBar = ({label,value,min,max,color=theme.accent}) => {
  const pct=Math.min(100,Math.max(0,((value-min)/(max-min))*100));
  return (<div style={{marginBottom:"10px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"10px",color:theme.textMuted,letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</span><span style={{fontSize:"12px",color,fontWeight:"700"}}>{value}</span></div><div style={{height:"4px",background:theme.surfaceAlt,borderRadius:"2px",overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:"2px"}}/></div></div>);
};

function DiscCard({disc,onDelete}) {
  const [exp,setExp]=useState(false);
  const t=DISC_TYPES.find(t=>t.key===disc.type);
  const stab=getStability(disc.turn,disc.fade);
  return (
    <div style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:"14px",marginBottom:"12px",overflow:"hidden"}}>
      <div style={{padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px"}} onClick={()=>setExp(!exp)}>
        <div style={{width:"42px",height:"42px",background:theme.surfaceAlt,border:`1px solid ${theme.border}`,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>{t?.icon}</div>
        <div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif"}}>{disc.name}</div><div style={{fontSize:"11px",color:theme.textMuted,marginTop:"2px"}}>{disc.brand} · {disc.plastic||t?.label}</div></div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <span style={{fontSize:"10px",color:stab.color,background:`${stab.color}22`,border:`1px solid ${stab.color}44`,borderRadius:"6px",padding:"2px 8px",fontWeight:"600"}}>{stab.label}</span>
          <div style={{color:theme.textDim}}>{exp?"▲":"▼"}</div>
        </div>
      </div>
      {exp&&(<div style={{padding:"0 16px 16px",borderTop:`1px solid ${theme.border}`}}><div style={{paddingTop:"16px"}}><FlightBar label="Speed" value={disc.speed} min={1} max={14}/><FlightBar label="Glide" value={disc.glide} min={1} max={7} color="#60BFFF"/><FlightBar label="Turn" value={disc.turn} min={-5} max={1} color={disc.turn<0?theme.warning:theme.accent}/><FlightBar label="Fade" value={disc.fade} min={0} max={5} color="#FF7A3D"/></div>{disc.notes&&<div style={{background:theme.surfaceAlt,borderRadius:"8px",padding:"10px 12px",fontSize:"12px",color:theme.textMuted,marginTop:"8px"}}>{disc.notes}</div>}<button style={{...s.btnDanger,padding:"10px",marginTop:"12px"}} onClick={()=>onDelete(disc.id)}>Remove</button></div>)}
    </div>
  );
}

function AddDiscForm({onAdd,onCancel}) {
  const [search,setSearch]=useState(""); const [sugg,setSugg]=useState([]);
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
            <input style={s.input} placeholder="e.g. Destroyer, FD, Rune..." value={search} onChange={e=>handleSearch(e.target.value)}/>
            {sugg.length>0&&(<div style={{position:"absolute",top:"100%",left:0,right:0,background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:"10px",zIndex:50,marginTop:"4px",overflow:"hidden"}}>{sugg.map((sg,i)=>(<div key={i} onClick={()=>pick(sg)} style={{padding:"12px 14px",cursor:"pointer",borderBottom:i<sugg.length-1?`1px solid ${theme.border}`:"none",display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>{sg.name}</div><div style={{fontSize:"11px",color:theme.textMuted}}>{sg.brand}</div></div><div style={{fontSize:"11px",color:theme.textMuted}}>{sg.speed}/{sg.glide}/{sg.turn}/{sg.fade}</div></div>))}</div>)}
          </div>
          {filled&&<div style={{marginTop:"10px",padding:"8px 12px",background:theme.accentGlow,border:`1px solid ${theme.accentDim}`,borderRadius:"8px",fontSize:"11px",color:theme.accent}}>✓ Auto-filled from database</div>}
        </div>
        <div style={s.card}>
          <div style={s.slabel}>Details</div>
          <div style={{marginBottom:"16px"}}><label style={s.label}>Disc Name *</label><input style={s.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Destroyer"/></div>
          <div style={{marginBottom:"16px"}}><label style={s.label}>Brand</label><select style={{...s.input,appearance:"none"}} value={form.brand} onChange={e=>setForm(f=>({...f,brand:e.target.value,plastic:""}))}>{ BRANDS.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
          <div style={{marginBottom:"16px"}}><label style={s.label}>Type</label><select style={{...s.input,appearance:"none"}} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{DISC_TYPES.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}</select></div>
          <div><label style={s.label}>Plastic</label><select style={{...s.input,appearance:"none"}} value={form.plastic} onChange={e=>setForm(f=>({...f,plastic:e.target.value}))}><option value="">Select...</option>{plastics.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
        </div>
        <div style={s.card}>
          <div style={s.slabel}>Flight Numbers *</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
            {[{key:"speed",label:"Speed",hint:"1–14"},{key:"glide",label:"Glide",hint:"1–7"},{key:"turn",label:"Turn",hint:"-5–1"},{key:"fade",label:"Fade",hint:"0–5"}].map(f=>(<div key={f.key}><label style={s.label}>{f.label} <span style={{color:theme.textDim}}>({f.hint})</span></label><input style={s.input} type="number" value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder="0"/></div>))}
          </div>
          {stab&&<div style={{background:`${stab.color}11`,border:`1px solid ${stab.color}33`,borderRadius:"8px",padding:"8px 12px",marginTop:"12px"}}><span style={{fontSize:"11px",color:stab.color,fontWeight:"600"}}>{stab.label}</span></div>}
        </div>
        <div style={s.card}>
          <div style={s.slabel}>Optional</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}><div><label style={s.label}>Weight (g)</label><input style={s.input} type="number" value={form.weight} onChange={e=>setForm(f=>({...f,weight:e.target.value}))} placeholder="175"/></div><div><label style={s.label}>Color</label><input style={s.input} value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))} placeholder="Red..."/></div></div>
          <div><label style={s.label}>Notes</label><input style={s.input} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="My go-to driver..."/></div>
        </div>
        <button style={s.btn} onClick={submit}>+ Add to Bag</button>
        <div style={{height:"12px"}}/><button style={s.btnOut} onClick={onCancel}>Cancel</button>
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
      <div style={s.header}><GlowOrb top={-40} left={220} size={200} opacity={0.06}/><div style={s.htitle}>Equipment</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}><div style={s.hmain}>My Bag</div><div style={{fontSize:"28px",fontWeight:"700",color:theme.accent,fontFamily:"'DM Sans',sans-serif"}}>{bag.length}</div></div></div>
      <div style={s.content}>
        {bag.length===0?(<div style={{...s.cardAccent,textAlign:"center",padding:"32px 20px"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>🎒</div><div style={{fontSize:"16px",fontWeight:"600",fontFamily:"'DM Sans',sans-serif",marginBottom:"8px"}}>Your bag is empty</div><button style={s.btn} onClick={()=>setView("add")}>+ Add Your First Disc</button></div>):(
          <>{<button style={{...s.btn,marginBottom:"20px"}} onClick={()=>setView("add")}>+ Add Disc</button>}{byType.map(type=>type.discs.length>0&&(<div key={type.key} style={{marginBottom:"8px"}}><div style={{...s.slabel,display:"flex",alignItems:"center",gap:"6px"}}><span>{type.icon}</span>{type.label}<span style={{color:theme.textDim}}>({type.discs.length})</span></div>{type.discs.map(disc=><DiscCard key={disc.id} disc={disc} onDelete={del}/>)}</div>))}</>
        )}
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({setTab,bag,settings}) {
  const activeRound=loadActiveRound();
  return (
    <div>
      <div style={s.header}><GlowOrb top={-60} left={200} size={250} opacity={0.06}/><div style={s.htitle}>Chain Hound 🐕</div><div style={s.hmain}>Ready to play?</div></div>
      <div style={s.content}>
        {activeRound&&(<div style={{...s.cardAccent,marginBottom:"16px"}}><div style={s.slabel}>⚡ Active Round</div><div style={{fontSize:"15px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",marginBottom:"4px"}}>{activeRound.courseName}</div><div style={{fontSize:"12px",color:theme.textMuted,marginBottom:"12px"}}>Hole {activeRound.currentHole} in progress</div><button style={s.btn} onClick={()=>setTab("round")}>Resume →</button></div>)}
        <div style={{...s.cardAccent,position:"relative",overflow:"hidden"}}><GlowOrb top={-40} left={-40} size={180} opacity={0.12}/><div style={s.slabel}>Quick Start</div><div style={{fontSize:"20px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",marginBottom:"8px"}}>Start a Round</div><div style={{fontSize:"13px",color:theme.textMuted,marginBottom:"20px",lineHeight:1.6}}>One tap — instant caddy advice on every hole. 🐕</div><button style={s.btn} onClick={()=>setTab("round")}>🥏 Begin Round</button></div>
        <div style={s.card}><div style={s.slabel}>My Bag</div><div style={{display:"flex",alignItems:"flex-end",gap:"16px",marginBottom:"16px"}}><div><div style={{fontSize:"48px",fontWeight:"700",color:theme.accent,fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{bag.length}</div><div style={{fontSize:"12px",color:theme.textMuted,marginTop:"4px"}}>{bag.length===1?"Disc":"Discs"} in bag</div></div></div><button style={bag.length===0?s.btn:s.btnOut} onClick={()=>setTab("bag")}>{bag.length===0?"Add Your Discs":"Manage Bag"}</button></div>
        <div style={s.card}><div style={s.slabel}>Player Profile</div><div style={{...s.row,borderBottom:`1px solid ${theme.border}`}}><span style={{fontSize:"12px",color:theme.textMuted}}>Dominant Hand</span><span style={{fontSize:"13px",color:theme.accent,fontWeight:"600"}}>{settings?.dominantHand==="left"?"Left (LHBH)":"Right (RHBH)"}</span></div><div style={{...s.row,borderBottom:"none"}}><span style={{fontSize:"12px",color:theme.textMuted}}>Backhand fade direction</span><span style={{fontSize:"13px",color:theme.text}}>{settings?.dominantHand==="left"?"Right →":"Left ←"}</span></div></div>
      </div>
    </div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
function SettingsScreen({bag,setBag,settings,setSettings}) {
  const clearAll=()=>{if(window.confirm("Clear all data?")){setBag([]);localStorage.removeItem("chainhound_bag");localStorage.removeItem("chainhound_courses");localStorage.removeItem("chainhound_active_round");localStorage.removeItem(HOLES_KEY);}};
  const updateSetting=(key,val)=>{const ns={...settings,[key]:val};setSettings(ns);saveSettings(ns);};
  return (
    <div>
      <div style={s.header}><div style={s.htitle}>App</div><div style={s.hmain}>Settings</div></div>
      <div style={s.content}>
        <div style={{marginBottom:"24px"}}><div style={s.slabel}>Player Profile</div><div style={s.card}><div style={{...s.row,borderBottom:"none"}}><div><div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>Dominant Hand</div><div style={{fontSize:"11px",color:theme.textMuted,marginTop:"2px"}}>Affects all disc recommendations</div></div><div style={{display:"flex",gap:"8px"}}>{["right","left"].map(hand=>(<div key={hand} onClick={()=>updateSetting("dominantHand",hand)} style={{padding:"10px 16px",background:settings?.dominantHand===hand?theme.accentGlow:theme.surfaceAlt,border:`1px solid ${settings?.dominantHand===hand?theme.accentDim:theme.border}`,borderRadius:"10px",cursor:"pointer",fontSize:"12px",fontWeight:"600",color:settings?.dominantHand===hand?theme.accent:theme.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{hand}</div>))}</div></div></div></div>
        <div style={{marginBottom:"24px"}}><div style={s.slabel}>Skill Level</div><div style={s.card}><div style={{display:"flex",gap:"8px"}}>{["beginner","intermediate","advanced"].map(level=>(<div key={level} onClick={()=>updateSetting("skillLevel",level)} style={{flex:1,padding:"12px 6px",textAlign:"center",background:settings?.skillLevel===level?theme.accentGlow:theme.surfaceAlt,border:`1px solid ${settings?.skillLevel===level?theme.accentDim:theme.border}`,borderRadius:"10px",cursor:"pointer",fontSize:"10px",fontWeight:"600",color:settings?.skillLevel===level?theme.accent:theme.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em"}}>{level}</div>))}</div></div></div>
        <div style={{marginBottom:"24px"}}><div style={s.slabel}>Driver Distance</div><div style={s.card}><div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{[{key:"under200",label:"Under 200ft"},{key:"200to300",label:"200–300ft"},{key:"300to400",label:"300–400ft"},{key:"over400",label:"400ft+"}].map(opt=>(<div key={opt.key} onClick={()=>updateSetting("driverDistance",opt.key)} style={{flex:"1 0 calc(50% - 4px)",padding:"12px 8px",textAlign:"center",background:settings?.driverDistance===opt.key?theme.accentGlow:theme.surfaceAlt,border:`1px solid ${settings?.driverDistance===opt.key?theme.accentDim:theme.border}`,borderRadius:"10px",cursor:"pointer",fontSize:"11px",color:settings?.driverDistance===opt.key?theme.accent:theme.textMuted,fontFamily:"'DM Mono',monospace"}}>{opt.label}</div>))}</div></div></div>
        <div style={{marginBottom:"24px"}}><div style={s.slabel}>Outdoor Mode</div><div style={s.card}><div style={{...s.row,borderBottom:"none"}}><div><div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>High Contrast</div><div style={{fontSize:"11px",color:theme.textMuted,marginTop:"2px"}}>Maximum contrast for sunlight.</div></div><div onClick={()=>updateSetting("outdoorMode",!settings.outdoorMode)} style={{width:"52px",height:"28px",borderRadius:"14px",cursor:"pointer",background:settings.outdoorMode?theme.accent:theme.surfaceAlt,border:`1px solid ${settings.outdoorMode?theme.accentDim:theme.border}`,position:"relative",transition:"all 0.2s",flexShrink:0}}><div style={{position:"absolute",top:"3px",left:settings.outdoorMode?"26px":"3px",width:"20px",height:"20px",borderRadius:"50%",background:settings.outdoorMode?theme.bg:"#555",transition:"left 0.2s"}}/></div></div></div></div>
        <div style={{marginBottom:"24px"}}><div style={s.slabel}>Data</div><div style={s.card}><div style={{...s.row,borderBottom:"none"}}><div style={{display:"flex",alignItems:"center",gap:"10px"}}><span>🎒</span><span style={{fontSize:"12px",color:theme.textMuted}}>Discs in bag</span></div><span style={{fontSize:"13px",color:theme.accent,fontWeight:"700"}}>{bag.length}</span></div></div><button style={s.btnDanger} onClick={clearAll}>🗑️ Clear All Data</button></div>
        <div style={{...s.card,textAlign:"center"}}><div style={{fontSize:"11px",color:theme.textDim,lineHeight:1.8}}>Chain Hound 🐕⛓️<br/>Week 5 · June 2026<br/>Light theme · proxy · rec fix · wind before caddy</div></div>
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
  const [settings,setSettings] = useState(()=>{ const s=loadSettings(); return {dominantHand:"right",skillLevel:"intermediate",driverDistance:"200to300",outdoorMode:false,...s}; });
  useEffect(() => { theme = settings.outdoorMode ? THEME_OUTDOOR : THEME_NORMAL; }, [settings.outdoorMode]);
  const t = getTheme(settings.outdoorMode);
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}body{background:#FFFFFF;}::-webkit-scrollbar{width:0;}input::placeholder{color:${t.textDim};}select option{background:${t.surface};}`}</style>
      <div style={{...s.app,background:"#FFFFFF",color:"#111111",fontFamily:"'DM Mono','Courier New',monospace"}}>
        <div style={{flex:1,overflowY:"auto"}}>
          {tab==="home"&&<HomeScreen setTab={setTab} bag={bag} settings={settings}/>}
          {tab==="bag"&&<BagScreen bag={bag} setBag={setBag}/>}
          {tab==="round"&&<RoundScreen bag={bag} settings={settings}/>}
          {tab==="settings"&&<SettingsScreen bag={bag} setBag={setBag} settings={settings} setSettings={setSettings}/>}
        </div>
        <div style={{...s.nav,background:t.surface,borderTop:`1px solid ${t.border}`}}>
          {navItems.map(item=>{const active=tab===item.key;return(<div key={item.key} style={s.navItem} onClick={()=>setTab(item.key)}><div style={{fontSize:"22px",lineHeight:1,filter:active?"none":"grayscale(1) opacity(0.4)",transform:active?"scale(1.15)":"scale(1)",transition:"all 0.2s"}}>{item.icon}</div><div style={{fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"500",color:active?t.accent:t.textDim}}>{item.label}</div></div>);})}
        </div>
      </div>
    </>
  );
}
