import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { getFlatResult } from './ParallelHelpers';

export class Parallel implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Parallel',
		name: 'parallel',
		icon: 'file:parallel.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'AI-powered research and data extraction using Parallel',
		defaults: {
			name: 'Parallel',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'parallelApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Search',
						value: 'search',
					},
				],
				default: 'task',
			},
			// TASK OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['task'],
					},
				},
				options: [
					{
						name: 'Execute',
						value: 'execute',
						description: 'Execute a task and wait for completion',
						action: 'Execute a task',
					},
				],
				default: 'execute',
			},
			// SEARCH OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['search'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search the web',
						action: 'Search the web',
					},
				],
				default: 'search',
			},
			// TASK FIELDS
			{
				displayName: 'Input',
				name: 'input',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['execute'],
					},
				},
				default: '',
				placeholder: 'What was the GDP of France in 2023?',
				description: 'Input to the task, either text or a JSON object',
			},
			{
				displayName: 'Output Description',
				name: 'outputDescription',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['execute'],
					},
				},
				default: '',
				placeholder: 'GDP in USD for the year, formatted like "$3.1 trillion (2023)"',
				description: 'Description of the desired output from the task',
			},
			{
				displayName: 'Processor',
				name: 'processor',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['execute'],
					},
				},
				options: [
					{
						name: 'Lite',
						value: 'lite',
						description: 'Basic metadata, fallback, low latency - $5/1000 runs',
					},
					{
						name: 'Base',
						value: 'base',
						description: 'Reliable standard enrichments - $10/1000 runs',
					},
					{
						name: 'Core',
						value: 'core',
						description: 'Cross-referenced, moderately complex outputs - $25/1000 runs',
					},
					{
						name: 'Pro',
						value: 'pro',
						description: 'Exploratory web research - $100/1000 runs',
					},
					{
						name: 'Ultra',
						value: 'ultra',
						description: 'Advanced multi-source deep research - $300/1000 runs',
					},
					{
						name: 'Ultra 2x',
						value: 'ultra2x',
						description: 'Difficult deep research - $600/1000 runs',
					},
					{
						name: 'Ultra 4x',
						value: 'ultra4x',
						description: 'Very difficult deep research - $1200/1000 runs',
					},
					{
						name: 'Ultra 8x',
						value: 'ultra8x',
						description: 'The most difficult deep research - $2400/1000 runs',
					},
				],
				default: 'base',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['execute'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Output Schema',
						name: 'outputSchema',
						type: 'json',
						default: '',
						description: 'JSON schema defining the structure of the expected output',
					},
					{
						displayName: 'Metadata',
						name: 'metadata',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						options: [
							{
								displayName: 'Metadata Fields',
								name: 'metadataFields',
								values: [
									{
										displayName: 'Key',
										name: 'key',
										type: 'string',
										default: '',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
									},
								],
							},
						],
						description: 'Custom metadata to store with the run',
					},
					{
						displayName: 'Include Domains',
						name: 'includeDomains',
						type: 'string',
						default: '',
						placeholder: 'wikipedia.org,reuters.com',
						description: 'Comma-separated list of domains to include in search results',
					},
					{
						displayName: 'Exclude Domains',
						name: 'excludeDomains',
						type: 'string',
						default: '',
						placeholder: 'reddit.com,x.com',
						description: 'Comma-separated list of domains to exclude from search results',
					},
				],
			},
			// SEARCH FIELDS
			{
				displayName: 'Objective',
				name: 'objective',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['search'],
					},
				},
				default: '',
				placeholder: 'Find recent news about artificial intelligence developments',
				description: 'Natural-language description of what the web search is trying to find',
			},
			{
				displayName: 'Processor',
				name: 'searchProcessor',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['search'],
					},
				},
				options: [
					{
						name: 'Base',
						value: 'base',
						description: 'Standard search processing',
					},
					{
						name: 'Pro',
						value: 'pro',
						description: 'Advanced search processing',
					},
				],
				default: 'base',
			},
			{
				displayName: 'Additional Fields',
				name: 'searchAdditionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['search'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Search Queries',
						name: 'searchQueries',
						type: 'string',
						default: '',
						placeholder: 'artificial intelligence, machine learning, AI news',
						description: 'Comma-separated list of traditional keyword search queries',
					},
					{
						displayName: 'Max Results',
						name: 'maxResults',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 50,
						},
						default: 10,
						description: 'Maximum number of search results to return',
					},
					{
						displayName: 'Max Characters Per Result',
						name: 'maxCharsPerResult',
						type: 'number',
						typeOptions: {
							minValue: 100,
							maxValue: 10000,
						},
						default: 1000,
						description: 'Maximum number of characters to include in excerpts for each result',
					},
					{
						displayName: 'Include Domains',
						name: 'includeDomains',
						type: 'string',
						default: '',
						placeholder: 'wikipedia.org,reuters.com',
						description: 'Comma-separated list of domains to include in search results',
					},
					{
						displayName: 'Exclude Domains',
						name: 'excludeDomains',
						type: 'string',
						default: '',
						placeholder: 'reddit.com,x.com',
						description: 'Comma-separated list of domains to exclude from search results',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions & Parallel): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'task') {
					if (operation === 'execute') {
						const result = await this.executeTask(i);
						returnData.push(result);
					}
				} else if (resource === 'search') {
					if (operation === 'search') {
						const result = await this.executeSearch(i);
						returnData.push(result);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {},
						error: error.message,
						pairedItem: { item: i },
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, {
						itemIndex: i,
					});
				}
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}

	private async executeTask(
		this: IExecuteFunctions & Parallel,
		itemIndex: number,
	): Promise<IDataObject> {
		const input = this.getNodeParameter('input', itemIndex) as string;
		const outputDescription = this.getNodeParameter('outputDescription', itemIndex) as string;
		const processor = this.getNodeParameter('processor', itemIndex) as string;
		const additionalFields = this.getNodeParameter(
			'additionalFields',
			itemIndex,
			{},
		) as IDataObject;

		// Prepare task specification
		const taskSpec: IDataObject = {
			output_schema: outputDescription,
		};

		// Add custom output schema if provided
		if (additionalFields.outputSchema) {
			try {
				const customSchema = JSON.parse(additionalFields.outputSchema as string);
				taskSpec.output_schema = {
					type: 'json',
					json_schema: customSchema,
				};
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid JSON in output schema: ${error.message}`,
					{ itemIndex },
				);
			}
		}

		// Prepare request body
		const body: IDataObject = {
			input: this.tryParseJSON(input),
			processor,
			task_spec: taskSpec,
		};

		// Add metadata if provided
		if (
			additionalFields.metadata &&
			Array.isArray((additionalFields.metadata as IDataObject).metadataFields)
		) {
			const metadata: IDataObject = {};
			const metadataFields = (additionalFields.metadata as IDataObject)
				.metadataFields as IDataObject[];
			for (const field of metadataFields) {
				if (field.key && field.value) {
					metadata[field.key as string] = field.value;
				}
			}
			if (Object.keys(metadata).length > 0) {
				body.metadata = metadata;
			}
		}

		// Add source policy if provided
		const sourcePolicy = this.buildSourcePolicy(additionalFields);
		if (sourcePolicy) {
			body.source_policy = sourcePolicy;
		}

		// Create task run
		const taskRun = await this.parallelApiRequest('POST', '/v1/tasks/runs', body);
		const runId = taskRun.run_id;

		// Poll for result with increasing timeout and retry logic
		const maxAttempts = 8; // More than 7 to get over an hour total
		let attempt = 0;

		while (attempt < maxAttempts) {
			try {
				const timeout = 570;
				const result = await this.parallelApiRequest(
					'GET',
					`/v1/tasks/runs/${runId}/result?timeout=${timeout}`,
				);

				// Flatten the result for easier use in n8n
				return getFlatResult(result);
			} catch (error) {
				attempt++;

				// If it's a timeout error and we haven't exceeded max attempts, continue
				if (error.httpCode === '408' && attempt < maxAttempts) {
					continue;
				}

				// For other errors or if we've exceeded max attempts, throw
				throw error;
			}
		}

		throw new NodeOperationError(
			this.getNode(),
			`Task execution timed out after ${maxAttempts} attempts (approximately ${maxAttempts * 10} minutes)`,
			{ itemIndex },
		);
	}

	private async executeSearch(
		this: IExecuteFunctions & Parallel,
		itemIndex: number,
	): Promise<IDataObject> {
		const objective = this.getNodeParameter('objective', itemIndex) as string;
		const processor = this.getNodeParameter('searchProcessor', itemIndex) as string;
		const additionalFields = this.getNodeParameter(
			'searchAdditionalFields',
			itemIndex,
			{},
		) as IDataObject;

		// Prepare request body
		const body: IDataObject = {
			objective,
			processor,
		};

		// Add search queries if provided
		if (additionalFields.searchQueries) {
			const queries = (additionalFields.searchQueries as string)
				.split(',')
				.map((q) => q.trim())
				.filter((q) => q.length > 0);
			if (queries.length > 0) {
				body.search_queries = queries;
			}
		}

		// Add other optional fields
		if (additionalFields.maxResults) {
			body.max_results = additionalFields.maxResults;
		}
		if (additionalFields.maxCharsPerResult) {
			body.max_chars_per_result = additionalFields.maxCharsPerResult;
		}

		// Add source policy if provided
		const sourcePolicy = this.buildSourcePolicy(additionalFields);
		if (sourcePolicy) {
			body.source_policy = sourcePolicy;
		}

		return await this.parallelApiRequest('POST', '/v1beta/search', body);
	}

	private buildSourcePolicy(additionalFields: IDataObject): IDataObject | null {
		const sourcePolicy: IDataObject = {};

		if (additionalFields.includeDomains) {
			const domains = (additionalFields.includeDomains as string)
				.split(',')
				.map((d) => d.trim())
				.filter((d) => d.length > 0);
			if (domains.length > 0) {
				sourcePolicy.include_domains = domains;
			}
		}

		if (additionalFields.excludeDomains) {
			const domains = (additionalFields.excludeDomains as string)
				.split(',')
				.map((d) => d.trim())
				.filter((d) => d.length > 0);
			if (domains.length > 0) {
				sourcePolicy.exclude_domains = domains;
			}
		}

		return Object.keys(sourcePolicy).length > 0 ? sourcePolicy : null;
	}

	private tryParseJSON(input: string): string | object {
		try {
			return JSON.parse(input);
		} catch {
			return input;
		}
	}

	private async parallelApiRequest(
		this: IExecuteFunctions & Parallel,
		method: IHttpRequestMethods,
		endpoint: string,
		body?: IDataObject,
	): Promise<any> {
		const options: IRequestOptions = {
			method,
			url: `https://api.parallel.ai${endpoint}`,
			headers: {
				'Content-Type': 'application/json',
			},
			json: true,
		};

		if (body) {
			options.body = body;
		}

		try {
			return await this.helpers.requestWithAuthentication.call(this, 'parallelApi', options);
		} catch (error) {
			throw new NodeOperationError(this.getNode(), error as JsonObject);
		}
	}
}
