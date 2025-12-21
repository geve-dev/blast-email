// Component Registry - Define all available component types and their properties

const ComponentRegistry = {
    // Component type definitions
    types: {
        text: {
            name: 'Texto',
            icon: 'fa-align-left',
            category: 'content',
            editableProps: ['content', 'fontSize', 'color', 'textAlign', 'lineHeight', 'padding'],
            defaultValues: {
                content: 'Digite seu texto aqui...',
                fontSize: '14px',
                color: '#333333',
                textAlign: 'left',
                lineHeight: '150%',
                padding: '10px 0'
            }
        },
        heading: {
            name: 'Título',
            icon: 'fa-heading',
            category: 'content',
            editableProps: ['content', 'fontSize', 'color', 'textAlign', 'fontWeight'],
            defaultValues: {
                content: 'Título Principal',
                fontSize: '32px',
                color: '#333333',
                textAlign: 'center',
                fontWeight: 'bold'
            }
        },
        button: {
            name: 'Botão',
            icon: 'fa-square',
            category: 'content',
            editableProps: ['text', 'url', 'backgroundColor', 'textColor', 'borderRadius', 'padding', 'fontSize', 'align'],
            defaultValues: {
                text: 'Clique Aqui',
                url: 'https://',
                backgroundColor: '#00ffd0',
                textColor: '#000',
                borderRadius: '6px',
                padding: '10px 30px',
                fontSize: '16px',
                align: 'center'
            }
        },
        image: {
            name: 'Imagem',
            icon: 'fa-image',
            category: 'media',
            editableProps: ['src', 'alt', 'width', 'link', 'align'],
            defaultValues: {
                src: 'https://via.placeholder.com/600x300',
                alt: 'Imagem',
                width: '100%',
                link: '',
                align: 'center'
            }
        },
        social: {
            name: 'Redes Sociais',
            icon: 'fa-share-alt',
            category: 'media',
            editableProps: ['facebookUrl', 'instagramUrl', 'whatsappUrl', 'twitterUrl', 'linkedinUrl', 'youtubeUrl', 'iconSize', 'align'],
            defaultValues: {
                facebookUrl: 'https://facebook.com',
                instagramUrl: 'https://instagram.com',
                whatsappUrl: 'https://whatsapp.com',
                twitterUrl: 'https://twitter.com',
                linkedinUrl: '',
                youtubeUrl: '',
                iconSize: '32px',
                align: 'center'
            }
        },
        header: {
            name: 'Header',
            icon: 'fa-heading',
            category: 'layout',
            editableProps: ['src', 'logoWidth', 'backgroundColor', 'align', 'menu1Text', 'menu1Url', 'menu2Text', 'menu2Url', 'menu3Text', 'menu3Url', 'menu4Text', 'menu4Url'],
            defaultValues: {
                src: 'https://via.placeholder.com/200x50',
                logoWidth: '200px',
                backgroundColor: '#ffffff',
                align: 'center',
                menu1Text: 'Home',
                menu1Url: '#',
                menu2Text: 'Sobre',
                menu2Url: '#',
                menu3Text: 'Contato',
                menu3Url: '#',
                menu4Text: '',
                menu4Url: ''
            }
        },
        footer: {
            name: 'Footer',
            icon: 'fa-shoe-prints',
            category: 'layout',
            editableProps: ['companyName', 'address', 'backgroundColor', 'align', 'link1Text', 'link1Url', 'link2Text', 'link2Url'],
            defaultValues: {
                companyName: 'Sua Empresa © 2025',
                address: 'Endereço da empresa',
                backgroundColor: '#f5f5f5',
                align: 'center',
                link1Text: 'Política de Privacidade',
                link1Url: '#',
                link2Text: 'Termos de Uso',
                link2Url: '#'
            }
        }
    },

    // Property metadata for rendering controls
    propertyMeta: {
        content: {
            type: 'textarea',
            label: 'Conteúdo',
            placeholder: 'Digite o texto...'
        },
        text: {
            type: 'text',
            label: 'Texto',
            placeholder: 'Digite o texto...'
        },
        fontSize: {
            type: 'range',
            label: 'Tamanho da Fonte',
            min: 10,
            max: 72,
            unit: 'px'
        },
        color: {
            type: 'color',
            label: 'Cor do Texto'
        },
        backgroundColor: {
            type: 'color',
            label: 'Cor de Fundo'
        },
        textColor: {
            type: 'color',
            label: 'Cor do Texto'
        },
        textAlign: {
            type: 'alignment',
            label: 'Alinhamento no desktop',
            options: [
                { value: 'left', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="2" height="18" rx="1"/><rect x="7" y="6" width="8" height="4" rx="2"/><rect x="7" y="14" width="14" height="4" rx="2"/></svg>' },
                { value: 'center', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="11" y="3" width="2" height="18" rx="1"/><rect x="7" y="6" width="10" height="4" rx="2"/><rect x="4" y="14" width="16" height="4" rx="2"/></svg>' },
                { value: 'right', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="19" y="3" width="2" height="18" rx="1"/><rect x="9" y="6" width="8" height="4" rx="2"/><rect x="3" y="14" width="14" height="4" rx="2"/></svg>' },
                { value: 'justify', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="4" rx="2"/><rect x="3" y="14" width="18" height="4" rx="2"/></svg>' }
            ]
        },
        lineHeight: {
            type: 'range',
            label: 'Altura da Linha',
            min: 100,
            max: 250,
            unit: '%'
        },
        padding: {
            type: 'text',
            label: 'Espaçamento',
            placeholder: '10px 20px'
        },
        borderRadius: {
            type: 'range',
            label: 'Arredondamento',
            min: 0,
            max: 50,
            unit: 'px'
        },
        url: {
            type: 'url',
            label: 'URL',
            placeholder: 'https://...'
        },
        logoSrc: {
            type: 'url',
            label: 'URL da Imagem/Logo',
            placeholder: 'https://...'
        },
        src: {
            type: 'url',
            label: 'URL da Imagem',
            placeholder: 'https://...'
        },
        alt: {
            type: 'text',
            label: 'Texto Alternativo',
            placeholder: 'Descrição da imagem'
        },
        width: {
            type: 'text',
            label: 'Largura',
            placeholder: '100% ou 600px'
        },
        link: {
            type: 'url',
            label: 'Link (opcional)',
            placeholder: 'https://...'
        },
        align: {
            type: 'alignment',
            label: 'Alinhamento no desktop',
            options: [
                { value: 'left', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="2" height="18" rx="1"/><rect x="7" y="6" width="8" height="4" rx="2"/><rect x="7" y="14" width="14" height="4" rx="2"/></svg>' },
                { value: 'center', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="11" y="3" width="2" height="18" rx="1"/><rect x="7" y="6" width="10" height="4" rx="2"/><rect x="4" y="14" width="16" height="4" rx="2"/></svg>' },
                { value: 'right', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="19" y="3" width="2" height="18" rx="1"/><rect x="9" y="6" width="8" height="4" rx="2"/><rect x="3" y="14" width="14" height="4" rx="2"/></svg>' }
            ]
        },
        fontWeight: {
            type: 'select',
            label: 'Peso da Fonte',
            options: [
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Negrito' },
                { value: '600', label: 'Semi-Negrito' }
            ]
        },
        // Header menu items
        menu1Text: { type: 'text', label: 'Menu 1 - Texto', placeholder: 'Ex: Home' },
        menu1Url: { type: 'url', label: 'Menu 1 - URL', placeholder: 'https://...' },
        menu2Text: { type: 'text', label: 'Menu 2 - Texto', placeholder: 'Ex: Sobre' },
        menu2Url: { type: 'url', label: 'Menu 2 - URL', placeholder: 'https://...' },
        menu3Text: { type: 'text', label: 'Menu 3 - Texto', placeholder: 'Ex: Contato' },
        menu3Url: { type: 'url', label: 'Menu 3 - URL', placeholder: 'https://...' },
        menu4Text: { type: 'text', label: 'Menu 4 - Texto (opcional)', placeholder: 'Ex: Blog' },
        menu4Url: { type: 'url', label: 'Menu 4 - URL (opcional)', placeholder: 'https://...' },
        // Footer links
        link1Text: { type: 'text', label: 'Link 1 - Texto', placeholder: 'Ex: Política de Privacidade' },
        link1Url: { type: 'url', label: 'Link 1 - URL', placeholder: 'https://...' },
        link2Text: { type: 'text', label: 'Link 2 - Texto', placeholder: 'Ex: Termos de Uso' },
        link2Url: { type: 'url', label: 'Link 2 - URL', placeholder: 'https://...' },
        // Footer text fields
        companyName: { type: 'text', label: 'Nome da Empresa', placeholder: 'Sua Empresa © 2025' },
        address: { type: 'text', label: 'Endereço', placeholder: 'Endereço completo' },
        logoWidth: { type: 'text', label: 'Largura do Logo', placeholder: '200px' },
        // Social media links
        facebookUrl: { type: 'url', label: 'Facebook URL', placeholder: 'https://...', icon: 'fa-facebook' },
        instagramUrl: { type: 'url', label: 'Instagram URL', placeholder: 'https://...', icon: 'fa-instagram' },
        whatsappUrl: { type: 'url', label: 'Whatsapp URL', placeholder: 'https://...', icon: 'fa-whatsapp' },
        twitterUrl: { type: 'url', label: 'Twitter URL', placeholder: 'https://...', icon: 'fa-twitter' },
        linkedinUrl: { type: 'url', label: 'LinkedIn URL', placeholder: 'https://...', icon: 'fa-linkedin' },
        youtubeUrl: { type: 'url', label: 'YouTube URL', placeholder: 'https://...', icon: 'fa-youtube' },
        iconSize: {
            type: 'range',
            label: 'Tamanho dos Ícones',
            min: 16,
            max: 64,
            unit: 'px'
        }
    },

    // Get component definition by type
    getComponent(type) {
        return this.types[type] || null;
    },

    // Get all components by category
    getByCategory(category) {
        return Object.entries(this.types)
            .filter(([_, comp]) => comp.category === category)
            .map(([type, comp]) => ({ type, ...comp }));
    },

    // Validate component properties
    validateProps(type, props) {
        const component = this.getComponent(type);
        if (!component) return false;

        // Check if all required props are present
        return component.editableProps.every(prop => props.hasOwnProperty(prop));
    },

    // Get property metadata
    getPropertyMeta(propName) {
        return this.propertyMeta[propName] || null;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentRegistry;
}
