import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';

import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly storageKey = 'tasks';
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  private storageReady = false;

  constructor(private readonly storage: Storage) {
    void this.init();
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  async addTask(title: string): Promise<void> {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      return;
    }

    await this.ensureStorageReady();

    const nextTasks: Task[] = [
      {
        id: this.createTaskId(),
        title: normalizedTitle,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...this.tasksSubject.value,
    ];

    await this.updateTasks(nextTasks);
  }

  async toggleTask(taskId: string): Promise<void> {
    await this.ensureStorageReady();

    const nextTasks = this.tasksSubject.value.map((task) =>
      task.id === taskId
        ? {
            ...task,
            completed: !task.completed,
          }
        : task,
    );

    await this.updateTasks(nextTasks);
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.ensureStorageReady();

    const nextTasks = this.tasksSubject.value.filter((task) => task.id !== taskId);

    await this.updateTasks(nextTasks);
  }

  private async init(): Promise<void> {
    const storageInstance = await this.storage.create();
    const storedTasks = (await storageInstance.get(this.storageKey)) as Task[] | null;

    this.storageReady = true;
    this.tasksSubject.next(storedTasks ?? []);
  }

  private async ensureStorageReady(): Promise<void> {
    if (this.storageReady) {
      return;
    }

    await this.init();
  }

  private async updateTasks(tasks: Task[]): Promise<void> {
    this.tasksSubject.next(tasks);
    await this.storage.set(this.storageKey, tasks);
  }

  private createTaskId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}
