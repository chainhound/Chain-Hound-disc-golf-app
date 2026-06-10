// Chain Hound — Patch 3
// Run from chainhound folder: node patch3.js
// Full color overhaul: white bg, green cards, white text on green, dark text on white

const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, 'src', 'App.js');
let code = fs.readFileSync(appPath, 'utf8');
console.log('📂 Reading App.js...');
let changes = 0;

// ── PATCH 1: Update theme tokens completely ───────────────────────────────────
const oldTheme = `const THEME_NORMAL = {
  bg: "#FFFFFF", surface: "#F5F5F5", surfaceAlt: "#EEEEEE",
  border: "#E0E6E2", accent: "#00A651", accentDim: "#007A3D",
  accentGlow: "rgba(0,166,81,0.1)", text: "#111111",
  textMuted: "#666666", textDim: "#AAAAAA",
  warning: "#F5A623", error: "#E53935",
  cardBg: "#F5F5F5", headerBg: "#FFFFFF",
};`;

const newTheme = `const THEME_NORMAL = {
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
};`;

if (code.includes(oldTheme)) {
  code = code.replace(oldTheme, newTheme);
  console.log('✅ Patch 1: Theme tokens updated');
  changes++;
} else { console.log('⚠️  Patch 1: Theme not found'); }

// ── PATCH 2: Fix recommendation card hardcoded colors ─────────────────────────
// Banner row
const oldBanner = `        <div style={{ background:"#00FF77",padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
            <span style={{ fontSize:"22px" }}>🐕</span>
            <span style={{ fontSize:"14px",fontWeight:"800",color:"#000",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif" }}>CHAIN HOUND SAYS</span>
          </div>
          <div style={{ display:"flex",gap:"6px",alignItems:"center" }}>
            {rec.isDemo && <span style={{ fontSize:"9px",color:"#000",background:"rgba(0,0,0,0.2)",borderRadius:"4px",padding:"2px 6px",fontWeight:"700" }}>OFFLINE</span>}
            <span style={{ fontSize:"10px",fontWeight:"700",color:"#000",background:"rgba(0,0,0,0.15)",borderRadius:"6px",padding:"2px 8px" }}>`;

const newBanner = `        <div style={{ background:"#00A651",padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"0" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
            <span style={{ fontSize:"22px" }}>🐕</span>
            <span style={{ fontSize:"14px",fontWeight:"800",color:"#FFFFFF",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif" }}>CHAIN HOUND SAYS</span>
          </div>
          <div style={{ display:"flex",gap:"6px",alignItems:"center" }}>
            {rec.isDemo && <span style={{ fontSize:"9px",color:"#FFFFFF",background:"rgba(0,0,0,0.2)",borderRadius:"4px",padding:"2px 6px",fontWeight:"700" }}>OFFLINE</span>}
            <span style={{ fontSize:"10px",fontWeight:"700",color:"#FFFFFF",background:"rgba(0,0,0,0.15)",borderRadius:"6px",padding:"2px 8px" }}>`;

if (code.includes(oldBanner)) {
  code = code.replace(oldBanner, newBanner);
  console.log('✅ Patch 2a: Recommendation banner fixed');
  changes++;
}

// Rec card outer container
const oldRecCard = `      <div style={{ background:"#162B1A",border:"2px solid #00CC60",borderRadius:"20px",marginBottom:"16px",overflow:"hidden" }}>`;
const newRecCard = `      <div style={{ background:"#FFFFFF",border:"2px solid #00A651",borderRadius:"20px",marginBottom:"16px",overflow:"hidden",boxShadow:"0 2px 12px rgba(0,166,81,0.15)" }}>`;
if (code.includes(oldRecCard)) {
  code = code.replace(oldRecCard, newRecCard);
  console.log('✅ Patch 2b: Rec card outer background → white');
  changes++;
}

// Shot line badge inside rec card
const oldShotLineBadge = `            <div style={{ marginBottom:"14px",padding:"10px 14px",background:"rgba(0,255,119,0.08)",border:"1px solid rgba(0,255,119,0.3)",borderRadius:"10px",display:"flex",alignItems:"center",gap:"10px" }}>`;
const newShotLineBadge = `            <div style={{ marginBottom:"14px",padding:"10px 14px",background:"#00A651",border:"1px solid #007A3D",borderRadius:"10px",display:"flex",alignItems:"center",gap:"10px" }}>`;
if (code.includes(oldShotLineBadge)) {
  code = code.replace(oldShotLineBadge, newShotLineBadge);
  console.log('✅ Patch 2c: Shot line badge → green');
  changes++;
}

