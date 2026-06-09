// Chain Hound Week 5 Patch Script
// Run from your chainhound folder: node patch.js
// This patches src/App.js with all 4 Week 5 fixes

const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.js');
let code = fs.readFileSync(appPath, 'utf8');

console.log('📂 Reading App.js...');
let changes = 0;

// ── PATCH 1: Switch from direct API to Netlify proxy ──────────────────────────
const oldFetch = `      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, messages: [{ role: "user", content: prompt }] })
      });
      if (!response.ok) throw new Error(\`API \${response.status}\`);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);`;

const newFetch = `      const response = await fetch("/.netlify/functions/claude-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          system: "You are Chain Hound, an expert disc golf caddy. Respond ONLY with valid JSON. No preamble, no markdown, no explanation."
        })
      });
      if (!response.ok) throw new Error(\`Proxy \${response.status}\`);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "Proxy error");`;

if (code.includes(oldFetch)) {
  code = code.replace(oldFetch, newFetch);
  console.log('✅ Patch 1: API proxy switched to /.netlify/functions/claude-proxy');
  changes++;
} else {
  console.log('⚠️  Patch 1: Could not find direct API fetch — may already be patched or slightly different');
}

// ── PATCH 2: Add distance rules to the AI prompt ─────────────────────────────
const oldBagLine = `BAG (choose ONLY from these):`;
const newBagLine = `CRITICAL DISTANCE RULES — MUST FOLLOW:
- Under 30ft: putter only, say "just putt it"
- 30-120ft: ONLY recommend putters or midranges
- 120-200ft: ONLY recommend midranges or fairway drivers
- 200ft+: any disc appropriate for the shot
- NEVER recommend a distance driver or fairway driver for shots under 200ft
- ONLY recommend discs from the bag list below — never suggest a disc not in the bag

BAG (choose ONLY from these):`;

if (code.includes(oldBagLine)) {
  code = code.replace(oldBagLine, newBagLine);
  console.log('✅ Patch 2: Distance rules added to AI prompt');
  changes++;
} else {
  console.log('⚠️  Patch 2: Could not find BAG prompt line — may already be patched');
}

// ── PATCH 3: Fix fallback distance logic (no drivers for short shots) ─────────
const oldFallback = `      } else if (remainingDist <= 150) {
        fallbackDisc = bag.find(d => d.type === "putter") || bag.find(d => d.type === "midrange") || bag[0];
        fallbackThrow = "Backhand"; releaseAngle = "Flat";
        fallbackReason = \`\${remainingDist}ft — putter/mid range. \${defaultLine ? \`Shot line \${defaultLine.id}: \${defaultLine.label}.\` : ""}\`;
        shotLine = defaultLine?.id || null;`;

const newFallback = `      } else if (remainingDist <= 120) {
        // Short — putter only
        fallbackDisc = bag.find(d => d.type === "putter") || bag[0];
        fallbackThrow = "Backhand"; releaseAngle = "Flat";
        fallbackReason = \`\${remainingDist}ft — putter distance. \${defaultLine ? \`Shot line \${defaultLine.id}: \${defaultLine.label}.\` : "Smooth flat release."}\`;
        shotLine = defaultLine?.id || null;
      } else if (remainingDist <= 200) {
        // Medium — midrange only, never a driver
        fallbackDisc = bag.find(d => d.type === "midrange") || bag.find(d => d.type === "putter") || bag[0];
        fallbackThrow = "Backhand"; releaseAngle = "Flat";
        fallbackReason = \`\${remainingDist}ft — midrange distance. \${defaultLine ? \`Shot line \${defaultLine.id}: \${defaultLine.label}.\` : "Controlled flat release."}\`;
        shotLine = defaultLine?.id || null;`;

if (code.includes(oldFallback)) {
  code = code.replace(oldFallback, newFallback);
  console.log('✅ Patch 3: Fallback distance logic fixed — no drivers for short shots');
  changes++;
} else {
  console.log('⚠️  Patch 3: Could not find fallback distance block — may already be patched');
}

