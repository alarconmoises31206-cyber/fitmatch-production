// infra/adapters/paymentAdapter.ts
import { 
  createPaymentIntent, 
  validatePaymentCompletion,
  calculateRefundAmount 
} from "@/domain/services/paymentService";
import { PaymentPort } from "@/domain/protocols";
import { log } from "../observability/log";
import { stripe } from "../stripe/client";

interface SupabaseClient {
  from(table: string): any;
}

export class PaymentAdapter implements PaymentPort {
  constructor(private supabase: SupabaseClient) {}

  async createCheckoutSession(data: unknown): Promise<string> {
    const payment = createPaymentIntent(data)
    
    log.info('payment.create_checkout', { 
      userId: payment.user_id, 
      amount: payment.amount_cents 
    })

    try {
      const session = await stripe.checkout.sessions.create({
        customer_email: payment.email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'FitMatch Credits',
              },
              unit_amount: payment.amount_cents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?canceled=true`,
        metadata: {
          user_id: payment.user_id,
          amount_cents: payment.amount_cents.toString(),
        },
      })

      const { data: dbData, error } = await this.supabase
        .from('payments')
        .insert({
          user_id: payment.user_id,
          amount_cents: payment.amount_cents,
          status: 'pending',
          stripe_payment_intent_id: session.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        log.error('payment.db_save_error', { 
          userId: payment.user_id, 
          error: error.message 
        })
        throw error;
      }

      return session.url || '';

    } catch (error: any) {
      log.error('payment.stripe_error', { 
        userId: payment.user_id, 
        error: error.message 
      })
      throw error;
    }
  }

  async processWebhook(event: any): Promise<any> {
    log.info('payment.webhook_received', { 
      eventType: event.type 
    })

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        const { error } = await this.supabase
          .from('payments')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', session.id)

        if (error) {
          log.error('payment.webhook_update_error', { 
            sessionId: session.id, 
            error: error.message 
          })
          throw error;
        }

        const { error: walletError } = await this.supabase
          .from('users')
          .update({
            wallet_balance: session.amount_total,
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.metadata.user_id)

        if (walletError) {
          log.error('payment.wallet_update_error', { 
            userId: session.metadata.user_id, 
            error: walletError.message 
          })
          throw walletError;
        }

        log.info('payment.completed', { 
          userId: session.metadata.user_id,
          amount: session.amount_total 
        })
        break;

      case 'checkout.session.expired':
        break;
    }

    return { received: true }
  }

  async getPaymentStatus(paymentId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (error || !data) {
      log.warn('payment.not_found', { paymentId })
      return null;
    }

    return validatePaymentCompletion(data)
  }
}
