/* =========================================================
   CONTROL-DOTACIÓN
   SCRIPT COMPLETO
   ========================================================= */

"use strict";

/* =========================================================
   DATOS
   ========================================================= */

const STORAGE = {
    empleados: "controlDotacion_empleados",
    entregas: "controlDotacion_entregas",
    inventario: "controlDotacion_inventario",
    historial: "controlDotacion_historial",
    sesion: "controlDotacion_sesion"
};

const elementosBase = [
    "Camisa Administrativos",
    "Camisa Ventas Nutresa",
    "Camisa Ventas Cárnicos",
    "Camisa Ventas Meals",
    "Camisilla Verde",
    "Camisilla Gris",
    "Suéter Verde",
    "Buso Gris",
    "Pantalón",
    "Botas",
    "Chaqueta",
    "Otro"
];

let empleados = cargar(STORAGE.empleados, []);
let entregas = cargar(STORAGE.entregas, []);
let inventario = cargar(STORAGE.inventario, []);
let historial = cargar(STORAGE.historial, []);

let empleadoEditando = null;
let entregaEditando = null;

/* =========================================================
   UTILIDADES
   ========================================================= */

function cargar(clave, defecto) {
    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : defecto;
    } catch (error) {
        console.error("Error cargando", clave, error);
        return defecto;
    }
}

function guardar(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function generarId(prefijo = "ID") {
    return prefijo + Date.now() + Math.random().toString(36).substring(2, 7);
}

function escapeHTML(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function fechaActual() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}

function formatearFecha(fecha) {
    if (!fecha) return "-";

    const partes = fecha.split("-");

    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return fecha;
}

function obtenerEmpleado(id) {
    return empleados.find(e => e.id === id);
}

function agregarHistorial(accion, detalle) {
    historial.unshift({
        id: generarId("H"),
        fecha: fechaActual(),
        accion,
        detalle
    });

    guardar(STORAGE.historial, historial);
    renderHistorial();
}

function mostrarMensaje(texto, tipo = "ok") {
    const mensaje = document.getElementById("mensaje");

    if (!mensaje) return;

    mensaje.textContent = texto;
    mensaje.className = `mensaje-login ${tipo}`;

    setTimeout(() => {
        mensaje.textContent = "";
        mensaje.className = "mensaje-login";
    }, 3500);
}

/* =========================================================
   LOGIN
   ========================================================= */

function iniciarLogin() {
    const loginForm = document.getElementById("loginForm");
    const mostrarPassword = document.getElementById("mostrarPassword");
    const password = document.getElementById("password");
    const pantallaLogin = document.getElementById("pantallaLogin");
    const dashboard = document.getElementById("dashboard");
    const cerrarSesion = document.getElementById("cerrarSesion");

    if (localStorage.getItem(STORAGE.sesion) === "true") {
        pantallaLogin.classList.add("oculto");
        dashboard.classList.remove("oculto");
    }

    loginForm?.addEventListener("submit", function(e) {
        e.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const clave = document.getElementById("password").value;

        if (!usuario || !clave) {
            mostrarMensaje("Ingresa usuario y contraseña.", "error");
            return;
        }

        localStorage.setItem(STORAGE.sesion, "true");

        pantallaLogin.classList.add("oculto");
        dashboard.classList.remove("oculto");

        cargarDashboard();
    });

    mostrarPassword?.addEventListener("click", function() {
        if (password.type === "password") {
            password.type = "text";
            this.textContent = "🙈";
        } else {
            password.type = "password";
            this.textContent = "👁️";
        }
    });

    document.getElementById("olvidoPassword")?.addEventListener("click", () => {
        alert("Contacta al administrador del sistema para restablecer la contraseña.");
    });

    cerrarSesion?.addEventListener("click", () => {
        localStorage.removeItem(STORAGE.sesion);
        dashboard.classList.add("oculto");
        pantallaLogin.classList.remove("oculto");
        document.getElementById("password").value = "";
    });
}

/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function iniciarNavegacion() {
    const botones = document.querySelectorAll("[data-seccion]");

    botones.forEach(boton => {
        boton.addEventListener("click", function() {
            mostrarSeccion(this.dataset.seccion);
        });
    });

    document.getElementById("btnMenuMovil")?.addEventListener("click", () => {
        document.querySelector(".sidebar")?.classList.toggle("abierta");
    });
}

function mostrarSeccion(id) {
    document.querySelectorAll(".seccion").forEach(seccion => {
        seccion.classList.remove("activa");
    });

    const seccion = document.getElementById(id);

    if (seccion) {
        seccion.classList.add("activa");
    }

    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.toggle(
            "activo",
            item.dataset.seccion === id
        );
    });

    const titulos = {
        "seccion-inicio": "Buenos días, Adriana 👋",
        "seccion-empleados": "Gestión de empleados",
        "seccion-dotacion": "Control de dotación",
        "seccion-historial": "Historial del sistema",
        "seccion-reportes": "Reportes",
        "seccion-configuracion": "Configuración"
    };

    const titulo = document.getElementById("tituloSeccion");

    if (titulo) {
        titulo.textContent = titulos[id] || "Control-Dotación";
    }

    if (id === "seccion-reportes") {
        renderReportes();
    }

    if (id === "seccion-dotacion") {
        renderDotacion();
    }

    if (id === "seccion-empleados") {
        renderEmpleados();
    }

    if (id === "seccion-historial") {
        renderHistorial();
    }
}

/* =========================================================
   EMPLEADOS
   ========================================================= */

