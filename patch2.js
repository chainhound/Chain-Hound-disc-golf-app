// Chain Hound — Patch 2
// Run from chainhound folder: node patch2.js
// Fixes: hole distances, auto-fire, disc database, light theme

const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, 'src', 'App.js');
let code = fs.readFileSync(appPath, 'utf8');
console.log('📂 Reading App.js...');
let changes = 0;

// ── PATCH 1: Fix Sabo Park hole distances ─────────────────────────────────────
const oldHole1Distance = `number:1, distance:262, par:3, elevation:"flat",`;
const newHole1Distance = `number:1, distance:213, par:3, elevation:"flat",`;
if (code.includes(oldHole1Distance)) {
  code = code.replace(oldHole1Distance, newHole1Distance);
  console.log('✅ Patch 1a: Hole 1 distance fixed (262 → 213ft)');
  changes++;
} else { console.log('ℹ️  Patch 1a: Hole 1 already correct'); }

const oldHole2Distance = `number:2, distance:180, par:3, elevation:"flat",`;
const newHole2Distance = `number:2, distance:345, par:3, elevation:"flat",`;
if (code.includes(oldHole2Distance)) {
  code = code.replace(oldHole2Distance, newHole2Distance);
  console.log('✅ Patch 1b: Hole 2 distance fixed (180 → 345ft)');
  changes++;
} else { console.log('ℹ️  Patch 1b: Hole 2 already correct'); }

const oldHole3Distance = `number:3, distance:220, par:3, elevation:"flat",`;
const newHole3Distance = `number:3, distance:132, par:3, elevation:"flat",`;
if (code.includes(oldHole3Distance)) {
  code = code.replace(oldHole3Distance, newHole3Distance);
  console.log('✅ Patch 1c: Hole 3 distance fixed (220 → 132ft)');
  changes++;
} else { console.log('ℹ️  Patch 1c: Hole 3 already correct'); }

const oldHole4Distance = `number:4, distance:262, par:3, elevation:"uphill",`;
const newHole4Distance = `number:4, distance:241, par:3, elevation:"uphill",`;
if (code.includes(oldHole4Distance)) {
  code = code.replace(oldHole4Distance, newHole4Distance);
  console.log('✅ Patch 1d: Hole 4 distance fixed (262 → 241ft)');
  changes++;
} else { console.log('ℹ️  Patch 1d: Hole 4 already correct'); }

// Also fix hole 3 swamp OB and hole 6 fence notes
const oldHole3Notes = `notes:"Two big trees left 10-15ft from tee. Tree right of tee 5-10ft. Skinny tree directly in front of basket ~25ft out — must go around it.",`;
const newHole3Notes = `notes:"132ft short hole. Two big trees left 10-15ft from tee. Tree right of tee 5-10ft. Skinny tree directly in front of basket ~25ft out. RIGHT SIDE SWAMP — OB right slopes into swamp/poison ivy. Stay left.",`;
if (code.includes(oldHole3Notes)) {
  code = code.replace(oldHole3Notes, newHole3Notes);
  console.log('✅ Patch 1e: Hole 3 swamp OB note added');
  changes++;
}

const oldHole6Notes = `notes:"294ft par 3. BIG OAK dead center of fairway ~130ft out. Must go around or over it. Scattered trees. Basket right.",`;
const newHole6Notes = `notes:"294ft par 3. BIG OAK dead center ~130ft out — must go around or over. BARBED WIRE CHAIN LINK FENCE behind basket — high shots go behind fence OB. Scattered trees. Basket right.",`;
if (code.includes(oldHole6Notes)) {
  code = code.replace(oldHole6Notes, newHole6Notes);
  console.log('✅ Patch 1f: Hole 6 fence OB note added');
  changes++;
}

// ── PATCH 2: Remove auto-fire — wait for player to tap ───────────────────────
const oldAutoFire = `  // Auto-fire when entering caddy phase
  useEffect(() => {
    if (phase === "caddy" && !isSwapping.current && !rec && !recLoading) {
      fireRecommendation();
    }
  }, [phase, round.currentHole]);`;

const newAutoFire = `  // Week 5: No auto-fire — player sets wind first, then taps Ask My Caddie
  // useEffect removed intentionally — caddy button triggers recommendation`;

if (code.includes(oldAutoFire)) {
  code = code.replace(oldAutoFire, newAutoFire);
  console.log('✅ Patch 2: Auto-fire removed — player taps caddy button manually');
  changes++;
} else { console.log('⚠️  Patch 2: Could not find auto-fire block'); }

// ── PATCH 3: Add missing discs to database ────────────────────────────────────
const oldVikingMidranges = `  // VIKING Midranges
  {name:"Lynx",brand:"Viking Discs",type:"midrange",speed:5,glide:5,turn:-1,fade:2},
  {name:"Wolf",brand:"Viking Discs",type:"midrange",speed:4,glide:4,turn:0,fade:2},`;

