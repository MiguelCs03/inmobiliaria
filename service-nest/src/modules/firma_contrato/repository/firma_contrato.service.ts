import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirmaContrato } from '../entities/firma_contraro.entity';
import { SignContractInput } from '../dto/firma_contrato.input';
import { Contrato } from '../../contrato/entities/contrato.entity';
import { StorageService } from 'src/common/storage/storage.service';

@Injectable()
export class FirmaService {

    constructor(

        @InjectRepository(
            FirmaContrato
        )
        private readonly firmaRepository:
            Repository<FirmaContrato>,

        @InjectRepository(
            Contrato
        )
        private readonly contratoRepository:
            Repository<Contrato>,

        private readonly storageService:
            StorageService,

    ) { }

    async signContract(
        input: SignContractInput,
    ): Promise<FirmaContrato> {

        const contrato =
            await this.contratoRepository.findOne({
                where: {
                    id: input.contractId,
                },
            });

        if (!contrato) {

            throw new NotFoundException(
                'Contrato no encontrado',
            );

        }

        const signatureUrl =
            await this.storageService
                .uploadSignature(

                    input.signatureBase64,

                    `${input.signerType.toLowerCase()}_${contrato.id}.png`,

                );

        const firma =
            this.firmaRepository.create({

                contratoId:
                    contrato.id,

                tipoFirmante:
                    input.signerType,

                signatureUrl,

                fechaFirma:
                    new Date(),

            });

        await this.firmaRepository.save(
            firma,
        );

        return firma;

    }
}