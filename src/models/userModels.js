class Usuario {
    constructor(_id, nombre, correo, password, rol, imagen_perfil, telefono, extras = {}) {
      this._id = _id;
      this.nombre = nombre;
      this.correo = correo;
      this.password = password;  // Cifrar antes de guardar
      this.rol = rol;
      this.imagen_perfil = imagen_perfil;
      this.telefono = telefono;
  
      // Relacionar con otras colecciones por ID
      this.favoritos = extras.favoritos || [];  // Referencias a barberías favoritas
      this.reservas = extras.reservas || [];  // Referencias a reservas
      this.notificaciones = extras.notificaciones || [];  // Referencias a notificaciones
      this.membresia = extras.membresia || null;  // Referencia a membresía
      this.device_token = extras.device_token || "";
      this.pagos = extras.pagos || [];  // Referencias a pagos
  
      if (rol === "barbero") {
        this.especialidades = extras.especialidades || [];
        this.barberias = extras.barberias || [];  // Referencias a barberías donde trabaja
        this.horario_disponible = extras.horario_disponible || {};
        this.calificacion = extras.calificacion || 0;
        this.habilitado = extras.habilitado !== undefined ? extras.habilitado : true;
      }
    }
  }
  
  module.exports = Usuario;
  