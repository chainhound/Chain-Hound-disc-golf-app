// Chain Hound — Patch 5
// Run from chainhound folder: node patch5.js
// Fix: contrast issues, black buttons → light green, consistent color system

const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, 'src', 'App.js');
let code = fs.readFileSync(appPath, 'utf8');
console.log('📂 Reading App.js...');
let changes = 0;

// ── COLOR SYSTEM ──────────────────────────────────────────────────────────────
// Action screens (on course):
//   - Card bg: #00A651 (mid green)
//   - Selected/active: #005C2E (dark green)
//   - Unselected: #00C875 (light green)
//   - Text on green: #FFFFFF
//
// Browsing screens (bag, settings, home):
//   - Card bg: #FFFFFF (white)
//   - Border: #00A651 (green)
//   - Text: #111111 (dark)
//   - Accent: #00A651 (green)

// ── PATCH 1: Fix disc cards in My Bag (white cards, not dark) ────────────────
const oldDiscCard = `    <div style={{background:theme.surface,border:\`1px solid \${theme.border}\`,borderRadius:"14px",marginBottom:"12px",overflow:"hidden"}}>
      <div style={{padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px"}} onClick={()=>setExp(!exp)}>
        <div style={{width:"42px",height:"42px",background:theme.surfaceAlt,border:\`1px solid \${theme.border}\`,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>{t?.icon}</div>
        <div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif"}}>{disc.name}</div><div style={{fontSize:"11px",color:theme.textMuted,marginTop:"2px"}}>{disc.brand} · {disc.plastic||t?.label}</div></div>`;
const newDiscCard = `    <div style={{background:"#FFFFFF",border:"1px solid #00A651",borderRadius:"14px",marginBottom:"12px",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,166,81,0.1)"}}>
      <div style={{padding:"16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px"}} onClick={()=>setExp(!exp)}>
        <div style={{width:"42px",height:"42px",background:"#E8F5EE",border:"1px solid #00A651",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>{t?.icon}</div>
        <div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",color:"#111111"}}>{disc.name}</div><div style={{fontSize:"11px",color:"#666666",marginTop:"2px"}}>{disc.brand} · {disc.plastic||t?.label}</div></div>`;
if (code.includes(oldDiscCard)) {
  code = code.replace(oldDiscCard, newDiscCard);
  console.log('✅ Patch 1: Disc cards → white with green border');
  changes++;
} else { console.log('⚠️  Patch 1: Disc card not found'); }

// Fix expand arrow color in disc card
const oldExpandArrow = `          <div style={{color:theme.textDim}}>{exp?"▲":"▼"}</div>`;
const newExpandArrow = `          <div style={{color:"#00A651"}}>{exp?"▲":"▼"}</div>`;
if (code.includes(oldExpandArrow)) {
  code = code.replace(oldExpandArrow, newExpandArrow);
  changes++;
}

// Fix disc card expanded section
const oldDiscExpanded = `      {exp&&(<div style={{padding:"0 16px 16px",borderTop:\`1px solid \${theme.border}\`}}>`;
const newDiscExpanded = `      {exp&&(<div style={{padding:"0 16px 16px",borderTop:"1px solid #E0E0E0"}}>`;
if (code.includes(oldDiscExpanded)) {
  code = code.replace(oldDiscExpanded, newDiscExpanded);
  changes++;
}

// ── PATCH 2: Fix wind buttons — no black, light/dark green system ─────────────
// Wind buttons BEFORE recommendation (the picker)
const oldWindPickerBtn = `                <div key={w.key} onClick={() => setWind(w.key)}
                  style={{ flex:"1 0 calc(33% - 4px)", padding:"8px 4px", textAlign:"center",
                    background:wind===w.key?theme.accentGlow:theme.surfaceAlt,
                    border:\`1px solid \${wind===w.key?theme.accentDim:theme.border}\`,
                    borderRadius:"8px", cursor:"pointer", fontSize:"10px",
                    color:wind===w.key?theme.accent:theme.textMuted }}>`;
