import type { Directive, DirectiveBinding } from "vue";
import { bindDragScroll } from "@/composables/useDragScroll";
import "./dragScroll.css";

type DragScrollEl = HTMLElement & { __dragScrollStop?: () => void };

function isEnabled(binding: DirectiveBinding<boolean | undefined>): boolean {
  return binding.value !== false;
}

function start(el: DragScrollEl): void {
  el.__dragScrollStop?.();
  el.__dragScrollStop = bindDragScroll(el);
}

function stop(el: DragScrollEl): void {
  el.__dragScrollStop?.();
  el.__dragScrollStop = undefined;
}

const dragScroll: Directive<HTMLElement, boolean | undefined> = {
  mounted(el, binding) {
    if (isEnabled(binding)) start(el as DragScrollEl);
  },
  updated(el, binding) {
    const on = isEnabled(binding);
    const node = el as DragScrollEl;
    if (on && !node.__dragScrollStop) start(node);
    else if (!on && node.__dragScrollStop) stop(node);
  },
  unmounted(el) {
    stop(el as DragScrollEl);
  },
};

export default dragScroll;
