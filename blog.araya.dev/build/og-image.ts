import Canvas, {
  CanvasRenderingContext2D,
  dataURLtoFile,
} from "https://deno.land/x/canvas@v.1.0.5/mod.ts";
import { writeFile } from "./io.ts";

const canvas = Canvas.MakeCanvas(200, 200);
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

ctx.fillStyle = "red";
ctx.fillRect(10, 10, 200 - 20, 200 - 20);

await writeFile("./canvas.png", canvas.toBuffer());
