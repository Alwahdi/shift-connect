import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';

interface SendEmailJob {
  to: string;
  subject: string;
  templateId: string;
  templateData: Record<string, unknown>;
}

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly config: ConfigService) {
    super();
  }

  async process(job: Job<SendEmailJob>): Promise<void> {
    const { to, subject, templateId, templateData } = job.data;

    if (job.name === 'user-registered-event') {
      // Kafka emission would go here - for now log the event
      this.logger.log(`Kafka event queued: ${JSON.stringify(job.data)}`);
      return;
    }

    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured — skipping email send');
      return;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SyndeoCare <noreply@syndeocare.ai>',
          to,
          subject,
          html: this.renderTemplate(templateId, templateData),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend API error ${response.status}: ${body}`);
      }

      this.logger.log(`Email sent to ${to} (template: ${templateId})`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${(err as Error).message}`);
      throw err; // BullMQ will retry based on job options
    }
  }

  private renderTemplate(
    templateId: string,
    data: Record<string, unknown>,
  ): string {
    if (templateId === 'otp') {
      return `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2>Your verification code</h2>
          <p>Hello ${data['fullName'] ?? 'there'},</p>
          <p>Your SyndeoCare OTP is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;background:#f5f5f5;border-radius:8px">
            ${data['otp']}
          </div>
          <p>This code expires in ${data['expiryMinutes']} minutes.</p>
        </div>
      `;
    }
    return `<p>${JSON.stringify(data)}</p>`;
  }
}
