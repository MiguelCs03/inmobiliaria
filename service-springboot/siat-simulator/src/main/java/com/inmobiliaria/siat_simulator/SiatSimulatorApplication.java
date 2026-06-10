package com.inmobiliaria.siat_simulator;

import com.inmobiliaria.siat_simulator.model.PuntoVenta;
import com.inmobiliaria.siat_simulator.repository.PuntoVentaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SiatSimulatorApplication {

	public static void main(String[] args) {
		SpringApplication.run(SiatSimulatorApplication.class, args);
	}

	/**
	 * Seedor para precargar el Punto de Venta por defecto
	 * requerido por la integración con la inmobiliaria NestJS.
	 */
	@Bean
	public CommandLineRunner seedPuntoVenta(PuntoVentaRepository repository) {
		return args -> {
			if (repository.count() == 0) {
				PuntoVenta central = new PuntoVenta();
				central.setNitEmisor("123456789012");
				central.setCodigoSucursal(0);
				central.setCodigoPuntoVenta(0);
				central.setNombre("Casa Central - Inmobiliaria");
				repository.save(central);
				System.out.println(">>> SEED: Punto de venta central del SIAT inicializado (NIT: 123456789012, Sucursal: 0, Punto Venta: 0)");
			}
		};
	}
}

