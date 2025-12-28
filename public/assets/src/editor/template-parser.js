// Template Parser - Convert HTML/CSS to editable JSON structure

const TemplateParser = {
    // Parse HTML string into component tree
    parse(htmlString, cssString = '') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        // Extract email body content
        const emailBody = doc.querySelector('.es-wrapper') || doc.body;

        // Parse components
        const components = [];
        let componentId = 1;

        // Find all major sections
        const sections = emailBody.querySelectorAll('.es-header, .es-content, .es-footer');

        sections.forEach(section => {
            const component = this.parseSection(section, componentId++);
            if (component) {
                components.push(component);
            }
        });

        return {
            components,
            globalStyles: this.extractGlobalStyles(cssString),
            metadata: {
                width: '600px',
                backgroundColor: '#fafafa'
            }
        };
    },

    // Parse individual section
    parseSection(element, id) {
        const classList = Array.from(element.classList);

        // Determine component type
        let type = 'text';
        if (classList.includes('es-header')) {
            type = this.parseHeader(element, id);
        } else if (classList.includes('es-footer')) {
            type = this.parseFooter(element, id);
        } else if (classList.includes('es-content')) {
            type = this.parseContent(element, id);
        }

        return type;
    },

    // Parse header section
    parseHeader(element, id) {
        const logo = element.querySelector('img');
        const menuItems = element.querySelectorAll('.es-menu a');

        const properties = {
            logoSrc: logo ? logo.src : '',
            logoWidth: logo ? logo.width + 'px' : '200px',
            menuItems: Array.from(menuItems).map(item => ({
                text: item.textContent.trim(),
                url: item.href
            })),
            backgroundColor: this.getBackgroundColor(element)
        };

        return {
            id: `component-${id}`,
            type: 'header',
            properties,
            styles: this.extractStyles(element),
            html: element.outerHTML
        };
    },

    // Parse footer section
    parseFooter(element, id) {
        const socialIcons = element.querySelectorAll('.es-social a');
        const textContent = element.querySelector('.esd-block-text');
        const menuLinks = element.querySelectorAll('.esd-block-menu a');

        const properties = {
            companyName: textContent ? textContent.textContent.split('\n')[0].trim() : '',
            address: textContent ? textContent.textContent.split('\n')[1]?.trim() || '' : '',
            socialIcons: Array.from(socialIcons).map(icon => {
                const img = icon.querySelector('img');
                return {
                    type: this.detectSocialType(img?.src || ''),
                    url: icon.href
                };
            }),
            links: Array.from(menuLinks).map(link => ({
                text: link.textContent.trim(),
                url: link.href
            })),
            backgroundColor: this.getBackgroundColor(element)
        };

        return {
            id: `component-${id}`,
            type: 'footer',
            properties,
            styles: this.extractStyles(element),
            html: element.outerHTML
        };
    },

    // Parse content section (text, buttons, images)
    parseContent(element, id) {
        const components = [];
        let subId = 0;

        // Find text blocks
        const textBlocks = element.querySelectorAll('.esd-block-text');
        textBlocks.forEach(block => {
            // Skip if it's a heading
            const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading) {
                components.push({
                    id: `component-${id}-${subId++}`,
                    type: 'heading',
                    properties: {
                        content: heading.textContent.trim(),
                        fontSize: this.getFontSize(heading),
                        color: this.getColor(heading),
                        textAlign: this.getTextAlign(heading),
                        fontWeight: window.getComputedStyle(heading).fontWeight
                    },
                    styles: this.extractStyles(heading),
                    html: heading.outerHTML
                });
            } else {
                const paragraphs = block.querySelectorAll('p');
                paragraphs.forEach(p => {
                    components.push({
                        id: `component-${id}-${subId++}`,
                        type: 'text',
                        properties: {
                            content: p.textContent.trim(),
                            fontSize: this.getFontSize(p),
                            color: this.getColor(p),
                            textAlign: this.getTextAlign(p),
                            lineHeight: window.getComputedStyle(p).lineHeight
                        },
                        styles: this.extractStyles(p),
                        html: p.outerHTML
                    });
                });
            }
        });

        // Find buttons
        const buttons = element.querySelectorAll('.es-button');
        buttons.forEach(btn => {
            components.push({
                id: `component-${id}-${subId++}`,
                type: 'button',
                properties: {
                    text: btn.textContent.trim(),
                    url: btn.href || '#',
                    backgroundColor: this.getBackgroundColor(btn),
                    textColor: this.getColor(btn),
                    borderRadius: window.getComputedStyle(btn).borderRadius,
                    padding: window.getComputedStyle(btn).padding,
                    fontSize: this.getFontSize(btn)
                },
                styles: this.extractStyles(btn),
                html: btn.outerHTML
            });
        });

        // Find images
        const images = element.querySelectorAll('.esd-block-image img');
        images.forEach(img => {
            const link = img.closest('a');
            components.push({
                id: `component-${id}-${subId++}`,
                type: 'image',
                properties: {
                    src: img.src,
                    alt: img.alt || '',
                    width: img.width ? img.width + 'px' : '100%',
                    link: link ? link.href : '',
                    align: this.getTextAlign(img.parentElement)
                },
                styles: this.extractStyles(img),
                html: img.outerHTML
            });
        });

        // Find social icons
        const socialBlock = element.querySelector('.esd-block-social');
        if (socialBlock) {
            const icons = socialBlock.querySelectorAll('a');
            components.push({
                id: `component-${id}-${subId++}`,
                type: 'social',
                properties: {
                    icons: Array.from(icons).map(icon => {
                        const img = icon.querySelector('img');
                        return {
                            type: this.detectSocialType(img?.src || ''),
                            url: icon.href
                        };
                    }),
                    iconSize: '32px',
                    spacing: '40px'
                },
                styles: this.extractStyles(socialBlock),
                html: socialBlock.outerHTML
            });
        }

        return components.length > 0 ? components : null;
    },

    // Helper: Extract inline styles
    extractStyles(element) {
        const styles = {};
        const inlineStyle = element.getAttribute('style');

        if (inlineStyle) {
            inlineStyle.split(';').forEach(rule => {
                const [property, value] = rule.split(':').map(s => s.trim());
                if (property && value) {
                    styles[property] = value;
                }
            });
        }

        return styles;
    },

    // Helper: Get background color
    getBackgroundColor(element) {
        return element.style.backgroundColor ||
            element.getAttribute('bgcolor') ||
            window.getComputedStyle(element).backgroundColor ||
            'transparent';
    },

    // Helper: Get text color
    getColor(element) {
        return element.style.color ||
            window.getComputedStyle(element).color ||
            '#333333';
    },

    // Helper: Get font size
    getFontSize(element) {
        return element.style.fontSize ||
            window.getComputedStyle(element).fontSize ||
            '14px';
    },

    // Helper: Get text alignment
    getTextAlign(element) {
        return element.style.textAlign ||
            element.getAttribute('align') ||
            window.getComputedStyle(element).textAlign ||
            'left';
    },

    // Helper: Detect social media type from URL
    detectSocialType(url) {
        url = url.toLowerCase();
        if (url.includes('facebook')) return 'facebook';
        if (url.includes('twitter') || url.includes('x.com')) return 'twitter';
        if (url.includes('instagram')) return 'instagram';
        if (url.includes('youtube')) return 'youtube';
        if (url.includes('linkedin')) return 'linkedin';
        if (url.includes('whatsapp')) return 'whatsapp';
        return 'other';
    },

    // Extract global CSS styles
    extractGlobalStyles(cssString) {
        // This would parse the CSS and extract relevant global styles
        // For now, return empty object
        return {};
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateParser;
}