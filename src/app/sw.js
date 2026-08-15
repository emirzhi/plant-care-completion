import { Serwist, StaleWhileRevalidate, CacheFirst } from 'serwist';
import { defaultCache } from "@serwist/next/worker";

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
    if (!event.data) return;

    let payload = {};
    try {
        payload = event.data.json();
    } catch {
        payload = { title: "Plant Care", body: event.data.text() };
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: "/icons/image_512x512.png",
            badge: "/icons/image_512x512.png",
            data: payload.data || {},
            tag: payload.tag || "overdue-care",
            renotify: true,
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || "/plants";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            const existing = clientList.find((c) => c.url.includes(new URL(urlToOpen, self.location.origin).pathname));

            if (existing) return existing.focus();
            return self.clients.openWindow(urlToOpen);
        })
    );
})