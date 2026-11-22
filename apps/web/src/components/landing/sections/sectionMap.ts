import type { Component } from "vue";
import SectionStory from "./SectionStory.vue";
import SectionAbout from "./SectionAbout.vue";
import SectionPeople from "./SectionPeople.vue";
import SectionCards from "./SectionCards.vue";
import SectionSteps from "./SectionSteps.vue";
import MapSection from "./MapSection.vue";
import WishingWell from "./WishingWell.vue";
import SectionRsvp from "./SectionRsvp.vue";
import SectionFaq from "./SectionFaq.vue";
import SectionQuote from "./SectionQuote.vue";
import TriviaCta from "./TriviaCta.vue";
import SectionGift from "./SectionGift.vue";
import SectionMilestones from "./SectionMilestones.vue";
import SectionPlaylist from "./SectionPlaylist.vue";
import SectionSpeakers from "./SectionSpeakers.vue";
import SectionSponsors from "./SectionSponsors.vue";
import SectionNetworking from "./SectionNetworking.vue";
import SectionHashtag from "./SectionHashtag.vue";
import SectionLineup from "./SectionLineup.vue";
import BeenThere from "./BeenThere.vue";
import SectionGrounds from "./SectionGrounds.vue";
import SectionZones from "./SectionZones.vue";
import SectionRules from "./SectionRules.vue";
import FooterSection from "./FooterSection.vue";
import SnapshareCta from "./SnapshareCta.vue";
import RichText from "./RichText.vue";
import SmartNavigation from "./SmartNavigation.vue";
import LinkList from "./LinkList.vue";
import MediaStrip from "./MediaStrip.vue";
// Gen-2 templates: variant wrappers (they render the original component for the 14 old templates).
import VariantHeroSection from "./variants/VariantHeroSection.vue";
import VariantGallerySection from "./variants/VariantGallerySection.vue";
import VariantScheduleSection from "./variants/VariantScheduleSection.vue";

export const sectionComponents: Record<string, Component> = {
  HERO_COUNTDOWN: VariantHeroSection,
  STORY: SectionStory,
  ABOUT: SectionAbout,
  PEOPLE: SectionPeople,
  EVENT_TIMELINE: VariantScheduleSection,
  CARDS: SectionCards,
  GALLERY: VariantGallerySection,
  STEPS: SectionSteps,
  MAP: MapSection,
  WISHING_WELL: WishingWell,
  RSVP: SectionRsvp,
  FAQ: SectionFaq,
  QUOTE: SectionQuote,
  TRIVIA_CTA: TriviaCta,
  GIFT: SectionGift,
  MILESTONES: SectionMilestones,
  PLAYLIST: SectionPlaylist,
  SPEAKERS: SectionSpeakers,
  SPONSORS: SectionSponsors,
  NETWORKING: SectionNetworking,
  HASHTAG: SectionHashtag,
  LINEUP: SectionLineup,
  BEEN_THERE: BeenThere,
  GROUNDS: SectionGrounds,
  ZONES: SectionZones,
  RULES: SectionRules,
  FOOTER: FooterSection,
  SNAPSHARE_CTA: SnapshareCta,
  RICH_TEXT: RichText,
  SMART_NAVIGATION: SmartNavigation,
  LINK_LIST: LinkList,
  MEDIA_STRIP: MediaStrip,
};
