import { createClient } from "@/lib/supabase/server";
import MainView from "@/components/details/MainView";

export default async function PlantDetailPage({ params }) {
    const supabase = await createClient();
    const { id } = await params;

    const { data: plant, error } = await supabase
        .from("plants")
        .select("*")
        .eq("id", id)
        .single();

    // fetch the signed URL for the plant's photo
    const { data } = await supabase.storage
        .from("plant-photos")
        .createSignedUrl(plant.photo_url, 60);

    plant.image_url = data.signedUrl;


    // fetch the tasks associated with the plant
    const { data: tasks, error: tasksError } = await supabase
        .from("care_tasks")
        .select("*")
        .eq("plant_id", id)
        .order("next_due_at", { ascending: true });

    plant.tasks = tasks;

    // fetch the care profile json associated with the plant
    const { data: careProfile, error: careProfileError } = await supabase
        .from("care_profiles")
        .select("profile_json")
        .ilike("species_scientific", plant.species_scientific)
        .single();

    plant.care_profile = careProfile;

    console.log("Final plant data:", plant);

    return <MainView plant={plant} />;
}