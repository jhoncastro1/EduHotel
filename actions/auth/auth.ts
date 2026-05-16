'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: { email: string, password: string }) {
    const supabase = await createClient()

    const { error, data } = await supabase.auth.signInWithPassword(formData)

    if (error) {
        return {
            success: false,
            message: error.message
        }
    }
    revalidatePath('/', 'layout')
    return {
        success: true,
        message: 'Usuario autenticado',
        data
    }
}

export async function signup(formData: { name: string, email: string, password: string }) {
    const supabase = await createClient()

    const { error, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                name: formData.name
            }
        }
    })

    if (error) {
        return {
            success: false,
            message: error.message
        }
    }
    return {
        success: true,
        message: 'Usuario registrado',
        data
    }
}

export async function sendRecoveryEmail(email: string) {
    const supabase = await createClient()

    const { error, data } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
        return {
            success: false,
            message: error.message
        }
    }

    return {
        success: true,
        message: 'Correo de recuperación enviado',
        data
    }
}

export async function updatePassword(formData: { password: string }) {
    const supabase = await createClient()

    const { error, data } = await supabase.auth.updateUser({
        password: formData.password
    })

    if (error) {
        return {
            success: false,
            message: error.message
        }
    }
    return {
        success: true,
        message: 'Contraseña actualizada',
        data
    }
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
}

