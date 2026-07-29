import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light';
export type Appearance = ResolvedAppearance;

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
};

const applyTheme = (): void => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

const subscribe = (_callback: () => void) => () => {};

export function initializeTheme(): void {
    applyTheme();
}

export function useAppearance(): UseAppearanceReturn {
    useSyncExternalStore(subscribe, () => 'light', () => 'light');
    return { appearance: 'light', resolvedAppearance: 'light' } as const;
}
