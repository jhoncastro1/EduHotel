'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getGroupGuidelines() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data, error } = await supabase
            .from("group_instruction_forms")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            console.error("Error fetching group guidelines:", error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Unexpected error in getGroupGuidelines:", error);
        return null;
    }
}

export async function createGroupGuidelines(formData: any) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from("group_instruction_forms")
            .insert([
                {
                    ...formData,
                    user_id: user.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
            ])
            .select()
            .maybeSingle();

        if (error) {
            console.error("Error creating group guidelines:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/group-guidelines");
        return { success: true, data };
    } catch (error: any) {
        console.error("Unexpected error in createGroupGuidelines:", error);
        return { success: false, error: error.message };
    }
}

export async function updateGroupGuidelines(id: string, formData: any) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("group_instruction_forms")
            .update(formData)
            .eq("id", id)
            .select()
            .maybeSingle();

        if (error) {
            console.error("Error updating group guidelines:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/group-guidelines");
        return { success: true, data };
    } catch (error: any) {
        console.error("Unexpected error in updateGroupGuidelines:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteGroupGuidelines(id: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("group_instruction_forms")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting group guidelines:", error.message);
            throw new Error(error.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/group-guidelines");
        return { success: true };
    } catch (error: any) {
        console.error("Unexpected error in deleteGroupGuidelines:", error);
        return { success: false, error: error.message };
    }
}
