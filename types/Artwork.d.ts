export interface Artwork {
  thumbnail: string;
  origin_url: string;
  side: string;
  _id: string;
  directory: string;
  height: number;
  width: number;
  is_uploaded: boolean;
  is_deleted: boolean;
  name: string;
  product: string;
  created: string;
  is_queued_to_sync: boolean;
  ref_fulfillment: string;
}

export interface ArtworkData {
  artworks: Artwork[];
  total: number;
}

export interface ArtworkResponse {
  success: boolean;
  data: ArtworkData;
}
