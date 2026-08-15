"use client";

import { useState } from "react";
import { FiDroplet, FiSun, FiRefreshCw, FiFeather, FiCheck, FiEdit, FiPause, FiPlay } from "react-icons/fi";
import { PiSprayBottleBold } from "react-icons/pi";

const icons = {
    water: FiDroplet,
    mist: PiSprayBottleBold,
    rotate: FiRefreshCw,
    fertilize: FiFeather,
};

const labels = {
    water: "Water",
    mist: "Mist",
    rotate: "Rotate",
    fertilize: "Fertilize",

    // Add more task types and their corresponding labels here
    Watering: "Watering",
    Misting: "Misting",
    Rotating: "Rotating",
    Fertilizing: "Fertilizing",

    Water: "Water",
    Mist: "Mist",
    Rotate: "Rotate",
    Fertilize: "Fertilize",
};

export default function Tasks({ tasks: initialTasks }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [toggleEditTaskId, setToggleEditTaskId] = useState(null);
    const [newInterval, setNewInterval] = useState(null);

    const getDueText = (nextDueAt) => {
        const daysUntilDue = Math.ceil((new Date(nextDueAt) - new Date()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue < 0) {
            return `Overdue by ${Math.abs(daysUntilDue)} days`;
        } else if (daysUntilDue === 0) {
            return "Due today";
        } else {
            return `Due in ${daysUntilDue} days`;
        }
    }

    const handleEditClick = (task) => {
        setToggleEditTaskId(toggleEditTaskId === task.id ? null : task.id);

        setNewInterval(task.interval_days);
    };

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

    const handlePauseTask = async (taskId, paused) => {
        try {
            const response = await fetch("/api/tasks/update", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ taskId, paused }),
            });

            if (!response.ok) {
                throw new Error("Failed to update task");
            }

            // Update the task state to reflect the pause/resume
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, paused } : task
                )
            );
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleEditInterval = async (taskId, newInterval) => {
        setToggleEditTaskId(null); // Close the edit input after saving
        try {
            const response = await fetch("/api/tasks/update", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ taskId, interval_days: newInterval }),
            });

            if (!response.ok) {
                throw new Error("Failed to update task interval");
            }

            // Update the task state to reflect the new interval
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, interval_days: newInterval } : task
                )
            );
        } catch (error) {
            console.error("Error updating task interval:", error);
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
                        <div className={`flex items-center gap-4 ${task.paused ? 'opacity-50' : ''}`}>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                                <Icon size={20} />
                            </div>

                            <div className="flex flex-col">
                                {task.paused === true ? (
                                    <span className="text-medium text-gray-400">{task.name || labels[task.task_type] || task.task_type} - Paused</span>
                                ) : (
                                    <>
                                        <span
                                            className={`font-medium ${task.completed
                                                ? "text-gray-400 line-through"
                                                : "text-gray-900"
                                                }`}
                                        >
                                            {task.name || labels[task.task_type] || task.task_type} -{" "}
                                            {getDueText(task.next_due_at)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Every {task.interval_days} days
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex ">
                            <button
                                onClick={() => handleCompleteTask(task.id)}
                                className={`flex cursor-pointer items-center justify-center rounded-full p-2 transition ${task.completed
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                    : "bg-emerald-200 text-gray-600 hover:bg-emerald-300"}
                                    ${toggleEditTaskId === task.id ? "hidden" : ""}`}
                            >
                                <FiCheck size={16} />
                                <span className="text-gray-600 ms-2">Done</span>
                            </button>
                            {/* edit days interval button */}
                            {toggleEditTaskId === task.id ? (
                                <>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newInterval}
                                        onChange={(e) => setNewInterval(parseInt(e.target.value))}
                                        className="border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button onClick={() => handleEditInterval(task.id, newInterval)} className="ml-2 cursor-pointer rounded-full p-2 px-3 transition bg-emerald-200 text-gray-600 hover:bg-emerald-300">
                                        <FiCheck size={16} />
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => handleEditClick(task)} className="ml-2 cursor-pointer rounded-full p-2 px-3 transition bg-emerald-200 text-gray-600 hover:bg-emerald-300">
                                    <FiEdit size={16} />
                                </button>
                            )}
                            {/* pause task button */}
                            {task.paused ? (
                                <button onClick={() => handlePauseTask(task.id, false)} className="ml-2 cursor-pointer rounded-full p-2 px-3 transition bg-emerald-200 text-gray-600 hover:bg-emerald-300">
                                    <FiPlay size={16} />
                                </button>
                            ) : (
                                <button onClick={() => handlePauseTask(task.id, true)} className="ml-2 cursor-pointer rounded-full p-2 px-3 transition bg-emerald-200 text-gray-600 hover:bg-emerald-300">
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