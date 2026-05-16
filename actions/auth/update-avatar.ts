'use server'

import { createClient } from "@/lib/supabase/server"

export async function updateAvatar(formData: FormData) {
    const supabase = await createClient();

    const file = formData.get('avatar') as File;
    const userId = formData.get('userId') as string;

    //subir imagen a supabase bucket 'avatars'
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        //actualizar si la imagen existe
        upsert: true,
        //Tipo de contenido
        contentType: file.type,
    })

    //si hay error al subir la imagen
    if (uploadError) {
        console.error('Error al subir la imagen:', uploadError);
        throw new Error(uploadError.message)
    }

    //obtener URL de la imagen
    const { data } = await supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    //actualizar el perfil con la URL de la imagen
    const { error: profileError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
    if (profileError) {
        console.error('Error al actualizar el perfil:', profileError);
        throw new Error(profileError.message)
    }

    return { publicUrl }


}