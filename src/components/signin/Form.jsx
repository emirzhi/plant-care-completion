'use client';

import { useState } from 'react';
import { signInWithGoogle, signInWithEmail } from '@/lib/actions/auth';

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
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-4 p-2 border border-gray-300 rounded"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    Sign In
                </button>
            </form>
            <button
                onClick={handleGoogleSignIn}
                className="mt-4 bg-red-500 text-white p-2 rounded"
            >
                Sign in with Google
            </button>
        </main>
    );
}
