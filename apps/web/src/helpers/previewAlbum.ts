import { AssetModerationStatusEnum, StatusEnum, SubscriptionTypesEnum } from "@/helpers/enums";

const files = [
  "photo-night.jpg",
  "photo-lounge.jpg",
  "photo-hat.jpg",
  "album-01.jpg",
  "album-02.jpg",
  "album-10.jpg",
  "album-12.jpg",
  "album-22.jpg",
  "album-23.jpg",
];

function asset(id: number, file: string, status: AssetModerationStatusEnum) {
  return {
    id,
    type: "image",
    path: file,
    fullPath: `/assets/marketing/${file}`,
    status,
    moderation_status: status,
    is_blocked: status === AssetModerationStatusEnum.BLOCKED ? 1 : 0,
    is_displayed: 1,
    moderation_labels: status === AssetModerationStatusEnum.BLOCKED ? ["בדיקה לדוגמה"] : null,
    moderation_source: status === AssetModerationStatusEnum.BLOCKED ? "manual" : undefined,
  };
}

export function buildSampleAlbum() {
  const assets = files.map((file, index) => {
    const id = index + 1;
    if (id === 8) return asset(id, file, AssetModerationStatusEnum.PENDING);
    if (id === 9) return asset(id, file, AssetModerationStatusEnum.BLOCKED);
    return asset(id, file, AssetModerationStatusEnum.ACTIVE);
  });

  return {
    event: {
      id: 0,
      path: "preview",
      name: "החתונה של עמית וגל",
      status: StatusEnum.ACTIVE,
      subscription_name: SubscriptionTypesEnum.CLASSIC,
      config: {
        displayed_gallery: "EventGallerySingle",
        qr_card_design: "qr-card-flowers.webp",
        qr_card_text: "סרקו, צלמו ותעלו בואו נחגוג ביחד",
      },
      assets,
    },
    gallery: assets.filter(
      (item) => item.moderation_status === AssetModerationStatusEnum.ACTIVE
    ),
  };
}
