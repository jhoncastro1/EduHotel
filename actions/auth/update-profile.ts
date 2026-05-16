'use server'

import { createClient } from "@/lib/supabase/server";

export async function updateProfile(values: {
    id: string;
    name: string;
    phone: string | null;
    country_code: string | null;
}) {
    const supabase = await createClient();

    const { error } = await supabase.from('profiles').upsert({
        id: values.id,
        name: values.name,
        phone: values.phone,
        country_code: values.country_code,
        updated_at: new Date().toISOString(),
    });

    if (error) {
        console.error('Error actualizando perfil:', error);
        return { error: error.message };
    }

    return { success: true };
}