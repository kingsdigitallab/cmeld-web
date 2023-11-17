<script>
	import { page } from '$app/stores';
	import Plot, { PlotLib } from '$lib/components/Plot.svelte';
	import { search } from '$lib/index';
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageServerData} */
	export let data;

	/** @type {string} */
	let query = '';
	let _q = query;

	let numberOfResults = 50;
	let _nor = numberOfResults;

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
		_q = query;
		_nor = numberOfResults;

		isSearching = true;
		results = null;

		data.streamed.index
			.then((index) => search(index, query))
			.then((r) => {
				isSearching = false;
				results = r.slice(0, numberOfResults);
			});
	}

	onMount(() => {
		query = $page.url.searchParams.get('query') || '';
		numberOfResults = parseInt($page.url.searchParams.get('size') || '25');
	});
</script>

{#await data.streamed.index}
	<hgroup>
		<h1>Critical Modelling Semantic Search</h1>
		<h2 aria-busy="true">Loading index...</h2>
	</hgroup>
{:then index}
	<hgroup>
		<h1>Critical Modelling Semantic Search</h1>
		<h2>Loaded index with {index.length.toLocaleString()} reviews.</h2>
	</hgroup>

	<section>
		<div class="grid">
			<div>
				<hgroup>
					<h2>Search</h2>
					<h3>
						Enter a search query and choose the number of search results to do a semantic search on
						the reviews.
					</h3>
				</hgroup>
				<form on:submit={() => handleSearch()}>
					<label for="query"
						>Search query
						<input
							type="search"
							name="query"
							id="query"
							placeholder="Search query"
							required
							bind:value={query}
						/>
					</label>
					<label for="size"
						>Number of results ({numberOfResults})
						<input
							type="range"
							name="size"
							id="size"
							min="25"
							max={index.length}
							step="25"
							bind:value={numberOfResults}
						/>
					</label>
					<button type="submit" disabled={!query || isSearching}>Search</button>
				</form>
			</div>

			<div>
				<hgroup>
					<h2>Embeddings</h2>
					<h3>
						Each dark blue circle corresponds to the embeddings of a review. After a search, the
						search results are highlighted in orange in the plot. You can hover over the plot to see
						the title of the work associated with the review.
					</h3>
				</hgroup>
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
		</div>
	</section>

	<section>
		{#if isSearching}
			<hgroup>
				<h2>Search results</h2>
				<h3 aria-busy="true">Searching for <em>{query}</em>...</h3>
			</hgroup>
		{:else if results}
			<hgroup>
				<h2>Search results for {_q}</h2>
				<h3>
					Displaying <strong>{_nor}</strong> search results, ordered by similarity. Each result corresponds
					to the text of a review about one or more works.
				</h3>
			</hgroup>
			<ol style="--spacing: {_nor.toString().length * 16}px">
				{#each results as result}
					<li>
						<mark>{Number(result.similarity).toFixed(3)}</mark>
						{#each result.entry.w as title, i}
							{#if i > 0};{/if}
							<span data-tooltip={result.entry.i[i]}>{title}</span>
						{/each}
					</li>
				{/each}
			</ol>
		{/if}
	</section>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
