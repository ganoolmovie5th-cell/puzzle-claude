import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Crop image into grid tiles. Returns array of URIs in row-major order.
 * The last URI (bottom-right) will be the "empty" tile.
 */
export async function sliceImage(
  uri: string,
  gridSize: number,
  displaySize: number
): Promise<string[]> {
  const tileSize = Math.floor(displaySize / gridSize);
  const total = gridSize * gridSize;
  const uris: string[] = [];

  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;

    const result = await ImageManipulator.manipulateAsync(
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
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    uris.push(result.uri);
  }

  return uris;
}

/**
 * Resize image to a square before slicing (crop center)
 */
export async function prepareImage(uri: string, targetSize: number): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: targetSize, height: targetSize } }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
