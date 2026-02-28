# Rule: Always Use Current Stable AI Models

## 1. The Problem
AI provider model IDs change frequently. Using hardcoded, outdated model strings (e.g. `gemini-2.0-flash`, `gpt-3.5-turbo`) causes silent failures or 404 errors when models are deprecated.

## 2. The Rule
When using any AI SDK model string, you **MUST**:

1. **Verify the model is still active** by checking the provider's official model list before using it:
   - **Google / Gemini**: https://ai.google.dev/gemini-api/docs/models
   - **Vercel AI SDK Google provider**: https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai
   - **OpenAI**: https://platform.openai.com/docs/models
   - **Anthropic**: https://docs.anthropic.com/en/docs/about-claude/models

2. **Prefer GA (Generally Available) stable models** over experimental/preview variants in production code.

3. **As of February 2026 (current date), the correct stable models are:**

| Provider     | Preferred Fast/Flash Model   | Preferred Smart Model       |
|--------------|------------------------------|------------------------------|
| Google       | `gemini-2.5-flash`           | `gemini-2.5-pro`             |
| OpenAI       | `gpt-4o-mini`                | `gpt-4o`                     |
| Anthropic    | `claude-3-5-haiku-20241022`  | `claude-3-5-sonnet-20241022` |

4. **If a model returns a 404 or deprecation error**, immediately update to the latest stable equivalent — do not retry with the same model.

## 3. Self-Healing Enforcement
Per the Zero-Intervention Autonomy rule, if a model API call fails due to a deprecated model:
- Check the provider docs
- Update the model string autonomously
- Do not wait for user input
