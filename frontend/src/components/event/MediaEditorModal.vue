<template>
  <div v-if="open" class="editor-backdrop" @click.self="onCancel">
    <div class="editor-modal">
      <header class="editor-header">
        <h2 class="editor-title">עריכה לפני העלאה (תמונה)</h2>
        <div class="header-actions">
          <button class="btn ghost" @click="undo" :disabled="!canUndo">
            Undo
          </button>
          <button class="btn ghost" @click="redo" :disabled="!canRedo">
            Redo
          </button>
          <button class="btn ghost" @click="clearAll" :disabled="!hasEdits">
            נקה
          </button>
          <button class="btn ghost" @click="onCancel">ביטול</button>
          <button
            class="btn primary"
            @click="onConfirm"
            :disabled="busy || !ready || !!initError"
          >
            <span v-if="busy">מכין...</span>
            <span v-else>שמור והמשך</span>
          </button>
        </div>
      </header>

      <div v-show="!initError" class="editor-toolbar">
        <div class="tool-group tools">
          <button
            class="btn"
            :class="{ active: tool === 'draw' }"
            @click="setTool('draw')"
          >
            ציור
          </button>
          <button
            class="btn"
            :class="{ active: tool === 'select' }"
            @click="setTool('select')"
          >
            בחירה
          </button>
          <button class="btn" @click="addText">טקסט</button>
          <button
            class="btn btn-emoji"
            :disabled="emojiBusy"
            @click.prevent="addEmoji('😊')"
            type="button"
          >
            😊
          </button>
          <button
            class="btn btn-emoji"
            :disabled="emojiBusy"
            @click.prevent="addEmoji('❤️')"
            type="button"
          >
            ❤️
          </button>
          <button
            class="btn btn-emoji"
            :disabled="emojiBusy"
            @click.prevent="addEmoji('🔥')"
            type="button"
          >
            🔥
          </button>
          <button
            class="btn btn-emoji"
            :disabled="emojiBusy"
            @click.prevent="addEmoji('🎉')"
            type="button"
          >
            🎉
          </button>
        </div>

        <div class="tool-group options">
          <div class="colors">
            <button
              v-for="c in colors"
              :key="c"
              class="color"
              :style="{ background: c }"
              :class="{ active: c === color }"
              @click="setColor(c)"
              :aria-label="'color ' + c"
            />
          </div>

          <label class="range">
            עובי
            <input
              type="range"
              min="2"
              max="24"
              v-model.number="brushSize"
              @input="applyBrush"
            />
          </label>
        </div>
      </div>

      <div class="editor-stage" ref="stageEl">
        <div v-if="initError" class="editor-error">
          <p>{{ initError }}</p>
          <button class="btn primary" @click="onCancel">סגור</button>
        </div>
        <canvas
          v-show="!initError"
          ref="canvasEl"
          class="editor-canvas"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onBeforeUnmount,
  nextTick,
} from "vue";

type Tool = "draw" | "select";

type FabricLike = any;

// Dynamic import so bundler doesn't break Fabric constructors ("this is not a constructor")
let fabricModule: FabricLike | null = null;

async function getFabric(): Promise<FabricLike> {
  if (fabricModule) return fabricModule;

  const mod: any = await import("fabric");

  // v5 common: { fabric: {...} }
  // v6 common: { Canvas, FabricImage, ... }
  fabricModule = mod.fabric ?? mod;

  // Safety: some bundlers put everything under default
  if (!fabricModule.Canvas && mod.default) {
    fabricModule = mod.default.fabric ?? mod.default;
  }

  return fabricModule;
}

