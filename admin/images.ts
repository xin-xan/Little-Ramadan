/** Uploaded pictures are resized on the device (max 800 px) and saved as WebP to keep the app small. */
export const MAX_IMAGE_BYTES = 400 * 1024;

export function safeImageName(original: string, ext = "webp") {
  const base = original.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "picture";
  const stamp = Date.now().toString(36).slice(-5);
  return `${base}-${stamp}.${ext}`;
}

export async function prepareImage(file: File): Promise<{ name: string; base64: string; dataUrl: string }> {
  if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) throw new Error("Please choose a PNG, JPG or WebP picture.");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("That picture could not be opened."));
      i.src = url;
    });
    const scale = Math.min(1, 800 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    let quality = 0.85;
    let dataUrl = canvas.toDataURL("image/webp", quality);
    // Browsers without WebP encoding fall back to PNG; keep that.
    const ext = dataUrl.startsWith("data:image/webp") ? "webp" : "png";
    while (ext === "webp" && dataUrl.length * 0.75 > MAX_IMAGE_BYTES && quality > 0.4) {
      quality -= 0.15;
      dataUrl = canvas.toDataURL("image/webp", quality);
    }
    if (dataUrl.length * 0.75 > MAX_IMAGE_BYTES) throw new Error("That picture is too large even after shrinking. Try a simpler picture.");
    return { name: safeImageName(file.name, ext), base64: dataUrl.split(",")[1], dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}
