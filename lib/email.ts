import { Resend } from 'resend';

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing');
    return { error: 'Email service not configured' };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: 'Tutlayt Admin <onboarding@resend.dev>', 
      reply_to: 'klilakarim35@gmail.com',
      to: [to],
      subject: subject,
      text: text,
      html: html || text,
    });

    return { data };
  } catch (error) {
    console.error('Email Error:', error);
    return { error };
  }
}
