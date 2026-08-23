import fs from "node:fs";

// BenRG のベース図は x を 0〜0.8、y を 0〜0.9 までしか描いていない。XYZ の原色は
// (1,0)(0,1)(0,0) なのでそのままでは収まらず、キャンバスを広げて下へずらす。
const SHIFT = 80;
const W = 640, H = 610;
const X = (x) => 60 + 512 * x;
const Y = (y) => 475.8 + SHIFT - 512 * y;
const f = (n) => Number(n.toFixed(1));
const P = (pts) => pts.map(([x, y]) => `${f(X(x))},${f(Y(y))}`).join(" ");

const INK = "#111111";
const FONT = "Hiragino Sans, Noto Sans JP, Yu Gothic, Meiryo, sans-serif";
const SERIF = "Nimbus Roman No9 L, Times, serif";

// cap:"round" は XYZ 用。丸い点を大きく空けて打ち、Rec.2020 の短い破線と区別する。
const GAMUTS = [
  { name: "sRGB / Rec.709", dash: "",             pts: [[0.640,0.330],[0.300,0.600],[0.150,0.060]] },
  { name: "Adobe RGB",      dash: "22 7",         pts: [[0.640,0.330],[0.210,0.710],[0.150,0.060]] },
  { name: "Display P3",     dash: "4.5 4",        pts: [[0.680,0.320],[0.265,0.690],[0.150,0.060]] },
  { name: "Rec.2020",       dash: "11 5",         pts: [[0.708,0.292],[0.170,0.797],[0.131,0.046]] },
  { name: "ProPhoto RGB",   dash: "16 4 3 4",     pts: [[0.734699,0.265301],[0.159597,0.840403],[0.036598,0.000105]] },
  { name: "CIE XYZ",        dash: "0.1 8", cap: "round", pts: [[1,0],[0,1],[0,0]] },
];
// 馬蹄形の外にある原色。実在しない光であることを白抜きの点で示す。
const IMAGINARY = [[0.159597,0.840403],[0.036598,0.000105],[1,0],[0,1],[0,0]];

const stroke = (g) =>
  `stroke-width="${g.cap ? 3.6 : 2.4}" stroke-linejoin="round" stroke-linecap="${g.cap ?? "butt"}"` +
  (g.dash ? ` stroke-dasharray="${g.dash}"` : "");

const base = fs.readFileSync(process.argv[2], "utf8")
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/<rect width="100%" height="100%"[^>]*\/>/, "");

const casing = GAMUTS.map((g) => `<polygon points="${P(g.pts)}" fill="none" stroke="#ffffff" stroke-width="3.8" stroke-linejoin="round" />`);
const lines  = GAMUTS.map((g) => `<polygon points="${P(g.pts)}" fill="none" stroke="${INK}" ${stroke(g)} />`);
const dots   = IMAGINARY.map(([x, y]) => `<circle cx="${f(X(x))}" cy="${f(Y(y))}" r="5.5" fill="#ffffff" stroke="${INK}" stroke-width="2" />`);

// 0.8 / 0.9 で終わっているベース図の軸を、XYZ の原色が載る 1.0 まで延長する
const axis = [
  `<path d="M${X(0.8)},${Y(0)}L${X(1.05)},${Y(0)}M${X(0)},${Y(0.9)}L${X(0)},${Y(1.05)}" stroke="${INK}" stroke-width="1.6" stroke-dasharray="5 4" fill="none" opacity="0.55" />`,
  `<path d="M${X(0.9)},${Y(0)}l0,4M${X(1.0)},${Y(0)}l0,4M${X(0)},${Y(1.0)}l-4,0" stroke="${INK}" stroke-width="2" fill="none" />`,
  `<g font-family="${SERIF}" font-size="19" fill="${INK}" opacity="0.75">`,
  `<text x="${X(0.9)}" y="${Y(0) + 24}" text-anchor="middle">0.9</text>`,
  `<text x="${X(1.0)}" y="${Y(0) + 24}" text-anchor="middle">1.0</text>`,
  `<text x="${X(0) - 10}" y="${Y(1.0) + 7}" text-anchor="end">1.0</text>`,
  `</g>`,
].join("\n");

const LX = 352, LY = 74, ROW = 30;
const legend = [
  `<g font-family="${FONT}" font-size="17" fill="${INK}">`,
  ...GAMUTS.map((g, i) => {
    const y = LY + i * ROW;
    return `<path d="M${LX},${y}L${LX + 48},${y}" stroke="${INK}" ${stroke(g)} fill="none" />` +
           `<text x="${LX + 58}" y="${y + 6}">${g.name}</text>`;
  }),
  `<circle cx="${LX + 24}" cy="${LY + GAMUTS.length * ROW}" r="5.5" fill="#ffffff" stroke="${INK}" stroke-width="2" />`,
  `<text x="${LX + 58}" y="${LY + GAMUTS.length * ROW + 6}" font-size="15">実在しない原色（虚色）</text>`,
  `</g>`,
].join("\n");

fs.writeFileSync(process.argv[3], `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="100%" height="100%" fill="#ffffff" />
<g transform="translate(0,${SHIFT})">${base}</g>
${axis}
${casing.join("\n")}
${lines.join("\n")}
${dots.join("\n")}
${legend}
</svg>
`);
console.log(`wrote ${process.argv[3]} (${fs.statSync(process.argv[3]).size} bytes)`);
