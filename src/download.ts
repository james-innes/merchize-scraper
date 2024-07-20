const SECONDS_DELAY = 2;
const baseUrl = "https://bo-7i0z9vt.merchize.com/bo-api";

const apiConfig = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${Bun.env.MERCHIZE_API_TOKEN!}`,
  },
};

let page = 1;
let totalPages = 1;

while (page <= totalPages) {
  try {
    const productsResponse = await fetch(
      `${baseUrl}/product/products?limit=100&page=${page}`,
      apiConfig
    );

    const products = await productsResponse.json();
    console.log(`Fetched products for page ${page}`);
    Bun.write(`data/products/${page}.json`, productsResponse);

    totalPages = products.data.pages;

    for (const product of products.data.products) {
      const artworks = await fetch(
        `${baseUrl}/artwork/artworks?product=${product._id}`,
        apiConfig
      );
      console.log(`Fetched artworks for product ${product._id}`);
      await Bun.write(`data/artworks/${product._id}.json`, artworks);
      await new Promise((resolve) => setTimeout(resolve, SECONDS_DELAY * 1000));
    }

    page++;
  } catch (error) {
    console.error(`Error fetching products: ${error}`);
    break;
  }
}
