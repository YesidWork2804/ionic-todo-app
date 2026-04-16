import { Component } from '@angular/core';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { listOutline, folderOpenOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon],
})
export class TabsPage {
  constructor() {
    addIcons({ listOutline, folderOpenOutline });
  }
}
