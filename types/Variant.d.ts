interface Attribute {
  _id: string;
  name: string;
  value_type: string;
}

interface Option {
  is_preselected: boolean;
  position: number;
  hide_storefront: boolean;
  slug: string;
  value: string;
  name: string;
  attribute: Attribute;
}

export interface Variant {
  _id: string;
  sides: string[];
  image_uris: string[];
  retail_price: number;
  is_default: boolean;
  sku: string;
  sku_seller: string;
  title: string;
  weight: number;
  options: Option[];
  product: string;
  image: string;
}
