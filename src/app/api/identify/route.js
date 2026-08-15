// identifying a plant based on an image using anthropic sdk

import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// system prompt for anthropic to identify a plant based on an image, needs to return only a json object

const SYSTEM_PROMPT = `You are a botanist specializing in plant identification. You are shown a single photo of a plant and must identify the most likely species.

RETURN ONLY A JSON OBJECT — NO MARKDOWN, NO CODE FENCES, NO PREAMBLE OR EXPLANATION — MATCHING EXACTLY THIS SHAPE:
{
  "primary": { "common_name": string, "scientific_name": string, "confidence": number, "type": "houseplant" | "succulent" | "cacti" | "flowering" | "tree" | "shrub" | "herb" | "edible" | "fern" | "palm" | "other" },
  "alternatives": [ { "common_name": string, "scientific_name": string, "confidence": number, "type": "houseplant" | "succulent" | "cacti" | "flowering" | "tree" | "shrub" | "herb" | "edible" | "fern" | "palm" | "other" } ],
  "visible_health_issues": [ string ],
  "note": string (optional)
}

Rules:
- "confidence" is a decimal between 0 and 1.
- "primary" is your single best guess. "alternatives" holds up to 2 other plausible species, most likely first.
- "type" is the broadest applicable category from the listed enum. Use "houseplant" for foliage plants typically grown indoors; "succulent" for non-cactus succulents (e.g. Aloe, Jade, Echeveria); "cacti" for cacti; "flowering" when blooms are the main feature; "tree" or "shrub" for woody outdoor specimens; "herb" for culinary/medicinal herbs (basil, mint, lavender); "edible" for fruit/vegetable crops; "fern" for ferns; "palm" for palms; "other" only when none fit.
- "visible_health_issues" lists visible problems (e.g. "yellowing lower leaves", "brown leaf tips", "signs of pests"). Use an empty array if none are visible.
- If the image contains no identifiable plant, set primary.confidence to 0, use primary.common_name "Unknown" with scientific_name "" and type "other", leave alternatives empty, and explain in "note".
- Prefer widely-kept houseplant species.
- Output valid JSON and nothing else.`

export async function POST(request) {
    // use zod to validate the response from anthropic

    const responseSchema = z.object({
        primary: z.object({
            common_name: z.string(),
            scientific_name: z.string(),
            confidence: z.number().min(0).max(1),
            type: z.enum(["houseplant", "succulent", "cacti", "flowering", "tree", "shrub", "herb", "edible", "fern", "palm", "other"]),
        }),
        alternatives: z.array(
            z.object({
                common_name: z.string(),
                scientific_name: z.string(),
                confidence: z.number().min(0).max(1),
                type: z.enum(["houseplant", "succulent", "cacti", "flowering", "tree", "shrub", "herb", "edible", "fern", "palm", "other"]),
            })
        ).max(2),
        visible_health_issues: z.array(z.string()),
        note: z.string().optional(),
    });

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { image } = await request.json();

        if (!image) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        const anthropicClient = getAnthropicClient();

        const anthropicResponse = await anthropicClient.messages.create({
            model: process.env.ANTHROPIC_AI_MODEL,
            max_tokens: 1024,
            system: [
                {
                    type: "text",
                    text: SYSTEM_PROMPT,
                    cache_control: { type: "ephemeral" }
                }
            ],
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Identify the plant in this image. Return only a JSON object matching the specified shape.`,
                            cache_control: { type: "ephemeral" }
                        },
                        {
                            type: "image",
                            source: { type: "base64", media_type: "image/jpeg", data: image },
                        }
                    ]
                }
            ]
        })

        const rawResponse = anthropicResponse.content[0].text;
        // remove markdown code fences if present
        const cleanedResponse = rawResponse.replace(/```json|```/g, "").trim();

        const parsedResponse = responseSchema.parse(JSON.parse(cleanedResponse));
        return NextResponse.json(parsedResponse);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        return NextResponse.json({ error: "Unexpected error", details: message, }, { status: 500 });
    }
}