export default defineComponent({
  name: "MediaEditorModal",
  props: {
    open: { type: Boolean, required: true },
    file: { type: Object as () => File | null, default: null },
  },
  emits: ["cancel", "confirm"],
  setup(props, { emit }) {
    const stageEl = ref<HTMLDivElement | null>(null);

    // keep original size + editor scale for export
    const baseW = ref(0);
    const baseH = ref(0);
    const editorScale = ref(1);

    const canvasEl = ref<HTMLCanvasElement | null>(null);
    const fabricCanvas = ref<InstanceType<
      typeof import("fabric").Canvas
    > | null>(null);

    const objectUrl = ref<string>("");
    const ready = ref(false);
    const busy = ref(false);
    const initError = ref<string>("");

    const tool = ref<Tool>("draw");
    const emojiBusy = ref(false);
    const colors = [
      "#ffffff",
      "#000000",
      "#ff4d4d",
      "#ffd93d",
      "#4dd2ff",
      "#7CFF6B",
    ];
    const color = ref(colors[0]);
    const brushSize = ref(10);

    // history
    const history = ref<string[]>([]);
    const historyIndex = ref(-1);

    const isImage = computed(
      () => !!props.file && props.file.type.startsWith("image/"),
    );

    const hasEdits = computed(() => {
      const c = fabricCanvas.value;
      if (!c) return false;
      // objects = העריכות. ה-backgroundImage הוא התמונה עצמה.
      return c.getObjects().length > 0;
    });

    const canUndo = computed(() => historyIndex.value > 0);
    const canRedo = computed(
      () =>
        historyIndex.value >= 0 &&
        historyIndex.value < history.value.length - 1,
    );

    async function fabricFromURL(
      url: string,
      options?: Record<string, unknown>,
    ): Promise<any> {
      const Fabric = await getFabric();
      const ImageClass = Fabric.FabricImage ?? Fabric.Image;

      if (!ImageClass || typeof ImageClass.fromURL !== "function") {
        throw new Error(
          "Fabric image loader not found (FabricImage/Image.fromURL)",
        );
      }

      return await new Promise((resolve, reject) => {
        try {
          // v5 signature: fromURL(url, callback, options)
          if (ImageClass.fromURL.length >= 2) {
            ImageClass.fromURL(
              url,
              (img: any) =>
                img ? resolve(img) : reject(new Error("fromURL returned null")),
              options as any,
            );
            return;
          }

          // v6 signature: fromURL(url, options) => Promise
          const res = ImageClass.fromURL(url, options as any);
          Promise.resolve(res).then(resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    }

    function setCanvasBackground(c: any, bg: any) {
      // v5
      if (typeof c.setBackgroundImage === "function") {
        c.setBackgroundImage(bg, c.renderAll.bind(c));
        return;
      }
      // v6
      c.backgroundImage = bg;
      if (typeof c.requestRenderAll === "function") c.requestRenderAll();
      else c.renderAll();
    }

    async function initCanvas(width: number, height: number) {
      const Fabric = await getFabric();

      await nextTick();
      await new Promise((r) => requestAnimationFrame(r));
      await nextTick();

      const el = canvasEl.value;
      if (!el) throw new Error("Canvas element not found");

      el.width = width;
      el.height = height;

      let canvas: any;
      try {
        if (typeof Fabric.Canvas !== "function") {
          throw new Error(
            "Fabric.Canvas constructor not found (module shape mismatch)",
          );
        }

        canvas = new Fabric.Canvas(el, {
          selection: true,
          preserveObjectStacking: true,
          enableRetinaScaling: false,
        });

        if (typeof Fabric.PencilBrush !== "function") {
          throw new Error("Fabric.PencilBrush not found");
        }

        canvas.freeDrawingBrush = new Fabric.PencilBrush(canvas);
      } catch (err: unknown) {
        throw new Error(
          "Canvas init failed: " +
            (err instanceof Error ? err.message : String(err)),
        );
      }

      fabricCanvas.value = canvas;

      applyBrush();

      const onChanged = () => pushHistory();
      canvas.on("object:added", onChanged);
      canvas.on("object:modified", onChanged);
      canvas.on("object:removed", onChanged);
      canvas.on("path:created", onChanged);
      const isText = (o: any) =>
        o && (o.type === "textbox" || o.type === "i-text");

      const enterEdit = (o: any) => {
        o.enterEditing?.();
        o.selectAll?.();
        o.hiddenTextarea?.focus?.();
      };

      const exitEdit = () => {
        const active: any = canvas.getActiveObject?.();
        if (active?.isEditing) {
          active.exitEditing?.();
          active.hiddenTextarea?.blur?.();
          canvas.requestRenderAll?.();
          canvas.renderAll?.();
        }
      };

      let lastTapObj: any = null;
      let lastTapTime = 0;

      canvas.on("mouse:down", (opt: any) => {
        const target = opt?.target;

        // tap empty space -> finish editing
        if (!target) {
          exitEdit();
          return;
        }

        if (!isText(target)) return;

        // if we're in draw mode, switch so selection works
        if (tool.value === "draw") setTool("select");

        const now = Date.now();
        const isSecondTap = lastTapObj === target && now - lastTapTime < 350;

        lastTapObj = target;
        lastTapTime = now;

        // second tap -> enter editing
        if (isSecondTap) {
          canvas.setActiveObject(target);
          enterEdit(target);
        }
      });

      pushHistory();
      setTool(tool.value);

      ready.value = true;
    }

    function safeDispose(obj: any) {
      try {
        if (obj && typeof obj.dispose === "function") obj.dispose();
      } catch (error) {
        console.error({ error });
      }
    }

    async function initForImage(file: File, token: number) {
      objectUrl.value = URL.createObjectURL(file);

      const img = new Image();
      img.src = objectUrl.value;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error("Failed to load image (objectURL)"));
      });

      if (token !== loadToken.value) return;

      // store original size
      baseW.value = img.naturalWidth;
      baseH.value = img.naturalHeight;

      // measure available space inside the stage (minus padding)
      const stage = stageEl.value;
      if (!stage) throw new Error("Stage element not found");

      await nextTick();
      await new Promise((r) => requestAnimationFrame(r));

      const rect = stage.getBoundingClientRect();
      const padding = 24; // stage has 12px padding on both sides
      const maxW = Math.max(50, Math.floor(rect.width - padding));
      const maxH = Math.max(50, Math.floor(rect.height - padding));

      // scale to fit (contain) while keeping aspect ratio, no upscaling
      const s = Math.min(maxW / baseW.value, maxH / baseH.value, 1);
      editorScale.value = s;

      const canvasW = Math.round(baseW.value * s);
      const canvasH = Math.round(baseH.value * s);

      await initCanvas(canvasW, canvasH);

      if (token !== loadToken.value) return;

      const c = fabricCanvas.value;
      if (!c) return;

      const bg = await fabricFromURL(img.src, { crossOrigin: "anonymous" });
      if (token !== loadToken.value) return;

      // uniform scale (no squeeze)
      (bg as any).set({
        left: 0,
        top: 0,
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
        scaleX: s,
        scaleY: s,
      });

      setCanvasBackground(c, bg);
      pushHistory();
    }

    function pushHistory() {
      const c = fabricCanvas.value;
      if (!c) return;

      const json = JSON.stringify(c.toJSON());
      if (historyIndex.value < history.value.length - 1) {
        history.value = history.value.slice(0, historyIndex.value + 1);
      }
      history.value.push(json);
      if (history.value.length > 40) history.value.shift();
      historyIndex.value = history.value.length - 1;
    }

    async function loadFromHistory(index: number) {
      const c: any = fabricCanvas.value;
      if (!c) return;

      const json = history.value[index];
      const res = c.loadFromJSON(json);

      if (res && typeof res.then === "function") {
        await res;
        c.requestRenderAll?.();
        c.renderAll?.();
      } else {
        c.renderAll();
      }

      historyIndex.value = index;
    }

    function undo() {
      if (!canUndo.value) return;
      loadFromHistory(historyIndex.value - 1);
    }

    function redo() {
      if (!canRedo.value) return;
      loadFromHistory(historyIndex.value + 1);
    }

    function setTool(next: Tool) {
      tool.value = next;
      const c = fabricCanvas.value;
      if (!c) return;

      if (next === "draw") {
        c.isDrawingMode = true;
        c.selection = false;
        c.forEachObject((o) => (o.selectable = false));
      } else {
        c.isDrawingMode = false;
        c.selection = true;
        c.forEachObject((o) => (o.selectable = true));
      }
      c.renderAll();
    }

    function setColor(c: string) {
      color.value = c;
      applyBrush();
    }

    function applyBrush() {
      const c = fabricCanvas.value;
      if (!c) return;
      if (c.freeDrawingBrush) {
        c.freeDrawingBrush.color = color.value;
        c.freeDrawingBrush.width = brushSize.value;
      }
    }

    async function addText() {
      const c: any = fabricCanvas.value;
      if (!c) return;

      const Fabric = await getFabric();
      setTool("select");

      const t: any = new Fabric.Textbox("כתוב כאן", {
        left: 40,
        top: 40,
        fontSize: 42,
        fill: color.value,
        fontFamily: "system-ui",
        editable: true,
      });

      c.add(t);
      c.setActiveObject(t);
      c.requestRenderAll?.();
      c.renderAll?.();

      pushHistory();
    }

    /** Render emoji as image so it displays reliably (Fabric Text often fails with emoji). */
    async function addEmoji(emoji: string) {
      const c = fabricCanvas.value;
      if (!c) return;
      emojiBusy.value = true;
      try {
        const size = 80;
        const scale = 2;
        const canvas = document.createElement("canvas");
        canvas.width = size * scale;
        canvas.height = size * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(scale, scale);
        ctx.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, size / 2, size / 2);
        const dataUrl = canvas.toDataURL("image/png");
        const img = await fabricFromURL(dataUrl);
        if (!img || typeof (img as { set?: unknown }).set !== "function")
          return;
        const imgObj = img as { set: (opts: object) => void };
        imgObj.set({
          left: 80,
          top: 80,
          scaleX: 0.5,
          scaleY: 0.5,
          selectable: true,
          evented: true,
        });
        c.add(img as never);
        c.setActiveObject(img as never);
        c.renderAll();
        pushHistory();
        setTool("select");
      } finally {
        emojiBusy.value = false;
      }
    }

    function clearAll() {
      const c = fabricCanvas.value;
      if (!c) return;
      c.getObjects().forEach((o) => c.remove(o));
      c.discardActiveObject();
      c.renderAll();
      pushHistory();
    }

    function destroy() {
      ready.value = false;
      initError.value = "";

      if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value);
        objectUrl.value = "";
      }

      safeDispose(fabricCanvas.value);
      fabricCanvas.value = null;

      history.value = [];
      historyIndex.value = -1;
    }

    /** Export full canvas (background + all edits) as a single PNG file. */
    async function exportFullImageBlob(): Promise<Blob> {
      const c: any = fabricCanvas.value;
      if (!c) throw new Error("Canvas not ready");

      const active: any = (c as any).getActiveObject?.();
      active?.exitEditing?.();
      c.discardActiveObject?.();
      c.requestRenderAll?.();

      const multiplier = editorScale.value > 0 ? 1 / editorScale.value : 1;
      const dataUrl = c.toDataURL({ format: "png", multiplier });

      const res = await fetch(dataUrl);
      return await res.blob();
    }

    async function onConfirm() {
      if (!props.file || !isImage.value) return;

      busy.value = true;
      try {
        const blob = await exportFullImageBlob();
        const file = new File([blob], `snapshare_${Date.now()}.png`, {
          type: "image/png",
        });
        emit("confirm", { file });
      } finally {
        busy.value = false;
      }
    }

    function onCancel() {
      emit("cancel");
    }

    const loadToken = ref(0);

    watch(
      () => [props.open, props.file] as const,
      async ([isOpen, file]) => {
        loadToken.value += 1;
        const token = loadToken.value;

        if (!isOpen) {
          destroy();
          return;
        }

        // פתוח אבל אין קובץ
        if (!file) return;

        // תמונות בלבד
        if (!file.type.startsWith("image/")) {
          emit("confirm", { file });
          return;
        }

        // מתחילים טעינה חדשה
        destroy();

        try {
          await initForImage(file, token);
          if (token === loadToken.value) initError.value = "";
        } catch (e: any) {
          console.error("Editor init error", e);
          if (token === loadToken.value) {
            initError.value =
              e?.message || "טעינת התמונה נכשלה. נסה קובץ אחר או סגור.";
          }
        }
      },
      { immediate: true },
    );

    // watch(
    //   () => props.open,
    //   async (v) => {
    //     if (v) await openEditor();
    //     else destroy();
    //   }
    // );

    // watch(
    //   () => props.file,
    //   async () => {
    //     if (props.open) await openEditor();
    //   }
    // );

    onBeforeUnmount(() => destroy());

    return {
      canvasEl,
      ready,
      busy,
      initError,
      emojiBusy,
      stageEl,

      tool,
      colors,
      color,
      brushSize,

      hasEdits,
      canUndo,
      canRedo,

      setTool,
      setColor,
      applyBrush,
      addText,
      addEmoji,
      undo,
      redo,
      clearAll,

      onCancel,
      onConfirm,
    };
  },
});
</script>

