import { Injectable, inject } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { BehaviorSubject } from 'rxjs';
import { fetchAndActivate, getBoolean, getRemoteConfig } from 'firebase/remote-config';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private readonly firebaseApp = inject(FirebaseApp);
  private readonly showStatisticsSubject = new BehaviorSubject<boolean>(true);
  private remoteConfigInitialized = false;

  readonly showStatistics$ = this.showStatisticsSubject.asObservable();

  constructor() {
    this.scheduleRemoteConfigInitialization();
  }

  private scheduleRemoteConfigInitialization(): void {
    const initialize = () => {
      void this.initializeRemoteConfig();
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => initialize(), { timeout: 2000 });
      return;
    }

    setTimeout(() => initialize(), 1500);
  }

  private async initializeRemoteConfig(): Promise<void> {
    try {
      const remoteConfig = getRemoteConfig(this.firebaseApp);
      remoteConfig.settings = {
        minimumFetchIntervalMillis: 3600000,
        fetchTimeoutMillis: 10000,
      };
      remoteConfig.defaultConfig = {
        show_statistics: true,
      };

      await fetchAndActivate(remoteConfig);
      const showStatisticsValue = getBoolean(remoteConfig, 'show_statistics');

      this.remoteConfigInitialized = true;
      this.showStatisticsSubject.next(showStatisticsValue);
    } catch (error) {
      console.error('Error fetching Remote Config:', error);
      this.showStatisticsSubject.next(true);
    }
  }

  async refreshRemoteConfig(): Promise<void> {
    try {
      const remoteConfig = getRemoteConfig(this.firebaseApp);
      if (!this.remoteConfigInitialized) {
        remoteConfig.settings = {
          minimumFetchIntervalMillis: 0,
          fetchTimeoutMillis: 10000,
        };
        remoteConfig.defaultConfig = {
          show_statistics: true,
        };
      }

      await fetchAndActivate(remoteConfig);
      const showStatisticsValue = getBoolean(remoteConfig, 'show_statistics');

      this.remoteConfigInitialized = true;
      this.showStatisticsSubject.next(showStatisticsValue);
    } catch (error) {
      console.error('Error refreshing Remote Config:', error);
    }
  }
}
