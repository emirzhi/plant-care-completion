import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, interval_days, paused } = await request.json();

    if (!taskId) {
        return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("care_tasks")
        .select("id, interval_days, paused")
        .eq("id", taskId)
        .single();

    if (!data) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updateData = {};

    if (interval_days !== undefined) {
        updateData.interval_days = interval_days;
    }
    
    if (paused !== undefined) {
        updateData.paused = paused;
    }

    if (paused === false && data.paused === true) {
        updateData.next_due_at = new Date(Date.now() + (updateData.interval_days || data.interval_days) * 24 * 60 * 60 * 1000).toISOString();
    }

    const { error: updateError } = await supabase
        .from("care_tasks")
        .update(updateData)
        .eq("id", taskId);
    
    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Task updated successfully" });    
}