'use server'

import { User } from "@/interfaces/user";
import { createClient } from "@/lib/supabase/server";



export const getUser = async (): Promise<User | null> => {
    try {
        const supabase = await createClient();
        const { data: { user: session } } = await supabase.auth.getUser();

        if (!session) {
            return null;
        }

        const userId = session.id;

        const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (userError || !userData) {
            console.warn("No se encontró perfil para el usuario, usando datos de sesión");
            return {
                id: session.id,
                email: session.email || "",
                name: session.user_metadata?.name || "Usuario",
            } as any;
        }
        return userData;
    } catch (error) {
        console.error("Error al obtener el usuario");
        return null;
    }
}