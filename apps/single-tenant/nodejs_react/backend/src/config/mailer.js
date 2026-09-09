/*
 *   Copyright (c) 2026
 *   All rights reserved.
 *   Mailer Configuration (Nodemailer Transporter)
 *
 *   Development: Uses Ethereal (auto-generated test SMTP) — no real email needed.
 *   Production:  Uses SMTP credentials from environment variables.
 */

import nodemailer from "nodemailer";
import { env } from "./env.js";

let transporter = null;

/**
 * Get or create Nodemailer transporter (singleton).
 * In development without SMTP config, auto-creates an Ethereal test account.
 */
export const getMailTransporter = async () => {
    if (transporter) return transporter;

    if (env.SMTP?.HOST) {
        // Production / configured SMTP
        transporter = nodemailer.createTransport({
            host: env.SMTP.HOST,
            port: env.SMTP.PORT,
            secure: env.SMTP.PORT === 465,
            auth: {
                user: env.SMTP.USER,
                pass: env.SMTP.PASS,
            },
        });
        console.log(`📧 Mailer: SMTP terkonfigurasi (${env.SMTP.HOST}:${env.SMTP.PORT})`);
    } else {
        // Development fallback: Ethereal test account
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log(`📧 Mailer: Ethereal test account aktif (${testAccount.user})`);
        console.log(`   Preview email di: https://ethereal.email/login`);
    }

    return transporter;
};

/**
 * Send an email using the configured transporter.
 * Returns { messageId, previewUrl } — previewUrl only available with Ethereal.
 */
export const sendMail = async ({ to, subject, html, text }) => {
    const mailer = await getMailTransporter();

    const info = await mailer.sendMail({
        from: env.SMTP?.FROM || '"MantaKopi DSS" <noreply@mantakopi.com>',
        to,
        subject,
        html,
        text,
    });

    // Generate Ethereal preview URL (only works with Ethereal accounts)
    const previewUrl = nodemailer.getTestMessageUrl(info);

    return {
        messageId: info.messageId,
        previewUrl: previewUrl || null,
    };
};
