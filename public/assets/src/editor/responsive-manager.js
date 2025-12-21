// Responsive Manager - Handles desktop/mobile view toggle

const ResponsiveManager = {
    currentView: 'desktop',

    // Initialize responsive manager
    init() {
        this.setupViewToggle();
    },

    // Setup view toggle buttons
    setupViewToggle() {
        const toggleBtns = document.querySelectorAll('.toggle-btn');

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.setView(view);
            });
        });
    },

    // Set view (desktop or mobile)
    setView(view) {
        this.currentView = view;

        // Update button states
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update canvas
        EditorCanvas.setView(view);
    }
};
