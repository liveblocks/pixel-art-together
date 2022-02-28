<script lang="ts">
	import Header from '$lib/Header.svelte';
	import '../app.css';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<Header />

<main class="w-full h-full">
	<slot />
</main>
