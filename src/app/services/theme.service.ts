import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'system' | 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'theme-mode';
  private readonly themeModeSubject = new BehaviorSubject<ThemeMode>('system');

  constructor() {
    const storedThemeMode = this.getStoredThemeMode();

    this.themeModeSubject.next(storedThemeMode);
    this.applyTheme(storedThemeMode);
  }

  getThemeMode(): Observable<ThemeMode> {
    return this.themeModeSubject.asObservable();
  }

  setThemeMode(themeMode: ThemeMode): void {
    this.themeModeSubject.next(themeMode);
    localStorage.setItem(this.storageKey, themeMode);
    this.applyTheme(themeMode);
  }

  getCurrentThemeMode(): ThemeMode {
    return this.themeModeSubject.value;
  }

  private getStoredThemeMode(): ThemeMode {
    const storedThemeMode = localStorage.getItem(this.storageKey);

    if (storedThemeMode === 'light' || storedThemeMode === 'dark' || storedThemeMode === 'system') {
      return storedThemeMode;
    }

    return 'system';
  }

  private applyTheme(themeMode: ThemeMode): void {
    const root = document.documentElement;

    root.classList.remove('theme-light', 'theme-dark');

    if (themeMode === 'light') {
      root.classList.add('theme-light');
      return;
    }

    if (themeMode === 'dark') {
      root.classList.add('theme-dark');
    }
  }
}
