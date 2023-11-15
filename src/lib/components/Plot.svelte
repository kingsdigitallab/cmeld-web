<script context="module">
	import * as Plot from '@observablehq/plot';

	export { Plot as PlotLib };
</script>

<script>
	export let options = {};
	let isLoaded = false;

	/**
	 * https://learn.svelte.dev/tutorial/actions
	 * @param {HTMLDivElement} node
	 */
	function createPlot(node) {
		let plot = Plot.plot(options);

		node.appendChild(plot);
		isLoaded = true;

		return {
			destroy() {
				isLoaded = false;
				plot.remove();
			}
		};
	}
</script>

{#key options}
	<div use:createPlot {...$$restProps}>
		{#if !isLoaded}<slot />{/if}
	</div>
{/key}
