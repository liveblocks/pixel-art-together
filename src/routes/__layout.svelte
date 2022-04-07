<script lang="ts">
  import Header from "$lib/Header.svelte";
  import "../app.css";
  import "../sl.css";
  import { onMount } from "svelte";
  import ExampleWrapper from "$lib/ExampleWrapper.svelte";

  let elementsReady = false;

  // Get and update correct vh unit
  onMount(async () => {
    function onResize() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }

    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    // Avoid flash of undefined custom element in intro dialog
    if (customElements?.whenDefined && Promise?.allSettled) {
      await Promise.allSettled([
        customElements.whenDefined("sl-dialog"),
        customElements.whenDefined("sl-input"),
        customElements.whenDefined("sl-range"),
        customElements.whenDefined("sl-button")
      ]);
    }
    elementsReady = true;
  });
</script>

<svelte:head>
  <script
    defer
    data-domain={import.meta.env.VITE_ANALYTICS_DOMAIN}
    src={import.meta.env.VITE_ANALYTICS_URL}
  ></script>
</svelte:head>

<ExampleWrapper keyType="secret">
  <div class="transition-opacity" style="opacity: {elementsReady ? 1 : 0}">
    <Header />
  </div>

  <main class="h-full w-full transition-opacity" style="opacity: {elementsReady ? 1 : 0}">
    <slot />
  </main>
</ExampleWrapper>

<style global>
  :root {
    --full-height: calc(var(--vh, 1vh) * 100);

    --sl-font-sans: Karla, Inter, sans-serif;
    --sl-panel-border-width: 0;
    --sl-font-size-medium: 14px;
    --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) #fab9a1;
    --sl-color-primary-50: #fff8f3;
    --sl-color-primary-100: #fde1cd;
    --sl-color-primary-200: #fab9a1;
    --sl-color-primary-300: #ff8b77;
    --sl-color-primary-400: #fd5e61;
    --sl-color-primary-500: #ff4346;
    --sl-color-primary-600: #fa3030;
    --sl-color-primary-700: #be1b38;
    --sl-color-primary-800: #8a1c2f;
    --sl-color-primary-900: #520b18;
  }
</style>
