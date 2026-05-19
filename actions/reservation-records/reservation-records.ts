'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ReservationRecordsFormData } from "@/app/components/reservation-records/reservation-records-form";

export async function getReservationRecords() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data, error } = await supabase
            .from("reservation_records")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            console.error("Error fetching reservation-records:", error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Unexpected error in getReservationRecords:", error);
        return null;
    }
}

export async function createReservationRecords(formData: ReservationRecordsFormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from("reservation_records")
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
            console.error("Error creating reservation-records:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/reservation-records");
        return { success: true, data };
    } catch (error: any) {
        console.error("Unexpected error in createReservationRecords:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteReservationRecords(id: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("reservation_records")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting reservation-records:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/reservation-records");
        return { success: true };
    } catch (error: any) {
        console.error("Unexpected error in deleteReservationRecords:", error);
        return { success: false, error: error.message };
    }
}