const newVikingMidranges = `  // VIKING Midranges
  {name:"Lynx",brand:"Viking Discs",type:"midrange",speed:5,glide:5,turn:-1,fade:2},
  {name:"Wolf",brand:"Viking Discs",type:"midrange",speed:4,glide:4,turn:0,fade:2},
  {name:"Axe",brand:"Viking Discs",type:"midrange",speed:4,glide:3,turn:0,fade:1},`;

if (code.includes(oldVikingMidranges)) {
  code = code.replace(oldVikingMidranges, newVikingMidranges);
  console.log('✅ Patch 3a: Viking Axe (midrange) added');
  changes++;
}

const oldVikingDrivers = `  {name:"Warship",brand:"Viking Discs",type:"distance_driver",speed:11,glide:5,turn:-2,fade:2},`;
const newVikingDrivers = `  {name:"Warship",brand:"Viking Discs",type:"distance_driver",speed:11,glide:5,turn:-2,fade:2},
  {name:"Ragnarok",brand:"Viking Discs",type:"distance_driver",speed:11,glide:5,turn:-1,fade:2},`;

if (code.includes(oldVikingDrivers)) {
  code = code.replace(oldVikingDrivers, newVikingDrivers);
  console.log('✅ Patch 3b: Viking Ragnarok (distance driver) added');
  changes++;
}

// Restore Crave (Dynamic Discs fairway driver)
const oldDynamicFairways = `  {name:"Freedom",brand:"Dynamic Discs",type:"fairway_driver",speed:9,glide:6,turn:-3,fade:1},`;
const newDynamicFairways = `  {name:"Freedom",brand:"Dynamic Discs",type:"fairway_driver",speed:9,glide:6,turn:-3,fade:1},
  {name:"Crave",brand:"Dynamic Discs",type:"fairway_driver",speed:10,glide:6,turn:-2,fade:2},`;

if (code.includes(oldDynamicFairways)) {
  code = code.replace(oldDynamicFairways, newDynamicFairways);
  console.log('✅ Patch 3c: Dynamic Discs Crave (fairway driver) restored');
  changes++;
}

// Add Latitude 64 full section
const oldLat64Putters = `  // LATITUDE 64 Putters
  {name:"Pure",brand:"Latitude 64",type:"putter",speed:2,glide:4,turn:0,fade:0},
  {name:"Mercy",brand:"Latitude 64",type:"putter",speed:2,glide:3,turn:0,fade:1},`;

const newLat64Putters = `  // LATITUDE 64 Distance Drivers
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
  {name:"Royal Pure",brand:"Latitude 64",type:"putter",speed:2,glide:4,turn:0,fade:0},`;

if (code.includes(oldLat64Putters)) {
  code = code.replace(oldLat64Putters, newLat64Putters);
  console.log('✅ Patch 3d: Latitude 64 full lineup added (drivers, fairways, mids, putters)');
  changes++;
}

// ── PATCH 4: Light theme ──────────────────────────────────────────────────────
const oldThemeNormal = `const THEME_NORMAL = {
  bg: "#0D1F10", surface: "#162B1A", surfaceAlt: "#1E3822",
  border: "#2A5C34", accent: "#00FF77", accentDim: "#00CC60",
  accentGlow: "rgba(0,255,119,0.2)", text: "#FFFFFF",
  textMuted: "#9ECBA8", textDim: "#4A7A55",
  warning: "#FFD000", error: "#FF4455",
  cardBg: "#1A3320", headerBg: "#112216",
};`;

const newThemeNormal = `const THEME_NORMAL = {
  bg: "#FFFFFF", surface: "#F5F5F5", surfaceAlt: "#EEEEEE",
  border: "#E0E6E2", accent: "#00A651", accentDim: "#007A3D",
  accentGlow: "rgba(0,166,81,0.1)", text: "#111111",
  textMuted: "#666666", textDim: "#AAAAAA",
  warning: "#F5A623", error: "#E53935",
  cardBg: "#F5F5F5", headerBg: "#FFFFFF",
};`;

if (code.includes(oldThemeNormal)) {
  code = code.replace(oldThemeNormal, newThemeNormal);
  console.log('✅ Patch 4: Light theme applied (white background, Chain Hound green)');
  changes++;
} else { console.log('⚠️  Patch 4: Could not find THEME_NORMAL'); }

// Also update the version note at the bottom
const oldVersion = `Chain Hound 🐕⛓️<br/>Weeks 3 & 4 · June 2026<br/>Hole data model + one-tap caddy 🐕`;
const newVersion = `Chain Hound 🐕⛓️<br/>Week 5 · June 2026<br/>Light theme · proxy · rec fix · wind before caddy`;
if (code.includes(oldVersion)) {
  code = code.replace(oldVersion, newVersion);
  changes++;
}

// ── Write patched file ────────────────────────────────────────────────────────
fs.writeFileSync(appPath, code, 'utf8');
console.log(`\n🐕 Done! Applied ${changes} patches to src/App.js`);
console.log('\nNext steps:');
console.log('  git add .');
console.log('  git commit -m "Patch 2: light theme, hole distances, disc db, no auto-fire"');
console.log('  git push origin master:main --force');
