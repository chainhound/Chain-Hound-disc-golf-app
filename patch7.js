// Chain Hound — Patch 7
// Run from chainhound folder: node patch7.js

const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, 'src', 'App.js');
let code = fs.readFileSync(appPath, 'utf8');
console.log('📂 Reading App.js...');
let changes = 0;

// ── PATCH 1: Fix nav bar — the render uses t.surface which is still green ─────
// Find the actual nav render in the App component
const oldNavRender1 = `        <div style={{...s.nav,background:t.surface,borderTop:\`1px solid \${t.border}\`}}>`;
const newNavRender1 = `        <div style={{...s.nav,background:"#FFFFFF",borderTop:"2px solid #00A651"}}>`;
if (code.includes(oldNavRender1)) {
  code = code.replace(oldNavRender1, newNavRender1);
  console.log('✅ Patch 1a: Nav render → white background');
  changes++;
} else { console.log('⚠️  Patch 1a: Nav render v1 not found, trying v2...'); }

// Try alternate nav render format
const oldNavRender2 = `<div style={{...s.nav,background:t.surface,borderTop:`;
if (code.includes(oldNavRender2)) {
  const idx = code.indexOf(oldNavRender2);
  const end = code.indexOf('}>', idx) + 2;
  const oldSlice = code.slice(idx, end);
  code = code.slice(0, idx) + `<div style={{...s.nav,background:"#FFFFFF",borderTop:"2px solid #00A651"}}>` + code.slice(end);
  console.log('✅ Patch 1b: Nav render v2 → white background');
  changes++;
}

