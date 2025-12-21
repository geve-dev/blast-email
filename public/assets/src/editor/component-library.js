// Component Library - Manages the left sidebar with draggable components

const ComponentLibrary = {
    // Initialize component library
    init() {
        this.setupDragHandlers();
    },

    // Setup drag event handlers
    setupDragHandlers() {
        const componentItems = document.querySelectorAll('.component-item');

        componentItems.forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
    },

    // Handle drag start
    handleDragStart(e) {
        const componentType = e.target.dataset.type;
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('componentType', componentType);

        // Add dragging class
        e.target.classList.add('dragging');
    },

    // Handle drag end
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }
};
