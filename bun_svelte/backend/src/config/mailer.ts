import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "./env.js";

let transporter: Transporter | null = null;

export const getMailTransporter = async (): Promise<Transporter> => {
  if (transporter) return transporter;

  if (env.SMTP?.HOST) {
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

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendMail = async ({ to, subject, html, text }: SendMailOptions) => {
  const mailer = await getMailTransporter();

  const info = await mailer.sendMail({
    from: env.SMTP?.FROM || '"MantaKopi DSS" <noreply@mantakopi.com>',
    to,
    subject,
    html,
    text,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  return {
    messageId: info.messageId,
    previewUrl: previewUrl || null,
  };
};
