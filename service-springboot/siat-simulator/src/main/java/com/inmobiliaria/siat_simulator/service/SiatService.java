package com.inmobiliaria.siat_simulator.service;

import com.inmobiliaria.siat_simulator.model.PuntoVenta;
import com.inmobiliaria.siat_simulator.model.RegistroCufd;
import com.inmobiliaria.siat_simulator.model.RegistroCuis;
import com.inmobiliaria.siat_simulator.repository.PuntoVentaRepository;
import com.inmobiliaria.siat_simulator.repository.RegistroCufdRepository;
import com.inmobiliaria.siat_simulator.repository.RegistroCuisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class SiatService {

    @Autowired
    private PuntoVentaRepository puntoVentaRepository;

    @Autowired
    private RegistroCuisRepository registroCuisRepository;

    @Autowired
    private RegistroCufdRepository registroCufdRepository;

    /**
     * FASE 1: Obtener y registrar el CUIS para un Punto de Venta
     */
    public RegistroCuis obtenerCuis(String nitEmisor, Integer codigoSucursal, Integer codigoPuntoVenta) {
        // 1. Validar que el Punto de Venta exista en nuestro simulador
        Optional<PuntoVenta> pvOpt = puntoVentaRepository
                .findByNitEmisorAndCodigoSucursalAndCodigoPuntoVenta(nitEmisor, codigoSucursal, codigoPuntoVenta);

        if (pvOpt.isEmpty()) {
            throw new RuntimeException("Error SIAT: Punto de venta o NIT emisor no registrado en el simulador.");
        }

        PuntoVenta puntoVenta = pvOpt.get();

        // 2. Generar un código CUIS alfanumérico único (Simulamos el del SIAT usando un hash corto)
        String nuevoCuis = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();

        // 3. Crear el registro con vigencia de 365 días
        RegistroCuis cuisEntity = new RegistroCuis();
        cuisEntity.setPuntoVenta(puntoVenta);
        cuisEntity.setCodigoCuis(nuevoCuis);
        cuisEntity.setFechaCreacion(LocalDateTime.now());
        cuisEntity.setFechaVigencia(LocalDateTime.now().plusYears(1)); // 1 año de vigencia
        cuisEntity.setActivo(true);

        return registroCuisRepository.save(cuisEntity);
    }

    /**
     * FASE 2: Obtener y registrar el CUFD usando un CUIS válido
     */
    public RegistroCufd obtenerCufd(String codigoCuis) {
        // 1. Validar que el CUIS exista y esté activo
        Optional<RegistroCuis> cuisOpt = registroCuisRepository.findByCodigoCuisAndActivoTrue(codigoCuis);
        
        if (cuisOpt.isEmpty()) {
            throw new RuntimeException("Error SIAT: El código CUIS proporcionado no existe o no está activo.");
        }

        RegistroCuis registroCuis = cuisOpt.get();

        // Validar si el CUIS ya expiró
        if (registroCuis.getFechaVigencia().isBefore(LocalDateTime.now())) {
            registroCuis.setActivo(false);
            registroCuisRepository.save(registroCuis);
            throw new RuntimeException("Error SIAT: El código CUIS ha expirado.");
        }

        // 2. Generar el código CUFD largo (64 caracteres hexadecimales aproximados)
        String nuevoCufd = UUID.randomUUID().toString().replace("-", "") 
                         + UUID.randomUUID().toString().replace("-", "");
        nuevoCufd = nuevoCufd.toUpperCase();

        // 3. Generar el Código de Control (Clave criptográfica para calcular el CUF - 15 caracteres)
        String codigoControl = UUID.randomUUID().toString().replace("-", "").substring(0, 15).toUpperCase();

        // 4. Crear el registro del CUFD con vigencia de 24 horas
        RegistroCufd cufdEntity = new RegistroCufd();
        cufdEntity.setRegistroCuis(registroCuis);
        cufdEntity.setCodigoCufd(nuevoCufd);
        cufdEntity.setCodigoControl(codigoControl);
        cufdEntity.setFechaCreate(LocalDateTime.now());
        cufdEntity.setFechaVigencia(LocalDateTime.now().plusDays(1)); // Válido por 24 horas

        return registroCufdRepository.save(cufdEntity);
    }
}