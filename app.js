const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');
const emptyMsg = document.getElementById('empty-msg');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskCountEl = document.getElementById('task-count');
const dueInput = document.getElementById('due-input');
const prioBtns = document.querySelectorAll('.prio-btn');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let currentFilter = 'all';
let selectedPriority = 'medium';

// Priority button selection
prioBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    prioBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPriority = btn.dataset.prio;
  });
});

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

function formatDueDate(dateStr) {
  if (!dateStr) return '';
  const [y, mo, da] = dateStr.split('-');
  return `${y}/${mo}/${da}`;
}

function isOverdue(dateStr, done) {
  if (!dateStr || done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  return due < today;
}

const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' };

const clockSvg = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
  <circle cx="8" cy="8" r="6.5"/>
  <polyline points="8,4.5 8,8 10.5,10"/>
</svg>`;

const calSvg = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="3" width="12" height="11" rx="2"/>
  <line x1="5" y1="1.5" x2="5" y2="4.5"/>
  <line x1="11" y1="1.5" x2="11" y2="4.5"/>
  <line x1="2" y1="7" x2="14" y2="7"/>
</svg>`;

function updateCount() {
  const active = todos.filter(t => !t.done).length;
  const prev = taskCountEl.textContent;
  taskCountEl.textContent = active;
  if (String(active) !== prev) {
    taskCountEl.classList.remove('bump');
    void taskCountEl.offsetWidth;
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
    const overdue = isOverdue(todo.dueDate, todo.done);
    li.className = 'todo-item' + (todo.done ? ' done' : '') + (overdue ? ' overdue' : '');

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

    // Priority badge + text row
    const textRow = document.createElement('div');
    textRow.className = 'text-row';

    const prio = todo.priority || 'medium';
    const prioBadge = document.createElement('span');
    prioBadge.className = `prio-badge prio-${prio}`;
    prioBadge.textContent = PRIORITY_LABEL[prio];

    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = todo.text;

    textRow.appendChild(prioBadge);
    textRow.appendChild(textSpan);

    // Meta row (created + due)
    const metaRow = document.createElement('div');
    metaRow.className = 'meta-row';

    if (todo.createdAt) {
      const dateSpan = document.createElement('span');
      dateSpan.className = 'todo-date';
      dateSpan.innerHTML = clockSvg + formatDate(todo.createdAt);
      metaRow.appendChild(dateSpan);
    }

    if (todo.dueDate) {
      const dueSpan = document.createElement('span');
      dueSpan.className = 'todo-due' + (overdue ? ' overdue-text' : '');
      dueSpan.innerHTML = calSvg + formatDueDate(todo.dueDate) + (overdue ? ' 期限超過' : '');
      metaRow.appendChild(dueSpan);
    }

    content.appendChild(textRow);
    content.appendChild(metaRow);

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
  todos.push({
    text,
    done: false,
    priority: selectedPriority,
    dueDate: dueInput.value || null,
    createdAt: new Date().toISOString()
  });
  save();
  currentFilter = 'all';
  filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
  render();
  input.value = '';
  dueInput.value = '';
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
