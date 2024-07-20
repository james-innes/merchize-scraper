import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { ProductResponse, Product } from "../types/Product";
import type { ArtworkResponse } from "../types/Artwork";

const fetchConfig = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${Bun.env.MERCHIZE_API_TOKEN!}`,
  },
};

const ensureDirectoryExists = async (dirPath: string) => {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
};

const logError = async (message: string) => {
  const logDir = "log";
  await ensureDirectoryExists(logDir);

  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  console.error(logMessage);
  await appendFile(path.join(logDir, "errors.log"), logMessage);
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
    await writeFile(filepath, new Uint8Array(imageArrayBuffer));
  } catch (error) {
    await logError(`Failed to download image from ${url}: ${error.message}`);
  }
};

const processProduct = async (
  product: Product,
  page: number,
  totalPages: number
) => {
  const artworkResponse = await fetchArtworks(product._id);

  if (artworkResponse.success) {
    const productRow: any = {
      merchize_product_id: product._id,
      title: product.title,
      base_product: "",
      color: "",
      size: "",
    };

    for (const attribute of product.attributes) {
      if (attribute.name.toLowerCase() === "product") {
        productRow.base_product = attribute.values[0]?.value || "";
      } else if (attribute.name.toLowerCase() === "color") {
        productRow.color = attribute.values[0]?.value || "";
      } else if (attribute.name.toLowerCase() === "size") {
        productRow.size = attribute.values[0]?.value || "";
      }
    }

    const productDir = `out/products/${product._id}`;
    await ensureDirectoryExists(productDir);

    if (product.meta?.image_url) {
      await downloadImage(
        product.meta.image_url,
        `${productDir}/etsy_mockup.jpg`
      );
    } else {
      await logError(`No image_url found for product ${product._id}`);
    }

    if (product.image) {
      await downloadImage(product.image, `${productDir}/merchize_mockup.jpg`);
    } else {
      await logError(`No image found for product ${product._id}`);
    }

    const sides = ["front", "back", "sleeve", "hood"];

    for (const artwork of artworkResponse.data.artworks) {
      const side = artwork.side.toLowerCase();

      if (sides.includes(side)) {
        await downloadImage(
          artwork.origin_url,
          `${productDir}/${side}_artwork.jpg`
        );
      }
    }

    const outputDir = "out";
    await ensureDirectoryExists(outputDir);

    const csvPath = path.join(outputDir, "products.csv");
    if (!existsSync(csvPath)) {
      await writeFile(
        csvPath,
        `"merchize_product_id","title","base_product","color","size"\n`
      );
    }

    await appendFile(
      csvPath,
      `${Object.values(productRow)
        .map((value) => `"${value}"`)
        .join(",")}\n`
    );

    console.log(
      `Saved product ${product._id} from page ${page} of ${totalPages}`
    );

    console.log(productRow);
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
