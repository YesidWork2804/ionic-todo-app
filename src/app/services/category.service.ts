import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';

import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly storageKey = 'categories';
  private readonly categoriesSubject = new BehaviorSubject<Category[]>([]);
  private storageReady = false;

  constructor(private readonly storage: Storage) {
    void this.init();
  }

  getCategories(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }

  async getCategoryById(categoryId: string): Promise<Category | undefined> {
    await this.ensureStorageReady();

    return this.categoriesSubject.value.find((category) => category.id === categoryId);
  }

  async addCategory(name: string, color = '#4f46e5'): Promise<void> {
    const normalizedName = name.trim();

    if (!normalizedName) {
      return;
    }

    await this.ensureStorageReady();

    const now = new Date().toISOString();
    const nextCategories: Category[] = [
      {
        id: this.createCategoryId(),
        name: normalizedName,
        color,
        createdAt: now,
        updatedAt: now,
      },
      ...this.categoriesSubject.value,
    ];

    await this.updateCategories(nextCategories);
  }

  async updateCategory(categoryId: string, changes: Partial<Pick<Category, 'name' | 'color'>>): Promise<void> {
    await this.ensureStorageReady();

    const normalizedName = changes.name?.trim();
    const nextCategories = this.categoriesSubject.value.map((category) => {
      if (category.id !== categoryId) {
        return category;
      }

      return {
        ...category,
        name: normalizedName && normalizedName.length > 0 ? normalizedName : category.name,
        color: changes.color ?? category.color,
        updatedAt: new Date().toISOString(),
      };
    });

    await this.updateCategories(nextCategories);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.ensureStorageReady();

    const nextCategories = this.categoriesSubject.value.filter((category) => category.id !== categoryId);

    await this.updateCategories(nextCategories);
  }

  private async init(): Promise<void> {
    const storageInstance = await this.storage.create();
    const storedCategories = (await storageInstance.get(this.storageKey)) as Category[] | null;

    this.storageReady = true;
    this.categoriesSubject.next(storedCategories ?? []);
  }

  private async ensureStorageReady(): Promise<void> {
    if (this.storageReady) {
      return;
    }

    await this.init();
  }

  private async updateCategories(categories: Category[]): Promise<void> {
    this.categoriesSubject.next(categories);
    await this.storage.set(this.storageKey, categories);
  }

  private createCategoryId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}
