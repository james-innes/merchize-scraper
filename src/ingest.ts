import productTrasnformer from "./transformer";

let page = 1;
let pageCount = 1;

const writer = Bun.file("/data/products.csv").writer();

while (page <= pageCount) {
  const productsFile = Bun.file(`data/products/${page}.json`);
  const productsContents = await productsFile.json();

  for (const product of productsContents.data.products) {
    const artworksFile = Bun.file(`data/artworks/${product._id}.json`);
    const variantsFile = Bun.file(`data/variants/${product._id}.json`);

    const artworksData = await artworksFile.json();
    const variantsData = await variantsFile.json();

    writer.write(
      `${Object.values(
        productTrasnformer({
          product,
          artworks: artworksData.data.artworks,
          variants: variantsData.data,
        })
      ).join(",")}\n`
    );
  }
  writer.flush();
}
writer.end();
