// change reminder hour without re-subscribing to push notifications

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reminderHour } = await request.json();

    if (!Number.isInteger(reminderHour) || reminderHour < 0 || reminderHour > 23) {
        return NextResponse.json({ error: "Invalid reminder time" }, { status: 400 });
    }

    const { error } = await supabase
        .from("profiles")
        .update({ reminder_hour: reminderHour, updated_at: new Date().toISOString() })
        .eq("id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Reminder time updated successfully" }, { status: 200 });
}