import type { Product } from "../types/Product";
import type { Artwork } from "../types/Artwork";
import type { Variant } from "../types/Variant";

interface CombinedProduct {
  product: Product;
  artworks: Artwork[];
  variants: Variant[];
}

export default function productTrasnformer(p: CombinedProduct) {
  var transformedArtworks: any = {};

  for (const side of ["front", "back", "sleeve", "hood"]) {
    transformedArtworks[`${side}_artwork_url`] =
      p.artworks.find((art) => art.side.toLowerCase() == side)?.origin_url ||
      "";
  }

  return {
    merchize_product_id: p.product._id,
    title: p.product.title,
    date_created_merchize: p.product.created,
    etsy_mockup_url: p.product.meta.image_url,
    cuahang_artwork_url_front: p.product.meta.artworks?.front || "",
    cuahang_artwork_url_back: p.product.meta.artworks?.back || "",
    merchize_mockup_url: p.product.image,
    ...transformedArtworks,
  };
}
