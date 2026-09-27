import { AssetModerationStatusEnum, StatusEnum, SubscriptionTypesEnum, WhatsAppCampaignStatusEnum } from './enums';
import { EventFileType, SubscriptionType, EventAssetsManagementModesType, EventGalleryType } from './types';

// ***** Base Interfaces *****
// interface IBaseResponse {
//   message: string;
//   error_code?: number;
// }

export type EventGalleryAudience = "owner" | "guest";

export interface IEventModuleState {
  event: IEvent;
  assetsManagement: IEventAssetsManagement;
  gallery: IEventGallery;
  galleryAudience: EventGalleryAudience;
}

export interface IEventGallery {
  assets: IEventAsset[];
  showBlockedAssets: boolean;
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
  /** Owner subscription name when provided by guest/public event APIs. */
  subscription_name?: SubscriptionTypesEnum | string | null;
}

export interface IEventConfig {
  id: number;
  preview_site_display_image: boolean;
  preview_site_display_name: boolean;
  preview_site_display_date: boolean;
  preview_guests_assets_in_gallery: boolean;
  preview_owners_assets_in_gallery: boolean;
  preview_qr_in_gallery: boolean;
  preview_link_to_album_page_from_upload_page: boolean;
  video_upload_enabled: boolean;
  event_id: number;
  displayed_gallery: EventGalleryType;
  qr_card_design?: string | null;
  qr_card_text?: string | null;
}

export interface IUpdateQrCardSettingsRequest {
  design: string;
  text: string;
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
  is_displayed: number | boolean;
  status: AssetModerationStatusEnum | string | number;
  moderation_status?: AssetModerationStatusEnum | string | number;
  moderation_labels?: string[] | null;
  moderation_source?: 'manual' | 'auto';
  is_blocked?: boolean | number;
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

export interface IGoogleOAuthExchangeRequest {
  code: string;
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

export interface IWhatsAppGuest {
  id: number;
  full_name: string;
  phone: string;
}

export interface IWhatsAppQuota {
  remaining_sends: number;
  max_sends: number;
}

export interface IWhatsAppCampaign {
  id: number;
  message: string;
  status: WhatsAppCampaignStatusEnum;
  scheduled_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

export interface IWhatsAppRecipientStatus {
  guest_id: number;
  full_name: string;
  phone: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string | null;
}

export interface IWhatsAppModuleState {
  guests: IWhatsAppGuest[];
  quota: IWhatsAppQuota | null;
  campaigns: IWhatsAppCampaign[];
  campaignDetail: {
    campaign: IWhatsAppCampaign;
    recipients: IWhatsAppRecipientStatus[];
  } | null;
  loading: boolean;
}
