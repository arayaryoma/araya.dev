import fs from "node:fs";

// BenRG の生成コード (File:CIE1931xy_blank.svg の Perl code 節) と同一のパラメータ。
// これを共有することで、ベース図とプロットが 1px もずれない。
const SCALE = 512;
const PAD = { left: 60, top: 15 };
const MAX_Y = 0.9;
const ORIGIN = { x: PAD.left, y: PAD.top + MAX_Y * SCALE }; // 475.8
const X = (x) => ORIGIN.x + SCALE * x;
const Y = (y) => ORIGIN.y - SCALE * y;

// JIS Z 9103:2018 表1「一般材料による安全色及び対比色の色度座標の範囲，輝度率の範囲及び参考色」
const REGIONS = [
  { name: "赤",   pts: [[0.690,0.310],[0.528,0.318],[0.510,0.368],[0.612,0.388]], munsell: "8.75R 5/12" },
  { name: "黄赤", pts: [[0.590,0.408],[0.523,0.388],[0.485,0.423],[0.544,0.455]], munsell: "5YR 6.5/14" },
  { name: "黄",   pts: [[0.515,0.483],[0.463,0.443],[0.418,0.485],[0.455,0.545]], munsell: "7.5Y 8/12" },
  { name: "緑",   pts: [[0.040,0.813],[0.258,0.613],[0.295,0.430],[0.230,0.373],[0.015,0.485]], munsell: "5G 5.5/10" },
  { name: "青",   pts: [[0.078,0.171],[0.195,0.250],[0.235,0.210],[0.130,0.050]], munsell: "2.5PB 4.5/10" },
  { name: "赤紫", pts: [[0.303,0.065],[0.308,0.230],[0.365,0.258],[0.453,0.135]], munsell: "10P 4/10" },
  // 対比色は安全色ではないので、破線で描き分けたうえでラベルを外に引き出す。
  { name: "白",   pts: [[0.350,0.360],[0.305,0.315],[0.295,0.325],[0.340,0.370]], munsell: "N9.3", contrast: true, anchor: [0.340,0.370], leader: [0.348,0.452] },
  { name: "黒",   pts: [[0.385,0.355],[0.300,0.270],[0.260,0.310],[0.345,0.395]], munsell: "N1.5", contrast: true, anchor: [0.385,0.355], leader: [0.452,0.243] },
];
const D65 = [0.3127, 0.3290];

const centroid = (pts) => [
  pts.reduce((s, p) => s + p[0], 0) / pts.length,
  pts.reduce((s, p) => s + p[1], 0) / pts.length,
];
const f = (n) => Number(n.toFixed(1));

const layers = { casing: [], line: [], leader: [], label: [] };

for (const r of REGIONS) {
  const d = r.pts.map((p) => `${f(X(p[0]))},${f(Y(p[1]))}`).join(" ");
  layers.casing.push(`<polygon points="${d}" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linejoin="round" />`);
  const dash = r.contrast ? ` stroke-dasharray="6 3.5"` : "";
  layers.line.push(`<polygon points="${d}" fill="none" stroke="#000000" stroke-width="1.8" stroke-linejoin="round"${dash} />`);

  const [cx, cy] = r.leader ?? centroid(r.pts);
  if (r.leader) {
    const [ax, ay] = r.anchor ?? centroid(r.pts);
    layers.leader.push(
      `<line x1="${f(X(ax))}" y1="${f(Y(ay))}" x2="${f(X(cx))}" y2="${f(Y(cy))}" stroke="#ffffff" stroke-width="4" />`,
      `<line x1="${f(X(ax))}" y1="${f(Y(ay))}" x2="${f(X(cx))}" y2="${f(Y(cy))}" stroke="#000000" stroke-width="1.2" />`
    );
  }
  layers.label.push(
    `<text x="${f(X(cx))}" y="${f(Y(cy))}" text-anchor="middle" dominant-baseline="central">${r.name}</text>`
  );
}

// D65 は表1ではなく図1の注記（×印）に対応する。
const dx = f(X(D65[0])), dy = f(Y(D65[1])), a = 5;
layers.leader.push(
  `<path d="M${dx - a},${dy - a}L${dx + a},${dy + a}M${dx - a},${dy + a}L${dx + a},${dy - a}" stroke="#ffffff" stroke-width="5" />`,
  `<path d="M${dx - a},${dy - a}L${dx + a},${dy + a}M${dx - a},${dy + a}L${dx + a},${dy - a}" stroke="#000000" stroke-width="2" />`
);
const [lx, ly] = [X(0.272), Y(0.250)];
layers.leader.push(
  `<line x1="${dx}" y1="${dy}" x2="${f(X(0.278))}" y2="${f(Y(0.262))}" stroke="#ffffff" stroke-width="4" />`,
  `<line x1="${dx}" y1="${dy}" x2="${f(X(0.278))}" y2="${f(Y(0.262))}" stroke="#000000" stroke-width="1.2" />`
);
layers.label.push(
  `<text x="${f(lx)}" y="${f(ly)}" text-anchor="middle" dominant-baseline="central" font-size="15" font-style="italic">D65</text>`
);

const overlay = `<g id="jis-z9103">
${layers.casing.join("\n")}
${layers.line.join("\n")}
${layers.leader.join("\n")}
<g font-family="Hiragino Sans, Noto Sans JP, Yu Gothic, Meiryo, sans-serif" font-size="17" fill="#000000" stroke="#ffffff" stroke-width="3.5" paint-order="stroke fill">
${layers.label.join("\n")}
</g>
</g>
`;

const base = process.argv[2], out = process.argv[3];
const svg = fs.readFileSync(base, "utf8").replace(/<\/svg>\s*$/, overlay + "</svg>");
fs.writeFileSync(out, svg);
console.log(`wrote ${out} (${fs.statSync(out).size} bytes)`);