// Shot line badge text colors
const oldShotLineText = `                <div style={{ fontSize:"10px",color:"#9ECBA8",letterSpacing:"0.1em",fontWeight:"600" }}>RECOMMENDED SHOT LINE</div>
                <div style={{ fontSize:"13px",color:"#FFFFFF",fontWeight:"600" }}>`;
const newShotLineText = `                <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.8)",letterSpacing:"0.1em",fontWeight:"600" }}>RECOMMENDED SHOT LINE</div>
                <div style={{ fontSize:"13px",color:"#FFFFFF",fontWeight:"600" }}>`;
if (code.includes(oldShotLineText)) {
  code = code.replace(oldShotLineText, newShotLineText);
  changes++;
}

// Hero disc box
const oldHeroDisc = `          <div style={{ background:"rgba(0,255,119,0.12)",border:"2px solid #00FF77",borderRadius:"16px",padding:"18px",marginBottom:"16px" }}>
            <div style={{ fontSize:"11px",color:"#00FF77",letterSpacing:"0.15em",fontWeight:"700",textTransform:"uppercase",marginBottom:"8px" }}>🥏 Throw This Disc</div>`;
const newHeroDisc = `          <div style={{ background:"#00A651",border:"2px solid #007A3D",borderRadius:"16px",padding:"18px",marginBottom:"16px" }}>
            <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.85)",letterSpacing:"0.15em",fontWeight:"700",textTransform:"uppercase",marginBottom:"8px" }}>🥏 Throw This Disc</div>`;
if (code.includes(oldHeroDisc)) {
  code = code.replace(oldHeroDisc, newHeroDisc);
  console.log('✅ Patch 2d: Hero disc box → green');
  changes++;
}

// Hero disc name color
const oldDiscName = `            <div style={{ fontSize:"32px",fontWeight:"800",color:"#FFFFFF",fontFamily:"'DM Sans',sans-serif",lineHeight:1.1,marginBottom:"6px" }}>{rec.disc}</div>`;
const newDiscName = `            <div style={{ fontSize:"32px",fontWeight:"800",color:"#FFFFFF",fontFamily:"'DM Sans',sans-serif",lineHeight:1.1,marginBottom:"6px" }}>{rec.disc}</div>`;
// same, no change needed

// How to throw box
const oldHowToThrow = `          <div style={{ background:"#1E3822",border:"1px solid #2A5C34",borderRadius:"14px",padding:"14px",marginBottom:"16px" }}>
            <div style={{ fontSize:"11px",color:"#9ECBA8",letterSpacing:"0.12em",fontWeight:"600",textTransform:"uppercase",marginBottom:"10px" }}>How to Throw</div>`;
const newHowToThrow = `          <div style={{ background:"#F5F5F5",border:"1px solid #00A651",borderRadius:"14px",padding:"14px",marginBottom:"16px" }}>
            <div style={{ fontSize:"11px",color:"#007A3D",letterSpacing:"0.12em",fontWeight:"600",textTransform:"uppercase",marginBottom:"10px" }}>How to Throw</div>`;
if (code.includes(oldHowToThrow)) {
  code = code.replace(oldHowToThrow, newHowToThrow);
  console.log('✅ Patch 2e: How to throw box → light gray');
  changes++;
}

// Throw type buttons inside How to Throw
const oldThrowBtn1 = `              <div onClick={()=>setThrowPopup(displayThrow)} style={{ flex:1,background:"#162B1A",border:"1px solid #00CC60",borderRadius:"10px",padding:"10px 12px",cursor:"pointer",position:"relative" }}>`;
const newThrowBtn1 = `              <div onClick={()=>setThrowPopup(displayThrow)} style={{ flex:1,background:"#00A651",border:"1px solid #007A3D",borderRadius:"10px",padding:"10px 12px",cursor:"pointer",position:"relative" }}>`;
if (code.includes(oldThrowBtn1)) {
  code = code.replace(oldThrowBtn1, newThrowBtn1);
  changes++;
}

const oldThrowBtnText = `                <div style={{ fontSize:"14px",fontWeight:"700",color:"#00FF77" }}>{displayThrow}</div>`;
const newThrowBtnText = `                <div style={{ fontSize:"14px",fontWeight:"700",color:"#FFFFFF" }}>{displayThrow}</div>`;
if (code.includes(oldThrowBtnText)) {
  code = code.replace(oldThrowBtnText, newThrowBtnText);
  changes++;
}

