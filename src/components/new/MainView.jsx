"use client";

import { useState } from "react";
import { compressImage, blobToBase64 } from "@/lib/img";
import Identify from "./Identify";

// identify steps: identify, identify results, care settings

const steps = [
    { id: 1, name: "Identify", href: "#", status: "current" },
    { id: 2, name: "Identify Results", href: "#", status: "upcoming" },
    { id: 3, name: "Care Settings", href: "#", status: "upcoming" },
];

export default function MainView() {
    const [step, setSelectedStep] = useState(1);
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleIdentify = async () => {
        setLoading(true);

        try {
            const compressedPhoto = await compressImage(photo);
            const base64Photo = await blobToBase64(compressedPhoto);
            const response = await fetch("/api/identify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image: base64Photo }),
            });

            if (!response.ok) {
                throw new Error("Failed to identify the plant.");
            }

            const data = await response.json();
            console.log("Identify API response:", data);
            setSelectedStep(2);
        } catch (error) {
            console.error("Error identifying the plant:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {step === 1 && (
                        <Identify
                            photo={photo}
                            onPhotoChange={setPhoto}
                            onIdentify={handleIdentify}
                            loading={loading}
                        />
                    )}
                    {/* {step === 2 && (
                            <Result
                                photo={photo}
                                onNextStep={handleNextStep}
                                onPreviousStep={handlePreviousStep}
                            />
                        )} */}
                    {/* {step === 3 && (
                        <CareSettings
                            onPreviousStep={handlePreviousStep}
                        />
                    )} */}
                </div>
            </div>
        </div>
    );
}