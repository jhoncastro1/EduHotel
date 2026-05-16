'use client'

import { getUser } from "@/actions/auth/get-user";
import { User } from "@/interfaces/user"
import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    getUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const supabase = createClient();

    // ========= Obtener datos del usuario =========
    const getUserData = async () => {
        setIsLoading(true);
        try {
            const userData = await getUser();
            if (userData) {
                setUser(userData);
            }
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const authState = () => {
        const supabase = createClient();

        supabase.auth.onAuthStateChange((event, session) => {

            const eventType = [
                'INITIAL_SESSION',
                'USER_UPDATED',
                'SIGNED_OUT',
                'TOKEN_REFRESHED',
                'PASSWORD_RECOVERY'
            ]
            if (eventType.includes(event)) {

                if (session) {
                    getUserData();
                } else {
                    setUser(null);
                }
            }

        })

    };

    useEffect(() => {
        authState();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, getUserData }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}