// Properties Panel - Manages the right sidebar with property controls

const PropertiesPanel = {
    currentComponent: null,
    container: null,

    // Initialize properties panel
    init() {
        this.container = document.getElementById('propertiesContent');
    },

    // Show properties for selected component
    showProperties(component) {
        this.currentComponent = component;
        this.render();
    },

    // Render property controls
    render() {
        if (!this.currentComponent) {
            this.showEmptyState();
            return;
        }

        const componentDef = ComponentRegistry.getComponent(this.currentComponent.type);
        if (!componentDef) return;

        let html = `
            <div class="component-info">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0; color: var(--editor-text); font-size: 1rem;">
                        <i class="fas ${componentDef.icon}"></i>
                        ${componentDef.name}
                    </h3>
                    <button class="btn-delete" id="deleteComponentBtn" title="Deletar componente">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        // Render controls for each editable property
        componentDef.editableProps.forEach(propName => {
            const propMeta = ComponentRegistry.getPropertyMeta(propName);
            if (!propMeta) return;

            const currentValue = this.currentComponent.properties[propName];
            html += this.renderControl(propName, propMeta, currentValue);
        });

        this.container.innerHTML = html;

        // Add event listeners
        this.attachEventListeners();
    },

    // Render individual control
    renderControl(propName, propMeta, currentValue) {
        let control = '';


        switch (propMeta.type) {
            case 'text':
            case 'url':
                const isImageUrl = (propName === 'src' || propName === 'logoSrc');
                const labelIcon = propMeta.icon ? `<i class="fab ${propMeta.icon}" style="margin-right: 5px; color: var(--editor-primary);"></i>` : '';
                control = `
                    <div class="property-group">
                        <label class="property-label">${labelIcon}${propMeta.label}</label>
                        <input 
                            type="text" 
                            class="property-input" 
                            data-property="${propName}"
                            value="${currentValue || ''}"
                            placeholder="${propMeta.placeholder || ''}"
                        >
                        ${isImageUrl ? `
                            <button class="btn-upload" data-upload="${propName}" style="margin-top: 0.5rem;">
                                <i class="fas fa-upload"></i> Upload Imagem
                            </button>
                            <input type="file" id="fileInput-${propName}" accept="image/*" style="display:none">
                        ` : ''}
                    </div>
                `;
                break;


            case 'textarea':
                control = `
                    <div class="property-group">
                        <label class="property-label">${propMeta.label}</label>
                        <textarea 
                            class="property-input" 
                            data-property="${propName}"
                            rows="4"
                            placeholder="${propMeta.placeholder || ''}"
                        >${currentValue || ''}</textarea>
                    </div>
                `;
                break;

            case 'color':
                const colorValue = this.extractColor(currentValue);
                control = `
                    <div class="property-group">
                        <label class="property-label">${propMeta.label}</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input 
                                type="color" 
                                class="property-input" 
                                data-property="${propName}"
                                value="${colorValue}"
                                style="width: 60px; height: 40px; padding: 5px;"
                            >
                            <input 
                                type="text" 
                                class="property-input" 
                                data-property="${propName}-text"
                                value="${colorValue}"
                                style="flex: 1;"
                                readonly
                            >
                        </div>
                    </div>
                `;
                break;

            case 'range':
                const numValue = parseInt(currentValue) || propMeta.min;
                control = `
                    <div class="property-group">
                        <label class="property-label">
                            ${propMeta.label}
                            <span style="float: right; color: var(--editor-primary);">${numValue}${propMeta.unit || ''}</span>
                        </label>
                        <input 
                            type="range" 
                            class="property-input" 
                            data-property="${propName}"
                            min="${propMeta.min}"
                            max="${propMeta.max}"
                            value="${numValue}"
                            data-unit="${propMeta.unit || ''}"
                        >
                    </div>
                `;
                break;

            case 'select':
                const options = propMeta.options.map(opt =>
                    `<option value="${opt.value}" ${currentValue === opt.value ? 'selected' : ''}>${opt.label}</option>`
                ).join('');
                control = `
                    <div class="property-group">
                        <label class="property-label">${propMeta.label}</label>
                        <select class="property-input" data-property="${propName}">
                            ${options}
                        </select>
                    </div>
                `;
                break;

            case 'alignment':
                const buttons = propMeta.options.map(opt => {
                    const isSvg = opt.icon && opt.icon.includes('<svg');
                    const iconContent = isSvg ? opt.icon : `<i class="fas ${opt.icon}"></i>`;

                    return `
                        <button 
                            class="alignment-btn ${currentValue === opt.value ? 'active' : ''}" 
                            data-property="${propName}" 
                            data-value="${opt.value}"
                            title="${opt.value}"
                        >
                            ${iconContent}
                        </button>
                    `;
                }).join('');
                control = `
                    <div class="property-group">
                        <label class="property-label">${propMeta.label}</label>
                        <div class="alignment-group">
                            ${buttons}
                        </div>
                    </div>
                `;
                break;
        }

        return control;
    },

    // Extract color value from CSS color string
    extractColor(colorString) {
        if (!colorString) return '#000000';

        // If already hex, return it
        if (colorString.startsWith('#')) return colorString;

        // If rgb/rgba, convert to hex
        if (colorString.startsWith('rgb')) {
            const matches = colorString.match(/\d+/g);
            if (matches && matches.length >= 3) {
                const r = parseInt(matches[0]).toString(16).padStart(2, '0');
                const g = parseInt(matches[1]).toString(16).padStart(2, '0');
                const b = parseInt(matches[2]).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            }
        }

        return '#000000';
    },

    // Attach event listeners to controls
    attachEventListeners() {
        // Delete button
        const deleteBtn = this.container.querySelector('#deleteComponentBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDelete());
        }

        // Upload buttons
        const uploadBtns = this.container.querySelectorAll('.btn-upload');
        uploadBtns.forEach(btn => {
            const propName = btn.dataset.upload;
            btn.addEventListener('click', () => this.handleImageUpload(propName));
        });

        // Alignment buttons
        const alignBtns = this.container.querySelectorAll('.alignment-btn');
        alignBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const property = btn.dataset.property;
                const value = btn.dataset.value;

                // Update UI: remove active from siblings
                btn.parentElement.querySelectorAll('.alignment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update property
                this.updateProperty(property, value);

                // Save history
                if (typeof HistoryManager !== 'undefined') {
                    HistoryManager.saveState(EditorCanvas.currentTemplate);
                }
            });
        });

        const inputs = this.container.querySelectorAll('.property-input');

        inputs.forEach(input => {
            const property = input.dataset.property;
            if (!property || property.endsWith('-text')) return;

            if (input.type === 'range') {
                input.addEventListener('input', (e) => {
                    const value = e.target.value;
                    const unit = e.target.dataset.unit || '';
                    const label = e.target.previousElementSibling.querySelector('span');
                    if (label) {
                        label.textContent = value + unit;
                    }
                    this.updateProperty(property, value + unit);
                });
            } else if (input.type === 'color') {
                input.addEventListener('change', (e) => {
                    const value = e.target.value;
                    // Update text input
                    const textInput = this.container.querySelector(`[data-property="${property}-text"]`);
                    if (textInput) {
                        textInput.value = value;
                    }
                    this.updateProperty(property, value);
                });
            } else {
                input.addEventListener('input', (e) => {
                    this.updateProperty(property, e.target.value);

                    // Save history with a small delay to debounce
                    clearTimeout(this.historyTimeout);
                    this.historyTimeout = setTimeout(() => {
                        if (typeof HistoryManager !== 'undefined') {
                            HistoryManager.saveState(EditorCanvas.currentTemplate);
                        }
                    }, 500);
                });
            }
        });
    },

    // Update component property
    updateProperty(property, value) {
        if (!this.currentComponent) return;

        // Update in canvas
        EditorCanvas.updateComponent(this.currentComponent.id, property, value);

        // Update current component reference
        this.currentComponent.properties[property] = value;
    },

    // Handle delete component
    handleDelete() {
        if (!this.currentComponent) return;

        EditorCanvas.deleteComponent(this.currentComponent.id);
        this.currentComponent = null;
        this.showEmptyState();
    },

    // Handle image upload
    handleImageUpload(propName) {
        const fileInput = document.getElementById(`fileInput-${propName}`);
        if (!fileInput) return;

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione apenas arquivos de imagem.');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Imagem muito grande! Tamanho máximo: 2MB');
                return;
            }

            // Convert to Base64
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;

                // Update the input field
                const input = this.container.querySelector(`[data-property="${propName}"]`);
                if (input) {
                    input.value = base64;
                }

                // Update the component
                this.updateProperty(propName, base64);

                console.log(`📷 Imagem carregada com sucesso (${(file.size / 1024).toFixed(2)}KB)`);
            };
            reader.onerror = () => {
                alert('Erro ao carregar imagem. Tente novamente.');
            };
            reader.readAsDataURL(file);
        };

        fileInput.click();
    },

    // Show empty state
    showEmptyState() {
        this.container.innerHTML = `
            <div class="panel-empty-state">
                <i class="fas fa-mouse-pointer"></i>
                <p>Selecione um elemento para editar suas propriedades</p>
            </div>
        `;
    }
};
