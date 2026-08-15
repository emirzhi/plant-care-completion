"use client"

import { useMemo, useState } from 'react';
import PlantsGrid from './PlantsGrid';
import Link from 'next/link';
import { FiSettings } from 'react-icons/fi';
import { FaHome, FaSeedling } from 'react-icons/fa';
import {
    PiPottedPlantFill,
    PiCactusFill,
    PiFlowerFill,
    PiTreeFill,
    PiLeafFill,
    PiTreePalmFill,
} from 'react-icons/pi';
import SettingsModal from '../settings/SettingsModal';

const tabs = [
    { label: "All Plants", icon: PiPottedPlantFill },
    { label: "Houseplants", icon: FaHome },
    { label: "Succulents & Cacti", icon: PiCactusFill },
    { label: "Flowering Plants", icon: PiFlowerFill },
    { label: "Trees & Shrubs", icon: PiTreeFill },
    { label: "Herbs & Edibles", icon: PiLeafFill },
    { label: "Ferns & Palms", icon: PiTreePalmFill },
    { label: "Other", icon: FaSeedling },
];

export const filterMap = {
    "All Plants": null,
    "Houseplants": ["houseplant"],
    "Succulents & Cacti": ["succulent", "cactus"],
    "Flowering Plants": ["flowering"],
    "Trees & Shrubs": ["tree", "shrub"],
    "Herbs & Edibles": ["herb", "edible"],
    "Ferns & Palms": ["fern", "palm"],
    "Other": ["other"],
};

export default function MainView({ plants = [], profile }) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("All Plants");

    const filteredPlants = useMemo(() => {
        const types = filterMap[activeTab];
        if (!types) return plants;

        return plants.filter((plant) => types.includes((plant.type || "other").toLowerCase()));
    }, [plants, activeTab]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 bg-white to-emerald-50 px-6 py-10">
            <div className='flex gap-4 items-center mb-10'>
                <header className='w-full rounded-3xl bg-white px-6 py-3 shadow-sm sticky top-0 z-10'>
                    <div className='flex items-center gap-5'>
                        <h1 className='text-2xl font-bold text-gray-900'>My Plants</h1>

                        <div className='mt-3 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden'>
                            {tabs.map(({ label, icon: Icon }) => {
                                const isActive = activeTab === label;

                                return (
                                    <button
                                        key={label}
                                        onClick={() => setActiveTab(label)}
                                        aria-pressed={isActive}
                                        className={`flex flex-shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${isActive
                                            ? "bg-emerald-400 text-white hover:bg-emerald-500"
                                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </header>

                <Link href="/plants/new" className='rounded-full cursor-pointer uppercase font-lg font-bold bg-emerald-400 px-4 py-2 text-white hover:bg-emerald-500'>
                    New
                </Link>
                <button className='cursor-pointer py-3' onClick={() => setSettingsOpen(true)}>
                    <FiSettings className='text-black hover:text-stone-500' size={30} />
                </button>
            </div>

            <div>
                <PlantsGrid plants={filteredPlants} />
                <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} profile={profile} />

            </div>
        </main>
    );
}
