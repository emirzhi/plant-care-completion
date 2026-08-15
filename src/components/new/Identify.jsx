"use client";

import { useRef } from "react";
import Image from "next/image";
import { FaImage, FaCamera } from "react-icons/fa";
import { TbObjectScan } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";

export default function Identify({ photo, onPhotoChange, onIdentify, loading }) {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onPhotoChange(file);
        }
    };

    const handleCameraChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onPhotoChange(file);
        }
    };

    const handleIdentifyClick = () => {
        if (photo) {
            onIdentify();
        } else {
            alert("Please select or capture a photo first.");
        }
    };

    return (
        <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50">
                {photo ? (
                    <>
                        <Image
                            src={URL.createObjectURL(photo)}
                            alt="Selected Photo"
                            fill
                            sizes="(max-width: 768px) 100vw, 600px"
                            className={`object-cover transition-all duration-300 ${loading ? "scale-105 blur-sm" : ""}`}
                            unoptimized
                        />
                        {/* loading spinner */}
                        {loading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/40 border-t-white"></div>
                                <span className="mt-3 text-sm font-medium text-white">
                                    Identifying plant...
                                </span>
                            </div>
                        )}

                        {!loading && (
                            <button
                                type="button"
                                onClick={() => onPhotoChange(null)}
                                className="absolute right-2.5 top-2.5 z-20 cursor-pointer rounded-full border border-gray-300 bg-white p-2 text-black hover:bg-gray-200"
                            >
                                <IoMdClose size={24} />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <div>
                            <FaImage className="text-6xl text-gray-400" />
                        </div>
                        <span className="mt-2 text-gray-600">No photo selected</span>
                    </div>
                )}
            </div>
            <div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 p-2.5 text-lg font-medium text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-gray-100">
                        <FaImage />
                        <span className="ml-2">Select from gallery</span>
                    </button>
                    <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={loading} className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 p-2.5 text-lg font-medium text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-gray-100">
                        <FaCamera />
                        <span className="ml-2">Capture from camera</span>
                    </button>
                </div>

                <div className="w-full">
                    <button type="button" onClick={handleIdentifyClick} disabled={loading} className="flex w-full cursor-pointer items-center justify-center rounded-xl border border-emerald-400 bg-emerald-400 p-2.5 text-lg font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200">
                        <TbObjectScan />
                        <span className="ml-2">{loading ? "Identifying..." : "Identify Plant"}</span>
                    </button>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={cameraInputRef}
                    onChange={handleCameraChange}
                    style={{ display: "none" }}
                />
            </div>
        </div>
    );
}