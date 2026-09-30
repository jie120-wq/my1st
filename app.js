const STORAGE_KEY = 'my1st-todo-items';
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');
const clearCompletedButton = document.getElementById('clear-completed');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');
const filterButtons = document.querySelectorAll('.filter-button');
const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');

// 從瀏覽器讀取待辦資料，資料不存在或格式錯誤時以空清單開始。
function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(savedTodos) ? savedTodos : [];
  } catch {
    return [];
  }
}

// 將目前待辦清單保存至瀏覽器。
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // 儲存空間無法使用時，仍可在目前頁面操作清單。
  }
}

let todos = loadTodos();
let currentFilter = 'all';
let themeManuallySelected = false;

// 套用主題並更新切換按鈕的提示。
function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  themeIcon.textContent = isDark ? '☀' : '☾';
  themeLabel.textContent = isDark ? '淺色模式' : '深色模式';
  themeToggle.setAttribute('aria-label', `切換為${themeLabel.textContent}`);
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

// 初始主題跟隨作業系統，手動切換只在目前頁面生效。
applyTheme(colorScheme.matches ? 'dark' : 'light');
colorScheme.addEventListener('change', (event) => {
  if (!themeManuallySelected) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
});

themeToggle.addEventListener('click', () => {
  themeManuallySelected = true;
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
});

// 依照篩選條件重繪清單，並統計所有未完成事項。
function renderTodos() {
  list.replaceChildren();

  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  visibleTodos.forEach((todo) => {
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

  emptyState.hidden = visibleTodos.length > 0;
  if (todos.length === 0) {
    emptyState.textContent = '還沒有任何待辦事項,新增一個吧!';
  } else if (currentFilter === 'active') {
    emptyState.textContent = '太棒了，目前沒有未完成的事項。';
  } else {
    emptyState.textContent = '目前沒有已完成的事項。';
  }
  remainingCount.textContent = `未完成:${todos.filter((todo) => !todo.completed).length} 項`;
  clearCompletedButton.disabled = !todos.some((todo) => todo.completed);
}

// 更新目前選取的篩選條件與按鈕狀態。
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle('is-active', isSelected);
      filterButton.setAttribute('aria-pressed', String(isSelected));
    });
    renderTodos();
  });
});

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

// 清除所有已完成項目前先取得使用者確認。
clearCompletedButton.addEventListener('click', () => {
  if (!todos.some((todo) => todo.completed)) return;
  if (!window.confirm('確定要清除所有已完成的待辦事項嗎？')) return;

  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
});

renderTodos();