'use server';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signInWithEmail(email) {
    const supabase = await createClient(cookies());
    const { data, error } = await supabase.auth.signInWithOtp({
        email: email
    });
}

export async function signInWithGoogle() {
    const supabase = await createClient(cookies());
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `http://localhost:3000/auth/callback`
        }
    });
    
    if (data?.url) {
        redirect(data.url);
    }
}

export async function signOutUser() {
    const supabase = await createClient(cookies());
    const { error } = await supabase.auth.signOut();
    redirect('/');
}