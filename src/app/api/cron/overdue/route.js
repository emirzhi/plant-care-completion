import { NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
)

const LABELS = { water: "watering", mist: "misting", rotate: "rotating", fertilize: "fertilizing" };

function localHour(timezone) {
    try {
        return Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: timezone }).format(new Date()));
    } catch (error) {
        return Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23" }).format(new Date()));
    }
}

export async function GET(request) {
    if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const now = new Date();
    const cooldown = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago

    const { data: profiles, error: profileError } = await admin.from("profiles").select("id, timezone, push_subscription, reminder_hour").not("push_subscription", "is", null);

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
        return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
    }

    const due = profiles.filter(profile => {
        const hour = localHour(profile.timezone);
        return profile.reminder_hour === hour;
    });

    if (!due.length) {
        return NextResponse.json({ message: "No due reminders" }, { status: 200 });
    }

    const { data: tasks, error: taskError } = await admin.from("care_tasks")
        .select("id, task_type, next_due_at, plants!inner(id, nickname, species_common, user_id)")
        .eq("paused", false)
        .lte("next_due_at", now.toISOString())
        .in("plants.user_id", due.map(profile => profile.id))
        .or(`last_notified_at.is.null,last_notified_at.lte.${cooldown.toISOString()}`);

    if (taskError) {
        console.error("Error fetching tasks:", taskError);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }

    const byUser = new Map();

    for (const task of tasks) {
        const userId = task.plants.user_id;
        if (!byUser.has(userId)) {
            byUser.set(userId, []);
        }
        byUser.get(userId).push(task);
    }

    let notificationsSent = 0;

    for (const profile of due) {
        const userTasks = byUser.get(profile.id) || [];
        if (!userTasks.length) continue;

        const firstTask = userTasks[0];
        const plantName = firstTask.plants.nickname || firstTask.plants.species_common || "your plant";
        const body = userTasks.length === 1
            ? `It's time to ${LABELS[firstTask.task_type]} ${plantName}.`
            : `You have ${userTasks.length} plants that need attention.`;

        const payload = JSON.stringify({
            title: "Your plants need attention!",
            body,
            tag: "overdue-care",
            data: { url: userTasks.length === 1 ? `/plants/${firstTask.plants.id}` : "/plants" }
        });

        try {
            await webpush.sendNotification(profile.push_subscription, payload);
            notificationsSent++;

            await admin.from("care_tasks")
                .update({ last_notified_at: new Date().toISOString() })
                .in("id", userTasks.map(task => task.id));
        } catch (error) {
            console.error(`Error sending notification to user ${profile.id}:`, error);

            if (error.statusCode === 410 || error.statusCode === 404) {
                await admin.from("profiles")
                    .update({ push_subscription: null })
                    .eq("id", profile.id);
            }
        }

    }

    return NextResponse.json({ message: `Notifications sent: ${notificationsSent}` }, { status: 200 });

}