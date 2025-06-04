import { Resend } from "resend"
import * as nodemailer from "nodemailer"

// Configuración de Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Configuración de Gmail SMTP
let gmailTransporter: nodemailer.Transporter | null = null

// Inicializar Gmail transporter solo si las credenciales están disponibles
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  try {
    gmailTransporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  } catch (error) {
    console.error("Error inicializando Gmail transporter:", error)
  }
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  console.log("Intentando enviar email a:", to)

  // Intentar primero con Gmail SMTP si está configurado
  if (gmailTransporter && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      console.log("Enviando con Gmail SMTP...")

      const info = await gmailTransporter.sendMail({
        from: from || `"StyleHub" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
      })

      console.log("Email enviado exitosamente con Gmail:", info.messageId)
      return { success: true, provider: "gmail", messageId: info.messageId }
    } catch (gmailError) {
      console.error("Error con Gmail SMTP:", gmailError)
      // Continuar con Resend como fallback
    }
  }

  // Fallback a Resend
  if (process.env.RESEND_API_KEY) {
    try {
      console.log("Enviando con Resend...")

      const fromEmail =
        process.env.RESEND_DOMAIN_VERIFIED === "true" && process.env.RESEND_DOMAIN
          ? `StyleHub <no-reply@${process.env.RESEND_DOMAIN}>`
          : "StyleHub <onboarding@resend.dev>"

      const data = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject,
        html,
      })

      console.log("Email enviado exitosamente con Resend:", data)
      return { success: true, provider: "resend", data }
    } catch (resendError) {
      console.error("Error con Resend:", resendError)
    }
  }

  // Si ambos fallan
  console.error("No se pudo enviar el email con ningún proveedor")
  return {
    success: false,
    error: "No hay proveedores de email disponibles o configurados correctamente",
  }
}

// Verificar configuración de email
export function checkEmailConfiguration() {
  const hasGmail = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  const hasResend = !!process.env.RESEND_API_KEY

  return {
    gmail: hasGmail,
    resend: hasResend,
    hasAnyProvider: hasGmail || hasResend,
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
      <title>Confirma tu correo electrónico - StyleHub</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0 0 10px 0; 
          font-size: 28px; 
          font-weight: 700; 
        }
        .header p { 
          margin: 0; 
          font-size: 16px; 
          opacity: 0.9; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .greeting { 
          font-size: 18px; 
          font-weight: 600; 
          margin-bottom: 20px; 
          color: #1f2937;
        }
        .message { 
          color: #4b5563; 
          line-height: 1.7; 
          margin-bottom: 30px; 
          font-size: 16px;
        }
        .button-container { 
          text-align: center; 
          margin: 35px 0; 
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px; 
          transition: transform 0.2s;
        }
        .button:hover { 
          transform: translateY(-1px); 
        }
        .link-fallback { 
          background-color: #f8fafc; 
          border: 1px solid #e2e8f0; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 25px 0; 
        }
        .link-fallback p { 
          margin: 0 0 10px 0; 
          font-size: 14px; 
          color: #64748b; 
        }
        .link-text { 
          color: #4F46E5; 
          font-size: 14px; 
          word-break: break-all; 
          font-family: monospace; 
          background: white; 
          padding: 10px; 
          border-radius: 4px; 
          border: 1px solid #e2e8f0;
        }
        .footer { 
          background-color: #f8fafc; 
          padding: 30px; 
          text-align: center; 
          border-top: 1px solid #e2e8f0; 
        }
        .footer p { 
          margin: 8px 0; 
          font-size: 14px; 
          color: #64748b; 
        }
        .security-note { 
          background-color: #fef3c7; 
          border-left: 4px solid #f59e0b; 
          padding: 15px; 
          margin: 25px 0; 
          border-radius: 0 8px 8px 0; 
        }
        .security-note p { 
          margin: 0; 
          font-size: 14px; 
          color: #92400e; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a StyleHub!</h1>
          <p>Confirma tu correo electrónico para completar tu registro</p>
        </div>
        
        <div class="content">
          <p class="greeting">Hola ${name},</p>
          
          <p class="message">
            Gracias por registrarte en StyleHub. Para completar tu registro y acceder a todas nuestras funciones, 
            necesitamos verificar tu correo electrónico.
          </p>
          
          <div class="button-container">
            <a href="${confirmationUrl}" class="button">
              ✉️ Confirmar mi correo electrónico
            </a>
          </div>
          
          <div class="link-fallback">
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <div class="link-text">${confirmationUrl}</div>
          </div>
          
          <div class="security-note">
            <p><strong>⏰ Este enlace expirará en 24 horas por seguridad.</strong></p>
          </div>
        </div>
        
        <div class="footer">
          <p>Si no has creado una cuenta en StyleHub, puedes ignorar este mensaje.</p>
          <p><strong>El equipo de StyleHub</strong></p>
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            © 2024 StyleHub. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para bienvenida después de confirmar
export function getWelcomeEmailTemplate(name: string) {
  const storeUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Cuenta confirmada! - StyleHub</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0 0 10px 0; 
          font-size: 28px; 
          font-weight: 700; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .greeting { 
          font-size: 18px; 
          font-weight: 600; 
          margin-bottom: 20px; 
          color: #1f2937;
        }
        .message { 
          color: #4b5563; 
          line-height: 1.7; 
          margin-bottom: 25px; 
          font-size: 16px;
        }
        .features { 
          background-color: #f8fafc; 
          border-radius: 8px; 
          padding: 25px; 
          margin: 25px 0; 
        }
        .features h3 { 
          margin: 0 0 15px 0; 
          color: #1f2937; 
          font-size: 18px;
        }
        .features ul { 
          margin: 0; 
          padding-left: 20px; 
          color: #4b5563;
        }
        .features li { 
          margin-bottom: 8px; 
        }
        .button-container { 
          text-align: center; 
          margin: 35px 0; 
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px; 
          transition: transform 0.2s;
        }
        .footer { 
          background-color: #f8fafc; 
          padding: 30px; 
          text-align: center; 
          border-top: 1px solid #e2e8f0; 
        }
        .footer p { 
          margin: 8px 0; 
          font-size: 14px; 
          color: #64748b; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Cuenta Confirmada! 🎉</h1>
        </div>
        
        <div class="content">
          <p class="greeting">¡Hola ${name}!</p>
          
          <p class="message">
            Tu cuenta ha sido confirmada exitosamente. ¡Bienvenido oficialmente a StyleHub! 
            Ya puedes disfrutar de todas nuestras funcionalidades.
          </p>
          
          <div class="features">
            <h3>🚀 Ahora puedes:</h3>
            <ul>
              <li>Explorar nuestro catálogo completo de productos</li>
              <li>Realizar compras de forma segura</li>
              <li>Gestionar tu perfil y preferencias</li>
              <li>Ver el historial de tus pedidos</li>
              <li>Recibir ofertas exclusivas</li>
            </ul>
          </div>
          
          <div class="button-container">
            <a href="${storeUrl}" class="button">
              🛍️ Ir a la Tienda
            </a>
          </div>
          
          <p class="message">
            ¡Gracias por unirte a nuestra comunidad! Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>El equipo de StyleHub</strong></p>
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            © 2024 StyleHub. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para recuperación de contraseña
export function getPasswordResetTemplate(name: string, resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restablecer contraseña - StyleHub</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0 0 10px 0; 
          font-size: 28px; 
          font-weight: 700; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .greeting { 
          font-size: 18px; 
          font-weight: 600; 
          margin-bottom: 20px; 
          color: #1f2937;
        }
        .message { 
          color: #4b5563; 
          line-height: 1.7; 
          margin-bottom: 25px; 
          font-size: 16px;
        }
        .button-container { 
          text-align: center; 
          margin: 35px 0; 
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px; 
          transition: transform 0.2s;
        }
        .security-note { 
          background-color: #fef3c7; 
          border-left: 4px solid #f59e0b; 
          padding: 15px; 
          margin: 25px 0; 
          border-radius: 0 8px 8px 0; 
        }
        .security-note p { 
          margin: 0; 
          font-size: 14px; 
          color: #92400e; 
        }
        .footer { 
          background-color: #f8fafc; 
          padding: 30px; 
          text-align: center; 
          border-top: 1px solid #e2e8f0; 
        }
        .footer p { 
          margin: 8px 0; 
          font-size: 14px; 
          color: #64748b; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Restablecer Contraseña</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hola ${name},</p>
          
          <p class="message">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en StyleHub. 
            Si fuiste tú quien hizo esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña.
          </p>
          
          <div class="button-container">
            <a href="${resetUrl}" class="button">
              🔑 Restablecer mi contraseña
            </a>
          </div>
          
          <div class="security-note">
            <p><strong>⏰ Este enlace expirará en 1 hora por seguridad.</strong></p>
          </div>
          
          <p class="message">
            Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. 
            Tu contraseña actual seguirá siendo válida.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>El equipo de StyleHub</strong></p>
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            © 2024 StyleHub. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
