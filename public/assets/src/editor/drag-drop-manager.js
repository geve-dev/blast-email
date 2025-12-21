// Drag and Drop Manager - Handles drag and drop functionality

const DragDropManager = {
    dropZone: null,
    dragIndicator: null,

    // Initialize drag and drop
    init() {
        this.setupDropZone();
        this.createDragIndicator();
    },

    // Create drag indicator element
    createDragIndicator() {
        this.dragIndicator = document.createElement('div');
        this.dragIndicator.style.cssText = `
            position: absolute;
            border: 2px dashed #00ffd0;
            background: rgba(0, 255, 208, 0.1);
            pointer-events: none;
            display: none;
            z-index: 1000;
        `;
        document.body.appendChild(this.dragIndicator);
    },

    // Setup drop zone (iframe body only)
    setupDropZone() {
        const iframe = document.getElementById('previewFrame');

        // Wait for iframe to load
        iframe.addEventListener('load', () => {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const iframeBody = iframeDoc.body;

            // Add drop zone listeners to iframe body only
            iframeBody.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'copy';
                iframeBody.style.background = 'rgba(0, 255, 208, 0.05)';
                iframeBody.style.outline = '2px dashed #00ffd0';
            });

            iframeBody.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                iframeBody.style.background = '';
                iframeBody.style.outline = '';
            });

            iframeBody.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                iframeBody.style.background = '';
                iframeBody.style.outline = '';

                const componentType = e.dataTransfer.getData('componentType');
                if (componentType) {
                    this.addComponent(componentType);
                }
            });
        });
    },

    // Add new component to template
    addComponent(type) {
        const componentDef = ComponentRegistry.getComponent(type);
        if (!componentDef) {
            console.error(`Component type "${type}" not found in registry`);
            return;
        }

        // Initialize template if needed
        if (!EditorCanvas.currentTemplate) {
            EditorCanvas.currentTemplate = {
                components: [],
                globalStyles: {},
                metadata: {}
            };

            // Show canvas, hide empty state
            document.getElementById('canvasContainer').classList.add('active');
            document.getElementById('emptyState').style.display = 'none';
        }

        // Create new component with default values
        const newComponent = {
            id: `component-${Date.now()}`,
            type: type,
            properties: { ...componentDef.defaultValues },
            styles: {},
            html: ''
        };

        // Add to template
        EditorCanvas.currentTemplate.components.push(newComponent);

        // Re-render canvas
        EditorCanvas.render();

        // Save history
        if (typeof HistoryManager !== 'undefined') {
            HistoryManager.saveState(EditorCanvas.currentTemplate);
        }

        // Show success feedback
        console.log(`✅ Componente "${componentDef.name}" adicionado com sucesso!`);

        // Auto-select the new component
        setTimeout(() => {
            const newElement = EditorCanvas.iframeDoc.querySelector(`[data-component-id="${newComponent.id}"]`);
            if (newElement) {
                newElement.click();
            }
        }, 100);
    }
};
