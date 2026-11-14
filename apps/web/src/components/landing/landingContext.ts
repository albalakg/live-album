import type { InjectionKey, Ref } from "vue";
import type { EventMeta, LandingMode, ResolvedImage } from "./types";

export interface LandingContext {
  mode: LandingMode;
  preview: boolean;
  templateId: string;
  resolvedImages?: Record<string, ResolvedImage>;
  eventMeta?: EventMeta;
  toast: (msg: string) => void;
  openUpload: () => void;
  openAlbum: () => void;
  openTrivia: (title?: string) => void;
  shot: boolean;
}

export const LANDING_CTX: InjectionKey<LandingContext> = Symbol("landingCtx");
export const LANDING_TOAST: InjectionKey<Ref<string>> = Symbol("landingToast");
