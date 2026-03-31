"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Profile = {
    id: string;
    name: string;
    description: string;
    created_at: string;
};

interface ProfileContextType {
    activeProfileId: string;
    setActiveProfileId: (id: string) => void;
    profiles: Profile[];
    refreshProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [activeProfileId, setProfileId] = useState<string>("default");
    const [profiles, setProfiles] = useState<Profile[]>([]);

    const refreshProfiles = async () => {
        try {
            const res = await fetch("/api/profiles");
            const data = await res.json();
            if (data.profiles) {
                setProfiles(data.profiles);
            }
        } catch (e) {
            console.error("Failed to fetch profiles", e);
        }
    };

    useEffect(() => {
        refreshProfiles();
        // Load saved profile
        const saved = localStorage.getItem("activeProfileId");
        if (saved) {
            setProfileId(saved);
        }
    }, []);

    const setActiveProfileId = (id: string) => {
        setProfileId(id);
        localStorage.setItem("activeProfileId", id);
        // Force a soft reload or let the components re-fetch based on context change
    };

    return (
        <ProfileContext.Provider value={{ activeProfileId, setActiveProfileId, profiles, refreshProfiles }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
}
