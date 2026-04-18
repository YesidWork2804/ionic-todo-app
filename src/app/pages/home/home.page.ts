import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
  trashOutline
} from 'ionicons/icons';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';

import { Category } from '../../models/category.model';
import { Task } from '../../models/task.model';
import { CategoryService } from '../../services/category.service';
import { TaskService } from '../../services/task.service';
import { ThemeMode, ThemeService } from '../../services/theme.service';
import { FirebaseService } from '../../services/firebase.service';

type TaskViewModel = Task & {
  categoryName: string;
  categoryColor: string;
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    NgClass,
    RouterLink,
    ScrollingModule,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  readonly taskViewModels$: Observable<TaskViewModel[]> = combineLatest([this.filteredTasks$, this.categories$]).pipe(
    map(([tasks, categories]) => {
      const categoryMap = new Map(categories.map((category) => [category.id, category]));

      return tasks.map((task) => {
        const category = task.categoryId ? categoryMap.get(task.categoryId) : null;

        return {
          ...task,
          categoryName: category?.name ?? 'Sin categoría',
          categoryColor: category?.color ?? 'var(--ion-color-medium)',
        };
      });
    }),
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

  constructor(
    private readonly taskService: TaskService,
    private readonly categoryService: CategoryService,
    private readonly themeService: ThemeService,
    private readonly firebaseService: FirebaseService,
  ) {
    addIcons({ addOutline, checkmarkDoneOutline, createOutline, folderOpenOutline, trashOutline });
    this.themeMode = this.themeService.getCurrentThemeMode();
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

  getTaskViewportHeight(taskCount: number): number {
    const itemHeight = 116;
    const verticalPadding = 20;
    const minimumHeight = 140;
    const maximumHeight = 560;

    return Math.min(Math.max(taskCount * itemHeight + verticalPadding, minimumHeight), maximumHeight);
  }

  trackByTaskId(_: number, task: Task): string {
    return task.id;
  }

  trackByCategoryId(_: number, category: Category): string {
    return category.id;
  }
}
