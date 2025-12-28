// Editor Main - Coordinates all editor modules

// Global state
let currentTemplate = null;

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    EditorCanvas.init();
    PropertiesPanel.init();
    ComponentLibrary.init();
    DragDropManager.init();
    ResponsiveManager.init();

    // Setup toolbar buttons
    setupToolbar();

    // Check if we should load a blank template
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('template') === 'blank') {
        initBlankTemplate();
    }
});

// Setup toolbar functionality
function setupToolbar() {
    // Import button
    document.getElementById('importBtn').addEventListener('click', () => {
        openImportModal();
    });

    // Export button
    document.getElementById('exportBtn').addEventListener('click', () => {
        exportTemplate();
    });

    // File input
    document.getElementById('fileInput').addEventListener('change', (e) => {
        handleFileUpload(e);
    });
}

// Open import modal
function openImportModal() {
    const modal = document.getElementById('importModal');
    modal.classList.add('active');
}

// Close import modal
function closeImportModal() {
    const modal = document.getElementById('importModal');
    modal.classList.remove('active');

    // Clear inputs
    document.getElementById('htmlInput').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('fileName').textContent = '';
}

// Import template
function importTemplate() {
    const htmlInput = document.getElementById('htmlInput').value;

    if (!htmlInput.trim()) {
        alert('Por favor, cole o código HTML ou selecione um arquivo.');
        return;
    }

    try {
        // Parse HTML
        const templateData = TemplateParser.parse(htmlInput);

        // Load into canvas
        EditorCanvas.loadTemplate(templateData);

        // Close modal
        closeImportModal();

        console.log('Template importado com sucesso!', templateData);
    } catch (error) {
        console.error('Erro ao importar template:', error);
        alert('Erro ao importar template. Verifique o código HTML.');
    }
}

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Show file name
    document.getElementById('fileName').textContent = `Arquivo: ${file.name}`;

    // Read file
    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById('htmlInput').value = event.target.result;
    };
    reader.readAsText(file);
}

// Export template
function exportTemplate() {
    if (!EditorCanvas.currentTemplate) {
        alert('Nenhum template carregado para exportar.');
        return;
    }

    try {
        // Export to HTML
        const html = HTMLExporter.export(EditorCanvas.currentTemplate);

        // Create download
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'email-template.html';
        a.click();
        URL.revokeObjectURL(url);

        console.log('Template exportado com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar template:', error);
        alert('Erro ao exportar template.');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to export
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportTemplate();
    }

    // Ctrl + Z to undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (typeof HistoryManager !== 'undefined') HistoryManager.undo();
    }

    // Ctrl + Y to redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (typeof HistoryManager !== 'undefined') HistoryManager.redo();
    }

    // Escape to close modal
    if (e.key === 'Escape') {
        closeImportModal();
    }
});

// Initialize blank template
function initBlankTemplate() {
    EditorCanvas.currentTemplate = {
        components: [],
        globalStyles: {},
        metadata: { name: 'Template em Branco', backgroundColor: '#ffffff' }
    };

    // Show canvas
    document.getElementById('canvasContainer').classList.add('active');

    // CRITICAL: Render the empty canvas to show the white iframe (placeholder will be shown via render())
    EditorCanvas.render();

    console.log('📄 Template em branco inicializado - Canvas vazio pronto para arrastar componentes');
}