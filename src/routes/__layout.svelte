<script lang="ts">
	import Header from '$lib/Header.svelte';
	import '../app.css';
	import '../sl.css';
  import ImportCustomElements from '$lib/ImportCustomElements.svelte'
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<ImportCustomElements />

<Header />

<main class="w-full h-full">
	<slot />
</main>

<style global>
:root {
  --sl-font-sans: Karla, Inter, sans-serif;
  --sl-panel-border-width: 0;
  --sl-font-size-medium: 14px;

  --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) #fab9a1;


  --sl-color-primary-50: #fff8f3;
  --sl-color-primary-100: #fde1cd;
  --sl-color-primary-200: #fab9a1;
  --sl-color-primary-300: #ff8b77;
  --sl-color-primary-400: #fd5e61;
  --sl-color-primary-500: #FF4346;
  --sl-color-primary-600: #fa3030;
  --sl-color-primary-700: #be1b38;
  --sl-color-primary-800: #8a1c2f;
  --sl-color-primary-900: #520b18;

  /*--sl-color-primary-50: var(--sl-color-orange-50);*/
  /*--sl-color-primary-100: var(--sl-color-orange-100);*/
  /*--sl-color-primary-200: var(--sl-color-orange-200);*/
  /*--sl-color-primary-300: var(--sl-color-orange-300);*/
  /*--sl-color-primary-400: var(--sl-color-orange-400);*/
  /*--sl-color-primary-500: var(--sl-color-orange-500);*/
  /*--sl-color-primary-600: var(--sl-color-orange-600);*/
  /*--sl-color-primary-700: var(--sl-color-orange-700);*/
  /*--sl-color-primary-800: var(--sl-color-orange-800);*/
  /*--sl-color-primary-900: var(--sl-color-orange-900);*/
  /*--sl-color-primary-950: var(--sl-color-orange-950);*/
}
</style>
