import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Crop image into grid tiles. Returns array of URIs in row-major order.
 * Uses Promise.all for parallel processing.
 */
export async function sliceImage(
  uri: string,
  gridSize: number,
  displaySize: number
): Promise<string[]> {
  const tileSize = Math.floor(displaySize / gridSize);
  const total = gridSize * gridSize;

  // Process all tiles in parallel for speed
  const promises = Array.from({ length: total }, (_, i) => {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    return ImageManipulator.manipulateAsync(
      uri,
      [
        {
          crop: {
            originX: col * tileSize,
            originY: row * tileSize,
            width: tileSize,
            height: tileSize,
          },
        },
      ],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
  });

  const results = await Promise.all(promises);
  return results.map((r) => r.uri);
}

/**
 * Resize image to a square before slicing
 */
export async function prepareImage(uri: string, targetSize: number): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: targetSize, height: targetSize } }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
