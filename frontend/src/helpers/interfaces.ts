import { EventFileType, SubscriptionType } from './types';

// ***** Base Interfaces *****
// interface IBaseResponse {
//   message: string;
//   error_code?: number;
// }

export interface IEventStoreState {
  files: IEventFile[];
}

export interface IUserStoreState {
  user: IUserInfo | null;
}

export interface IUserInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  subscription_name: SubscriptionType;
}

export interface IEventInfo {
  subscription_name: SubscriptionType;
  start_date: string;
  end_date: string | null;
}

export interface IEventFile {
  path: string;
  type: EventFileType;
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

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IForgotPasswordRequest {
  email: string;
}