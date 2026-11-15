/** M1 hub_config shapes for event landing pages. */

export type BackgroundType = "LIGHT" | "DARK";
export type Scale = "S" | "M" | "L";
export type GalleryStyle = "masonry" | "carousel" | "filmstrip" | "grid";
export type AboutLayout = "center" | "split" | "wide" | "right";
export type RichTextAlignment = "LEFT" | "CENTER" | "RIGHT";
export type LandingMode = "preview" | "public";

export type ImageRef =
  | { stock: string }
  | { asset_id: number | string }
  | { type?: string; key?: string; asset_id?: number | string; url?: string; thumb_url?: string; alt?: string };

export interface ThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

export interface HubTheme {
  palette_id: string;
  background_type?: BackgroundType;
  font_family?: string;
  scale?: Scale;
  cover?: ImageRef;
  colors?: ThemeColors;
  primary_color?: string;
  secondary_color?: string;
  accent_image_url?: string;
}

export interface HubBlock {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  data: Record<string, unknown>;
}

export interface HubConfig {
  /** Template id, or "legacy" for hubs without template_id. */
  template_id: string;
  theme: HubTheme;
  blocks: HubBlock[];
}

export interface ResolvedImage {
  url: string;
  alt: string;
  thumb_url?: string;
}

export interface EventMeta {
  upload_url?: string;
  album_url?: string;
  trivia_url?: string;
  event_name?: string;
  slug?: string;
}

export interface StockEntry {
  url: string;
  alt: string;
}

export interface TemplatePalette {
  background_type: BackgroundType;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface TemplateMeta {
  id: string;
  type: string;
  name_he: string;
  type_he?: string;
  direction?: string;
  dark: boolean;
  heroStyle: "card" | "cinema";
  slug?: string;
  gallery_style: GalleryStyle;
  default_font: string;
  palettes: Record<string, TemplatePalette>;
  allowed_sections: string[];
  default_enabled: Record<string, boolean>;
  nav: Array<{ id: string; label: string }>;
  hero_art: string;
  stock_keys: string[];
}
