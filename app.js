/* ==========================================================================
   Planejamento de Casamento - JavaScript Application Engine
   ========================================================================= */

const STORAGE_KEY = 'casamento_planejamento_app_v1';

// Initial / Pre-seeded Sample Data
const defaultCategories = [
    'Fotógrafo',
    'Filmagem',
    'Espaço',
    'DJ',
    'Decoração',
    'Buffet & Gastronomia',
    'Assessoria & Cerimonial',
    'Doces & Bolo',
    'Convites & Papelaria',
    'Cabelo & Maquiagem'
];

const defaultConvidados = [
    { id: '1', nome: 'Ana Paula Souza', origem: 'Noiva', funcao: 'Madrinha', precoJantar: 79.90, observacao: 'Vestido Rose' },
    { id: '2', nome: 'Carlos Eduardo Santos', origem: 'Noivo', funcao: 'Padrinho', precoJantar: 79.90, observacao: 'Terno Grafite' },
    { id: '3', nome: 'Lucas Souza', origem: 'Noiva', funcao: 'Pajem', precoJantar: 39.95, observacao: 'Meia-entrada (Criança)' },
    { id: '4', nome: 'Beatriz Lima', origem: 'Noivo', funcao: 'Daminha', precoJantar: 0.00, observacao: 'Não Paga (Criança 3 anos)' },
    { id: '5', nome: 'Sofia Alves', origem: 'Noiva', funcao: 'Florista', precoJantar: 39.95, observacao: 'Cesta de pétalas' },
    { id: '6', nome: 'Roberto Oliveira', origem: 'Noivo', funcao: '', precoJantar: 79.90, observacao: 'Tio' }
];

const defaultOrcamentos = [
    {
        id: '101',
        nome: 'Studio Lumina Fotografia',
        servico: 'Fotógrafo',
        valor: 4800.00,
        possuiEntrada: true,
        valorEntrada: 1000.00,
        valorPago: 1000.00,
        observacao: 'Inclui pré-wedding + álbum 30x30 cm + 2 fotógrafos no dia',
        aprovado: true,
        dataAprovacao: '2026-09-10'
    },
    {
        id: '102',
        nome: 'CineLover Films',
        servico: 'Filmagem',
        valor: 5200.00,
        possuiEntrada: false,
        valorEntrada: 0,
        valorPago: 0,
        observacao: 'Teaser 1 min + filme completo 20 min + drone',
        aprovado: false,
        dataAprovacao: null
    },
    {
        id: '103',
        nome: 'Espaço Jardim Real',
        servico: 'Espaço',
        valor: 14500.00,
        possuiEntrada: true,
        valorEntrada: 3000.00,
        valorPago: 3000.00,
        observacao: 'Espaço com ar condicionado, gerador e camarim da noiva inclusos',
        aprovado: true,
        dataAprovacao: '2026-09-12'
    },
    {
        id: '104',
        nome: 'DJ & Iluminação Pro',
        servico: 'DJ',
        valor: 3200.00,
        possuiEntrada: false,
        valorEntrada: 0,
        valorPago: 0,
        observacao: 'Estrutura de luzes robóticas + fumaça + som completo',
        aprovado: false,
        dataAprovacao: null
    }
];

// Global Application State
let appState = {
    valorGuardado: 0,
    categories: [...defaultCategories],
    convidados: [...defaultConvidados],
    orcamentos: [...defaultOrcamentos],
    currentView: 'dashboardView',
    convidadoFilter: 'todos',
    orcamentoFilter: 'todos',
    convidadoViewMode: 'cards',
    orcamentoViewMode: 'cards',
    fechadoViewMode: 'cards',
    convidadoSort: { key: 'nome', dir: 'asc' },
    orcamentoSort: { key: 'nome', dir: 'asc' },
    fechadoSort: { key: 'servico', dir: 'asc' }
};

function setConvidadoViewMode(mode) {
    appState.convidadoViewMode = mode;
    const btnCards = document.getElementById('btnToggleCardsConvidados');
    const btnTable = document.getElementById('btnToggleTableConvidados');
    const grid = document.getElementById('cardsConvidados');
    const table = document.getElementById('tableContainerConvidados');
    if (btnCards) btnCards.classList.toggle('active', mode === 'cards');
    if (btnTable) btnTable.classList.toggle('active', mode === 'table');
    if (grid) grid.classList.toggle('hidden', mode !== 'cards');
    if (table) table.classList.toggle('hidden', mode !== 'table');
}

function setOrcamentoViewMode(mode) {
    appState.orcamentoViewMode = mode;
    const btnCards = document.getElementById('btnToggleCardsOrcamentos');
    const btnTable = document.getElementById('btnToggleTableOrcamentos');
    const grid = document.getElementById('cardsOrcamentos');
    const table = document.getElementById('tableContainerOrcamentos');
    if (btnCards) btnCards.classList.toggle('active', mode === 'cards');
    if (btnTable) btnTable.classList.toggle('active', mode === 'table');
    if (grid) grid.classList.toggle('hidden', mode !== 'cards');
    if (table) table.classList.toggle('hidden', mode !== 'table');
}

function setFechadoViewMode(mode) {
    appState.fechadoViewMode = mode;
    const btnCards = document.getElementById('btnToggleCardsFechados');
    const btnTable = document.getElementById('btnToggleTableFechados');
    const grid = document.getElementById('cardsFechados');
    const table = document.getElementById('tableContainerFechados');
    if (btnCards) btnCards.classList.toggle('active', mode === 'cards');
    if (btnTable) btnTable.classList.toggle('active', mode === 'table');
    if (grid) grid.classList.toggle('hidden', mode !== 'cards');
    if (table) table.classList.toggle('hidden', mode !== 'table');
}

