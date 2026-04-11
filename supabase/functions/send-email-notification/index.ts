import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Resend SDK
import { Resend } from 'https://cdn.jsdelivr.net/npm/resend@latest/dist/index.js';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const body: SendEmailRequest = await req.json();

    // Validate input
    if (!body.to || !body.subject || !body.html) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: to, subject, html',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send email via Resend
    const response = await resend.emails.send({
      from: 'SIPORT 2026 <noreply@siportevent.com>',
      to: body.to,
      subject: body.subject,
      html: body.html,
      text: body.text || body.html,
      replyTo: body.replyTo || 'support@siportevent.com',
    });

    if (response.error) {
      console.error('❌ Resend error:', response.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: response.error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Email sent:', {
      to: body.to,
      subject: body.subject,
      id: response.data?.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        id: response.data?.id,
        message: 'Email sent successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
