"use client"

import { useState } from 'react';
import PlantsGrid from './PlantsGrid';

export default function MainView({ plants = [] }) {

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 bg-white to-green-50 px-6 py-10">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-gray-900">
                    Your Plant Collection
                </h1>

                <p className="mt-2 text-gray-500">
                    Explore and manage your plants.
                </p>
            </div>

            <div>
                <PlantsGrid plants={plants} />
            </div>
        </main>
    );
}