// Why this shot box
const oldWhyBox = `          <div style={{ background:"#1A3320",border:"1px solid #2A5C34",borderRadius:"12px",padding:"14px",marginBottom:"14px" }}>
            <div style={{ fontSize:"10px",color:"#9ECBA8",letterSpacing:"0.12em",fontWeight:"600",textTransform:"uppercase",marginBottom:"8px" }}>📋 Why This Shot</div>
            <div style={{ fontSize:"13px",color:"#FFFFFF",lineHeight:1.7 }}>{rec.reason}</div>`;
const newWhyBox = `          <div style={{ background:"#F5F5F5",border:"1px solid #00A651",borderRadius:"12px",padding:"14px",marginBottom:"14px" }}>
            <div style={{ fontSize:"10px",color:"#007A3D",letterSpacing:"0.12em",fontWeight:"600",textTransform:"uppercase",marginBottom:"8px" }}>📋 Why This Shot</div>
            <div style={{ fontSize:"13px",color:"#111111",lineHeight:1.7 }}>{rec.reason}</div>`;
if (code.includes(oldWhyBox)) {
  code = code.replace(oldWhyBox, newWhyBox);
  console.log('✅ Patch 2f: Why this shot box → light gray with readable text');
  changes++;
}

// Putting tip box
const oldPuttTip = `            <div style={{ background:"rgba(0,255,119,0.08)",border:"1px solid #00CC60",borderRadius:"12px",padding:"14px",marginBottom:"14px" }}>
              <div style={{ fontSize:"10px",color:"#00FF77",fontWeight:"700",letterSpacing:"0.1em",marginBottom:"6px" }}>🎯 PUTTING ADVICE</div>
              <div style={{ fontSize:"13px",color:"#FFFFFF",lineHeight:1.7 }}>{rec.puttingTip}</div>`;
const newPuttTip = `            <div style={{ background:"#00A651",border:"1px solid #007A3D",borderRadius:"12px",padding:"14px",marginBottom:"14px" }}>
              <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.85)",fontWeight:"700",letterSpacing:"0.1em",marginBottom:"6px" }}>🎯 PUTTING ADVICE</div>
              <div style={{ fontSize:"13px",color:"#FFFFFF",lineHeight:1.7 }}>{rec.puttingTip}</div>`;
if (code.includes(oldPuttTip)) {
  code = code.replace(oldPuttTip, newPuttTip);
  changes++;
}

// Also consider box
const oldAlsoConsider = `          {altDisc && <div style={{ fontSize:"12px",color:"#9ECBA8",marginBottom:"14px",padding:"8px 12px",background:"#1E3822",borderRadius:"8px" }}>Also consider: <span style={{ color:"#00FF77",fontWeight:"700" }}>{rec.alternative}</span></div>}`;
const newAlsoConsider = `          {altDisc && <div style={{ fontSize:"12px",color:"#111111",marginBottom:"14px",padding:"8px 12px",background:"#F0F0F0",border:"1px solid #00A651",borderRadius:"8px" }}>Also consider: <span style={{ color:"#007A3D",fontWeight:"700" }}>{rec.alternative}</span></div>}`;
if (code.includes(oldAlsoConsider)) {
  code = code.replace(oldAlsoConsider, newAlsoConsider);
  changes++;
}

// Confirm button
const oldConfirmBtn = `          <button onClick={() => onConfirm(discInBag || bag[0], displayThrow)} style={{ width:"100%",background:"#00FF77",color:"#000",border:"none",borderRadius:"14px",padding:"18px",fontSize:"16px",fontWeight:"800",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:"10px" }}>`;
const newConfirmBtn = `          <button onClick={() => onConfirm(discInBag || bag[0], displayThrow)} style={{ width:"100%",background:"#00A651",color:"#FFFFFF",border:"none",borderRadius:"14px",padding:"18px",fontSize:"16px",fontWeight:"800",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:"10px" }}>`;
if (code.includes(oldConfirmBtn)) {
  code = code.replace(oldConfirmBtn, newConfirmBtn);
  console.log('✅ Patch 2g: Confirm button → green with white text');
  changes++;
}

// Different disc button
const oldDiffBtn = `          <button onClick={onSwap} style={{ width:"100%",background:"transparent",color:"#00FF77",border:"2px solid #00CC60",borderRadius:"14px",padding:"14px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"'DM Mono',monospace",textTransform:"uppercase" }}>`;
const newDiffBtn = `          <button onClick={onSwap} style={{ width:"100%",background:"transparent",color:"#00A651",border:"2px solid #00A651",borderRadius:"14px",padding:"14px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"'DM Mono',monospace",textTransform:"uppercase" }}>`;
if (code.includes(oldDiffBtn)) {
  code = code.replace(oldDiffBtn, newDiffBtn);
  changes++;
}

