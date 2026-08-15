"use client";

import { useState } from "react";
import Image from "next/image";
import { HiOutlineArrowSmLeft } from "react-icons/hi";
import { IoMdWater } from "react-icons/io";
import { PiSprayBottleFill } from "react-icons/pi";
import { ImLab } from "react-icons/im";
import { FaArrowsRotate, FaTemperatureQuarter, FaSun, FaCheck } from "react-icons/fa6";
import { FiPause, FiPlay, FiX } from "react-icons/fi";
import { TbPawFilled } from "react-icons/tb";
import { WiHumidity } from "react-icons/wi";
import { FaPlus } from "react-icons/fa";

const buildTaskList = (careSettings) => {
    return [
        {
            icon: <IoMdWater />,
            task_type: "Watering",
            interval_days: careSettings.watering?.interval_days_summer,
            paused: false,
        },
        {
            icon: <FaArrowsRotate />,
            task_type: "Rotate",
            interval_days: careSettings.rotation_days,
            paused: false,
        },
        {
            icon: <ImLab />,
            task_type: "Fertilize",
            interval_days: careSettings.fertilizing?.interval_days_growing_season,
            paused: false,
        },
        {
            icon: <PiSprayBottleFill />,
            task_type: "Mist",
            interval_days: careSettings.mist?.interval_days,
            paused: false,
        },
    ].filter(task => task.interval_days !== null && task.interval_days > 0);
};

const buildNeedsList = (careSettings) => {
    return [
        {
            icon: <FaSun />,
            task_type: "Light",
            level: careSettings?.light?.level,
            notes: careSettings?.light?.notes || "No information available",
        },
        {
            icon: <WiHumidity size={22} className="-m-0.5" />,
            task_type: "Humidity",
            level: careSettings?.humidity?.level,
            notes: careSettings?.humidity?.notes || "No information available",
        },
        {
            icon: <FaTemperatureQuarter />,
            task_type: "Temperature",
            range_0: careSettings?.temperature_range_c[0],
            range_1: careSettings?.temperature_range_c[1],
        },
        {
            icon: <TbPawFilled />,
            task_type: "Toxicity",
            notes: careSettings?.toxicity.notes || "No information available",
            pets: true,
        },
    ]
};

