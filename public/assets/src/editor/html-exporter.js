// HTML Exporter - Convert JSON structure back to email-compatible HTML

const HTMLExporter = {
    // Export template to HTML
    export(templateData) {
        const { components, globalStyles, metadata } = templateData;

        // Build HTML structure
        let html = this.buildEmailShell(metadata);

        // Add components
        const componentsHTML = components.map(comp => {
            if (Array.isArray(comp)) {
                // Content section with multiple components
                return this.buildContentSection(comp);
            } else {
                // Single component (header, footer)
                return this.buildComponent(comp);
            }
        }).join('\n');

        // Insert components into shell
        html = html.replace('{{CONTENT}}', componentsHTML);

        return html;
    },

    // Build email shell with necessary compatibility code
    buildEmailShell(metadata) {
        return `<!DOCTYPE html>
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title>Email</title>
    <!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]-->
    <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]-->
    <style type="text/css">
        ${this.getEmailCSS()}
    </style>
</head>
<body class="body">
    <div dir="ltr" class="es-wrapper-color">
        <table width="100%" cellspacing="0" cellpadding="0" class="es-wrapper">
            <tbody>
                <tr>
                    <td valign="top" class="esd-email-paddings">
                        {{CONTENT}}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>`;
    },

    // Build individual component HTML
    buildComponent(component) {
        switch (component.type) {
            case 'header':
                return this.buildHeader(component);
            case 'footer':
                return this.buildFooter(component);
            case 'text':
                return this.buildText(component);
            case 'heading':
                return this.buildHeading(component);
            case 'button':
                return this.buildButton(component);
            case 'image':
                return this.buildImage(component);
            case 'social':
                return this.buildSocial(component);
            default:
                return '';
        }
    },

    // Build header component
    buildHeader(component) {
        const { src, logoWidth, backgroundColor, align, menu1Text, menu1Url, menu2Text, menu2Url, menu3Text, menu3Url, menu4Text, menu4Url } = component.properties;
        
        // Use logoSrc if available, otherwise use src (for backwards compatibility)
        const logoSrc = component.properties.logoSrc || src;

        // Build menu items from individual properties (same logic as editor-canvas.js)
        const menuItems = [];
        if (menu1Text) menuItems.push({ text: menu1Text, url: menu1Url || '#' });
        if (menu2Text) menuItems.push({ text: menu2Text, url: menu2Url || '#' });
        if (menu3Text) menuItems.push({ text: menu3Text, url: menu3Url || '#' });
        if (menu4Text) menuItems.push({ text: menu4Text, url: menu4Url || '#' });

        // If menuItems exists directly in properties (from template parser), use it
        const directMenuItems = component.properties.menuItems;
        const finalMenuItems = Array.isArray(directMenuItems) && directMenuItems.length > 0 
            ? directMenuItems 
            : menuItems;

        // Build menu HTML
        const menuHTML = finalMenuItems.length > 0 
            ? finalMenuItems.map(item => `
                <td align="center" valign="top" width="${100 / finalMenuItems.length}%" class="es-p10t es-p10b es-p5r es-p5l" style="padding-top: 15px; padding-bottom: 15px">
                    <a target="_blank" href="${item.url || '#'}">${item.text || ''}</a>
                </td>
            `).join('')
            : '';

        return `
<table cellpadding="0" cellspacing="0" align="center" class="es-header">
    <tbody>
        <tr>
            <td align="center" class="esd-stripe">
                <table bgcolor="${backgroundColor}" align="center" cellpadding="0" cellspacing="0" width="600" class="es-header-body">
                    <tbody>
                        <tr>
                            <td align="left" class="esd-structure es-p10t es-p10b es-p20r es-p20l">
                                <table cellpadding="0" cellspacing="0" width="100%">
                                    <tbody>
                                        <tr>
                                            <td width="560" valign="top" align="center" class="esd-container-frame">
                                                <table cellpadding="0" cellspacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td align="center" class="esd-block-image es-p20b" style="font-size: 0px">
                                                                <a target="_blank">
                                                                    <img src="${logoSrc}" alt="Logo" width="${parseInt(logoWidth)}" title="Logo" style="display: block">
                                                                </a>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="esd-block-menu">
                                                                <table cellpadding="0" cellspacing="0" width="100%" class="es-menu">
                                                                    <tbody>
                                                                        <tr>
                                                                            ${menuHTML}
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`;
    },

    // Build text component
    buildText(component) {
        const { content, fontSize, color, textAlign, lineHeight } = component.properties;
        const style = `font-size: ${fontSize}; color: ${color}; text-align: ${textAlign}; line-height: ${lineHeight};`;

        return `
<table cellpadding="0" cellspacing="0" align="center" class="es-content">
    <tbody>
        <tr>
            <td align="center" class="esd-stripe">
                <table bgcolor="#ffffff" align="center" cellpadding="0" cellspacing="0" width="600" class="es-content-body">
                    <tbody>
                        <tr>
                            <td align="left" class="esd-structure es-p20t es-p20b es-p20r es-p20l">
                                <table cellpadding="0" cellspacing="0" width="100%">
                                    <tbody>
                                        <tr>
                                            <td width="560" align="center" valign="top" class="esd-container-frame">
                                                <table cellpadding="0" cellspacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td align="${textAlign}" class="esd-block-text">
                                                                <p style="${style}">${content}</p>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`;
    },

    // Build heading component
    buildHeading(component) {
        const { content, fontSize, color, textAlign, fontWeight } = component.properties;
        const style = `font-size: ${fontSize}; color: ${color}; text-align: ${textAlign}; font-weight: ${fontWeight}; line-height: 120%;`;

        return `
<table cellpadding="0" cellspacing="0" align="center" class="es-content">
    <tbody>
        <tr>
            <td align="center" class="esd-stripe">
                <table bgcolor="#ffffff" align="center" cellpadding="0" cellspacing="0" width="600" class="es-content-body">
                    <tbody>
                        <tr>
                            <td align="left" class="esd-structure es-p20t es-p20b es-p20r es-p20l">
                                <table cellpadding="0" cellspacing="0" width="100%">
                                    <tbody>
                                        <tr>
                                            <td width="560" align="center" valign="top" class="esd-container-frame">
                                                <table cellpadding="0" cellspacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td align="${textAlign}" class="esd-block-text">
                                                                <h1 style="${style}">${content}</h1>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`;
    },

    // Build button component
    buildButton(component) {
        const { text, url, backgroundColor, textColor, borderRadius, padding, fontSize } = component.properties;
        const buttonStyle = `background: ${backgroundColor}; color: ${textColor}; border-radius: ${borderRadius}; padding: ${padding}; font-size: ${fontSize}; text-decoration: none; display: inline-block;`;

        return `
<table cellpadding="0" cellspacing="0" align="center" class="es-content">
    <tbody>
        <tr>
            <td align="center" class="esd-stripe">
                <table bgcolor="#ffffff" align="center" cellpadding="0" cellspacing="0" width="600" class="es-content-body">
                    <tbody>
                        <tr>
                            <td align="left" class="esd-structure es-p20t es-p30b es-p20r es-p20l">
                                <table cellpadding="0" cellspacing="0" width="100%">
                                    <tbody>
                                        <tr>
                                            <td width="560" align="center" valign="top" class="esd-container-frame">
                                                <table cellpadding="0" cellspacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td align="center" class="esd-block-button es-p10t es-p10b">
                                                                <span class="es-button-border" style="border-radius: ${borderRadius}">
                                                                    <a href="${url}" class="es-button" target="_blank" style="${buttonStyle}">${text}</a>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`;
    },

    // Build image component
    buildImage(component) {
        const { src, alt, width, link, align } = component.properties;
        const imgTag = `<img src="${src}" alt="${alt}" width="${parseInt(width)}" style="display: block;">`;
        const content = link ? `<a href="${link}" target="_blank">${imgTag}</a>` : imgTag;

        return `
<table cellpadding="0" cellspacing="0" align="center" class="es-content">
    <tbody>
        <tr>
            <td align="center" class="esd-stripe">
                <table bgcolor="#ffffff" align="center" cellpadding="0" cellspacing="0" width="600" class="es-content-body">
                    <tbody>
                        <tr>
                            <td align="left" class="esd-structure es-p20">
                                <table cellpadding="0" cellspacing="0" width="100%">
                                    <tbody>
                                        <tr>
                                            <td width="560" align="center" valign="top" class="esd-container-frame">
                                                <table cellpadding="0" cellspacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td align="${align}" class="esd-block-image" style="font-size: 0px">
                                                                ${content}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`;
    },

    // Build content section (wrapper for multiple components)
    buildContentSection(components) {
        return components.map(comp => this.buildComponent(comp)).join('\n');
    },

    // Build footer component
    buildFooter(component) {
        const { companyName, address, align, link1Text, link1Url, link2Text, link2Url, backgroundColor } = component.properties;

        // Build links from individual properties
        const links = [];
        if (link1Text) links.push({ text: link1Text, url: link1Url || '#' });
        if (link2Text) links.push({ text: link2Text, url: link2Url || '#' });

        const linksHTML = links.map(link => `<a href="${link.url}" style="color: #666; text-decoration: none; margin: 0 10px;">${link.text}</a>`).join(' | ');

        return `
<table cellpadding="0" cellspacing="0" align="center" class="es-footer">
    <tbody>
        <tr>
            <td align="center" class="esd-stripe">
                <table bgcolor="${backgroundColor || '#f5f5f5'}" align="center" cellpadding="0" cellspacing="0" width="600" class="es-footer-body">
                    <tbody>
                        <tr>
                            <td align="left" class="esd-structure es-p30t es-p30b es-p20r es-p20l">
                                <table cellpadding="0" cellspacing="0" width="100%">
                                    <tbody>
                                        <tr>
                                            <td width="560" valign="top" align="${align || 'center'}" class="esd-container-frame">
                                                <table cellpadding="0" cellspacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td align="${align || 'center'}" class="esd-block-text">
                                                                ${companyName ? `<p style="margin: 5px 0; font-size: 12px; color: #666;">${companyName}</p>` : ''}
                                                                ${address ? `<p style="margin: 5px 0; font-size: 12px; color: #666;">${address}</p>` : ''}
                                                                ${linksHTML ? `<p style="margin: 10px 0; font-size: 11px; color: #666;">${linksHTML}</p>` : ''}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`;
    },

    // Build social icons
    buildSocial(component) {
        const p = component.properties || {};
        const iconSize = p.iconSize || '32px';
        const align = p.align || 'center';

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

        const getPublicOrigin = () => {
            try {
                if (typeof window !== 'undefined' && window.location && window.location.origin) {
                    return window.location.origin;
                }
            } catch (e) {
                // ignore
            }
            return '';
        };

        const getLocalIconUrl = (type) => {
            const file = localIconFileMap[type];
            if (!file) return '';
            const origin = getPublicOrigin();
            // For email sending, use absolute URLs when available.
            return origin ? `${origin}${localBasePath}/${file}` : `${localBasePath}/${file}`;
        };

        const stripoSocialIconBaseUrl = 'https://eycatrv.stripocdn.email/content/assets/img/social-icons/logo-black';
        const stripoOtherIconBaseUrl = 'https://eycatrv.stripocdn.email/content/assets/img/other-icons/logo-black';

        const stripoIconMap = {
            facebook: { base: 'social', file: 'facebook-logo-black.png' },
            instagram: { base: 'social', file: 'instagram-logo-black.png' },
            whatsapp: { base: 'social', file: 'whatsapp-logo-black.png' },
            twitter: { base: 'social', file: 'twitter-logo-black.png' },
            linkedin: { base: 'social', file: 'linkedin-logo-black.png' },
            youtube: { base: 'social', file: 'youtube-logo-black.png' },
            reddit: { base: 'social', file: 'reddit-logo-black.png' },
            pinterest: { base: 'social', file: 'pinterest-logo-black.png' },
            tiktok: { base: 'social', file: 'tiktok-logo-black.png' },
            telegram: { base: 'social', file: 'telegram-logo-black.png' },
            github: { base: 'other', file: 'github-logo-black.png' },
            discord: { base: 'other', file: 'discord-logo-black.png' },
            snapchat: { base: 'other', file: 'snapchat-logo-black.png' }
        };

        const iconDomainMap = {
            facebook: 'facebook.com',
            instagram: 'instagram.com',
            whatsapp: 'whatsapp.com',
            twitter: 'x.com',
            linkedin: 'linkedin.com',
            youtube: 'youtube.com',
            reddit: 'reddit.com',
            pinterest: 'pinterest.com',
            tiktok: 'tiktok.com',
            telegram: 'telegram.org',
            discord: 'discord.com',
            github: 'github.com',
            snapchat: 'snapchat.com'
        };

        const getStripoPngUrl = (type) => {
            const entry = stripoIconMap[type];
            if (!entry || !entry.file) return '';

            const baseUrl = entry.base === 'other' ? stripoOtherIconBaseUrl : stripoSocialIconBaseUrl;
            return `${baseUrl}/${entry.file}`;
        };

        const getIcons8PngUrl = (type) => {
            const size = parseInt(iconSize, 10) || 32;
            // Icons8 provides PNGs.
            // Format: https://img.icons8.com/ios-filled/<size>/000000/<type>
            // We keep this as a generic fallback in case Stripo is missing a logo.
            const icons8NameMap = {
                facebook: 'facebook-new',
                instagram: 'instagram',
                whatsapp: 'whatsapp',
                twitter: 'twitterx',
                linkedin: 'linkedin',
                youtube: 'youtube-play',
                reddit: 'reddit',
                pinterest: 'pinterest',
                tiktok: 'tiktok',
                telegram: 'telegram-app',
                discord: 'discord-logo',
                github: 'github',
                snapchat: 'snapchat'
            };
            const name = icons8NameMap[type];
            if (!name) return '';
            return `https://img.icons8.com/ios-filled/${size}/000000/${name}.png`;
        };

        const getPngIconUrl = (type) => {
            // Prefer local icons shipped with the app.
            const local = getLocalIconUrl(type);
            if (local) return local;

            // Fallbacks for any missing local icons.
            const stripo = getStripoPngUrl(type);
            if (stripo) return stripo;

            const icons8 = getIcons8PngUrl(type);
            if (icons8) return icons8;

            const domain = iconDomainMap[type];
            if (!domain) return '';
            const size = parseInt(iconSize, 10) || 32;
            return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
        };

        let links = Array.isArray(p.socialLinks) ? p.socialLinks : null;

        if (!links) {
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

        const filtered = (links || []).filter(l => l && l.url && String(l.url).trim() !== '');
        if (filtered.length === 0) return '';

        const cells = filtered.map(link => {
            const isCustom = link.type === 'custom';
            const src = isCustom
                ? (link.iconSrc ? String(link.iconSrc) : '')
                : getPngIconUrl(link.type);

            const imgTag = src
                ? `<img src="${src}" width="${parseInt(iconSize, 10) || 32}" height="${parseInt(iconSize, 10) || 32}" style="display:block; width:${iconSize}; height:${iconSize}; object-fit:contain;" alt="${link.type}" border="0">`
                : `<span style="display:inline-block; width:${iconSize}; height:${iconSize}; line-height:${iconSize}; text-align:center; font-size:12px; color:#999;">?</span>`;

            return `
                <td align="center" valign="middle" style="padding:0 10px;">
                    <a href="${link.url}" target="_blank" style="text-decoration:none; display:inline-block;">
                        ${imgTag}
                    </a>
                </td>
            `;
        }).join('');

        return `
<table cellpadding="0" cellspacing="0" align="center" class="es-content">
    <tbody>
        <tr>
            <td align="center" class="esd-stripe">
                <table bgcolor="#ffffff" align="center" cellpadding="0" cellspacing="0" width="600" class="es-content-body">
                    <tbody>
                        <tr>
                            <td align="left" class="esd-structure es-p30t es-p30b es-p20r es-p20l">
                                <table cellpadding="0" cellspacing="0" width="100%">
                                    <tbody>
                                        <tr>
                                            <td width="560" align="center" valign="top" class="esd-container-frame">
                                                <table cellpadding="0" cellspacing="0" align="center" style="text-align:${align};">
                                                    <tbody>
                                                        <tr>
                                                            ${cells}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>`;
    },

    // Get email-compatible CSS
    getEmailCSS() {
        return `
            body { margin: 0; padding: 0; }
            table { border-collapse: collapse; }
            img { border: 0; display: block; }
            .es-wrapper { width: 100%; background-color: #fafafa; }
            .es-content-body { background-color: #ffffff; }
            /* Padding classes for spacing */
            .es-p5r { padding-right: 5px !important; }
            .es-p5l { padding-left: 5px !important; }
            .es-p10t { padding-top: 10px !important; }
            .es-p10b { padding-bottom: 10px !important; }
            .es-p20 { padding: 20px !important; }
            .es-p20t { padding-top: 20px !important; }
            .es-p20b { padding-bottom: 20px !important; }
            .es-p20r { padding-right: 20px !important; }
            .es-p20l { padding-left: 20px !important; }
            .es-p30t { padding-top: 30px !important; }
            .es-p30b { padding-bottom: 30px !important; }
        `;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTMLExporter;
}