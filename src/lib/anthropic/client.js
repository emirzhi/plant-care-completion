import Anthropic from "@anthropic-ai/sdk";

export function getAnthropicClient() {
    const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    return client;
}