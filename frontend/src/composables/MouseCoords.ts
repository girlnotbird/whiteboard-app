import { onMounted, onUnmounted, ref } from "vue"

export function useMouseCoords() {
  const x = ref(0.0)
  const y = ref(0.0)

  
  function onMouseMove(event: MouseEvent) {
    x.value = event.clientX
    y.value = event.clientY
  }
  
  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove);
  });
  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove);
  });
  
  return {x, y}
}