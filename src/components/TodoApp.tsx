import React, { useState, useEffect, useCallback } from "react";
import type { Todo, TodoStats } from "../types/todo";
import "./TodoApp.css";

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const savedTodos = localStorage.getItem("astro-react-todos");
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error("Failed to parse saved todos:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("astro-react-todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInputValue("");
  }, [inputValue]);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const stats: TodoStats = {
    total: todos.length,
    completed: todos.filter((todo) => todo.completed).length,
    remaining: todos.filter((todo) => !todo.completed).length,
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setTodos((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, removed);
      return updated;
    });
    setDraggedIndex(null);
  };

  return (
    <div className="todo-app">
      <div className="todo-container">
        <header className="todo-header">
          <h1>Todo List</h1>
          <p>Time Passing with astro</p>
        </header>

        <div className="todo-input-section">
          <div className="input-group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress} // changed from onKeyPress to onKeyDown
              placeholder="What needs to be done?"
              className="todo-input"
              maxLength={100}
            />
            <button
              onClick={addTodo}
              className="add-button"
              disabled={!inputValue.trim()}
            >
              Add Task
            </button>
          </div>
        </div>

        {todos.length > 0 && (
          <div className="filter-section">
            <div className="filter-buttons">
              <button
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All ({stats.total})
              </button>
              <button
                className={filter === "active" ? "active" : ""}
                onClick={() => setFilter("active")}
              >
                Active ({stats.remaining})
              </button>
              <button
                className={filter === "completed" ? "active" : ""}
                onClick={() => setFilter("completed")}
              >
                Completed ({stats.completed})
              </button>
            </div>
            {stats.completed > 0 && (
              <button onClick={clearCompleted} className="clear-completed">
                Clear Completed
              </button>
            )}
          </div>
        )}

        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              {todos.length === 0 ? (
                <>
                  <h3>No tasks yet</h3>
                  <p>Add a task above to get started!</p>
                </>
              ) : (
                <>
                  <h3>No {filter} tasks</h3>
                  <p>Switch to a different filter to see your tasks.</p>
                </>
              )}
            </div>
          ) : (
            filteredTodos.map((todo, idx) => {
              // Find the index in the full todos array for drag-and-drop
              const todoIndex = todos.findIndex((t) => t.id === todo.id);
              return (
                <div
                  key={todo.id}
                  className={`todo-item${todo.completed ? " completed" : ""}${
                    hoveredId === todo.id ? " hovered" : ""
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(todoIndex)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(todoIndex)}
                  style={{ cursor: "grab" }}
                  onMouseEnter={() => setHoveredId(todo.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="todo-checkbox"
                  />
                  <span className="todo-text">{todo.text}</span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-button"
                    aria-label="Delete todo"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>

        {todos.length > 0 && (
          <div className="todo-stats">
            <span>{stats.remaining} remaining</span>
            <span>{stats.completed} completed</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoApp;
