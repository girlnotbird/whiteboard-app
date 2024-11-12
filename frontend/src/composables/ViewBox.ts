import { computed, ref } from "vue"

import { useWindowSize } from "@vueuse/core";

export function useViewBox() {

  const offsetX = ref(0.0)
  const offsetY = ref(0.0)

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const viewBox = computed(() => {
    return `${offsetX.value} ${offsetY.value} ${windowWidth.value} ${windowHeight.value}`
  });

  return {windowWidth, windowHeight, offsetX, offsetY, viewBox};
}