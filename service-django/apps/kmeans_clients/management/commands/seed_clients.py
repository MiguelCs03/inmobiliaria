import random
from django.core.management.base import BaseCommand
from apps.kmeans_clients.models import Client

NOMBRES = [
    "Carlos Mendoza", "María López", "Juan Pérez", "Ana Rodríguez",
    "Pedro García", "Laura Martínez", "Diego Sánchez", "Camila Torres",
    "Andrés Ramírez", "Valentina Flores", "Santiago Vargas", "Isabella Ríos",
    "Felipe Castillo", "Gabriela Ortiz", "Mateo Morales", "Sofía Herrera",
    "Sebastián Silva", "Daniela Guzmán", "Joaquín Ruiz", "Carolina Vega",
    "Emilio Paredes", "Paola Delgado", "Luciano Acosta", "Fernanda Rivas",
    "Javier Peña", "Andrea Campos", "Agustín Suárez", "Mariana Navarro",
    "Julio Cárdenas", "Alejandra Cruz",
]

EMAIL_DOMINIOS = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "icloud.com"]

ZONAS = [
    "Equipetrol Norte", "Equipetrol Sur", "Urbarí", "Las Palmas",
    "Hamacas", "Casco Viejo", "Plan 3000", "Villa 1ro de Mayo",
    "Av. Banzer", "Sirari", "Norte", "Sur",
    "Av. San Martín", "Mercado", "Los Pozos", "Trompillo",
    "Radial 17 1/2", "Radial 26", "Piraí", "Cotoca",
]

TIPOS_PROPIEDAD = ["Casa", "Departamento", "Terreno", "Duplex", "Penthouse", "Oficina", "Local Comercial"]

SEGMENTOS = [
    (0, "Comprador premium", 180000, 350000),
    (1, "Arrendatario joven", 20000, 50000),
    (2, "Inversor patrimonial", 100000, 250000),
    (3, "Familia en crecimiento", 60000, 150000),
    (4, "Profesional soltero", 40000, 100000),
]

DISTRIBUCION = [15, 25, 20, 25, 15]


class Command(BaseCommand):
    help = "Genera clientes sintéticos para poblar la tabla clients_client"

    def add_arguments(self, parser):
        parser.add_argument('total', nargs='?', type=int, default=3000,
                            help='Cantidad de clientes a generar (default: 3000)')

    def handle(self, *args, **options):
        total = options['total']
        Client.objects.all().delete()
        batch = []
        idx = 0

        for seg_id, seg_nombre, budget_min, budget_max in SEGMENTOS:
            count = max(1, total * DISTRIBUCION[seg_id] // 100)
            for _ in range(count):
                idx += 1
                nombre = random.choice(NOMBRES)
                email = f"cliente{idx}@{random.choice(EMAIL_DOMINIOS)}".lower()
                zona = random.choice(ZONAS)
                tipo = random.choice(TIPOS_PROPIEDAD)
                presupuesto = round(random.uniform(budget_min, budget_max), -3)

                batch.append(Client(
                    nombres=nombre,
                    email=email,
                    telefono=f"7{random.randint(60000000, 79999999)}",
                    presupuesto_max=presupuesto,
                    tipo_prop_pref=tipo,
                    habitaciones_pref=random.randint(1, 5),
                    zona_pref=zona,
                    n_busquedas=random.randint(0, 80),
                    interacciones=random.randint(0, 30),
                    segmento_id=seg_id,
                    segmento_nombre=seg_nombre,
                ))

                if len(batch) >= 500:
                    Client.objects.bulk_create(batch)
                    batch = []

        if batch:
            Client.objects.bulk_create(batch)

        created = Client.objects.count()
        self.stdout.write(self.style.SUCCESS(f"Seed completado: {created} clientes creados"))
