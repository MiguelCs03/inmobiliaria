"""
Utilidades de validación y optimización de imágenes.
"""
import os
from pathlib import Path
from PIL import Image

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MAX_SIZE_MB = 10

def validate_image(file) -> tuple:
    """
    Retorna (True, '') si es válida o (False, 'mensaje') si no.
    """
    ext = Path(file.name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Extensión no permitida: {ext}. Usa: {ALLOWED_EXTENSIONS}"
    size_mb = file.size / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        return False, f"Archivo muy grande ({size_mb:.1f} MB). Máximo {MAX_SIZE_MB} MB."
    return True, ''

def optimize_image(path: str, max_dim: int = 1024) -> str:
    """Redimensiona y comprime la imagen si supera max_dim px."""
    img = Image.open(path).convert('RGB')
    w, h = img.size
    if max(w, h) > max_dim:
        ratio = max_dim / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
    img.save(path, quality=85, optimize=True)
    return path

def get_image_metadata(path: str) -> dict:
    """Retorna metadatos básicos de la imagen."""
    img = Image.open(path)
    return {
        'width':  img.width,
        'height': img.height,
        'mode':   img.mode,
        'format': img.format,
    }
