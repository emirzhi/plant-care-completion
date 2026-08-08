"use client"

import { useState } from 'react';
import PlantsGrid from './PlantsGrid';
import Link from 'next/link';

export default function MainView({ plants = [] }) {

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 bg-white to-green-50 px-6 py-10">
            <header className='mb-10 flex items-center justify-between rounded-full bg-white px-6 py-3 shadow-sm sticky top-0 z-10'>
                <h1 className='text-2xl font-bold text-gray-900'>My Plants</h1>
                <Link href="/plants/new" className='rounded-full cursor    -pointer bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600'>
                    Add New Plant
                </Link>
            </header>

            <div>
                <PlantsGrid plants={plants} />
            </div>
        </main>
    );
}