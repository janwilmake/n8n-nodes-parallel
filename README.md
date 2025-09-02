# n8n-nodes-parallel

This is an n8n community node for [Parallel AI](https://parallel.ai/). It enables AI-powered research and data extraction directly within your n8n workflows.

Parallel AI specializes in web research and structured data extraction, making it perfect for automating research tasks, competitive analysis, lead generation, and content enrichment.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Task Resource

- **Execute**: Run AI-powered research and data extraction tasks
  - Support for all processor types (lite, base, core, pro, ultra variants)
  - Automatic polling with retry logic for long-running tasks
  - Flattened output structure with confidence scores and evidence
  - Custom output schemas and metadata support
  - Source filtering capabilities

### Search Resource

- **Search**: Perform intelligent web searches
  - Natural language objectives
  - Traditional keyword queries support
  - Source domain filtering
  - Configurable result limits and excerpt lengths

## Credentials

You need a Parallel API key to use this node:

1. Sign up at [platform.parallel.ai](https://platform.parallel.ai/)
2. Generate an API key from your dashboard
3. Add the API key to n8n's credential manager

## Features

- **Intelligent Polling**: Automatically handles long-running tasks with progressive timeout increases (up to ~1 hour total)
- **Flattened Output**: Results are automatically flattened using the parallel-flatten helper for easier use in n8n workflows
- **Evidence & Confidence**: Each output field includes confidence levels and clickable evidence with source citations
- **Source Control**: Include or exclude specific domains from research results
- **Multiple Processors**: Choose the right processor for your task complexity and budget
- **Error Handling**: Comprehensive error handling with optional continue-on-fail support

## Resources

- [Parallel AI Documentation](https://docs.parallel.ai/)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Processor Selection Guide](https://docs.parallel.ai/task-api/core-concepts/choose-a-processor)
- [Test your node](https://docs.n8n.io/integrations/creating-nodes/test/run-node-locally/)

## License

[MIT](LICENSE.md)
