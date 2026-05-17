'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { HotelRegisterFormData } from "@/app/components/checkin/hotel-register-form";

export async function getCheckIn() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data, error } = await supabase
            .from("hotel_register_forms")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            console.error("Error fetching check-in:", error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Unexpected error in getCheckIn:", error);
        return null;
    }
}

export async function createCheckIn(formData: HotelRegisterFormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from("hotel_register_forms")
            .insert([
                {
                    ...formData,
                    user_id: user.id,
                    completed: true,
                    updated_at: new Date().toISOString(),
                }
            ])
            .select()
            .maybeSingle();

        if (error) {
            console.error("Error creating check-in:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/checkin");
        return { success: true, data };
    } catch (error: any) {
        console.error("Unexpected error in createCheckIn:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteCheckIn(id: string) {
    try {
        const supabase = await createClient();
        
        const { error } = await supabase
            .from("hotel_register_forms")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting check-in:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/checkin");
        return { success: true };
    } catch (error: any) {
        console.error("Unexpected error in deleteCheckIn:", error);
        return { success: false, error: error.message };
    }
}
