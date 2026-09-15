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
 * Creates dynamic Ethereal test account and transporter.
 */
export async function createEtherealTransporter() {
    const testAccount = await nodemailer.createTestAccount();
    console.log("--- KREDENSIAL ETHEREAL SEMENTARA ---");
    console.log(`User: ${testAccount.user}`);
    console.log(`Pass: ${testAccount.pass}`);
    console.log("------------------------------------");

    return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}

/**
 * Get or create Nodemailer transporter (singleton).
 * In development without SMTP config or if configured SMTP fails, auto-creates an Ethereal test account.
 */
export const getMailTransporter = async () => {
    if (transporter) return transporter;

    if (env.SMTP?.HOST) {
        try {
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
        } catch (err) {
            console.warn(`⚠️ Gagal inisialisasi SMTP terkonfigurasi: ${err.message}. Beralih ke Ethereal dinamis...`);
            transporter = await createEtherealTransporter();
        }
    } else {
        // Development fallback: Ethereal test account
        transporter = await createEtherealTransporter();
    }

    return transporter;
};

/**
 * Send an email using the configured transporter.
 * Returns { messageId, previewUrl } — previewUrl generated via nodemailer.getTestMessageUrl(info).
 */
export const sendMail = async ({ to, subject, html, text }) => {
    try {
        let mailer = await getMailTransporter();

        let info;
        try {
            info = await mailer.sendMail({
                from: env.SMTP?.FROM || '"Mova Support" <noreply@mova_app.com>',
                to,
                subject,
                html,
                text,
            });
        } catch (sendErr) {
            console.warn(`⚠️ Pengiriman via transporter utama gagal (${sendErr.message}), mencoba fallback Ethereal...`);
            mailer = await createEtherealTransporter();
            transporter = mailer;
            info = await mailer.sendMail({
                from: '"Mova Support" <noreply@mova_app.com>',
                to,
                subject,
                html,
                text,
            });
        }

        // KUNCI ETHEREAL: Cetak URL preview ke terminal
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log("✉️ Email berhasil ditangkap Ethereal!");
            console.log("🔗 Buka preview email di browser:", previewUrl);
        }

        return {
            messageId: info.messageId,
            previewUrl: previewUrl || null,
        };
    } catch (err) {
        console.error("❌ Gagal mengirim email:", err.message);
        throw err;
    }
};
