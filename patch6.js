// Chain Hound — Patch 6
// Run from chainhound folder: node patch6.js
// Fix: nav bar black→white, home card text readable, selected = dark green + checkmark

const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, 'src', 'App.js');
let code = fs.readFileSync(appPath, 'utf8');
console.log('📂 Reading App.js...');
let changes = 0;

// ── PATCH 1: Fix nav bar — white background, green active, gray inactive ──────
const oldNav = `  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "#FFFFFF", borderTop: "1px solid #E0E0E0", display: "flex", padding: "12px 0 24px", zIndex: 100 },`;
const newNav = `  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "#FFFFFF", borderTop: "2px solid #00A651", display: "flex", padding: "12px 0 24px", zIndex: 100 },`;
if (code.includes(oldNav)) {
  code = code.replace(oldNav, newNav);
  console.log('✅ Patch 1a: Nav bar border → green');
  changes++;
}

// Fix nav render — currently using t.surface for background
const oldNavRender = `        <div style={{...s.nav,background:"#FFFFFF",borderTop:"1px solid #E0E0E0"}}>`;
const newNavRender = `        <div style={{...s.nav,background:"#FFFFFF",borderTop:"2px solid #00A651"}}>`;
if (code.includes(oldNavRender)) {
  code = code.replace(oldNavRender, newNavRender);
  changes++;
}

