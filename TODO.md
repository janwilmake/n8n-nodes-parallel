# TODO

- ✅ Make n8n node https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/
- ✅ Initial draft spec: https://letmeprompt.com/rules-httpsuithu-wwlvvv0
- ✅ Test this node within the n8n interface and see if it works as expected
  - ✅ Timeout: added description to processor parameter
  - ✅ Improve form for `outputSchema`
- ✅ Copy change for the APIs -- "Web Enrichment" for Task API and "Web Search" for Search API
- ✅ Publish package `n8n-nodes-parallel`
- ✅ Confirm everything is according to guidelines
  - ✅ https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/
  - ✅ https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes
  - ✅ Make sure the linter passes (in other words, make sure running `npx @n8n/scan-community-package n8n-nodes-parallel` passes).
- Test locally
  - Test long-running tasks (ultra++). If timeout is limited at 5 minutes, can we still set up the node to retry on failure, so that the result blocknig call is retried as many times as needed for task completion? Or let users know to do this? If not, let's potentially limit the UX only to the lower latency processors here (up to core for task api)
  - Test `auto` deep research
  - Test `json` with JSON schema for output
  - Test with users familiar with n8n
- Submit: https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes
- Get access to publish package and transfer to `parallel-developers`
- Test in hosted environment with early adopters (See: https://docs.n8n.io/hosting/ and https://docs.n8n.io/integrations/community-nodes/installation/gui-install/. seems I need to either self-host or get approved first)

# How to popularize the integration

Think about outsourcing this to n8n dev agency or someone with big network in n8n community

- Create blogpost / thread about n8n integration?
- with n8n influencers: work with people deep in the n8n community
- meeting Maurice
- Get it featured by n8n
- making templates and blogs
- search for n8n folks getting lot of traction

# Meeting

- transfer repo+package to `parallel-web` / `parallel-developers`?
- won't omitting 'task' from copy be confusing regarding docs? n8n ux guidelines ask using same terminology as platform
- Although provided, link to docs doesn't appear anywhere.
- source policy is found under 'additional fields' to keep initial form simple (good ux)

# Potential areas of improvement

## How to reduce TTFI (time to first integration)

- oauth
- simplify i/o
- remove points people could get confused

## to MCP or not to MCP?

- MCP tools are potentially very powerful, but hard to really setup within n8n. Not allowing MCPs reduces capability of our product, but there's too much friction to add it and no easy way to test, likely resulting in frustration with low-coders

## Chat completions

Add `/chat/completions` with text output.

## Better instructions and guiding of people

- Auto mode likely isn't preferable here since we are flattening the output and auto-mode creates deeply nested result
- Idea: link to playground for creating output schema and recommended processor using ingest API
- Ensure link to docs are working. If not, find best ways to do it.

## Avoiding Timeout

The max timeout for a workfow depends on where the server is hosted. The user can configure the timeout for a particular workflow, but the server also has a max timeout configured, which is defaulted to 5 minutes on n8n hosted. https://www.reddit.com/r/n8n/comments/1kye4fx/please_increase_timeout_limit_for_deep_research/

If the timeout is just up to 5 minutes, only the "lite", "base", and "core" processors would work. The most important aspect is that we should inform the user about this as soon as possible. There are a few potential ways to do this:

- ✅ Clarify timeout in description, which is available via an '(i)' tooltip
- ❌ Respond with an error if a processor is chosen that may not have enough time given the timeout (for this, we need to know the workflow timeout, but it's unclear how this can be found)

## Authentication

Example authentication via oauth2: https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/credentials/BoxOAuth2Api.credentials.ts.

Authentication via oauth is may significantly reduce churn, especially for people that don't have an account with Parallel yet. [Deep research that confirms this](https://claude.ai/public/artifacts/52c28da0-85b2-4fc8-9ca9-712cf949cbbb)

N8n UX guidelines recommend using oauth if available: https://docs.n8n.io/integrations/creating-nodes/build/reference/ux-guidelines/#oauth
