<template>
  <div class="pv">
    <template v-if="item.type === 'guest'">
      <div class="pv-top">
        <span class="av av-lg" :class="avClass(item.g)">{{ initials(item.g.name) }}</span>
        <div>
          <h3>{{ item.g.name }}</h3>
          <p>{{ sideLabel(item.g) }}<template v-if="item.g.group"> · {{ item.g.group }}</template></p>
        </div>
      </div>
      <div class="pv-tags">
        <span class="badge" :class="statusOf(item.g)[1]">{{ statusOf(item.g)[0] }}</span>
        <span class="badge b-muted">{{ item.g.party }} מוזמנים</span>
        <span v-if="item.g.meal" class="badge b-gold">{{ item.g.meal }}</span>
      </div>
      <dl>
        <template v-if="hasTables">
          <dt>שולחן</dt>
          <dd>{{ item.g.table || "טרם שובץ" }}</dd>
        </template>
        <dt>טלפון</dt>
        <dd dir="ltr" style="text-align: end">{{ item.g.phone ? fmtPhone(item.g.phone) : "חסר" }}</dd>
        <template v-if="item.g.wa.length">
          <dt>וואטסאפ</dt>
          <dd>{{ item.g.phone ? item.g.wa.join(" · ").replace(/-/g, " ") : "אין טלפון" }}</dd>
        </template>
        <template v-if="item.g.notes">
          <dt>הערות</dt>
          <dd>{{ item.g.notes }}</dd>
        </template>
      </dl>
      <div class="pv-acts"><SearchItemActions :item="item" :can-seat="canSeat" :menu-open="menuOpen" :table-options="tableOptions" @act="fwd" /></div>
      <SearchHallMap
        v-if="mapHl && tables.length"
        variant="pv-map"
        :tables="tables"
        :fixtures="fixtures"
        :highlight="mapHl"
        mode="guests"
        :me="meKey"
        @select="$emit('map-select', $event)"
      />
    </template>

    <template v-else-if="item.type === 'photo'">
      <div class="ph-big">
        <img v-if="item.ph.thumb && !broken" :src="item.ph.thumb" alt="" @error="broken = true" />
        <template v-else>{{ item.ph.kind === "סרטון" ? "▶" : "🖼" }}</template>
      </div>
      <div class="pv-top">
        <div>
          <h3>{{ item.ph.kind }} · {{ item.ph.time }}<template v-if="item.ph.day === -1"> (אתמול)</template><template v-else-if="item.ph.day < -1"> ({{ item.ph.dateLabel }})</template></h3>
          <p>מעלה #{{ item.ph.uploaderN }} · שעת העלאה</p>
        </div>
      </div>
      <div class="pv-tags">
        <span class="badge" :class="photoStatus(item.ph)[1]">{{ photoStatus(item.ph)[0] }}</span>
        <span v-if="item.ph.fav" class="badge b-gold">★ מועדפת</span>
      </div>
      <div class="pv-acts"><SearchItemActions :item="item" @act="fwd" /></div>
    </template>

    <template v-else-if="item.type === 'table'">
      <div class="pv-top">
        <span class="res-ico big-ico">🪑</span>
        <div>
          <h3>{{ item.t.label }}</h3>
          <p>{{ taken }}/{{ item.t.seats }} מקומות</p>
        </div>
      </div>
      <div class="seatbar"><i :style="{ width: Math.min(100, Math.round((taken / Math.max(1, item.t.seats)) * 100)) + '%' }"></i></div>
      <div class="pv-tags">
        <span v-for="g in seated" :key="g.id" class="badge b-muted">{{ g.name }} · {{ g.party }}</span>
        <span v-if="!seated.length" class="pv-note">אין אורחים משובצים</span>
      </div>
      <div class="pv-acts"><SearchItemActions :item="item" @act="fwd" /></div>
    </template>

    <template v-else-if="item.type === 'message'">
      <div class="pv-top">
        <span class="res-ico big-ico">💬</span>
        <div>
          <h3>{{ item.msg.title }}</h3>
          <p>{{ item.msg.kind }}</p>
        </div>
      </div>
      <div class="pv-tags"><span class="badge" :class="messageStatus(item.msg)[1]">{{ messageStatus(item.msg)[0] }}</span></div>
      <dl>
        <dt>מועד</dt>
        <dd>{{ item.msg.when || "—" }}</dd>
        <dt>נמענים</dt>
        <dd>{{ item.msg.audience }}</dd>
      </dl>
      <div class="pv-acts"><SearchItemActions :item="item" @act="fwd" /></div>
      <p v-if="item.msg.status === 'sent'" class="pv-note">נשלח — אי אפשר לשנות. אפשר לשכפל.</p>
    </template>

    <template v-else>
      <div class="pv-top">
        <span class="res-ico big-ico">{{ item.type === "page" ? "↪" : item.type === "reply" ? "💬" : item.type === "help" ? "❔" : "⚡" }}</span>
        <div>
          <h3>{{ otherTitle }}</h3>
          <p>{{ item.type === "reply" ? item.r.text : "Enter להפעלה" }}</p>
        </div>
      </div>
      <div class="pv-acts"><SearchItemActions :item="item" @act="fwd" /></div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import SearchItemActions from "./SearchItemActions.vue";
