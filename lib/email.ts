import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailTemplate) {
  try {
    const data = await resend.emails.send({
      from: "StyleHub <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error enviando email:", error)
    return { success: false, error }
  }
}

// Template para confirmación de email
export function getEmailConfirmationTemplate(name: string, confirmationUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirma tu correo electrónico</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e9ecef; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a Tu Tienda!</h1>
        </div>
        <div class="content">
          <h2>Hola ${name},</h2>
          <p>Gracias por registrarte en nuestra tienda. Para completar tu registro, necesitamos que confirmes tu correo electrónico.</p>
          <p>Haz clic en el siguiente botón para confirmar tu cuenta:</p>
          <div style="text-align: center;">
            <a href="${confirmationUrl}" class="button">Confirmar Correo Electrónico</a>
          </div>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #007bff;">${confirmationUrl}</p>
          <p><strong>Este enlace expirará en 24 horas.</strong></p>
          <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
        </div>
        <div class="footer">
          <p>© 2024 Tu Tienda. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para bienvenida después de confirmar
export function getWelcomeEmailTemplate(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Cuenta confirmada!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e9ecef; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Cuenta Confirmada! 🎉</h1>
        </div>
        <div class="content">
          <h2>¡Hola ${name}!</h2>
          <p>Tu cuenta ha sido confirmada exitosamente. Ya puedes disfrutar de todas las funcionalidades de nuestra tienda.</p>
          <p>Ahora puedes:</p>
          <ul>
            <li>Explorar nuestros productos</li>
            <li>Realizar compras</li>
            <li>Gestionar tu perfil</li>
            <li>Ver el historial de pedidos</li>
          </ul>
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" class="button">Ir a la Tienda</a>
          </div>
          <p>¡Gracias por unirte a nosotros!</p>
        </div>
        <div class="footer">
          <p>© 2024 Tu Tienda. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
