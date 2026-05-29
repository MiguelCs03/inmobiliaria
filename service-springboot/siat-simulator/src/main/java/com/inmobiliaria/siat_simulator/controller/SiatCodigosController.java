package com.inmobiliaria.siat_simulator.controller;

import com.inmobiliaria.siat_simulator.model.RegistroCufd;
import com.inmobiliaria.siat_simulator.model.RegistroCuis;
import com.inmobiliaria.siat_simulator.service.SiatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v2/FacturacionCodigos")
public class SiatCodigosController {

    @Autowired
    private SiatService siatService;

    /**
     * Endpoint para solicitar el CUIS (Fase 1)
     */
    @PostMapping("/cuis")
    public ResponseEntity<?> solicitarCuis(@RequestBody Map<String, Object> payload) {
        try {
            String nit = (String) payload.get("nit");
            Integer sucursal = (Integer) payload.get("codigoSucursal");
            Integer puntoVenta = (Integer) payload.get("codigoPuntoVenta");

            RegistroCuis cuisEntity = siatService.obtenerCuis(nit, sucursal, puntoVenta);

            // Devolvemos una respuesta idéntica a la estructura de éxito del SIAT
            return ResponseEntity.ok(Map.of(
                "codigo", cuisEntity.getCodigoCuis(),
                "transaccion", true,
                "mensajesList", "CUIS GENERADO EXITOSAMENTE"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "transaccion", false,
                "mensajesList", e.getMessage()
            ));
        }
    }

    /**
     * Endpoint para solicitar el CUFD (Fase 2)
     */
    @PostMapping("/cufd")
    public ResponseEntity<?> solicitarCufd(@RequestBody Map<String, Object> payload) {
        try {
            String cuis = (String) payload.get("cuis");

            RegistroCufd cufdEntity = siatService.obtenerCufd(cuis);

            // Devolvemos los datos que tu backend necesitará para calcular el CUF de las facturas
            return ResponseEntity.ok(Map.of(
                "codigo", cufdEntity.getCodigoCufd(),
                "codigoControl", cufdEntity.getCodigoControl(),
                "transaccion", true,
                "mensajesList", "CUFD GENERADO EXITOSAMENTE"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "transaccion", false,
                "mensajesList", e.getMessage()
            ));
        }
    }
}