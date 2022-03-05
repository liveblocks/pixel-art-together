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
