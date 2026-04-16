export interface Task {
  id: string;
  title: string;
  categoryId: string | null;
  completed: boolean;
  createdAt: string;
}
