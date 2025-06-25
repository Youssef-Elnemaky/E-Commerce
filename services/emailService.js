const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Send email
const sendEmail = async ({ to, subject, templateName, templateData }) => {
    const html = compileTemplate(templateName, templateData);

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
};

// Load and compile template
const compileTemplate = (templateName, data) => {
    const filePath = path.join(__dirname, '../templates', `${templateName}.html`);
    const source = fs.readFileSync(filePath, 'utf8');
    const template = handlebars.compile(source);
    return template(data);
};

// handle welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
    await sendEmail({
        to: userEmail,
        subject: 'Welcome To P-Vita',
        templateName: 'welcome',
        templateData: {
            name: userName,
        },
    });
};

// handle forgot password email
const sendForgotPasswordEmail = async (userEmail, userName, resetLink) => {
    await sendEmail({
        to: userEmail,
        subject: 'Password Reset Request',
        templateName: 'forgotPassword',
        templateData: {
            name: userName,
            resetLink,
        },
    });
};

module.exports = {
    sendWelcomeEmail,
    sendForgotPasswordEmail,
};
