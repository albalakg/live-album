import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/landing/sections"
);

const map = {
  About: "LandingAbout",
  Cards: "LandingCards",
  Faq: "LandingFaq",
  Gallery: "LandingGallery",
  Gift: "LandingGift",
  Grounds: "LandingGrounds",
  Hashtag: "LandingHashtag",
  Lineup: "LandingLineup",
  Milestones: "LandingMilestones",
  Networking: "LandingNetworking",
  People: "LandingPeople",
  Playlist: "LandingPlaylist",
  Quote: "LandingQuote",
  Rsvp: "LandingRsvp",
  Rules: "LandingRules",
  Speakers: "LandingSpeakers",
  Sponsors: "LandingSponsors",
  Steps: "LandingSteps",
  Story: "LandingStory",
  Zones: "LandingZones",
};

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".vue")) continue;
  const p = path.join(dir, file);
  let s = fs.readFileSync(p, "utf8");
  for (const [from, to] of Object.entries(map)) {
    s = s.replace(new RegExp(`name:\\s*"${from}"`, "g"), `name: "${to}"`);
    s = s.replace(new RegExp(`name:\\s*'${from}'`, "g"), `name: '${to}'`);
  }
  fs.writeFileSync(p, s);
}
console.log("renamed component names");
