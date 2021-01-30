import { useEffect, Ref, unref } from '@tacopie/taco';

type ThemeLike = Record<string, string | number | Ref<string | number>>;

export const useTheme = (theme: ThemeLike | Ref<ThemeLike>) => {
    useEffect(() => {
        const currentTheme = unref(theme);
        for (const [key, val] of Object.entries(currentTheme)) {
            document.documentElement.style.setProperty(
                `--${key}`,
                String(unref(val)),
            );
        }
        return () => {
            for (const [key] of Object.entries(currentTheme)) {
                document.documentElement.style.removeProperty(`--${key}`);
            }
        };
    });
};
