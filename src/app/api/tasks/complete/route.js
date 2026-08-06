import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await request.json();

    if (!taskId) {
        return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("care_tasks")
        .select("id, interval_days")
        .eq("id", taskId)
        .single();

    if (!data) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + data.interval_days);

    const { error: updateError } = await supabase
        .from("care_tasks")
        .update({ last_done_at: new Date(), next_due_at: nextDueDate, updated_at: new Date() })
        .eq("id", taskId);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Task marked as completed" });
}