// Generic Sorting Helper
function sortItems(arr, key, dir) {
    return arr.sort((a, b) => {
        let valA, valB;
        if (key === 'valorPago') {
            valA = a.valorPago || 0;
            valB = b.valorPago || 0;
        } else if (key === 'valorFalta') {
            valA = (a.valor || 0) - (a.valorPago || 0);
            valB = (b.valor || 0) - (b.valorPago || 0);
        } else {
            valA = a[key] ?? '';
            valB = b[key] ?? '';
        }

        if (typeof valA === 'boolean') {
            valA = valA ? 1 : 0;
            valB = valB ? 1 : 0;
        } else if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
    });
}

function updateSortIcons(rowId, currentKey, dir) {
    const row = document.getElementById(rowId);
    if (!row) return;
    row.querySelectorAll('th.sortable').forEach(th => {
        const key = th.getAttribute('data-sort-key');
        const icon = th.querySelector('.sort-icon');
        if (key === currentKey) {
            th.classList.add('active');
            if (icon) {
                icon.className = dir === 'asc' ? 'fa-solid fa-arrow-up-short-wide sort-icon' : 'fa-solid fa-arrow-down-wide-short sort-icon';
            }
        } else {
            th.classList.remove('active');
            if (icon) {
                icon.className = 'fa-solid fa-sort sort-icon';
            }
        }
    });
}

function toggleConvidadoSort(key) {
    if (appState.convidadoSort.key === key) {
        appState.convidadoSort.dir = appState.convidadoSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
        appState.convidadoSort = { key, dir: 'asc' };
    }
    renderConvidadosTable();
}

function toggleOrcamentoSort(key) {
    if (appState.orcamentoSort.key === key) {
        appState.orcamentoSort.dir = appState.orcamentoSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
        appState.orcamentoSort = { key, dir: 'asc' };
    }
    renderOrcamentosTable();
}

function toggleFechadoSort(key) {
    if (appState.fechadoSort.key === key) {
        appState.fechadoSort.dir = appState.fechadoSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
        appState.fechadoSort = { key, dir: 'asc' };
    }
    renderFechadosTable();
}

// Format currency helper (3 casas decimais)
function formatCurrency(val) {
    const num = Number(val) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

// Format Date helper
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
}

/* ==========================================================================
   LocalStorage Persistence
   ========================================================================== */
function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            appState.categories = parsed.categories && parsed.categories.length ? parsed.categories : defaultCategories;
            appState.convidados = parsed.convidados || [];
            appState.orcamentos = parsed.orcamentos || [];
            appState.valorGuardado = parsed.valorGuardado || 0;
        }
    } catch (e) {
        console.error('Erro ao carregar do localStorage', e);
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            categories: appState.categories,
            convidados: appState.convidados,
            orcamentos: appState.orcamentos,
            valorGuardado: appState.valorGuardado
        }));
    } catch (e) {
        console.error('Erro ao salvar no localStorage', e);
    }
}

function salvarValorGuardado() {
    const input = document.getElementById('valorGuardadoInput');
    if (!input) return;
    const val = parseFloat(input.value) || 0;
    appState.valorGuardado = val;
    saveState();
    if (typeof dbSaveValorGuardado === 'function') {
        dbSaveValorGuardado(val);
    }
    renderDashboard();
    alert(`Valor guardado atualizado para ${formatCurrency(val)}! 💰`);
}

/* ==========================================================================
   Navigation & View Switching
   ========================================================================== */
function initNavigation() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const btnHamburger = document.getElementById('btnHamburger');
    const btnCloseSidebar = document.getElementById('btnCloseSidebar');

    function openSidebar() {
        sidebar.classList.add('active');
        backdrop.classList.add('active');
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        backdrop.classList.remove('active');
    }

    btnHamburger.addEventListener('click', openSidebar);
    btnCloseSidebar.addEventListener('click', closeSidebar);
    backdrop.addEventListener('click', closeSidebar);

    // Nav Links click
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const viewTarget = btn.getAttribute('data-view');
            if (viewTarget) {
                switchView(viewTarget);
                if (window.innerWidth < 1024) {
                    closeSidebar();
                }
            }
        });
    });
}

function switchView(viewId) {
    appState.currentView = viewId;

    // Update active section
    document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.remove('active');
    });
    const targetSec = document.getElementById(viewId);
    if (targetSec) targetSec.classList.add('active');

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
    });

    // Update Topbar Title
    const titles = {
        'dashboardView': 'Visão Geral do Planejamento',
        'convidadosView': '1. Gestão de Convidados & Jantar',
        'orcamentosView': '2. Orçamentos & Propostas',
        'servicosFechadosView': '3. Serviços & Contratos Fechados'
    };
    document.getElementById('pageTitle').textContent = titles[viewId] || 'Planejamento de Casamento';

    // Refresh views data
    renderAll();
}

/* ==========================================================================
   Category Management Modal
   ========================================================================== */
function initCategoryManager() {
    const modal = document.getElementById('modalCategoryManager');
    const btnOpen = document.getElementById('btnOpenCategoryManager');
    const btnQuickAdd = document.getElementById('btnQuickAddCategory');
    const btnClose = document.getElementById('btnCloseCategoryModal');
    const btnCloseFooter = document.getElementById('btnCloseCategoryModalFooter');
    const formAdd = document.getElementById('formAddCategory');
    const inputNew = document.getElementById('newCategoryInput');

    function openModal() { modal.classList.add('active'); renderCategoryList(); }
    function closeModal() { modal.classList.remove('active'); }

    btnOpen.addEventListener('click', openModal);
    if (btnQuickAdd) btnQuickAdd.addEventListener('click', openModal);
    btnClose.addEventListener('click', closeModal);
    btnCloseFooter.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    formAdd.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = inputNew.value.trim();
        if (val && !appState.categories.includes(val)) {
            appState.categories.push(val);
            saveState();
            if (typeof dbSaveCategories === 'function') dbSaveCategories(appState.categories);
            inputNew.value = '';
            renderCategoryList();
            populateCategorySelect();
        }
    });
}

