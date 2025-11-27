<template>
  <div class="collage-container">
    <transition-group name="fade" tag="div">
      <div
        v-for="item in items"
        :key="item.id"
        class="collage-item"
        :style="item.style"
      >
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
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";

interface CollageItem {
  id: number;
  asset: IEventAsset | null;
  style: Record<string, string>;
}

export default defineComponent({
  name: "GalleryDynamicCollage",

  props: {
    interval: { type: Number, default: 2000 }, // ms between new spawns
    maxItems: { type: Number, default: 12 }, // how many on screen
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
      return this.$store.getters["event/getGalleryAssets"] as IEventAsset[];
    },
  },

  methods: {
    getRandomAsset(): IEventAsset | null {
      if (!this.assets.length) return null;
      const index = Math.floor(Math.random() * this.assets.length);
      return this.assets[index];
    },

    getRandomStyle(
      usedSlots: Set<string>,
      zIndex: number
    ): Record<string, string> {
      const rows = 3; // split screen vertically
      const cols = 4; // split screen horizontally
      const cellW = 100 / cols; // width per slot in vw
      const cellH = 50 / rows; // height per slot in vh (top half only)

      // keep picking until we find a free slot
      let row, col, slotKey;
      do {
        row = Math.floor(Math.random() * rows);
        col = Math.floor(Math.random() * cols);
        slotKey = `${row}-${col}`;
      } while (usedSlots.has(slotKey));

      // mark slot as used
      usedSlots.add(slotKey);

      // random offset inside the slot (so it doesn’t look too rigid)
      const offsetX = Math.random() * (cellW * 0.4);
      const offsetY = Math.random() * (cellH * 0.4);

      const size = 15 + Math.random() * 15; // 15–30vw
      const rotate = Math.floor(Math.random() * 20 - 10); // -10° to 10°
      const z = Math.floor(Math.random() * 3);

      return {
        position: "absolute",
        top: `${row * cellH + offsetY}vh`,
        left: `${col * cellW + offsetX}vw`,
        width: `${size}vw`,
        transform: `rotate(${rotate}deg)`,
        zIndex: zIndex.toString(),
        animation: `float ${this.lifespan}ms ease-in-out forwards`,
      };
    },

    spawnItem() {
      if (!this.assets.length) return;

      // reset slot tracking
      const usedSlots = new Set(this.items.map((i: any) => i.slot));
      console.log({ usedSlots });

      if (this.items.length >= this.maxItems) {
        this.items.shift();
      }

      const newItem: CollageItem = {
        id: this.counter++,
        asset: this.getRandomAsset(),
        style: this.getRandomStyle(usedSlots, this.counter),
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
