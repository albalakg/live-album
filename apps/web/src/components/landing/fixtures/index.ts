import type { HubConfig } from "../types";

import wedding_1 from "./wedding-1";
import wedding_2 from "./wedding-2";
import barmitzvah_1 from "./barmitzvah-1";
import barmitzvah_2 from "./barmitzvah-2";
import birthday_1 from "./birthday-1";
import birthday_2 from "./birthday-2";
import brit_1 from "./brit-1";
import brit_2 from "./brit-2";
import corporate_1 from "./corporate-1";
import corporate_2 from "./corporate-2";
import party_1 from "./party-1";
import party_2 from "./party-2";
import festival_1 from "./festival-1";
import festival_2 from "./festival-2";

export const landingFixtures: Record<string, HubConfig> = {
  "wedding-1": wedding_1,
  "wedding-2": wedding_2,
  "barmitzvah-1": barmitzvah_1,
  "barmitzvah-2": barmitzvah_2,
  "birthday-1": birthday_1,
  "birthday-2": birthday_2,
  "brit-1": brit_1,
  "brit-2": brit_2,
  "corporate-1": corporate_1,
  "corporate-2": corporate_2,
  "party-1": party_1,
  "party-2": party_2,
  "festival-1": festival_1,
  "festival-2": festival_2,
};

export const landingFixtureIds = Object.keys(landingFixtures);
