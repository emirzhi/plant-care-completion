"use client";

import { useState } from "react";
import Image from "next/image";
import { PiPlantLight } from "react-icons/pi";
import { CiCircleCheck } from "react-icons/ci";
import { FiX } from "react-icons/fi";
import { HiOutlineArrowSmRight, HiOutlineArrowSmLeft } from "react-icons/hi";


export default function Result({ photo, result, loading, onPreviousStep, onNextStep }) {
    const [customName, setCustomName] = useState("");
    const [toggleCustomName, setToggleCustomName] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);

    const toggleSelectMatch = (match) => {
        if (selectedMatch === match) {
            setSelectedMatch(null);
        } else {
            setSelectedMatch(match);
        }
    };

    return (
        <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center space-x-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                    {photo && (
                        <Image
                            src={URL.createObjectURL(photo)}
                            alt="Uploaded photo"
                            layout="fill"
                            objectFit="cover"
                        />
                    )}
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-stone-900">
                        Matches found
                    </h2>
                    <p className="text-sm text-stone-500">
                        Pick the best match from the list below or add a custom name for your plant.
                    </p>
                </div>
            </div>

            {result.primary && (
                <div onClick={() => toggleSelectMatch(result.primary)} className="space-y-4">
                    <div className="flex cursor-pointer items-center gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
                        <PiPlantLight className="h-6 w-6 text-stone-400" />
                        <div className="w-full">
                            <div>
                                <h3 className="font-medium text-stone-900">
                                    {result.primary.scientific_name}
                                </h3>
                                <span className="text-sm text-stone-500">
                                    {result.primary.common_name}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center gap-2 w-full">
                                <div className="h-1.5 flex-1 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-400"
                                        style={{ width: `${Math.round(result.primary.confidence * 100)}%` }}
                                    />
                                </div>
                                <span className="w-10 text-right text-xs font-medium text-stone-600">
                                    {Math.round(result.primary.confidence * 100)}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <div>
                                {selectedMatch === result.primary && (
                                    <CiCircleCheck className="h-6 w-6 text-white rounded-full bg-emerald-400" />
                                )}
                                {selectedMatch !== result.primary && (
                                    <div className="h-6 w-6 rounded-full border border-stone-300" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {result.alternatives && result.alternatives.map((alt, index) => (
                <div key={index} onClick={() => toggleSelectMatch(alt)} className="space-y-4">
                    <div className="flex cursor-pointer items-center gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
                        <PiPlantLight className="h-6 w-6 text-stone-400" />
                        <div className="w-full">
                            <div>
                                <h3 className="font-medium text-stone-900">
                                    {alt.scientific_name}
                                </h3>
                                <span className="text-sm text-stone-500">
                                    {alt.common_name}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center gap-2 w-full">
                                <div className="h-1.5 flex-1 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-400"
                                        style={{ width: `${Math.round(alt.confidence * 100)}%` }}
                                    />
                                </div>
                                <span className="w-10 text-right text-xs font-medium text-stone-600">
                                    {Math.round(alt.confidence * 100)}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <div>
                                {selectedMatch === alt && (
                                    <CiCircleCheck className="h-6 w-6 text-white rounded-full bg-emerald-400" />
                                )}
                                {selectedMatch !== alt && (
                                    <div className="h-6 w-6 rounded-full border border-stone-300" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div>
                <button
                    onClick={() => setToggleCustomName(!toggleCustomName)}
                    className={`flex cursor-pointer w-full items-center gap-2 rounded-lg border border-3 border-dotted border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 ${toggleCustomName ? 'hidden' : 'block'}`}
                >
                    <span className="text-center w-full text-stone-600">None of the above?</span>
                </button>

                <div className={`mt-4 flex ${toggleCustomName ? "block" : "hidden"}`}>
                    <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Enter custom scientific name"
                        className="w-full me-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700 focus:border-emerald-400 focus:ring focus:ring-emerald-200"
                    />
                    <button
                        onClick={() => {
                            setToggleCustomName(false)
                            setCustomName("")
                        }}
                        className="rounded-full ms-2 cursor-pointer items-center bg-stone-300 px-3 py-2 text-white hover:bg-red-400"
                    >
                        <FiX className="inline-block" />
                    </button>
                </div>
            </div>


            <div className="flex justify-between">
                <button onClick={onPreviousStep} disabled={loading} className="items-center cursor-pointer rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-50 disabled:hover:bg-gray-100">
                    <HiOutlineArrowSmLeft className="inline-block" />
                    Previous
                </button>

                <button onClick={() => onNextStep(selectedMatch, customName)} disabled={loading || (!selectedMatch && !customName.trim())} className="items-center cursor-pointer rounded-lg border border-emerald-400 bg-emerald-400 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 disabled:hover:bg-gray-200">
                    {loading ? "Loading..." : "Next"}
                    <HiOutlineArrowSmRight className="inline-block" />
                </button>
            </div>

        </div>
    );
}