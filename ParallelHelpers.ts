type ConfidenceLevel = 'low' | 'medium' | 'high' | null;

interface Citation {
	title?: string;
	url: string;
	excerpts?: string[];
}

interface FieldBasis {
	field: string;
	citations: Citation[];
	reasoning: string;
	confidence?: ConfidenceLevel;
}

interface TaskRunResult {
	run: any;
	output: {
		basis: FieldBasis[];
		type: 'json' | 'text';
		content: any;
		output_schema?: any;
	};
}

/**
 * Generates a URL with scroll-to-text fragments if excerpts are available
 */
function getUrl(citation: Citation): string {
	const { url, excerpts } = citation;

	if (!excerpts || excerpts.length === 0) {
		return url;
	}

	// Filter out empty excerpts and encode them for URL
	const validExcerpts = excerpts
		.filter((excerpt) => excerpt.trim().length > 0)
		.map((excerpt) => {
			const withoutDots = excerpt.endsWith('...') ? excerpt.slice(0, excerpt.length - 3) : excerpt;
			return encodeURIComponent(withoutDots.trim());
		});

	if (validExcerpts.length === 0) {
		return url;
	}

	// Use the scroll-to-text fragment syntax
	// Format: :~:text=excerpt1&text=excerpt2&text=excerpt3
	const textFragments = validExcerpts.map((excerpt) => `text=${excerpt}`).join('&');

	return `${url}#:~:${textFragments}`;
}

/**
 * Creates a markdown-formatted evidence string from field basis information
 */
function createEvidence(basis: FieldBasis): string {
	let evidence = '';

	// Add field name and confidence
	evidence += `**Field:** ${basis.field}\n`;
	if (basis.confidence) {
		const confidenceEmoji = {
			high: '🟢',
			medium: '🟡',
			low: '🔴',
		}[basis.confidence];
		evidence += `**Confidence:** ${confidenceEmoji} ${basis.confidence}\n`;
	}
	evidence += '\n';

	// Add reasoning
	if (basis.reasoning) {
		evidence += `**Reasoning:** ${basis.reasoning}\n`;
	}

	// Add citations
	if (basis.citations && basis.citations.length > 0) {
		evidence += '\n**Sources:**\n';

		basis.citations.forEach((citation, index) => {
			const title = citation.title || citation.url;
			const url = getUrl(citation);
			evidence += `${index + 1}. [${title}](${url})\n`;
		});
	}

	return evidence.trim();
}

/**
 * Flattens a task result into a single-level object with confidence and evidence data.
 *
 * This utility transforms nested task results with basis information into a flat object
 * structure that's easier to work with in automation platforms like n8n, Zapier, or
 * similar tools that prefer flat key-value structures over nested objects.
 *
 * For each property in the original result, it adds two additional properties:
 * - `{key}.confidence`: The confidence level ("low", "medium", "high", or null)
 * - `{key}.evidence`: A markdown-formatted string containing field description,
 *   confidence level with emoji, reasoning, and clickable source citations
 *
 * The evidence citations use scroll-to-text URL fragments (#:~:text=...) to link
 * directly to relevant excerpts when available.
 */
export function getFlatResult(result: TaskRunResult): any {
	const { output } = result;

	// Create a basis lookup map for quick access
	const basisMap = new Map<string, FieldBasis>();
	output.basis.forEach((basis) => {
		basisMap.set(basis.field, basis);
	});

	// For text output, return simple structure
	if (output.type === 'text') {
		const basis = basisMap.get('output') || {
			field: 'output',
			citations: [],
			reasoning: 'Text output from task',
			confidence: null,
		};

		return {
			output: output.content,
			'output.confidence': basis.confidence,
			'output.evidence': createEvidence(basis),
		};
	}

	// For JSON output, flatten the structure
	const flatResult: Record<string, any> = {};

	if (
		typeof output.content === 'object' &&
		output.content !== null &&
		!Array.isArray(output.content)
	) {
		// Handle object content - iterate through keys in order and add evidence after each
		Object.entries(output.content).forEach(([key, value]) => {
			flatResult[key] = value;

			const basis = basisMap.get(key);
			if (basis) {
				flatResult[`${key}.confidence`] = basis.confidence;
				flatResult[`${key}.evidence`] = createEvidence(basis);
			}
		});
	} else {
		// Handle non-object content (array, primitive)
		flatResult.content = output.content;

		const basis = basisMap.get('content') || basisMap.get('output');
		if (basis) {
			flatResult['content.confidence'] = basis.confidence;
			flatResult['content.evidence'] = createEvidence(basis);
		}
	}

	return flatResult;
}
