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

  readonly showStatistics$ = this.showStatisticsSubject.asObservable();

  constructor() {
    this.initializeRemoteConfig();
  }

  private async initializeRemoteConfig(): Promise<void> {
    try {
      const remoteConfig = getRemoteConfig(this.firebaseApp);
      remoteConfig.settings = {
        minimumFetchIntervalMillis: 0,
        fetchTimeoutMillis: 60000,
      };
      remoteConfig.defaultConfig = {
        show_statistics: true,
      };

      await fetchAndActivate(remoteConfig);
      const showStatisticsValue = getBoolean(remoteConfig, 'show_statistics');

      this.showStatisticsSubject.next(showStatisticsValue);
    } catch (error) {
      console.error('Error fetching Remote Config:', error);
      console.log('Using default value: true');
      this.showStatisticsSubject.next(true);
    }
  }

  async refreshRemoteConfig(): Promise<void> {
    try {
      const remoteConfig = getRemoteConfig(this.firebaseApp);
      await fetchAndActivate(remoteConfig);
      const showStatisticsValue = getBoolean(remoteConfig, 'show_statistics');
      console.log('show_statistics value after refresh:', showStatisticsValue);
      this.showStatisticsSubject.next(showStatisticsValue);
    } catch (error) {
      console.error('Error refreshing Remote Config:', error);
    }
  }
}
