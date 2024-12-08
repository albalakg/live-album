import { EventFileType, SubscriptionType } from './types';

// ***** Base Interfaces *****
// interface IBaseResponse {
//   message: string;
//   error_code?: number;
// }

export interface IEventStoreState {
  event: IEvent;
}

export interface IUserStoreState {
  user: IUserInfo | null;
  isLoggedIn: boolean;
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
  name: SubscriptionType;
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
  description: string | null;
  starts_at: string | null;
  finished_at: string | null;
  assets: IEventAsset[];
}

export interface IEventAsset {
  id: number;
  event_id: number;
  asset_type: EventFileType;
  path: string;
}

export interface IDesktopBarItem {
  text: string;
  url: string;
  color: string;
  weight: string;
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