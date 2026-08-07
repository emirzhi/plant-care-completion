import MainView from "@/components/plants/MainView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PlantsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/signin');
    }

    const { data: plants, error } = await supabase.from('plants').select('*');

    const photos = plants.map(plant => plant.photo_url);

    const signedUrls = await Promise.all(photos.map(async (photo) => {
        if (!photo) return null;
        const { data } = await supabase.storage.from('plant-photos').createSignedUrl(photo, 60);
        return data.signedUrl;
    }));

    plants.forEach((plant, index) => {
        plant.image_url = signedUrls[index];
    });

    return <MainView plants={plants} />;
}