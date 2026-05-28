import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePropiedadInput } from '../dto/create-propiedad.input';
import { UpdatePropiedadInput } from '../dto/update-propiedad.input';
import { Propiedad } from '../entities/propiedad.entity';
import { PropiedadImagen } from '../entities/propiedad-imgen.entity';
import { PaginationInput } from '../../../common/dto/pagination.input';

@Injectable()
export class PropiedadService {
  constructor(
    @InjectRepository(Propiedad)
    private readonly propiedadRepository: Repository<Propiedad>,
    @InjectRepository(PropiedadImagen)
    private readonly propiedadImagenRepository: Repository<PropiedadImagen>,
  ) {}

  async create(createPropiedadInput: CreatePropiedadInput): Promise<Propiedad> {
    const { imagenesUrls, ...rest } = createPropiedadInput;
    const propiedad = this.propiedadRepository.create(rest);
    const guardada = await this.propiedadRepository.save(propiedad);

    if (imagenesUrls && imagenesUrls.length > 0) {
      const imagenes = imagenesUrls.map((url) =>
        this.propiedadImagenRepository.create({
          propiedadId: guardada.id,
          urlS3: url,
        }),
      );
      await this.propiedadImagenRepository.save(imagenes);
    }

    return this.findOne(guardada.id);
  }

  async findAll(pagination?: PaginationInput): Promise<Propiedad[]> {
    if (!pagination) {
      return this.propiedadRepository.find({ relations: ['imagenes'] });
    }

    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;
    return this.propiedadRepository.find({
      skip,
      take: limit,
      relations: ['imagenes'],
    });
  }

  async findOne(id: number): Promise<Propiedad> {
    const propiedad = await this.propiedadRepository.findOne({
      where: { id },
      relations: ['imagenes'],
    });
    if (!propiedad) {
      throw new NotFoundException('Propiedad no encontrada');
    }
    return propiedad;
  }

  async update(id: number, updatePropiedadInput: UpdatePropiedadInput): Promise<Propiedad> {
    const propiedad = await this.findOne(id);
    const { imagenesUrls, ...rest } = updatePropiedadInput;

    Object.assign(propiedad, rest);
    const guardada = await this.propiedadRepository.save(propiedad);

    if (imagenesUrls !== undefined) {
      // Eliminar imagenes anteriores
      await this.propiedadImagenRepository.delete({ propiedadId: id });

      if (imagenesUrls.length > 0) {
        const imagenes = imagenesUrls.map((url) =>
          this.propiedadImagenRepository.create({
            propiedadId: id,
            urlS3: url,
          }),
        );
        await this.propiedadImagenRepository.save(imagenes);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<Propiedad> {
    const propiedad = await this.findOne(id);
    // Eliminar imagenes asociadas primero para evitar conflictos de llave foránea
    await this.propiedadImagenRepository.delete({ propiedadId: id });
    await this.propiedadRepository.remove(propiedad);
    return propiedad;
  }
}
