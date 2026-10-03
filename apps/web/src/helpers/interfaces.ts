import { IEventFileType } from "./types";

export interface IEventStoreState {
  files: IEventFile[];
}

export interface IEventFile {
  path: string;
  type: IEventFileType;
}

export type IEvent = any;
export type IEventAsset = any;
export type IEventModuleState = any;
export type IEventDownloadAssetsProcess = any;
export type IUpdateQrCardSettingsRequest = any;
export type UpdateEventRequest = any;
export type EventGalleryAudience = any;

export type IUserInfo = any;
export type IUserModuleState = any;
export type ILoginRequest = any;
export type ISignupRequest = any;
export type IUpdateUserRequest = any;
export type IUpdatePasswordRequest = any;
export type IForgotPasswordRequest = any;
export type IGoogleOAuthExchangeRequest = any;

export type IAppModuleState = any;
export type IDesktopBarItem = any;
export type IMobileBarItem = any;
export type IMobileScrollBarItem = any;

export type ISubscriptionPlan = any;
export type ICheckoutLinkResponse = any;
export type IOrderResponse = any;
export type IStoreOrderResult = any;

export type IWhatsAppGuest = any;
export type IWhatsAppCampaign = any;
export type IWhatsAppQuota = any;
export type IWhatsAppRecipientStatus = any;
export type IWhatsAppModuleState = any;