const newWindPickerBtn = `                <div key={w.key} onClick={() => setWind(w.key)}
                  style={{ flex:"1 0 calc(33% - 4px)", padding:"8px 4px", textAlign:"center",
                    background:wind===w.key?"#005C2E":"#00C875",
                    border:"1px solid #007A3D",
                    borderRadius:"8px", cursor:"pointer", fontSize:"10px",
                    color:"#FFFFFF" }}>`;
if (code.includes(oldWindPickerBtn)) {
  code = code.replace(oldWindPickerBtn, newWindPickerBtn);
  console.log('✅ Patch 2a: Wind picker buttons → dark/light green system');
  changes++;
} else { console.log('⚠️  Patch 2a: Wind picker not found'); }

// Wind buttons AFTER recommendation
const oldWindAfterBtn = `              <div key={w.key} onClick={() => { setWind(w.key); setRec(null); setTimeout(()=>getRecommendation({hole,bag,settings,remainingDist,wind:w.key,lie:lastShot?lastShot.lie:"tee",lastShots:holeShots,position:lastShot?lastShot.position:"center"}),50); }}
                style={{ flex:"1 0 calc(33% - 4px)", padding:"8px 4px", textAlign:"center", background:wind===w.key?"#00A651":"#F5F5F5", border:\`1px solid \${wind===w.key?"#007A3D":"#00A651"}\`, borderRadius:"8px", cursor:"pointer", fontSize:"10px", color:wind===w.key?"#FFFFFF":"#007A3D" }}>`;
const newWindAfterBtn = `              <div key={w.key} onClick={() => { setWind(w.key); setRec(null); setTimeout(()=>getRecommendation({hole,bag,settings,remainingDist,wind:w.key,lie:lastShot?lastShot.lie:"tee",lastShots:holeShots,position:lastShot?lastShot.position:"center"}),50); }}
                style={{ flex:"1 0 calc(33% - 4px)", padding:"8px 4px", textAlign:"center", background:wind===w.key?"#005C2E":"#00C875", border:"1px solid #007A3D", borderRadius:"8px", cursor:"pointer", fontSize:"10px", color:"#FFFFFF" }}>`;
if (code.includes(oldWindAfterBtn)) {
  code = code.replace(oldWindAfterBtn, newWindAfterBtn);
  console.log('✅ Patch 2b: Wind buttons after rec → dark/light green system');
  changes++;
}

// ── PATCH 3: Fix throw type selector buttons ──────────────────────────────────
const oldThrowSelector = `                    <div onClick={()=>handleThrowChange(tt)} style={{ padding:"8px 12px",background:active?"#00FF77":"transparent",border:\`2px solid \${active?"#00FF77":"#2A5C34"}\`,borderRadius:"8px",cursor:"pointer",fontSize:"12px",fontWeight:"700",color:active?"#000":"#9ECBA8",display:"flex",alignItems:"center",gap:"4px" }}>`;
const newThrowSelector = `                    <div onClick={()=>handleThrowChange(tt)} style={{ padding:"8px 12px",background:active?"#005C2E":"#00C875",border:"2px solid #007A3D",borderRadius:"8px",cursor:"pointer",fontSize:"12px",fontWeight:"700",color:"#FFFFFF",display:"flex",alignItems:"center",gap:"4px" }}>`;
if (code.includes(oldThrowSelector)) {
  code = code.replace(oldThrowSelector, newThrowSelector);
  console.log('✅ Patch 3: Throw type buttons → dark/light green system');
  changes++;
} else { console.log('⚠️  Patch 3: Throw selector not found'); }

