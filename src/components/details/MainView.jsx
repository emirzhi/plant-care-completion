"use client";

import { useState } from "react";

export default function MainView({ plant }) {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 bg-white to-green-50 px-6 py-10">
            <h1 className="text-3xl font-bold">{plant.name}</h1>
            <p className="text-gray-600">{plant.species_common}</p>

            <div className="mt-4">
                <button
                    className={`mr-2 px-4 py-2 rounded-md ${activeTab === "overview" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setActiveTab("overview")}
                >
                    Overview
                </button>
                <button
                    className={`mr-2 px-4 py-2 rounded-md ${activeTab === "care" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setActiveTab("care")}
                >
                    Care Instructions
                </button>
            </div>

            {activeTab === "overview" && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold">Overview</h2>
                    <p>{plant.description}</p>
                </div>
            )}

            {activeTab === "care" && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold">Care Instructions</h2>
                    <p>{plant.care_profile?.profile_json}</p>
                </div>
            )}
        </main>
    );
}
