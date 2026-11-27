<template>
  <teleport to="body">
    <div v-if="isOpen" class="ss-root" dir="rtl">
      <div id="ss-pal" class="pal-wrap">
        <div class="pal-scrim" @click="close"></div>
        <div class="pal" role="dialog" aria-modal="true" aria-label="חיפוש חכם">
          <div class="pal-input">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" /><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
            <div class="pal-field">
              <div class="ghost" aria-hidden="true">
                <span class="gt">{{ q }}</span><template v-if="ghost"><span class="gs">{{ ghost.suffix }}</span><kbd>Tab</kbd></template>
              </div>
              <input
                id="ss-q"
                ref="input"
                :value="q"
                type="text"
                dir="rtl"
                autocomplete="off"
                spellcheck="false"
                role="combobox"
                aria-expanded="true"
                aria-controls="ss-list"
                :aria-activedescendant="items.length ? 'ss-opt-' + sel : undefined"
                placeholder="חפשו, שאלו (״מי עוד לא אישר מצד הכלה״) או כתבו שולחן:5"
                @input="onInput"
                @keydown="onKey"
              />
            </div>
            <button v-if="q" class="pal-clear" type="button" aria-label="נקה" @click="setQ('')">✕</button>
            <button class="pal-close" type="button" aria-label="סגור" @click="close">סגור</button>
            <kbd class="pal-esc">Esc</kbd>
          </div>

          <div v-if="showInterp" class="pal-interp">
            <span class="badge" :class="isNl ? 'b-ok' : 'b-dark'">{{ isNl ? "הובן אוטומטית" : "סינטקס" }}</span>
            <template v-for="(a, ai) in result.P.alts" :key="'alt' + ai">
              <span v-if="ai" class="or">או</span>
              <span v-for="(f, fi) in a.filters" :key="ai + '.' + fi" class="chip" :class="{ neg: f.neg }">
                <button class="chip-t" type="button" title="לחצו כדי להפוך ל״לא״" @click="toggleNeg(ai, fi)">
                  {{ f.neg ? "לא " : "" }}{{ human(f).key }}: <b>{{ human(f).val }}</b>
                </button>
                <button type="button" aria-label="הסר מסנן" @click="removeFilter(ai, fi)">✕</button>
              </span>
              <span v-if="a.text" class="chip chip-txt">טקסט: <b>{{ a.text }}</b></span>
            </template>
            <span v-for="u in result.unknown" :key="'u' + u" class="chip chip-un">ערך לא מוכר: <b dir="auto">{{ u }}</b></span>
            <span class="interp-tools">
              <button v-if="isNl" type="button" @click="toSyntax">⌨ המירו לסינטקס</button>
              <button type="button" :class="{ on: isPinned }" @click="togglePin">{{ isPinned ? "📌 נעוץ" : "📌 נעצו חיפוש" }}</button>
            </span>
          </div>

          <div v-if="sugg && sugg.items.length" class="pal-sugg">
            <span class="lbl">{{ sugg.title }}</span>
            <button v-for="s in sugg.items" :key="s.ins" type="button" @click="insert(s.ins)">
              {{ s.label }}<small v-if="s.n !== null">{{ s.n }}</small>
            </button>
            <span class="hintk">Tab להשלמה</span>
          </div>

          <div v-if="result.kb && q.trim()" class="pal-banner kb">
            <span>⌨ זיהינו הקלדה במקלדת {{ result.kb.dir === "he" ? "אנגלית" : "עברית" }}: <b dir="auto">{{ result.kb.from }}</b> ← <b dir="auto">{{ result.kb.to }}</b></span>
            <button class="btn btn-paper btn-sm" type="button" @click="noFix = true">חפשו ״{{ result.kb.from }}״ כפי שהוקלד</button>
          </div>

          <div class="pal-body">
            <div id="ss-list" ref="list" class="pal-list" role="listbox" aria-label="תוצאות">
              <!-- loading -->
              <div v-if="loading && !loaded" class="home-h"><span>טוען את נתוני האירוע…</span></div>

              <!-- home -->
              <template v-else-if="isHome">
                <div class="home-h"><span>מונים חיים</span></div>
                <div class="counters">
                  <button v-for="c in counters" :key="c.q" type="button" class="cn" :class="'cn-' + c.tone" @click="setQ(c.q)">
                    <b>{{ c.n }}</b><span>{{ c.label }}</span>
                  </button>
                </div>
                <div class="home-h"><span>חיפושים נעוצים</span><span class="hintk">Alt + מספר</span></div>
                <div class="pins">
                  <button v-for="(p, i) in pins" :key="p.q" type="button" class="pin" @click="setQ(p.q)">
                    <span class="pin-n">{{ i + 1 }}</span>
                    <span class="pin-t">{{ p.name }}<small dir="auto">{{ p.q }}</small></span>
                    <b>{{ countOf(p.q) }}</b>
                  </button>
                </div>
                <div class="home-h"><span>נסו לשאול</span></div>
                <div class="sugg">
                  <button v-for="s in suggestions" :key="s.q" type="button" @click="setQ(s.q)"><span>{{ s.ic }}</span><span dir="auto">{{ s.q }}</span></button>
                </div>
                <template v-if="recents.length">
                  <div class="home-h"><span>חיפושים אחרונים</span><button class="g-more" type="button" @click="clearRecents">נקה הכול</button></div>
                  <div v-for="(r, i) in recents" :key="r" class="res" @click="setQ(r)">
                    <span class="res-ico">↺</span>
                    <div class="res-main"><div class="res-title">{{ r }}</div></div>
                    <button class="rm-x" type="button" aria-label="הסר" @click.stop="removeRecent(i)">✕</button>
                  </div>
                </template>
              </template>

              <!-- empty -->
              <template v-else-if="result.empty">
                <div class="empty">
                  <div class="big">🔍</div>
                  <h3>לא מצאנו תוצאות ל-״{{ q.trim() }}״</h3>
                  <p>הנה כמה דרכים להתקדם:</p>
                </div>
                <template v-if="result.relax.length">
                  <div class="g-head"><span>הרפו את הסינון</span></div>
                  <button v-for="x in result.relax" :key="x.q" class="rescue" type="button" @click="setQ(x.q)">
                    <span>הסירו <b dir="auto">{{ x.drop }}</b></span><span class="badge b-ok">{{ x.n }} תוצאות</span>
                  </button>
                </template>
                <template v-if="result.dym.length">
                  <div class="g-head"><span>האם התכוונתם ל…</span></div>
                  <button v-for="n in result.dym" :key="n" class="rescue" type="button" @click="setQ(n)">
                    <span>{{ n }}</span><span class="badge b-hint">שם קרוב</span>
                  </button>
                </template>
                <button v-if="tableNotFound && hasTables" class="rescue" type="button" @click="runCommand('add-table')">
                  <span>באירוע יש {{ data.tables.length }} שולחנות. ליצור שולחן חדש?</span><span class="badge b-gold">פעולה</span>
                </button>
                <div class="g-head"><span>נסו במקום</span></div>
                <div class="acts">
                  <button v-for="s in tryInstead" :key="s" class="btn btn-paper btn-sm" type="button" @click="setQ(s)">{{ s }}</button>
                </div>
              </template>

              <!-- results -->
              <template v-else>
                <div v-if="guestGroup && result.ent === 'guests' && result.facets.length" class="facets">
                  <span class="lbl">הוסיפו מסנן:</span>
                  <button v-for="f in result.facets" :key="f.token" type="button" @click="insert((q.trim() + ' ' + f.token).trim())">
                    + <span dir="auto">{{ f.token }}</span><small>{{ f.n }}</small>
                  </button>
                </div>
                <div v-if="guestGroup && result.guestAll.length" class="bulk">
                  <span>{{ chk.length ? `נבחרו ${targetGuests.length} מתוך ${result.guestAll.length}` : `כל ${targetGuests.length} התוצאות` }}</span>
                  <div class="bulk-btns">
                    <button v-if="messaging" class="btn btn-gold btn-sm" type="button" @click="bulk('msg')">שלחו הודעה</button>
                    <button v-if="canSeat" class="btn btn-ghost-d btn-sm" type="button" @click="bulk('seat')">שבצו לשולחן ▾</button>
                    <button class="btn btn-sm" :class="messaging ? 'btn-ghost-d' : 'btn-gold'" type="button" @click="bulk('confirm')">סמנו כאישרו</button>
                    <button class="btn btn-ghost-d btn-sm opt" type="button" @click="bulk('phones')">העתיקו טלפונים</button>
                    <button class="btn btn-ghost-d btn-sm" type="button" @click="bulk('export')">ייצוא CSV</button>
                    <button v-if="chk.length" class="btn btn-ghost-d btn-sm" type="button" @click="chk = []">נקו בחירה</button>
                  </div>
                  <div v-if="bulkMenu" class="menu menu-d">
                    <button v-for="t in tableOptions" :key="t.key" type="button" @click="bulk('table', t.key)">{{ t.label }} · {{ t.free }} פנוי</button>
                  </div>
                </div>
                <div v-if="guestGroup && result.guestAll.length > 1 && result.ent === 'guests'" class="gb">
                  <span class="lbl">קבצו לפי:</span>
                  <button v-for="(label, k) in groupByOptions" :key="k" type="button" :class="{ on: gb === k }" @click="setGroupBy(k)">{{ label }}</button>
                </div>
                <SearchHallMap v-if="result.mapHl && result.ent === 'tables' && hasTables" :tables="data.tables" :fixtures="data.fixtures" :highlight="result.mapHl" mode="tables" @select="onMapSelect" />
                <template v-else-if="result.mapHl && guestGroup && hasTables">
                  <button class="map-toggle" type="button" @click="mapOpen = !mapOpen">🗺 {{ mapOpen ? "הסתירו" : "הציגו" }} מפת אולם</button>
                  <SearchHallMap v-if="mapOpen" variant="inl-g" :tables="data.tables" :fixtures="data.fixtures" :highlight="result.mapHl" mode="guests" @select="onMapSelect" />
                </template>
                <SearchHallMap v-else-if="result.mapHl && hasTables" :tables="data.tables" :fixtures="data.fixtures" :highlight="result.mapHl" mode="other" @select="onMapSelect" />

                <template v-for="blk in blocksList" :key="blk.key">
                  <div v-if="blk.kind === 'head'" class="g-head">
                    <span>{{ blk.title }}</span>
                    <span>
                      <button v-if="blk.more" class="g-more" type="button" @click="showMore(blk.type)">הצג את כל {{ blk.total }}</button>
                      <span v-else class="count">{{ blk.total }}</span>
                    </span>
                  </div>
                  <div v-else-if="blk.kind === 'sub'" class="sub-head">
                    <button class="cb" :class="{ on: blk.allOn }" type="button" aria-label="סמנו קבוצה" @click="toggleGroup(blk.ids)">{{ blk.allOn ? "✓" : "" }}</button>
                    <span>{{ blk.title }}</span><span class="count">{{ blk.ids.length }}</span>
                  </div>
                  <template v-else-if="blk.kind === 'photos'">
                    <SearchPhotoHistogram :photos="result.photoCtx || data.photos" :range="timeRange" :total="blk.total" @change="onSlider" />
                    <div class="ph-grid">
                      <button
                        v-for="(it, j) in blk.photos"
                        :id="'ss-opt-' + (blk.start + j)"
                        :key="it.ph.id"
                        class="ph"
                        :class="{ sel: blk.start + j === sel, 'has-img': !!it.ph.thumb && !brokenThumbs[it.ph.id] }"
                        type="button"
                        role="option"
                        :aria-selected="blk.start + j === sel"
                        :aria-label="it.ph.kind + ' ' + it.ph.time"
                        @click="select(blk.start + j)"
                      >
                        <img v-if="it.ph.thumb && !brokenThumbs[it.ph.id]" class="ph-img" :src="it.ph.thumb" alt="" loading="lazy" @error="brokenThumbs[it.ph.id] = true" />
                        <span v-else class="glyph">{{ it.ph.kind === "סרטון" ? "▶" : "🖼" }}</span>
                        <span class="st badge" :class="photoStatus(it.ph)[1]">{{ photoStatus(it.ph)[0] }}</span>
                        <span class="ph-cap"><b>{{ it.ph.time }}</b><small>מעלה #{{ it.ph.uploaderN }}{{ it.ph.fav ? " · ★" : "" }}{{ it.ph.day === -1 ? " · אתמול" : it.ph.day < -1 ? " · " + it.ph.dateLabel : "" }}</small></span>
                      </button>
                    </div>
                  </template>
                  <template v-else-if="blk.kind === 'row'">
                    <div :id="'ss-opt-' + blk.i" class="res" :class="{ sel: blk.i === sel }" role="option" :aria-selected="blk.i === sel" @click="select(blk.i)">
                      <template v-if="blk.it.type === 'guest'">
                        <button class="cb" :class="{ on: isChecked(blk.it.g.id) }" type="button" aria-label="סמנו" @click.stop="toggleCheck(blk.it.g.id)">{{ isChecked(blk.it.g.id) ? "✓" : "" }}</button>
                        <span class="av" :class="avClass(blk.it.g)">{{ initials(blk.it.g.name) }}</span>
                        <div class="res-main">
                          <div class="res-title"><template v-for="(seg, si) in highlight(blk.it)" :key="si"><mark v-if="seg.mark" :class="{ fz: seg.mark === 'fz' }">{{ seg.text }}</mark><template v-else>{{ seg.text }}</template></template></div>
                          <div class="res-sub">
                            {{ guestSub(blk.it.g) }}<template v-if="isPhoneHit(blk.it)"> · <mark dir="ltr">{{ fmtPhone(blk.it.g.phone) }}</mark></template>
                          </div>
                        </div>
                        <div class="res-end">
                          <span v-if="howOf(blk.it)" class="badge b-hint opt">{{ howOf(blk.it) }}</span>
                          <span v-if="hasTables" class="badge opt b-muted">{{ blk.it.g.table || "ללא שולחן" }}</span>
                          <span class="badge" :class="statusOf(blk.it.g)[1]">{{ statusOf(blk.it.g)[0] }}</span>
                        </div>
                      </template>
                      <template v-else-if="blk.it.type === 'table'">
                        <span class="res-ico">🪑</span>
                        <div class="res-main">
                          <div class="res-title">{{ blk.it.t.label }}</div>
                          <div class="res-sub">{{ engine.taken(blk.it.t) }}/{{ blk.it.t.seats }} מקומות</div>
                        </div>
                        <div class="res-end"><span class="badge" :class="tableBadge(blk.it.t)[1]">{{ tableBadge(blk.it.t)[0] }}</span></div>
                      </template>
                      <template v-else-if="blk.it.type === 'message'">
                        <span class="res-ico">💬</span>
                        <div class="res-main">
                          <div class="res-title">{{ blk.it.msg.title }}</div>
                          <div class="res-sub">{{ blk.it.msg.kind }}<template v-if="blk.it.msg.when"> · {{ blk.it.msg.when }}</template> · {{ blk.it.msg.audience }} נמענים</div>
                        </div>
                        <div class="res-end"><span class="badge" :class="messageStatus(blk.it.msg)[1]">{{ messageStatus(blk.it.msg)[0] }}</span></div>
                      </template>
                      <template v-else-if="blk.it.type === 'reply'">
                        <span class="av av-b">{{ initials(blk.it.r.who) }}</span>
                        <div class="res-main">
                          <div class="res-title">{{ blk.it.r.who }}</div>
                          <div class="res-sub">״{{ blk.it.r.text }}״<template v-if="blk.it.r.when"> · {{ blk.it.r.when }}</template></div>
                        </div>
                        <div class="res-end"><span class="badge b-muted opt">תגובה</span></div>
                      </template>
                      <template v-else>
                        <span class="res-ico">{{ blk.it.type === "command" ? "⚡" : blk.it.type === "page" ? "↪" : "❔" }}</span>
                        <div class="res-main">
                          <div class="res-title">{{ otherTitle(blk.it) }}</div>
                          <div class="res-sub">{{ otherSub(blk.it) }}</div>
                        </div>
                        <div v-if="blk.it.type !== 'help'" class="res-end"><span class="badge b-muted">Enter</span></div>
                      </template>
                    </div>
                    <div v-if="blk.i === sel" class="inline-actions">
                      <SearchItemActions :item="blk.it" :can-seat="canSeat" :menu-open="menu === 'table'" :table-options="tableOptions" @act="doAct" />
                    </div>
                  </template>
                </template>
              </template>
            </div>

            <aside class="pal-preview" aria-live="polite">
              <div v-if="isHome || (loading && !loaded)" class="pv">
                <h3>קיצורים</h3>
                <dl class="kdl">
                  <dt><kbd>&gt;</kbd></dt><dd>פעולות ומעבר בין מסכים</dd>
                  <dt><kbd>@</kbd></dt><dd>אורחים בלבד</dd>
                  <dt><kbd>#</kbd></dt><dd>שולחנות בלבד</dd>
                  <dt><kbd>:</kbd></dt><dd>מסנן, למשל שולחן:5</dd>
                  <dt><kbd>-</kbd></dt><dd>שלילה: -סטטוס:אישר</dd>
                  <dt><kbd>או</kbd></dt><dd>צד:כלה או צד:חתן</dd>
                </dl>
                <p class="pv-note" style="font-size: 13px; color: #161310">פסיק בין ערכים הוא ״או״: מנה:צמחוני,טבעוני. לחיצה על מסנן הופכת אותו ל״לא״.</p>
              </div>
              <SearchItemPreview
                v-else-if="current && !result.empty"
                :item="current"
                :guests="data.guests"
                :tables="data.tables"
                :fixtures="data.fixtures"
                :map-hl="result.mapHl"
                :can-seat="canSeat"
                :menu-open="menu === 'table'"
                :table-options="tableOptions"
                @act="doAct"
                @map-select="onMapSelect"
              />
            </aside>
          </div>

          <div class="pal-foot">
            <span><kbd>Tab</kbd> השלמה</span>
            <span><kbd>↑</kbd><kbd>↓</kbd> ניווט</span>
            <span><kbd>Enter</kbd> פעולה</span>
            <span class="pf-opt"><kbd>Ctrl</kbd><kbd>Enter</kbd> סימון</span>
            <span class="pf-opt"><kbd>Alt</kbd><kbd>1</kbd> נעוץ</span>
            <span class="pf-priv">🔒 החיפוש רץ בדפדפן · נתוני האורחים לא יוצאים</span>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, markRaw, PropType } from "vue";
