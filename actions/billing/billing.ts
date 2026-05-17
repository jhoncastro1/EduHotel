'use server'

import { BillingFormData } from "@/app/components/billing/billing-form";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";


export async function getBilling() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data, error } = await supabase
            .from("billing_forms")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            console.error("Error fetching billing:", error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Unexpected error in getBilling:", error);
        return null;
    }
}

export async function createBilling(formData: BillingFormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from("billing_forms")
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
            console.error("Error creating billing:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/billing");
        return { success: true, data };
    } catch (error: any) {
        console.error("Unexpected error in createBilling:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteBilling(id: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("billing_forms")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting billing:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/billing");
        return { success: true };
    } catch (error: any) {
        console.error("Unexpected error in deleteBilling:", error);
        return { success: false, error: error.message };
    }
}
