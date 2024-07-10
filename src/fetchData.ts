import { appendFile, mkdir } from "node:fs/promises";

import type { ProductResponse } from "../types/Product";
import type { ArtworkResponse } from "../types/Artwork";

const fetchConfig = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${Bun.env.MERCHIZE_API_TOKEN!}`,
  },
};

const logError = async (message: string) => {
  console.error(message);
  await appendFile("log/errors.log", message);
};

const delay = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const baseUrl = "https://bo-7i0z9vt.merchize.com/bo-api";

const fetchProducts = async (page: number): Promise<ProductResponse> => {
  const response = await fetch(
    `${baseUrl}/product/products?limit=100&page=${page}`,
    fetchConfig
  );
  return response.json();
};

const fetchArtworks = async (productId: string): Promise<ArtworkResponse> => {
  const response = await fetch(
    `${baseUrl}/artwork/artworks?product=${productId}`,
    fetchConfig
  );
  return response.json();
};

const downloadImage = async (url: string, filepath: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
    const imageArrayBuffer = await response.arrayBuffer();
    await Bun.write(filepath, new Uint8Array(imageArrayBuffer));
  } catch (error) {
    await logError(`Failed to download image from ${url}: ${error.message}`);
  }
};

const processProduct = async (
  product: any,
  page: number,
  totalPages: number
) => {
  const artworkResponse = await fetchArtworks(product._id);

  if (artworkResponse.success) {
    const cleanedData: any = {
      merchize_product_id: product._id,
      title: product.title,
      etsy_image_url: product.meta?.image_url || "",
      thumb_image_url: product.image,
    };

    const sides = ["front", "back", "sleeve", "hood"];

    for (const artwork of artworkResponse.data.artworks) {
      const side = artwork.side.toLowerCase();

      if (sides.includes(side)) {
        cleanedData[`${side}_thumbnail_image_url`] = artwork.thumbnail;
        cleanedData[`${side}_full_image_url`] = artwork.origin_url;
        cleanedData[`${side}_file_name`] = artwork.name;

        const productDir = `artwork/${product._id}`;
        await mkdir(productDir, { recursive: true });

        await downloadImage(
          artwork.thumbnail,
          `${productDir}/${side}_thumbnail.jpg`
        );
        await downloadImage(
          artwork.origin_url,
          `${productDir}/${side}_full.jpg`
        );
      }
    }
    await appendFile(
      "out/data.csv",
      `${Object.values(cleanedData).join(",")}\n`
    );

    console.log(
      `Saved product ${product._id} from page ${page} of ${totalPages}`
    );
  } else {
    await logError(`Failed to fetch artworks for product ${product._id}`);
  }
};

const fetchAllProducts = async () => {
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    try {
      const productResponse = await fetchProducts(page);
      if (!productResponse.success) {
        await logError(`Failed to fetch products for page ${page}`);
        break;
      }

      totalPages = productResponse.data.pages;
      const products = productResponse.data.products.filter(
        (product) => !product.is_deleted
      );

      for (const product of products) {
        await processProduct(product, page, totalPages);
        await delay(parseInt(Bun.env.REQUEST_DELAY_SECONDS!, 10));
      }

      page++;
    } catch (error) {
      await logError(`Error fetching products: ${error.message}`);
      break;
    }
  }
};

fetchAllProducts();