// ── PATCH 4: Wind input BEFORE caddy button ───────────────────────────────────
const oldCaddyBtn = `      {/* ── Week 4: ONE-TAP CADDY BUTTON — the whole point ── */}
      {phase === "caddy" && !rec && !recLoading && (
        <div style={{ marginBottom:"16px" }}>
          <button
            onClick={() => fireRecommendation()}
            style={{ ...s.btn, fontSize:"18px", padding:"20px", borderRadius:"16px", letterSpacing:"0.08em", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}
          >
            🐕 GET CADDY REC
          </button>
          <div style={{ textAlign:"center", fontSize:"11px", color:theme.textDim, marginTop:"8px" }}>One tap — instant advice</div>
        </div>
      )}`;

const newCaddyBtn = `      {/* ── Week 5: WIND FIRST, THEN CADDY BUTTON ── */}
      {phase === "caddy" && !rec && !recLoading && (
        <div style={{ marginBottom:"16px" }}>
          <div style={{ ...s.card, marginBottom:"12px", padding:"14px 16px" }}>
            <div style={{ ...s.slabel, marginBottom:"10px" }}>Wind Conditions</div>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {WIND_OPTIONS.map(w => (
                <div key={w.key} onClick={() => setWind(w.key)}
                  style={{ flex:"1 0 calc(33% - 4px)", padding:"8px 4px", textAlign:"center",
                    background:wind===w.key?theme.accentGlow:theme.surfaceAlt,
                    border:\`1px solid \${wind===w.key?theme.accentDim:theme.border}\`,
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
            style={{ ...s.btn, fontSize:"18px", padding:"20px", borderRadius:"16px", letterSpacing:"0.08em", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}
          >
            🐕 ASK MY CADDIE
          </button>
          <div style={{ textAlign:"center", fontSize:"11px", color:theme.textDim, marginTop:"8px" }}>Set wind above, then tap for instant advice</div>
        </div>
      )}`;

if (code.includes(oldCaddyBtn)) {
  code = code.replace(oldCaddyBtn, newCaddyBtn);
  console.log('✅ Patch 4: Wind picker now appears BEFORE caddy button');
  changes++;
} else {
  console.log('⚠️  Patch 4: Could not find caddy button block — may already be patched');
}

// ── PATCH 5: Add post-AI distance enforcement ─────────────────────────────────
const oldDiscCheck = `      const discInBag = bag.find(d => d.name.toLowerCase() === result.disc?.toLowerCase());
      if (!discInBag) { result.disc = bag[0]?.name; result.confidence = "low"; result.reason = "(Disc not in bag — defaulting.) " + result.reason; }
      setRec(result);`;

const newDiscCheck = `      const discInBag = bag.find(d => d.name.toLowerCase() === result.disc?.toLowerCase());
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
            result.reason = \`\${remainingDist}ft — \${betterDisc.name} is the right choice for this distance. \` + result.reason;
          }
        }
      }
      setRec(result);`;

if (code.includes(oldDiscCheck)) {
  code = code.replace(oldDiscCheck, newDiscCheck);
  console.log('✅ Patch 5: Post-AI distance enforcement added — catches any regression');
  changes++;
} else {
  console.log('⚠️  Patch 5: Could not find disc check block — may already be patched');
}

// ── Also add WIND_OPTIONS above HoleScreen if not present ────────────────────
if (!code.includes('const WIND_OPTIONS=[')) {
  const windOptionsCode = `
const WIND_OPTIONS=[
  {key:"none",label:"No Wind",icon:"😶"},{key:"headwind",label:"Headwind",icon:"🌬️⬆️"},
  {key:"tailwind",label:"Tailwind",icon:"🌬️⬇️"},{key:"crosswind_left",label:"Cross Left",icon:"🌬️⬅️"},
  {key:"crosswind_right",label:"Cross Right",icon:"🌬️➡️"},
];

`;
  // Insert before HoleScreen function
  code = code.replace('function HoleScreen(', windOptionsCode + 'function HoleScreen(');
  console.log('✅ Patch 6: WIND_OPTIONS moved to module scope for wind-before-caddy to work');
  changes++;
} else {
  console.log('ℹ️  WIND_OPTIONS already at module scope — skipping');
}

// Write the patched file
fs.writeFileSync(appPath, code, 'utf8');
console.log(`\n🐕 Done! Applied ${changes} patches to src/App.js`);
console.log('\nNext steps:');
console.log('  git add .');
console.log('  git commit -m "Week 5: proxy + rec fix + wind before caddy"');
console.log('  git push origin master:main --force');