function iniciarEmpleados() {
    document.getElementById("nuevoEmpleado")?.addEventListener("click", () => {
        abrirModalEmpleado();
    });

    document.getElementById("cerrarModalEmpleado")?.addEventListener("click", cerrarModalEmpleado);
    document.getElementById("cancelarEmpleado")?.addEventListener("click", cerrarModalEmpleado);

    document.getElementById("formEmpleado")?.addEventListener("submit", guardarEmpleado);

    document.getElementById("buscarEmpleado")?.addEventListener("input", renderEmpleados);

    document.getElementById("agregarTalla")?.addEventListener("click", agregarTallaExtra);

    document.getElementById("empleadoFoto")?.addEventListener("change", vistaPreviaFoto);

    renderEmpleados();
}

function abrirModalEmpleado(id = null) {
    const modal = document.getElementById("modalEmpleado");
    const form = document.getElementById("formEmpleado");

    if (!modal || !form) return;

    empleadoEditando = id;

    form.reset();

    document.getElementById("empleadoId").value = id || "";
    document.getElementById("listaTallas").innerHTML = "";

    if (id) {
        const empleado = obtenerEmpleado(id);

        if (!empleado) return;

        document.getElementById("tituloModalEmpleado").textContent = "Editar empleado";

        document.getElementById("empleadoCodigo").value = empleado.codigo || "";
        document.getElementById("empleadoDocumento").value = empleado.documento || "";
        document.getElementById("empleadoNombre").value = empleado.nombre || "";
        document.getElementById("empleadoCargo").value = empleado.cargo || "";
        document.getElementById("empleadoArea").value = empleado.area || "";
        document.getElementById("empleadoEstado").value = empleado.estado || "Activo";
        document.getElementById("empleadoTalla").value = empleado.tallaCamisa || "";
        document.getElementById("empleadoTallaPantalon").value = empleado.tallaPantalon || "";
        document.getElementById("empleadoTallaCalzado").value = empleado.tallaCalzado || "";

        if (empleado.foto) {
            document.getElementById("vistaFotoEmpleado").innerHTML =
                `<img src="${empleado.foto}" alt="Foto">`;
        } else {
            document.getElementById("vistaFotoEmpleado").textContent = "👤";
        }

        if (empleado.tallasExtra) {
            empleado.tallasExtra.forEach(talla => agregarTallaExtra(talla));
        }

    } else {
        document.getElementById("tituloModalEmpleado").textContent = "Nuevo empleado";
        document.getElementById("vistaFotoEmpleado").textContent = "👤";
    }

    modal.classList.remove("oculto");
}

function cerrarModalEmpleado() {
    document.getElementById("modalEmpleado")?.classList.add("oculto");
    empleadoEditando = null;
}

function vistaPreviaFoto(e) {
    const archivo = e.target.files[0];

    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = function(event) {
        document.getElementById("vistaFotoEmpleado").innerHTML =
            `<img src="${event.target.result}" alt="Foto">`;
    };

    lector.readAsDataURL(archivo);
}

function agregarTallaExtra(datos = null) {
    const lista = document.getElementById("listaTallas");

    if (!lista) return;

    const fila = document.createElement("div");

    fila.className = "fila-talla-extra";

    fila.innerHTML = `
        <input 
            type="text" 
            class="talla-extra-nombre"
            placeholder="Ej. Chaqueta"
            value="${escapeHTML(datos?.nombre || "")}"
        >
        <input 
            type="text" 
            class="talla-extra-valor"
            placeholder="Talla"
            value="${escapeHTML(datos?.valor || "")}"
        >
        <button type="button" class="btn-eliminar-talla">×</button>
    `;

    fila.querySelector(".btn-eliminar-talla").addEventListener("click", () => {
        fila.remove();
    });

    lista.appendChild(fila);
}

function guardarEmpleado(e) {
    e.preventDefault();

    const codigo = document.getElementById("empleadoCodigo").value.trim();
    const documento = document.getElementById("empleadoDocumento").value.trim();
    const nombre = document.getElementById("empleadoNombre").value.trim();
    const cargo = document.getElementById("empleadoCargo").value.trim();

    if (!codigo || !documento || !nombre || !cargo) {
        alert("Completa los campos obligatorios.");
        return;
    }

    const filasTallas = document.querySelectorAll(".fila-talla-extra");

    const tallasExtra = [...filasTallas].map(fila => ({
        nombre: fila.querySelector(".talla-extra-nombre").value.trim(),
        valor: fila.querySelector(".talla-extra-valor").value.trim()
    })).filter(t => t.nombre || t.valor);

    const empleadoExistente = empleadoEditando
        ? obtenerEmpleado(empleadoEditando)
        : null;

    const empleado = {
        id: empleadoEditando || generarId("EMP"),
        codigo,
        documento,
        nombre,
        cargo,
        area: document.getElementById("empleadoArea").value.trim(),
        estado: document.getElementById("empleadoEstado").value,
        tallaCamisa: document.getElementById("empleadoTalla").value,
        tallaPantalon: document.getElementById("empleadoTallaPantalon").value,
        tallaCalzado: document.getElementById("empleadoTallaCalzado").value,
        tallasExtra,
        foto: empleadoExistente?.foto || ""
    };

    const archivo = document.getElementById("empleadoFoto").files[0];

    const terminarGuardado = () => {
        if (empleadoEditando) {
            const index = empleados.findIndex(e => e.id === empleadoEditando);

            if (index !== -1) {
                empleados[index] = empleado;
            }

            agregarHistorial(
                "Empleado actualizado",
                `Se actualizó el empleado ${nombre}.`
            );
        } else {
            empleados.push(empleado);

            agregarHistorial(
                "Empleado creado",
                `Se registró el empleado ${nombre}.`
            );
        }

        guardar(STORAGE.empleados, empleados);

        cerrarModalEmpleado();
        renderEmpleados();
        actualizarTodo();
    };

    if (archivo) {
        const lector = new FileReader();

        lector.onload = function(event) {
            empleado.foto = event.target.result;
            terminarGuardado();
        };

        lector.readAsDataURL(archivo);
    } else {
        terminarGuardado();
    }
}

