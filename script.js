"use strict";

/* =========================================================
   CONTROL-DOTACIÓN | VERSIÓN UNIFICADA - SUPABASE
   ========================================================= */

// CONFIGURACIÓN SUPABASE
const SUPABASE_URL = "https://zqnjhqchnzqailpqlfvb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_UteEe99FemnxY2udwsXUkw_nE61X1r7";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// CONFIGURACIÓN GENERAL
const STORAGE = { sesion: "controlDotacion_sesion" };
const STOCK_MINIMO = 5;

let empleados = [];
let entregas = [];
let inventario = [];
let historial = [];

let empleadoEditando = null;
let entregaEditando = null;
let cargandoDatos = false;

/* =========================================================
   UTILIDADES
   ========================================================= */

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
    const texto = String(fecha);

    if (texto.includes("T")) {
        const date = new Date(texto);
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString("es-CO");
        }
    }

    const partes = texto.substring(0, 10).split("-");
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return texto;
}

function obtenerEmpleado(id) {
    return empleados.find(empleado => Number(empleado.id) === Number(id));
}

function obtenerNombreEmpleado(id) {
    const empleado = obtenerEmpleado(id);
    return empleado?.nombre || "Empleado no encontrado";
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

function agregarHistorial(accion, detalle) {
    historial.unshift({
        fecha: new Date().toISOString(),
        accion,
        detalle
    });
    historial = historial.slice(0, 100);
    renderHistorial();
}

/* =========================================================
   CARGAR DATOS DESDE SUPABASE
   ========================================================= */

async function cargarDatosSupabase() {
    if (cargandoDatos) return false;
    cargandoDatos = true;

    try {
        const [empleadosResult, inventarioResult, entregasResult] = await Promise.all([
            supabaseClient.from("empleados").select("*").order("id", { ascending: true }),
            supabaseClient.from("inventario").select("*").order("id", { ascending: true }),
            supabaseClient.from("entregas").select("*").order("fecha", { ascending: false })
        ]);

        if (empleadosResult.error) throw empleadosResult.error;
        if (inventarioResult.error) throw inventarioResult.error;
        if (entregasResult.error) throw entregasResult.error;

        empleados = empleadosResult.data || [];
        inventario = inventarioResult.data || [];
        entregas = entregasResult.data || [];

        console.log("Datos cargados desde Supabase", {
            empleados: empleados.length,
            inventario: inventario.length,
            entregas: entregas.length
        });

        return true;
    } catch (error) {
        console.error("Error cargando Supabase:", error);
        mostrarMensaje("Error cargando datos: " + (error.message || error), "error");
        return false;
    } finally {
        cargandoDatos = false;
    }
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

    if (!pantallaLogin || !dashboard) return;

    if (localStorage.getItem(STORAGE.sesion) === "true") {
        pantallaLogin.classList.add("oculto");
        dashboard.classList.remove("oculto");
    }

    loginForm?.addEventListener("submit", async function (e) {
        e.preventDefault();
        const usuario = document.getElementById("usuario")?.value.trim();
        const clave = document.getElementById("password")?.value || "";

        if (!usuario || !clave) {
            mostrarMensaje("Ingresa usuario y contraseña.", "error");
            return;
        }

        localStorage.setItem(STORAGE.sesion, "true");
        pantallaLogin.classList.add("oculto");
        dashboard.classList.remove("oculto");

        await cargarDashboard();
    });

    mostrarPassword?.addEventListener("click", function () {
        if (!password) return;
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
        if (password) password.value = "";
    });
}

/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function iniciarNavegacion() {
    document.querySelectorAll("[data-seccion]").forEach(boton => {
        boton.addEventListener("click", function () {
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
    if (seccion) seccion.classList.add("activa");

    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.toggle("activo", item.dataset.seccion === id);
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
    if (titulo) titulo.textContent = titulos[id] || "Control-Dotación";

    if (id === "seccion-empleados") renderEmpleados();
    if (id === "seccion-dotacion") {
        renderDotacion();
        renderInventario();
    }
    if (id === "seccion-historial") renderHistorial();
    if (id === "seccion-reportes") renderReportes();
}

/* =========================================================
   EMPLEADOS
   ========================================================= */

function iniciarEmpleados() {
    document.getElementById("nuevoEmpleado")?.addEventListener("click", () => abrirModalEmpleado());
    document.getElementById("cerrarModalEmpleado")?.addEventListener("click", cerrarModalEmpleado);
    document.getElementById("cancelarEmpleado")?.addEventListener("click", cerrarModalEmpleado);
    document.getElementById("formEmpleado")?.addEventListener("submit", guardarEmpleado);
    document.getElementById("buscarEmpleado")?.addEventListener("input", renderEmpleados);
    document.getElementById("agregarTalla")?.addEventListener("click", agregarTallaExtra);
    document.getElementById("empleadoFoto")?.addEventListener("change", vistaPreviaFoto);
}

function abrirModalEmpleado(id = null) {
    const modal = document.getElementById("modalEmpleado");
    const form = document.getElementById("formEmpleado");

    if (!modal || !form) return;

    empleadoEditando = id;
    form.reset();

    const idInput = document.getElementById("empleadoId");
    if (idInput) idInput.value = id || "";

    const listaTallas = document.getElementById("listaTallas");
    if (listaTallas) listaTallas.innerHTML = "";

    const vistaFoto = document.getElementById("vistaFotoEmpleado");

    if (id) {
        const empleado = obtenerEmpleado(id);
        if (!empleado) return;

        document.getElementById("tituloModalEmpleado")?.replaceChildren(document.createTextNode("Editar empleado"));
        
        const setVal = (elemId, val) => {
            const el = document.getElementById(elemId);
            if (el) el.value = val || "";
        };

        setVal("empleadoDocumento", empleado.cedula);
        setVal("empleadoNombre", empleado.nombre);
        setVal("empleadoCargo", empleado.cargo);
        setVal("empleadoTalla", empleado.talla_camiseta);
        setVal("empleadoTallaPantalon", empleado.talla_pantalon);
        setVal("empleadoCodigo", "");
        setVal("empleadoArea", "");
        setVal("empleadoEstado", "Activo");
        setVal("empleadoTallaCalzado", "");

        if (vistaFoto) vistaFoto.textContent = "👤";
    } else {
        document.getElementById("tituloModalEmpleado")?.replaceChildren(document.createTextNode("Nuevo empleado"));
        if (vistaFoto) vistaFoto.textContent = "👤";
    }

    modal.classList.remove("oculto");
}

function cerrarModalEmpleado() {
    document.getElementById("modalEmpleado")?.classList.add("oculto");
    empleadoEditando = null;
}

function vistaPreviaFoto(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function (event) {
        const vista = document.getElementById("vistaFotoEmpleado");
        if (vista) {
            vista.innerHTML = `<img src="${event.target.result}" alt="Foto">`;
        }
    };
    lector.readAsDataURL(archivo);
}

function agregarTallaExtra() {
    const lista = document.getElementById("listaTallas");
    if (!lista) return;

    const fila = document.createElement("div");
    fila.className = "fila-talla-extra";
    fila.innerHTML = `
        <input type="text" class="talla-extra-nombre" placeholder="Ej. Chaqueta">
        <input type="text" class="talla-extra-valor" placeholder="Talla">
        <button type="button" class="btn-eliminar-talla">×</button>
    `;

    fila.querySelector(".btn-eliminar-talla")?.addEventListener("click", () => fila.remove());
    lista.appendChild(fila);
}

async function guardarEmpleado(e) {
    e.preventDefault();

    const cedula = document.getElementById("empleadoDocumento")?.value.trim() || "";
    const nombre = document.getElementById("empleadoNombre")?.value.trim() || "";
    const cargo = document.getElementById("empleadoCargo")?.value.trim() || "";
    const tallaCamiseta = document.getElementById("empleadoTalla")?.value.trim() || null;
    const tallaPantalon = document.getElementById("empleadoTallaPantalon")?.value.trim() || null;

    if (!cedula || !nombre || !cargo) {
        alert("Completa los campos obligatorios.");
        return;
    }

    const datos = { nombre, cedula, cargo, talla_camiseta: tallaCamiseta, talla_pantalon: tallaPantalon };
    let resultado;

    if (empleadoEditando) {
        resultado = await supabaseClient.from("empleados").update(datos).eq("id", empleadoEditando).select();
    } else {
        resultado = await supabaseClient.from("empleados").insert([datos]).select();
    }

    if (resultado.error) {
        console.error(resultado.error);
        alert("Error al guardar el empleado:\n\n" + resultado.error.message);
        return;
    }

    agregarHistorial(
        empleadoEditando ? "Empleado actualizado" : "Empleado creado",
        `${nombre} - ${cedula}`
    );

    alert(empleadoEditando ? "Empleado actualizado correctamente." : "Empleado guardado correctamente.");

    cerrarModalEmpleado();
    await cargarDatosSupabase();
    renderEmpleados();
    cargarEmpleadosSelect();
    actualizarResumenDotacion();
}

function renderEmpleados() {
    const body = document.getElementById("tablaEmpleadosBody");
    if (!body) return;

    const texto = document.getElementById("buscarEmpleado")?.value.trim().toLowerCase() || "";
    const lista = empleados.filter(empleado => {
        if (!texto) return true;
        return `${empleado.nombre || ""} ${empleado.cedula || ""} ${empleado.cargo || ""}`
            .toLowerCase()
            .includes(texto);
    });

    body.innerHTML = "";

    lista.forEach(empleado => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${escapeHTML(empleado.cedula || "")}</td>
            <td>${escapeHTML(empleado.nombre || "")}</td>
            <td>${escapeHTML(empleado.cargo || "")}</td>
            <td>${escapeHTML(empleado.talla_camiseta || "-")}</td>
            <td>${escapeHTML(empleado.talla_pantalon || "-")}</td>
            <td>
                <button type="button" class="btn-tabla btn-editar-empleado" data-id="${empleado.id}">✏️</button>
                <button type="button" class="btn-tabla btn-eliminar-empleado" data-id="${empleado.id}">🗑️</button>
            </td>
        `;
        body.appendChild(tr);
    });

    body.querySelectorAll(".btn-editar-empleado").forEach(boton => {
        boton.addEventListener("click", () => abrirModalEmpleado(boton.dataset.id));
    });

    body.querySelectorAll(".btn-eliminar-empleado").forEach(boton => {
        boton.addEventListener("click", () => eliminarEmpleado(boton.dataset.id));
    });
}

async function eliminarEmpleado(id) {
    const empleado = obtenerEmpleado(id);
    if (!empleado) return;

    const tieneEntregas = entregas.some(entrega => Number(entrega.empleado) === Number(id));
    if (tieneEntregas) {
        alert("No puedes eliminar este empleado porque tiene entregas registradas.");
        return;
    }

    if (!confirm(`¿Eliminar a ${empleado.nombre}?`)) return;

    const { error } = await supabaseClient.from("empleados").delete().eq("id", id);

    if (error) {
        console.error(error);
        alert("No se pudo eliminar el empleado:\n\n" + error.message);
        return;
    }

    agregarHistorial("Empleado eliminado", empleado.nombre);
    await cargarDatosSupabase();
    renderEmpleados();
    cargarEmpleadosSelect();
}

/* =========================================================
   ENTREGAS
   ========================================================= */

function iniciarEntregas() {
    document.getElementById("nuevaEntrega")?.addEventListener("click", () => abrirModalEntrega());
    document.getElementById("cerrarModalEntrega")?.addEventListener("click", cerrarModalEntrega);
    document.getElementById("cancelarEntrega")?.addEventListener("click", cerrarModalEntrega);
    document.getElementById("formEntrega")?.addEventListener("submit", guardarEntrega);
    document.getElementById("buscarEntrega")?.addEventListener("input", renderDotacion);
    document.getElementById("entregaEmpleado")?.addEventListener("change", actualizarTallasEntrega);
    document.getElementById("entregaElemento")?.addEventListener("change", actualizarStockDisponible);
}

function cargarEmpleadosSelect() {
    const select = document.getElementById("entregaEmpleado");
    if (!select) return;

    const valorActual = select.value;
    select.innerHTML = `<option value="">Seleccionar empleado</option>`;

    empleados.forEach(empleado => {
        const option = document.createElement("option");
        option.value = empleado.id;
        option.textContent = `${empleado.nombre || ""} - ${empleado.cedula || ""}`;
        select.appendChild(option);
    });

    if (valorActual) select.value = valorActual;
}

function cargarElementosSelect() {
    const select = document.getElementById("entregaElemento");
    if (!select) return;

    const valorActual = select.value;
    select.innerHTML = `<option value="">Seleccionar elemento</option>`;

    inventario.forEach(item => {
        const option = document.createElement("option");
        option.value = item.elemento || "";
        option.textContent = `${item.elemento || ""}${item.talla ? ` - ${item.talla}` : ""} - Stock: ${Number(item.stock || 0)}`;
        select.appendChild(option);
    });

    if (valorActual) select.value = valorActual;
}

function abrirModalEntrega(id = null) {
    const modal = document.getElementById("modalEntrega");
    const form = document.getElementById("formEntrega");

    if (!modal || !form) return;

    entregaEditando = id;
    form.reset();

    cargarEmpleadosSelect();
    cargarElementosSelect();

    const fecha = document.getElementById("entregaFecha");
    if (fecha) fecha.value = fechaActual();

    const titulo = document.getElementById("tituloModalEntrega");
    if (titulo) titulo.textContent = id ? "Editar entrega" : "Nueva entrega";

    if (id) {
        const entrega = entregas.find(item => Number(item.id) === Number(id));
        if (!entrega) return;

        const setVal = (elemId, val) => {
            const el = document.getElementById(elemId);
            if (el) el.value = val;
        };

        setVal("entregaEmpleado", entrega.empleado || "");
        setVal("entregaElemento", entrega.elemento || "");
        setVal("entregaCantidad", entrega.cantidades || 1);
        setVal("entregaComentarios", entrega.comentarios || "");
        setVal("entregaFecha", String(entrega.fecha || "").substring(0, 10));
    }

    actualizarTallasEntrega();
    actualizarStockDisponible();
    modal.classList.remove("oculto");
}

function cerrarModalEntrega() {
    document.getElementById("modalEntrega")?.classList.add("oculto");
    entregaEditando = null;
}

function obtenerRegistroInventario(elemento) {
    return inventario.find(item => 
        String(item.elemento || "").trim().toLowerCase() === String(elemento || "").trim().toLowerCase()
    );
}

function obtenerStock(elemento) {
    const registro = obtenerRegistroInventario(elemento);
    return registro ? Number(registro.stock || 0) : 0;
}

function actualizarStockDisponible() {
    const elemento = document.getElementById("entregaElemento")?.value || "";
    const stock = obtenerStock(elemento);

    ["stockDisponible", "entregaStockDisponible", "stockEntrega"].forEach(id => {
        const elementoHTML = document.getElementById(id);
        if (elementoHTML) elementoHTML.textContent = stock;
    });
}

function actualizarTallasEntrega() {
    const empleadoId = document.getElementById("entregaEmpleado")?.value;
    const empleado = obtenerEmpleado(empleadoId);
    const texto = empleado ? `Camiseta: ${empleado.talla_camiseta || "-"} | Pantalón: ${empleado.talla_pantalon || "-"}` : "";

    ["entregaTalla", "tallaEntrega", "entregaTallas"].forEach(id => {
        const elementoHTML = document.getElementById(id);
        if (elementoHTML) elementoHTML.textContent = texto;
    });
}

async function guardarEntrega(e) {
    e.preventDefault();

    const empleadoId = Number(document.getElementById("entregaEmpleado")?.value || 0);
    const elemento = document.getElementById("entregaElemento")?.value.trim() || "";
    const cantidad = Number(document.getElementById("entregaCantidad")?.value || 0);
    const comentarios = document.getElementById("entregaComentarios")?.value.trim() || "";
    const fecha = document.getElementById("entregaFecha")?.value || fechaActual();

    if (!empleadoId || !elemento || cantidad < 1) {
        alert("Completa los datos obligatorios de la entrega.");
        return;
    }

    const item = obtenerRegistroInventario(elemento);
    if (!item) {
        alert("El elemento seleccionado no existe en el inventario.");
        return;
    }

    if (!entregaEditando) {
        // NUEVA ENTREGA
        const stockActual = Number(item.stock || 0);
        if (cantidad > stockActual) {
            alert(`Stock insuficiente.\n\nDisponible: ${stockActual}\nSolicitado: ${cantidad}`);
            return;
        }

        const datos = {
            empleado: empleadoId,
            elemento: elemento,
            cantidades: cantidad,
            fecha: fecha,
            comentarios: comentarios || null
        };

        const { error } = await supabaseClient.from("entregas").insert([datos]);
        if (error) {
            console.error(error);
            alert("Error al registrar la entrega:\n\n" + error.message);
            return;
        }

        const nuevoStock = Math.max(0, stockActual - cantidad);
        const { error: errorStock } = await supabaseClient
            .from("inventario")
            .update({ stock: nuevoStock })
            .eq("id", item.id);

        if (errorStock) {
            console.error(errorStock);
            alert("La entrega fue guardada, pero ocurrió un error al actualizar el stock:\n\n" + errorStock.message);
        } else {
            alert("¡Entrega registrada correctamente!");
        }

        agregarHistorial("Entrega registrada", `${cantidad} x ${elemento} para ${obtenerNombreEmpleado(empleadoId)}`);
    } else {
        // EDITAR ENTREGA
        const entregaAnterior = entregas.find(entrega => Number(entrega.id) === Number(entregaEditando));
        if (!entregaAnterior) {
            alert("No se encontró la entrega que deseas editar.");
            return;
        }

        const itemAnterior = obtenerRegistroInventario(entregaAnterior.elemento);
        if (!itemAnterior) {
            alert("No se encontró el elemento anterior en inventario.");
            return;
        }

        const stockActual = Number(item.stock || 0);
        const stockTrasDevolverAnterior = stockActual + Number(entregaAnterior.cantidades || 0);

        if (cantidad > stockTrasDevolverAnterior) {
            alert(`Stock insuficiente para modificar la entrega.\n\nDisponible real: ${stockTrasDevolverAnterior}\nSolicitado: ${cantidad}`);
            return;
        }

        if (Number(itemAnterior.id) !== Number(item.id)) {
            const { error: devolverError } = await supabaseClient
                .from("inventario")
                .update({ stock: Number(itemAnterior.stock || 0) + Number(entregaAnterior.cantidades || 0) })
                .eq("id", itemAnterior.id);

            if (devolverError) {
                alert("No se pudo devolver el stock de la entrega anterior:\n\n" + devolverError.message);
                return;
            }

            await cargarDatosSupabase();
            const itemNuevo = obtenerRegistroInventario(elemento);

            if (!itemNuevo || cantidad > Number(itemNuevo.stock || 0)) {
                alert("No hay suficiente stock del nuevo elemento.");
                return;
            }

            const { error: descontarError } = await supabaseClient
                .from("inventario")
                .update({ stock: Number(itemNuevo.stock || 0) - cantidad })
                .eq("id", itemNuevo.id);

            if (descontarError) {
                alert("No se pudo descontar el stock del nuevo elemento:\n\n" + descontarError.message);
                return;
            }
        } else {
            const nuevoStock = stockTrasDevolverAnterior - cantidad;
            const { error: stockError } = await supabaseClient
                .from("inventario")
                .update({ stock: nuevoStock })
                .eq("id", item.id);

            if (stockError) {
                alert("No se pudo actualizar el stock:\n\n" + stockError.message);
                return;
            }
        }

        const datosActualizados = {
            empleado: empleadoId,
            elemento: elemento,
            cantidades: cantidad,
            fecha: fecha,
            comentarios: comentarios || null
        };

        const { error: errorEntrega } = await supabaseClient
            .from("entregas")
            .update(datosActualizados)
            .eq("id", entregaEditando);

        if (errorEntrega) {
            alert("No se pudo actualizar la entrega:\n\n" + errorEntrega.message);
            return;
        }

        alert("Entrega actualizada correctamente.");
        agregarHistorial("Entrega actualizada", `${cantidad} x ${elemento} para ${obtenerNombreEmpleado(empleadoId)}`);
    }

    cerrarModalEntrega();
    await actualizarTodo();
}

function renderEntregas() {
    const body = document.getElementById("tablaEntregasBody");
    if (!body) return;

    const texto = document.getElementById("buscarEntrega")?.value.trim().toLowerCase() || "";
    let lista = entregas;

    if (texto) {
        lista = entregas.filter(entrega => {
            const nombre = obtenerNombreEmpleado(entrega.empleado);
            return `${nombre} ${entrega.elemento || ""} ${entrega.comentarios || ""} ${entrega.cantidades || ""}`
                .toLowerCase()
                .includes(texto);
        });
    }

    body.innerHTML = "";

    lista.forEach(entrega => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${escapeHTML(obtenerNombreEmpleado(entrega.empleado))}</td>
            <td>${escapeHTML(entrega.elemento || "")}</td>
            <td>${Number(entrega.cantidades || 0)}</td>
            <td>${formatearFecha(entrega.fecha)}</td>
            <td>${escapeHTML(entrega.comentarios || "-")}</td>
            <td>
                <button type="button" class="btn-tabla btn-editar-entrega" data-id="${entrega.id}">✏️</button>
            </td>
        `;
        body.appendChild(tr);
    });

    body.querySelectorAll(".btn-editar-entrega").forEach(boton => {
        boton.addEventListener("click", () => abrirModalEntrega(boton.dataset.id));
    });
}

/* =========================================================
   INVENTARIO
   ========================================================= */

function iniciarInventario() {
    document.getElementById("formInventario")?.addEventListener("submit", guardarElemento);
}

async function guardarElemento(e) {
    e.preventDefault();

    const campoElemento = document.getElementById("inventarioElemento") || document.getElementById("inventarioNombre");
    const elemento = campoElemento?.value.trim() || "";
    const talla = document.getElementById("inventarioTalla")?.value.trim() || null;
    const campoStock = document.getElementById("inventarioCantidad");
    const stock = Number(campoStock?.value || 0);

    if (!elemento) {
        alert("Escribe el nombre del elemento.");
        return;
    }

    if (stock < 0) {
        alert("El stock no puede ser negativo.");
        return;
    }

    const datos = { elemento, talla, stock };
    const { error } = await supabaseClient.from("inventario").insert([datos]);

    if (error) {
        console.error(error);
        alert("Error al guardar el inventario:\n\n" + error.message);
        return;
    }

    alert("Elemento guardado correctamente.");
    agregarHistorial("Elemento creado", `${elemento} - stock inicial: ${stock}`);

    e.target.reset();
    await cargarDatosSupabase();
    cargarElementosSelect();
    renderInventario();
    renderNotificaciones();
}

function renderInventario() {
    const body = document.getElementById("tablaInventarioBody");
    if (!body) return;

    body.innerHTML = "";

    inventario.forEach(item => {
        const stock = Number(item.stock || 0);
        let estado = "Disponible";
        let clase = "entregado";

        if (stock === 0) {
            estado = "Agotado";
            clase = "pendiente";
        } else if (stock <= STOCK_MINIMO) {
            estado = "Stock bajo";
            clase = "pendiente";
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <strong>${escapeHTML(item.elemento || "")}</strong>
                ${item.talla ? `<small>${escapeHTML(item.talla)}</small>` : ""}
            </td>
            <td><strong>${stock}</strong></td>
            <td>${STOCK_MINIMO}</td>
            <td><span class="estado ${clase}">${estado}</span></td>
            <td>
                <button type="button" class="btn-tabla btn-entrada-stock" data-id="${item.id}" title="Agregar stock">➕</button>
            </td>
        `;
        body.appendChild(tr);
    });

    body.querySelectorAll(".btn-entrada-stock").forEach(boton => {
        boton.addEventListener("click", () => abrirEntradaInventario(boton.dataset.id));
    });

    const totalProductos = document.getElementById("totalProductosInventario");
    const totalUnidades = document.getElementById("totalUnidadesInventario");
    const totalBajo = document.getElementById("totalBajoInventario");

    if (totalProductos) totalProductos.textContent = inventario.length;
    if (totalUnidades) totalUnidades.textContent = inventario.reduce((total, item) => total + Number(item.stock || 0), 0);
    if (totalBajo) totalBajo.textContent = inventario.filter(item => Number(item.stock || 0) <= STOCK_MINIMO).length;
}

async function modificarStock(id, cantidad, motivo = "Movimiento de inventario") {
    const item = inventario.find(registro => Number(registro.id) === Number(id));

    if (!item) {
        alert("No se encontró el elemento de inventario.");
        return false;
    }

    const stockActual = Number(item.stock || 0);
    const nuevoStock = Math.max(0, stockActual + Number(cantidad));

    const { error } = await supabaseClient.from("inventario").update({ stock: nuevoStock }).eq("id", item.id);

    if (error) {
        console.error(error);
        alert("Error actualizando stock:\n\n" + error.message);
        return false;
    }

    agregarHistorial(motivo, `${item.elemento}: ${cantidad > 0 ? "+" : ""}${cantidad} unidades. Nuevo stock: ${nuevoStock}`);
    await cargarDatosSupabase();
    cargarElementosSelect();
    renderInventario();
    renderNotificaciones();

    return true;
}

async function abrirEntradaInventario(id = null) {
    let item = null;

    if (id !== null && id !== "") {
        item = inventario.find(registro => Number(registro.id) === Number(id));
    }

    if (!item) {
        const nombres = inventario.map(registro => `• ${registro.elemento}${registro.talla ? ` - ${registro.talla}` : ""}`).join("\n");
        const texto = prompt(`Escribe exactamente el elemento:\n\n${nombres}`);

        if (!texto) return;
        item = inventario.find(registro => String(registro.elemento || "").trim().toLowerCase() === texto.trim().toLowerCase());
    }

    if (!item) {
        alert("Ese elemento no existe en el inventario.");
        return;
    }

    const cantidad = Number(prompt(`¿Cuántas unidades deseas agregar de "${item.elemento}"?`, "1"));

    if (!Number.isFinite(cantidad) || cantidad < 1) return;

    await modificarStock(item.id, cantidad, "Entrada de inventario");
}

function crearPanelInventario() {
    const seccion = document.getElementById("seccion-dotacion");
    if (!seccion || document.getElementById("panelInventario")) return;

    const panel = document.createElement("div");
    panel.id = "panelInventario";
    panel.className = "panel-tabla";
    panel.innerHTML = `
        <div class="panel-tabla-header">
            <div>
                <span class="etiqueta-seccion">ALMACÉN</span>
                <h3>Inventario de dotación</h3>
                <p>Consulta existencias y registra entradas.</p>
            </div>
            <button id="btnEntradaInventario" class="btn-principal" type="button">+ Entrada de inventario</button>
        </div>
        <div class="resumen-dotacion inventario-resumen">
            <div><span>📦</span><div><strong id="totalProductosInventario">0</strong><small>Elementos</small></div></div>
            <div><span>🟢</span><div><strong id="totalUnidadesInventario">0</strong><small>Unidades disponibles</small></div></div>
            <div><span>⚠️</span><div><strong id="totalBajoInventario">0</strong><small>Stock bajo</small></div></div>
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
    document.getElementById("btnEntradaInventario")?.addEventListener("click", () => abrirEntradaInventario());
    renderInventario();
}

/* =========================================================
   DOTACIÓN Y RESUMEN
   ========================================================= */

function renderDotacion() {
    renderEntregas();
    actualizarResumenDotacion();
}

function actualizarResumenDotacion() {
    const total = document.getElementById("resumenTotalDotacion");
    const entregadas = document.getElementById("resumenEntregadas");
    const pendientes = document.getElementById("resumenPendientes");
    const totalEntregas = document.getElementById("totalEntregas");
    const totalPendientes = document.getElementById("totalPendientes");
    const totalMes = document.getElementById("totalMes");

    const cantidadEntregas = entregas.length;

    if (total) total.textContent = cantidadEntregas;
    if (entregadas) entregadas.textContent = cantidadEntregas;
    if (pendientes) pendientes.textContent = "0";
    if (totalEntregas) totalEntregas.textContent = cantidadEntregas;
    if (totalPendientes) totalPendientes.textContent = "0";

    const mesActual = new Date().toISOString().substring(0, 7);
    if (totalMes) {
        totalMes.textContent = entregas.filter(entrega => String(entrega.fecha || "").startsWith(mesActual)).length;
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
            <td><strong>${escapeHTML(item.accion)}</strong></td>
            <td>${escapeHTML(item.detalle)}</td>
        `;
        body.appendChild(tr);
    });
}

/* =========================================================
   REPORTES
   ========================================================= */

function prepararEntregaReporte(entrega) {
    const empleado = obtenerEmpleado(entrega.empleado);
    const inventarioItem = obtenerRegistroInventario(entrega.elemento);

    return {
        ...entrega,
        empleadoId: entrega.empleado,
        empleadoNombre: empleado?.nombre || "Empleado no encontrado",
        codigo: empleado?.cedula || "",
        cantidad: Number(entrega.cantidades || 0),
        talla: inventarioItem?.talla || "",
        centroCosto: "",
        estado: "Entregado",
        observaciones: entrega.comentarios || ""
    };
}

function obtenerEntregasFiltradas() {
    const texto = (document.getElementById("reporteBuscar")?.value || "").trim().toLowerCase();
    const desde = document.getElementById("reporteFechaInicio")?.value || "";
    const hasta = document.getElementById("reporteFechaFin")?.value || "";

    return entregas.map(prepararEntregaReporte).filter(entrega => {
        const fecha = String(entrega.fecha || "").substring(0, 10);
        const coincideTexto = `${entrega.empleadoNombre} ${entrega.codigo} ${entrega.elemento} ${entrega.talla} ${entrega.observaciones}`
            .toLowerCase()
            .includes(texto);

        const coincideDesde = !desde || fecha >= desde;
        const coincideHasta = !hasta || fecha <= hasta;

        return coincideTexto && coincideDesde && coincideHasta;
    });
}

function renderReportes() {
    const body = document.getElementById("tablaReporteBody");
    if (!body) return;

    const datos = obtenerEntregasFiltradas();
    body.innerHTML = "";

    datos.forEach(entrega => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatearFecha(entrega.fecha)}</td>
            <td>${escapeHTML(entrega.empleadoNombre)}</td>
            <td>${escapeHTML(entrega.codigo || "-")}</td>
            <td>${escapeHTML(entrega.elemento || "")}</td>
            <td>${escapeHTML(entrega.talla || "-")}</td>
            <td>${entrega.cantidad}</td>
            <td>${escapeHTML(entrega.centroCosto || "-")}</td>
            <td>Entregado</td>
            <td>${escapeHTML(entrega.observaciones || "-")}</td>
        `;
        body.appendChild(tr);
    });

    const total = document.getElementById("reporteTotalEntregas");
    const entregadas = document.getElementById("reporteEntregadas");
    const pendientes = document.getElementById("reportePendientes");
    const totalEmpleados = document.getElementById("reporteEmpleados");

    if (total) total.textContent = datos.length;
    if (entregadas) entregadas.textContent = datos.length;
    if (pendientes) pendientes.textContent = "0";
    if (totalEmpleados) totalEmpleados.textContent = new Set(datos.map(entrega => entrega.empleadoId)).size;
}

function iniciarReportes() {
    document.getElementById("actualizarReporte")?.addEventListener("click", renderReportes);
    document.getElementById("limpiarReporte")?.addEventListener("click", () => {
        ["reporteBuscar", "reporteEstado", "reporteFechaInicio", "reporteFechaFin"].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.value = "";
        });
        renderReportes();
    });

    document.getElementById("descargarReporte")?.addEventListener("click", descargarCSV);
    document.getElementById("imprimirReporte")?.addEventListener("click", () => window.print());
}

function descargarCSV() {
    const datos = obtenerEntregasFiltradas();
    if (!datos.length) {
        alert("No hay datos para descargar.");
        return;
    }

    const encabezados = ["Fecha", "Empleado", "Cédula", "Elemento", "Talla", "Cantidad", "Centro de costo", "Estado", "Observaciones"];
    const filas = datos.map(entrega => [
        formatearFecha(entrega.fecha),
        entrega.empleadoNombre,
        entrega.codigo,
        entrega.elemento,
        entrega.talla,
        entrega.cantidad,
        entrega.centroCosto,
        "Entregado",
        entrega.observaciones
    ]);

    const csv = [encabezados, ...filas]
        .map(fila => fila.map(valor => `"${String(valor ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
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
        if (!input || !resultados) return;
        const texto = input.value.trim().toLowerCase();

        if (!texto) {
            resultados.classList.add("oculto");
            resultados.innerHTML = "";
            return;
        }

        const empleadosEncontrados = empleados.filter(e => `${e.nombre || ""} ${e.cedula || ""} ${e.cargo || ""}`.toLowerCase().includes(texto));
        const entregasEncontradas = entregas.map(prepararEntregaReporte).filter(e => `${e.empleadoNombre} ${e.elemento} ${e.codigo}`.toLowerCase().includes(texto));
        const inventarioEncontrado = inventario.filter(i => String(i.elemento || "").toLowerCase().includes(texto));

        let html = "";

        empleadosEncontrados.slice(0, 5).forEach(e => {
            html += `<div class="resultado-busqueda" data-seccion="seccion-empleados">👤 <strong>${escapeHTML(e.nombre)}</strong> <small>${escapeHTML(e.cedula || "")}</small></div>`;
        });

        entregasEncontradas.slice(0, 5).forEach(e => {
            html += `<div class="resultado-busqueda" data-seccion="seccion-dotacion">📦 <strong>${escapeHTML(e.elemento)}</strong> <small>${escapeHTML(e.empleadoNombre)}</small></div>`;
        });

        inventarioEncontrado.slice(0, 5).forEach(i => {
            html += `<div class="resultado-busqueda" data-seccion="seccion-dotacion">📋 <strong>${escapeHTML(i.elemento)}</strong> <small>Stock: ${Number(i.stock || 0)}</small></div>`;
        });

        if (!html) html = `<div class="resultado-busqueda">Sin resultados.</div>`;

        resultados.innerHTML = html;
        resultados.classList.remove("oculto");

        resultados.querySelectorAll("[data-seccion]").forEach(elemento => {
            elemento.addEventListener("click", () => {
                mostrarSeccion(elemento.dataset.seccion);
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
        panel?.classList.toggle("oculto");
        renderNotificaciones();
    });

    cerrar?.addEventListener("click", () => panel?.classList.add("oculto"));
}

function renderNotificaciones() {
    const contenido = document.getElementById("contenidoNotificaciones");
    const contador = document.getElementById("contadorNotificaciones");

    if (!contenido) return;

    const bajo = inventario.filter(item => Number(item.stock || 0) <= STOCK_MINIMO);
    const total = bajo.length;

    if (contador) contador.textContent = total;

    if (!total) {
        contenido.innerHTML = `<div class="notificacion-vacia">No hay notificaciones.</div>`;
        return;
    }

    let html = "";
    bajo.forEach(item => {
        html += `
            <div class="notificacion-item">
                ⚠️
                <div>
                    <strong>Stock bajo</strong>
                    <p>${escapeHTML(item.elemento)}: ${Number(item.stock || 0)} unidades.</p>
                </div>
            </div>
        `;
    });

    contenido.innerHTML = html;
}

/* =========================================================
   DASHBOARD & GRÁFICA
   ========================================================= */

async function cargarDashboard() {
    const cargado = await cargarDatosSupabase();
    if (!cargado) return;

    actualizarTodaLaInterfaz();
}

async function actualizarTodo() {
    await cargarDatosSupabase();
    actualizarTodaLaInterfaz();
}

function actualizarTodaLaInterfaz() {
    renderEmpleados();
    renderDotacion();
    renderInventario();
    renderHistorial();
    renderReportes();
    renderNotificaciones();
    actualizarResumenDotacion();
    cargarEmpleadosSelect();
    cargarElementosSelect();
    actualizarGraficas();
}

function actualizarGraficas() {
    const canvas = document.getElementById("graficoEntregasMes");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const meses = [];
    for (let i = 5; i >= 0; i--) {
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() - i);
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const año = fecha.getFullYear();
        meses.push(`${año}-${mes}`);
    }

    const valores = meses.map(mes =>
        entregas.filter(entrega => String(entrega.fecha || "").startsWith(mes)).length
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ancho = canvas.width;
    const alto = canvas.height;
    const max = Math.max(...valores, 1);

    const puntos = valores.map((valor, index) => {
        const x = 30 + index * ((ancho - 60) / Math.max(valores.length - 1, 1));
        const y = alto - 30 - (valor / max) * (alto - 60);
        return { x, y };
    });

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#2563eb";
    ctx.beginPath();

    puntos.forEach((punto, index) => {
        if (index === 0) {
            ctx.moveTo(punto.x, punto.y);
        } else {
            ctx.lineTo(punto.x, punto.y);
        }
    });

    ctx.stroke();

    puntos.forEach(punto => {
        ctx.beginPath();
        ctx.fillStyle = "#2563eb";
        ctx.arc(punto.x, punto.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

/* =========================================================
   INICIALIZACIÓN & SINCRONIZACIÓN
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    iniciarLogin();
    iniciarNavegacion();
    iniciarEmpleados();
    iniciarEntregas();
    iniciarInventario();
    iniciarReportes();
    iniciarBusquedaGlobal();
    iniciarNotificaciones();
    crearPanelInventario();

    await cargarDashboard();

    // Auto-cerrar sidebar en pantallas táctiles/móviles al seleccionar módulo
    document.querySelectorAll("[data-seccion]").forEach(boton => {
        boton.addEventListener("click", () => {
            document.querySelector(".sidebar")?.classList.remove("abierta");
        });
    });
});

// Sincronización remota continua (Cada 10 segundos)
setInterval(async () => {
    if (document.hidden) return;
    await cargarDatosSupabase();
    actualizarTodaLaInterfaz();
}, 10000);