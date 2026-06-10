import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class PagarCuotaInput {
  // ID de la cuota en plan_pagos
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  planPagoId!: number;

  // NIT o CI del cliente para la factura SIAT
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  nitCliente!: string;

  // Razón Social del cliente para la factura SIAT
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  razonSocial!: string;

  // Método de pago: e.g. QR, Banco, Stripe
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  metodoPago!: string;
}
