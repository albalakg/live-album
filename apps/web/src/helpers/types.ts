export type IEventFileType = 'image' | 'video';

export type EventGalleryType =
  | 'EventGalleryKenBurns'
  | 'EventGallerySpotlight'
  | 'EventGalleryMosaic'
  | 'EventGalleryMasonry'
  | 'EventGalleryPolaroid'
  | 'EventGalleryFilmstrip'
  | 'EventGalleryFadeShow'
  | 'EventGallerySplitPair'
  | 'EventGalleryHeroGrid'
  | 'EventGallerySingle'
  | 'EventGalleryRandom'
  | 'EventGallerySplitScreen'
  | 'EventGalleryGrid3X3';

export type EventAssetsManagementModesType =
  | 'download'
  | 'delete'
  | 'hide'
  | 'block';

export type SubscriptionType = string;