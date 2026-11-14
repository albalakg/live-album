import type { Component } from "vue";
import HeroCountdown from "./HeroCountdown.vue";
import Story from "./Story.vue";
import About from "./About.vue";
import People from "./People.vue";
import EventTimeline from "./EventTimeline.vue";
import Cards from "./Cards.vue";
import Gallery from "./Gallery.vue";
import Steps from "./Steps.vue";
import MapSection from "./MapSection.vue";
import WishingWell from "./WishingWell.vue";
import Rsvp from "./Rsvp.vue";
import Faq from "./Faq.vue";
import Quote from "./Quote.vue";
import TriviaCta from "./TriviaCta.vue";
import Gift from "./Gift.vue";
import Milestones from "./Milestones.vue";
import Playlist from "./Playlist.vue";
import Speakers from "./Speakers.vue";
import Sponsors from "./Sponsors.vue";
import Networking from "./Networking.vue";
import Hashtag from "./Hashtag.vue";
import Lineup from "./Lineup.vue";
import BeenThere from "./BeenThere.vue";
import Grounds from "./Grounds.vue";
import Zones from "./Zones.vue";
import Rules from "./Rules.vue";
import FooterSection from "./FooterSection.vue";
import SnapshareCta from "./SnapshareCta.vue";
import RichText from "./RichText.vue";
import SmartNavigation from "./SmartNavigation.vue";
import LinkList from "./LinkList.vue";
import MediaStrip from "./MediaStrip.vue";

export const sectionComponents: Record<string, Component> = {
  HERO_COUNTDOWN: HeroCountdown,
  STORY: Story,
  ABOUT: About,
  PEOPLE: People,
  EVENT_TIMELINE: EventTimeline,
  CARDS: Cards,
  GALLERY: Gallery,
  STEPS: Steps,
  MAP: MapSection,
  WISHING_WELL: WishingWell,
  RSVP: Rsvp,
  FAQ: Faq,
  QUOTE: Quote,
  TRIVIA_CTA: TriviaCta,
  GIFT: Gift,
  MILESTONES: Milestones,
  PLAYLIST: Playlist,
  SPEAKERS: Speakers,
  SPONSORS: Sponsors,
  NETWORKING: Networking,
  HASHTAG: Hashtag,
  LINEUP: Lineup,
  BEEN_THERE: BeenThere,
  GROUNDS: Grounds,
  ZONES: Zones,
  RULES: Rules,
  FOOTER: FooterSection,
  SNAPSHARE_CTA: SnapshareCta,
  RICH_TEXT: RichText,
  SMART_NAVIGATION: SmartNavigation,
  LINK_LIST: LinkList,
  MEDIA_STRIP: MediaStrip,
};