import SearchHallMap from "./SearchHallMap.vue";
import SearchPhotoHistogram from "./SearchPhotoHistogram.vue";
import SearchItemActions from "./SearchItemActions.vue";
import SearchItemPreview from "./SearchItemPreview.vue";
import { COMMON_PHRASES, Completion, SearchEngine, SearchItem, SearchResult, SuggestionRow } from "@/helpers/search/engine";
import { emptySearchData, SearchData, SearchGuest, SearchMessage, SearchPhoto, SearchTable } from "@/helpers/search/types";
import { filterHuman, Filter, TimeRange } from "@/helpers/search/query";
import { HighlightSegment, highlightName, howLabel } from "@/helpers/search/matcher";
import { formatPhone, initialsOf, norm, phoneDigits } from "@/helpers/search/text";
import { GROUP_BY, MESSAGE_STATUS, PHOTO_STATUS, SIDE_LABEL, STATUS_LABEL } from "@/helpers/search/labels";
import { addRecent, countNoResult, defaultPins, loadPins, loadRecents, savePins, saveRecents, SearchPin } from "@/helpers/search/storage";
import { loadSearchData } from "@/helpers/search/dataLoader";
import { COMMAND_TARGETS } from "@/helpers/search/registry";
import { setComposeHandoff } from "@/helpers/search/handoff";
import { guestsApi, seatingApi } from "@/helpers/seating/api";
import { messagingApi } from "@/helpers/messaging/api";
import type { SeatingStateResponse } from "@/helpers/seating/types";
import { notify } from "@/helpers/notify";

