<template>
  <div ref="container" class="collage-container">
    <transition-group name="fade" tag="div">
      <div
        v-for="item in items"
        :key="item.id"
        class="collage-item"
        :style="item.style"
      >
        <EventGalleryMediaFrame>
          <img
            v-if="item.asset?.type === 'image'"
            :src="item.asset.fullPath"
            class="collage-asset"
          />
          <video
            v-else-if="item.asset?.type === 'video'"
            :src="item.asset.fullPath"
            autoplay
            muted
            loop
            class="collage-asset"
          ></video>
        </EventGalleryMediaFrame>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";
import EventGalleryMediaFrame from "@/components/event/EventGalleryMediaFrame.vue";

interface CollageItem {
  id: number;
  asset: IEventAsset | null;
  style: Record<string, string>;
  slot: string; // ✅ keep the slot key
}

export default defineComponent({
  name: "GalleryDynamicCollage",

  components: {
    EventGalleryMediaFrame,
  },

  props: {
    interval: { type: Number, default: 2000 }, // ms between new spawns
    maxItems: { type: Number, default: 36 }, // how many on screen
    lifespan: { type: Number, default: 8000 }, // ms each asset lives
  },

  data() {
    return {
      items: [] as CollageItem[],
      timerId: null as ReturnType<typeof setInterval> | null,
      counter: 0,
    };
  },

  computed: {
    assets(): IEventAsset[] {
      return this.$store.getters["event/getDisplayGalleryAssets"] as IEventAsset[];
    },
  },

  methods: {
    getRandomAsset(): IEventAsset | null {
      if (!this.assets.length) return null;
      const index = Math.floor(Math.random() * this.assets.length);
      return this.assets[index];
    },

    clamp(n: number, min: number, max: number) {
      return Math.max(min, Math.min(max, n));
    },

    getRandomStyle(
      usedSlots: Set<string>,
      zIndex: number
    ): { style: Record<string, string>; slot: string } {
      const container = this.$refs.container as HTMLElement | undefined;
      const W = container?.clientWidth ?? window.innerWidth;
      const H = container?.clientHeight ?? window.innerHeight;

      const rows = 3;
      const cols = 4;
      const cellW = W / cols;
      const cellH = H / rows;

      // ✅ pick free slot
      let row = 0,
        col = 0,
        slotKey = "";
      do {
        row = Math.floor(Math.random() * rows);
        col = Math.floor(Math.random() * cols);
        slotKey = `${row}-${col}`;
      } while (usedSlots.has(slotKey));

      usedSlots.add(slotKey);

      // ✅ size in px (square), so we can clamp correctly
      const minSize = Math.min(W, H) * 0.30;
      const maxSize = Math.min(W, H) * 0.54;
      const size = minSize + Math.random() * (maxSize - minSize);

      // base position inside the slot + some randomness
      const offsetX = Math.random() * (cellW * 0.4);
      const offsetY = Math.random() * (cellH * 0.4);
      let x = col * cellW + offsetX;
      let y = row * cellH + offsetY;

      // ✅ ensure at least 80% visible
      const visible = 0.8; // required visible portion
      const allow = 1 - visible; // 0.2 allowed overflow

      // also consider your float translate (-20px, -20px) as extra margin
      const drift = 25;

      const minX = -allow * size + drift;
      const maxX = W - visible * size - drift;
      const minY = -allow * size + drift;
      const maxY = H - visible * size - drift;

      x = this.clamp(x, minX, maxX);
      y = this.clamp(y, minY, maxY);

      const rotate = Math.floor(Math.random() * 20 - 10);

      return {
        slot: slotKey,
        style: {
          position: "absolute",
          left: `${x}px`,
          top: `${y}px`,
          width: `${size}px`,
          height: `${size}px`, // ✅ define height so bounding box is known
          transform: `rotate(${rotate}deg)`,
          zIndex: zIndex.toString(),
          animation: `float ${this.lifespan}ms ease-in-out forwards`,
        },
      };
    },

    spawnItem() {
      if (!this.assets.length) return;

      // ✅ track actual slots
      const usedSlots = new Set(this.items.map((i) => i.slot));

      if (this.items.length >= this.maxItems) {
        this.items.shift();
      }

      const res = this.getRandomStyle(usedSlots, this.counter);

      const newItem: CollageItem = {
        id: this.counter++,
        asset: this.getRandomAsset(),
        style: res.style,
        slot: res.slot,
      };

      this.items.push(newItem);

      setTimeout(() => {
        this.items = this.items.filter((i) => i.id !== newItem.id);
      }, this.lifespan);
    },
  },

  mounted() {
    this.spawnItem(); // first
    this.timerId = setInterval(this.spawnItem, this.interval);
  },

  beforeUnmount() {
    if (this.timerId) clearInterval(this.timerId);
  },
});
</script>

<style scoped>
.collage-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

.collage-item {
  pointer-events: none;
  overflow: hidden;
}

.collage-asset {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  opacity: 0.9;
}

/* entry/exit */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* float animation */
@keyframes float {
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  80% {
    transform: scale(1.1) translate(-10px, -10px);
    opacity: 1;
  }
  100% {
    transform: scale(1.2) translate(-20px, -20px);
    opacity: 0;
  }
}
</style>
