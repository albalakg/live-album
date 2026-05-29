// export enum ScoreColorEnum {
//   GREEN = "green",
//   RED = "red",
// }

export enum SubscriptionTypesEnum {
  DEMO = 'נסיון',
  CLASSIC = 'קלאסי',
  PREMIUM = 'פרימיום',
}

export enum StatusEnum {
  PENDING = 2,
  READY = 4,
  ACTIVE = 1,
  IN_PROGRESS = 3,
  INACTIVE = 0,
}

export enum EventAssetsManagementModesEnum {
  DOWNLOAD = 'download',
  DELETE = 'delete',
  HIDE = 'hide',
  BLOCK = 'block',
}

export enum AssetModerationStatusEnum {
  ACTIVE = 1,
  PENDING = 2,
  BLOCKED = 6,
}

export enum WhatsAppCampaignStatusEnum {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum WhatsAppSendModeEnum {
  IMMEDIATE = 'immediate',
  SCHEDULED = 'scheduled',
}

const MODERATION_STRING_TO_ENUM: Record<string, AssetModerationStatusEnum> = {
  active: AssetModerationStatusEnum.ACTIVE,
  pending: AssetModerationStatusEnum.PENDING,
  blocked: AssetModerationStatusEnum.BLOCKED,
};

export function normalizeModerationStatus(
  status?: AssetModerationStatusEnum | string | number
): AssetModerationStatusEnum {
  if (status == null) {
    return AssetModerationStatusEnum.ACTIVE;
  }
  if (typeof status === "string") {
    return (
      MODERATION_STRING_TO_ENUM[status.toLowerCase()] ??
      AssetModerationStatusEnum.ACTIVE
    );
  }
  return status as AssetModerationStatusEnum;
}

export function getAssetModerationStatus(asset: {
  status?: AssetModerationStatusEnum | string | number;
  moderation_status?: AssetModerationStatusEnum | string | number;
  is_blocked?: boolean | number;
}): AssetModerationStatusEnum {
  if (asset.is_blocked === true || asset.is_blocked === 1) {
    return AssetModerationStatusEnum.BLOCKED;
  }

  return normalizeModerationStatus(asset.status ?? asset.moderation_status);
}