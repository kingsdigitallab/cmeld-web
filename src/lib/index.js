import { pipeline } from '@xenova/transformers';

/**
 * @type {import("@xenova/transformers").Pipeline | null}
 */
let PIPELINE = null;

/**
 * Search for the top 10 results with the highest cosine similarity.
 *
 * @param {Object[]} index - The list of embeddings to search through.
 * @param {string} query - The query to search for.
 * @returns {Promise<Array<{ entry: Object, similarity: number }>>} - The top 10 results with the highest cosine similarity.
 */
export async function search(index, query) {
	const queryEmbedding = await extract(query);

	const results = index.map((entry) => {
		const similarity = cosineSimilarity(entry.v, queryEmbedding);
		return { entry, similarity };
	});

	results.sort((a, b) => b.similarity - a.similarity);

	return results.slice(0, 25);
}

/**
 * Extracts embeddings for the given input.
 *
 * @param {string} input - The input text to extract features for.
 * @returns {Promise<number[]>} - The encoded INT8 representation of the input.
 */
async function extract(input) {
	const pipe = await getPipeline();
	const output = await pipe(input, { pooling: 'mean', normalize: true });

	return quantizeToINT8([...output.data]);
}

/**
 * Returns the pipeline used for feature extraction.
 *
 * @returns {Promise<import("@xenova/transformers").Pipeline>} The pipeline.
 */
async function getPipeline() {
	if (!PIPELINE) {
		PIPELINE = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
	}

	return PIPELINE;
}

/**
 * Quantises an array of FP32 numbers to INT8.
 *
 * @param {number[]} fp32Numbers - Array of FP32 numbers to be quantized.
 * @returns {number[]} - Array of corresponding INT8 values.
 */
function quantizeToINT8(fp32Numbers) {
	// For signed 8-bit integers, the range is typically -128 to 127
	const scaleFactor = 127.0;

	// Quantize the FP32 numbers to INT8
	const int8Numbers = fp32Numbers.map((fp32) => Math.round(fp32 * scaleFactor));

	return int8Numbers;
}

/**
 * Calculate the cosine similarity between two word embeddings.
 *
 * @param {number[]} embedding1 - The first word embedding array.
 * @param {number[]} embedding2 - The second word embedding array.
 * @returns {number} - The cosine similarity between the two embeddings.
 */
function cosineSimilarity(embedding1, embedding2) {
	if (embedding1.length !== embedding2.length) {
		console.log(embedding1.length, embedding2.length);
		throw new Error('Embeddings must have the same dimensionality.');
	}

	// Calculate the dot product of the two embeddings
	const dotProduct = embedding1.reduce((sum, value, index) => sum + value * embedding2[index], 0);

	// Calculate the magnitude (Euclidean norm) of each embedding
	const magnitude1 = Math.sqrt(embedding1.reduce((sum, value) => sum + value ** 2, 0));
	const magnitude2 = Math.sqrt(embedding2.reduce((sum, value) => sum + value ** 2, 0));

	// Avoid division by zero
	if (magnitude1 === 0 || magnitude2 === 0) {
		return 0;
	}

	// Calculate the cosine similarity
	const similarity = dotProduct / (magnitude1 * magnitude2);

	return similarity;
}
