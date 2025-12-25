const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Configuração do Express para aceitar dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta 'public'
// Seus arquivos HTML, CSS e JS devem estar dentro de uma pasta chamada 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Permite que seu frontend se conecte (CORS) - **IMPORTANTE PARA TESTE**
app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Only set CORS headers if there's an origin
    if (origin) {
        const allowedOrigins = [
            'https://mass-email.vercel.app',
            process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`
        ].filter(Boolean);

        if (allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
    }

    res.header('Access-Control-Allow-Methods', 'POST, GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Configuração do Transportador SMTP (Mantenha suas credenciais aqui)
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Variável de ambiente para o email
        pass: process.env.EMAIL_PASS  // Variável de ambiente para a senha
    }
});

// Rota GET para a página inicial, servindo o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Rota POST para receber os dados do formulário
// Rota POST para receber os dados do formulário
app.post('/send-email', async (req, res) => {
    // Os dados do formulário estão em req.body
    const { recipients, senderName, senderEmail, showSenderEmail, subject, message } = req.body;

    // 1. Validar e-mails (Obrigatório)
    if (!recipients || !message) {
        return res.status(400).send('Destinatários e Mensagem são obrigatórios.');
    }

    // Processar lista de destinatários
    const recipientList = recipients.split(',').map(email => email.trim()).filter(email => email);

    if (recipientList.length === 0) {
        return res.status(400).send('Nenhum destinatário válido encontrado.');
    }

    let successCount = 0;
    let failCount = 0;

    // 2. Iterar e enviar para cada um
    for (const recipient of recipientList) {
        // Check if message contains HTML tags
        const isHTML = /<[a-z][\s\S]*>/i.test(message);
        
        // Montar as opções do e-mail
        let mailOptions = {
            from: `"${senderName || 'Remetente'}" <${process.env.EMAIL_USER}>`,
            to: recipient,
            replyTo: showSenderEmail ? senderEmail : undefined,
            subject: subject || `Nova mensagem de: ${senderName || 'Desconhecido'}`
        };

        // Set text or HTML content based on message content
        if (isHTML) {
            // If message contains HTML, use it as HTML and create a text version
            mailOptions.html = message;
            // Create a simple text version by stripping HTML tags
            mailOptions.text = message.replace(/<[^>]*>?/gm, '');

            // === Detect data:image (base64) images in HTML and convert them to inline attachments (CID)
            // Gmail and many clients may block Data-URLs in received messages, so attach them properly.
            const dataUriRegex = /src=["'](data:image\/(png|jpeg|jpg|gif|webp);base64,([^"']+))["']/gi;
            let attachments = [];
            let cidIndex = 0;

            mailOptions.html = mailOptions.html.replace(dataUriRegex, (match, fullDataUri, mimeType, b64) => {
                try {
                    const extension = (mimeType === 'jpeg' || mimeType === 'jpg') ? 'jpg' : mimeType;
                    const buffer = Buffer.from(b64, 'base64');
                    const cid = `inline-image-${Date.now()}-${cidIndex}@cid`;

                    attachments.push({
                        filename: `image-${cidIndex}.${extension}`,
                        content: buffer,
                        cid: cid,
                        contentType: `image/${mimeType}`
                    });

                    cidIndex++;
                    return `src="cid:${cid}"`;
                } catch (err) {
                    console.error('Erro convertendo data URI para anexo:', err.message);
                    return match; // fallback: keep original src
                }
            });

            if (attachments.length) {
                mailOptions.attachments = attachments;
            }
        } else {
            // Plain text message
            mailOptions.text = message;
        }

        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Email enviado para: ${recipient}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Erro ao enviar para ${recipient}:`, error.message);
            failCount++;
        }
    }

    res.status(200).json({
        message: `Envio finalizado. Sucessos: ${successCount}, Falhas: ${failCount}`,
        stats: { success: successCount, fail: failCount }
    });
});

// Inicia o servidor localmente (não é usado pela Vercel, mas bom para testes)
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Exporta o app para a Vercel
module.exports = app;