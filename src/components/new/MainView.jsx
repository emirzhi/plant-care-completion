"use client";

import { useState } from "react";
import { compressImage, blobToBase64 } from "@/lib/img";
import Identify from "./Identify";
import Result from "./Result";
import CareSettings from "./CareSettings";
import { redirect } from "next/navigation";

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
    const [identifyResult, setIdentifyResult] = useState(null);
    const [careSettings, setCareSettings] = useState(null);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [base64Photo, setBase64Photo] = useState(null);

    const handleSavePlant = async (tasks) => {
        setLoading(true);

        try {
            const plantTasks = tasks.map(({icon , ...task}) => task); // Remove icon from tasks before sending to the server
            const response = await fetch("/api/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ plant: selectedMatch, careSettings, plantTasks, base64Photo }),
            });
        } catch (error) {
            console.error("Error saving the plant:", error);
        } finally {
            setLoading(false);
            redirect("/plants");
        }
    };

    const handleIdentify = async () => {
        setLoading(true);

        try {
            const compressedPhoto = await compressImage(photo);
            const base64Photo = await blobToBase64(compressedPhoto);
            setBase64Photo(base64Photo);
            const response = await fetch("/api/identify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image: base64Photo }),
            });

            const data = await response.json();
            setIdentifyResult(data);

            setSelectedStep(2);
        } catch (error) {
            console.error("Error identifying the plant:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCareSettings = async (plantSpecies, customName) => {
        setLoading(true);

        try {
            const response = await fetch("/api/care", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ species: plantSpecies, custom_name: customName }),
            });

            const data = await response.json();
            setCareSettings(data);

            setSelectedMatch({ plant_data: plantSpecies, custom_name: customName });
            setSelectedStep(3);
        } catch (error) {
            console.error("Error fetching care settings:", error);
        } finally {
            setLoading(false);
        }
    }

    const handlePreviousStep = () => {
        if (step > 1) {
            setSelectedStep(step - 1);
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
                    {step === 2 && (
                        <Result
                            photo={photo}
                            result={identifyResult}
                            loading={loading}
                            onPreviousStep={handlePreviousStep}
                            onNextStep={handleCareSettings}
                        />
                    )}
                    {step === 3 && (
                        <CareSettings
                            onPreviousStep={handlePreviousStep}
                            careSettings={careSettings}
                            photo={photo}
                            plant={selectedMatch}
                            onSave={handleSavePlant}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}