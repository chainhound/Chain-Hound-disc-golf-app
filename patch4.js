// Chain Hound — Patch 4
// Run from chainhound folder: node patch4.js
// Fix: background not updating because s{} styles are built at module load time

const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, 'src', 'App.js');
let code = fs.readFileSync(appPath, 'utf8');
console.log('📂 Reading App.js...');
let changes = 0;

// ── PATCH 1: Fix the s{} styles object directly ───────────────────────────────
// The problem: s{} is built once at module load using theme.bg etc
// which were set to dark values before our theme change took effect.
// Fix: hardcode the light values directly in the s{} object.

const oldAppStyle = `  app: { background: theme.bg, minHeight: "100vh", maxWidth: "430px", margin: "0 auto", display: "flex", flexDirection: "column", fontFamily: "'DM Mono','Courier New',monospace", color: theme.text },`;
const newAppStyle = `  app: { background: "#FFFFFF", minHeight: "100vh", maxWidth: "430px", margin: "0 auto", display: "flex", flexDirection: "column", fontFamily: "'DM Mono','Courier New',monospace", color: "#111111" },`;
if (code.includes(oldAppStyle)) {
  code = code.replace(oldAppStyle, newAppStyle);
  console.log('✅ Patch 1a: App background → white');
  changes++;
}

const oldCardStyle = `  card: { background: theme.surface, border: \`1px solid \${theme.border}\`, borderRadius: "16px", padding: "20px", marginBottom: "16px" },`;
const newCardStyle = `  card: { background: "#00A651", border: "1px solid #007A3D", borderRadius: "16px", padding: "20px", marginBottom: "16px" },`;
if (code.includes(oldCardStyle)) {
  code = code.replace(oldCardStyle, newCardStyle);
  console.log('✅ Patch 1b: Card background → green');
  changes++;
}

const oldCardAccent = `  cardAccent: { background: theme.accentGlow, border: \`1px solid \${theme.accentDim}\`, borderRadius: "16px", padding: "20px", marginBottom: "16px" },`;
const newCardAccent = `  cardAccent: { background: "#007A3D", border: "1px solid #005C2E", borderRadius: "16px", padding: "20px", marginBottom: "16px" },`;
if (code.includes(oldCardAccent)) {
  code = code.replace(oldCardAccent, newCardAccent);
  console.log('✅ Patch 1c: CardAccent → darker green');
  changes++;
}

const oldSlabel = `  slabel: { fontSize: "10px", letterSpacing: "0.2em", color: theme.textMuted, textTransform: "uppercase", marginBottom: "12px", fontWeight: "500" },`;
const newSlabel = `  slabel: { fontSize: "10px", letterSpacing: "0.2em", color: "#FFFFFF", textTransform: "uppercase", marginBottom: "12px", fontWeight: "500" },`;
if (code.includes(oldSlabel)) {
  code = code.replace(oldSlabel, newSlabel);
  console.log('✅ Patch 1d: Section labels → white');
  changes++;
}

const oldBtn = `  btn: { background: theme.accent, color: theme.bg, border: "none", borderRadius: "12px", padding: "14px 24px", fontSize: "13px", fontWeight: "700", letterSpacing: "0.05em", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },`;
const newBtn = `  btn: { background: "#00A651", color: "#FFFFFF", border: "none", borderRadius: "12px", padding: "14px 24px", fontSize: "13px", fontWeight: "700", letterSpacing: "0.05em", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },`;
if (code.includes(oldBtn)) {
  code = code.replace(oldBtn, newBtn);
  console.log('✅ Patch 1e: Button → green with white text');
  changes++;
}

const oldBtnOut = `  btnOut: { background: "transparent", color: theme.accent, border: \`1px solid \${theme.accentDim}\`, borderRadius: "12px", padding: "13px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },`;
const newBtnOut = `  btnOut: { background: "transparent", color: "#00A651", border: "1px solid #00A651", borderRadius: "12px", padding: "13px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },`;
if (code.includes(oldBtnOut)) {
  code = code.replace(oldBtnOut, newBtnOut);
  console.log('✅ Patch 1f: Outline button → green border/text');
  changes++;
}

const oldBtnDanger = `  btnDanger: { background: "transparent", color: theme.error, border: \`1px solid rgba(255,77,77,0.3)\`, borderRadius: "12px", padding: "13px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },`;
const newBtnDanger = `  btnDanger: { background: "transparent", color: "#E53935", border: "1px solid rgba(229,57,53,0.4)", borderRadius: "12px", padding: "13px 24px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" },`;
if (code.includes(oldBtnDanger)) {
  code = code.replace(oldBtnDanger, newBtnDanger);
  changes++;
}

