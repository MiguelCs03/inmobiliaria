package com.inmobiliaria.siat_simulator.controller;

import com.inmobiliaria.siat_simulator.model.FacturasRecibidas;
import com.inmobiliaria.siat_simulator.model.RegistroCufd;
import com.inmobiliaria.siat_simulator.repository.FacturasRecibidasRepository;
import com.inmobiliaria.siat_simulator.repository.RegistroCufdRepository;
import com.inmobiliaria.siat_simulator.service.CufService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v2/ServicioFacturacion")
public class SiatFacturaController {

    @Autowired
    private RegistroCufdRepository registroCufdRepository;

    @Autowired
    private FacturasRecibidasRepository facturasRecibidasRepository;

    @Autowired
    private CufService cufService;

    @PostMapping("/recepcion")
    public ResponseEntity<?> recibirFactura(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Extraer los datos enviados por el backend (Go/Nest)
            String cufdEnviado = (String) payload.get("cufd");
            String nitEmisor = (String) payload.get("nitEmisor");
            String fechaHora = (String) payload.get("fechaHora"); // YYYYMMDDHHMMSSmmm
            Integer sucursal = (Integer) payload.get("codigoSucursal");
            Integer puntoVenta = (Integer) payload.get("codigoPuntoVenta");
            Long nroFactura = Long.valueOf(payload.get("numeroFactura").toString());
            String cufEnviado = (String) payload.get("cuf");
            String nitCliente = (String) payload.get("nitCliente");
            BigDecimal montoTotal = new BigDecimal(payload.get("montoTotal").toString());
            
            // Opcionales para el algoritmo
            Integer modalidad = (Integer) payload.get("modalidad");
            Integer tipoEmision = (Integer) payload.get("tipoEmision");
            Integer tipoFactura = (Integer) payload.get("tipoFactura");
            Integer tipoDocSector = (Integer) payload.get("tipoDocumentoSector");

            // 2. Validación de Identidad (¿Existe el CUFD diario?)
            Optional<RegistroCufd> cufdOpt = registroCufdRepository.findByCodigoCufd(cufdEnviado);
            if (cufdOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "transaccion", false,
                    "mensajesList", "Error SIAT 902: El Código Único de Facturación Diaria (CUFD) es inexistente o inválido."
                ));
            }

            RegistroCufd registroCufd = cufdOpt.get();

            // Verificar si el CUFD ya expiró (más de 24 horas)
            if (registroCufd.getFechaVigencia().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "transaccion", false,
                    "mensajesList", "Error SIAT 905: El código CUFD ha expirado. Solicite uno nuevo para el día."
                ));
            }

            // 3. RECÁLCULO MATEMÁTICO DEL CUF (La validación real del SIN)
            String cufCalculado = cufService.generarCuf(
                    nitEmisor, fechaHora, sucursal, modalidad, tipoEmision, 
                    tipoFactura, tipoDocSector, nroFactura, puntoVenta, 
                    registroCufd.getCodigoControl()
            );

            // 4. Comparar el CUF que mandó tu backend con el calculado por el algoritmo
            if (!cufCalculado.equalsIgnoreCase(cufEnviado)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "transaccion", false,
                    "mensajesList", "Error SIAT 403: Rechazada. El CUF enviado no coincide con el cálculo algorítmico. Datos alterados o código de control incorrecto."
                ));
            }

            // 5. Si pasa todo, guardamos la factura como VÁLIDA en el historial
            FacturasRecibidas factura = new FacturasRecibidas();
            factura.setRegistroCufd(registroCufd);
            factura.setNroFactura(nroFactura);
            factura.setCuf(cufCalculado);
            factura.setNitCliente(nitCliente);
            factura.setMontoTotal(montoTotal);
            factura.setFechaEmision(LocalDateTime.now());
            factura.setEstado("VALIDA");
            factura.setXmlContenido(payload.toString()); // Guardamos el payload crudo como simulación del XML

            facturasRecibidasRepository.save(factura);

            return ResponseEntity.ok(Map.of(
                "transaccion", true,
                "codigoRecepcion", "REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                "mensajesList", "FACTURA PROCESADA Y VALIDADA CORRECTAMENTE EN EL PADRÓN"
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "transaccion", false,
                "mensajesList", "Error interno en el simulador: " + e.getMessage()
            ));
        }
    }
}