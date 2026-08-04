import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(req) {
    let supabaseResponse = NextResponse.next({ request: req, });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet) {

                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value);

                        supabaseResponse.cookies.set(name, value, options);
                    })
                }
            }
        }
    )

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.redirect(new URL("/signin", req.url));

    return supabaseResponse;
}