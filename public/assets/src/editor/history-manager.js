/**
 * History Manager - Handles Undo/Redo functionality for the template editor
 */
const HistoryManager = {
    history: [],
    currentIndex: -1,
    maxHistory: 50,
    undoBtn: null,
    redoBtn: null,

    init() {
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');

        if (this.undoBtn) {
            this.undoBtn.addEventListener('click', () => this.undo());
        }
        if (this.redoBtn) {
            this.redoBtn.addEventListener('click', () => this.redo());
        }

        this.updateButtons();
    },

    /**
     * Save a new state to history
     */
    saveState(template) {
        if (!template) return;

        // Clone the template to avoid reference issues
        const templateClone = JSON.parse(JSON.stringify(template));

        // If we've made changes after an undo, clear the "redo" part of history
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Add new state
        this.history.push(templateClone);

        // Keep history within limits
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }

        this.updateButtons();
    },

    /**
     * Undo to previous state
     */
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            const template = JSON.parse(JSON.stringify(this.history[this.currentIndex]));
            this.applyState(template);
        }
    },

    /**
     * Redo to next state
     */
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            const template = JSON.parse(JSON.stringify(this.history[this.currentIndex]));
            this.applyState(template);
        }
    },

    /**
     * Apply a state back to the editor
     */
    applyState(template) {
        if (!template) return;

        // Update both the data and the view
        EditorCanvas.currentTemplate = template;
        EditorCanvas.render();

        // If there was a selected element, we might want to deselect it or try to re-find it
        // For now, deselecting is safer to avoid orphan references
        EditorCanvas.selectedElement = null;
        if (typeof PropertiesPanel !== 'undefined') {
            PropertiesPanel.showEmptyState();
        }

        this.updateButtons();
    },

    /**
     * Update toolbar button states
     */
    updateButtons() {
        if (this.undoBtn) {
            this.undoBtn.disabled = this.currentIndex <= 0;
            this.undoBtn.style.opacity = this.undoBtn.disabled ? '0.5' : '1';
            this.undoBtn.style.pointerEvents = this.undoBtn.disabled ? 'none' : 'auto';
        }
        if (this.redoBtn) {
            this.redoBtn.disabled = this.currentIndex >= this.history.length - 1;
            this.redoBtn.style.opacity = this.redoBtn.disabled ? '0.5' : '1';
            this.redoBtn.style.pointerEvents = this.redoBtn.disabled ? 'none' : 'auto';
        }
    }
};

// Export to window
window.HistoryManager = HistoryManager;
