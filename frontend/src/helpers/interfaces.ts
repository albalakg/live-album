import { StatusEnum, SubscriptionTypesEnum } from './enums';
import { EventFileType, SubscriptionType, EventAssetsManagementModesType, EventGalleryType } from './types';

// ***** Base Interfaces *****
// interface IBaseResponse {
//   message: string;
//   error_code?: number;
// }

export interface IEventModuleState {
  event: IEvent;
  assetsManagement: IEventAssetsManagement;
  gallery: IEventGallery;
}

export interface IEventGallery {
  assets: IEventAsset[];
}

export interface IEventAssetsManagement {
  mode: EventAssetsManagementModesType | null;
  assetsIds: number[];
}

export interface IUserModuleState {
  user: IUserInfo | null;
  isLoggedIn: boolean;
}

export interface IAppModuleState {
  menuState: boolean;
  homeScrollSection: string;
}

export interface IUserInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  order: IOrder;
}

export interface IOrder {
  order_number: number;
  status: number;
  price: string | null;
  created_at: string | null;
  subscription: ISubscription;
}

export interface ISubscription {
  events_allowed: number;
  files_allowed: number;
  id: number;
  name: SubscriptionTypesEnum;
  price: string;
  status: number;
  storage_time: number;
}

export interface IEvent {
  id: number;
  status: number;
  name: string | null;
  path: string;
  image: string | null;
  fullPath: string | null;
  starts_at: string | null;
  finished_at: string | null;
  assets: IEventAsset[];
  active_download_process: IEventDownloadAssetsProcess;
  config: IEventConfig;
  user_id?: number;
}

export interface IEventConfig {
  id: number;
  preview_site_display_image: boolean;
  preview_site_display_name: boolean;
  preview_site_display_date: boolean;
  preview_guests_assets_in_gallery: boolean;
  preview_owners_assets_in_gallery: boolean;
  preview_qr_in_gallery: boolean;
  event_id: number;
  displayed_gallery: EventGalleryType;
}

export interface IEventDownloadAssetsProcess {
  id: number;
  event_id: number;
  status: StatusEnum;
  path: string;
  fullPath: string;
}

export interface IEventAsset {
  id: number;
  event_id: number;
  is_displayed: number;
  type: EventFileType;
  path: string;
  fullPath: string;
}

export interface IDesktopBarItem {
  text: string;
  url: string;
  color: string;
  weight: string;
}

export interface IMobileBarItem {
  url: string;
  icon: string;
  color: string;
}

export interface IMobileScrollBarItem {
  path: string;
  text: string;
  isActive: boolean;
}

// export interface IMediatorService {
//   authenticate(client_id: number): Promise<boolean>;
//   getScore(): Promise<boolean>;
//   getConfiguration(): Promise<boolean>;
//   logout(): boolean;
// }


// ****************
// ***** APIS *****
// ****************

export interface ISignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface IUpdateUserRequest {
  first_name: string;
  last_name: string;
}

export interface UpdateEventRequest {
  name: string;
  starts_at: string;
  image: File | null;
}

export interface IUpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

/** Public subscription plan from GET subscriptions (slug derived on FE if BE omits it). */
export interface ISubscriptionPlan {
  id: number;
  slug: string;
  name: string;
  price: number;
  status?: number;
  events_allowed?: number;
  files_allowed?: number;
  /** Retention in hours (BE contract). */
  storage_time?: number;
  payment_page_link?: string | null;
}

/** Raw checkout-link payload from POST subscriptions/:id/checkout-link (normalized in store). */
export interface ICheckoutLinkResponse {
  paymentUrl: string;
  expiresAt?: string;
  providerRequestUid?: string;
  provider?: string;
}

/** Iframe src; kept as payment_page_link for minimal template churn in OrderView. */
export interface IOrderResponse {
  payment_page_link: string;
}

/** Result of `store/order`: either a checkout iframe URL or a user-facing error string. */
export type IStoreOrderResult = IOrderResponse | { error: string };