// ── PATCH 3: Fix wind buttons ─────────────────────────────────────────────────
// Wind buttons after rec (the ones that re-fire recommendation)
const oldWindBtns = `              <div key={w.key} onClick={() => { setWind(w.key); setRec(null); setTimeout(()=>getRecommendation({hole,bag,settings,remainingDist,wind:w.key,lie:lastShot?lastShot.lie:"tee",lastShots:holeShots,position:lastShot?lastShot.position:"center"}),50); }}
                style={{ flex:"1 0 calc(33% - 4px)", padding:"8px 4px", textAlign:"center", background:wind===w.key?theme.accentGlow:theme.surfaceAlt, border:\`1px solid \${wind===w.key?theme.accentDim:theme.border}\`, borderRadius:"8px", cursor:"pointer", fontSize:"10px", color:wind===w.key?theme.accent:theme.textMuted }}>`;
const newWindBtns = `              <div key={w.key} onClick={() => { setWind(w.key); setRec(null); setTimeout(()=>getRecommendation({hole,bag,settings,remainingDist,wind:w.key,lie:lastShot?lastShot.lie:"tee",lastShots:holeShots,position:lastShot?lastShot.position:"center"}),50); }}
                style={{ flex:"1 0 calc(33% - 4px)", padding:"8px 4px", textAlign:"center", background:wind===w.key?"#00A651":"#F5F5F5", border:\`1px solid \${wind===w.key?"#007A3D":"#00A651"}\`, borderRadius:"8px", cursor:"pointer", fontSize:"10px", color:wind===w.key?"#FFFFFF":"#007A3D" }}>`;
if (code.includes(oldWindBtns)) {
  code = code.replace(oldWindBtns, newWindBtns);
  console.log('✅ Patch 3a: Wind buttons (after rec) → green selected, white unselected');
  changes++;
}

// ── PATCH 4: Fix hole header card ────────────────────────────────────────────
const oldHoleHeader = `      <div style={{ ...s.cardAccent, padding:"14px 16px", marginBottom:"12px" }}>`;
const newHoleHeader = `      <div style={{ background:"#00A651", border:"1px solid #007A3D", borderRadius:"16px", padding:"14px 16px", marginBottom:"12px" }}>`;
if (code.includes(oldHoleHeader)) {
  code = code.replace(oldHoleHeader, newHoleHeader);
  console.log('✅ Patch 4: Hole header → solid green');
  changes++;
}

// Hole header text colors
const oldHoleHeaderText = `            <div style={{ fontSize:"11px", color:theme.textMuted, letterSpacing:"0.1em" }}>HOLE {round.currentHole} · PAR {hole.par}{hole.elevation==="uphill"?" ↑":hole.elevation==="downhill"?" ↓":""}</div>
            <div style={{ fontSize:"22px", fontWeight:"700", color:theme.accent, fontFamily:"'DM Sans',sans-serif" }}>
              {remainingDist}ft <span style={{fontSize:"13px",color:theme.textMuted,fontWeight:"400"}}>remaining</span>`;
const newHoleHeaderText = `            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.8)", letterSpacing:"0.1em" }}>HOLE {round.currentHole} · PAR {hole.par}{hole.elevation==="uphill"?" ↑":hole.elevation==="downhill"?" ↓":""}</div>
            <div style={{ fontSize:"22px", fontWeight:"700", color:"#FFFFFF", fontFamily:"'DM Sans',sans-serif" }}>
              {remainingDist}ft <span style={{fontSize:"13px",color:"rgba(255,255,255,0.8)",fontWeight:"400"}}>remaining</span>`;
if (code.includes(oldHoleHeaderText)) {
  code = code.replace(oldHoleHeaderText, newHoleHeaderText);
  changes++;
}

// Shot number
const oldShotNum = `            <div style={{ fontSize:"11px", color:theme.textMuted }}>SHOT</div>
            <div style={{ fontSize:"28px", fontWeight:"700", color:theme.text, fontFamily:"'DM Sans',sans-serif" }}>{shotCount + 1}</div>`;
const newShotNum = `            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.8)" }}>SHOT</div>
            <div style={{ fontSize:"28px", fontWeight:"700", color:"#FFFFFF", fontFamily:"'DM Sans',sans-serif" }}>{shotCount + 1}</div>`;
