"use client"

import { useState } from 'react';
import PlantsGrid from './PlantsGrid';
import Link from 'next/link';
import { FiSettings } from 'react-icons/fi';
import SettingsModal from '../settings/SettingsModal';

export default function MainView({ plants = [], profile }) {
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 bg-white to-emerald-50 px-6 py-10">
            <div className='flex gap-4 items-center mb-10'>
                <header className='w-full flex items-center justify-between rounded-full bg-white px-6 py-3 shadow-sm sticky top-0 z-10'>
                    <h1 className='text-2xl font-bold text-gray-900'>My Plants</h1>
                    <Link href="/plants/new" className='rounded-full cursor-pointer bg-emerald-400 px-4 py-2 text-white hover:bg-emerald-500'>
                        Add New Plant
                    </Link>
                </header>
                <button className='cursor-pointer' onClick={() => setSettingsOpen(true)}>
                    <FiSettings className='text-black hover:text-stone-500' size={30} />
                </button>
            </div>

            <div>
                <PlantsGrid plants={plants} />
                <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} profile={profile} />

            </div>
        </main>
    );
}