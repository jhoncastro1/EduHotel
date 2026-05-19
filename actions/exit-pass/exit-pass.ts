'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ExitPassFormData } from "@/app/components/exit-pass/exit-pass-form";

export async function getExitPass() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data, error } = await supabase
            .from("exit_pass_forms")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            console.error("Error fetching exit-pass:", error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Unexpected error in getExitPass:", error);
        return null;
    }
}

export async function createExitPass(formData: ExitPassFormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from("exit_pass_forms")
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
            console.error("Error creating exit-pass:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/exit-pass");
        return { success: true, data };
    } catch (error: any) {
        console.error("Unexpected error in createExitPass:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteExitPass(id: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("exit_pass_forms")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting exit-pass:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/exit-pass");
        return { success: true };
    } catch (error: any) {
        console.error("Unexpected error in deleteExitPass:", error);
        return { success: false, error: error.message };
    }
}
