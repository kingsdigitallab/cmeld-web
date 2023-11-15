/** @type {import('./$types').PageServerLoad} */
export function load({ fetch }) {
	return {
		streamed: {
			/** @type {Promise<Object[]>} */
			index: fetch('/data/index.json', {
				headers: {
					'content-type': 'application/json'
				}
			}).then((response) => response.json())
		}
	};
}
