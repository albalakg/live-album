import { IEventFileType } from './types';

// ***** Base Interfaces *****
// interface IBaseResponse {
//   message: string;
//   error_code?: number;
// }

export interface IEventStoreState {
  files: IEventFile[];
}

export interface IEventFile {
  path: string;
  type: IEventFileType;
}

// export interface IMediatorService {
//   authenticate(client_id: number): Promise<boolean>;
//   getScore(): Promise<boolean>;
//   getConfiguration(): Promise<boolean>;
//   logout(): boolean;
// }