if (code.includes(oldShotNum)) {
  code = code.replace(oldShotNum, newShotNum);
  changes++;
}

// Hole notes text
const oldHoleNotes = `        {hole.notes && <div style={{ fontSize:"11px",color:theme.textMuted,marginTop:"8px",lineHeight:1.5 }}>📝 {hole.notes}</div>}`;
const newHoleNotes = `        {hole.notes && <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.85)",marginTop:"8px",lineHeight:1.5 }}>📝 {hole.notes}</div>}`;
if (code.includes(oldHoleNotes)) {
  code = code.replace(oldHoleNotes, newHoleNotes);
  changes++;
}

// ── PATCH 5: Fix loading card ─────────────────────────────────────────────────
const oldLoadCard = `    <div style={{ background:"#162B1A",border:"2px solid #00CC60",borderRadius:"20px",padding:"28px 20px",marginBottom:"16px",textAlign:"center" }}>
      <div style={{ fontSize:"40px",marginBottom:"12px" }}>🐕</div>
      <div style={{ fontSize:"16px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",color:"#FFFFFF",marginBottom:"6px" }}>Chain Hound thinking...</div>
      <div style={{ fontSize:"13px",color:"#9ECBA8",marginBottom:"20px" }}>Reading the hole layout</div>`;
const newLoadCard = `    <div style={{ background:"#00A651",border:"2px solid #007A3D",borderRadius:"20px",padding:"28px 20px",marginBottom:"16px",textAlign:"center" }}>
      <div style={{ fontSize:"40px",marginBottom:"12px" }}>🐕</div>
      <div style={{ fontSize:"16px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",color:"#FFFFFF",marginBottom:"6px" }}>Chain Hound thinking...</div>
      <div style={{ fontSize:"13px",color:"rgba(255,255,255,0.85)",marginBottom:"20px" }}>Reading the hole layout</div>`;
if (code.includes(oldLoadCard)) {
  code = code.replace(oldLoadCard, newLoadCard);
  console.log('✅ Patch 5: Loading card → green');
  changes++;
}

// ── PATCH 6: Fix nav bar ──────────────────────────────────────────────────────
// Nav bar background already white from theme, just make sure active item is green
const oldNavActive = `color:active?t.accent:t.textDim`;
const newNavActive = `color:active?"#00A651":"#999999"`;
if (code.includes(oldNavActive)) {
  code = code.replace(new RegExp(oldNavActive, 'g'), newNavActive);
  console.log('✅ Patch 6: Nav active color → green');
  changes++;
}

// ── PATCH 7: Fix header background ───────────────────────────────────────────
const oldHeader = `  header: { padding: "52px 24px 16px", borderBottom: \`1px solid \${theme.border}\`, background: \`linear-gradient(180deg,\${theme.surface} 0%,\${theme.bg} 100%)\`, position: "relative" },`;
const newHeader = `  header: { padding: "52px 24px 16px", borderBottom: "1px solid #E0E0E0", background: "#FFFFFF", position: "relative" },`;
if (code.includes(oldHeader)) {
  code = code.replace(oldHeader, newHeader);
  console.log('✅ Patch 7: Header → white background');
  changes++;
}

// ── PATCH 8: Fix Ask My Caddie button ────────────────────────────────────────
const oldCaddieBtn = `            style={{ ...s.btn, fontSize:"18px", padding:"20px", borderRadius:"16px", letterSpacing:"0.08em", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}
          >
            🐕 ASK MY CADDIE`;
const newCaddieBtn = `            style={{ background:"#00A651", color:"#FFFFFF", border:"none", borderRadius:"16px", padding:"20px", fontSize:"18px", fontWeight:"700", letterSpacing:"0.08em", cursor:"pointer", width:"100%", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}
          >
            🐕 ASK MY CADDIE`;
if (code.includes(oldCaddieBtn)) {
  code = code.replace(oldCaddieBtn, newCaddieBtn);
  console.log('✅ Patch 8: Ask My Caddie button → green with white text');
  changes++;
}

// ── Write patched file ────────────────────────────────────────────────────────
fs.writeFileSync(appPath, code, 'utf8');
console.log(`\n🐕 Done! Applied ${changes} patches to src/App.js`);
console.log('\nNext steps:');
console.log('  git add .');
console.log('  git commit -m "Patch 3: full color overhaul - white bg, green cards, readable text"');
console.log('  git push origin master:main --force');
