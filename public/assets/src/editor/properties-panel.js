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
        // When showing component properties, remove any template selection visual
        const container = document.getElementById('canvasContainer');
        if (container) container.classList.remove('template-selected');
        this.templateSelected = false;

        this.currentComponent = component;
        this.render();
    },

    // Show template properties (when template/canvas is explicitly selected)
    showTemplate() {
        this.currentComponent = null;
        this.templateSelected = true;
        this.showEmptyState();
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

        if (this.currentComponent.type === 'social') {
            html += this.renderSocialControls();
        } else {
            componentDef.editableProps.forEach(propName => {
                const propMeta = ComponentRegistry.getPropertyMeta(propName);
                if (!propMeta) return;

                const currentValue = this.currentComponent.properties[propName];
                html += this.renderControl(propName, propMeta, currentValue);
            });
        }

        this.container.innerHTML = html;

        // Add event listeners
        this.attachEventListeners();
    },

    renderSocialControls() {
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

        const defaultUrlMap = {
            facebook: 'https://facebook.com',
            instagram: 'https://instagram.com',
            whatsapp: 'https://whatsapp.com',
            twitter: 'https://twitter.com',
            linkedin: 'https://linkedin.com',
            youtube: 'https://youtube.com',
            reddit: 'https://reddit.com',
            pinterest: 'https://pinterest.com',
            tiktok: 'https://tiktok.com',
            telegram: 'https://t.me',
            discord: 'https://discord.com',
            github: 'https://github.com',
            snapchat: 'https://snapchat.com'
        };

        const availableNetworks = Object.keys(iconMap);

        let links = Array.isArray(this.currentComponent.properties.socialLinks)
            ? this.currentComponent.properties.socialLinks
            : null;

        // Fallback: convert legacy fixed URL props to socialLinks
        if (!links) {
            const p = this.currentComponent.properties || {};
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

            this.updateProperty('socialLinks', links);
        }

        links = Array.isArray(links) ? links : [];

        let html = `
            <div class="property-group">
                <div class="social-more-header">
                    <label class="property-label" style="margin-bottom: 0;">Mais redes</label>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="social-more-btn" data-action="open-social-networks" title="Adicionar rede">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button type="button" class="social-more-btn" data-action="add-custom-social" title="Adicionar rede personalizada">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </div>
                <div class="social-more-selected">
                    <span style="color: var(--editor-text-muted); font-size: 0.85rem;">Clique no + para adicionar novas redes (pode repetir) ou na estrela para adicionar uma rede personalizada.</span>
                </div>
            </div>
        `;

        html += `
            <div class="property-group">
                <label class="property-label">Redes adicionadas</label>
                <div class="social-links-list">
                    ${links.length === 0
                ? '<div style="color: var(--editor-text-muted); font-size: 0.85rem;">Nenhuma rede adicionada</div>'
                : links.map((link, index) => {
                    const icon = iconMap[link.type] || 'fa-globe';
                    const isFab = icon !== 'fa-globe';
                    const iconClass = isFab ? `fab ${icon}` : `fas ${icon}`;
                    const url = link && link.url ? String(link.url) : '';
                    const isCustom = link && link.type === 'custom';
                    const customIconSrc = link && link.iconSrc ? String(link.iconSrc) : '';
                    const localIconUrl = getLocalIconUrl(link.type);
                    return `
                                <div class="social-link-row" data-social-index="${index}" style="display:flex; gap:8px; align-items:center; margin-bottom: 10px;">
                                    <div class="social-link-icon" style="width:38px; height:38px; border-radius:999px; border:1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                        ${isCustom && customIconSrc
                            ? `<img src="${customIconSrc}" alt="custom" style="width: 22px; height: 22px; object-fit: contain;" />`
                            : (localIconUrl
                                ? `<img src="${localIconUrl}" alt="${link.type}" style="width: 22px; height: 22px; object-fit: contain; filter: brightness(0) invert(1);" />`
                                : `<i class="${iconClass}" style="font-size: 18px;"></i>`)}

                                    </div>
                                    <input
                                        type="text"
                                        class="property-input social-link-input"
                                        data-social-index="${index}"
                                        value="${url}"
                                        placeholder="${defaultUrlMap[link.type] || 'https://...'}"
                                        style="flex:1;"
                                    >
                                    ${isCustom ? `
                                        <button type="button" class="social-more-btn" data-action="upload-custom-social-icon" data-social-index="${index}" title="Upload ícone" style="width:38px; height:38px; display:inline-flex; align-items:center; justify-content:center;">
                                            <i class="fas fa-upload"></i>
                                        </button>
                                    ` : ''}
                                    <button type="button" class="btn-clear-url social-link-delete" data-delete-social-index="${index}" title="Deletar" style="width:38px; height:38px; display:inline-flex; align-items:center; justify-content:center;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `;
                }).join('')}
                </div>
            </div>
        `;

        ['iconSize', 'align'].forEach(propName => {
            const propMeta = ComponentRegistry.getPropertyMeta(propName);
            if (!propMeta) return;
            const currentValue = this.currentComponent.properties[propName];
            html += this.renderControl(propName, propMeta, currentValue);
        });

        html += this.renderSocialNetworksModal(availableNetworks, iconMap, getLocalIconUrl);

        return html;
    },

    renderSocialNetworksModal(networks, iconMap, getLocalIconUrl) {
        const buttons = (networks || []).map(n => {
            const icon = iconMap[n] || 'fa-globe';
            const isFab = icon !== 'fa-globe';
            const iconClass = isFab ? `fab ${icon}` : `fas ${icon}`;
            const localIconUrl = typeof getLocalIconUrl === 'function' ? getLocalIconUrl(n) : '';
            return `
                <button type="button" class="social-network-btn" data-network="${n}" title="${n}">
                    ${localIconUrl
                    ? `<img src="${localIconUrl}" alt="${n}" style="width: 22px; height: 22px; object-fit: contain; filter: brightness(0) invert(1);" />`
                    : `<i class="${iconClass}"></i>`}
                </button>
            `;
        }).join('');

        return `
            <div class="modal" id="socialNetworksModal">
                <div class="modal-content" style="max-width: 520px;">
                    <div class="modal-header">
                        <h2>Adicionar redes</h2>
                        <button class="modal-close" type="button" data-action="close-social-networks">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="social-network-grid">
                            ${buttons}
                        </div>
                        <div style="margin-top: 0.75rem; color: var(--editor-text-muted); font-size: 0.85rem;">
                            Clique em um ícone para adicionar. Você pode adicionar quantas vezes quiser (duplicatas).
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Render individual control
    renderControl(propName, propMeta, currentValue) {
        let control = '';


        switch (propMeta.type) {
            case 'text':
            case 'url':
                const isImageUrl = (propName === 'src' || propName === 'logoSrc');
                const labelIcon = propMeta.icon ? `<i class="fab ${propMeta.icon}" style="margin-right: 5px; color: var(--editor-primary);"></i>` : '';
                const showClearUrlBtn = propMeta.type === 'url' && !!propMeta.icon;
                control = `
                    <div class="property-group">
                        <label class="property-label">${labelIcon}${propMeta.label}</label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <input 
                                type="text" 
                                class="property-input" 
                                data-property="${propName}"
                                value="${currentValue || ''}"
                                placeholder="${propMeta.placeholder || ''}"
                                style="flex: 1;"
                            >
                            ${showClearUrlBtn ? `
                                <button 
                                    type="button"
                                    class="btn-clear-url"
                                    data-clear-property="${propName}"
                                    title="Remover URL"
                                    style="width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center;"
                                >
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
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
                                placeholder="#rrggbb"
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

        const addCustomSocialBtn = this.container.querySelector('[data-action="add-custom-social"]');
        if (addCustomSocialBtn) {
            addCustomSocialBtn.addEventListener('click', () => {
                const currentLinks = Array.isArray(this.currentComponent.properties.socialLinks)
                    ? [...this.currentComponent.properties.socialLinks]
                    : [];

                currentLinks.push({ type: 'custom', url: 'https://', iconSrc: '' });

                this.updateProperty('socialLinks', currentLinks);
                this.currentComponent.properties.socialLinks = currentLinks;
                this.render();

                if (typeof HistoryManager !== 'undefined') {
                    HistoryManager.saveState(EditorCanvas.currentTemplate);
                }
            });
        }

        const openSocialNetworksBtn = this.container.querySelector('[data-action="open-social-networks"]');
        if (openSocialNetworksBtn) {
            openSocialNetworksBtn.addEventListener('click', () => {
                const modal = document.getElementById('socialNetworksModal');
                if (modal) modal.classList.add('active');
            });
        }

        const closeSocialNetworksBtn = this.container.querySelector('[data-action="close-social-networks"]');
        if (closeSocialNetworksBtn) {
            closeSocialNetworksBtn.addEventListener('click', () => {
                const modal = document.getElementById('socialNetworksModal');
                if (modal) modal.classList.remove('active');
            });
        }

        const socialNetworksModal = this.container.querySelector('#socialNetworksModal');
        if (socialNetworksModal) {
            socialNetworksModal.addEventListener('click', (e) => {
                if (e.target === socialNetworksModal) {
                    socialNetworksModal.classList.remove('active');
                }
            });

            const networkBtns = socialNetworksModal.querySelectorAll('.social-network-btn');
            networkBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const network = btn.dataset.network;
                    if (!network) return;

                    const defaultUrlMap = {
                        facebook: 'https://facebook.com',
                        instagram: 'https://instagram.com',
                        whatsapp: 'https://whatsapp.com',
                        twitter: 'https://twitter.com',
                        linkedin: 'https://linkedin.com',
                        youtube: 'https://youtube.com',
                        reddit: 'https://reddit.com',
                        pinterest: 'https://pinterest.com',
                        tiktok: 'https://tiktok.com',
                        telegram: 'https://t.me',
                        discord: 'https://discord.com',
                        github: 'https://github.com',
                        snapchat: 'https://snapchat.com'
                    };

                    const currentLinks = Array.isArray(this.currentComponent.properties.socialLinks)
                        ? [...this.currentComponent.properties.socialLinks]
                        : [];

                    currentLinks.push({ type: network, url: defaultUrlMap[network] || 'https://' });

                    this.updateProperty('socialLinks', currentLinks);
                    this.currentComponent.properties.socialLinks = currentLinks;
                    this.render();

                    if (typeof HistoryManager !== 'undefined') {
                        HistoryManager.saveState(EditorCanvas.currentTemplate);
                    }
                });
            });
        }

        const uploadCustomIconBtns = this.container.querySelectorAll('[data-action="upload-custom-social-icon"]');
        uploadCustomIconBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.socialIndex, 10);
                if (Number.isNaN(index)) return;

                const currentLinks = Array.isArray(this.currentComponent.properties.socialLinks)
                    ? [...this.currentComponent.properties.socialLinks]
                    : [];

                if (index < 0 || index >= currentLinks.length) return;
                if (!currentLinks[index] || currentLinks[index].type !== 'custom') return;

                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';

                input.onchange = (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;

                    if (!file.type.startsWith('image/')) {
                        alert('Por favor, selecione apenas arquivos de imagem.');
                        return;
                    }

                    if (file.size > 2 * 1024 * 1024) {
                        alert('Imagem muito grande! Tamanho máximo: 2MB');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target.result;
                        const nextLinks = Array.isArray(this.currentComponent.properties.socialLinks)
                            ? [...this.currentComponent.properties.socialLinks]
                            : [];

                        if (index < 0 || index >= nextLinks.length) return;
                        nextLinks[index] = { ...nextLinks[index], iconSrc: base64 };

                        this.updateProperty('socialLinks', nextLinks);
                        this.currentComponent.properties.socialLinks = nextLinks;
                        this.render();

                        if (typeof HistoryManager !== 'undefined') {
                            HistoryManager.saveState(EditorCanvas.currentTemplate);
                        }
                    };
                    reader.onerror = () => {
                        alert('Erro ao carregar imagem. Tente novamente.');
                    };
                    reader.readAsDataURL(file);
                };

                input.click();
            });
        });

        // Social links list: delete item
        const deleteSocialBtns = this.container.querySelectorAll('[data-delete-social-index]');
        deleteSocialBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.deleteSocialIndex, 10);
                if (Number.isNaN(index)) return;

                const currentLinks = Array.isArray(this.currentComponent.properties.socialLinks)
                    ? [...this.currentComponent.properties.socialLinks]
                    : [];

                if (index < 0 || index >= currentLinks.length) return;
                currentLinks.splice(index, 1);

                this.updateProperty('socialLinks', currentLinks);
                this.currentComponent.properties.socialLinks = currentLinks;
                this.render();

                if (typeof HistoryManager !== 'undefined') {
                    HistoryManager.saveState(EditorCanvas.currentTemplate);
                }
            });
        });

        // Social links list: edit URL
        const socialLinkInputs = this.container.querySelectorAll('.social-link-input');
        socialLinkInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.socialIndex, 10);
                if (Number.isNaN(index)) return;

                const currentLinks = Array.isArray(this.currentComponent.properties.socialLinks)
                    ? [...this.currentComponent.properties.socialLinks]
                    : [];

                if (index < 0 || index >= currentLinks.length) return;
                currentLinks[index] = { ...currentLinks[index], url: e.target.value };

                this.updateProperty('socialLinks', currentLinks);
                this.currentComponent.properties.socialLinks = currentLinks;

                clearTimeout(this.historyTimeout);
                this.historyTimeout = setTimeout(() => {
                    if (typeof HistoryManager !== 'undefined') {
                        HistoryManager.saveState(EditorCanvas.currentTemplate);
                    }
                }, 500);
            });
        });

        // Clear URL buttons (generic)
        const clearUrlBtns = this.container.querySelectorAll('.btn-clear-url:not(.social-link-delete)');
        clearUrlBtns.forEach(btn => {
            const propName = btn.dataset.clearProperty;
            btn.addEventListener('click', () => {
                if (!propName) return;

                const input = this.container.querySelector(`[data-property="${propName}"]`);
                if (input) {
                    input.value = '';
                }

                this.updateProperty(propName, '');

                if (typeof HistoryManager !== 'undefined') {
                    HistoryManager.saveState(EditorCanvas.currentTemplate);
                }
            });
        });

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
            if (!property) return;

            // Handle the editable hex text inputs (e.g. 'backgroundColor-text')
            if (property.endsWith('-text')) {
                const targetProp = property.slice(0, -5); // remove '-text'
                input.addEventListener('input', (e) => {
                    let val = String(e.target.value || '').trim();

                    // Allow values like 'fff' or '#fff' or 'ffffff' or '#ffffff'
                    const m = val.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
                    if (m) {
                        const hex = '#' + m[1].toLowerCase();

                        // Update color input if present
                        const colorInput = this.container.querySelector(`[data-property="${targetProp}"]`);
                        if (colorInput) colorInput.value = hex;

                        // Update property
                        this.updateProperty(targetProp, hex);

                        // Save history (debounced)
                        clearTimeout(this.historyTimeout);
                        this.historyTimeout = setTimeout(() => {
                            if (typeof HistoryManager !== 'undefined') {
                                HistoryManager.saveState(EditorCanvas.currentTemplate);
                            }
                        }, 500);
                    }
                });

                return;
            }

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

    // Update component property or template property when no component selected
    updateProperty(property, value) {
        // If no component is selected and the property is the template background, update template
        if (!this.currentComponent) {
            if (property === 'backgroundColor') {
                this.updateTemplateBackground(value);
            }
            return;
        }

        // Update in canvas
        EditorCanvas.updateComponent(this.currentComponent.id, property, value);

        // Update current component reference
        this.currentComponent.properties[property] = value;
    },

    // Atualiza cor de fundo do template
    updateTemplateBackground(color) {
        if (!EditorCanvas.currentTemplate) return;
        EditorCanvas.currentTemplate.metadata = EditorCanvas.currentTemplate.metadata || {};
        EditorCanvas.currentTemplate.metadata.backgroundColor = color;

        // Aplicar imediatamente no iframe do canvas
        try {
            if (EditorCanvas.iframe && EditorCanvas.iframe.contentDocument && EditorCanvas.iframe.contentDocument.body) {
                EditorCanvas.iframe.contentDocument.body.style.background = color;
            }
        } catch (e) {
            // ignore
        }

        if (typeof HistoryManager !== 'undefined') {
            HistoryManager.saveState(EditorCanvas.currentTemplate);
        }

        console.log(`Cor de fundo do template atualizada: ${color}`);
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

    // Show empty state (or template properties when template is selected)
    showEmptyState() {
        const bgColor = (EditorCanvas.currentTemplate && EditorCanvas.currentTemplate.metadata && EditorCanvas.currentTemplate.metadata.backgroundColor) ? EditorCanvas.currentTemplate.metadata.backgroundColor : '#fafafa';
        const title = this.templateSelected ? 'Template selecionado — editar propriedades do template' : 'Selecione um elemento para editar suas propriedades';
        const icon = this.templateSelected ? '<i class="fas fa-palette" style="color: var(--editor-primary);"></i>' : '<i class="fas fa-mouse-pointer"></i>';

        this.container.innerHTML = `
            <div class="panel-empty-state">
                ${icon}
                <p>${title}</p>
            </div>

            <div style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 1rem;">
                <h3 style="margin: 0 0 0.5rem 0;">Configurações do template</h3>
                <div class="property-group">
                    <label class="property-label">Cor de fundo do email</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="color" class="property-input" data-property="backgroundColor" value="${bgColor}" style="width:60px; height:40px; padding:5px;">
                        <input type="text" class="property-input" data-property="backgroundColor-text" value="${bgColor}" style="flex:1;" placeholder="#rrggbb">
                    </div>
                </div>
            </div>
        `;

        // Attach generic listeners (handled by attachEventListeners)
        this.attachEventListeners();
    }
};