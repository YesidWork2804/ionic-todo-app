import { Component } from '@angular/core';
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
  IonNote,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, folderOpenOutline, saveOutline, trashOutline } from 'ionicons/icons';
import { Observable, map } from 'rxjs';

import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: 'categories.page.html',
  styleUrls: ['categories.page.scss'],
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    NgStyle,
    RouterLink,
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
    IonNote,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class CategoriesPage {
  readonly categories$: Observable<Category[]> = this.categoryService.getCategories();
  readonly totalCategories$: Observable<number> = this.categories$.pipe(map((categories) => categories.length));

  form = {
    id: '',
    name: '',
    color: '#4f46e5',
  };

  readonly presetColors = ['#4f46e5', '#06b6d4', '#22c55e', '#f97316', '#ef4444', '#a855f7'];

  constructor(private readonly categoryService: CategoryService) {
    addIcons({ addOutline, createOutline, folderOpenOutline, saveOutline, trashOutline });
  }

  get isEditing(): boolean {
    return this.form.id.length > 0;
  }

  async submit(): Promise<void> {
    if (this.isEditing) {
      await this.categoryService.updateCategory(this.form.id, {
        name: this.form.name,
        color: this.form.color,
      });
    } else {
      await this.categoryService.addCategory(this.form.name, this.form.color);
    }

    this.resetForm();
  }

  startEdit(category: Category, slidingItem?: IonItemSliding): void {
    this.form = {
      id: category.id,
      name: category.name,
      color: category.color,
    };

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
}