function renderEmpleados() {
    const body = document.getElementById("tablaEmpleadosBody");

    if (!body) return;

    const buscar = (
        document.getElementById("buscarEmpleado")?.value || ""
    ).toLowerCase();

    const filtrados = empleados.filter(e =>
        `${e.nombre} ${e.codigo} ${e.documento} ${e.cargo}`
            .toLowerCase()
            .includes(buscar)
    );

    body.innerHTML = "";

    filtrados.forEach(empleado => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <strong>${escapeHTML(empleado.nombre)}</strong>
                ${empleado.area ? `<small>${escapeHTML(empleado.area)}</small>` : ""}
            </td>
            <td>${escapeHTML(empleado.codigo)}</td>
            <td>${escapeHTML(empleado.documento)}</td>
            <td>${escapeHTML(empleado.cargo)}</td>
            <td>${escapeHTML(empleado.tallaCamisa || "-")}</td>
            <td>${escapeHTML(empleado.tallaPantalon || "-")}</td>
            <td>${escapeHTML(empleado.tallaCalzado || "-")}</td>
            <td>
                <span class="estado ${empleado.estado === "Activo" ? "entregado" : "pendiente"}">
                    ${escapeHTML(empleado.estado)}
                </span>
            </td>
            <td>
                <button class="btn-tabla editar-empleado" data-id="${empleado.id}">
                    ✏️
                </button>
                <button class="btn-tabla eliminar-empleado" data-id="${empleado.id}">
                    🗑️
                </button>
            </td>
        `;

        body.appendChild(tr);
    });

    document.querySelectorAll(".editar-empleado").forEach(btn => {
        btn.addEventListener("click", () => {
            abrirModalEmpleado(btn.dataset.id);
        });
    });

    document.querySelectorAll(".eliminar-empleado").forEach(btn => {
        btn.addEventListener("click", () => {
            eliminarEmpleado(btn.dataset.id);
        });
    });

    const contador = document.getElementById("contadorEmpleadosTabla");

    if (contador) {
        contador.textContent = filtrados.length;
    }

    const total = document.getElementById("totalEmpleados");

    if (total) {
        total.textContent = empleados.length;
    }
}

function eliminarEmpleado(id) {
    const empleado = obtenerEmpleado(id);

    if (!empleado) return;

    const tieneEntregas = entregas.some(e => e.empleadoId === id);

    if (tieneEntregas) {
        alert("No puedes eliminar este empleado porque tiene entregas registradas.");
        return;
    }

    if (!confirm(`¿Eliminar a ${empleado.nombre}?`)) return;

    empleados = empleados.filter(e => e.id !== id);

    guardar(STORAGE.empleados, empleados);

    agregarHistorial(
        "Empleado eliminado",
        `Se eliminó el empleado ${empleado.nombre}.`
    );

    renderEmpleados();
    actualizarTodo();
}

/* =========================================================
   ENTREGAS
   ========================================================= */

function iniciarEntregas() {
    document.getElementById("nuevaEntrega")?.addEventListener("click", () => {
        abrirModalEntrega();
    });

    document.getElementById("cerrarModalEntrega")?.addEventListener("click", cerrarModalEntrega);
    document.getElementById("cancelarEntrega")?.addEventListener("click", cerrarModalEntrega);

    document.getElementById("formEntrega")?.addEventListener("submit", guardarEntrega);

    document.getElementById("buscarEntrega")?.addEventListener("input", renderDotacion);

    document.getElementById("entregaEmpleado")?.addEventListener("change", actualizarTallasEntrega);
    document.getElementById("entregaElemento")?.addEventListener("change", actualizarTallasEntrega);

    cargarEmpleadosSelect();
    renderDotacion();
}

function cargarEmpleadosSelect() {
    const select = document.getElementById("entregaEmpleado");

    if (!select) return;

    const valorActual = select.value;

    select.innerHTML = `
        <option value="">Seleccionar empleado</option>
        ${empleados
            .filter(e => e.estado === "Activo")
            .map(e => `
                <option value="${e.id}">
                    ${escapeHTML(e.nombre)} - ${escapeHTML(e.codigo)}
                </option>
            `).join("")}
    `;

    if (valorActual) {
        select.value = valorActual;
    }
}

function abrirModalEntrega(id = null) {
    const modal = document.getElementById("modalEntrega");
    const form = document.getElementById("formEntrega");

    if (!modal || !form) return;

    entregaEditando = id;

    cargarEmpleadosSelect();

    form.reset();

    document.getElementById("entregaId").value = id || "";
    document.getElementById("entregaCantidad").value = 1;
    document.getElementById("entregaFecha").value = fechaActual();

    if (id) {
        const entrega = entregas.find(e => e.id === id);

        if (!entrega) return;

        document.getElementById("tituloModalEntrega").textContent = "Editar entrega";

        document.getElementById("entregaEmpleado").value = entrega.empleadoId;
        document.getElementById("entregaElemento").value = entrega.elemento;
        document.getElementById("entregaCentroCosto").value = entrega.centroCosto;
        document.getElementById("entregaCantidad").value = entrega.cantidad;
        document.getElementById("entregaTalla").value = entrega.talla || "";
        document.getElementById("entregaFecha").value = entrega.fecha;
        document.getElementById("entregaEstado").value = entrega.estado;
        document.getElementById("entregaObservaciones").value = entrega.observaciones || "";

        actualizarTallasEntrega();

        setTimeout(() => {
            document.getElementById("entregaTalla").value = entrega.talla || "";
        }, 0);

    } else {
        document.getElementById("tituloModalEntrega").textContent = "Registrar entrega";
        document.getElementById("entregaTalla").innerHTML = `
            <option value="">Seleccionar</option>
        `;
    }

    modal.classList.remove("oculto");
}

function cerrarModalEntrega() {
    document.getElementById("modalEntrega")?.classList.add("oculto");
    entregaEditando = null;
}

function actualizarTallasEntrega() {
    const empleadoId = document.getElementById("entregaEmpleado")?.value;
    const elemento = document.getElementById("entregaElemento")?.value;
    const select = document.getElementById("entregaTalla");

    if (!select) return;

    const empleado = obtenerEmpleado(empleadoId);

    let tallas = [];

    if (empleado) {
        if (
            elemento?.toLowerCase().includes("camisa") ||
            elemento?.toLowerCase().includes("camisilla") ||
            elemento?.toLowerCase().includes("suéter") ||
            elemento?.toLowerCase().includes("buso") ||
            elemento?.toLowerCase().includes("chaqueta")
        ) {
            tallas.push(empleado.tallaCamisa);
        }

        if (elemento?.toLowerCase().includes("pantalón")) {
            tallas.push(empleado.tallaPantalon);
        }

        if (elemento?.toLowerCase().includes("bota")) {
            tallas.push(empleado.tallaCalzado);
        }

        if (empleado.tallasExtra) {
            empleado.tallasExtra.forEach(t => tallas.push(t.valor));
        }
    }

    tallas = [...new Set(tallas.filter(Boolean))];

    select.innerHTML = `
        <option value="">Seleccionar</option>
        ${tallas.map(t => `<option value="${escapeHTML(t)}">${escapeHTML(t)}</option>`).join("")}
    `;
}

function obtenerStock(elemento) {
    const registro = inventario.find(i => i.elemento === elemento);

    if (!registro) return 0;

    return Number(registro.stock || 0);
}

function guardarEntrega(e) {
    e.preventDefault();

    const empleadoId = document.getElementById("entregaEmpleado").value;
    const elemento = document.getElementById("entregaElemento").value;
    const cantidad = Number(document.getElementById("entregaCantidad").value);
    const estado = document.getElementById("entregaEstado").value;

    if (!empleadoId || !elemento || cantidad < 1) {
        alert("Completa los datos obligatorios.");
        return;
    }

    const empleado = obtenerEmpleado(empleadoId);

    if (!empleado) {
        alert("Empleado no encontrado.");
        return;
    }

    const entregaAnterior = entregaEditando
        ? entregas.find(e => e.id === entregaEditando)
        : null;

    /*
       Si es una nueva entrega ENTREGADA,
       se descuenta del inventario.
    */

    if (!entregaEditando && estado === "Entregado") {
        const stockActual = obtenerStock(elemento);

        if (stockActual < cantidad) {
            alert(
                `Inventario insuficiente.\n\n` +
                `Elemento: ${elemento}\n` +
                `Disponible: ${stockActual}\n` +
                `Solicitado: ${cantidad}`
            );
            return;
        }

        modificarStock(elemento, -cantidad, "Entrega");
    }

    /*
       Si editamos una entrega:
       primero devolvemos el movimiento anterior
       y luego aplicamos el nuevo.
    */

    if (entregaEditando && entregaAnterior) {
        if (entregaAnterior.estado === "Entregado") {
            modificarStock(
                entregaAnterior.elemento,
                entregaAnterior.cantidad,
                "Corrección de entrega"
            );
        }

        if (estado === "Entregado") {
            const stockActual = obtenerStock(elemento);

            if (stockActual < cantidad) {
                modificarStock(
                    entregaAnterior.elemento,
                    -entregaAnterior.cantidad,
                    "Restauración"
                );

                alert(
                    `No hay suficiente inventario para esta modificación.\n\n` +
                    `Disponible: ${stockActual}\n` +
                    `Solicitado: ${cantidad}`
                );

                return;
            }

            modificarStock(elemento, -cantidad, "Entrega modificada");
        }
    }

    const entrega = {
        id: entregaEditando || generarId("ENT"),
        empleadoId,
        empleadoNombre: empleado.nombre,
        elemento,
        talla: document.getElementById("entregaTalla").value,
        cantidad,
        centroCosto: document.getElementById("entregaCentroCosto").value,
        fecha: document.getElementById("entregaFecha").value,
        estado,
        evidencia: entregaAnterior?.evidencia || "",
        observaciones: document.getElementById("entregaObservaciones").value.trim()
    };

    const archivo = document.getElementById("entregaEvidencia").files[0];

    const terminar = () => {
        if (entregaEditando) {
            const index = entregas.findIndex(e => e.id === entregaEditando);

            if (index !== -1) {
                entregas[index] = entrega;
            }

            agregarHistorial(
                "Entrega actualizada",
                `${empleado.nombre} - ${elemento} x${cantidad}`
            );

        } else {
            entregas.unshift(entrega);

            agregarHistorial(
                "Entrega registrada",
                `${empleado.nombre} recibió ${cantidad} ${elemento}.`
            );
        }

        guardar(STORAGE.entregas, entregas);

        cerrarModalEntrega();

        actualizarTodo();
    };

    if (archivo) {
        const lector = new FileReader();

        lector.onload = function(event) {
            entrega.evidencia = event.target.result;
            terminar();
        };

        lector.readAsDataURL(archivo);
    } else {
        terminar();
    }
}

function eliminarEntrega(id) {
    const entrega = entregas.find(e => e.id === id);

    if (!entrega) return;

    if (!confirm("¿Eliminar esta entrega?")) return;

    if (entrega.estado === "Entregado") {
        modificarStock(
            entrega.elemento,
            entrega.cantidad,
            "Devolución por eliminación"
        );
    }

    entregas = entregas.filter(e => e.id !== id);

    guardar(STORAGE.entregas, entregas);

    agregarHistorial(
        "Entrega eliminada",
        `${entrega.empleadoNombre} - ${entrega.elemento}`
    );

    actualizarTodo();
}

function renderDotacion() {
    const body = document.getElementById("tablaDotacionBody");

    if (!body) return;

    const buscar = (
        document.getElementById("buscarEntrega")?.value || ""
    ).toLowerCase();

    const filtradas = entregas.filter(e => {
        const empleado = obtenerEmpleado(e.empleadoId);

        return `${e.empleadoNombre} ${e.elemento} ${e.centroCosto} ${empleado?.codigo || ""}`
            .toLowerCase()
            .includes(buscar);
    });

    body.innerHTML = "";

    filtradas.forEach(entrega => {
        const tr = document.createElement("tr");

        const evidencia = entrega.evidencia
            ? `<a href="${entrega.evidencia}" target="_blank">📷 Ver</a>`
            : "-";

        tr.innerHTML = `
            <td>${formatearFecha(entrega.fecha)}</td>
            <td>${escapeHTML(entrega.empleadoNombre)}</td>
            <td>${escapeHTML(entrega.elemento)}</td>
            <td>${escapeHTML(entrega.talla || "-")}</td>
            <td>${entrega.cantidad}</td>
            <td>${escapeHTML(entrega.centroCosto)}</td>
            <td>
                <span class="estado ${entrega.estado === "Entregado" ? "entregado" : "pendiente"}">
                    ${escapeHTML(entrega.estado)}
                </span>
            </td>
            <td>${evidencia}</td>
            <td>
                <button class="btn-tabla editar-entrega" data-id="${entrega.id}">
                    ✏️
                </button>
                <button class="btn-tabla eliminar-entrega" data-id="${entrega.id}">
                    🗑️
                </button>
            </td>
        `;

        body.appendChild(tr);
    });

    document.querySelectorAll(".editar-entrega").forEach(btn => {
        btn.addEventListener("click", () => {
            abrirModalEntrega(btn.dataset.id);
        });
    });

    document.querySelectorAll(".eliminar-entrega").forEach(btn => {
        btn.addEventListener("click", () => {
            eliminarEntrega(btn.dataset.id);
        });
    });

    actualizarResumenDotacion();
}

/* =========================================================
   INVENTARIO
   ========================================================= */

function inicializarInventario() {
    /*
       Crea automáticamente los elementos base
       si todavía no existen.
    */

    elementosBase.forEach(elemento => {
        if (!inventario.some(i => i.elemento === elemento)) {
            inventario.push({
                id: generarId("INV"),
                elemento,
                stock: 0,
                minimo: 5,
                movimientos: []
            });
        }
    });

    guardar(STORAGE.inventario, inventario);
}

function modificarStock(elemento, cantidad, motivo = "Movimiento") {
    let item = inventario.find(i => i.elemento === elemento);

    if (!item) {
        item = {
            id: generarId("INV"),
            elemento,
            stock: 0,
            minimo: 5,
            movimientos: []
        };

        inventario.push(item);
    }

    item.stock = Math.max(
        0,
        Number(item.stock || 0) + Number(cantidad)
    );

    if (!item.movimientos) {
        item.movimientos = [];
    }

    item.movimientos.unshift({
        id: generarId("MOV"),
        fecha: fechaActual(),
        cantidad,
        motivo,
        saldo: item.stock
    });

    guardar(STORAGE.inventario, inventario);
}

/* =========================================================
   PANEL DE INVENTARIO
   ========================================================= */

function crearPanelInventario() {
    const seccion = document.getElementById("seccion-dotacion");

    if (!seccion) return;

    if (document.getElementById("panelInventario")) return;

    const panel = document.createElement("div");

    panel.id = "panelInventario";
    panel.className = "panel-tabla";

    panel.innerHTML = `
        <div class="panel-tabla-header">
            <div>
                <span class="etiqueta-seccion">ALMACÉN</span>
                <h3>Inventario de dotación</h3>
                <p>Consulta existencias y registra entradas al inventario.</p>
            </div>

            <button id="btnEntradaInventario" class="btn-principal">
                + Entrada de inventario
            </button>
        </div>

        <div class="resumen-dotacion inventario-resumen">
            <div>
                <span>📦</span>
                <div>
                    <strong id="totalProductosInventario">0</strong>
                    <small>Elementos</small>
                </div>
            </div>

            <div>
                <span>🟢</span>
                <div>
                    <strong id="totalUnidadesInventario">0</strong>
                    <small>Unidades disponibles</small>
                </div>
            </div>

            <div>
                <span>⚠️</span>
                <div>
                    <strong id="totalBajoInventario">0</strong>
                    <small>Stock bajo</small>
                </div>
            </div>
        </div>

        <div class="tabla-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Elemento</th>
                        <th>Stock actual</th>
                        <th>Stock mínimo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody id="tablaInventarioBody"></tbody>
            </table>
        </div>
    `;

    seccion.appendChild(panel);

    document.getElementById("btnEntradaInventario")
        ?.addEventListener("click", abrirEntradaInventario);

    renderInventario();
}

function renderInventario() {
    const body = document.getElementById("tablaInventarioBody");

    if (!body) return;

    body.innerHTML = "";

    inventario.forEach(item => {
        const stock = Number(item.stock || 0);
        const minimo = Number(item.minimo || 0);

        let estado = "Disponible";
        let clase = "entregado";

        if (stock === 0) {
            estado = "Agotado";
            clase = "pendiente";
        } else if (stock <= minimo) {
            estado = "Stock bajo";
            clase = "pendiente";
        }

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <strong>${escapeHTML(item.elemento)}</strong>
            </td>

            <td>
                <strong>${stock}</strong>
            </td>

            <td>
                ${minimo}
            </td>

            <td>
                <span class="estado ${clase}">
                    ${estado}
                </span>
            </td>

            <td>
                <button 
                    class="btn-tabla entrada-inventario"
                    data-id="${item.id}"
                    title="Agregar inventario"
                >
                    ➕
                </button>

                <button 
                    class="btn-tabla ajustar-minimo"
                    data-id="${item.id}"
                    title="Cambiar stock mínimo"
                >
                    ⚙️
                </button>
            </td>
        `;

        body.appendChild(tr);
    });

    document.querySelectorAll(".entrada-inventario").forEach(btn => {
        btn.addEventListener("click", () => {
            const item = inventario.find(i => i.id === btn.dataset.id);

            if (item) {
                abrirEntradaInventario(item.elemento);
            }
        });
    });

    document.querySelectorAll(".ajustar-minimo").forEach(btn => {
        btn.addEventListener("click", () => {
            cambiarStockMinimo(btn.dataset.id);
        });
    });

    const totalProductos = document.getElementById("totalProductosInventario");
    const totalUnidades = document.getElementById("totalUnidadesInventario");
    const totalBajo = document.getElementById("totalBajoInventario");

    if (totalProductos) {
        totalProductos.textContent = inventario.length;
    }

    if (totalUnidades) {
        totalUnidades.textContent = inventario.reduce(
            (total, item) => total + Number(item.stock || 0),
            0
        );
    }

    if (totalBajo) {
        totalBajo.textContent = inventario.filter(
            item => Number(item.stock || 0) <= Number(item.minimo || 0)
        ).length;
    }
}

