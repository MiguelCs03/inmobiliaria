import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirmaContrato } from '../entities/firma_contraro.entity';
import { SignContractInput } from '../dto/firma_contrato.input';
import { Contrato } from '../../contrato/entities/contrato.entity';
import { StorageService } from 'src/common/storage/storage.service';
import axios from 'axios';
import Response from 'express';

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

        console.log({
            blockchainId: contrato.blockchainContractId,
            signerType: input.signerType,
            documentHash: contrato.documentHash,
            signatureUrl,
        });

        const response = await axios.post(

            `http://host.docker.internal:3030/contracts/${contrato.blockchainContractId}/sign`,

            {

                signer_type:
                    input.signerType,

                document_hash:
                    contrato.documentHash,

                signature_url:
                    signatureUrl,

            },

        );
        console.log(response.data);
        const totalFirmas =
            await this.firmaRepository.count({

                where: {

                    contratoId:
                        contrato.id,

                },

            });

        if (totalFirmas >= 2) {

            contrato.estadoContrato =
                'COMPLETED';

        } else {

            contrato.estadoContrato =
                'PARTIALLY_SIGNED';

        }

        await this.contratoRepository.save(
            contrato,
        );


        return firma;

    }
}