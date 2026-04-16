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
  IonModal,
  IonProgressBar,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, 
  checkmarkDoneOutline, 
  createOutline, 
  folderOpenOutline, 
  trashOutline,
  refreshOutline
} from 'ionicons/icons';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';

import { Category } from '../../models/category.model';
import { Task } from '../../models/task.model';
import { CategoryService } from '../../services/category.service';
import { TaskService } from '../../services/task.service';
import { ThemeMode, ThemeService } from '../../services/theme.service';
import { FirebaseService } from '../../services/firebase.service';

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
    IonModal,
    IonProgressBar,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage {
  private readonly selectedFilterCategoryIdSubject = new BehaviorSubject<string>('');

  readonly categories$: Observable<Category[]> = this.categoryService.getCategories();
  readonly tasks$: Observable<Task[]> = this.taskService.getTasks();
  readonly filteredTasks$: Observable<Task[]> = combineLatest([
    this.tasks$,
    this.categories$,
    this.selectedFilterCategoryIdSubject,
  ]).pipe(
    map(([tasks, categories, selectedFilterCategoryId]) =>
      tasks.filter((task) => {
        if (!selectedFilterCategoryId) {
          return true;
        }

        if (selectedFilterCategoryId === 'uncategorized') {
          return task.categoryId === null;
        }

        return task.categoryId === selectedFilterCategoryId && categories.some((category) => category.id === task.categoryId);
      }),
    ),
  );
  readonly pendingCount$: Observable<number> = this.filteredTasks$.pipe(
    map((tasks) => tasks.filter((task) => !task.completed).length),
  );
  readonly completedCount$: Observable<number> = this.filteredTasks$.pipe(
    map((tasks) => tasks.filter((task) => task.completed).length),
  );
  readonly totalCount$: Observable<number> = this.filteredTasks$.pipe(
    map((tasks) => tasks.length),
  );
  readonly progressPercentage$: Observable<number> = combineLatest([
    this.filteredTasks$,
  ]).pipe(
    map(([tasks]) => {
      if (tasks.length === 0) return 0;
      const completed = tasks.filter((task) => task.completed).length;
      return Math.round((completed / tasks.length) * 100);
    }),
  );
  readonly progressValue$: Observable<number> = this.progressPercentage$.pipe(
    map((progressPercentage) => progressPercentage / 100),
  );

  readonly showStatistics$ = this.firebaseService.showStatistics$;

  newTaskTitle = '';
  selectedCategoryId: string | null = null;
  selectedFilterCategoryId = '';
  themeMode: ThemeMode = 'system';
  isTaskComposerOpen = false;
  isRefreshingConfig = false;

  constructor(
    private readonly taskService: TaskService,
    private readonly categoryService: CategoryService,
    private readonly themeService: ThemeService,
    private readonly firebaseService: FirebaseService,
  ) {
    addIcons({ addOutline, checkmarkDoneOutline, createOutline, folderOpenOutline, trashOutline, refreshOutline });
    this.themeMode = this.themeService.getCurrentThemeMode();
  }

  async refreshFirebaseConfig(): Promise<void> {
    this.isRefreshingConfig = true;

    try {
      await this.firebaseService.refreshRemoteConfig();
    } finally {
      this.isRefreshingConfig = false;
    }
  }

  async addTask(modal?: IonModal): Promise<void> {
    await this.taskService.addTask(this.newTaskTitle, this.selectedCategoryId);
    this.newTaskTitle = '';
    this.selectedCategoryId = null;

    if (modal) {
      await modal.dismiss();
    }

    this.isTaskComposerOpen = false;
  }

  openTaskComposer(): void {
    this.isTaskComposerOpen = true;
  }

  closeTaskComposer(): void {
    this.isTaskComposerOpen = false;
    this.newTaskTitle = '';
    this.selectedCategoryId = null;
  }

  getCategoryName(categoryId: string | null, categories: Category[]): string {
    if (!categoryId) {
      return 'Sin categoría';
    }

    return categories.find((category) => category.id === categoryId)?.name ?? 'Sin categoría';
  }

  getCategoryColor(categoryId: string | null, categories: Category[]): string {
    if (!categoryId) {
      return 'var(--ion-color-medium)';
    }

    return categories.find((category) => category.id === categoryId)?.color ?? 'var(--ion-color-medium)';
  }

  onFilterCategoryChange(categoryId: string): void {
    this.selectedFilterCategoryId = categoryId;
    this.selectedFilterCategoryIdSubject.next(categoryId);
  }

  onThemeModeChange(themeMode: ThemeMode): void {
    this.themeMode = themeMode;
    this.themeService.setThemeMode(themeMode);
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
