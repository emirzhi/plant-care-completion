'use client';

import { useState } from 'react';
import { signInWithGoogle, signInWithEmail } from '@/lib/actions/auth';
import { HiOutlineMail } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';

export default function Form() {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signInWithEmail(email);
    };

    const handleGoogleSignIn = async (e) => {
        // Handle Google sign-in logic here
        e.preventDefault();
        await signInWithGoogle();
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 bg-white to-green-50 flex items-center justify-center px-6">
            <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome Back
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Sign in to access your plant collection.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Email Address
                        </label>

                        <div className="flex items-center rounded-xl border border-gray-300 px-4">
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-transparent py-3 outline-none placeholder:text-black/40"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="cursor-pointer w-full rounded-xl bg-green-600 py-3 font-semibold text-white"
                    >
                        Continue with Email
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="mx-4 text-sm text-gray-400 uppercase">or</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    className="flex w-full items-center justify-center cursor-pointer gap-3 rounded-xl border border-gray-300 bg-white py-3 font-medium text-gray-700"
                >
                    <FcGoogle size={22} />
                    Continue with Google
                </button>
            </div>
        </main>
    );
}