// Fix nav item colors — active = green, inactive = gray
const oldNavItem = `color:active?"#00A651":"#888888"`;
const newNavItem = `color:active?"#00A651":"#AAAAAA"`;
if (code.includes(oldNavItem)) {
  code = code.replace(new RegExp(oldNavItem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newNavItem);
  console.log('✅ Patch 1b: Nav item colors fixed');
  changes++;
}

// ── PATCH 2: Fix home screen cards — darker bg, white text ───────────────────
// The s.card is green but text inside home/bag/settings should be white
// Fix the MY BAG card text
const oldBagCount = `            <div><div style={{fontSize:"48px",fontWeight:"700",color:theme.accent,fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{bag.length}</div><div style={{fontSize:"12px",color:theme.textMuted,marginTop:"4px"}}>{bag.length===1?"Disc":"Discs"} in bag</div></div>`;
const newBagCount = `            <div><div style={{fontSize:"48px",fontWeight:"700",color:"#FFFFFF",fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{bag.length}</div><div style={{fontSize:"12px",color:"rgba(255,255,255,0.85)",marginTop:"4px"}}>{bag.length===1?"Disc":"Discs"} in bag</div></div>`;
if (code.includes(oldBagCount)) {
  code = code.replace(oldBagCount, newBagCount);
  console.log('✅ Patch 2a: Bag count text → white');
  changes++;
}

// Fix player profile row text
const oldProfileRow1 = `<span style={{fontSize:"12px",color:theme.textMuted}}>Dominant Hand</span><span style={{fontSize:"13px",color:theme.accent,fontWeight:"600"}}>{settings?.dominantHand==="left"?"Left (LHBH)":"Right (RHBH)"}</span>`;
const newProfileRow1 = `<span style={{fontSize:"12px",color:"rgba(255,255,255,0.85)"}}>Dominant Hand</span><span style={{fontSize:"13px",color:"#FFFFFF",fontWeight:"700"}}>{settings?.dominantHand==="left"?"Left (LHBH)":"Right (RHBH)"}</span>`;
if (code.includes(oldProfileRow1)) {
  code = code.replace(oldProfileRow1, newProfileRow1);
  changes++;
}

const oldProfileRow2 = `<span style={{fontSize:"12px",color:theme.textMuted}}>Backhand fade direction</span><span style={{fontSize:"13px",color:theme.text}}>{settings?.dominantHand==="left"?"Right →":"Left ←"}</span>`;
const newProfileRow2 = `<span style={{fontSize:"12px",color:"rgba(255,255,255,0.85)"}}>Backhand fade direction</span><span style={{fontSize:"13px",color:"#FFFFFF",fontWeight:"600"}}>{settings?.dominantHand==="left"?"Right →":"Left ←"}</span>`;
if (code.includes(oldProfileRow2)) {
  code = code.replace(oldProfileRow2, newProfileRow2);
  changes++;
}

// Fix "Start a Round" card text
const oldStartRound = `<div style={{fontSize:"13px",color:theme.textMuted,marginBottom:"20px",lineHeight:1.6}}>One tap — instant caddy advice on every hole. 🐕</div>`;
const newStartRound = `<div style={{fontSize:"13px",color:"rgba(255,255,255,0.9)",marginBottom:"20px",lineHeight:1.6}}>One tap — instant caddy advice on every hole. 🐕</div>`;
if (code.includes(oldStartRound)) {
  code = code.replace(oldStartRound, newStartRound);
  changes++;
}

const oldStartTitle = `<div style={{fontSize:"20px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",marginBottom:"8px"}}>Start a Round</div>`;
const newStartTitle = `<div style={{fontSize:"20px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",marginBottom:"8px",color:"#FFFFFF"}}>Start a Round</div>`;
if (code.includes(oldStartTitle)) {
  code = code.replace(oldStartTitle, newStartTitle);
  changes++;
}

// ── PATCH 3: Consistent selected state — dark green + checkmark everywhere ────
// Settings: dominant hand buttons
const oldHandBtn = `style={{padding:"10px 16px",background:settings?.dominantHand===hand?theme.accentGlow:theme.surfaceAlt,border:\`1px solid \${settings?.dominantHand===hand?theme.accentDim:theme.border}\`,borderRadius:"10px",cursor:"pointer",fontSize:"12px",fontWeight:"600",color:settings?.dominantHand===hand?theme.accent:theme.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{hand}`;
const newHandBtn = `style={{padding:"10px 16px",background:settings?.dominantHand===hand?"#005C2E":"#00C875",border:"1px solid #007A3D",borderRadius:"10px",cursor:"pointer",fontSize:"12px",fontWeight:"700",color:"#FFFFFF",fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>{settings?.dominantHand===hand?"✓ ":""}{hand}`;
if (code.includes(oldHandBtn)) {
  code = code.replace(oldHandBtn, newHandBtn);
  console.log('✅ Patch 3a: Hand selector → dark/light green + checkmark');
  changes++;
}

// Settings: skill level buttons
const oldSkillBtn = `style={{flex:1,padding:"12px 6px",textAlign:"center",background:settings?.skillLevel===level?theme.accentGlow:theme.surfaceAlt,border:\`1px solid \${settings?.skillLevel===level?theme.accentDim:theme.border}\`,borderRadius:"10px",cursor:"pointer",fontSize:"10px",fontWeight:"600",color:settings?.skillLevel===level?theme.accent:theme.textMuted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em"}}>{level}`;
const newSkillBtn = `style={{flex:1,padding:"12px 6px",textAlign:"center",background:settings?.skillLevel===level?"#005C2E":"#00C875",border:"1px solid #007A3D",borderRadius:"10px",cursor:"pointer",fontSize:"10px",fontWeight:"700",color:"#FFFFFF",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em"}}>{settings?.skillLevel===level?"✓ ":""}{level}`;
if (code.includes(oldSkillBtn)) {
  code = code.replace(oldSkillBtn, newSkillBtn);
  console.log('✅ Patch 3b: Skill level → dark/light green + checkmark');
  changes++;
}

// Settings: driver distance buttons
const oldDistBtn = `style={{flex:"1 0 calc(50% - 4px)",padding:"12px 8px",textAlign:"center",background:settings?.driverDistance===opt.key?theme.accentGlow:theme.surfaceAlt,border:\`1px solid \${settings?.driverDistance===opt.key?theme.accentDim:theme.border}\`,borderRadius:"10px",cursor:"pointer",fontSize:"11px",color:settings?.driverDistance===opt.key?theme.accent:theme.textMuted,fontFamily:"'DM Mono',monospace"}}>{opt.label}`;
const newDistBtn = `style={{flex:"1 0 calc(50% - 4px)",padding:"12px 8px",textAlign:"center",background:settings?.driverDistance===opt.key?"#005C2E":"#00C875",border:"1px solid #007A3D",borderRadius:"10px",cursor:"pointer",fontSize:"11px",color:"#FFFFFF",fontWeight:"600",fontFamily:"'DM Mono',monospace"}}>{settings?.driverDistance===opt.key?"✓ ":""}{opt.label}`;
if (code.includes(oldDistBtn)) {
  code = code.replace(oldDistBtn, newDistBtn);
  console.log('✅ Patch 3c: Driver distance → dark/light green + checkmark');
  changes++;
}

// ── PATCH 4: Fix settings card text readability ───────────────────────────────
const oldSettingLabel = `<div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>Dominant Hand</div>`;
const newSettingLabel = `<div style={{fontSize:"13px",color:"#FFFFFF",fontWeight:"700"}}>Dominant Hand</div>`;
if (code.includes(oldSettingLabel)) {
  code = code.replace(oldSettingLabel, newSettingLabel);
  changes++;
}

const oldSettingDesc = `<div style={{fontSize:"11px",color:theme.textMuted,marginTop:"2px"}}>Affects all disc recommendations</div>`;
const newSettingDesc = `<div style={{fontSize:"11px",color:"rgba(255,255,255,0.8)",marginTop:"2px"}}>Affects all disc recommendations</div>`;
if (code.includes(oldSettingDesc)) {
  code = code.replace(oldSettingDesc, newSettingDesc);
  changes++;
}

const oldHighContrast = `<div style={{fontSize:"13px",color:theme.text,fontWeight:"600"}}>High Contrast</div>`;
const newHighContrast = `<div style={{fontSize:"13px",color:"#FFFFFF",fontWeight:"700"}}>High Contrast</div>`;
if (code.includes(oldHighContrast)) {
  code = code.replace(oldHighContrast, newHighContrast);
  changes++;
}

const oldHighContrastDesc = `<div style={{fontSize:"11px",color:theme.textMuted,marginTop:"2px"}}>Maximum contrast for sunlight.</div>`;
const newHighContrastDesc = `<div style={{fontSize:"11px",color:"rgba(255,255,255,0.8)",marginTop:"2px"}}>Maximum contrast for sunlight.</div>`;
if (code.includes(oldHighContrastDesc)) {
  code = code.replace(oldHighContrastDesc, newHighContrastDesc);
  changes++;
}

// ── PATCH 5: Fix course list cards on Round screen ────────────────────────────
const oldCourseCard = `<div><div style={{fontSize:"15px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif"}}>{course.name}</div><div style={{fontSize:"11px",color:theme.textMuted,marginTop:"3px"}}>{course.holes?.length||0} holes · {course.location||course.createdAt}</div></div>
                <div style={{fontSize:"20px",color:theme.accent}}>▶</div>`;
const newCourseCard = `<div><div style={{fontSize:"15px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",color:"#FFFFFF"}}>{course.name}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.8)",marginTop:"3px"}}>{course.holes?.length||0} holes · {course.location||course.createdAt}</div></div>
                <div style={{fontSize:"20px",color:"#FFFFFF"}}>▶</div>`;
if (code.includes(oldCourseCard)) {
  code = code.replace(oldCourseCard, newCourseCard);
  console.log('✅ Patch 5: Course list text → white');
  changes++;
}

// ── PATCH 6: Fix disc bag screen type labels ──────────────────────────────────
const oldTypeLabel = `<div style={{...s.slabel,display:"flex",alignItems:"center",gap:"6px"}}><span>{type.icon}</span>{type.label}<span style={{color:theme.textDim}}>({type.discs.length})</span></div>`;
const newTypeLabel = `<div style={{fontSize:"10px",letterSpacing:"0.2em",color:"#007A3D",textTransform:"uppercase",marginBottom:"12px",fontWeight:"700",display:"flex",alignItems:"center",gap:"6px"}}><span>{type.icon}</span>{type.label}<span style={{color:"#00A651"}}>({type.discs.length})</span></div>`;
if (code.includes(oldTypeLabel)) {
  code = code.replace(oldTypeLabel, newTypeLabel);
  console.log('✅ Patch 6: Bag type labels → dark green on white');
  changes++;
}

// ── PATCH 7: Fix disc bag screen header disc count ────────────────────────────
const oldBagHeader = `<div style={{fontSize:"28px",fontWeight:"700",color:theme.accent,fontFamily:"'DM Sans',sans-serif"}}>{bag.length}</div>`;
const newBagHeader = `<div style={{fontSize:"28px",fontWeight:"700",color:"#00A651",fontFamily:"'DM Sans',sans-serif"}}>{bag.length}</div>`;
if (code.includes(oldBagHeader)) {
  code = code.replace(oldBagHeader, newBagHeader);
  changes++;
}

// ── Write patched file ────────────────────────────────────────────────────────
fs.writeFileSync(appPath, code, 'utf8');
console.log(`\n🐕 Done! Applied ${changes} patches to src/App.js`);
console.log('\nNext steps:');
console.log('  git add .');
console.log('  git commit -m "Patch 6: nav white, readable text, checkmarks on selected"');
console.log('  git push origin master:main --force');
