/* ==============================================================
   validation.js — Validación del formulario de aplicacion.html
   ==============================================================
   Valida los 12 campos del formulario de solicitud de información:
   - Nombre de empresa (mín. 2 caracteres)
   - Persona de contacto (nombre y apellido)
   - Email corporativo (formato válido)
   - Teléfono (formato +[código país][número])
   - Sitio web (URL válida si se proporciona)
   - País de operación principal (obligatorio)
   - Tipo de producto (obligatorio)
   - Volumen mensual (obligatorio + advertencia < 100)
   - Servicios de interés (al menos 1)
   - 3PL actual (obligatorio)
   - Comentarios (máx. 500 caracteres con contador)
   - Política de privacidad (obligatoria)

   Depende de las variables globales `translations` y `currentLang`
   definidas en el script principal de aplicacion.html.
   ============================================================== */

(function() {
  var form = document.getElementById('formSolicitud');
  var formFields = document.getElementById('formFields');
  var successMessage = document.getElementById('successMessage');

  // Si no existe el formulario, no hacer nada (página sin form)
  if (!form) return;

  function mostrarError(id, mensaje) {
    var el = document.getElementById(id + '-error');
    if (el) {
      el.textContent = mensaje;
      el.classList.remove('hidden');
    }
  }

  function ocultarError(id) {
    var el = document.getElementById(id + '-error');
    if (el) {
      el.classList.add('hidden');
    }
  }

  function marcarValido(id) {
    var input = document.getElementById(id);
    if (input) {
      input.classList.remove('border-[#C60B1E]');
      input.classList.add('border-gray-200');
    }
    ocultarError(id);
  }

  function marcarInvalido(id) {
    var input = document.getElementById(id);
    if (input) {
      input.classList.remove('border-gray-200');
      input.classList.add('border-[#C60B1E]');
    }
  }

  function getMsg(key) {
    return translations[currentLang] && translations[currentLang][key]
      ? translations[currentLang][key]
      : (translations['es'][key] || '');
  }

  // ---- Validación en tiempo real (input) ----
  form.addEventListener('input', function(e) {
    var target = e.target;
    switch (target.id) {
      case 'empresa': validarEmpresa(); break;
      case 'contacto': validarContacto(); break;
      case 'email': validarEmail(); break;
      case 'telefono': validarTelefono(); break;
      case 'sitioWeb': validarSitioWeb(); break;
      case 'comentarios': actualizarContadorComentarios(); break;
    }
  });

  // ---- Validación en tiempo real (change: selects, checkbox, radio) ----
  form.addEventListener('change', function(e) {
    var target = e.target;
    switch (target.id) {
      case 'pais': validarPais(); break;
      case 'producto': validarProducto(); break;
      case 'volumen': validarVolumen(); mostrarAdvertenciaVolumen(); break;
    }
    if (target.name === 'servicios') validarServicios();
    if (target.name === 'tpl') validarTPL();
  });

  // ---- Validadores individuales ----
  function validarEmpresa() {
    var val = document.getElementById('empresa').value.trim();
    if (val.length >= 2) { marcarValido('empresa'); return true; }
    marcarInvalido('empresa');
    mostrarError('empresa', getMsg('error.empresa'));
    return false;
  }

  function validarContacto() {
    var val = document.getElementById('contacto').value.trim();
    var words = val.split(/\s+/).filter(function(w) { return w.length > 0; });
    if (words.length >= 2) { marcarValido('contacto'); return true; }
    marcarInvalido('contacto');
    mostrarError('contacto', getMsg('error.contacto'));
    return false;
  }

  function validarEmail() {
    var val = document.getElementById('email').value.trim();
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (re.test(val)) { marcarValido('email'); return true; }
    marcarInvalido('email');
    mostrarError('email', getMsg('error.email'));
    return false;
  }

  function validarTelefono() {
    var val = document.getElementById('telefono').value.trim();
    if (val.startsWith('+') && val.length >= 5) { marcarValido('telefono'); return true; }
    marcarInvalido('telefono');
    mostrarError('telefono', getMsg('error.telefono'));
    return false;
  }

  function validarSitioWeb() {
    var val = document.getElementById('sitioWeb').value.trim();
    if (val === '') { marcarValido('sitioWeb'); return true; }
    var re = /^https?:\/\/.+/;
    if (re.test(val)) { marcarValido('sitioWeb'); return true; }
    marcarInvalido('sitioWeb');
    mostrarError('sitioWeb', getMsg('error.sitioWeb'));
    return false;
  }

  function validarPais() {
    var val = document.getElementById('pais').value;
    if (val !== '') { marcarValido('pais'); return true; }
    marcarInvalido('pais');
    mostrarError('pais', getMsg('error.pais'));
    return false;
  }

  function validarProducto() {
    var val = document.getElementById('producto').value;
    if (val !== '') { marcarValido('producto'); return true; }
    marcarInvalido('producto');
    mostrarError('producto', getMsg('error.producto'));
    return false;
  }

  function validarVolumen() {
    var val = document.getElementById('volumen').value;
    if (val !== '') { marcarValido('volumen'); return true; }
    marcarInvalido('volumen');
    mostrarError('volumen', getMsg('error.volumen'));
    return false;
  }

  function mostrarAdvertenciaVolumen() {
    var volumen = document.getElementById('volumen').value;
    var producto = document.getElementById('producto').value;
    var warning = document.getElementById('volumen-warning');
    if (volumen === '0-100' && producto !== '') {
      warning.classList.remove('hidden');
    } else {
      warning.classList.add('hidden');
    }
  }

  function validarServicios() {
    var checks = document.querySelectorAll('input[name="servicios"]:checked');
    if (checks.length > 0) { ocultarError('servicios'); return true; }
    mostrarError('servicios', getMsg('error.servicios'));
    return false;
  }

  function validarTPL() {
    var radios = document.querySelectorAll('input[name="tpl"]:checked');
    if (radios.length > 0) { ocultarError('tpl'); return true; }
    mostrarError('tpl', getMsg('error.tpl'));
    return false;
  }

  function validarPrivacidad() {
    var checked = document.getElementById('privacidad').checked;
    if (checked) { ocultarError('privacidad'); return true; }
    mostrarError('privacidad', getMsg('error.privacidad'));
    return false;
  }

  function actualizarContadorComentarios() {
    var ta = document.getElementById('comentarios');
    var counter = document.getElementById('comentarios-counter');
    var len = ta.value.length;
    var max = 500;
    counter.textContent = len + '/' + max;
    if (len > max) {
      ta.value = ta.value.substring(0, max);
      counter.textContent = max + '/' + max;
      mostrarError('comentarios', getMsg('error.comentarios') + (max + len - ta.value.length) + ')');
    } else {
      ocultarError('comentarios');
    }
  }

  // Inicializar contador
  actualizarContadorComentarios();

  // ---- Validar al enviar ----
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var valid = true;
    valid = validarEmpresa() && valid;
    valid = validarContacto() && valid;
    valid = validarEmail() && valid;
    valid = validarTelefono() && valid;
    valid = validarSitioWeb() && valid;
    valid = validarPais() && valid;
    valid = validarProducto() && valid;
    valid = validarVolumen() && valid;
    valid = validarServicios() && valid;
    valid = validarTPL() && valid;
    valid = validarPrivacidad() && valid;

    if (!valid) {
      var firstError = document.querySelector('.border-\\[\\#C60B1E\\]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Simular envío exitoso
    formFields.classList.add('hidden');
    successMessage.classList.remove('hidden');
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // ---- Re-valida campos con errores visibles (para traducir mensajes al cambiar idioma) ----
  window.revalidarErrores = function() {
    var errClass = 'border-[#C60B1E]';
    var invalidos = document.querySelectorAll('.' + errClass.replace(/[\[\]#]/g, function(m) {
      return '\\' + m;
    }));
    // Los campos con borde rojo son inválidos; re-ejecutamos su validador para
    // refrescar el mensaje de error en el idioma actual.
    var ids = ['empresa','contacto','email','telefono','sitioWeb','pais','producto','volumen'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.classList.contains(errClass)) {
        switch (ids[i]) {
          case 'empresa': validarEmpresa(); break;
          case 'contacto': validarContacto(); break;
          case 'email': validarEmail(); break;
          case 'telefono': validarTelefono(); break;
          case 'sitioWeb': validarSitioWeb(); break;
          case 'pais': validarPais(); break;
          case 'producto': validarProducto(); break;
          case 'volumen': validarVolumen(); break;
        }
      }
    }
    // Servicios y TPL: si hay error visible, re-validar
    if (document.getElementById('servicios-error') && !document.getElementById('servicios-error').classList.contains('hidden')) {
      validarServicios();
    }
    if (document.getElementById('tpl-error') && !document.getElementById('tpl-error').classList.contains('hidden')) {
      validarTPL();
    }
    if (document.getElementById('privacidad-error') && !document.getElementById('privacidad-error').classList.contains('hidden')) {
      validarPrivacidad();
    }
  };
})();