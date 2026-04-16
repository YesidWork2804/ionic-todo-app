import { Component } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, checkmarkDoneOutline, trashOutline } from 'ionicons/icons';
import { Observable, combineLatest, map } from 'rxjs';

import { Category } from '../../models/category.model';
import { Task } from '../../models/task.model';
import { CategoryService } from '../../services/category.service';
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
    RouterLink,
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
    IonSelect,
    IonSelectOption,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage {
  readonly categories$: Observable<Category[]> = this.categoryService.getCategories();
  readonly tasks$: Observable<Task[]> = this.taskService.getTasks();
  readonly filteredTasks$: Observable<Task[]> = combineLatest([this.tasks$, this.categories$]).pipe(
    map(([tasks, categories]) =>
      tasks.filter((task) => {
        if (!this.selectedFilterCategoryId) {
          return true;
        }

        if (this.selectedFilterCategoryId === 'uncategorized') {
          return task.categoryId === null;
        }

        return task.categoryId === this.selectedFilterCategoryId && categories.some((category) => category.id === task.categoryId);
      }),
    ),
  );
  readonly pendingCount$: Observable<number> = this.filteredTasks$.pipe(
    map((tasks) => tasks.filter((task) => !task.completed).length),
  );
  readonly completedCount$: Observable<number> = this.filteredTasks$.pipe(
    map((tasks) => tasks.filter((task) => task.completed).length),
  );

  newTaskTitle = '';
  selectedCategoryId: string | null = null;
  selectedFilterCategoryId = '';

  constructor(
    private readonly taskService: TaskService,
    private readonly categoryService: CategoryService,
  ) {
    addIcons({ addOutline, checkmarkDoneOutline, trashOutline });
  }

  async addTask(): Promise<void> {
    await this.taskService.addTask(this.newTaskTitle, this.selectedCategoryId);
    this.newTaskTitle = '';
    this.selectedCategoryId = null;
  }

  getCategoryName(categoryId: string | null, categories: Category[]): string {
    if (!categoryId) {
      return 'Sin categoría';
    }

    return categories.find((category) => category.id === categoryId)?.name ?? 'Sin categoría';
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
