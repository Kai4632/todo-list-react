// Todo List Application
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.currentPriorityFilter = 'all';
        this.searchTerm = '';
        this.editingTodoId = null;
        
        this.init();
    }

    init() {
        this.loadTodos();
        this.setupEventListeners();
        this.renderTodos();
        this.updateStats();
        this.loadTheme();
    }

    // Local Storage Operations
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const savedTodos = localStorage.getItem('todos');
        this.todos = savedTodos ? JSON.parse(savedTodos) : [];
    }

    saveTheme() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    }

    loadTheme() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.querySelector('#theme-toggle i').className = 'fas fa-sun';
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Add todo
        document.getElementById('add-todo').addEventListener('click', () => this.addTodo());
        document.getElementById('todo-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderTodos();
        });

        // Category filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTodos();
            });
        });

        // Priority filters
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPriorityFilter = e.target.dataset.priority;
                this.renderTodos();
            });
        });

        // Clear buttons
        document.getElementById('clear-completed').addEventListener('click', () => this.clearCompleted());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAll());

        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-edit').addEventListener('click', () => this.closeModal());
        document.getElementById('save-edit').addEventListener('click', () => this.saveEdit());
        
        // Close modal when clicking outside
        document.getElementById('edit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-modal') this.closeModal();
        });
    }

    // Todo Operations
    addTodo() {
        const input = document.getElementById('todo-input');
        const categorySelect = document.getElementById('category-select');
        const prioritySelect = document.getElementById('priority-select');
        
        const text = input.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            category: categorySelect.value,
            priority: prioritySelect.value,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();

        // Reset form
        input.value = '';
        categorySelect.value = 'personal';
        prioritySelect.value = 'low';
        input.focus();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this todo?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.editingTodoId = id;
            document.getElementById('edit-todo-input').value = todo.text;
            document.getElementById('edit-category-select').value = todo.category;
            document.getElementById('edit-priority-select').value = todo.priority;
            document.getElementById('edit-modal').style.display = 'block';
        }
    }

    saveEdit() {
        if (this.editingTodoId === null) return;

        const todo = this.todos.find(t => t.id === this.editingTodoId);
        if (todo) {
            const newText = document.getElementById('edit-todo-input').value.trim();
            if (newText) {
                todo.text = newText;
                todo.category = document.getElementById('edit-category-select').value;
                todo.priority = document.getElementById('edit-priority-select').value;
                this.saveTodos();
                this.renderTodos();
            }
        }

        this.closeModal();
    }

    closeModal() {
        document.getElementById('edit-modal').style.display = 'none';
        this.editingTodoId = null;
    }

    clearCompleted() {
        if (confirm('Are you sure you want to clear all completed todos?')) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
        }
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all todos? This action cannot be undone.')) {
            this.todos = [];
            this.saveTodos();
            this.renderTodos();
            this.updateStats();
        }
    }

    // Theme
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = document.querySelector('#theme-toggle i');
        if (document.body.classList.contains('dark-mode')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        this.saveTheme();
    }

    // Filtering and Rendering
    getFilteredTodos() {
        let filtered = this.todos;

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(todo => 
                todo.text.toLowerCase().includes(this.searchTerm)
            );
        }

        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(todo => todo.category === this.currentFilter);
        }

        // Apply priority filter
        if (this.currentPriorityFilter !== 'all') {
            filtered = filtered.filter(todo => todo.priority === this.currentPriorityFilter);
        }

        return filtered;
    }

    renderTodos() {
        const todoList = document.getElementById('todo-list');
        const emptyState = document.getElementById('empty-state');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        todoList.innerHTML = filteredTodos.map(todo => this.createTodoElement(todo)).join('');
    }

    createTodoElement(todo) {
        const priorityClass = `priority-${todo.priority}`;
        const completedClass = todo.completed ? 'completed' : '';
        
        return `
            <div class="todo-item ${priorityClass} ${completedClass}" data-id="${todo.id}">
                <div class="todo-header">
                    <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                    <div class="todo-actions">
                        <button class="complete-btn" onclick="todoApp.toggleTodo(${todo.id})">
                            <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'}"></i>
                            ${todo.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button class="edit-btn" onclick="todoApp.editTodo(${todo.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="todo-meta">
                    <span class="todo-category">${todo.category}</span>
                    <span class="todo-priority priority-${todo.priority}">${todo.priority}</span>
                    <span class="todo-date">${this.formatDate(todo.createdAt)}</span>
                </div>
            </div>
        `;
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('total-todos').textContent = total;
        document.getElementById('completed-todos').textContent = completed;
        document.getElementById('pending-todos').textContent = pending;
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

// Initialize the app
const todoApp = new TodoApp();

// Add some sample todos for demonstration
if (todoApp.todos.length === 0) {
    const sampleTodos = [
        {
            id: Date.now() - 4,
            text: 'Complete project documentation',
            completed: false,
            category: 'work',
            priority: 'high',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: Date.now() - 3,
            text: 'Buy groceries for the week',
            completed: true,
            category: 'shopping',
            priority: 'medium',
            createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: Date.now() - 2,
            text: 'Go for a 30-minute walk',
            completed: false,
            category: 'health',
            priority: 'low',
            createdAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
            id: Date.now() - 1,
            text: 'Call mom to check in',
            completed: false,
            category: 'personal',
            priority: 'medium',
            createdAt: new Date(Date.now() - 345600000).toISOString()
        }
    ];

    todoApp.todos = sampleTodos;
    todoApp.saveTodos();
    todoApp.renderTodos();
    todoApp.updateStats();
} 