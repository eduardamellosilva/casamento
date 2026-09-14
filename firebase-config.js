/* ==========================================================================
   Firebase Realtime Database Configuration & Cloud Sync Engine
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyANzHmcrWbEce61f1R5yDtjhqtZ0j6rd0Y",
  authDomain: "casamento-ca15f.firebaseapp.com",
  databaseURL: "https://casamento-ca15f-default-rtdb.firebaseio.com",
  projectId: "casamento-ca15f",
  storageBucket: "casamento-ca15f.firebasestorage.app",
  messagingSenderId: "312721140921",
  appId: "1:312721140921:web:6d0cb4aa6a48c02d1fff68",
  measurementId: "G-75JL2DHKER"
};

// Initialize Firebase & Realtime Database
let isFirebaseConnected = false;
let rtdb = null;

try {
    if (window.firebase) {
        firebase.initializeApp(firebaseConfig);
        rtdb = firebase.database();
        isFirebaseConnected = true;
        console.log('🔥 Firebase Realtime Database conectado com sucesso para Casamento!');
    }
} catch (error) {
    console.error('Erro ao inicializar Firebase Realtime Database:', error);
}

/* ==========================================================================
   Realtime Database Actions (Convidados, Orçamentos, Categorias)
   ========================================================================== */

// Sync Convidado to Cloud
async function dbSaveConvidado(convidado) {
    if (!isFirebaseConnected || !rtdb) return;
    try {
        await rtdb.ref('convidados/' + convidado.id).set(convidado);
    } catch (e) {
        console.error('Erro ao salvar Convidado no Realtime Database:', e);
    }
}

// Delete Convidado from Cloud
async function dbDeleteConvidado(id) {
    if (!isFirebaseConnected || !rtdb) return;
    try {
        await rtdb.ref('convidados/' + id).remove();
    } catch (e) {
        console.error('Erro ao deletar Convidado no Realtime Database:', e);
    }
}

// Sync Orcamento to Cloud
async function dbSaveOrcamento(orcamento) {
    if (!isFirebaseConnected || !rtdb) return;
    try {
        await rtdb.ref('orcamentos/' + orcamento.id).set(orcamento);
    } catch (e) {
        console.error('Erro ao salvar Orçamento no Realtime Database:', e);
    }
}

// Delete Orcamento from Cloud
async function dbDeleteOrcamento(id) {
    if (!isFirebaseConnected || !rtdb) return;
    try {
        await rtdb.ref('orcamentos/' + id).remove();
    } catch (e) {
        console.error('Erro ao deletar Orçamento no Realtime Database:', e);
    }
}

// Save Categories Array to Cloud
async function dbSaveCategories(categories) {
    if (!isFirebaseConnected || !rtdb) return;
    try {
        await rtdb.ref('config/categories').set(categories);
    } catch (e) {
        console.error('Erro ao salvar Categorias no Realtime Database:', e);
    }
}

/* ==========================================================================
   Real-Time Data Listeners
   ========================================================================== */
function setupRealtimeListeners(onConvidadosChange, onOrcamentosChange, onCategoriesChange) {
    if (!isFirebaseConnected || !rtdb) return;

    // 1. Convidados Real-time listener
    rtdb.ref('convidados').on('value', (snapshot) => {
        const val = snapshot.val();
        const convidadosList = val ? Object.values(val) : [];
        if (onConvidadosChange) onConvidadosChange(convidadosList, !val);
    }, err => console.error('Erro listener convidados:', err));

    // 2. Orçamentos Real-time listener
    rtdb.ref('orcamentos').on('value', (snapshot) => {
        const val = snapshot.val();
        const orcamentosList = val ? Object.values(val) : [];
        if (onOrcamentosChange) onOrcamentosChange(orcamentosList, !val);
    }, err => console.error('Erro listener orçamentos:', err));

    // 3. Categorias Real-time listener
    rtdb.ref('config/categories').on('value', (snapshot) => {
        const val = snapshot.val();
        if (val && Array.isArray(val)) {
            if (onCategoriesChange) onCategoriesChange(val);
        }
    }, err => console.error('Erro listener categorias:', err));
}
