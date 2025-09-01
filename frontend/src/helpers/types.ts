import { EventAssetsManagementModesEnum } from '@/helpers/enums'

export type EventFileType = 'image' | 'video';

export type SizeType = 'x-small' | 'small' | 'medium' | 'large' | 'x-large';

export type SubscriptionType = 'בסיסי' | 'פרימיום';

export type EventAssetsManagementModesType = EventAssetsManagementModesEnum.DOWNLOAD | EventAssetsManagementModesEnum.DELETE | EventAssetsManagementModesEnum.HIDE;