export default function CareSettings({ onPreviousStep, careSettings, photo, plant, onSave, loading }) {
    const [nickname, setNickname] = useState("");
    const [location, setLocation] = useState("");
    const [acquisitionDate, setAcquisitionDate] = useState("");
    const [tasks, setTasks] = useState(buildTaskList(careSettings));
    const [needs, setNeeds] = useState(buildNeedsList(careSettings));
    const [addCustomTask, setAddCustomTask] = useState(false);
    const [customTaskName, setCustomTaskName] = useState("");

    const updateTaskInterval = (taskType, newInterval) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.task_type === taskType ? { ...task, interval_days: newInterval } : task
            )
        );
    }

    const handleAddCustomTask = () => {
        // add the custom task to the list with interval days set to 1
        setTasks(prevTasks => [...prevTasks, { icon: <FaPlus />, task_type: customTaskName, interval_days: 1, paused: false }]);
        setAddCustomTask(false);
        setCustomTaskName("");
    };

    const handlePauseTask = (taskType, paused) => {
        console.log(`Pausing task ${taskType}: ${paused}`);
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.task_type === taskType ? { ...task, paused } : task
            )
        );
    };

    const handleSavePlant = async () => {
        await onSave(tasks);
    };

    return (
        <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex space-x-4">
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
                <div className="flex-1 items-start">
                    <h2 className="text-lg font-semibold text-stone-900">
                        {plant?.plant_data.scientific_name || plant?.custom_name || "Unknown Plant"}
                    </h2>
                    {plant?.plant_data.common_name && (
                        <p className="text-sm text-stone-500">
                            {plant.plant_data.common_name}
                        </p>
                    )}
                </div>
            </div>

            {careSettings && (
                <>
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-stone-900">
                            Details
                        </h2>
                        <div className="flex flex-row gap-4">
                            <label>
                                <span className="text-black">Nickname (optional)</span>
                                <input
                                    type="text"
                                    placeholder="e.g. My lovely plant"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="border w-full rounded-lg border-stone-200 bg-stone-50 p-4 text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </label>
                            <label>
                                <span className="text-black">Acquisition Date (optional)</span>
                                <input
                                    type="date"
                                    value={acquisitionDate}
                                    onChange={(e) => setAcquisitionDate(e.target.value)}
                                    className="border w-full rounded-lg border-stone-200 bg-stone-50 p-4 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                <span className="text-black">Location (optional)</span>
                                <input
                                    type="text"
                                    placeholder="e.g. Living room"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="border w-full rounded-lg border-stone-200 bg-stone-50 p-4 text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </label>
                        </div>

                        <div className="pt-5">
                            <h2 className="text-lg font-semibold text-stone-900">
                                Care tasks
                            </h2>
                            <span className="text-sm text-stone-600 italic">AI suggestions. Adjust intervals as needed.</span>
                            <div className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
                                {tasks.map((task, index) => (
                                    <div className={`flex flex-row items-center gap-4 border border-stone-200 py-2 px-3 ${task.paused ? 'bg-stone-100' : 'bg-white'}`} key={index}>
                                        <div key={`icon-${task.task_type}`} className="flex py-2 text-black">
                                            {task.icon}
                                        </div>
                                        <div key={task.task_type} className="flex items-start flex-col">
                                            <span className="text-lg text-black">{task.task_type}</span>
                                            <span className="text-sm text-stone-500">{task.interval_days} days</span>
                                        </div>
                                        <div className="ml-auto">
                                            <input
                                                type="number"
                                                value={task.interval_days}
                                                min={1}
                                                onChange={(e) => updateTaskInterval(task.task_type, parseInt(e.target.value) || 1)}
                                                className="text-black border border-stone-200 rounded-xl text-center w-16 me-2"
                                            />
                                            <span className="text-sm text-stone-500">days</span>
                                        </div>
                                        {task.paused ? (
                                            <button onClick={() => handlePauseTask(task.task_type, false)} className="ml-2 cursor-pointer rounded-full p-2 px-3 transition bg-emerald-200 text-gray-600 hover:bg-emerald-300">
                                                <FiPlay size={16} />
                                            </button>
                                        ) : (
                                            <button onClick={() => handlePauseTask(task.task_type, true)} className="ml-2 cursor-pointer rounded-full p-2 px-3 transition bg-emerald-200 text-gray-600 hover:bg-emerald-300">
                                                <FiPause size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {addCustomTask ? (
                                <div className="flex mt-4 items-end">
                                    <label className="w-full">
                                        <span className="text-black">Task name</span>
                                        <input
                                            type="text"
                                            placeholder="e.g. Prune"
                                            value={customTaskName}
                                            onChange={(e) => setCustomTaskName(e.target.value)}
                                            className="w-full me-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700 focus:border-emerald-400 focus:ring focus:ring-emerald-200"
                                        />
                                    </label>

                                    <button
                                        onClick={() => handleAddCustomTask()}
                                        className="rounded-full ms-2 cursor-pointer items-center bg-emerald-400 px-3 py-2 text-white hover:bg-emerald-500"
                                    >
                                        <FaCheck className="inline-block" />
                                    </button>

                                    <button
                                        onClick={() => setAddCustomTask(false)}
                                        className="rounded-full ms-2 cursor-pointer items-center bg-stone-300 px-3 py-2 text-white hover:bg-red-400"
                                    >
                                        <FiX className="inline-block" />
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setAddCustomTask(true)} className="mt-2 cursor-pointer rounded-lg border border-emerald-400 bg-emerald-400 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 w-full">
                                    Add Custom Task
                                </button>
                            )}

                        </div>

                        <div className="pt-5">
                            <h2 className="text-lg font-semibold text-stone-900">
                                Plant needs
                            </h2>
                            <span className="text-sm text-stone-600 italic">AI generated recommendations.</span>
                            <div className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
                                {needs.map((need, index) => (
                                    <div className={`flex flex-row items-center gap-4 border border-stone-200 py-2 px-3`} key={index}>
                                        <div key={`icon-${need.task_type}`} className="flex py-2 text-black">
                                            {need.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <div key={need.task_type} className="flex text-black items-center flex-row">
                                                <span className="text-lg text-black">{need.task_type}</span> &nbsp;
                                                {need.level && (
                                                    <span className="text-stone-500"> &ndash; {need.level}</span>
                                                )}
                                                {need.range_0 && need.range_1 && (
                                                    <span className="text-stone-500"> &ndash; {need.range_0}°C to {need.range_1}°C</span>
                                                )}
                                            </div>
                                            <div>
                                                {need.notes && (
                                                    <span className="text-sm text-stone-500">{need.notes}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </>
            )}

            <div className="flex justify-between">
                <button disabled={loading} className="items-center cursor-pointer rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-50 disabled:hover:bg-gray-100" onClick={onPreviousStep}>
                    <HiOutlineArrowSmLeft className="inline-block" />
                    Previous
                </button>

                <button onClick={handleSavePlant} disabled={loading} className="items-center cursor-pointer rounded-lg border border-emerald-400 bg-emerald-400 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 disabled:hover:bg-gray-200">
                    {loading ? "Saving..." : "Save Plant"}
                </button>
            </div>
        </div >
    );
}