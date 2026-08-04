import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);

    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    let next = searchParams.get("next");
    if (!next) next = "/";



    const supabase = await createClient();
    let error;
    if (code) {
        ({ error } = await supabase.auth.exchangeCodeForSession(code));
    } else if (token_hash) {
        ({ error } = await supabase.auth.verifyOtp({ token_hash, type }));
    }

    if (!error) {
        return NextResponse.redirect(new URL(next, origin));
    }

    return NextResponse.redirect(new URL(`/signin?error=${error.message}`, origin));
}