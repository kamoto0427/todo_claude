const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');
const emptyMsg = document.getElementById('empty-msg');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskCountEl = document.getElementById('task-count');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let currentFilter = 'all';

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function getFiltered() {
  if (currentFilter === 'active') return todos.filter(t => !t.done);
  if (currentFilter === 'done')   return todos.filter(t => t.done);
  return todos;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  const h  = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${y}/${mo}/${da} ${h}:${mi}`;
}

const clockSvg = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
  <circle cx="8" cy="8" r="6.5"/>
  <polyline points="8,4.5 8,8 10.5,10"/>
</svg>`;

function updateCount() {
  const active = todos.filter(t => !t.done).length;
  const prev = taskCountEl.textContent;
  taskCountEl.textContent = active;
  if (String(active) !== prev) {
    taskCountEl.classList.remove('bump');
    void taskCountEl.offsetWidth; // reflow
    taskCountEl.classList.add('bump');
  }
}

function render() {
  const filtered = getFiltered();
  list.innerHTML = '';

  if (filtered.length === 0) {
    emptyMsg.style.display = 'block';
    emptyMsg.innerHTML = '<span class="empty-icon">✦</span>タスクがありません';
  } else {
    emptyMsg.style.display = 'none';
  }

  updateCount();

  filtered.forEach((todo) => {
    const i = todos.indexOf(todo);
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');

    // Checkbox
    const checkWrapper = document.createElement('label');
    checkWrapper.className = 'checkbox-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => {
      todos[i].done = checkbox.checked;
      save();
      render();
    });

    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';

    checkWrapper.appendChild(checkbox);
    checkWrapper.appendChild(checkmark);

    // Content
    const content = document.createElement('div');
    content.className = 'todo-content';

    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = todo.text;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'todo-date';
    if (todo.createdAt) {
      dateSpan.innerHTML = clockSvg + formatDate(todo.createdAt);
    }

    content.appendChild(textSpan);
    content.appendChild(dateSpan);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.addEventListener('click', () => {
      li.classList.add('removing');
      li.addEventListener('animationend', () => {
        todos.splice(i, 1);
        save();
        render();
      }, { once: true });
    });

    li.appendChild(checkWrapper);
    li.appendChild(content);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function addTodo() {
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text, done: false, createdAt: new Date().toISOString() });
  save();
  currentFilter = 'all';
  filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
  render();
  input.value = '';
  input.focus();
}

addBtn.addEventListener('click', addTodo);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

render();
