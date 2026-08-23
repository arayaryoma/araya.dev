import fs from "node:fs";
import path from "node:path";
const src = fs.readFileSync(path.join(import.meta.dirname, "cie1931-cmf-source.txt"), "utf8");
const grab = (n) => src.match(new RegExp(`my @${n} = \\(([\\s\\S]*?)\\);`))[1].split(",").map(s=>parseFloat(s.trim()));
const [xb, yb, zb] = ["xcmf","ycmf","zcmf"].map(grab);
// 5nm 刻みのデータを 1nm に線形補間する。5nm の弦のままだと、軌跡上の点(単色光)が
// 外側と誤判定される。
const cmf = (nm) => {
  const f = (nm - 360) / 5, i = Math.floor(f), t = f - i;
  const at = (a) => a[i] + (a[i + 1] - a[i]) * t;
  return [at(xb), at(yb), at(zb)];
};
const locus = (nm) => { const [X,Y,Z]=cmf(nm), s=X+Y+Z; return [X/s, Y/s]; };
const LOCUS = []; for (let nm=380; nm<=700; nm+=1) LOCUS.push([nm, locus(nm)]);

// 馬蹄形は凸なので、凸包の各辺に対する符号付き距離で内外を測る
const hull = (() => {
  const p = LOCUS.map(([,q])=>q).slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[],up=[];
  for(const q of p){while(lo.length>=2&&cr(lo.at(-2),lo.at(-1),q)<=0)lo.pop();lo.push(q)}
  for(const q of [...p].reverse()){while(up.length>=2&&cr(up.at(-2),up.at(-1),q)<=0)up.pop();up.push(q)}
  return lo.slice(0,-1).concat(up.slice(0,-1));
})();
// 正なら外側
const outness = (p) => Math.max(...hull.map((a,i)=>{
  const b=hull[(i+1)%hull.length], [dx,dy]=[b[0]-a[0],b[1]-a[1]], L=Math.hypot(dx,dy);
  return ((p[0]-a[0])*dy - (p[1]-a[1])*dx)/L;
}));
const nearest = (p) => LOCUS.reduce((best,[nm,q])=>{const d=Math.hypot(p[0]-q[0],p[1]-q[1]);return d<best.d?{nm,d}:best},{nm:0,d:Infinity});
const area = (pts) => { let a=0; for(let i=0,j=pts.length-1;i<pts.length;j=i++) a+=(pts[j][0]+pts[i][0])*(pts[j][1]-pts[i][1]); return Math.abs(a/2); };

const EPS = 0.003; // 公表原色の丸め誤差 + 補間残差
const classify = (p) => {
  const o = outness(p), n = nearest(p);
  if (o > EPS) return `虚色 (軌跡の外 ${o.toFixed(3)})`;
  if (n.d < EPS) return `単色光 ${n.nm}nm`;
  return "実在(内部)";
};

const SPACES = {
  "sRGB / Rec.709": [[0.640,0.330],[0.300,0.600],[0.150,0.060]],
  "Display P3":     [[0.680,0.320],[0.265,0.690],[0.150,0.060]],
  "Adobe RGB":      [[0.640,0.330],[0.210,0.710],[0.150,0.060]],
  "Rec.2020":       [[0.708,0.292],[0.170,0.797],[0.131,0.046]],
  "ProPhoto RGB":   [[0.734699,0.265301],[0.159597,0.840403],[0.036598,0.000105]],
  "CIE 1931 RGB":   [700,546.1,435.8].map(locus),
  "CIE XYZ":        [[1,0],[0,1],[0,0]],
};
const H = area(hull);
console.log(`馬蹄形(知覚できる色度)の面積: ${H.toFixed(4)}\n`);
for (const [name, P] of Object.entries(SPACES)) {
  console.log(`${name}  面積 ${area(P).toFixed(4)} (馬蹄形の ${(area(P)/H*100).toFixed(0)}%)`);
  ["R","G","B"].forEach((c,i)=>console.log(`    ${c} (${P[i][0].toFixed(3)}, ${P[i][1].toFixed(3)})  ${classify(P[i])}`));
}
