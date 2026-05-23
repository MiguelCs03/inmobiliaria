from .image_utils import validate_image

def handle_property_image_upload(request, property_id: int):
    """
    Valida y retorna el archivo de imagen del request.
    Lanza ValueError si no pasa validación.
    """
    file = request.FILES.get('image')
    if not file:
        raise ValueError("No se recibió ningún archivo con el campo 'image'.")
    valid, msg = validate_image(file)
    if not valid:
        raise ValueError(msg)
    return file
