"use client";

import { useEffect, useRef, useState } from "react";
import { FiX, FiBell, FiBellOff, FiCheck, FiAlertCircle, FiSmartphone } from "react-icons/fi";

const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = window.atob(base64);

    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        output[i] = raw.charCodeAt(i);
    }
    return output;
};

const formatHour = (hour) => {
    const suffix = hour < 12 ? "AM" : "PM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:00 ${suffix}`;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// navigator.serviceWorker.ready never settles when no worker is registered
// (serwist is disabled in dev), so don't let the modal hang on Checking
const readyWithTimeout = (ms = 3000) =>
    Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error("no-service-worker")), ms)),
    ]);

export default function SettingsModal({ isOpen, onClose, profile }) {
    // "checking" | "ok" | "unsupported" | "needs-install" | "no-worker"
    const [support, setSupport] = useState("checking");
    const [permission, setPermission] = useState("default");
    const [subscribedHere, setSubscribedHere] = useState(false);
    const [reminderHour, setReminderHour] = useState(profile?.reminder_hour ?? 9);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    const dialogRef = useRef(null);

    const enabledElsewhere = Boolean(profile?.push_subscription) && !subscribedHere;

    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;

        const check = async () => {
            const hasPush =
                "serviceWorker" in navigator &&
                "PushManager" in window &&
                "Notification" in window;

            if (!hasPush) {
                const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
                const standalone =
                    window.matchMedia("(display-mode: standalone)").matches ||
                    window.navigator.standalone === true;

                // iOS only exposes PushManager once the app is on the Home Screen
                if (!cancelled) setSupport(isIOS && !standalone ? "needs-install" : "unsupported");
                return;
            }

            if (!cancelled) setPermission(Notification.permission);

            try {
                const registration = await readyWithTimeout();
                const subscription = await registration.pushManager.getSubscription();
                if (cancelled) return;

                setSubscribedHere(Boolean(subscription));
                setSupport("ok");
            } catch {
                if (!cancelled) setSupport("no-worker");
            }
        };

        check();
        return () => {
            cancelled = true;
        };
    }, [isOpen]);

    const handleEnable = async () => {
        setBusy(true);
        setError(null);

        try {
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set.");
            }

            // must stay inside the click handler — Safari rejects a detached request
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result !== "granted") {
                setBusy(false);
                return;
            }

            const registration = await readyWithTimeout();
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey),
                });
            }

            const response = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    reminderHour,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || "Failed to save subscription.");
            }

            setSubscribedHere(true);
            setSaved(true);
        } catch (err) {
            setError(
                err.message === "no-service-worker"
                    ? "No service worker is registered. Run a production build to test notifications."
                    : err.message
            );
        } finally {
            setBusy(false);
        }
    };

    const handleDisable = async () => {
        setBusy(true);
        setError(null);

        try {
            const registration = await readyWithTimeout();
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
            }

            const response = await fetch("/api/push/unsubscribe", { method: "POST" });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || "Failed to remove subscription.");
            }

            setSubscribedHere(false);
            setSaved(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleHourChange = async (hour) => {
        const previous = reminderHour;

        setReminderHour(hour);
        setError(null);
        setSaved(false);

        try {
            const response = await fetch("/api/profile/reminder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reminderHour: hour }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || "Failed to update reminder time.");
            }

            setSaved(true);
        } catch (err) {
            setReminderHour(previous);
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (!dialogRef.current?.contains(e.target)) onClose();
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-modal-title"
                className="max-h-[90vh] w-full max-w-lg space-y-6 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-lg"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 id="settings-modal-title" className="text-lg font-semibold text-stone-900">
                            Settings
                        </h2>
                        <p className="text-sm text-stone-500">{profile?.email}</p>
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Close settings"
                        className="cursor-pointer rounded-full bg-stone-100 p-2 text-stone-600 transition hover:bg-stone-200"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-stone-900">Notifications</h3>
                        <span className="text-sm text-stone-600 italic">
                            Get a reminder when your plants have overdue care tasks.
                        </span>
                    </div>

                    {support === "checking" && (
                        <p className="text-sm text-stone-500">Checking this device...</p>
                    )}

                    {support === "unsupported" && (
                        <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
                            <FiAlertCircle className="mt-0.5 flex-shrink-0 text-stone-500" />
                            <p className="text-sm text-stone-600">
                                This browser doesn&apos;t support push notifications.
                            </p>
                        </div>
                    )}

                    {support === "needs-install" && (
                        <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
                            <FiSmartphone className="mt-0.5 flex-shrink-0 text-stone-500" />
                            <p className="text-sm text-stone-600">
                                On iPhone, add Plant Care to your Home Screen first &mdash; tap Share,
                                then <span className="font-medium">Add to Home Screen</span>. Then open it
                                from there to turn notifications on.
                            </p>
                        </div>
                    )}

                    {support === "no-worker" && (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <FiAlertCircle className="mt-0.5 flex-shrink-0 text-amber-500" />
                            <p className="text-sm text-amber-700">
                                No service worker is registered on this page. Notifications only work in a
                                production build.
                            </p>
                        </div>
                    )}

                    {support === "ok" && (
                        <>
                            {permission === "denied" ? (
                                <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
                                    <FiBellOff className="mt-0.5 flex-shrink-0 text-stone-500" />
                                    <p className="text-sm text-stone-600">
                                        Notifications are blocked for this site. Re-allow them in your browser
                                        settings, then come back.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${subscribedHere
                                            ? "bg-emerald-100 text-emerald-600"
                                            : "bg-stone-200 text-stone-500"
                                            }`}
                                    >
                                        {subscribedHere ? <FiBell size={20} /> : <FiBellOff size={20} />}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="font-medium text-stone-900">
                                            {subscribedHere ? "On for this device" : "Off"}
                                        </span>
                                        <span className="text-sm text-stone-500">
                                            {subscribedHere
                                                ? "You'll be reminded about overdue tasks."
                                                : "Turn on to get overdue care reminders."}
                                        </span>
                                    </div>

                                    <div className="ml-auto">
                                        {subscribedHere ? (
                                            <button
                                                onClick={handleDisable}
                                                disabled={busy}
                                                className="cursor-pointer rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {busy ? "..." : "Turn off"}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleEnable}
                                                disabled={busy}
                                                className="cursor-pointer rounded-lg border border-emerald-400 bg-emerald-400 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-400"
                                            >
                                                {busy ? "..." : "Turn on"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {enabledElsewhere && permission !== "denied" && (
                                <p className="text-sm text-stone-500 italic">
                                    Notifications are currently set up on another device. Turning them on here
                                    will move them to this one.
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div className="space-y-4 pt-2">
                    <div>
                        <h3 className="text-lg font-semibold text-stone-900">Reminder time</h3>
                        <span className="text-sm text-stone-600 italic">
                            Sent once a day, in your local time.
                        </span>
                    </div>

                    <label className="block">
                        <span className="text-black">Send reminders at</span>
                        <select
                            value={reminderHour}
                            onChange={(e) => handleHourChange(Number(e.target.value))}
                            className="w-full rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            {HOURS.map((hour) => (
                                <option key={hour} value={hour}>
                                    {formatHour(hour)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <p className="text-sm text-stone-500">
                        Timezone: {profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </p>
                </div>

                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <FiAlertCircle className="mt-0.5 flex-shrink-0 text-red-500" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {saved && !error && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <FiCheck size={16} />
                        Saved
                    </div>
                )}
            </div>
        </div>
    );
}
