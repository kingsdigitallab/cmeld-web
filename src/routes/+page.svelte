<script>
	import { search } from '$lib/index';
	import Plot, { PlotLib } from '$lib/components/Plot.svelte';

	/** @type {import('./$types').PageServerData} */
	export let data;

	/**
	 * @type {string}
	 */
	let input = 'exquisitely realised with obtuse observation and insight';
	let isSearching = false;

	let plotOptions = { x: 'x', y: 'y', stroke: 'lightgray', tip: true, title: 'w' };

	/**
	 * @type {Array<{ entry: Object, similarity: number }> | null}
	 */
	let results = null;

	async function handleSearch() {
		isSearching = true;
		data.streamed.index
			.then((index) => search(index, input))
			.then((r) => {
				results = r;
				isSearching = false;
			});
	}
</script>

<h1>Critical Modelling Semantic Search</h1>

{#await data.streamed.index}
	<p>Loading index...</p>
{:then index}
	<h2>Search</h2>
	<p>Loaded index with <em>{index.length}</em> elements</p>
	<form on:submit={() => handleSearch()}>
		Enter a search query:
		<input name="input" bind:value={input} size="50" />
		<button disabled={!input || isSearching}>Search</button>
	</form>

	{#if isSearching}
		<p>Searching for <em>{input}</em>...</p>
	{:else if results}
		<h3>Results</h3>
		<div class="container">
			<div class="column">
				<Plot
					options={{
						marks: [
							PlotLib.dot(index, plotOptions),
							PlotLib.dot(
								results.map((r) => ({ ...r.entry, similarity: r.similarity })),
								{
									x: 'x',
									y: 'y',
									stroke: 'blue',
									channels: { similarity: 'similarity', titles: 'w' },
									tip: true
								}
							)
						]
					}}>Loading plot...</Plot
				>
			</div>
			<div class="column">
				<ol>
					{#each results as result}
						<li>{Number(result.similarity).toFixed(3)}, {result.entry.w.join('; ')}</li>
					{/each}
				</ol>
			</div>
		</div>
	{:else}
		<h3>Index entries</h3>
		<div class="container">
			<div class="column">
				<Plot
					options={{
						marks: [PlotLib.dot(index, plotOptions)]
					}}>Loading plot...</Plot
				>
			</div>
		</div>
	{/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

<style>
	.container {
		display: flex;
		flex-direction: row;
	}
	.column {
		flex: 50%;
	}
</style>
