import "server-only";
import { put, del } from "@vercel/blob";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export class ImageError extends Error {}

/** Sube una imagen de producto a Vercel Blob y devuelve su URL pública. */
export async function uploadProductImage(file: File) {
  if (!ALLOWED.includes(file.type)) {
    throw new ImageError(
      "Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.",
    );
  }
  if (file.size > MAX_BYTES) {
    throw new ImageError("La imagen pesa demasiado (máximo 4 MB).");
  }

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `productos/${crypto.randomUUID()}.${ext}`;

  const blob = await put(path, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}

/** Borra una imagen de Vercel Blob a partir de su URL. No falla si ya no existe. */
export async function deleteProductImage(url: string | null | undefined) {
  if (!url) return;
  try {
    await del(url);
  } catch {
    // La imagen ya pudo haber sido borrada antes; no interrumpimos la operación.
  }
}
