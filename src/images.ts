const downloadImage = async (url: string, filepath: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
    const imageArrayBuffer = await response.arrayBuffer();
    await Bun.write(filepath, new Uint8Array(imageArrayBuffer));
  } catch (error) {
    console.error(`Failed to download image from ${url}: ${error}`);
  }
};
