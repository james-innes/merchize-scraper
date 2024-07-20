import type { ProductResponse, Product } from "../types/Product";
import type { ArtworkResponse, Artwork } from "../types/Artwork";

const PRODUCTS_PAGES = 10;
var products: Product[] = [];

for (let page = 0; page < PRODUCTS_PAGES; page++) {
  const productsFile = await Bun.file(`data/products/${page}.json`).json();

  for (const product of productsFile.data.products) {
    const artworksFile = await Bun.file(
      `data/artworks/${product._id}.json`
    ).json();
    
    const artworks = artworksFile.data.artworks;

    for (const artwork of artworks) {
      if (artwork.image) {
        const imageFile = await Bun.file(`data/images/${artwork._id}.png`);
        if (!imageFile.exists()) {
          await Bun.download(artwork.image, `data/images/${artwork._id}.png`);
        }
      }
    }
  }

  // const file = Bun.file(`data/artworks/${product._id}.json`);
}
