// Editor Canvas - Manages the preview iframe and element selection

const EditorCanvas = {
    iframe: null,
    iframeDoc: null,
    selectedElement: null,
    currentTemplate: null,

    // Initialize canvas
    init() {
        this.iframe = document.getElementById('previewFrame');
        this.setupIframe();

        // Initialize history
        if (typeof HistoryManager !== 'undefined') {
            HistoryManager.init();
        }
    },

    // Setup iframe document
    setupIframe() {
        this.iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;

        // Initialize empty document
        this.iframeDoc.open();
        this.iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <style>
                    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; min-height: 100vh; box-sizing: border-box; background: #fff; }
                    .editable-element { position: relative; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                    .editable-element:hover { 
                        outline: 2px solid var(--editor-primary, #00ffd0); 
                        outline-offset: 4px;
                        background: rgba(0, 255, 208, 0.05);
                        z-index: 10;
                    }
                    .editable-element.selected { 
                        outline: 3px solid var(--editor-primary, #00ffd0); 
                        outline-offset: 4px;
                        background: rgba(0, 255, 208, 0.1); 
                        z-index: 11;
                    }
                </style>
            </head>
            <body></body>
            </html>
        `);
        this.iframeDoc.close();

        // Attach event listeners after iframe loads
        this.attachEventListeners();
    },

    // Attach event listeners to iframe
    attachEventListeners() {
        if (!this.iframeDoc) return;

        // Remove old listeners if any
        if (this.clickHandler) {
            this.iframeDoc.removeEventListener('click', this.clickHandler);
        }

        // Create bound handler
        this.clickHandler = (e) => this.handleElementClick(e);

        // Add click listener
        this.iframeDoc.addEventListener('click', this.clickHandler);
    },

    // Load template into canvas
    loadTemplate(templateData) {
        this.currentTemplate = templateData;

        // Initial history state
        if (typeof HistoryManager !== 'undefined') {
            HistoryManager.saveState(this.currentTemplate);
        }

        this.render();

        // Show canvas, hide empty state
        document.getElementById('canvasContainer').classList.add('active');
        document.getElementById('emptyState').style.display = 'none';
    },

    // Render template in iframe
    render() {
        if (!this.currentTemplate) return;

        const body = this.iframeDoc.body;
        body.innerHTML = '';

        // If no components, just show empty white canvas
        if (!this.currentTemplate.components || this.currentTemplate.components.length === 0) {
            // Empty canvas - ready to receive components
            console.log('Canvas vazio - arraste componentes da biblioteca');
            return;
        }

        // Render each component
        this.currentTemplate.components.forEach((comp, index) => {
            if (Array.isArray(comp)) {
                // Content section with multiple components
                comp.forEach(subComp => {
                    this.renderComponent(subComp, body);
                });
            } else {
                // Single component
                this.renderComponent(comp, body);
            }
        });

        // Re-attach event listeners after rendering
        this.attachEventListeners();
    },

    // Render individual component
    renderComponent(component, container) {
        const wrapper = this.iframeDoc.createElement('div');
        wrapper.className = 'editable-element';
        wrapper.dataset.componentId = component.id;
        wrapper.dataset.componentType = component.type;

        // Make components draggable for reordering
        wrapper.draggable = true;
        wrapper.addEventListener('dragstart', (e) => this.handleComponentDragStart(e));
        wrapper.addEventListener('dragover', (e) => this.handleComponentDragOver(e));
        wrapper.addEventListener('drop', (e) => this.handleComponentDrop(e));
        wrapper.addEventListener('dragend', (e) => this.handleComponentDragEnd(e));
        wrapper.addEventListener('dragleave', (e) => this.handleComponentDragLeave(e));

        // Render based on type and set innerHTML
        let html = '';
        switch (component.type) {
            case 'text':
                html = this.renderText(component);
                break;
            case 'heading':
                html = this.renderHeading(component);
                break;
            case 'button':
                html = this.renderButton(component);
                break;
            case 'image':
                html = this.renderImage(component);
                break;
            case 'header':
                html = this.renderHeader(component);
                break;
            case 'footer':
                html = this.renderFooter(component);
                break;
            case 'social':
                html = this.renderSocial(component);
                break;
        }

        wrapper.innerHTML = html;
        container.appendChild(wrapper);
    },

    // Handle component drag start (for reordering)
    handleComponentDragStart(e) {
        e.stopPropagation();
        const componentId = e.target.dataset.componentId;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('reorderComponentId', componentId);

        e.target.style.opacity = '1';
        e.target.classList.add('dragging-component');
    },

    // Handle component drag over (for reordering)
    handleComponentDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        const draggingId = e.dataTransfer.getData('reorderComponentId');
        if (!draggingId) return;

        const target = e.target.closest('.editable-element');
        if (!target || target.dataset.componentId === draggingId) return;

        // Show drop indicator
        const rect = target.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        if (e.clientY < midpoint) {
            target.style.borderTop = '3px solid #00ffd0';
            target.style.borderBottom = '';
        } else {
            target.style.borderBottom = '3px solid #00ffd0';
            target.style.borderTop = '';
        }
    },

    // Handle component drag leave
    handleComponentDragLeave(e) {
        const target = e.target.closest('.editable-element');
        if (target) {
            target.style.borderTop = '';
            target.style.borderBottom = '';
        }
    },

    // Handle component drop (for reordering)
    handleComponentDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const draggingId = e.dataTransfer.getData('reorderComponentId');
        if (!draggingId) return;

        const target = e.target.closest('.editable-element');
        if (!target || target.dataset.componentId === draggingId) return;

        // Clear drop indicators
        target.style.borderTop = '';
        target.style.borderBottom = '';

        // Get positions
        const draggedIndex = this.findComponentIndex(draggingId);
        const targetIndex = this.findComponentIndex(target.dataset.componentId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Determine drop position
        const rect = target.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const dropBefore = e.clientY < midpoint;

        // Reorder components
        this.reorderComponents(draggedIndex, targetIndex, dropBefore);
    },

    // Handle component drag end
    handleComponentDragEnd(e) {
        e.target.style.opacity = '';
        e.target.classList.remove('dragging-component');

        // Clear all drop indicators
        const elements = this.iframeDoc.querySelectorAll('.editable-element');
        elements.forEach(el => {
            el.style.borderTop = '';
            el.style.borderBottom = '';
        });
    },

    // Find component index in flat array
    findComponentIndex(componentId) {
        const flatComponents = this.getFlatComponents();
        return flatComponents.findIndex(c => c.id === componentId);
    },

    // Get flat array of components
    getFlatComponents() {
        if (!this.currentTemplate) return [];

        const flat = [];
        this.currentTemplate.components.forEach(comp => {
            if (Array.isArray(comp)) {
                flat.push(...comp);
            } else {
                flat.push(comp);
            }
        });
        return flat;
    },

    // Reorder components
    reorderComponents(fromIndex, toIndex, insertBefore) {
        const flatComponents = this.getFlatComponents();

        // Remove dragged component
        const [draggedComponent] = flatComponents.splice(fromIndex, 1);

        // Calculate new index
        let newIndex = toIndex;
        if (fromIndex < toIndex && !insertBefore) {
            newIndex = toIndex;
        } else if (fromIndex < toIndex && insertBefore) {
            newIndex = toIndex - 1;
        } else if (fromIndex > toIndex && insertBefore) {
            newIndex = toIndex;
        } else if (fromIndex > toIndex && !insertBefore) {
            newIndex = toIndex + 1;
        }

        // Insert at new position
        flatComponents.splice(newIndex, 0, draggedComponent);

        // Update template
        this.currentTemplate.components = flatComponents;

        // Re-render
        this.render();

        // Save history
        if (typeof HistoryManager !== 'undefined') {
            HistoryManager.saveState(this.currentTemplate);
        }

        console.log(`✅ Componente reordenado: posição ${fromIndex + 1} → ${newIndex + 1} `);
    },


    // Render text component
    renderText(component) {
        const { content, fontSize, color, textAlign, lineHeight } = component.properties;
        return `<p style="font-size: ${fontSize}; color: ${color}; text-align: ${textAlign}; line-height: ${lineHeight}; margin: 10px 0;">${content}</p>`;
    },

    // Render heading component
    renderHeading(component) {
        const { content, fontSize, color, textAlign, fontWeight } = component.properties;
        return `<h1 style="font-size: ${fontSize}; color: ${color}; text-align: ${textAlign}; font-weight: ${fontWeight}; margin: 20px 0;">${content}</h1>`;
    },

    // Render button component
    renderButton(component) {
        const { text, backgroundColor, textColor, borderRadius, padding, fontSize, align } = component.properties;
        return `
            <div style="text-align: ${align || 'center'}; margin: 20px 0;">
                <a href="#" style="display: inline-block; background: ${backgroundColor}; color: ${textColor}; padding: ${padding}; border-radius: ${borderRadius}; font-size: ${fontSize}; text-decoration: none;">${text}</a>
            </div>
        `;
    },

    // Render image component
    renderImage(component) {
        const { src, alt, width, align } = component.properties;
        return `
            <div style="text-align: ${align || 'center'}; margin: 20px 0;">
                <img src="${src}" alt="${alt}" style="max-width: ${width}; height: auto;">
            </div>
        `;
    },

    // Render header component
    renderHeader(component) {
        const { src, logoWidth, backgroundColor, align, menu1Text, menu1Url, menu2Text, menu2Url, menu3Text, menu3Url, menu4Text, menu4Url } = component.properties;

        // Build menu items from individual properties
        const menuItems = [];
        if (menu1Text) menuItems.push({ text: menu1Text, url: menu1Url || '#' });
        if (menu2Text) menuItems.push({ text: menu2Text, url: menu2Url || '#' });
        if (menu3Text) menuItems.push({ text: menu3Text, url: menu3Url || '#' });
        if (menu4Text) menuItems.push({ text: menu4Text, url: menu4Url || '#' });

        const menuHTML = menuItems.map(item => `<a href="${item.url}" style="margin: 0 15px; color: #333; text-decoration: none;">${item.text}</a>`).join('');

        return `
            <div style="background: ${backgroundColor}; padding: 20px; text-align: ${align || 'center'};">
                <img src="${src || 'https://via.placeholder.com/200x50'}" alt="Logo" style="width: ${logoWidth}; margin-bottom: 15px;">
                ${menuHTML ? `<div style="margin-top: 15px;">${menuHTML}</div>` : ''}
            </div>
        `;
    },

    // Render footer component
    renderFooter(component) {
        const { companyName, address, align, link1Text, link1Url, link2Text, link2Url } = component.properties;

        // Build links from individual properties
        const links = [];
        if (link1Text) links.push({ text: link1Text, url: link1Url || '#' });
        if (link2Text) links.push({ text: link2Text, url: link2Url || '#' });

        const linksHTML = links.map(link => `<a href="${link.url}" style="color: #666; text-decoration: none; margin: 0 10px;">${link.text}</a>`).join(' | ');

        return `
            <div style="background: #f5f5f5; padding: 30px; text-align: ${align || 'center'}; margin-top: 20px;">
                <p style="margin: 5px 0; font-size: 12px; color: #666;">${companyName}</p>
                <p style="margin: 5px 0; font-size: 12px; color: #666;">${address}</p>
                ${linksHTML ? `<p style="margin: 10px 0; font-size: 11px;">${linksHTML}</p>` : ''}
            </div>
        `;
    },

    // Render social icons
    renderSocial(component) {
        const { facebookUrl, instagramUrl, whatsappUrl, twitterUrl, linkedinUrl, youtubeUrl, iconSize, align } = component.properties;

        const socialLinks = [
            { url: facebookUrl, icon: 'fa-facebook', type: 'facebook' },
            { url: instagramUrl, icon: 'fa-instagram', type: 'instagram' },
            { url: whatsappUrl, icon: 'fa-whatsapp', type: 'whatsapp' },
            { url: twitterUrl, icon: 'fa-twitter', type: 'twitter' },
            { url: linkedinUrl, icon: 'fa-linkedin', type: 'linkedin' },
            { url: youtubeUrl, icon: 'fa-youtube', type: 'youtube' }
        ];

        const iconsHTML = socialLinks
            .filter(link => link.url && link.url.trim() !== '')
            .map(link => `<a href="${link.url}" style="margin: 0 10px; font-size: ${iconSize}; color: #333; text-decoration: none;"><i class="fab ${link.icon}"></i></a>`)
            .join('');

        return `
            <div style="text-align: ${align || 'center'}; margin: 20px 0;">
                ${iconsHTML || '<p style="font-size: 12px; color: #999;">(Configure as redes sociais no painel de propriedades)</p>'}
            </div>
        `;
    },

    // Handle element click
    handleElementClick(e) {
        e.preventDefault();

        // Find closest editable element
        const element = e.target.closest('.editable-element');
        if (!element) return;

        // Deselect previous
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
        }

        // Select new element
        this.selectedElement = element;
        element.classList.add('selected');

        // Get component data
        const componentId = element.dataset.componentId;
        const component = this.findComponent(componentId);

        // Update properties panel
        if (component) {
            PropertiesPanel.showProperties(component);
        }
    },

    // Find component by ID
    findComponent(id) {
        if (!this.currentTemplate) return null;

        for (let comp of this.currentTemplate.components) {
            if (Array.isArray(comp)) {
                const found = comp.find(c => c.id === id);
                if (found) return found;
            } else if (comp.id === id) {
                return comp;
            }
        }
        return null;
    },

    // Update component property
    updateComponent(componentId, property, value) {
        const component = this.findComponent(componentId);
        if (!component) return;

        component.properties[property] = value;
        this.render();

        // Re-select the element
        const element = this.iframeDoc.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
            this.selectedElement = element;
            element.classList.add('selected');
        }

        // Save history (debounced in practice via properties-panel, but good to have here too)
        // Note: For properties, we should ideally debounce to avoid 100 history entries for one word
    },

    // Delete component
    deleteComponent(componentId) {
        if (!this.currentTemplate) return;

        // Remove from flat array
        const flatComponents = this.getFlatComponents();
        const filtered = flatComponents.filter(c => c.id !== componentId);

        // Update template
        this.currentTemplate.components = filtered;

        // Re-render
        this.render();

        // Save history
        if (typeof HistoryManager !== 'undefined') {
            HistoryManager.saveState(this.currentTemplate);
        }

        console.log(`🗑️ Componente deletado: ${componentId} `);
    },

    // Toggle view (desktop/mobile)
    setView(view) {
        const container = document.getElementById('canvasContainer');
        if (view === 'mobile') {
            container.classList.add('mobile');
        } else {
            container.classList.remove('mobile');
        }
    }
};