function renderCategoryList() {
    const ul = document.getElementById('categoryList');
    ul.innerHTML = '';
    appState.categories.forEach(cat => {
        const li = document.createElement('li');
        li.className = 'category-chip';
        li.innerHTML = `
            <span>${cat}</span>
            <button type="button" title="Excluir categoria" onclick="deleteCategory('${cat}')">&times;</button>
        `;
        ul.appendChild(li);
    });
}

function deleteCategory(catName) {
    // Check if category is in use by any quote
    const inUse = appState.orcamentos.some(o => o.servico === catName);
    if (inUse) {
        alert(`A categoria "${catName}" não pode ser excluída pois possui orçamentos associados a ela.`);
        return;
    }
    appState.categories = appState.categories.filter(c => c !== catName);
    saveState();
    if (typeof dbSaveCategories === 'function') dbSaveCategories(appState.categories);
    renderCategoryList();
    populateCategorySelect();
}

function populateCategorySelect() {
    const select = document.getElementById('orcamentoServico');
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="" disabled selected>Selecione uma categoria...</option>';
    appState.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
    if (currentVal && appState.categories.includes(currentVal)) {
        select.value = currentVal;
    }
}

/* ==========================================================================
   CONVIDADOS MODULE
   ========================================================================== */
function setJantarPreset(val) {
    const input = document.getElementById('convidadoPrecoJantar');
    if (input) {
        input.value = val;
        input.focus();
    }
}

function initConvidados() {
    const form = document.getElementById('formConvidado');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('convidadoId').value;
        const nome = document.getElementById('convidadoNome').value.trim();
        const origem = document.getElementById('convidadoOrigem').value;
        const funcao = document.getElementById('convidadoFuncao').value;
        const precoJantar = parseFloat(document.getElementById('convidadoPrecoJantar').value) || 0;
        const observacao = document.getElementById('convidadoObservacao').value.trim();

        let targetItem;
        if (id) {
            // Edit
            targetItem = appState.convidados.find(c => c.id === id);
            if (targetItem) {
                targetItem.nome = nome;
                targetItem.origem = origem;
                targetItem.funcao = funcao;
                targetItem.precoJantar = precoJantar;
                targetItem.observacao = observacao;
            }
        } else {
            // Create
            targetItem = {
                id: Date.now().toString(),
                nome,
                origem,
                funcao,
                precoJantar,
                observacao
            };
            appState.convidados.push(targetItem);
        }

        saveState();
        if (targetItem && typeof dbSaveConvidado === 'function') dbSaveConvidado(targetItem);
        resetConvidadoForm();
        renderConvidadosTable();
        renderDashboard();
    });
}

