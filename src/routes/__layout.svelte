<script lang="ts">
	import Header from '$lib/Header.svelte';
	import '../app.css';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>



<!-- LiveblocksProvider here -->
<Header />


<main>
	<slot />
</main>
