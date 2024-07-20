const DELAY_SECONDS = 1;

const apiConfig = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${Bun.env.MERCHIZE_API_TOKEN!}`,
  },
};

const baseUrl = "https://bo-7i0z9vt.merchize.com/bo-api";

let page = 1;
let pageCount = 1;
let productCount = 0;

while (page <= pageCount) {
  const productsResponse = await fetch(
    `${baseUrl}/product/products?limit=100&page=${page}`,
    apiConfig
  );

  const products = await productsResponse.json();
  pageCount = products.data.pages;
  await Bun.write(`data/products/${page}.json`, productsResponse);

  for (const product of products.data.products) {
    const artworksResponse = await fetch(
      `${baseUrl}/artwork/artworks?product=${product._id}`,
      apiConfig
    );

    const variantsResponse = await fetch(
      `${baseUrl}/bo-api/product/products/${product._id}/all-variants`
    );

    await Bun.write(`data/artworks/${product._id}.json`, artworksResponse);
    await Bun.write(`data/variants/${product._id}.json`, variantsResponse);

    await new Promise((resolve) => setTimeout(resolve, 1 * 1000));

    productCount++;
    let progress = ((productCount / products.data.total) * 100).toFixed(1);
    let totalMinutes = (products.data.total * DELAY_SECONDS) / 60;
    let remainingMinutes = (
      totalMinutes -
      (DELAY_SECONDS * productCount) / 60
    ).toFixed(0);

    console.log(
      `${productCount} of ${products.data.total} | ${progress}% | ${remainingMinutes} min remaining | Page: ${page}`
    );
  }
}