type Block =
  | { kind: "head"; key: string; title: string; total: number; more: boolean; type: string }
  | { kind: "sub"; key: string; title: string; ids: number[]; allOn: boolean }
  | { kind: "photos"; key: string; start: number; total: number; photos: { type: "photo"; ph: SearchPhoto }[] }
  | { kind: "row"; key: string; it: SearchItem; i: number };

const SUGGESTIONS = [
  { q: "מי עוד לא אישר מצד הכלה בלי שולחן", ic: "👥" },
  { q: "שולחנות עם מקומות פנויים", ic: "🪑" },
  { q: "תמונות היום אחרי 22:00", ic: "🖼" },
  { q: "סטטוס:לא-ענה -צד:חתן מנה:צמחוני,טבעוני", ic: "⌨" },
];

export default defineComponent({
  name: "SearchCommandPalette",
  components: { SearchHallMap, SearchPhotoHistogram, SearchItemActions, SearchItemPreview },
  props: {
    eventId: { type: Number, required: true },
    nav: { type: Array as PropType<{ text: string; path: string }[]>, required: true },
    seating: { type: Boolean, default: false },
    messaging: { type: Boolean, default: false },
  },
  data() {
    return {
      isOpen: false,
      q: "",
      sel: 0,
      menu: null as null | "table",
      bulkMenu: false,
      chk: [] as number[],
      gb: "none",
      noFix: false,
      mapOpen: false,
      showAll: {} as Record<string, boolean>,
      pins: [] as SearchPin[],
      recents: [] as string[],
      loading: false,
      loaded: false,
      loadedAt: 0,
      rev: 0,
      engine: markRaw(new SearchEngine(emptySearchData())) as SearchEngine,
      seatingState: null as SeatingStateResponse | null,
      seatingWritable: false,
      brokenThumbs: {} as Record<number, boolean>,
      noResultTimer: 0 as number,
      busy: false,
      suggestions: SUGGESTIONS,
      groupByOptions: GROUP_BY,
    };
  },
  computed: {
    data(): SearchData {
      void this.rev;
      return this.engine.data;
    },
    hasTables(): boolean {
      return this.data.tables.length > 0;
    },
    canSeat(): boolean {
      return this.seatingWritable && this.hasTables;
    },
    result(): SearchResult {
      void this.rev;
      return this.engine.search(this.q, { noFix: this.noFix });
    },
    isHome(): boolean {
      return !this.q.trim() && !/^[>@#]/.test(this.q);
    },
    showInterp(): boolean {
      if (!this.q.trim()) return false;
      const n = this.result.P.alts.reduce((a, x) => a + x.filters.length, 0);
      return n > 0 || this.result.unknown.length > 0;
    },
    isNl(): boolean {
      return this.result.P.alts.some((a) => a.filters.some((f) => f.src === "nl"));
    },
    isPinned(): boolean {
      return this.pins.some((p) => norm(p.q) === norm(this.q));
    },
    ghost(): Completion | null {
      void this.rev;
      return this.engine.completion(this.q, this.phrases);
    },
    sugg(): SuggestionRow | null {
      void this.rev;
      return this.engine.suggestionRow(this.q);
    },
    phrases(): string[] {
      return this.recents.concat(SUGGESTIONS.map((s) => s.q), this.pins.map((p) => p.q), COMMON_PHRASES);
    },
    counters(): { n: number; label: string; q: string; tone: string }[] {
      void this.rev;
      return this.engine.counters();
    },
    guestGroup(): boolean {
      return this.result.groups.some((g) => g.type === "guests");
    },
    layout(): { blocks: Block[]; items: SearchItem[] } {
      const blocks: Block[] = [];
      const items: SearchItem[] = [];
      if (this.isHome || this.result.empty) return { blocks, items };
      for (const g of this.result.groups) {
        const lim = g.type === "photos" ? 12 : g.type === "guests" ? (this.gb !== "none" || this.showAll.guests ? 60 : 6) : 99;
        let shown = g.items.slice(0, lim);
        const more = g.total > shown.length;
        blocks.push({ kind: "head", key: "h-" + g.type + g.title, title: g.title, total: g.total, more, type: g.type });
        if (g.type === "photos") {
          blocks.push({ kind: "photos", key: "ph", start: items.length, total: g.total, photos: shown as { type: "photo"; ph: SearchPhoto }[] });
          items.push(...shown);
        } else if (g.type === "guests" && this.gb !== "none") {
          const groups = this.groupGuests(shown);
          shown = [];
          groups.forEach(([name, arr]) => {
            const ids = arr.map((x) => (x as { g: SearchGuest }).g.id);
            blocks.push({ kind: "sub", key: "s-" + name, title: name, ids, allOn: ids.every((id) => this.chk.includes(id)) });
            arr.forEach((it) => {
              blocks.push({ kind: "row", key: "r-" + items.length + "-" + this.keyOf(it), it, i: items.length });
              items.push(it);
            });
          });
        } else {
          shown.forEach((it) => {
            blocks.push({ kind: "row", key: "r-" + items.length + "-" + this.keyOf(it), it, i: items.length });
            items.push(it);
          });
        }
      }
      return { blocks, items };
    },
    blocksList(): Block[] {
      return this.layout.blocks;
    },
    items(): SearchItem[] {
      return this.layout.items;
    },
    current(): SearchItem | null {
      return this.items[this.sel] || null;
    },
    targetGuests(): SearchGuest[] {
      const all = this.result.guestAll.map((x) => x.g);
      return this.chk.length ? all.filter((g) => this.chk.includes(g.id)) : all;
    },
    tableOptions(): { key: string; label: string; free: number }[] {
      void this.rev;
      return this.data.tables.map((t) => ({ key: t.key, label: t.label, free: this.engine.free(t) }));
    },
    timeRange(): TimeRange | null {
      const f = this.result.P.alts[0] && this.result.P.alts[0].filters.find((x) => x.k === "time" && !x.neg);
      return f ? (f.v[0] as TimeRange) : null;
    },
    tableNotFound(): boolean {
      return /^שולחנ?\s*\d+/.test(norm(this.q.trim())) || /^#\d+$/.test(this.q.trim());
    },
    tryInstead(): string[] {
      return (this.hasTables ? ["אורחים בלי שולחן"] : ["מי עוד לא אישר"]).concat(["תמונות היום אחרי 22:00", "סטטוס:לא-ענה"]);
    },
  },
  watch: {
    eventId() {
      this.loaded = false;
      this.readStorage();
    },
    q() {
      window.clearTimeout(this.noResultTimer);
      if (this.q.trim()) {
        this.noResultTimer = window.setTimeout(() => {
          if (this.isOpen && this.q.trim() && this.result.empty) countNoResult();
        }, 1500);
      }
    },
  },
  mounted() {
    this.readStorage();
    document.addEventListener("keydown", this.onGlobalKey);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.onGlobalKey);
    window.clearTimeout(this.noResultTimer);
  },
  methods: {
    fmtPhone: formatPhone,
    /* ───────── open / load ───────── */
    readStorage() {
      this.recents = loadRecents(this.eventId);
      this.pins = loadPins(this.eventId, defaultPins({ seating: this.seating }));
    },
    open(q = "") {
      this.isOpen = true;
      this.q = q;
      this.sel = 0;
      this.noFix = false;
      this.chk = [];
      this.menu = null;
      this.bulkMenu = false;
      this.showAll = {};
      if (!this.loaded || Date.now() - this.loadedAt > 30000) this.load();
      this.$nextTick(() => (this.$refs.input as HTMLInputElement | undefined)?.focus());
    },
    close() {
      this.isOpen = false;
      this.menu = null;
      this.bulkMenu = false;
    },
    toggle() {
      if (this.isOpen) this.close();
      else this.open("");
    },
    async load() {
      if (!this.eventId || this.loading) return;
      this.loading = true;
      try {
        const have = this.$store.getters["event/getAssets"] || [];
        if (!have.length) await this.$store.dispatch("event/getEventAssets").catch(() => null);
        const res = await loadSearchData({
          eventId: this.eventId,
          assets: this.$store.getters["event/getAssets"] || [],
          nav: this.nav,
          seating: this.seating,
          messaging: this.messaging,
        });
        this.engine = markRaw(new SearchEngine(res.data));
        this.seatingState = res.seatingState;
        this.seatingWritable = res.seatingWritable;
        this.loaded = true;
        this.loadedAt = Date.now();
        this.rev++;
      } catch {
        notify({ type: "error", text: "לא הצלחנו לטעון את נתוני החיפוש" });
      } finally {
        this.loading = false;
      }
    },
    bump() {
      this.engine.refresh();
      this.rev++;
    },

    /* ───────── query editing ───────── */
    onInput(e: Event) {
      this.q = (e.target as HTMLInputElement).value;
      this.sel = 0;
      this.noFix = false;
      this.chk = [];
      this.bulkMenu = false;
      this.menu = null;
    },
    setQ(v: string) {
      this.q = v;
      this.sel = 0;
      this.noFix = false;
      this.chk = [];
      this.bulkMenu = false;
      this.menu = null;
      this.$nextTick(() => (this.$refs.input as HTMLInputElement | undefined)?.focus());
    },
    insert(v: string) {
      this.setQ(v + (v.endsWith(":") ? "" : " "));
    },
    human(f: Filter): { key: string; val: string } {
      return filterHuman(this.engine.schema, f);
    },
    toggleNeg(ai: number, fi: number) {
      const P = this.engine.parse(this.stripScope(this.q));
      P.alts[ai].filters[fi].neg = !P.alts[ai].filters[fi].neg;
      this.setQ(this.engine.serialize(P));
    },
    removeFilter(ai: number, fi: number) {
      const P = this.engine.parse(this.stripScope(this.q));
      P.alts[ai].filters.splice(fi, 1);
      this.setQ(this.engine.serialize(P));
    },
    toSyntax() {
      this.setQ(this.engine.serialize(this.engine.parse(this.q)));
      notify({ type: "success", text: "הומר לסינטקס. אפשר לערוך ידנית ולנעוץ" });
    },
    stripScope(q: string): string {
      return q.replace(/^\s*[>@#]\s*/, "");
    },
    togglePin() {
      const k = this.pins.findIndex((p) => norm(p.q) === norm(this.q));
      if (k >= 0) {
        this.pins.splice(k, 1);
        notify({ text: "הנעיצה בוטלה" });
      } else {
        if (this.pins.length >= 9) this.pins.pop();
        const t = this.q.trim();
        this.pins.push({ name: t.length > 24 ? t.slice(0, 24) + "…" : t, q: t });
        notify({ type: "success", text: "החיפוש נעוץ. הספירה בו חיה, Alt+" + this.pins.length });
      }
      savePins(this.eventId, this.pins);
    },
    countOf(q: string): number {
      void this.rev;
      return this.engine.countOf(q);
    },
    clearRecents() {
      this.recents = [];
      saveRecents(this.eventId, []);
      notify({ text: "החיפושים האחרונים נמחקו מהמכשיר" });
    },
    removeRecent(i: number) {
      this.recents.splice(i, 1);
      saveRecents(this.eventId, this.recents);
    },
    rememberQuery() {
      if (this.q.trim()) this.recents = addRecent(this.eventId, this.recents, this.q);
    },
    setGroupBy(k: string) {
      this.gb = k;
      this.sel = 0;
    },
    showMore(type: string) {
      if (type === "guests") this.showAll = { ...this.showAll, guests: true };
      else if (type === "photos") this.go("/event/assets");
      else if (type === "messages") this.go("/event/messages/queue");
      else notify({ text: "כל התוצאות מוצגות" });
    },
    onSlider(a: number, b: number, lo: number, hi: number) {
      this.q = this.engine.withTimeRange(this.q, a, b, lo, hi);
      this.sel = Math.min(this.sel, Math.max(0, this.items.length - 1));
    },
    onMapSelect(key: string) {
      const t = this.data.tables.find((x) => x.key === key);
      if (!t) return;
      const n = t.label.match(/\d+/);
      this.setQ(n ? "#" + n[0] : "#" + t.label);
    },

    /* ───────── list helpers ───────── */
    keyOf(it: SearchItem): string {
      switch (it.type) {
        case "guest": return "g" + it.g.id;
        case "table": return "t" + it.t.key;
        case "photo": return "p" + it.ph.id;
        case "message": return "m" + it.msg.id;
        case "reply": return "r" + it.r.guestId;
        case "command": return "c" + it.c.id;
        case "page": return "pg" + it.p.id;
        default: return "h" + it.h.id;
      }
    },
    groupKey(g: SearchGuest): string {
      if (this.gb === "side") return g.side ? SIDE_LABEL[g.side] : "ללא צד";
      if (this.gb === "status") return STATUS_LABEL[g.status][0];
      if (this.gb === "table") return g.table || "ללא שולחן";
      return g.group || "ללא קבוצה";
    },
    groupGuests(items: SearchItem[]): [string, SearchItem[]][] {
      const m: Record<string, SearchItem[]> = {};
      const order: string[] = [];
      items.forEach((it) => {
        if (it.type !== "guest") return;
        const k = this.groupKey(it.g);
        if (!m[k]) {
          m[k] = [];
          order.push(k);
        }
        m[k].push(it);
      });
      return order.map((k) => [k, m[k]] as [string, SearchItem[]]).sort((a, b) => b[1].length - a[1].length);
    },
    select(i: number) {
      this.sel = i;
      this.menu = null;
    },
    isChecked(id: number): boolean {
      return this.chk.includes(id);
    },
    toggleCheck(id: number) {
      this.chk = this.isChecked(id) ? this.chk.filter((x) => x !== id) : this.chk.concat(id);
    },
    toggleGroup(ids: number[]) {
      const all = ids.every((id) => this.chk.includes(id));
      this.chk = all ? this.chk.filter((id) => !ids.includes(id)) : Array.from(new Set(this.chk.concat(ids)));
    },
    initials(n: string): string {
      return initialsOf(n);
    },
    avClass(g: SearchGuest): string {
      return g.side === "bride" ? "av-b" : g.side === "groom" ? "av-g" : "";
    },
    statusOf(g: SearchGuest): [string, string] {
      return STATUS_LABEL[g.status];
    },
    photoStatus(p: SearchPhoto): [string, string] {
      return PHOTO_STATUS[p.status];
    },
    messageStatus(m: SearchMessage): [string, string] {
      return MESSAGE_STATUS[m.status];
    },
    tableBadge(t: SearchTable): [string, string] {
      const tk = this.engine.taken(t);
      const fr = t.seats - tk;
      return fr <= 0 ? ["מלא", "b-rose"] : tk === 0 ? ["ריק", "b-muted"] : [fr + " פנויים", "b-ok"];
    },
    guestSub(g: SearchGuest): string {
      return [g.side ? SIDE_LABEL[g.side] : "", g.group, g.party + " מוזמנים"].filter(Boolean).join(" · ");
    },
    highlight(it: SearchItem): HighlightSegment[] {
      if (it.type !== "guest") return [];
      const m = it.m && (it.m.parts || it.m.initials) ? it.m : null;
      return highlightName(it.g.name, m);
    },
    isPhoneHit(it: SearchItem): boolean {
      return it.type === "guest" && !!it.m && it.m.how.includes("phone");
    },
    howOf(it: SearchItem): string {
      return it.type === "guest" && it.m ? howLabel(it.m.how) : "";
    },
    otherTitle(it: SearchItem): string {
      if (it.type === "command") return it.c.label;
      if (it.type === "page") return "עבור אל " + it.p.label;
      if (it.type === "help") return it.h.label;
      return "";
    },
    otherSub(it: SearchItem): string {
      if (it.type === "command") return "פעולה · " + it.c.hint;
      if (it.type === "page") return "מעבר מהיר";
      return "מרכז עזרה";
    },

    /* ───────── keyboard ───────── */
    onGlobalKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.toggle();
        return;
      }
      if (!this.isOpen) {
        const el = document.activeElement as HTMLElement | null;
        const typing = !!el && (/input|textarea|select/i.test(el.tagName) || el.isContentEditable);
        if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          this.open("");
        }
      }
    },
    onKey(e: KeyboardEvent) {
      if (e.altKey && /^[1-9]$/.test(e.key)) {
        const p = this.pins[Number(e.key) - 1];
        if (p) {
          e.preventDefault();
          this.setQ(p.q);
        }
        return;
      }
      if (e.key === "Tab" && this.ghost) {
        e.preventDefault();
        this.setQ(this.q + this.ghost.suffix);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (this.q) this.setQ("");
        else this.close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.sel = Math.min(this.items.length - 1, this.sel + 1);
        this.menu = null;
        this.scrollSel();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.sel = Math.max(0, this.sel - 1);
        this.menu = null;
        this.scrollSel();
      } else if (e.key === "Enter") {
        const it = this.current;
        if (!it) return;
        e.preventDefault();
        if ((e.ctrlKey || e.metaKey) && it.type === "guest") {
          this.toggleCheck(it.g.id);
          return;
        }
        const a =
          it.type === "guest" ? (it.g.status !== "confirmed" ? "confirm" : "open")
            : it.type === "photo" ? (it.ph.status === "approved" ? "ph-open" : "ph-approve")
              : it.type === "table" ? "open-table"
                : it.type === "message" ? (it.msg.status === "sent" ? "open" : "resched")
                  : it.type === "reply" ? "open" : "run-cmd";
        this.doAct(a);
      }
    },
    scrollSel() {
      this.$nextTick(() => {
        const el = document.getElementById("ss-opt-" + this.sel);
        if (el) el.scrollIntoView({ block: "nearest" });
      });
    },

    /* ───────── actions ───────── */
    go(path: string, query?: Record<string, string>) {
      this.rememberQuery();
      this.close();
      this.$router.push({ path, query }).catch(() => undefined);
    },
    runCommand(id: string) {
      const t = COMMAND_TARGETS[id];
      if (!t) return;
      if (t.run === "export-guests") {
        this.exportServerCsv();
        return;
      }
      if (t.path) this.go(t.path, t.query);
    },
    async exportServerCsv() {
      try {
        const blob = await guestsApi.exportCsv(this.eventId);
        this.download(blob, "guests.csv");
        this.rememberQuery();
      } catch {
        notify({ type: "error", text: "הייצוא נכשל" });
      }
    },
    download(blob: Blob, name: string) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    },
    async copy(text: string, okText: string) {
      try {
        await navigator.clipboard.writeText(text);
        notify({ type: "success", text: okText });
      } catch {
        notify({ type: "error", text: "לא הצלחנו להעתיק" });
      }
    },
    async doAct(a: string, extra?: string) {
      const it = this.current;
      if (!it || this.busy) return;
      if (it.type === "guest") {
        const g = it.g;
        if (a === "confirm") await this.confirmGuests([g]);
        else if (a === "table") {
          if (this.canSeat) this.menu = this.menu === "table" ? null : "table";
          else this.go("/event/seating", { guest: String(g.id) });
          return;
        } else if (a === "set-table" && extra) await this.seatGuests([g], extra);
        else if (a === "msg") this.compose([g.id]);
        else if (a === "copy" && g.phone) await this.copy(g.phone, "הטלפון הועתק ללוח");
        else if (a === "wa" && g.phone) {
          const d = phoneDigits(g.phone);
          window.open("https://wa.me/" + (d.startsWith("0") ? "972" + d.slice(1) : d), "_blank", "noopener");
        } else if (a === "open") this.go("/event/guests", { guest: String(g.id) });
      } else if (it.type === "photo") {
        await this.photoAct(a, it.ph);
      } else if (it.type === "table") {
        this.go("/event/seating", { table: it.t.key });
      } else if (it.type === "message") {
        if (a === "pause") await this.pauseMessage(it.msg);
        else this.go("/event/messages/queue", { send: String(it.msg.id) });
      } else if (it.type === "reply") {
        this.go("/event/messages/inbox", { guest: String(it.r.guestId) });
      } else if (it.type === "command") this.runCommand(it.c.id);
      else if (it.type === "page") this.go(it.p.path);
      else if (it.type === "help") this.go(it.h.path);
      this.rememberQuery();
    },
    compose(ids: number[]) {
      if (!this.messaging) return;
      setComposeHandoff(this.eventId, ids);
      this.go("/event/messages/compose", { from: "search" });
    },
    async confirmGuests(gs: SearchGuest[]) {
      if (!gs.length) return;
      this.busy = true;
      try {
        if (gs.length === 1) await guestsApi.update(this.eventId, gs[0].id, { status: 1 });
        else await guestsApi.bulkUpdate(this.eventId, gs.map((g) => g.id), { status: 1 });
        gs.forEach((g) => (g.status = "confirmed"));
        this.bump();
        notify({ type: "success", text: gs.length === 1 ? `✓ ${gs[0].name} סומן/ה כמאשר/ת הגעה` : `${gs.length} אורחים סומנו כמאשרי הגעה` });
      } catch {
        notify({ type: "error", text: "העדכון נכשל" });
      } finally {
        this.busy = false;
      }
    },
    async seatGuests(gs: SearchGuest[], tableKey: string) {
      const st = this.seatingState;
      const table = this.data.tables.find((t) => t.key === tableKey);
      if (!st || !table || !gs.length) return;
      const ids = gs.map((g) => g.id);
      const need = gs.filter((g) => g.tableId !== table.id).reduce((acc, g) => acc + g.party, 0);
      const free = this.engine.free(table);
      const keyOf: Record<number, string> = {};
      st.tables.forEach((t) => (keyOf[t.id] = t.key));
      const assignments = st.assignments
        .filter((x) => !ids.includes(x.guest_id) && keyOf[x.table_id])
        .map((x) => ({ guest_id: x.guest_id, table_key: keyOf[x.table_id], seat: x.seat }));
      ids.forEach((id) => assignments.push({ guest_id: id, table_key: tableKey, seat: null }));
      this.busy = true;
      try {
        const res = await seatingApi.save(this.eventId, { revision: st.revision, tables: st.tables, fixtures: st.fixtures, assignments });
        st.revision = res.revision;
        st.tables = res.tables;
        st.assignments = res.assignments;
        const t2 = res.tables.find((t) => t.key === tableKey) || res.tables.find((t) => t.id === table.id);
        gs.forEach((g) => {
          g.tableId = t2 ? t2.id : table.id;
          g.table = table.label;
        });
        this.menu = null;
        this.bulkMenu = false;
        this.bump();
        const n = gs.length;
        const who = n === 1 ? `${gs[0].name} שובץ/ה` : `${n} אורחים שובצו`;
        notify({ type: need > free ? undefined : "success", text: need > free ? `${who} ל${table.label}. שימו לב: חריגה של ${need - free} מקומות` : `${who} ל${table.label}` });
      } catch (err) {
        const status = (err as { response?: { status?: number } }).response?.status;
        notify({ type: "error", text: status === 409 ? "ההושבה עודכנה במסך אחר. טוענים מחדש, נסו שוב" : "השיבוץ נכשל" });
        if (status === 409) this.load();
      } finally {
        this.busy = false;
      }
    },
    async photoAct(a: string, ph: SearchPhoto) {
      if (a === "ph-open") {
        this.go("/event/assets");
        return;
      }
      if (a === "ph-dl") {
        await this.$store.dispatch("event/downloadAsset", { assetId: ph.id, fileName: `snapshare-${ph.id}` });
        return;
      }
      this.busy = true;
      try {
        if (a === "ph-approve") {
          const ok = await this.$store.dispatch("event/approveAssets", [ph.id]);
          if (ok) ph.status = "approved";
        } else if (a === "ph-hide") {
          const ok = await this.$store.dispatch("event/blockAssets", [ph.id]);
          if (ok) ph.status = "hidden";
        } else if (a === "ph-fav") {
          const ok = await this.$store.dispatch("event/favoriteAssets", { assets: [ph.id], is_favorite: !ph.fav });
          if (ok) ph.fav = !ph.fav;
        }
        this.bump();
      } finally {
        this.busy = false;
      }
    },
    async pauseMessage(m: SearchMessage) {
      this.busy = true;
      try {
        const res = await messagingApi.patch(this.eventId, m.id, { expected_version: m.version, action: "pause" });
        m.rawStatus = res.status;
        m.version = res.version;
        this.bump();
        notify({ type: "success", text: "ההודעה הושהתה" });
      } catch {
        notify({ type: "error", text: "לא הצלחנו להשהות. פתחו את תור השליחה" });
      } finally {
        this.busy = false;
      }
    },
    async bulk(kind: string, extra?: string) {
      const tg = this.targetGuests;
      if (kind === "seat") {
        this.bulkMenu = !this.bulkMenu;
        return;
      }
      if (kind === "table" && extra) await this.seatGuests(tg, extra);
      else if (kind === "msg") this.compose(tg.map((g) => g.id));
      else if (kind === "confirm") await this.confirmGuests(tg.filter((g) => g.status !== "confirmed"));
      else if (kind === "phones") {
        const phones = tg.map((g) => g.phone).filter((p): p is string => !!p);
        await this.copy(phones.join("\n"), `הועתקו ${phones.length} מספרי טלפון`);
      } else if (kind === "export") this.exportCsv(tg);
      this.rememberQuery();
    },
    exportCsv(gs: SearchGuest[]) {
      const safe = (v: string | number | null) => {
        let s = v === null || v === undefined ? "" : String(v);
        if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
        return '"' + s.replace(/"/g, '""') + '"';
      };
      const rows = [["שם", "טלפון", "צד", "קבוצה", "סטטוס", "מוזמנים", "שולחן"]].concat(
        gs.map((g) => [g.name, g.phone || "", g.side ? SIDE_LABEL[g.side] : "", g.group, STATUS_LABEL[g.status][0], String(g.party), g.table || ""])
      );
      const csv = "\ufeff" + rows.map((r) => r.map(safe).join(",")).join("\r\n");
      this.download(new Blob([csv], { type: "text/csv;charset=utf-8" }), "snapshare-search.csv");
      notify({ type: "success", text: `מוריד CSV עם ${gs.length} שורות` });
    },
  },
});
</script>

<style lang="scss">
@import "@/styles/smart-search.scss";
</style>
