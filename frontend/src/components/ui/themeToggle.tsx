"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
    Sun,
    Moon,
    Monitor,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                variant="outline"
                size="icon"
                disabled
                aria-label="Change theme"
            >
                <Monitor className="h-4 w-4" />
            </Button>
        );
    }

    const themes = [
        {
            value: "light",
            icon: Sun,
            label: "Light mode",
        },
        {
            value: "dark",
            icon: Moon,
            label: "Dark mode",
        },
        {
            value: "system",
            icon: Monitor,
            label: "System mode",
        },
    ];

    const currentTheme =
        themes.find((item) => item.value === theme) ?? themes[2];

    const Icon = currentTheme.icon;

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => {
                const currentIndex = themes.findIndex(
                    (item) => item.value === theme
                );

                const nextTheme =
                    themes[(currentIndex + 1) % themes.length];

                setTheme(nextTheme.value);
            }}
            aria-label={`Current theme: ${currentTheme.label}. Change theme`}
            title={currentTheme.label}
        >
            <Icon className="h-4 w-4" />
        </Button>
    );
}
