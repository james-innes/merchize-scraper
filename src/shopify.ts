import { createAdminRestApiClient } from "@shopify/admin-api-client";

const client = createAdminRestApiClient({
  storeDomain: "ferndownstores.myshopify.com",
  apiVersion: "2024-07",
  accessToken: "your-admin-api-access-token",
});

const response = await client.get('products/1234567890');

if (response.ok) {
  const body = await response.json();
}