const oldInput = `  input: { background: theme.surfaceAlt, border: \`1px solid \${theme.border}\`, borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: theme.text, width: "100%", fontFamily: "'DM Mono',monospace", outline: "none", boxSizing: "border-box" },`;
const newInput = `  input: { background: "#F5F5F5", border: "1px solid #CCCCCC", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#111111", width: "100%", fontFamily: "'DM Mono',monospace", outline: "none", boxSizing: "border-box" },`;
if (code.includes(oldInput)) {
  code = code.replace(oldInput, newInput);
  console.log('✅ Patch 1g: Input → light gray bg, dark text');
  changes++;
}

const oldLabel = `  label: { fontSize: "10px", letterSpacing: "0.15em", color: theme.textMuted, textTransform: "uppercase", marginBottom: "6px", display: "block", fontWeight: "500" },`;
const newLabel = `  label: { fontSize: "10px", letterSpacing: "0.15em", color: "#FFFFFF", textTransform: "uppercase", marginBottom: "6px", display: "block", fontWeight: "500" },`;
if (code.includes(oldLabel)) {
  code = code.replace(oldLabel, newLabel);
  changes++;
}

const oldRow = `  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: \`1px solid \${theme.border}\` },`;
const newRow = `  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.2)" },`;
if (code.includes(oldRow)) {
  code = code.replace(oldRow, newRow);
  changes++;
}

const oldNav = `  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: theme.surface, borderTop: \`1px solid \${theme.border}\`, display: "flex", padding: "12px 0 24px", zIndex: 100 },`;
const newNav = `  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "#FFFFFF", borderTop: "1px solid #E0E0E0", display: "flex", padding: "12px 0 24px", zIndex: 100 },`;
if (code.includes(oldNav)) {
  code = code.replace(oldNav, newNav);
  console.log('✅ Patch 1h: Nav bar → white');
  changes++;
}

// ── PATCH 2: Fix the App root render ─────────────────────────────────────────
const oldAppRender = `      <div style={{...s.app,background:t.bg,color:t.text,fontFamily:"'DM Mono','Courier New',monospace"}}>`;
const newAppRender = `      <div style={{...s.app,background:"#FFFFFF",color:"#111111",fontFamily:"'DM Mono','Courier New',monospace"}}>`;
if (code.includes(oldAppRender)) {
  code = code.replace(oldAppRender, newAppRender);
  console.log('✅ Patch 2: App root render → white background');
  changes++;
}

// ── PATCH 3: Fix body background in style tag ─────────────────────────────────
const oldBodyBg = `body{background:\${t.bg};}`;
const newBodyBg = `body{background:#FFFFFF;}`;
if (code.includes(oldBodyBg)) {
  code = code.replace(oldBodyBg, newBodyBg);
  console.log('✅ Patch 3: Body background → white');
  changes++;
}

// ── PATCH 4: Fix nav text color ───────────────────────────────────────────────
const oldNavText = `color:active?"#00A651":"#999999"`;
const newNavText = `color:active?"#00A651":"#888888"`;
// Already done, skip

// ── PATCH 5: Fix hole diagram background ─────────────────────────────────────
const oldDiagramBg = `<rect width={W} height={H} fill={theme.surfaceAlt} rx="10"/>`;
const newDiagramBg = `<rect width={W} height={H} fill="#F0F0F0" rx="10"/>`;
if (code.includes(oldDiagramBg)) {
  code = code.replace(oldDiagramBg, newDiagramBg);
  console.log('✅ Patch 5: Hole diagram background → light gray');
  changes++;
}

// ── PATCH 6: Fix scorecard hole tiles ────────────────────────────────────────
const oldScorecardTile = `background:h.number===round.currentHole?theme.accentGlow:sc?(diff<0?"rgba(61,255,122,0.15)":diff===0?"rgba(255,184,48,0.15)":"rgba(255,77,77,0.1)"):theme.surfaceAlt`;
const newScorecardTile = `background:h.number===round.currentHole?"#00A651":sc?(diff<0?"rgba(0,166,81,0.2)":diff===0?"rgba(245,166,35,0.2)":"rgba(229,57,53,0.15)"):"#F0F0F0"`;
if (code.includes(oldScorecardTile)) {
  code = code.replace(oldScorecardTile, newScorecardTile);
  console.log('✅ Patch 6: Scorecard tiles → readable colors');
  changes++;
}

// ── Write patched file ────────────────────────────────────────────────────────
fs.writeFileSync(appPath, code, 'utf8');
console.log(`\n🐕 Done! Applied ${changes} patches to src/App.js`);
console.log('\nNext steps:');
console.log('  git add .');
console.log('  git commit -m "Patch 4: fix background rendering - white bg enforced"');
console.log('  git push origin master:main --force');