// ── PATCH 4: Fix shot line boxes — more contrast ──────────────────────────────
const oldShotLineBox = `                <div key={sl.id} style={{ flex:"1 0 calc(50% - 4px)", padding:"10px 12px", background:\`\${c}18\`, border:\`1px solid \${c}44\`, borderRadius:"10px" }}>`;
const newShotLineBox = `                <div key={sl.id} style={{ flex:"1 0 calc(50% - 4px)", padding:"10px 12px", background:"#005C2E", border:"2px solid #003D1E", borderRadius:"10px" }}>`;
if (code.includes(oldShotLineBox)) {
  code = code.replace(oldShotLineBox, newShotLineBox);
  console.log('✅ Patch 4a: Shot line boxes → dark green for contrast');
  changes++;
}

// Fix shot line text colors
const oldShotLineLabel = `                    <span style={{ fontSize:"12px",fontWeight:"600",color:theme.text }}>{sl.label}</span>`;
const newShotLineLabel = `                    <span style={{ fontSize:"12px",fontWeight:"600",color:"#FFFFFF" }}>{sl.label}</span>`;
if (code.includes(oldShotLineLabel)) {
  code = code.replace(oldShotLineLabel, newShotLineLabel);
  changes++;
}

const oldShotLineDesc = `                  <div style={{ fontSize:"11px",color:theme.textMuted,lineHeight:1.4 }}>{sl.description}</div>
                  <div style={{ fontSize:"10px",color:c,marginTop:"4px",fontWeight:"600" }}>{sl.throwType}</div>`;
const newShotLineDesc = `                  <div style={{ fontSize:"11px",color:"rgba(255,255,255,0.85)",lineHeight:1.4 }}>{sl.description}</div>
                  <div style={{ fontSize:"10px",color:"#00C875",marginTop:"4px",fontWeight:"600" }}>{sl.throwType}</div>`;
if (code.includes(oldShotLineDesc)) {
  code = code.replace(oldShotLineDesc, newShotLineDesc);
  changes++;
}

// ── PATCH 5: Fix "Helpful?" text and feedback buttons ────────────────────────
const oldHelpful = `            <div style={{ display:"flex",gap:"8px",marginBottom:"14px",alignItems:"center" }}>
              <span style={{ fontSize:"11px",color:"#9ECBA8" }}>Helpful?</span>`;
const newHelpful = `            <div style={{ display:"flex",gap:"8px",marginBottom:"14px",alignItems:"center" }}>
              <span style={{ fontSize:"11px",color:"#111111",fontWeight:"600" }}>Helpful?</span>`;
if (code.includes(oldHelpful)) {
  code = code.replace(oldHelpful, newHelpful);
  console.log('✅ Patch 5: Helpful text → dark for readability');
  changes++;
}

// ── PATCH 6: Fix release angle button (the "Flat" button next to throw type) ──
const oldReleaseBtn = `              <div onClick={()=>setReleasePopup(rec.releaseAngle)} style={{ flex:1,background:"#162B1A",border:\`1px solid \${releaseInfo.border}\`,borderRadius:"10px",padding:"10px 12px",cursor:"pointer",position:"relative" }}>`;
const newReleaseBtn = `              <div onClick={()=>setReleasePopup(rec.releaseAngle)} style={{ flex:1,background:"#005C2E",border:"1px solid #003D1E",borderRadius:"10px",padding:"10px 12px",cursor:"pointer",position:"relative" }}>`;
if (code.includes(oldReleaseBtn)) {
  code = code.replace(oldReleaseBtn, newReleaseBtn);
  console.log('✅ Patch 6: Release angle button → dark green');
  changes++;
}

// Fix release angle text color
const oldReleaseText = `                  <div style={{ fontSize:"14px",fontWeight:"700",color:releaseInfo.color }}>{rec.releaseAngle}</div>`;
const newReleaseText = `                  <div style={{ fontSize:"14px",fontWeight:"700",color:"#FFFFFF" }}>{rec.releaseAngle}</div>`;
if (code.includes(oldReleaseText)) {
  code = code.replace(oldReleaseText, newReleaseText);
  changes++;
}

