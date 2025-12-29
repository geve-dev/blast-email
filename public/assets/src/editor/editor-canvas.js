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
                    
                    /* Base styles for editable elements */
                    .editable-element { 
                        position: relative; 
                        cursor: pointer; 
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        margin: 8px 0;
                        border-radius: 4px;
                    }
                    
                    /* Enhanced hover state */
                    .editable-element:hover { 
                        outline: 2px solid var(--editor-primary, #00ffd0); 
                        outline-offset: 4px;
                        background: rgba(0, 255, 208, 0.08);
                        z-index: 10;
                        transform: translateY(-1px);
                        box-shadow: 0 2px 8px rgba(0, 255, 208, 0.15);
                    }
                    
                    /* Selected state */
                    .editable-element.selected { 
                        outline: 3px solid var(--editor-primary, #00ffd0); 
                        outline-offset: 4px;
                        background: rgba(0, 255, 208, 0.12); 
                        z-index: 11;
                        box-shadow: 0 4px 12px rgba(0, 255, 208, 0.2);
                    }
                    
                    /* Dragging state - element being dragged */
                    .editable-element.dragging-component {
                        opacity: 0.5;
                        transform: scale(0.98);
                        box-shadow: 0 8px 24px rgba(0, 255, 208, 0.3);
                        outline: 3px dashed var(--editor-primary, #00ffd0);
                        outline-offset: 4px;
                        z-index: 1000;
                        cursor: grabbing !important;
                    }
                    
                    /* Drop zone indicator - all elements during drag */
                    .editable-element.drag-over-zone {
                        border: 2px solid rgba(0, 255, 208, 0.3);
                        border-radius: 4px;
                        background: rgba(0, 255, 208, 0.03);
                        transition: all 0.2s ease;
                    }
                    
                    /* Drop target indicator - where element will be inserted */
                    .editable-element.drop-target-top {
                        border-top: 4px solid var(--editor-primary, #00ffd0) !important;
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                        padding-top: 8px;
                        margin-top: 12px;
                        box-shadow: 0 -4px 12px rgba(0, 255, 208, 0.4);
                        background: rgba(0, 255, 208, 0.05);
                    }
                    
                    .editable-element.drop-target-bottom {
                        border-bottom: 4px solid var(--editor-primary, #00ffd0) !important;
                        border-bottom-left-radius: 8px;
                        border-bottom-right-radius: 8px;
                        padding-bottom: 8px;
                        margin-bottom: 12px;
                        box-shadow: 0 4px 12px rgba(0, 255, 208, 0.4);
                        background: rgba(0, 255, 208, 0.05);
                    }
                    
                    /* Smooth reordering animation */
                    .editable-element.reordering {
                        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                                    opacity 0.3s ease,
                                    margin 0.3s ease;
                    }
                    
                    /* Drop indicator line */
                    .drop-indicator {
                        position: absolute;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: var(--editor-primary, #00ffd0);
                        border-radius: 2px;
                        box-shadow: 0 0 12px rgba(0, 255, 208, 0.6);
                        z-index: 999;
                        pointer-events: none;
                        animation: pulse-drop 1.5s ease-in-out infinite;
                    }
                    
                    @keyframes pulse-drop {
                        0%, 100% { opacity: 0.6; transform: scaleY(1); }
                        50% { opacity: 1; transform: scaleY(1.2); }
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

        // Add dragging class for visual feedback
        const draggingElement = e.target.closest('.editable-element');
        if (draggingElement) {
            draggingElement.classList.add('dragging-component');
            
            // Add drag-over-zone class to all other elements
            const allElements = Array.from(this.iframeDoc.querySelectorAll('.editable-element'));
            allElements.forEach(el => {
                if (el.dataset.componentId !== componentId) {
                    el.classList.add('drag-over-zone');
                }
            });
        }
    },

    // Handle component drag over (for reordering)
    handleComponentDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        const draggingId = e.dataTransfer.getData('reorderComponentId');
        if (!draggingId) return;

        const elements = Array.from(this.iframeDoc.querySelectorAll('.editable-element'));
        if (!elements.length) return;

        // Clear previous drop target indicators
        elements.forEach(el => {
            el.classList.remove('drop-target-top', 'drop-target-bottom');
        });
        
        // Remove all existing drop indicators
        const allIndicators = this.iframeDoc.querySelectorAll('.drop-indicator');
        allIndicators.forEach(ind => ind.remove());

        const dropY = e.clientY;
        let marked = false;

        // Find the drop target
        for (let el of elements) {
            if (el.dataset.componentId === draggingId) continue;
            
            const rect = el.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            
            if (dropY < midpoint) {
                // Insert before this element
                el.classList.add('drop-target-top');
                
                // Add visual drop indicator line above the element
                const bodyRect = this.iframeDoc.body.getBoundingClientRect();
                const indicator = this.iframeDoc.createElement('div');
                indicator.className = 'drop-indicator';
                indicator.style.position = 'absolute';
                indicator.style.left = '0';
                indicator.style.right = '0';
                indicator.style.top = `${rect.top - bodyRect.top - 2}px`;
                indicator.style.width = '100%';
                this.iframeDoc.body.appendChild(indicator);
                
                marked = true;
                break;
            }
        }

        if (!marked) {
            // Insert at the end - show indicator at bottom of last non-dragging element
            const last = [...elements].reverse().find(el => el.dataset.componentId !== draggingId);
            if (last) {
                last.classList.add('drop-target-bottom');
                
                // Add visual drop indicator line below the last element
                const rect = last.getBoundingClientRect();
                const bodyRect = this.iframeDoc.body.getBoundingClientRect();
                const indicator = this.iframeDoc.createElement('div');
                indicator.className = 'drop-indicator';
                indicator.style.position = 'absolute';
                indicator.style.left = '0';
                indicator.style.right = '0';
                indicator.style.top = `${rect.bottom - bodyRect.top + 2}px`;
                indicator.style.width = '100%';
                this.iframeDoc.body.appendChild(indicator);
            }
        }
    },

    // Handle component drag leave
    handleComponentDragLeave(e) {
        // Only clear if we're actually leaving the element (not just moving to a child)
        const relatedTarget = e.relatedTarget;
        const target = e.target.closest('.editable-element');
        
        if (target && (!relatedTarget || !target.contains(relatedTarget))) {
            target.classList.remove('drop-target-top', 'drop-target-bottom');
            const indicator = target.querySelector('.drop-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    },

    // Handle component drop (for reordering)
    handleComponentDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const draggingId = e.dataTransfer.getData('reorderComponentId');
        if (!draggingId) return;

        const elements = Array.from(this.iframeDoc.querySelectorAll('.editable-element'));
        if (!elements.length) return;

        // Clear all indicators
        elements.forEach(el => {
            el.classList.remove('drop-target-top', 'drop-target-bottom', 'drag-over-zone');
            const indicator = el.querySelector('.drop-indicator');
            if (indicator) {
                indicator.remove();
            }
        });
        
        // Remove all drop indicators from body
        const allIndicators = this.iframeDoc.querySelectorAll('.drop-indicator');
        allIndicators.forEach(ind => ind.remove());

        const dropY = e.clientY;
        let found = null;

        for (let el of elements) {
            if (el.dataset.componentId === draggingId) continue;
            const rect = el.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (dropY < midpoint) {
                found = el;
                break;
            }
        }

        const flat = this.getFlatComponents();
        const draggedIndex = this.findComponentIndex(draggingId);
        if (draggedIndex === -1) return;

        if (found) {
            const targetIndex = this.findComponentIndex(found.dataset.componentId);
            if (targetIndex === -1) return;
            const dropBefore = true;
            this.reorderComponents(draggedIndex, targetIndex, dropBefore);
        } else {
            // Append to end
            const toIndex = flat.length - 1;
            const dropBefore = false;
            this.reorderComponents(draggedIndex, toIndex, dropBefore);
        }
    },

    // Handle component drag end
    handleComponentDragEnd(e) {
        const draggingElement = e.target.closest('.editable-element');
        if (draggingElement) {
            draggingElement.classList.remove('dragging-component');
        }

        // Clear all drop indicators and visual states
        const elements = this.iframeDoc.querySelectorAll('.editable-element');
        elements.forEach(el => {
            el.classList.remove('drop-target-top', 'drop-target-bottom', 'drag-over-zone');
            const indicator = el.querySelector('.drop-indicator');
            if (indicator) {
                indicator.remove();
            }
        });
        
        // Remove all drop indicators from body
        const allIndicators = this.iframeDoc.querySelectorAll('.drop-indicator');
        allIndicators.forEach(ind => ind.remove());
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

        // Add reordering class to all elements for smooth animation
        const elements = Array.from(this.iframeDoc.querySelectorAll('.editable-element'));
        elements.forEach(el => {
            el.classList.add('reordering');
        });

        // Re-render with animation
        this.render();

        // Remove reordering class after animation completes
        setTimeout(() => {
            const newElements = Array.from(this.iframeDoc.querySelectorAll('.editable-element'));
            newElements.forEach(el => {
                el.classList.remove('reordering');
            });
        }, 300);

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
                <img src="${src || 'https://cdn-icons-png.flaticon.com/64/4211/4211763.png'}" alt="Logo" style="width: ${logoWidth}; margin-bottom: 15px;">
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
        const { socialLinks, iconSize, align } = component.properties;

        const localBasePath = '/assets/social-icons';
        const localIconFileMap = {
            facebook: 'facebook.png',
            instagram: 'instagram.png',
            whatsapp: 'whatsapp.png',
            twitter: 'x.png',
            youtube: 'youtube.png',
            reddit: 'reddit.png',
            pinterest: 'pinterest.png',
            tiktok: 'tiktok.png',
            github: 'github.png',
            snapchat: 'snapchat.png',
            discord: 'discord.png'
        };

        const getLocalIconUrl = (type) => {
            const file = localIconFileMap[type];
            if (!file) return '';
            return `${localBasePath}/${file}`;
        };

        const iconMap = {
            facebook: 'fa-facebook',
            instagram: 'fa-instagram',
            whatsapp: 'fa-whatsapp',
            twitter: 'fa-twitter',
            linkedin: 'fa-linkedin',
            youtube: 'fa-youtube',
            reddit: 'fa-reddit-alien',
            pinterest: 'fa-pinterest',
            tiktok: 'fa-tiktok',
            telegram: 'fa-telegram',
            discord: 'fa-discord',
            github: 'fa-github',
            snapchat: 'fa-snapchat-ghost'
        };

        let links = Array.isArray(socialLinks) ? socialLinks : null;

        // Fallback: convert legacy fixed URL props to socialLinks
        if (!links) {
            const p = component.properties || {};
            const legacy = [
                { type: 'facebook', url: p.facebookUrl },
                { type: 'instagram', url: p.instagramUrl },
                { type: 'whatsapp', url: p.whatsappUrl },
                { type: 'twitter', url: p.twitterUrl },
                { type: 'linkedin', url: p.linkedinUrl },
                { type: 'youtube', url: p.youtubeUrl },
                { type: 'reddit', url: p.redditUrl },
                { type: 'pinterest', url: p.pinterestUrl },
                { type: 'tiktok', url: p.tiktokUrl },
                { type: 'telegram', url: p.telegramUrl }
            ];

            const enabled = Array.isArray(p.enabledNetworks) && p.enabledNetworks.length > 0 ? p.enabledNetworks : null;
            links = legacy
                .filter(l => {
                    if (!l.url || String(l.url).trim() === '') return false;
                    if (enabled && !enabled.includes(l.type)) return false;
                    return true;
                })
                .map(l => ({ type: l.type, url: l.url }));
        }

        const iconsHTML = (links || [])
            .filter(link => link && link.url && String(link.url).trim() !== '')
            .map(link => {
                const isCustom = link && link.type === 'custom';
                const customIconSrc = link && link.iconSrc ? String(link.iconSrc) : '';

                if (isCustom) {
                    const size = iconSize || '32px';
                    const inner = customIconSrc
                        ? `<img src="${customIconSrc}" alt="custom" style="width:${size}; height:${size}; object-fit:contain; display:inline-block; vertical-align:middle;" />`
                        : `<span style="display:inline-block; width:${size}; height:${size}; line-height:${size}; text-align:center; font-size: 12px; color:#999;">?</span>`;
                    return `<a href="${link.url}" style="margin: 0 10px; text-decoration: none; display:inline-block;">${inner}</a>`;
                }

                const size = iconSize || '32px';
                const localIconUrl = getLocalIconUrl(link.type);
                if (localIconUrl) {
                    return `<a href="${link.url}" style="margin: 0 10px; text-decoration: none; display:inline-block;"><img src="${localIconUrl}" alt="${link.type}" style="width:${size}; height:${size}; object-fit:contain; display:inline-block; vertical-align:middle;" /></a>`;
                }

                const icon = iconMap[link.type] || 'fa-globe';
                const isFab = icon !== 'fa-globe';
                const iconClass = isFab ? `fab ${icon}` : `fas ${icon}`;
                return `<a href="${link.url}" style="margin: 0 10px; font-size: ${iconSize}; color: #333; text-decoration: none;"><i class="${iconClass}"></i></a>`;
            })
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