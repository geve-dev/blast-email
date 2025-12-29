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

    // Setup drop zone (iframe body and individual elements)
    setupDropZone() {
        const iframe = document.getElementById('previewFrame');

        // Wait for iframe to load
        iframe.addEventListener('load', () => {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const iframeBody = iframeDoc.body;

            // Track if we're dragging a new component (not reordering)
            let isDraggingNewComponent = false;

            // Listen for drag events from component library
            document.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('component-item')) {
                    isDraggingNewComponent = true;
                }
            });

            document.addEventListener('dragend', () => {
                // Clear all indicators when drag ends
                setTimeout(() => {
                    isDraggingNewComponent = false;
                    this.clearDropIndicators(iframeDoc);
                }, 100);
            });

            // Add drop zone listeners to iframe body
            // Use capture phase to handle before element handlers
            iframeBody.addEventListener('dragover', (e) => {
                // Only handle if dragging new component from library
                if (!isDraggingNewComponent) return;
                
                // Always prevent default and show indicators when dragging new component
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'copy';
                
                // Show visual feedback on body
                iframeBody.style.background = 'rgba(0, 255, 208, 0.05)';
                iframeBody.style.outline = '2px dashed #00ffd0';
                
                // Show drop indicators on elements
                this.showDropIndicators(iframeDoc, e);
            }, true); // Use capture phase to handle before element's own dragover handler

            iframeBody.addEventListener('dragleave', (e) => {
                if (!isDraggingNewComponent) return;
                
                // Only clear if leaving the body (not just moving to a child)
                const relatedTarget = e.relatedTarget;
                if (!relatedTarget || !iframeBody.contains(relatedTarget)) {
                    iframeBody.style.background = '';
                    iframeBody.style.outline = '';
                    this.clearDropIndicators(iframeDoc);
                }
            });

            // Handle drop events - use capture phase to handle before element handlers
            iframeBody.addEventListener('drop', (e) => {
                if (!isDraggingNewComponent) return;
                
                // Get component type - only proceed if it's a new component
                const componentType = e.dataTransfer.getData('componentType');
                if (!componentType) return; // Reordering, let editor-canvas handle it
                
                // Prevent default and stop propagation to prevent reordering handler
                e.preventDefault();
                e.stopPropagation();
                
                // Clear visual feedback
                iframeBody.style.background = '';
                iframeBody.style.outline = '';
                this.clearDropIndicators(iframeDoc);

                // Determine drop position (works for both body and elements)
                const dropPosition = this.getDropPosition(iframeDoc, e);
                this.addComponent(componentType, dropPosition);
            }, true); // Use capture phase to handle before element's own drop handler
        });
    },

    // Show drop indicators on elements
    showDropIndicators(iframeDoc, e) {
        const elements = Array.from(iframeDoc.querySelectorAll('.editable-element'));
        if (!elements.length) return;

        // Clear previous indicators
        this.clearDropIndicators(iframeDoc);

        // Add drag-over-zone class to all elements
        elements.forEach(el => {
            el.classList.add('drag-over-zone');
        });

        const dropY = e.clientY;
        let marked = false;

        // Find the drop target
        for (let el of elements) {
            const rect = el.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            
            if (dropY < midpoint) {
                // Insert before this element
                el.classList.add('drop-target-top');
                
                // Add visual drop indicator line
                const bodyRect = iframeDoc.body.getBoundingClientRect();
                const indicator = iframeDoc.createElement('div');
                indicator.className = 'drop-indicator';
                indicator.style.position = 'absolute';
                indicator.style.left = '0';
                indicator.style.right = '0';
                indicator.style.top = `${rect.top - bodyRect.top - 2}px`;
                indicator.style.width = '100%';
                iframeDoc.body.appendChild(indicator);
                
                marked = true;
                break;
            }
        }

        if (!marked) {
            // Insert at the end - show indicator at bottom of last element
            const last = elements[elements.length - 1];
            if (last) {
                last.classList.add('drop-target-bottom');
                
                // Add visual drop indicator line
                const rect = last.getBoundingClientRect();
                const bodyRect = iframeDoc.body.getBoundingClientRect();
                const indicator = iframeDoc.createElement('div');
                indicator.className = 'drop-indicator';
                indicator.style.position = 'absolute';
                indicator.style.left = '0';
                indicator.style.right = '0';
                indicator.style.top = `${rect.bottom - bodyRect.top + 2}px`;
                indicator.style.width = '100%';
                iframeDoc.body.appendChild(indicator);
            }
        }
    },

    // Clear all drop indicators
    clearDropIndicators(iframeDoc) {
        const elements = iframeDoc.querySelectorAll('.editable-element');
        elements.forEach(el => {
            el.classList.remove('drop-target-top', 'drop-target-bottom', 'drag-over-zone');
        });
        
        // Remove all drop indicators
        const allIndicators = iframeDoc.querySelectorAll('.drop-indicator');
        allIndicators.forEach(ind => ind.remove());
    },

    // Get drop position (index and insertBefore flag)
    getDropPosition(iframeDoc, e) {
        const elements = Array.from(iframeDoc.querySelectorAll('.editable-element'));
        if (!elements.length) {
            return { index: 0, insertBefore: true };
        }

        const dropY = e.clientY;

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const rect = el.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            
            if (dropY < midpoint) {
                // Get component ID to find index
                const componentId = el.dataset.componentId;
                const flatComponents = EditorCanvas.getFlatComponents();
                const index = flatComponents.findIndex(c => c.id === componentId);
                return { index: index >= 0 ? index : 0, insertBefore: true };
            }
        }

        // Insert at the end
        const flatComponents = EditorCanvas.getFlatComponents();
        return { index: flatComponents.length, insertBefore: false };
    },

    // Add new component to template at specific position
    addComponent(type, dropPosition = null) {
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

        // Insert component at specified position
        if (dropPosition && EditorCanvas.currentTemplate.components.length > 0) {
            const flatComponents = EditorCanvas.getFlatComponents();
            let insertIndex = dropPosition.index;
            
            // Adjust index if inserting before
            if (!dropPosition.insertBefore && insertIndex < flatComponents.length) {
                insertIndex = insertIndex + 1;
            }
            
            // Ensure index is within bounds
            insertIndex = Math.max(0, Math.min(insertIndex, flatComponents.length));
            
            // Insert at the calculated position
            flatComponents.splice(insertIndex, 0, newComponent);
            EditorCanvas.currentTemplate.components = flatComponents;
        } else {
            // No position specified or empty template - add to end
            EditorCanvas.currentTemplate.components.push(newComponent);
        }

        // Add reordering class for smooth animation
        const elements = Array.from(EditorCanvas.iframeDoc.querySelectorAll('.editable-element'));
        elements.forEach(el => {
            el.classList.add('reordering');
        });

        // Re-render canvas
        EditorCanvas.render();

        // Remove reordering class after animation
        setTimeout(() => {
            const newElements = Array.from(EditorCanvas.iframeDoc.querySelectorAll('.editable-element'));
            newElements.forEach(el => {
                el.classList.remove('reordering');
            });
        }, 300);

        // Save history
        if (typeof HistoryManager !== 'undefined') {
            HistoryManager.saveState(EditorCanvas.currentTemplate);
        }

        // Show success feedback
        const position = dropPosition ? ` na posição ${dropPosition.index + 1}` : '';
        console.log(`✅ Componente "${componentDef.name}" adicionado com sucesso${position}!`);

        // Auto-select the new component
        setTimeout(() => {
            const newElement = EditorCanvas.iframeDoc.querySelector(`[data-component-id="${newComponent.id}"]`);
            if (newElement) {
                newElement.click();
            }
        }, 100);
    }
};
