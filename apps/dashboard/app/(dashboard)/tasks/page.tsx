import { TaskBoard } from "@/components/tasks/TaskBoard";

export default function TasksPage() {
  return (
    <div className="flex flex-col min-h-full p-6 lg:p-10 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <TaskBoard />
    </div>
  );
}
