from rest_framework.permissions import BasePermission

class IsAgente(BasePermission):
    """Solo empleados con rol Agente pueden acceder."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and request.user.groups.filter(name='Agente').exists())

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)
