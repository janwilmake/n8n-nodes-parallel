# TODO

- ✅ Make n8n node https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/
- ✅ Initial draft spec: https://letmeprompt.com/rules-httpsuithu-wwlvvv0
- ✅ Test this node within the n8n interface and see if it works as expected
  - ✅ Timeout: added description to processor parameter
  - ✅ Improve form for `outputSchema`
  - Test long-running tasks (ultra)
  - Test auto deep research
  - Test with custom JSON schema
- Publish package `n8n-nodes-parallel`
- Test in hosted environment
  - long running tasks work?
  - everything smooth
  - test with users familiar with n8n
- Create blogpost / thread about n8n integration?

# Potential areas of improvement

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
