"use client";

import { useState } from "react";
import Image from "next/image";
import Tasks from "./Tasks";
import PlantNeeds from "./PlantNeeds";
import Link from "next/link";

export default function MainView({ plant }) {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 bg-white to-green-50 px-20 py-10">
            <header className="mb-10 flex items-center justify-between rounded-full bg-white px-6 py-3 shadow-sm sticky top-0 z-10">
                <Link href="/plants" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    &larr; Back to Plants
                </Link>
            </header>

            <div className="grid lg:grid-cols-[380px_1fr] grid-cols-1 gap-6">

                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {plant.species_common} ({plant.species_scientific})
                        </h1>
                    </div>


                    <div className="relative h-[350px] overflow-hidden rounded-3xl">
                        <Image
                            src={plant.image_url}
                            alt={plant.species_common}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>


                <div className="rounded-3xl bg-white p-5 shadow-sm">

                    <h2 className="mb-2 text-xl font-semibold text-black">
                        Care Tasks
                    </h2>
                    <p className="mb-4 text-sm text-gray-500">
                        Here are the upcoming care tasks for your plant. Make sure to complete them on time to keep your plant healthy and thriving.
                    </p>

                    <div className="space-y-3">

                        <Tasks tasks={plant.tasks} />
                        <PlantNeeds needs={plant.care_profile.profile_json} />

                    </div>

                </div>


                {/* Details */}
                {/* <section className="rounded-3xl bg-white p-5 shadow-sm">

                    <h2 className="mb-4 text-xl font-semibold text-black">
                        Plant Details
                    </h2>


                    <div className="divide-y divide-gray-100">

                        {details.map((detail, index) => (
                            <div
                                key={index}
                                className="flex justify-between py-4"
                            >

                                <span className="text-gray-500">
                                    {detail.label}
                                </span>


                                <span className="font-medium text-gray-900">
                                    {detail.value}
                                </span>

                            </div>
                        ))}

                    </div>

                </section> */}


            </div>
        </main>
    );
}