function abrirEntradaInventario(elementoSeleccionado = "") {
    const opciones = inventario
        .map(item => `
            <option value="${escapeHTML(item.elemento)}"
                ${item.elemento === elementoSeleccionado ? "selected" : ""}>
                ${escapeHTML(item.elemento)}
            </option>
        `)
        .join("");

    const elemento = prompt(
        `Selecciona o escribe el elemento:\n\n` +
        inventario.map(i => `• ${i.elemento}`).join("\n")
    );

    if (!elemento) return;

    const item = inventario.find(
        i => i.elemento.toLowerCase() === elemento.trim().toLowerCase()
    );

    if (!item) {
        alert("Ese elemento no existe en el inventario.");
        return;
    }

    const cantidad = Number(
        prompt(`¿Cuántas unidades deseas agregar de "${item.elemento}"?`, "1")
    );

    if (!cantidad || cantidad < 1) return;

    modificarStock(
        item.elemento,
        cantidad,
        "Entrada de inventario"
    );

    agregarHistorial(
        "Entrada de inventario",
        `${cantidad} unidades de ${item.elemento}.`
    );

    renderInventario();
    actualizarTodo();
}

function cambiarStockMinimo(id) {
    const item = inventario.find(i => i.id === id);

    if (!item) return;

    const nuevoMinimo = Number(
        prompt(
            `Stock mínimo para ${item.elemento}:`,
            item.minimo
        )
    );

    if (isNaN(nuevoMinimo) || nuevoMinimo < 0) return;

    item.minimo = nuevoMinimo;

    guardar(STORAGE.inventario, inventario);

    renderInventario();
}

