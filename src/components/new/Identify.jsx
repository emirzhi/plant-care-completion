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
                            className="object-cover"
                            unoptimized
                        />
                        {/* loading spinner */}
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="loader"></div>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => onPhotoChange(null)}
                            className="cursor-pointer text-black"
                        >
                            <IoMdClose size={40} className="top-2.5 right-2.5 absolute p-2 border rounded-full bg-white border-gray-300 hover:bg-gray-200" />
                        </button>
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
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} className="cursor-pointer text-lg p-2.5 rounded-xl text-black flex items-center border border-gray-300 hover:bg-gray-200 justify-center disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black font-medium">
                        <FaImage />
                        <span className="ml-2">Select from gallery</span>
                    </button>
                    <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={loading} className="cursor-pointer text-lg p-2.5 rounded-xl text-black flex items-center border border-gray-300 hover:bg-gray-200 justify-center disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black font-medium">
                        <FaCamera />
                        <span className="ml-2">Capture from camera</span>
                    </button>
                </div>

                <div className="w-full">
                    <button type="button" onClick={handleIdentifyClick} disabled={loading} className="cursor-pointer w-full border border-white p-2.5 rounded-xl disabled:border-disabled disabled:bg-gray-300 disabled:text-black bg-emerald-400 text-white text-lg flex items-center justify-center hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black font-medium">
                        <TbObjectScan />
                        <span className="ml-2">Identify Plant</span>
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