// Also fix nav item label colors using t.accent/t.textDim
const oldNavLabel = `color:active?t.accent:t.textDim`;
const newNavLabel = `color:active?"#00A651":"#999999"`;
if (code.includes(oldNavLabel)) {
  code = code.replace(new RegExp(oldNavLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newNavLabel);
  console.log('✅ Patch 1c: Nav labels → green active, gray inactive');
  changes++;
}

// ── PATCH 2: Fix disc cards — each one its own white card with green border ───
// The current disc card background was set to white in patch5 but the
// inner content still has theme references. Let's make each disc its own
// clearly defined card.

// Fix disc name color inside card
const oldDiscName = `<div style={{fontSize:"14px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",color:"#111111"}}>{disc.name}</div><div style={{fontSize:"11px",color:"#666666",marginTop:"2px"}}>{disc.brand} · {disc.plastic||t?.label}</div>`;
const newDiscName = `<div style={{fontSize:"15px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",color:"#111111"}}>{disc.name}</div><div style={{fontSize:"12px",color:"#555555",marginTop:"2px"}}>{disc.brand} · {disc.plastic||t?.label}</div>`;
if (code.includes(oldDiscName)) {
  code = code.replace(oldDiscName, newDiscName);
  console.log('✅ Patch 2a: Disc name text → dark readable');
  changes++;
}

// Fix flight bar labels
const oldFlightLabel = `<span style={{fontSize:"10px",color:theme.textMuted,letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</span>`;
const newFlightLabel = `<span style={{fontSize:"10px",color:"#555555",letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</span>`;
if (code.includes(oldFlightLabel)) {
  code = code.replace(oldFlightLabel, newFlightLabel);
  changes++;
}

// Fix flight bar track background
const oldFlightTrack = `<div style={{height:"4px",background:theme.surfaceAlt,borderRadius:"2px",overflow:"hidden"}}>`;
const newFlightTrack = `<div style={{height:"4px",background:"#E0E0E0",borderRadius:"2px",overflow:"hidden"}}>`;
if (code.includes(oldFlightTrack)) {
  code = code.replace(oldFlightTrack, newFlightTrack);
  console.log('✅ Patch 2b: Flight bar track → light gray');
  changes++;
}

// Fix disc notes background
const oldDiscNotes = `{disc.notes&&<div style={{background:theme.surfaceAlt,borderRadius:"8px",padding:"10px 12px",fontSize:"12px",color:theme.textMuted,marginTop:"8px"}}>{disc.notes}</div>}`;
const newDiscNotes = `{disc.notes&&<div style={{background:"#F0F0F0",borderRadius:"8px",padding:"10px 12px",fontSize:"12px",color:"#555555",marginTop:"8px"}}>{disc.notes}</div>}`;
if (code.includes(oldDiscNotes)) {
  code = code.replace(oldDiscNotes, newDiscNotes);
  changes++;
}

// ── PATCH 3: Fix verify bag screen — individual disc cards ────────────────────
const oldVerifyDisc = `              <div key={disc.id} style={{...s.row,borderBottom:i<bag.length-1?\`1px solid \${theme.border}\`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span>{t?.icon}</span><div><div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>{disc.name}</div><div style={{fontSize:"11px",color:theme.textMuted}}>{disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}</div></div></div>`;
const newVerifyDisc = `              <div key={disc.id} style={{background:"#FFFFFF",border:"1px solid #00A651",borderRadius:"10px",padding:"12px",marginBottom:"8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}><span>{t?.icon}</span><div><div style={{fontSize:"13px",color:"#111111",fontWeight:"600"}}>{disc.name}</div><div style={{fontSize:"11px",color:"#555555"}}>{disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}</div></div></div>`;
if (code.includes(oldVerifyDisc)) {
  code = code.replace(oldVerifyDisc, newVerifyDisc);
  console.log('✅ Patch 3: Verify bag disc list → individual white cards');
  changes++;
} else { console.log('⚠️  Patch 3: Verify bag disc not found'); }

// ── PATCH 4: Fix the verify bag card container ────────────────────────────────
const oldVerifyBagCard = `        <div style={s.card}>
          <div style={s.slabel}>Your Bag ({bag.length} discs)</div>
          {bag.length===0?<div style={{fontSize:"13px",color:theme.error,textAlign:"center",padding:"16px"}}>⚠️ No discs — add discs first!</div>:`;
const newVerifyBagCard = `        <div style={{background:"#FFFFFF",border:"1px solid #00A651",borderRadius:"16px",padding:"20px",marginBottom:"16px"}}>
          <div style={{fontSize:"10px",letterSpacing:"0.2em",color:"#007A3D",textTransform:"uppercase",marginBottom:"12px",fontWeight:"700"}}>Your Bag ({bag.length} discs)</div>
          {bag.length===0?<div style={{fontSize:"13px",color:"#E53935",textAlign:"center",padding:"16px"}}>⚠️ No discs — add discs first!</div>:`;
if (code.includes(oldVerifyBagCard)) {
  code = code.replace(oldVerifyBagCard, newVerifyBagCard);
  console.log('✅ Patch 4: Verify bag container → white card');
  changes++;
}

// ── PATCH 5: Fix home "MY BAG" card — same green style as other home cards ────
const oldHomeBagCard = `        <div style={s.card}><div style={s.slabel}>My Bag</div>`;
const newHomeBagCard = `        <div style={{background:"#00A651",border:"1px solid #007A3D",borderRadius:"16px",padding:"20px",marginBottom:"16px"}}><div style={{fontSize:"10px",letterSpacing:"0.2em",color:"rgba(255,255,255,0.85)",textTransform:"uppercase",marginBottom:"12px",fontWeight:"500"}}>My Bag</div>`;
if (code.includes(oldHomeBagCard)) {
  code = code.replace(oldHomeBagCard, newHomeBagCard);
  console.log('✅ Patch 5: Home My Bag card → green like other home cards');
  changes++;
}

// Fix the manage bag button on home screen
const oldManageBag = `<button style={bag.length===0?s.btn:s.btnOut} onClick={()=>setTab("bag")}>{bag.length===0?"Add Your Discs":"Manage Bag"}</button>`;
const newManageBag = `<button style={{background:"rgba(255,255,255,0.2)",color:"#FFFFFF",border:"2px solid rgba(255,255,255,0.6)",borderRadius:"12px",padding:"12px 24px",fontSize:"13px",fontWeight:"700",cursor:"pointer",width:"100%",fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}} onClick={()=>setTab("bag")}>{bag.length===0?"Add Your Discs":"Manage Bag"}</button>`;
if (code.includes(oldManageBag)) {
  code = code.replace(oldManageBag, newManageBag);
  changes++;
}

// ── PATCH 6: Fix scorecard hole number text ───────────────────────────────────
const oldHoleNum = `<div style={{fontSize:"11px",color:theme.textMuted}}>{h.number}</div>
                  <div style={{fontSize:"13px",fontWeight:"700",color:sc?(diff<0?theme.accent:diff===0?theme.warning:theme.error):theme.textDim}}>{sc||"·"}</div>`;
const newHoleNum = `<div style={{fontSize:"11px",color:"rgba(255,255,255,0.7)"}}>{h.number}</div>
                  <div style={{fontSize:"13px",fontWeight:"700",color:sc?(diff<0?"#FFFFFF":diff===0?"#FFD700":"#FF6B6B"):"rgba(255,255,255,0.4)"}}>{sc||"·"}</div>`;
if (code.includes(oldHoleNum)) {
  code = code.replace(oldHoleNum, newHoleNum);
  console.log('✅ Patch 6: Scorecard hole numbers → white readable');
  changes++;
}

// ── Write patched file ────────────────────────────────────────────────────────
fs.writeFileSync(appPath, code, 'utf8');
console.log(`\n🐕 Done! Applied ${changes} patches to src/App.js`);
console.log('\nNext steps:');
console.log('  git add .');
console.log('  git commit -m "Patch 7: nav white, disc cards individual boxes, home card fix"');
console.log('  git push origin master:main --force');