/* =========================================================
   RESUMEN DOTACIÓN
   ========================================================= */

function actualizarResumenDotacion() {
    const total = document.getElementById("resumenTotalDotacion");
    const entregadas = document.getElementById("resumenEntregadas");
    const pendientes = document.getElementById("resumenPendientes");

    if (total) {
        total.textContent = entregas.length;
    }

    if (entregadas) {
        entregadas.textContent =
            entregas.filter(e => e.estado === "Entregado").length;
    }

    if (pendientes) {
        pendientes.textContent =
            entregas.filter(e => e.estado === "Pendiente").length;
    }

    const totalEntregas = document.getElementById("totalEntregas");

    if (totalEntregas) {
        totalEntregas.textContent = entregas.length;
    }

    const totalPendientes = document.getElementById("totalPendientes");

    if (totalPendientes) {
        totalPendientes.textContent =
            entregas.filter(e => e.estado === "Pendiente").length;
    }

    const mesActual = new Date().toISOString().substring(0, 7);

    const totalMes = document.getElementById("totalMes");

    if (totalMes) {
        totalMes.textContent =
            entregas.filter(e => e.fecha?.startsWith(mesActual)).length;
    }
}

/* =========================================================
   HISTORIAL
   ========================================================= */

function renderHistorial() {
    const body = document.getElementById("tablaHistorialBody");

    if (!body) return;

    body.innerHTML = "";

    historial.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${formatearFecha(item.fecha)}</td>
            <td>
                <strong>${escapeHTML(item.accion)}</strong>
            </td>
            <td>${escapeHTML(item.detalle)}</td>
        `;

        body.appendChild(tr);
    });
}

/* =========================================================
   REPORTES
   ========================================================= */

function obtenerEntregasFiltradas() {
    const texto = (
        document.getElementById("reporteBuscar")?.value || ""
    ).toLowerCase();

    const estado =
        document.getElementById("reporteEstado")?.value || "";

    const desde =
        document.getElementById("reporteFechaInicio")?.value || "";

    const hasta =
        document.getElementById("reporteFechaFin")?.value || "";

    return entregas.filter(e => {
        const coincideTexto =
            `${e.empleadoNombre} ${e.elemento} ${e.centroCosto} ${e.talla}`
                .toLowerCase()
                .includes(texto);

        const coincideEstado =
            !estado || e.estado === estado;

        const coincideDesde =
            !desde || e.fecha >= desde;

        const coincideHasta =
            !hasta || e.fecha <= hasta;

        return (
            coincideTexto &&
            coincideEstado &&
            coincideDesde &&
            coincideHasta
        );
    });
}

function renderReportes() {
    const body = document.getElementById("tablaReporteBody");

    if (!body) return;

    const datos = obtenerEntregasFiltradas();

    body.innerHTML = "";

    datos.forEach(e => {
        const empleado = obtenerEmpleado(e.empleadoId);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${formatearFecha(e.fecha)}</td>
            <td>${escapeHTML(e.empleadoNombre)}</td>
            <td>${escapeHTML(empleado?.codigo || "-")}</td>
            <td>${escapeHTML(e.elemento)}</td>
            <td>${escapeHTML(e.talla || "-")}</td>
            <td>${e.cantidad}</td>
            <td>${escapeHTML(e.centroCosto)}</td>
            <td>${escapeHTML(e.estado)}</td>
            <td>
                ${e.evidencia
                    ? `<a href="${e.evidencia}" target="_blank">📷 Ver</a>`
                    : "-"
                }
            </td>
        `;

        body.appendChild(tr);
    });

    const total = document.getElementById("reporteTotalEntregas");
    const entregadas = document.getElementById("reporteEntregadas");
    const pendientes = document.getElementById("reportePendientes");
    const totalEmpleados = document.getElementById("reporteEmpleados");

    if (total) total.textContent = datos.length;

    if (entregadas) {
        entregadas.textContent =
            datos.filter(e => e.estado === "Entregado").length;
    }

    if (pendientes) {
        pendientes.textContent =
            datos.filter(e => e.estado === "Pendiente").length;
    }

    if (totalEmpleados) {
        totalEmpleados.textContent =
            new Set(datos.map(e => e.empleadoId)).size;
    }
}

