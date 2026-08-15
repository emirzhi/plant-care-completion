import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body) {
        return NextResponse.json({ error: "Request body is required" }, { status: 400 });
    }

    const { plant, careSettings, plantTasks, base64Photo } = body;

    const { data: img, error: imgError } = await supabase.storage
        .from("plant-photos")
        .upload(`${user.id}/${crypto.randomUUID()}.jpg`, Buffer.from(base64Photo, "base64"), {
            contentType: "image/jpeg",
            upsert: true,
        });

    console.log("plant tasks", plantTasks);

    try {
        const { data, error } = await supabase
            .from("plants")
            .insert({
                user_id: user.id,
                species_scientific: plant.plant_data.scientific_name,
                species_common: plant.plant_data.common_name || null,

                photo_url: img?.path || null,

                type: plant.plant_data.type || "other",

                health_issues: careSettings.common_problems || null,

                location: null,
                acquired_at: null,
                nickname: plant.custom_name || null,
            })
            .select("id")
            .single();

        if (error) {
            console.error("Error inserting plant:", error);
            return NextResponse.json({ error: "Failed to save plant" }, { status: 500 });
        }

        const { data: taskData, error: taskError } = await supabase
            .from("care_tasks")
            .insert(
                plantTasks.map((task) => ({
                    task_type: task.task_type,
                    interval_days: task.interval_days,
                    paused: task.paused,
                    next_due_at: new Date(Date.now() + task.interval_days * 24 * 60 * 60 * 1000).toISOString(),
                    plant_id: data.id,
                }))
            )

        return NextResponse.json({ message: "Plant and tasks saved successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error saving plant and tasks:", error);
        return NextResponse.json({ error: "Failed to save plant and tasks" }, { status: 500 });
    }
}