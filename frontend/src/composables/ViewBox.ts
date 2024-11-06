import { computed, ref } from "vue"
import { useWindowSize } from "./TrackWindowSize";

export function useViewBox() {

  const offsetX = ref(0.0)
  const offsetY = ref(0.0)

  const {windowWidth, windowHeight} = useWindowSize();

  const viewBoxAttr = computed(() => {
    return `${offsetX.value} ${offsetY.value} ${windowWidth.value} ${windowHeight.value}`
  });

  return {windowWidth, windowHeight, offsetX, offsetY, viewBoxAttr};
}