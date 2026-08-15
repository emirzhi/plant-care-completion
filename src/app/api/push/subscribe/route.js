import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscription, timezone, reminderHour } = await request.json();

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 });
    }

    const updateData = {
        push_subscription: subscription,
        updated_at: new Date().toISOString(),
    }

    if (timezone && Intl.supportedValuesOf('timeZone').includes(timezone)) {
        updateData.timezone = timezone;
    }

    if (Number.isInteger(reminderHour) && reminderHour >= 0 && reminderHour <= 23) {
        updateData.reminder_hour = reminderHour;
    }

    const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Subscription updated successfully" }, { status: 200 });
}