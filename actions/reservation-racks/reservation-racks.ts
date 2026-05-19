'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface RackItemData {
    month_name: string
    room_number: string
    day_number: number
}

export interface ReservationRacksFormData {
    company_name: string
    total_rooms: number
    items: RackItemData[]
}

export async function getReservationRacks() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data: rack, error: rackError } = await supabase
            .from("reservation_racks")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (rackError) {
            console.error("Error fetching reservation-racks:", rackError.message);
            return null;
        }

        if (!rack) return null;

        // Fetch associated items
        const { data: items, error: itemsError } = await supabase
            .from("reservation_rack_items")
            .select("*")
            .eq("rack_id", rack.id);

        if (itemsError) {
            console.error("Error fetching reservation-rack-items:", itemsError.message);
            return { ...rack, items: [] };
        }

        return { ...rack, items };
    } catch (error) {
        console.error("Unexpected error in getReservationRacks:", error);
        return null;
    }
}

export async function createReservationRacks(formData: ReservationRacksFormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("User not authenticated");

        const { company_name, total_rooms, items } = formData;

        // 1. Get or upsert parent rack
        const { data: existingRack } = await supabase
            .from("reservation_racks")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        let rackId: string;

        if (existingRack) {
            rackId = existingRack.id;
            const { error: updateError } = await supabase
                .from("reservation_racks")
                .update({
                    company_name,
                    total_rooms,
                    completed: true,
                    updated_at: new Date().toISOString()
                })
                .eq("id", rackId);

            if (updateError) throw new Error(updateError.message);
        } else {
            const { data: newRack, error: insertError } = await supabase
                .from("reservation_racks")
                .insert([
                    {
                        user_id: user.id,
                        company_name,
                        total_rooms,
                        completed: true,
                        updated_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (insertError) throw new Error(insertError.message);
            rackId = newRack.id;
        }

        // 2. Clear old items
        const { error: deleteItemsError } = await supabase
            .from("reservation_rack_items")
            .delete()
            .eq("rack_id", rackId);

        if (deleteItemsError) throw new Error(deleteItemsError.message);

        // 3. Bulk insert new items
        if (items && items.length > 0) {
            const itemsToInsert = items.map(item => ({
                rack_id: rackId,
                month_name: item.month_name,
                room_number: item.room_number,
                day_number: item.day_number
            }));

            const { error: insertItemsError } = await supabase
                .from("reservation_rack_items")
                .insert(itemsToInsert);

            if (insertItemsError) throw new Error(insertItemsError.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/reservation-racks");
        return { success: true };
    } catch (error: any) {
        console.error("Unexpected error in createReservationRacks:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteReservationRacks(id: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("reservation_racks")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting reservation-racks:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/reservation-racks");
        return { success: true };
    } catch (error: any) {
        console.error("Unexpected error in deleteReservationRacks:", error);
        return { success: false, error: error.message };
    }
}
