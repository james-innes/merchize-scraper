export interface AttributeValue {
  key: string;
  value: string;
  name: string;
  slug: string;
}

export interface Attribute {
  _id: string;
  values: AttributeValue[];
  is_preselected: boolean;
  name: string;
  position: number;
  value_type: string;
}

export interface ProductType {
  _id: string;
  type: string;
  vendor: string;
}

export interface Artworks {
  front: string;
  back: string;
}

export interface Meta {
  image_url: string;
  artworks: Artworks;
}

export interface Product {
  _id: string;
  tags: any[];
  collections: any[];
  attributes: Attribute[];
  is_deleted: boolean;
  is_active: boolean;
  is_private: boolean;
  is_taken_down: boolean;
  approval_status: string;
  designs: any[];
  title: string;
  type: ProductType;
  meta: Meta;
  created: string;
  slug: string;
  retail_price: number;
  url: string;
  image: string;
  status: string;
  under_review_revision: object;
  integration_information: any[];
}

export interface ProductData {
  products: Product[];
  total: number;
  limit: number;
  page: number;
  pages: number;
}

export interface ProductResponse {
  success: boolean;
  data: ProductData;
}
