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
        payload = { title: "Plant Care Completion", body: event.data.text() };
    }

    const title = payload.title || "Plant Care Completion";
    const options = {
        body: payload.body || "You have a new notification.",
        icon: "/icons/image_512x512.png",
        badge: "/icons/image_512x512.png",
        data: payload.data || {},
        tag: payload.tag || "plant-care-completion-notification",
    };


})