<style scoped lang="scss">
.editor-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  direction: rtl;
  overflow: auto;
  box-sizing: border-box;
}

.editor-modal {
  width: 100%;
  max-width: min(980px, 100%);
  height: auto;
  max-height: min(90vh, 720px);
  min-height: 320px;
  background: rgba(24, 24, 24, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(12px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.editor-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.editor-title {
  margin: 0;
  color: #fff;
  font-weight: 700;
  font-size: clamp(14px, 3.5vw, 18px);
  line-height: 1.3;
}

.header-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.tool-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.tool-group.tools {
  flex: 1;
  min-width: 0;
}

.tool-group.options {
  flex-shrink: 0;
}

.btn-emoji {
  font-size: 1.25rem;
  line-height: 1;
  padding: 6px 10px;
  min-width: 40px;
}

.colors {
  display: flex;
  gap: 6px;
  align-items: center;
}

.color {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  cursor: pointer;
  flex-shrink: 0;
}

.color.active {
  border-color: #fff;
  transform: scale(1.08);
}

.range {
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
}

.range input {
  width: 100px;
  min-width: 80px;
}

@media (max-width: 480px) {
  .editor-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .tool-group.options {
    justify-content: flex-start;
  }

  .header-actions .btn {
    padding: 6px 8px;
    font-size: 13px;
  }
}

.btn {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.active {
  border-color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.14);
}

.btn.primary {
  border: none;
  background: linear-gradient(135deg, #ff7f50, #ff4500);
}

.btn.primary:hover:not(:disabled) {
  filter: brightness(1.08);
}

.btn.ghost {
  background: rgba(255, 255, 255, 0.04);
}

.editor-stage {
  position: relative;
  flex: 1;
  min-height: 350px;
  background: #0c0c0c;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 12px;
  -webkit-overflow-scrolling: touch;
}

.editor-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
}

.editor-error p {
  margin: 0;
  font-size: 1rem;
  max-width: 320px;
}

.editor-canvas {
  // max-width: 100%;
  // max-height: 100%;
  // width: auto;
  // height: auto;
  // border-radius: 10px;
  // box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  display: block;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}
</style>
