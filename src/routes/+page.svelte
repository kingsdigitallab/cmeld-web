<script>
	import { search } from '$lib/index';
	import Plot, { PlotLib } from '$lib/components/Plot.svelte';

	/** @type {import('./$types').PageServerData} */
	export let data;

	/** @type {string} */
	let input = '';
	let isSearching = false;

	let plotOptions = {
		x: 'x',
		y: 'y',
		stroke: '#023047',
		channels: { title: 'w', form: 'f', genre: 'g' },
		tip: true
	};
	let axisOptions = {
		label: null,
		labelArrow: null,
		ticks: 0
	};

	/**  @type {Array<{ entry: Object, similarity: number }> | null} */
	let results = null;

	async function handleSearch() {
		isSearching = true;
		results = null;

		data.streamed.index
			.then((index) => search(index, input))
			.then((r) => {
				isSearching = false;
				results = r;
			});
	}
</script>

<h1>Critical Modelling Semantic Search</h1>

{#await data.streamed.index}
	<p>Loading index...</p>
{:then index}
	<h2>Search</h2>
	<p>Loaded index with {index.length.toLocaleString()} reviews.</p>
	<form on:submit={() => handleSearch()}>
		Enter a search query:
		<input name="input" bind:value={input} size="50" />
		<button disabled={!input || isSearching}>Search</button>
	</form>

	<div class="container">
		<div class="column">
			<h3>Reviews embeddings</h3>
			<p>
				Each dark blue circle corresponds to the embeddings of a review. After a search, the search
				results are highlighted in orange in the plot. You can hover over the plot to see the title
				of the work associated with the review.
			</p>
			<Plot
				options={{
					marks: [
						PlotLib.dot(index, plotOptions),
						results &&
							PlotLib.dot(
								results.map((r) => ({ ...r.entry, similarity: r.similarity })),
								{
									x: 'x',
									y: 'y',
									stroke: '#ffb703',
									strokeWidth: 2,
									channels: { similarity: 'similarity', titles: 'w' },
									tip: true
								}
							)
					],
					x: axisOptions,
					y: axisOptions
				}}>Loading plot...</Plot
			>
		</div>
		<div class="column">
			{#if isSearching || results}
				<h3>Search results</h3>
			{/if}
			{#if isSearching}
				<p>Searching for <em>{input}</em>...</p>
			{:else if results}
				<p>
					Displaying the top 25 search results, ordered by similarity. Each result corresponds to
					the text of a review about one or more works.
				</p>
				<ol>
					{#each results as result}
						<li>
							<dl>
								<dt>Title(s)</dt>
								{#each result.entry.w as title}
									<dd>{title}</dd>
								{/each}
								<dt>Review(s)</dt>
								<dd>{result.entry.i.join('; ')}</dd>
								<dt>Similarity</dt>
								<dd>{Number(result.similarity).toFixed(3)}</dd>
							</dl>
						</li>
					{/each}
				</ol>
			{/if}
		</div>
	</div>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

<style>
	ol {
		list-style-type: decimal-leading-zero;
	}
	li {
		padding-bottom: 0.5em;
	}
	dt {
		font-size: 0.8em;
	}
	dd {
		margin-inline-start: 0;
	}
	.container {
		display: flex;
		flex-direction: row;
	}
	.column {
		flex: 50%;
	}
</style>