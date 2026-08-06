"use client";

import { useState } from "react";
import { FiDroplet, FiSun, FiRefreshCw, FiFeather, FiCheck, FiEdit, FiPause, FiPlay } from "react-icons/fi";

const icons = {
    water: FiDroplet,
    mist: FiDroplet,
    rotate: FiRefreshCw,
    fertilize: FiFeather,
};

const labels = {
    water: "Water",
    mist: "Mist",
    rotate: "Rotate",
    fertilize: "Fertilize",
};

export default function Tasks({ tasks: initialTasks }) {
    const [tasks, setTasks] = useState(initialTasks);

    const handleCompleteTask = async (taskId) => {
        try {
            const response = await fetch("/api/tasks/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ taskId }),
            });

            if (!response.ok) {
                throw new Error("Failed to complete task");
            }

            // Update the task state to reflect the completion
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, completed: true } : task
                )
            );
        } catch (error) {
            console.error("Error completing task:", error);
        }
    };



    return (
        <div className="space-y-3">
            {tasks.map((task, index) => {
                const Icon = icons[task.task_type] || FiSun;

                return (
                    <div
                        key={task.id}
                        className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-gray-100"
                    >
                        <div className="flex items-center gap-4">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                                <Icon size={20} />
                            </div>

                            <div className="flex flex-col">
                                <span
                                    className={`font-medium ${task.completed
                                        ? "text-gray-400 line-through"
                                        : "text-gray-900"
                                        }`}
                                >
                                    {labels[task.task_type]} - in {Math.ceil((new Date(task.next_due_at) - new Date()) / (1000 * 60 * 60 * 24))} days
                                </span>
                                <span className="text-sm text-gray-500">
                                    Every {task.interval_days} days
                                </span>
                            </div>
                        </div>

                        <div className="flex ">
                            <button
                                onClick={() => handleCompleteTask(task.id)}
                                className={`flex cursor-pointer items-center justify-center rounded-full p-2 transition ${task.completed
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                    : "bg-emerald-200 text-gray-600 hover:bg-emerald-300"
                                    }`}
                            >
                                <FiCheck size={16} />
                                <span className="text-gray-600 ms-2">Done</span>
                            </button>
                            {/* edit days interval button */}
                            <button className="ml-2 cursor-pointer rounded-full p-2 px-3 transition bg-emerald-200 text-gray-600 hover:bg-emerald-300">
                                <FiEdit size={16} />
                            </button>
                            {/* pause task button */}
                            {task.paused ? (
                                <button className="ml-2 cursor-pointer rounded-full p-2 px-3 transition bg-emerald-200 text-gray-600 hover:bg-emerald-300">
                                    <FiPlay size={16} />
                                </button>
                            ) : (
                                <button className="ml-2 cursor-pointer rounded-full p-2 px-3 transition bg-emerald-200 text-gray-600 hover:bg-emerald-300">
                                    <FiPause size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}