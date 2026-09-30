const STORAGE_KEY = 'my1st-todo-items';
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');

// 從瀏覽器載入已儲存的待辦事項。
function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(savedTodos) ? savedTodos : [];
  } catch {
    return [];
  }
}

let todos = loadTodos();

// 將目前清單存回瀏覽器。
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // 儲存空間無法使用時，清單仍可在目前頁面操作。
  }
}

// 依照目前資料重繪清單與未完成數量。
function renderTodos() {
  list.replaceChildren();

  todos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = todo.completed ? 'todo-item is-completed' : 'todo-item';
    item.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.className = 'todo-checkbox';
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記「${todo.text}」為已完成`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = '×';
    deleteButton.setAttribute('aria-label', `刪除「${todo.text}」`);

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  emptyState.hidden = todos.length > 0;
  remainingCount.textContent = `未完成:${todos.filter((todo) => !todo.completed).length} 項`;
}

// 新增前先去除頭尾空白，空白內容不會進入清單。
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    completed: false,
  });
  saveTodos();
  renderTodos();
  input.value = '';
  input.focus();
});

// 使用事件委派處理各筆待辦的勾選與刪除。
list.addEventListener('change', (event) => {
  if (!event.target.matches('.todo-checkbox')) return;
  const item = event.target.closest('.todo-item');
  const todo = todos.find((entry) => entry.id === item.dataset.id);
  if (!todo) return;

  todo.completed = event.target.checked;
  saveTodos();
  renderTodos();
});

list.addEventListener('click', (event) => {
  if (!event.target.matches('.delete-button')) return;
  const item = event.target.closest('.todo-item');
  todos = todos.filter((todo) => todo.id !== item.dataset.id);
  saveTodos();
  renderTodos();
});

renderTodos();
