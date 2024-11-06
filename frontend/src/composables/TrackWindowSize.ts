import { ref, onMounted, onUnmounted } from "vue";

export function useWindowSize() {

  const windowWidth = ref(window.innerWidth);
  const windowHeight = ref(window.innerHeight);

  function onWindowResize() {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  }

  onMounted(() => {
    window.addEventListener('resize', onWindowResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
  });

  return { windowWidth, windowHeight };
}