function iniciarReportes() {
    document.getElementById("actualizarReporte")
        ?.addEventListener("click", renderReportes);

    document.getElementById("limpiarReporte")
        ?.addEventListener("click", () => {
            document.getElementById("reporteBuscar").value = "";
            document.getElementById("reporteEstado").value = "";
            document.getElementById("reporteFechaInicio").value = "";
            document.getElementById("reporteFechaFin").value = "";

            renderReportes();
        });

    document.getElementById("descargarReporte")
        ?.addEventListener("click", descargarCSV);

    document.getElementById("imprimirReporte")
        ?.addEventListener("click", () => {
            window.print();
        });
}

function descargarCSV() {
    const datos = obtenerEntregasFiltradas();

    if (!datos.length) {
        alert("No hay datos para descargar.");
        return;
    }

    const encabezados = [
        "Fecha",
        "Empleado",
        "Código",
        "Elemento",
        "Talla",
        "Cantidad",
        "Centro de costo",
        "Estado",
        "Observaciones"
    ];

    const filas = datos.map(e => {
        const empleado = obtenerEmpleado(e.empleadoId);

        return [
            e.fecha,
            e.empleadoNombre,
            empleado?.codigo || "",
            e.elemento,
            e.talla || "",
            e.cantidad,
            e.centroCosto,
            e.estado,
            e.observaciones || ""
        ];
    });

    const csv = [
        encabezados,
        ...filas
    ]
        .map(fila =>
            fila.map(valor =>
                `"${String(valor).replace(/"/g, '""')}"`
            ).join(",")
        )
        .join("\n");

    const blob = new Blob(
        ["\ufeff" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = `reporte-dotacion-${fechaActual()}.csv`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);
}

/* =========================================================
   BÚSQUEDA GLOBAL
   ========================================================= */

function iniciarBusquedaGlobal() {
    const input = document.getElementById("buscarGlobal");
    const resultados = document.getElementById("resultadosBusquedaRapida");
    const boton = document.getElementById("btnBuscarGlobal");

    function buscar() {
        const texto = input.value.trim().toLowerCase();

        if (!texto) {
            resultados.classList.add("oculto");
            resultados.innerHTML = "";
            return;
        }

        const empleadosEncontrados = empleados.filter(e =>
            `${e.nombre} ${e.codigo} ${e.documento}`
                .toLowerCase()
                .includes(texto)
        );

        const entregasEncontradas = entregas.filter(e =>
            `${e.empleadoNombre} ${e.elemento} ${e.centroCosto}`
                .toLowerCase()
                .includes(texto)
        );

        const inventarioEncontrado = inventario.filter(i =>
            i.elemento.toLowerCase().includes(texto)
        );

        let html = "";

        empleadosEncontrados.slice(0, 5).forEach(e => {
            html += `
                <div class="resultado-busqueda" data-seccion="seccion-empleados">
                    👤 <strong>${escapeHTML(e.nombre)}</strong>
                    <small>${escapeHTML(e.codigo)}</small>
                </div>
            `;
        });

        entregasEncontradas.slice(0, 5).forEach(e => {
            html += `
                <div class="resultado-busqueda" data-seccion="seccion-dotacion">
                    📦 <strong>${escapeHTML(e.elemento)}</strong>
                    <small>${escapeHTML(e.empleadoNombre)}</small>
                </div>
            `;
        });

        inventarioEncontrado.slice(0, 5).forEach(i => {
            html += `
                <div class="resultado-busqueda" data-seccion="seccion-dotacion">
                    📋 <strong>${escapeHTML(i.elemento)}</strong>
                    <small>Stock: ${i.stock}</small>
                </div>
            `;
        });

        if (!html) {
            html = `<div class="resultado-busqueda">Sin resultados.</div>`;
        }

        resultados.innerHTML = html;
        resultados.classList.remove("oculto");

        resultados.querySelectorAll("[data-seccion]").forEach(item => {
            item.addEventListener("click", () => {
                mostrarSeccion(item.dataset.seccion);
                resultados.classList.add("oculto");
            });
        });
    }

    input?.addEventListener("input", buscar);
    boton?.addEventListener("click", buscar);
}

/* =========================================================
   NOTIFICACIONES
   ========================================================= */

function iniciarNotificaciones() {
    const boton = document.getElementById("notificacionesBtn");
    const panel = document.getElementById("panelNotificaciones");
    const cerrar = document.getElementById("cerrarNotificaciones");

    boton?.addEventListener("click", () => {
        panel.classList.toggle("oculto");
        renderNotificaciones();
    });

    cerrar?.addEventListener("click", () => {
        panel.classList.add("oculto");
    });

    renderNotificaciones();
}

function renderNotificaciones() {
    const contenido = document.getElementById("contenidoNotificaciones");
    const contador = document.getElementById("contadorNotificaciones");

    if (!contenido) return;

    const bajo = inventario.filter(
        item => Number(item.stock || 0) <= Number(item.minimo || 0)
    );

    const pendientes = entregas.filter(
        e => e.estado === "Pendiente"
    );

    const total = bajo.length + pendientes.length;

    if (contador) {
        contador.textContent = total;
    }

    if (!total) {
        contenido.innerHTML = `
            <div class="notificacion-vacia">
                No hay notificaciones.
            </div>
        `;
        return;
    }

    let html = "";

    bajo.forEach(item => {
        html += `
            <div class="notificacion-item">
                ⚠️
                <div>
                    <strong>Stock bajo</strong>
                    <p>${escapeHTML(item.elemento)}: ${item.stock} unidades.</p>
                </div>
            </div>
        `;
    });

    pendientes.forEach(e => {
        html += `
            <div class="notificacion-item">
                🟡
                <div>
                    <strong>Entrega pendiente</strong>
                    <p>${escapeHTML(e.empleadoNombre)} - ${escapeHTML(e.elemento)}</p>
                </div>
            </div>
        `;
    });

    contenido.innerHTML = html;
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function cargarDashboard() {
    renderEmpleados();
    renderDotacion();
    renderHistorial();
    renderReportes();
    renderNotificaciones();
    actualizarResumenDotacion();
    actualizarTodo();
}

function actualizarTodo() {
    renderEmpleados();
    renderDotacion();
    renderInventario();
    renderHistorial();
    renderReportes();
    renderNotificaciones();
    actualizarResumenDotacion();
    cargarEmpleadosSelect();
    actualizarGraficas();
}

/* =========================================================
   GRÁFICAS
   ========================================================= */

function actualizarGraficas() {
    const canvasMes = document.getElementById("graficoEntregasMes");

    if (canvasMes) {
        const ctx = canvasMes.getContext("2d");

        const meses = [];

        for (let i = 5; i >= 0; i--) {
            const fecha = new Date();

            fecha.setMonth(fecha.getMonth() - i);

            const mes = String(fecha.getMonth() + 1).padStart(2, "0");
            const año = fecha.getFullYear();

            meses.push(`${año}-${mes}`);
        }

        const valores = meses.map(mes =>
            entregas.filter(e => e.fecha?.startsWith(mes)).length
        );

        ctx.clearRect(
            0,
            0,
            canvasMes.width,
            canvasMes.height
        );

        const ancho = canvasMes.width;
        const alto = canvasMes.height;

        const max = Math.max(...valores, 1);

        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 3;

        ctx.beginPath();

        valores.forEach((valor, index) => {
            const x =
                30 +
                index *
                ((ancho - 60) / Math.max(valores.length - 1, 1));

            const y =
                alto -
                30 -
                (valor / max) * (alto - 60);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            ctx.fillStyle = "#2563eb";
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
        });

        ctx.stroke();
    }
}

/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    inicializarInventario();

    iniciarLogin();
    iniciarNavegacion();
    iniciarEmpleados();
    iniciarEntregas();
    iniciarReportes();
    iniciarBusquedaGlobal();
    iniciarNotificaciones();

    crearPanelInventario();

    cargarDashboard();

    /* Botones que cambian a una sección */
    document.querySelectorAll("[data-seccion]").forEach(boton => {
        boton.addEventListener("click", () => {
            const sidebar = document.querySelector(".sidebar");

            sidebar?.classList.remove("abierta");
        });
    });
});