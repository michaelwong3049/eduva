export async function getImageDimensions(image: string): Promise<{ width: number; height: number }> {
  const res = await fetch(image);
  const blob = await res.blob();
  const imageBitmap = await createImageBitmap(blob);
  const size = { width: imageBitmap.width, height: imageBitmap.height };
  imageBitmap.close?.();
  return size;
}
