"use client";

import { useState } from "react";
import NeedRow from "./NeedRow";
import { TfiArrowCircleDown, TfiArrowCircleUp } from "react-icons/tfi";
import { FiDroplet, FiSun, } from "react-icons/fi";
import { PiPawPrint } from "react-icons/pi";
import { CiCloud } from "react-icons/ci";
import { PiSprayBottleBold } from "react-icons/pi";

const icons = {
    water: FiDroplet,
    mist: PiSprayBottleBold,
    light: FiSun,
    humidity: CiCloud,
    toxicity: PiPawPrint,
};

export default function PlantNeeds({ needs }) {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleAccordion = (index) => setExpandedIndex(expandedIndex === index ? null : index);

    return (
        <div>
            <h2 className="mb-2 text-xl font-semibold text-black">
                Plant Needs
            </h2>
            <p className="mb-4 text-sm text-gray-500">
                Here are the specific needs of your plant. Make sure to provide the right care to keep your plant healthy and thriving.
            </p>

            <div className="space-y-3">
                <NeedRow key="water" label="Watering" notes={needs.watering.method} icon={icons.water} />
                <NeedRow key="mist" label="Misting" notes={needs.mist.notes} icon={icons.mist} />
                <NeedRow key="light" label={`Light - ${needs.light.level}`} notes={needs.light.notes} icon={icons.light} />
                <NeedRow key="humidity" label={`Humidity - ${needs.humidity.level}`} notes={needs.humidity.notes} icon={icons.humidity} />
                {needs.toxicity.pets && <NeedRow key="toxicity" label="Toxicity" notes={needs.toxicity.notes} icon={icons.toxicity} />}
            </div>
            {/* common problems - symptoms, cause, fix as accordion */}
            <div className="mt-6">
                <h2 className="mb-2 text-xl font-semibold text-black">
                    Common Problems
                </h2>
                <p className="mb-4 text-sm text-gray-500">
                    Here are some common problems that your plant may face, along with their symptoms, causes, and fixes.
                </p>

                <div className="space-y-3">
                    {needs.common_problems.map((problem, index) => (
                        <div key={index} className="border-b border-slate-200">
                            <button onClick={() => toggleAccordion(index)} className="w-full cursor-pointer flex justify-between items-center py-5 text-slate-800">
                                <span>{problem.symptom}</span>
                                <span className="text-slate-800 transition-transform duration-300">
                                    {expandedIndex === index ? <TfiArrowCircleUp size={20} /> : <TfiArrowCircleDown size={20} />}
                                </span>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedIndex === index
                                        ? "max-h-96 opacity-100"
                                        : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="py-5">
                                    <div className="pb-5 text-sm text-slate-500">
                                        <span className="uppercase font-bold me-2">Cause:</span>
                                        <span className="text-slate-800">{problem.cause}</span>
                                    </div>

                                    <div className="text-sm text-slate-500">
                                        <span className="uppercase font-bold me-2">Fix:</span>
                                        <span className="text-slate-800">{problem.fix}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}