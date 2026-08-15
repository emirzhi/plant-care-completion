import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

// system prompt for anthropic to generate a care profile for a plant based on plant species, needs to return only a json object

const SYSTEM_PROMPT = `You are a horticulture expert. Given a plant species, produce a concise, practical care profile.

RETURN ONLY A JSON OBJECT — NO MARKDOWN, NO CODE FENCES, NO PREAMBLE OR EXPLANATION — MATCHING EXACTLY THIS SHAPE:
{
  "watering": { "interval_days_summer": int, "interval_days_winter": int, "method": string, "signs_thirsty": string, "signs_overwatered": string },
  "fertilizing": { "interval_days_growing_season": int, "interval_days_dormant": int or null, "type": string },
  "mist": { "interval_days": int or null, "method": string or null, "notes": string },
  "light": { "level": "bright indirect" | "low" | "direct", "notes": string },
  "humidity": { "level": "low" | "medium" | "high", "notes": string },
  "temperature_range_c": [int, int],
  "toxicity": { "pets": boolean, "notes": string },
  "common_problems": [ { "symptom": string, "cause": string, "fix": string } ],
  "rotation_days": int
}

Rules:
- All intervals are whole numbers of days. "interval_days_dormant" may be null if the plant should not be fertilized while dormant.
- mist is optional; if the plant doesn't benefit from misting, set "interval_days" to null.
- "temperature_range_c" is [min, max] in Celsius.
- "rotation_days" is how often to rotate the pot for even growth (use 0 if unimportant).
- "toxicity.pets" is true if the plant is toxic to pets or domestic animals.
- Provide 2 to 4 entries in "common_problems".
- Output valid JSON and nothing else.`;

export async function POST(request) {
    // first check if there is already a care profile for this plant in the database, if so return it, otherwise generate a new one using anthropic

    const admin = createAdminClient();
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { species, custom_name } = await request.json();

    // check if care profile already exists in database
    const { data: existingProfile, error: fetchError } = await admin
        .from("care_profiles")
        .select("*")
        .eq("species_scientific", species.scientific_name)
        .single();

    if (existingProfile?.profile_json) {
        return NextResponse.json(existingProfile.profile_json);
    }

    // create a zod schema to validate the response from anthropic

    const responseSchema = z.object({
        watering: z.object({
            interval_days_summer: z.number().int(),
            interval_days_winter: z.number().int(),
            method: z.string(),
            signs_thirsty: z.string(),
            signs_overwatered: z.string(),
        }),
        fertilizing: z.object({
            interval_days_growing_season: z.number().int(),
            interval_days_dormant: z.number().int().nullable(),
            type: z.string(),
        }),
        mist: z.object({
            interval_days: z.number().int().nullable(),
            method: z.string().nullable(),
            notes: z.string(),
        }),
        light: z.object({
            level: z.enum(["bright indirect", "low", "direct"]),
            notes: z.string(),
        }),
        humidity: z.object({
            level: z.enum(["low", "medium", "high"]),
            notes: z.string(),
        }),
        temperature_range_c: z.tuple([z.number().int(), z.number().int()]),
        toxicity: z.object({
            pets: z.boolean(),
            notes: z.string(),
        }),
        common_problems: z.array(
            z.object({
                symptom: z.string(),
                cause: z.string(),
                fix: z.string(),
            })
        ).min(2).max(4),
        rotation_days: z.number().int(),
    });

    const anthropicClient = getAnthropicClient();

    try {
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
                            text: `Generate a care profile for the plant species "${species.scientific_name || custom_name}". Return only a JSON object matching the specified shape.`,
                        }
                    ],
                }
            ],
        });

        const rawResponse = anthropicResponse.content[0]?.text;

        if (!rawResponse) {
            return NextResponse.json({ error: "No response from Anthropic API" }, { status: 500 });
        }

        const cleanedResponse = rawResponse.replace(/```json|```/g, "").trim();

        // validate the response using zod
        const parsedProfile = responseSchema.safeParse(JSON.parse(cleanedResponse));

        if (!parsedProfile.success) {
            return NextResponse.json({ error: "Invalid care profile format from Anthropic API", details: parsedProfile.error.errors }, { status: 500 });
        }

        // store the new care profile in the database
        const { data: insertedProfile, error: insertError } = await admin
            .from("care_profiles")
            .upsert({
                species_scientific: species.scientific_name,
                profile_json: parsedProfile.data,
                source: "ai"
            })

        return NextResponse.json(parsedProfile.data);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        return NextResponse.json({ error: "Unexpected error", details: message, }, { status: 500 });
    }
}