package com.inmobiliaria.siat_simulator.service;

import org.springframework.stereotype.Service;
import java.math.BigInteger;

@Service
public class CufService {

    /**
     * Aplica el algoritmo Módulo 11 según la especificación del SIAT.
     */
    public String calcularModulo11(String cadena, int numDig, int limMult, boolean x10) {
        int mult, suma, i, n, dig;
        
        for (n = 1; n <= numDig; n++) {
            suma = 0;
            mult = 2;
            for (i = cadena.length() - 1; i >= 0; i--) {
                suma += (Integer.parseInt(String.valueOf(cadena.charAt(i))) * mult);
                mult++;
                if (mult > limMult) {
                    mult = 2;
                }
            }
            
            if (x10) {
                dig = ((suma * 10) % 11) % 10;
            } else {
                dig = suma % 11;
            }
            
            if (dig == 10) {
                cadena += "1";
            } else if (dig == 11) {
                cadena += "0";
            } else {
                cadena += String.valueOf(dig);
            }
        }
        return cadena;
    }

    /**
     * Genera el CUF uniendo los campos requeridos, aplicando Módulo 11 y pasando a Base 16.
     * * @param nitEmisor      NIT de la inmobiliaria (13 dígitos con ceros a la izquierda)
     * @param fechaHora      Fecha en formato yyyyMMddHHmmssSSS
     * @param sucursal       Código de sucursal
     * @param modalidad      Modalidad (Ej: 1 = Electrónica en Línea, 2 = Computarizada)
     * @param tipoEmision    Tipo de Emisión (Ej: 1 = Online)
     * @param tipoFactura    Tipo de Factura (Ej: 1 = Con Derecho a Crédito Fiscal)
     * @param tipoDocSector  Tipo de Documento Sector (Ej: 1 = Compra Venta)
     * @param nroFactura     Número de factura
     * @param puntoVenta     Código de punto de venta
     * @param codigoControl  La clave secreta diaria que viene en el CUFD
     */
    public String generarCuf(String nitEmisor, String fechaHora, Integer sucursal, 
                             Integer modalidad, Integer tipoEmision, Integer tipoFactura, 
                             Integer tipoDocSector, Long nroFactura, Integer puntoVenta, 
                             String codigoControl) {

        // 1. Formatear campos rellenando con ceros a la izquierda según estándar SIAT
        String nitFormateado = String.format("%013d", Long.parseLong(nitEmisor));
        String sucursalFormateada = String.format("%04d", sucursal);
        String nroFacturaFormateado = String.format("%010d", nroFactura);
        String puntoVentaFormateado = String.format("%04d", puntoVenta);

        // 2. Concatenar la cadena base para el CUF
        String cadenaCuf = nitFormateado 
                + fechaHora 
                + sucursalFormateada 
                + modalidad 
                + tipoEmision 
                + tipoFactura 
                + tipoDocSector 
                + nroFacturaFormateado 
                + puntoVentaFormateado;

        // 3. Obtener el Dígito de Control usando Módulo 11
        String cadenaConDigito = calcularModulo11(cadenaCuf, 1, 9, false);
        
        // 4. Concatenar el dígito obtenido al final de la cadena base
        String digitoControl = cadenaConDigito.substring(cadenaConDigito.length() - 1);
        String cadenaCompleta = cadenaCuf + digitoControl;

        // 5. Convertir a Base 16 (Hexadecimal) y sumarle el Código de Control del CUFD al final
        BigInteger numeroAsBigInt = new BigInteger(cadenaCompleta);
        String cufHexadecimal = numeroAsBigInt.toString(16).toUpperCase();

        // El CUF final es el Hexadecimal + el Código de Control (clave criptográfica)
        return cufHexadecimal + codigoControl;
    }
}