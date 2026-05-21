import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface UserProfile {
    id: number;
    username: string;
    email: string;
    avatar_url: string;
    created_at: string;
    is_online: boolean;
}

interface AuthContextType {
    profile: UserProfile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider ({
    children,
}: {
    children: React.ReactNode;
}) {
    const {user} = useParams();
    const [profile, setProfile] = useState<UserProfile | null> (null);
    const [loading, setLoading] = useState(true);

    useEffect (() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`http://localhost:3000/users/${user}`)
        .then((res) => res.json())
        .then((data) => {
            setProfile(data);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            setLoading(false);
        })
    }, [user])

    return (
        <AuthContext.Provider value={{ profile, loading, }} >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(){
    const context = useContext(AuthContext);
    if (!context)
            throw new Error("useAuth deve estar dentro do AuthProvider")
    return context;
}