import SearchHallMap from "./SearchHallMap.vue";
import type { MapHighlight, SearchItem } from "@/helpers/search/engine";
import type { SearchFixture, SearchGuest, SearchMessage, SearchPhoto, SearchTable } from "@/helpers/search/types";
import { formatPhone, initialsOf } from "@/helpers/search/text";
import { MESSAGE_STATUS, PHOTO_STATUS, SIDE_LABEL, STATUS_LABEL } from "@/helpers/search/labels";

export default defineComponent({
  name: "SearchItemPreview",
  components: { SearchItemActions, SearchHallMap },
  props: {
    item: { type: Object as PropType<SearchItem>, required: true },
    guests: { type: Array as PropType<SearchGuest[]>, required: true },
    tables: { type: Array as PropType<SearchTable[]>, required: true },
    fixtures: { type: Array as PropType<SearchFixture[]>, default: () => [] },
    mapHl: { type: Object as PropType<MapHighlight | null>, default: null },
    canSeat: { type: Boolean, default: false },
    menuOpen: { type: Boolean, default: false },
    tableOptions: { type: Array as PropType<{ key: string; label: string; free: number }[]>, default: () => [] },
  },
  emits: ["act", "map-select"],
  data() {
    return { broken: false };
  },
  computed: {
    hasTables(): boolean {
      return this.tables.length > 0;
    },
    seated(): SearchGuest[] {
      const it = this.item;
      return it.type === "table" ? this.guests.filter((g) => g.tableId === it.t.id) : [];
    },
    taken(): number {
      return this.seated.reduce((a, g) => a + g.party, 0);
    },
    meKey(): string | null {
      const it = this.item;
      if (it.type !== "guest" || it.g.tableId == null) return null;
      const t = this.tables.find((x) => x.id === it.g.tableId);
      return t ? t.key : null;
    },
    otherTitle(): string {
      const it = this.item;
      if (it.type === "command") return it.c.label;
      if (it.type === "page") return "עבור אל " + it.p.label;
      if (it.type === "help") return it.h.label;
      if (it.type === "reply") return it.r.who;
      return "";
    },
  },
  watch: {
    item() {
      this.broken = false;
    },
  },
  methods: {
    fmtPhone: formatPhone,
    fwd(a: string, extra?: string) {
      this.$emit("act", a, extra);
    },
    initials(n: string): string {
      return initialsOf(n);
    },
    avClass(g: SearchGuest): string {
      return g.side === "bride" ? "av-b" : g.side === "groom" ? "av-g" : "";
    },
    sideLabel(g: SearchGuest): string {
      return g.side ? SIDE_LABEL[g.side] : "ללא צד";
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
  },
});
</script>
