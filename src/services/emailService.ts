/**
 * 📧 Email Service - Real Email Sending with Resend
 * 
 * Replaces all console.log() mocks with actual email delivery
 * Integrates with Supabase Email function (send-visitor-welcome-email)
 * which uses Resend.com API
 * 
 * Usage:
 * await EmailService.sendWelcomeEmail(user.email, user.profile.firstName, 'visitor')
 * await EmailService.sendAppointmentConfirmation(appointment)
 * await EmailService.sendAppointmentReminder(appointment)
 */

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface AppointmentEmailData {
  visitorEmail: string;
  visitorName: string;
  exhibitorName: string;
  exhibitorEmail: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'rejected' | 'cancelled';
  appointmentId: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = import.meta.env.VITE_EMAIL_FROM_ADDRESS || 'noreply@sibevent.com';
  private static readonly SUPPORT_EMAIL = 'support@sibevent.com';
  private static readonly APP_URL = import.meta.env.VITE_APP_URL || 'https://sibevent.com';
  // Use relative URL so it works in both dev (proxied) and production (same server)
  private static readonly API_BASE_URL = '';

  /**
   * Send email via Supabase Edge Function (using Resend or SendGrid)
   * Production-ready email delivery through send-template-email function
   */
  private static async sendViaSupabase(options: SendEmailOptions): Promise<boolean> {
    try {
      console.log('📧 Sending email via Supabase Edge Function...', options.to);
      
      const { data, error } = await supabase.functions.invoke('send-template-email', {
        body: {
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          from: this.FROM_EMAIL,
          replyTo: options.replyTo
        }
      });

      if (error) {
        console.error('❌ Failed to send email via Edge Function:', error);
        return false;
      }

      console.log('✅ Email sent successfully via Edge Function:', data);
      return true;

    } catch (error) {
      console.error('❌ Error sending email via Edge Function:', error);
      return false;
    }
  }


  /**
   * Send welcome email to new user
   * Uses dedicated Supabase Edge Function: send-visitor-welcome-email
   */
  static async sendWelcomeEmail(
    email: string,
    firstName: string,
    accountType: string
  ): Promise<boolean> {
    try {
      console.log('📧 Sending welcome email via send-visitor-welcome-email...');
      
      // Map accountType to visitor level
      const levelMap: Record<string, string> = {
        'visitor': 'free',
        'visiteur': 'free',
        'exhibitor': 'premium',
        'exposant': 'premium',
        'partner': 'vip',
        'partenaire': 'vip'
      };
      
      const level = levelMap[accountType.toLowerCase()] || 'free';
      
      const { data, error } = await supabase.functions.invoke('send-visitor-welcome-email', {
        body: {
          email,
          name: firstName,
          level,
          includePaymentInstructions: accountType !== 'visitor' && accountType !== 'visiteur'
        }
      });

      if (error) {
        console.error('❌ Failed to send welcome email:', error);
        return false;
      }

      console.log('✅ Welcome email sent successfully');
      return true;

    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Send appointment confirmation email
   */
  static async sendAppointmentConfirmation(data: AppointmentEmailData): Promise<boolean> {
    const statusLabels = {
      confirmed: '✓ Confirmé',
      pending: '⏳ En attente de confirmation',
      rejected: '❌ Refusé',
      cancelled: '🗑️ Annulé',
    };

    const statusColor = {
      confirmed: '#10b981',
      pending: '#f59e0b',
      rejected: '#ef4444',
      cancelled: '#6b7280',
    };

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">SIB 2026</h1>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #111827;">Rendez-vous ${statusLabels[data.status]}</h2>
          
          <p>Bonjour ${data.visitorName},</p>
          
          <p>Votre rendez-vous avec <strong>${data.exhibitorName}</strong> est maintenant <span style="color: ${statusColor[data.status]}; font-weight: bold;">${statusLabels[data.status].toLowerCase()}</span>.</p>
          
          <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>📅 Date:</strong> ${data.date}</p>
            <p style="margin: 0 0 10px 0;"><strong>🕐 Heure:</strong> ${data.time}</p>
            <p style="margin: 0;"><strong>💼 Exposant:</strong> ${data.exhibitorName}</p>
          </div>
          
          ${data.status === 'confirmed' ? `
            <p>Nous vous enverrons un rappel 24 heures avant votre rendez-vous.</p>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.APP_URL}/dashboard/appointments" style="display: inline-block; padding: 14px 28px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Voir mes rendez-vous</a>
          </div>
          
          <p style="margin-top: 30px;">À bientôt,<br><strong>L'équipe SIB 2026</strong></p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">SIB 2026 - Salon International des Ports</p>
        </div>
      </div>
    `;

    return this.sendViaSupabase({
      to: data.visitorEmail,
      subject: `Rendez-vous ${statusLabels[data.status]} avec ${data.exhibitorName}`,
      html,
      replyTo: data.exhibitorEmail,
    });
  }

  /**
   * Send appointment reminder (24h before)
   */
  static async sendAppointmentReminder(data: AppointmentEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">SIB 2026</h1>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #111827;">⏰ Rappel de rendez-vous demain !</h2>
          
          <p>Bonjour ${data.visitorName},</p>
          
          <p>Ceci est un rappel que vous avez un rendez-vous demain avec <strong>${data.exhibitorName}</strong>.</p>
          
          <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>📅 Date:</strong> ${data.date}</p>
            <p style="margin: 0 0 10px 0;"><strong>🕐 Heure:</strong> ${data.time}</p>
            <p style="margin: 0;"><strong>💼 Exposant:</strong> ${data.exhibitorName}</p>
          </div>
          
          <p>Préparez-vous pour cette rencontre importante !</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.APP_URL}/dashboard/appointments" style="display: inline-block; padding: 14px 28px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Voir mes rendez-vous</a>
          </div>
          
          <p style="margin-top: 30px;">À bientôt,<br><strong>L'équipe SIB 2026</strong></p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">SIB 2026 - Salon International des Ports</p>
        </div>
      </div>
    `;

    return this.sendViaSupabase({
      to: data.visitorEmail,
      subject: `⏰ Rappel: Rendez-vous demain à ${data.time} avec ${data.exhibitorName}`,
      html,
    });
  }

  /**
   * Send appointment rejection email
   */
  static async sendAppointmentRejection(data: AppointmentEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">SIB 2026</h1>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #ef4444;">❌ Rendez-vous refusé</h2>
          
          <p>Bonjour ${data.visitorName},</p>
          
          <p>Malheureusement, votre demande de rendez-vous avec <strong>${data.exhibitorName}</strong> a été refusée.</p>
          
          <div style="background: #FEE2E2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>📅 Date demandée:</strong> ${data.date}</p>
            <p style="margin: 0 0 10px 0;"><strong>🕐 Heure demandée:</strong> ${data.time}</p>
            <p style="margin: 0;"><strong>💼 Exposant:</strong> ${data.exhibitorName}</p>
          </div>
          
          <p>Vous pouvez proposer un autre créneau auprès de cet exposant.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.APP_URL}/exhibitors/${data.exhibitorName.replace(/\s+/g, '-')}" style="display: inline-block; padding: 14px 28px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Proposer un autre créneau</a>
          </div>
          
          <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe SIB 2026</strong></p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">SIB 2026 - Salon International des Ports</p>
        </div>
      </div>
    `;

    return this.sendViaSupabase({
      to: data.visitorEmail,
      subject: `Rendez-vous refusé - ${data.exhibitorName}`,
      html,
    });
  }

  /**
   * Send exhibitor appointment notification
   */
  static async sendExhibitorNotification(data: AppointmentEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">SIB 2026</h1>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #111827;">📅 Nouvelle demande de rendez-vous</h2>
          
          <p>Bonjour,</p>
          
          <p><strong>${data.visitorName}</strong> a demandé un rendez-vous avec vous.</p>
          
          <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>👤 Visiteur:</strong> ${data.visitorName}</p>
            <p style="margin: 0 0 10px 0;"><strong>📅 Date demandée:</strong> ${data.date}</p>
            <p style="margin: 0 0 10px 0;"><strong>🕐 Heure demandée:</strong> ${data.time}</p>
            <p style="margin: 0;"><strong>📧 Email:</strong> ${data.visitorEmail}</p>
          </div>
          
          <p>Vous pouvez confirmer ou refuser cette demande depuis votre tableau de bord.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.APP_URL}/dashboard/appointments" style="display: inline-block; padding: 14px 28px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Gérer mes demandes</a>
          </div>
          
          <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe SIB 2026</strong></p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">SIB 2026 - Salon International des Ports</p>
        </div>
      </div>
    `;

    return this.sendViaSupabase({
      to: data.exhibitorEmail,
      subject: `Nouvelle demande de rendez-vous de ${data.visitorName}`,
      html,
    });
  }

  /**
   * Send payment receipt email
   */
  static async sendPaymentReceipt(
    email: string, 
    name: string, 
    amount: number, 
    currency: string, 
    transactionId: string
  ): Promise<boolean> {
    const date = new Date().toLocaleDateString('fr-FR');
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">Paiement Reçu</h1>
          <p style="margin: 10px 0 0 0;">Commande confirmée</p>
        </div>
        
        <div style="padding: 40px; background: white;">
          <h2 style="color: #111827;">Merci ${name} !</h2>
          
          <p>Nous avons bien reçu votre paiement pour le <strong>Pass VIP Visitor</strong>.</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Numéro de transaction</td>
                <td style="padding: 8px 0; text-align: right; font-family: monospace;">${transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Date</td>
                <td style="padding: 8px 0; text-align: right;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Article</td>
                <td style="padding: 8px 0; text-align: right;">Pass Premium VIP</td>
              </tr>
              <tr style="border-top: 2px solid #E5E7EB;">
                <td style="padding: 16px 0 0 0; font-weight: bold; color: #111827;">Total payé</td>
                <td style="padding: 16px 0 0 0; text-align: right; font-weight: bold; color: #111827; font-size: 18px;">${amount} ${currency}</td>
              </tr>
            </table>
          </div>
          
          <p>Votre statut est désormais <strong>Premium VIP</strong>. Vous avez accès à toutes les fonctionnalités exclusives.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.APP_URL}/dashboard" style="display: inline-block; padding: 14px 28px; background: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Accéder au Dashboard</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #9CA3AF;">Ceci est un reçu automatique, conservez-le pour vos archives.</p>
        </div>
      </div>
    `;

    return this.sendViaSupabase({
      to: email,
      subject: `Reçu de paiement - Commande #${transactionId.substring(0, 8)}`,
      html,
    });
  }
}

export default EmailService;