// ── PATCH 7: Fix disc picker (browsing screen — white cards) ─────────────────
const oldDiscPickerItem = `                <div key={disc.id} onClick={() => onSelect(disc)} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",marginBottom:"6px",background:isSelected?theme.accentGlow:theme.surfaceAlt,border:\`1px solid \${isSelected?theme.accentDim:theme.border}\`,borderRadius:"10px",cursor:"pointer" }}>
                  <div><div style={{fontSize:"13px",fontWeight:"700",color:theme.text}}>{disc.name}</div><div style={{fontSize:"11px",color:theme.textMuted}}>{disc.brand} · {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}</div></div>`;
const newDiscPickerItem = `                <div key={disc.id} onClick={() => onSelect(disc)} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",marginBottom:"6px",background:isSelected?"#E8F5EE":"#FFFFFF",border:\`1px solid \${isSelected?"#00A651":"#CCCCCC"}\`,borderRadius:"10px",cursor:"pointer" }}>
                  <div><div style={{fontSize:"13px",fontWeight:"700",color:"#111111"}}>{disc.name}</div><div style={{fontSize:"11px",color:"#666666"}}>{disc.brand} · {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}</div></div>`;
if (code.includes(oldDiscPickerItem)) {
  code = code.replace(oldDiscPickerItem, newDiscPickerItem);
  console.log('✅ Patch 7: Disc picker → white cards');
  changes++;
}

// Fix disc picker background
const oldDiscPickerBg = `      <div style={{ background: theme.surface, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: "430px", margin: "0 auto", padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>`;
const newDiscPickerBg = `      <div style={{ background: "#FFFFFF", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: "430px", margin: "0 auto", padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>`;
if (code.includes(oldDiscPickerBg)) {
  code = code.replace(oldDiscPickerBg, newDiscPickerBg);
  changes++;
}

// ── PATCH 8: Fix home/settings/bag cards (browsing — white cards dark text) ───
// Home screen cards use s.card which is now green — override for browsing screens
// We'll fix the hmain title color
const oldHmain = `  hmain: { fontSize: "26px", fontWeight: "700", color: theme.text, letterSpacing: "-0.02em", fontFamily: "'DM Sans',sans-serif" },`;
const newHmain = `  hmain: { fontSize: "26px", fontWeight: "700", color: "#111111", letterSpacing: "-0.02em", fontFamily: "'DM Sans',sans-serif" },`;
if (code.includes(oldHmain)) {
  code = code.replace(oldHmain, newHmain);
  changes++;
}

const oldHtitle = `  htitle: { fontSize: "11px", letterSpacing: "0.25em", color: theme.accent, textTransform: "uppercase", marginBottom: "4px", fontWeight: "500" },`;
const newHtitle = `  htitle: { fontSize: "11px", letterSpacing: "0.25em", color: "#00A651", textTransform: "uppercase", marginBottom: "4px", fontWeight: "500" },`;
if (code.includes(oldHtitle)) {
  code = code.replace(oldHtitle, newHtitle);
  changes++;
}

// ── PATCH 9: Fix info popup (dark green popup) ────────────────────────────────
const oldInfoPopup = `      <div style={{ background:"#1A3320",border:"2px solid #00CC60",borderRadius:"20px 20px 0 0",padding:"24px",width:"100%",maxWidth:"430px" }} onClick={e=>e.stopPropagation()}>`;
const newInfoPopup = `      <div style={{ background:"#FFFFFF",border:"2px solid #00A651",borderRadius:"20px 20px 0 0",padding:"24px",width:"100%",maxWidth:"430px" }} onClick={e=>e.stopPropagation()}>`;
if (code.includes(oldInfoPopup)) {
  code = code.replace(oldInfoPopup, newInfoPopup);
  console.log('✅ Patch 9: Info popup → white background');
  changes++;
}

