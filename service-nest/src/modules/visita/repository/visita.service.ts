import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVisitaInput } from '../dto/create-visita.input';
import { UpdateVisitaInput } from '../dto/update-visita.input';
import { Visita } from '../entities/visita.entity';
import { PaginationInput } from '../../../common/dto/pagination.input';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripePaymentIntentResponse } from '../dto/stripe-payment-intent.dto';

@Injectable()
export class VisitaService {
  constructor(
    @InjectRepository(Visita)
    private readonly visitaRepository: Repository<Visita>,
    private readonly configService: ConfigService,
  ) {}

  async create(createVisitaInput: CreateVisitaInput): Promise<Visita> {
    // Crear la entidad con los datos recibidos
    const visita = this.visitaRepository.create(createVisitaInput);
    return this.visitaRepository.save(visita);
  }

  async findAll(pagination?: PaginationInput): Promise<Visita[]> {
    const relations = ['propiedad', 'cliente', 'empleado'];
    if (!pagination) {
      return this.visitaRepository.find({ relations });
    }

    // Aplicar paginacion simple cuando se envia
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;
    return this.visitaRepository.find({ skip, take: limit, relations });
  }

  async findOne(id: number): Promise<Visita> {
    const relations = ['propiedad', 'cliente', 'empleado'];
    const visita = await this.visitaRepository.findOne({ where: { id }, relations });
    if (!visita) {
      throw new NotFoundException('Visita no encontrada');
    }
    return visita;
  }

  async update(id: number, updateVisitaInput: UpdateVisitaInput): Promise<Visita> {
    // Validar existencia antes de actualizar
    const visita = await this.findOne(id);
    Object.assign(visita, updateVisitaInput);
    return this.visitaRepository.save(visita);
  }

  async remove(id: number): Promise<Visita> {
    // Devolver la entidad eliminada para la respuesta
    const visita = await this.findOne(id);
    await this.visitaRepository.remove(visita);
    return visita;
  }

  async crearStripePaymentIntent(monto: number): Promise<StripePaymentIntentResponse> {
    try {
      const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
      if (!stripeSecretKey) {
        throw new Error('STRIPE_SECRET_KEY no está configurada en las variables de entorno.');
      }
      
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16' as any,
      });

      const intent = await stripe.paymentIntents.create({
        amount: Math.round(monto * 100),
        currency: 'usd',
        payment_method_types: ['card'],
      });

      return {
        success: true,
        message: 'PaymentIntent creado exitosamente.',
        clientSecret: intent.client_secret || undefined,
      };
    } catch (error: any) {
      console.error('Error al crear Stripe PaymentIntent:', error);
      return {
        success: false,
        message: error.message || 'Error interno al procesar el pago con Stripe.',
      };
    }
  }
}
