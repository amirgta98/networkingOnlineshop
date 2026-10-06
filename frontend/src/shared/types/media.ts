export type MediaType = "image" | "video";

export interface MediaItem {
  id?: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  caption?: string;
  duration?: string;
}