const oldInfoTitle = `          <div style={{ fontSize:"20px",fontWeight:"800",color:"#00FF77",fontFamily:"'DM Sans',sans-serif" }}>{title}</div>`;
const newInfoTitle = `          <div style={{ fontSize:"20px",fontWeight:"800",color:"#00A651",fontFamily:"'DM Sans',sans-serif" }}>{title}</div>`;
if (code.includes(oldInfoTitle)) {
  code = code.replace(oldInfoTitle, newInfoTitle);
  changes++;
}

const oldInfoLine = `          <div key={i} style={{ marginBottom:"14px",padding:"10px 14px",background:"#162B1A",borderRadius:"10px" }}>
            <div style={{ fontSize:"10px",color:"#9ECBA8",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"4px",fontWeight:"600" }}>{line.label}</div>
            <div style={{ fontSize:"14px",color:"#FFFFFF",lineHeight:1.6 }}>{line.text}</div>`;
const newInfoLine = `          <div key={i} style={{ marginBottom:"14px",padding:"10px 14px",background:"#E8F5EE",borderRadius:"10px",border:"1px solid #00A651" }}>
            <div style={{ fontSize:"10px",color:"#007A3D",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"4px",fontWeight:"600" }}>{line.label}</div>
            <div style={{ fontSize:"14px",color:"#111111",lineHeight:1.6 }}>{line.text}</div>`;
if (code.includes(oldInfoLine)) {
  code = code.replace(oldInfoLine, newInfoLine);
  changes++;
}

const oldInfoClose = `        <button onClick={onClose} style={{ width:"100%",padding:"14px",background:"#00FF77",color:"#000",border:"none",borderRadius:"12px",fontSize:"14px",fontWeight:"700",cursor:"pointer" }}>Got It ✓</button>`;
const newInfoClose = `        <button onClick={onClose} style={{ width:"100%",padding:"14px",background:"#00A651",color:"#FFFFFF",border:"none",borderRadius:"12px",fontSize:"14px",fontWeight:"700",cursor:"pointer" }}>Got It ✓</button>`;
if (code.includes(oldInfoClose)) {
  code = code.replace(oldInfoClose, newInfoClose);
  changes++;
}

// ── PATCH 10: Fix lie picker buttons ─────────────────────────────────────────
const oldLiePicker = `              <div key={lie.key} onClick={()=>logShot(pendingShot, lie.key)} style={{ padding:"14px 8px", textAlign:"center", background:theme.surfaceAlt, border:\`1px solid \${theme.border}\`, borderRadius:"12px", cursor:"pointer", minHeight:"64px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"4px" }}>
                <div style={{fontSize:"20px"}}>{lie.icon}</div>
                <div style={{fontSize:"10px",color:theme.textMuted,letterSpacing:"0.05em"}}>{lie.label}</div>`;
const newLiePicker = `              <div key={lie.key} onClick={()=>logShot(pendingShot, lie.key)} style={{ padding:"14px 8px", textAlign:"center", background:"#00C875", border:"1px solid #007A3D", borderRadius:"12px", cursor:"pointer", minHeight:"64px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"4px" }}>
                <div style={{fontSize:"20px"}}>{lie.icon}</div>
                <div style={{fontSize:"10px",color:"#FFFFFF",letterSpacing:"0.05em"}}>{lie.label}</div>`;
if (code.includes(oldLiePicker)) {
  code = code.replace(oldLiePicker, newLiePicker);
  console.log('✅ Patch 10: Lie picker buttons → light green');
  changes++;
}

// ── Write patched file ────────────────────────────────────────────────────────
fs.writeFileSync(appPath, code, 'utf8');
console.log(`\n🐕 Done! Applied ${changes} patches to src/App.js`);
console.log('\nNext steps:');
console.log('  git add .');
console.log('  git commit -m "Patch 5: contrast fixes, consistent green system, no black buttons"');
console.log('  git push origin master:main --force');
