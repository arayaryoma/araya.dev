/**
 * Shrink photos before they are committed.
 *
 * A phone camera hands over 3-5MB JPEGs that are several times wider than the
 * blog's 42rem measure. Committing those would bloat every future clone of the
 * repository for no visible gain, so they are downscaled and re-encoded in the
 * browser first. Vector and animated formats pass through untouched.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.82;
const PASSTHROUGH = new Set(["image/svg+xml", "image/gif"]);

export async function prepareImage(file: File): Promise<File> {
  if (PASSTHROUGH.has(file.type)) return file;
  if (!file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // An exotic format the browser cannot decode (HEIC on some devices):
    // let the server decide whether to accept it.
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const alreadySmall = scale === 1 && file.size <= 600 * 1024;
  if (alreadySmall) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (context === null) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // PNG screenshots keep their alpha channel; photographs become WebP.
  const type = file.type === "image/png" ? "image/png" : "image/webp";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, QUALITY),
  );
  if (blob === null || blob.size >= file.size) return file;

  const extension = type === "image/png" ? "png" : "webp";
  const name = file.name.replace(/\.[^.]*$/, "") || "image";
  return new File([blob], `${name}.${extension}`, { type });
}
