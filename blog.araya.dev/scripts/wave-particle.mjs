import fs from "node:fs";

const W = 760, H = 278;
const INK = "#1a1a1a";
const FONT = "Hiragino Sans, Noto Sans JP, Yu Gothic, Meiryo, sans-serif";
const SERIF = "Nimbus Roman No9 L, Times New Roman, serif";

const LANE_A = 100, LANE_B = 240;   // 波と粒子、それぞれの中心線
const START = 178, END = 178 + 11 * 45, TIP = 712;
const AMP = 30, LAMBDA = 90;

// 正弦波。零交差から始めることで、連結線とそのままつながる。
const wave = (() => {
  const step = 3, pts = [];
  for (let x = START; x <= END; x += step) {
    pts.push(`${x.toFixed(1)},${(LANE_A - AMP * Math.sin((2 * Math.PI * (x - START)) / LAMBDA)).toFixed(1)}`);
  }
  return `M${pts.join("L")}`;
})();

const crest = (n) => START + LAMBDA / 4 + n * LAMBDA;
const [c1, c2] = [crest(3), crest(4)];
const dimY = LANE_A - AMP - 20;

const photons = Array.from({ length: 6 }, (_, i) => 200 + i * 83);

// 光源から出る放射線
const rays = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4, [cx, cy, r0, r1] = [72, 170, 23, 32];
  return `M${(cx + r0 * Math.cos(a)).toFixed(1)},${(cy + r0 * Math.sin(a)).toFixed(1)}L${(cx + r1 * Math.cos(a)).toFixed(1)},${(cy + r1 * Math.sin(a)).toFixed(1)}`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="同じひとつの光が、波としても粒子としても記述できることを示す図">
<rect width="100%" height="100%" fill="#ffffff" />
<g fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round">
  <circle cx="72" cy="170" r="16" />
  <path d="${rays}" />
  <path d="M104,170L140,170M140,${LANE_A}L140,${LANE_B}M140,${LANE_A}L${START},${LANE_A}M140,${LANE_B}L${START},${LANE_B}" />
</g>

<path d="${wave}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" />
<path d="M${END},${LANE_A}L${END + 26},${LANE_A}" stroke="${INK}" stroke-width="2.6" marker-end="url(#arrow)" fill="none" />

<g fill="${INK}">
${photons.map((x) => `  <circle cx="${x}" cy="${LANE_B}" r="11" />`).join("\n")}
</g>
<path d="M${photons.at(-1) + 24},${LANE_B}L${END + 26},${LANE_B}" stroke="${INK}" stroke-width="2.6" marker-end="url(#arrow)" fill="none" />

<g stroke="${INK}" stroke-width="1.6" fill="none">
  <path d="M${c1},${LANE_A - AMP - 4}L${c1},${dimY - 6}M${c2},${LANE_A - AMP - 4}L${c2},${dimY - 6}" stroke-dasharray="4 3" />
  <path d="M${c1},${dimY}L${c2},${dimY}" marker-start="url(#tick)" marker-end="url(#tick)" />
</g>

<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0,0L10,5L0,10z" fill="${INK}" />
  </marker>
  <marker id="tick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
    <path d="M5,0L5,10" stroke="${INK}" stroke-width="2" />
  </marker>
</defs>

<g font-family="${FONT}" font-size="19" fill="${INK}">
  <text x="${START}" y="${LANE_A - AMP - 34}">波（電磁波）</text>
  <text x="${START}" y="${LANE_B - 34}">粒子（光子）</text>
</g>
<g font-family="${SERIF}" font-size="19" font-style="italic" fill="${INK}">
  <text x="${START + 148}" y="${LANE_B - 34}">E = hc / λ</text>
</g>
<text x="${(c1 + c2) / 2}" y="${dimY - 12}" text-anchor="middle" font-family="${SERIF}" font-size="21" font-style="italic" fill="${INK}">λ</text>
<text x="${(c1 + c2) / 2 + 16}" y="${dimY - 12}" text-anchor="start" font-family="${FONT}" font-size="15" fill="${INK}">（波長）</text>
</svg>
`;

fs.writeFileSync(process.argv[2], svg);
console.log(`wrote ${process.argv[2]} (${fs.statSync(process.argv[2]).size} bytes)`);
