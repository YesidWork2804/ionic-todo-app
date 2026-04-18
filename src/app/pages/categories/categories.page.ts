import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AsyncPipe, DatePipe, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
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
  IonNote,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, folderOpenOutline, saveOutline, trashOutline } from 'ionicons/icons';
import { Observable, map } from 'rxjs';

import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { ThemeMode, ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-categories',
  templateUrl: 'categories.page.html',
  styleUrls: ['categories.page.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    NgStyle,
    RouterLink,
    ScrollingModule,
    IonBadge,
    IonButton,
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
    IonNote,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTitle,
    IonToolbar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPage {
  readonly categories$: Observable<Category[]> = this.categoryService.getCategories();
  readonly totalCategories$: Observable<number> = this.categories$.pipe(map((categories) => categories.length));
  themeMode: ThemeMode = 'system';
  isCategoryComposerOpen = false;

  form = {
    id: '',
    name: '',
    color: '#4f46e5',
  };

  readonly presetColors = ['#4f46e5', '#06b6d4', '#22c55e', '#f97316', '#ef4444', '#a855f7'];

  constructor(
    private readonly categoryService: CategoryService,
    private readonly themeService: ThemeService,
  ) {
    addIcons({ addOutline, createOutline, folderOpenOutline, saveOutline, trashOutline });
    this.themeMode = this.themeService.getCurrentThemeMode();
  }

  get isEditing(): boolean {
    return this.form.id.length > 0;
  }

  async submit(modal?: IonModal): Promise<void> {
    if (this.isEditing) {
      await this.categoryService.updateCategory(this.form.id, {
        name: this.form.name,
        color: this.form.color,
      });
    } else {
      await this.categoryService.addCategory(this.form.name, this.form.color);
    }

    this.resetForm();

    if (modal) {
      await modal.dismiss();
    }

    this.isCategoryComposerOpen = false;
  }

  startEdit(category: Category, slidingItem?: IonItemSliding): void {
    this.form = {
      id: category.id,
      name: category.name,
      color: category.color,
    };
    this.isCategoryComposerOpen = true;

    if (slidingItem) {
      void slidingItem.close();
    }
  }

  async deleteCategory(categoryId: string, slidingItem?: IonItemSliding): Promise<void> {
    await this.categoryService.deleteCategory(categoryId);

    if (this.form.id === categoryId) {
      this.resetForm();
    }

    if (slidingItem) {
      await slidingItem.close();
    }
  }

  selectColor(color: string): void {
    this.form = {
      ...this.form,
      color,
    };
  }

  resetForm(): void {
    this.form = {
      id: '',
      name: '',
      color: '#4f46e5',
    };
  }

  openCategoryComposer(): void {
    this.isCategoryComposerOpen = true;
  }

  closeCategoryComposer(): void {
    this.isCategoryComposerOpen = false;
    this.resetForm();
  }

  onThemeModeChange(themeMode: ThemeMode): void {
    this.themeMode = themeMode;
    this.themeService.setThemeMode(themeMode);
  }

  isMobileLayout(): boolean {
    return window.innerWidth <= 576;
  }

  getCategoryViewportHeight(categoryCount: number): number {
    const itemHeight = 88;
    const verticalPadding = 20;
    const minimumHeight = 112;
    const maximumHeight = 520;

    if (this.isMobileLayout()) {
      return Math.max(categoryCount * itemHeight + verticalPadding, minimumHeight);
    }

    return Math.min(Math.max(categoryCount * itemHeight + verticalPadding, minimumHeight), maximumHeight);
  }

  trackByCategoryId(_: number, category: Category): string {
    return category.id;
  }
}
