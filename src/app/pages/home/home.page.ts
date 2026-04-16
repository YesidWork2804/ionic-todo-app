import { Component } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonNote,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, checkmarkDoneOutline, trashOutline } from 'ionicons/icons';
import { Observable, map } from 'rxjs';

import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    NgClass,
    IonBadge,
    IonButton,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonNote,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage {
  readonly tasks$: Observable<Task[]> = this.taskService.getTasks();
  readonly pendingCount$: Observable<number> = this.tasks$.pipe(
    map((tasks) => tasks.filter((task) => !task.completed).length),
  );
  readonly completedCount$: Observable<number> = this.tasks$.pipe(
    map((tasks) => tasks.filter((task) => task.completed).length),
  );

  newTaskTitle = '';

  constructor(private readonly taskService: TaskService) {
    addIcons({ addOutline, checkmarkDoneOutline, trashOutline });
  }

  async addTask(): Promise<void> {
    await this.taskService.addTask(this.newTaskTitle);
    this.newTaskTitle = '';
  }

  async toggleTask(taskId: string): Promise<void> {
    await this.taskService.toggleTask(taskId);
  }

  async deleteTask(taskId: string, slidingItem?: IonItemSliding): Promise<void> {
    await this.taskService.deleteTask(taskId);

    if (slidingItem) {
      await slidingItem.close();
    }
  }

  trackByTaskId(_: number, task: Task): string {
    return task.id;
  }
}
