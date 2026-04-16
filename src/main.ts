import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule } from '@ionic/storage-angular';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

const firebaseConfig = {
  apiKey: "AIzaSyBZ-GOoQYoAH-V8yLzGyjaxEOtC4Te9c0o",
  authDomain: "ionic-todo-app-40744.firebaseapp.com",
  projectId: "ionic-todo-app-40744",
  storageBucket: "ionic-todo-app-40744.firebasestorage.app",
  messagingSenderId: "576810844575",
  appId: "1:576810844575:web:a1eb451a99b0de96af3daa",
  measurementId: "G-9RNWFELJT4"
};

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(IonicStorageModule.forRoot()),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
  ],
});