function resetConvidadoForm() {
    document.getElementById('formConvidado').reset();
    document.getElementById('convidadoId').value = '';
    document.getElementById('convidadoFuncao').value = '';
    document.getElementById('convidadoFormTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Novo Convidado';
    document.getElementById('btnSalvarConvidado').innerHTML = '<i class="fa-solid fa-check"></i> Salvar Convidado';
    document.getElementById('btnCancelarConvidado').classList.add('hidden');
}

function editConvidado(id) {
    const item = appState.convidados.find(c => c.id === id);
    if (!item) return;
    document.getElementById('convidadoId').value = item.id;
    document.getElementById('convidadoNome').value = item.nome;
    document.getElementById('convidadoOrigem').value = item.origem;
    document.getElementById('convidadoFuncao').value = item.funcao || '';
    document.getElementById('convidadoPrecoJantar').value = item.precoJantar;
    document.getElementById('convidadoObservacao').value = item.observacao || '';

    document.getElementById('convidadoFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Convidado';
    document.getElementById('btnSalvarConvidado').innerHTML = '<i class="fa-solid fa-save"></i> Atualizar Convidado';
    document.getElementById('btnCancelarConvidado').classList.remove('hidden');

    // Scroll form into view on mobile
    if (window.innerWidth < 900) {
        document.getElementById('convidadoFormTitle').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteConvidado(id) {
    if (confirm('Tem certeza que deseja remover este convidado?')) {
        appState.convidados = appState.convidados.filter(c => c.id !== id);
        saveState();
        if (typeof dbDeleteConvidado === 'function') dbDeleteConvidado(id);
        renderConvidadosTable();
        renderDashboard();
    }
}

function setConvidadoFilter(filter) {
    appState.convidadoFilter = filter;
    document.querySelectorAll('[data-filter]').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-filter') === filter);
    });
    renderConvidadosTable();
}

function renderConvidadosTable() {
    const tbody = document.getElementById('tbodyConvidados');
    const search = document.getElementById('searchConvidado').value.toLowerCase();
    tbody.innerHTML = '';

    // Calculate Summary Counts
    const countTodos = appState.convidados.length;
    const countNoiva = appState.convidados.filter(c => c.origem === 'Noiva').length;
    const countNoivo = appState.convidados.filter(c => c.origem === 'Noivo').length;

    document.getElementById('countFilterTodos').textContent = countTodos;
    document.getElementById('countFilterNoiva').textContent = countNoiva;
    document.getElementById('countFilterNoivo').textContent = countNoivo;

    // Filter list
    let filtered = appState.convidados.filter(c => {
        const matchesFilter = appState.convidadoFilter === 'todos' || c.origem === appState.convidadoFilter;
        const matchesSearch = c.nome.toLowerCase().includes(search) ||
            (c.funcao && c.funcao.toLowerCase().includes(search)) ||
            (c.observacao && c.observacao.toLowerCase().includes(search));
        return matchesFilter && matchesSearch;
    });

    // Apply Column Sorting & Update Header Icons
    updateSortIcons('thRowConvidados', appState.convidadoSort.key, appState.convidadoSort.dir);
    sortItems(filtered, appState.convidadoSort.key, appState.convidadoSort.dir);

    // Summary math
    const totalPessoas = filtered.length;
    const totalJantarNoiva = appState.convidados.filter(c => c.origem === 'Noiva').reduce((acc, c) => acc + c.precoJantar, 0);
    const totalJantarNoivo = appState.convidados.filter(c => c.origem === 'Noivo').reduce((acc, c) => acc + c.precoJantar, 0);
    const totalJantarGeral = totalJantarNoiva + totalJantarNoivo;

    document.getElementById('summaryTotalPessoas').textContent = totalPessoas;
    document.getElementById('summaryJantarNoiva').textContent = formatCurrency(totalJantarNoiva);
    document.getElementById('summaryJantarNoivo').textContent = formatCurrency(totalJantarNoivo);
    document.getElementById('summaryJantarTotal').textContent = formatCurrency(totalJantarGeral);

    // Render both Table and Cards
    renderConvidadosCards(filtered);
    setConvidadoViewMode(appState.convidadoViewMode);

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fa-solid fa-users-slash"></i>
                    <p>Nenhum convidado encontrado.</p>
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(c => {
        const tr = document.createElement('tr');
        const badgeFuncaoClass = c.funcao ? c.funcao.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') : 'comum';
        const funcaoLabel = c.funcao ? c.funcao : 'Convidado(a)';

        tr.innerHTML = `
            <td><strong>${c.nome}</strong></td>
            <td><span class="badge-origem ${c.origem}">${c.origem}</span></td>
            <td><span class="badge-funcao ${badgeFuncaoClass}"><i class="fa-solid fa-crown" style="font-size: 10px;"></i> ${funcaoLabel}</span></td>
            <td><strong>${formatCurrency(c.precoJantar)}</strong></td>
            <td>${c.observacao || '<span class="text-muted">-</span>'}</td>
            <td class="text-right">
                <div class="action-btns">
                    <button class="btn-icon edit" onclick="editConvidado('${c.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon delete" onclick="deleteConvidado('${c.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderConvidadosCards(filtered) {
    const container = document.getElementById('cardsConvidados');
    if (!container) return;
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state p-4 text-center">
                <i class="fa-solid fa-users-slash" style="font-size: 32px; color: var(--neutral-400);"></i>
                <p class="mt-2">Nenhum convidado encontrado.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(c => {
        const card = document.createElement('div');
        card.className = 'item-card convidado-item-card';
        const badgeFuncaoClass = c.funcao ? c.funcao.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') : 'comum';
        const funcaoLabel = c.funcao ? c.funcao : 'Convidado(a)';
        const initials = c.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

        card.innerHTML = `
            <div class="item-card-header">
                <div class="item-card-user">
                    <div class="avatar-circle ${c.origem}">${initials}</div>
                    <div>
                        <h4 class="item-card-title">${c.nome}</h4>
                        <span class="badge-origem ${c.origem}">${c.origem}</span>
                    </div>
                </div>
                <span class="badge-funcao ${badgeFuncaoClass}"><i class="fa-solid fa-crown" style="font-size: 10px;"></i> ${funcaoLabel}</span>
            </div>
            <div class="item-card-body">
                <div class="card-detail-row">
                    <span class="detail-label">Preço Jantar:</span>
                    <strong class="detail-value text-primary">${formatCurrency(c.precoJantar)}</strong>
                </div>
                ${c.observacao ? `<div class="card-obs"><i class="fa-solid fa-comment-dots"></i> ${c.observacao}</div>` : ''}
            </div>
            <div class="item-card-footer">
                <div class="action-btns">
                    <button class="btn-icon edit" onclick="editConvidado('${c.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon delete" onclick="deleteConvidado('${c.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ==========================================================================
   ORÇAMENTOS & APROVAÇÃO MODULE
   ========================================================================== */
function toggleEntradaInput() {
    const checkbox = document.getElementById('orcamentoPossuiEntrada');
    const group = document.getElementById('groupValorEntrada');
    if (checkbox && group) {
        if (checkbox.checked) {
            group.classList.remove('hidden');
        } else {
            group.classList.add('hidden');
            document.getElementById('orcamentoValorEntrada').value = '';
        }
    }
}

function initOrcamentos() {
    const form = document.getElementById('formOrcamento');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('orcamentoId').value;
        const nome = document.getElementById('orcamentoNome').value.trim();
        const servico = document.getElementById('orcamentoServico').value;
        const valor = parseFloat(document.getElementById('orcamentoValor').value) || 0;
        const possuiEntrada = document.getElementById('orcamentoPossuiEntrada').checked;
        const valorEntrada = possuiEntrada ? (parseFloat(document.getElementById('orcamentoValorEntrada').value) || 0) : 0;
        const observacao = document.getElementById('orcamentoObservacao').value.trim();

        let targetOrcamento;
        if (id) {
            // Edit
            targetOrcamento = appState.orcamentos.find(o => o.id === id);
            if (targetOrcamento) {
                targetOrcamento.nome = nome;
                targetOrcamento.servico = servico;
                targetOrcamento.valor = valor;
                targetOrcamento.possuiEntrada = possuiEntrada;
                targetOrcamento.valorEntrada = valorEntrada;
                targetOrcamento.observacao = observacao;
            }
        } else {
            // Create
            targetOrcamento = {
                id: Date.now().toString(),
                nome,
                servico,
                valor,
                possuiEntrada,
                valorEntrada,
                observacao,
                aprovado: false,
                dataAprovacao: null
            };
            appState.orcamentos.push(targetOrcamento);
        }

        saveState();
        if (targetOrcamento && typeof dbSaveOrcamento === 'function') dbSaveOrcamento(targetOrcamento);
        resetOrcamentoForm();
        renderOrcamentosTable();
        renderFechadosTable();
        renderDashboard();
    });
}

function resetOrcamentoForm() {
    document.getElementById('formOrcamento').reset();
    document.getElementById('orcamentoId').value = '';
    const checkbox = document.getElementById('orcamentoPossuiEntrada');
    if (checkbox) checkbox.checked = false;
    const group = document.getElementById('groupValorEntrada');
    if (group) group.classList.add('hidden');
    document.getElementById('orcamentoValorEntrada').value = '';

    document.getElementById('orcamentoFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Cadastrar Orçamento';
    document.getElementById('btnSalvarOrcamento').innerHTML = '<i class="fa-solid fa-save"></i> Salvar Orçamento';
    document.getElementById('btnCancelarOrcamento').classList.add('hidden');
}

function editOrcamento(id) {
    const item = appState.orcamentos.find(o => o.id === id);
    if (!item) return;
    document.getElementById('orcamentoId').value = item.id;
    document.getElementById('orcamentoNome').value = item.nome;
    document.getElementById('orcamentoServico').value = item.servico;
    document.getElementById('orcamentoValor').value = item.valor;
    
    const checkbox = document.getElementById('orcamentoPossuiEntrada');
    if (checkbox) {
        checkbox.checked = !!item.possuiEntrada;
        toggleEntradaInput();
    }
    document.getElementById('orcamentoValorEntrada').value = item.valorEntrada || '';
    document.getElementById('orcamentoObservacao').value = item.observacao || '';

    document.getElementById('orcamentoFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Orçamento';
    document.getElementById('btnSalvarOrcamento').innerHTML = '<i class="fa-solid fa-save"></i> Atualizar Orçamento';
    document.getElementById('btnCancelarOrcamento').classList.remove('hidden');

    if (window.innerWidth < 900) {
        document.getElementById('orcamentoFormTitle').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteOrcamento(id) {
    if (confirm('Deseja excluir este orçamento?')) {
        appState.orcamentos = appState.orcamentos.filter(o => o.id !== id);
        saveState();
        if (typeof dbDeleteOrcamento === 'function') dbDeleteOrcamento(id);
        renderOrcamentosTable();
        renderFechadosTable();
        renderDashboard();
    }
}

// TOGGLE APPROVAL (Aprovação rápida que transfere para Serviços Fechados)
function toggleAprovarOrcamento(id) {
    const item = appState.orcamentos.find(o => o.id === id);
    if (!item) return;

    item.aprovado = !item.aprovado;
    item.dataAprovacao = item.aprovado ? new Date().toISOString().split('T')[0] : null;

    saveState();
    if (typeof dbSaveOrcamento === 'function') dbSaveOrcamento(item);
    renderOrcamentosTable();
    renderFechadosTable();
    renderDashboard();

    // Show feedback Toast or Message
    if (item.aprovado) {
        alert(`O contrato "${item.nome} (${item.servico})" foi APROVADO e agora aparece na aba Serviços Fechados! 🟢`);
    }
}

function setOrcamentoFilter(filter) {
    appState.orcamentoFilter = filter;
    document.querySelectorAll('[data-filter-orc]').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-filter-orc') === filter);
    });
    renderOrcamentosTable();
}

function renderOrcamentosTable() {
    const tbody = document.getElementById('tbodyOrcamentos');
    const search = document.getElementById('searchOrcamento').value.toLowerCase();
    tbody.innerHTML = '';

    let filtered = appState.orcamentos.filter(o => {
        const matchesFilter = appState.orcamentoFilter === 'todos' ||
            (appState.orcamentoFilter === 'pendentes' && !o.aprovado) ||
            (appState.orcamentoFilter === 'aprovados' && o.aprovado);

        const matchesSearch = o.nome.toLowerCase().includes(search) ||
            o.servico.toLowerCase().includes(search) ||
            (o.observacao && o.observacao.toLowerCase().includes(search));

        return matchesFilter && matchesSearch;
    });

    // Apply Column Sorting & Update Header Icons
    updateSortIcons('thRowOrcamentos', appState.orcamentoSort.key, appState.orcamentoSort.dir);
    sortItems(filtered, appState.orcamentoSort.key, appState.orcamentoSort.dir);

    // Render both Table and Cards
    renderOrcamentosCards(filtered);
    setOrcamentoViewMode(appState.orcamentoViewMode);

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fa-solid fa-calculator"></i>
                    <p>Nenhum orçamento cadastrado ou encontrado nesta categoria.</p>
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(o => {
        const tr = document.createElement('tr');
        const entradaBadgeHtml = (o.possuiEntrada && o.valorEntrada > 0)
            ? `<br><span class="badge-entrada"><i class="fa-solid fa-hand-holding-dollar"></i> Entrada: ${formatCurrency(o.valorEntrada)}</span>`
            : '';

        tr.innerHTML = `
            <td><strong>${o.nome}</strong></td>
            <td><span class="badge-origem Noivo">${o.servico}</span></td>
            <td><strong>${formatCurrency(o.valor)}</strong>${entradaBadgeHtml}</td>
            <td>${o.observacao || '<span class="text-muted">-</span>'}</td>
            <td>
                <span class="badge-status ${o.aprovado ? 'aprovado' : 'pendente'}">
                    <i class="fa-solid ${o.aprovado ? 'fa-check' : 'fa-clock'}"></i>
                    ${o.aprovado ? 'Aprovado / Fechado' : 'Em Análise'}
                </span>
            </td>
            <td class="text-right">
                <div class="action-btns">
                    <button class="btn-approve ${o.aprovado ? 'approved' : ''}" onclick="toggleAprovarOrcamento('${o.id}')" title="${o.aprovado ? 'Desfazer aprovação' : 'Aprovar e enviar para Serviços Fechados'}">
                        <i class="fa-solid ${o.aprovado ? 'fa-circle-check' : 'fa-check'}"></i>
                        ${o.aprovado ? 'Contratado' : 'Aprovar'}
                    </button>
                    <button class="btn-icon edit" onclick="editOrcamento('${o.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon delete" onclick="deleteOrcamento('${o.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderOrcamentosCards(filtered) {
    const container = document.getElementById('cardsOrcamentos');
    if (!container) return;
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state p-4 text-center">
                <i class="fa-solid fa-calculator" style="font-size: 32px; color: var(--neutral-400);"></i>
                <p class="mt-2">Nenhum orçamento cadastrado ou encontrado.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(o => {
        const card = document.createElement('div');
        card.className = `item-card orcamento-item-card ${o.aprovado ? 'approved-card' : ''}`;
        const entradaBadgeHtml = (o.possuiEntrada && o.valorEntrada > 0)
            ? `<span class="badge-entrada mt-1"><i class="fa-solid fa-hand-holding-dollar"></i> Sinal: ${formatCurrency(o.valorEntrada)}</span>`
            : '';

        card.innerHTML = `
            <div class="item-card-header">
                <div>
                    <span class="badge-origem Noivo mb-1">${o.servico}</span>
                    <h4 class="item-card-title">${o.nome}</h4>
                </div>
                <span class="badge-status ${o.aprovado ? 'aprovado' : 'pendente'}">
                    <i class="fa-solid ${o.aprovado ? 'fa-check' : 'fa-clock'}"></i>
                    ${o.aprovado ? 'Contratado' : 'Em Análise'}
                </span>
            </div>
            <div class="item-card-body">
                <div class="card-price-container">
                    <span class="detail-label">Valor Total Orçamento:</span>
                    <h3 class="card-price-val">${formatCurrency(o.valor)}</h3>
                    ${entradaBadgeHtml}
                </div>
                ${o.observacao ? `<div class="card-obs mt-2"><i class="fa-solid fa-file-text"></i> ${o.observacao}</div>` : ''}
            </div>
            <div class="item-card-footer">
                <button class="btn-approve ${o.aprovado ? 'approved' : ''}" onclick="toggleAprovarOrcamento('${o.id}')">
                    <i class="fa-solid ${o.aprovado ? 'fa-circle-check' : 'fa-check'}"></i>
                    ${o.aprovado ? 'Contratado' : 'Aprovar'}
                </button>
                <div class="action-btns">
                    <button class="btn-icon edit" onclick="editOrcamento('${o.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon delete" onclick="deleteOrcamento('${o.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ==========================================================================
   SERVIÇOS FECHADOS & REGISTRO DE PAGAMENTOS
   ========================================================================== */
function initPagamentoModal() {
    const modal = document.getElementById('modalPagamento');
    const btnClose = document.getElementById('btnClosePagamentoModal');
    const btnCloseFooter = document.getElementById('btnClosePagamentoModalFooter');

    if (!modal) return;
    function closeModal() { modal.classList.remove('active'); }

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCloseFooter) btnCloseFooter.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function openPagamentoModal(id) {
    const item = appState.orcamentos.find(o => o.id === id);
    if (!item) return;

    document.getElementById('pagamentoOrcamentoId').value = item.id;
    document.getElementById('pagamentoFornecedorNome').textContent = item.nome;
    document.getElementById('pagamentoServicoNome').textContent = item.servico;

    const valorTotal = item.valor || 0;
    const valorPago = item.valorPago || 0;
    const falta = valorTotal - valorPago;

    document.getElementById('pagamentoValorContratado').textContent = formatCurrency(valorTotal);
    document.getElementById('pagamentoAtualPago').textContent = formatCurrency(valorPago);
    document.getElementById('pagamentoSaldoRestante').textContent = formatCurrency(falta > 0 ? falta : 0);
    document.getElementById('pagamentoValorInput').value = valorPago || '';

    document.getElementById('modalPagamento').classList.add('active');
}

function salvarPagamento(e) {
    e.preventDefault();
    const id = document.getElementById('pagamentoOrcamentoId').value;
    const item = appState.orcamentos.find(o => o.id === id);
    if (!item) return;

    const novoPago = parseFloat(document.getElementById('pagamentoValorInput').value) || 0;
    item.valorPago = novoPago;

    saveState();
    if (typeof dbSaveOrcamento === 'function') dbSaveOrcamento(item);

    document.getElementById('modalPagamento').classList.remove('active');
    renderFechadosTable();
    renderDashboard();
}

function renderFechadosTable() {
    const tbody = document.getElementById('tbodyFechados');
    const search = document.getElementById('searchFechado').value.toLowerCase();
    tbody.innerHTML = '';

    const fechados = appState.orcamentos.filter(o => o.aprovado);

    // Sum Total Investment & Payments
    const totalFechado = fechados.reduce((acc, o) => acc + o.valor, 0);
    const totalPagoFechado = fechados.reduce((acc, o) => acc + (o.valorPago || 0), 0);
    const totalFaltaPagar = totalFechado - totalPagoFechado;

    document.getElementById('totalInvestimentoFechado').textContent = formatCurrency(totalFechado);
    document.getElementById('totalPagoFechado').textContent = formatCurrency(totalPagoFechado);
    document.getElementById('totalFaltaPagarFechado').textContent = formatCurrency(totalFaltaPagar > 0 ? totalFaltaPagar : 0);
    document.getElementById('topbarTotalFechado').textContent = formatCurrency(totalFechado);

    let filtered = fechados.filter(o =>
        o.nome.toLowerCase().includes(search) ||
        o.servico.toLowerCase().includes(search) ||
        (o.observacao && o.observacao.toLowerCase().includes(search))
    );

    // Apply Column Sorting & Update Header Icons
    updateSortIcons('thRowFechados', appState.fechadoSort.key, appState.fechadoSort.dir);
    sortItems(filtered, appState.fechadoSort.key, appState.fechadoSort.dir);

    // Render both Table and Cards
    renderFechadosCards(filtered);
    setFechadoViewMode(appState.fechadoViewMode);

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fa-solid fa-file-contract"></i>
                    <p>Nenhum serviço ou contrato fechado até o momento. Aprove um orçamento na aba "Orçamentos"!</p>
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(o => {
        const tr = document.createElement('tr');
        const entradaBadgeHtml = (o.possuiEntrada && o.valorEntrada > 0)
            ? `<br><span class="badge-entrada"><i class="fa-solid fa-hand-holding-dollar"></i> Sinal: ${formatCurrency(o.valorEntrada)}</span>`
            : '';

        const valorPago = o.valorPago || 0;
        const faltaPagar = o.valor - valorPago;

        const faltaPagarHtml = faltaPagar <= 0
            ? `<span class="badge-quitado"><i class="fa-solid fa-check-double"></i> Quitado</span>`
            : `<strong class="text-danger">${formatCurrency(faltaPagar)}</strong>`;

        tr.innerHTML = `
            <td><span class="badge-origem Noivo">${o.servico}</span></td>
            <td><strong>${o.nome}</strong></td>
            <td><strong>${formatCurrency(o.valor)}</strong>${entradaBadgeHtml}</td>
            <td><strong class="text-success">${formatCurrency(valorPago)}</strong></td>
            <td>${faltaPagarHtml}</td>
            <td>${o.observacao || '<span class="text-muted">-</span>'}</td>
            <td>${formatDate(o.dataAprovacao)}</td>
            <td class="text-right">
                <div class="action-btns">
                    <button class="btn-pay" onclick="openPagamentoModal('${o.id}')" title="Informar quanto foi pago">
                        <i class="fa-solid fa-hand-holding-dollar"></i> Pagamento
                    </button>
                    <button class="btn-icon delete" onclick="toggleAprovarOrcamento('${o.id}')" title="Reverter aprovação para orçamento">
                        <i class="fa-solid fa-rotate-left"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderFechadosCards(filtered) {
    const container = document.getElementById('cardsFechados');
    if (!container) return;
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state p-4 text-center">
                <i class="fa-solid fa-file-contract" style="font-size: 32px; color: var(--neutral-400);"></i>
                <p class="mt-2">Nenhum contrato fechado até o momento.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(o => {
        const card = document.createElement('div');
        card.className = 'item-card fechado-item-card';

        const valorTotal = o.valor || 0;
        const valorPago = o.valorPago || 0;
        const faltaPagar = valorTotal - valorPago;
        const percentPago = valorTotal > 0 ? Math.min(100, Math.round((valorPago / valorTotal) * 100)) : 0;

        const entradaBadgeHtml = (o.possuiEntrada && o.valorEntrada > 0)
            ? `<span class="badge-entrada"><i class="fa-solid fa-hand-holding-dollar"></i> Sinal: ${formatCurrency(o.valorEntrada)}</span>`
            : '';

        const faltaPagarHtml = faltaPagar <= 0
            ? `<span class="badge-quitado"><i class="fa-solid fa-check-double"></i> Quitado</span>`
            : `<strong class="text-danger">${formatCurrency(faltaPagar)}</strong>`;

        card.innerHTML = `
            <div class="item-card-header">
                <div>
                    <span class="badge-origem Noivo mb-1">${o.servico}</span>
                    <h4 class="item-card-title">${o.nome}</h4>
                </div>
                <div class="text-right">
                    <span class="card-date-badge"><i class="fa-solid fa-calendar-check"></i> ${formatDate(o.dataAprovacao)}</span>
                </div>
            </div>
            <div class="item-card-body">
                <div class="card-financial-grid mb-2">
                    <div class="fin-box">
                        <span>Contratado:</span>
                        <strong>${formatCurrency(valorTotal)}</strong>
                    </div>
                    <div class="fin-box success">
                        <span>Já Pago:</span>
                        <strong class="text-success">${formatCurrency(valorPago)}</strong>
                    </div>
                    <div class="fin-box danger">
                        <span>Falta Pagar:</span>
                        ${faltaPagarHtml}
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="card-progress-wrapper mb-2">
                    <div class="card-progress-bar">
                        <div class="card-progress-fill" style="width: ${percentPago}%;"></div>
                    </div>
                    <span class="progress-percent-label">${percentPago}% pago</span>
                </div>

                ${entradaBadgeHtml ? `<div class="mb-2">${entradaBadgeHtml}</div>` : ''}
                ${o.observacao ? `<div class="card-obs"><i class="fa-solid fa-file-text"></i> ${o.observacao}</div>` : ''}
            </div>
            <div class="item-card-footer">
                <button class="btn-pay flex-1" onclick="openPagamentoModal('${o.id}')" title="Informar quanto foi pago">
                    <i class="fa-solid fa-hand-holding-dollar"></i> Informar Pagamento
                </button>
                <button class="btn-icon delete" onclick="toggleAprovarOrcamento('${o.id}')" title="Reverter aprovação">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ==========================================================================
   DASHBOARD VISÃO GERAL MODULE
   ========================================================================== */
function renderDashboard() {
    // Sincronizar Input Valor Guardado se não estiver em foco
    const valGuardadoInput = document.getElementById('valorGuardadoInput');
    if (valGuardadoInput && document.activeElement !== valGuardadoInput) {
        valGuardadoInput.value = appState.valorGuardado || '';
    }

    // Badges Sidebar
    document.getElementById('badgeConvidadosCount').textContent = appState.convidados.length;
    
    const pendentesCount = appState.orcamentos.filter(o => !o.aprovado).length;
    const fechadosCount = appState.orcamentos.filter(o => o.aprovado).length;

    document.getElementById('badgeOrcamentosCount').textContent = appState.orcamentos.length;
    document.getElementById('badgeFechadosCount').textContent = fechadosCount;

    // Convidados Totals
    const noivaConv = appState.convidados.filter(c => c.origem === 'Noiva');
    const noivoConv = appState.convidados.filter(c => c.origem === 'Noivo');

    document.getElementById('dashTotalConvidados').textContent = `${appState.convidados.length} pessoas`;
    document.getElementById('dashConvidadosBreakdown').textContent = `Noiva: ${noivaConv.length} | Noivo: ${noivoConv.length}`;

    // Orcamentos Totals
    const pendentesVal = appState.orcamentos.filter(o => !o.aprovado).reduce((acc, o) => acc + o.valor, 0);
    const fechadosVal = appState.orcamentos.filter(o => o.aprovado).reduce((acc, o) => acc + o.valor, 0);

    document.getElementById('dashTotalOrcamentosPendentes').textContent = formatCurrency(pendentesVal);
    document.getElementById('dashOrcamentosCountSub').textContent = `${pendentesCount} propostas em análise`;

    document.getElementById('dashTotalFechado').textContent = formatCurrency(fechadosVal);
    document.getElementById('dashFechadosCountSub').textContent = `${fechadosCount} contratos aprovados`;

    // Valor Guardado & Saldo Restante (Valor Guardado - Contratos Fechados)
    const valorGuardado = appState.valorGuardado || 0;
    const totalComprometido = fechadosVal;
    const saldoDisponivel = valorGuardado - totalComprometido;

    document.getElementById('dashValorGuardado').textContent = formatCurrency(valorGuardado);
    document.getElementById('dashSaldoDisponivel').textContent = formatCurrency(saldoDisponivel);

    const cardSaldo = document.getElementById('cardDashSaldoDisponivel');
    const dashSaldoSub = document.getElementById('dashSaldoSub');
    if (cardSaldo) {
        if (saldoDisponivel >= 0) {
            cardSaldo.className = 'metric-card indigo';
            if (dashSaldoSub) dashSaldoSub.textContent = `Saldo positivo para novos contratos`;
        } else {
            cardSaldo.className = 'metric-card ruby';
            if (dashSaldoSub) dashSaldoSub.textContent = `Orçamento excedido em ${formatCurrency(Math.abs(saldoDisponivel))}`;
        }
    }

    // Topbar Quick Summary
    document.getElementById('topbarTotalFechado').textContent = formatCurrency(fechadosVal);
    document.getElementById('topbarValorGuardado').textContent = formatCurrency(valorGuardado);
    document.getElementById('topbarSaldoDisponivel').textContent = formatCurrency(saldoDisponivel);

    // Recent Lists on Dashboard
    const recentOrcContainer = document.getElementById('dashRecentOrcamentos');
    recentOrcContainer.innerHTML = '';
    const recentOrcs = appState.orcamentos.slice(-4).reverse();
    if (recentOrcs.length === 0) {
        recentOrcContainer.innerHTML = '<div class="p-4 text-center text-muted">Nenhum orçamento cadastrado.</div>';
    } else {
        recentOrcs.forEach(o => {
            const div = document.createElement('div');
            div.className = 'recent-item';
            div.innerHTML = `
                <div class="recent-item-info">
                    <strong>${o.nome}</strong>
                    <span>${o.servico} &bull; ${o.aprovado ? '<span class="text-success">Contratado</span>' : 'Em análise'}</span>
                </div>
                <div class="recent-item-val">${formatCurrency(o.valor)}</div>
            `;
            recentOrcContainer.appendChild(div);
        });
    }

    const recentFechadosContainer = document.getElementById('dashRecentFechados');
    recentFechadosContainer.innerHTML = '';
    const recentFechados = appState.orcamentos.filter(o => o.aprovado).slice(-4).reverse();
    if (recentFechados.length === 0) {
        recentFechadosContainer.innerHTML = '<div class="p-4 text-center text-muted">Nenhum contrato fechado ainda.</div>';
    } else {
        recentFechados.forEach(o => {
            const div = document.createElement('div');
            div.className = 'recent-item';
            div.innerHTML = `
                <div class="recent-item-info">
                    <strong>${o.nome}</strong>
                    <span>${o.servico} &bull; Aprovado</span>
                </div>
                <div class="recent-item-val text-success">${formatCurrency(o.valor)}</div>
            `;
            recentFechadosContainer.appendChild(div);
        });
    }
}

// Master Render Function
function renderAll() {
    populateCategorySelect();
    renderConvidadosTable();
    renderOrcamentosTable();
    renderFechadosTable();
    renderDashboard();
}

/* ==========================================================================
   Application Initialization & Real-time Cloud Sync
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initNavigation();
    initCategoryManager();
    initConvidados();
    initOrcamentos();
    initPagamentoModal();
    renderAll();

    // Firebase Firestore Realtime Sync Initialization
    if (typeof setupRealtimeListeners === 'function') {
        setupRealtimeListeners(
            (cloudConvidados, isEmpty) => {
                if (isEmpty && appState.convidados.length > 0) {
                    appState.convidados.forEach(c => dbSaveConvidado(c));
                } else if (!isEmpty) {
                    appState.convidados = cloudConvidados;
                    saveState();
                    renderAll();
                }
            },
            (cloudOrcamentos, isEmpty) => {
                if (isEmpty && appState.orcamentos.length > 0) {
                    appState.orcamentos.forEach(o => dbSaveOrcamento(o));
                } else if (!isEmpty) {
                    appState.orcamentos = cloudOrcamentos;
                    saveState();
                    renderAll();
                }
            },
            (cloudCategories) => {
                if (cloudCategories && cloudCategories.length) {
                    appState.categories = cloudCategories;
                    saveState();
                    renderAll();
                } else if (appState.categories.length > 0) {
                    dbSaveCategories(appState.categories);
                }
            },
            (cloudValorGuardado) => {
                if (cloudValorGuardado !== null && cloudValorGuardado !== undefined) {
                    appState.valorGuardado = cloudValorGuardado;
                    saveState();
                    renderAll();
                } else if (appState.valorGuardado > 0) {
                    dbSaveValorGuardado(appState.valorGuardado);
                }
            }
        );
    }
});
