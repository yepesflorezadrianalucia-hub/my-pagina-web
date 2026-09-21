/* =========================================================
   CONTROL-DOTACION
   SCRIPT PRINCIPAL UNIFICADO
========================================================= */


/* =========================================================
   DATOS
========================================================= */

function leerDatos(nombre) {
    try {
        var datos = JSON.parse(localStorage.getItem(nombre));
        return Array.isArray(datos) ? datos : [];
    } catch (error) {
        console.warn("No se pudieron leer los datos de " + nombre, error);
        return [];
    }
}

var empleados = leerDatos("empleados");
var entregas = leerDatos("entregas");
var historial = leerDatos("historial");

var empleadoEditando = null;
var entregaEditando = null;


/* =========================================================
   CENTROS DE COSTO
========================================================= */

var centrosCosto = [
    "AA",
    "BN",
    "BC",
    "BM",
    "VN",
    "VC",
    "VM",
    "LN",
    "LC",
    "LM"
];


/* =========================================================
   ELEMENTOS DE DOTACION
========================================================= */

var elementosDotacion = [
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
    "Gorra",
    "Otro"
];


/* =========================================================
   TALLAS
========================================================= */

var tallasCamisa = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "4XL"
];

var tallasPantalon = [
    "6",
    "8",
    "10",
    "12",
    "14",
    "16",
    "18",
    "20",
    "22",
    "24",
    "26",
    "28",
    "30",
    "32",
    "34",
    "36",
    "38",
    "40",
    "42",
    "44"
];

var tallasBotas = [
    "35",
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46"
];

var tallasPorElemento = {
    "Camisa": tallasCamisa,
    "Pantalón": tallasPantalon,
    "Botas": tallasBotas,
    "Chaqueta": tallasCamisa,
    "Gorra": ["Única"],
    "Otro": tallasCamisa
};


/* =========================================================
   ELEMENTOS HTML
========================================================= */

var pantallaLogin = document.getElementById("pantallaLogin");
var dashboard = document.getElementById("dashboard");

var loginForm = document.getElementById("loginForm");
var usuario = document.getElementById("usuario");
var password = document.getElementById("password");
var mostrarPassword = document.getElementById("mostrarPassword");
var mensaje = document.getElementById("mensaje");

var totalEmpleados = document.getElementById("totalEmpleados");
var totalEntregas = document.getElementById("totalEntregas");
var totalPendientes = document.getElementById("totalPendientes");
var totalMes = document.getElementById("totalMes");
var ultimasEntregasBody = document.getElementById("ultimasEntregasBody");

var nuevoEmpleado = document.getElementById("nuevoEmpleado");
var buscarEmpleado = document.getElementById("buscarEmpleado");
var tablaEmpleadosBody = document.getElementById("tablaEmpleadosBody");

var modalEmpleado = document.getElementById("modalEmpleado");
var tituloModalEmpleado = document.getElementById("tituloModalEmpleado");
var cerrarModalEmpleado = document.getElementById("cerrarModalEmpleado");
var formEmpleado = document.getElementById("formEmpleado");

var empleadoId = document.getElementById("empleadoId");
var empleadoCodigo = document.getElementById("empleadoCodigo");
var empleadoNombre = document.getElementById("empleadoNombre");
var empleadoDocumento = document.getElementById("empleadoDocumento");
var empleadoCargo = document.getElementById("empleadoCargo");
var empleadoFoto = document.getElementById("empleadoFoto");

var agregarTalla = document.getElementById("agregarTalla");
var listaTallas = document.getElementById("listaTallas");
var cancelarEmpleado = document.getElementById("cancelarEmpleado");

var nuevaEntrega = document.getElementById("nuevaEntrega");
var buscarEntrega = document.getElementById("buscarEntrega");
var tablaDotacionBody = document.getElementById("tablaDotacionBody");

var modalEntrega = document.getElementById("modalEntrega");
var tituloModalEntrega = document.getElementById("tituloModalEntrega");
var cerrarModalEntrega = document.getElementById("cerrarModalEntrega");
var formEntrega = document.getElementById("formEntrega");

var entregaId = document.getElementById("entregaId");
var entregaEmpleado = document.getElementById("entregaEmpleado");
var entregaElemento = document.getElementById("entregaElemento");
var entregaCentroCosto = document.getElementById("entregaCentroCosto");
var entregaCantidad = document.getElementById("entregaCantidad");
var entregaTalla = document.getElementById("entregaTalla");
var entregaFecha = document.getElementById("entregaFecha");
var entregaEstado = document.getElementById("entregaEstado");
var entregaEvidencia = document.getElementById("entregaEvidencia");
var entregaObservaciones = document.getElementById("entregaObservaciones");
var cancelarEntrega = document.getElementById("cancelarEntrega");

var tablaHistorialBody = document.getElementById("tablaHistorialBody");

var reporteBuscar = document.getElementById("reporteBuscar");
var reporteEstado = document.getElementById("reporteEstado");
var reporteFechaInicio = document.getElementById("reporteFechaInicio");
var reporteFechaFin = document.getElementById("reporteFechaFin");

var actualizarReporte = document.getElementById("actualizarReporte");
var limpiarReporte = document.getElementById("limpiarReporte");

var reporteTotalEntregas = document.getElementById("reporteTotalEntregas");
var reporteEntregadas = document.getElementById("reporteEntregadas");
var reportePendientes = document.getElementById("reportePendientes");
var reporteEmpleados = document.getElementById("reporteEmpleados");

var descargarReporte = document.getElementById("descargarReporte");
var imprimirReporte = document.getElementById("imprimirReporte");
var tablaReporteBody = document.getElementById("tablaReporteBody");

var cerrarSesion = document.getElementById("cerrarSesion");


/* =========================================================
   FUNCIONES GENERALES
========================================================= */

function guardarDatos() {

    try {

        localStorage.setItem(
            "empleados",
            JSON.stringify(empleados)
        );

        localStorage.setItem(
            "entregas",
            JSON.stringify(entregas)
        );

        localStorage.setItem(
            "historial",
            JSON.stringify(historial)
        );

        return true;

    } catch (error) {

        console.error(
            "No se pudieron guardar los datos.",
            error
        );

        alert(
            "No se pudo guardar la información. " +
            "Si agregaste una foto muy pesada, intenta con una imagen más pequeña."
        );

        return false;
    }
}


function generarId() {

    return (
        Date.now().toString() +
        Math.floor(Math.random() * 10000).toString()
    );
}


function escaparHtml(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {
        return "";
    }

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatearFecha(fecha) {

    if (!fecha) {
        return "";
    }

    var partes = String(fecha).split("-");

    if (partes.length === 3) {

        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
        );
    }

    return String(fecha);
}


function obtenerFechaActual() {

    var hoy = new Date();

    var año = hoy.getFullYear();

    var mes = String(
        hoy.getMonth() + 1
    ).padStart(2, "0");

    var dia = String(
        hoy.getDate()
    ).padStart(2, "0");

    return (
        año +
        "-" +
        mes +
        "-" +
        dia
    );
}


function esMismoId(id1, id2) {

    return String(id1) === String(id2);
}


function buscarEmpleadoPorId(id) {

    return (
        empleados.find(function (empleado) {

            return esMismoId(
                empleado.id,
                id
            );

        }) || null
    );
}


/* =========================================================
   ESTADOS
========================================================= */

function obtenerEstadoHtml(estado) {

    var valor = String(
        estado || ""
    );

    var clase =
        valor.toLowerCase() === "entregada"
            ? "estado-entregado"
            : "estado-pendiente";

    return (
        '<span class="estado ' +
        clase +
        '">' +
        escaparHtml(
            valor || "Sin estado"
        ) +
        "</span>"
    );
}


/* =========================================================
   ARCHIVOS / FOTOS
========================================================= */

function leerArchivoComoDataURL(
    archivo,
    callback
) {

    if (!archivo) {

        callback(null);

        return;
    }


    if (
        !archivo.type ||
        archivo.type.indexOf("image/") !== 0
    ) {

        alert(
            "Selecciona un archivo de imagen válido."
        );

        callback(null);

        return;
    }


    var lector =
        new FileReader();


    lector.onload =
        function (evento) {

            callback(
                evento.target.result
            );
        };


    lector.onerror =
        function () {

            alert(
                "No se pudo leer la imagen seleccionada."
            );

            callback(null);
        };


    lector.readAsDataURL(
        archivo
    );
}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();

            var usuarioIngresado =
                usuario.value.trim();

            var passwordIngresada =
                password.value;


            if (
                usuarioIngresado === "admin" &&
                passwordIngresada === "123456"
            ) {

                pantallaLogin.classList.add(
                    "oculto"
                );

                dashboard.classList.remove(
                    "oculto"
                );

                mensaje.textContent = "";

                cargarTodo();

            } else {

                mensaje.textContent =
                    "Usuario o contraseña incorrectos.";

                mensaje.style.color =
                    "#dc2626";
            }
        }
    );
}


if (mostrarPassword) {

    mostrarPassword.addEventListener(
        "click",
        function () {

            if (
                password.type ===
                "password"
            ) {

                password.type = "text";

                mostrarPassword.textContent =
                    "Ocultar";

            } else {

                password.type =
                    "password";

                mostrarPassword.textContent =
                    "Mostrar";
            }
        }
    );
}


/* =========================================================
   CERRAR SESION
========================================================= */

if (cerrarSesion) {

    cerrarSesion.addEventListener(
        "click",
        function () {

            dashboard.classList.add(
                "oculto"
            );

            pantallaLogin.classList.remove(
                "oculto"
            );

            usuario.value = "";
            password.value = "";

            mensaje.textContent = "";
        }
    );
}


/* =========================================================
   NAVEGACION
========================================================= */

var botonesMenu =
    document.querySelectorAll(
        "[data-seccion]"
    );


botonesMenu.forEach(
    function (boton) {

        boton.addEventListener(
            "click",
            function () {

                var seccionNombre =
                    boton.getAttribute(
                        "data-seccion"
                    );


                var secciones =
                    document.querySelectorAll(
                        ".seccion"
                    );


                secciones.forEach(
                    function (seccion) {

                        seccion.classList.add(
                            "oculto"
                        );
                    }
                );


                var seccionMostrar =
                    document.getElementById(
                        "seccion-" +
                        seccionNombre
                    );


                if (seccionMostrar) {

                    seccionMostrar.classList.remove(
                        "oculto"
                    );
                }


                botonesMenu.forEach(
                    function (item) {

                        item.classList.remove(
                            "activo"
                        );
                    }
                );


                boton.classList.add(
                    "activo"
                );


                if (
                    seccionNombre ===
                    "inicio"
                ) {

                    actualizarDashboard();
                }


                if (
                    seccionNombre ===
                    "empleados"
                ) {

                    mostrarEmpleados();
                }


                if (
                    seccionNombre ===
                    "dotacion"
                ) {

                    mostrarEntregas();
                }


                if (
                    seccionNombre ===
                    "historial"
                ) {

                    mostrarHistorial();
                }


                if (
                    seccionNombre ===
                    "reportes"
                ) {

                    generarReporte();
                }

            }
        );
    }
);


/* =========================================================
   FOTO DEL EMPLEADO
========================================================= */

function obtenerFotoEmpleadoHtml(
    empleado
) {

    if (
        !empleado ||
        !empleado.foto
    ) {

        return (
            '<span class="sin-foto">' +
            "Sin foto" +
            "</span>"
        );
    }


    var foto =
        String(
            empleado.foto
        ).trim();


    if (
        foto.indexOf(
            "data:image/"
        ) === 0
    ) {

        return (
            '<a href="' +
            foto +
            '" target="_blank" rel="noopener noreferrer" title="Ver foto en tamaño completo">' +

            '<img src="' +
            foto +
            '" alt="Foto de ' +
            escaparHtml(
                empleado.nombre
            ) +
            '" class="foto-empleado">' +

            "</a>"
        );
    }


    if (
        foto.indexOf(
            "http://"
        ) === 0 ||

        foto.indexOf(
            "https://"
        ) === 0
    ) {

        return (
            '<a href="' +
            escaparHtml(foto) +
            '" target="_blank" rel="noopener noreferrer">' +
            "Ver foto" +
            "</a>"
        );
    }


    return (
        '<span class="sin-foto">' +
        "Foto no disponible" +
        "</span>"
    );
}


/* =========================================================
   EMPLEADOS
========================================================= */

if (nuevoEmpleado) {

    nuevoEmpleado.addEventListener(
        "click",
        function () {

            abrirModalEmpleado();
        }
    );
}


if (cerrarModalEmpleado) {

    cerrarModalEmpleado.addEventListener(
        "click",
        cerrarEmpleadoModal
    );
}


if (cancelarEmpleado) {

    cancelarEmpleado.addEventListener(
        "click",
        cerrarEmpleadoModal
    );
}


function abrirModalEmpleado(
    empleado
) {

    empleadoEditando =
        empleado || null;


    tituloModalEmpleado.textContent =
        empleado
            ? "Editar empleado"
            : "Nuevo empleado";


    formEmpleado.reset();

    empleadoId.value = "";

    listaTallas.innerHTML =
        "";


    if (empleado) {

        empleadoId.value =
            empleado.id || "";

        empleadoCodigo.value =
            empleado.codigo || "";

        empleadoNombre.value =
            empleado.nombre || "";

        empleadoDocumento.value =
            empleado.documento || "";

        empleadoCargo.value =
            empleado.cargo || "";


        if (
            Array.isArray(
                empleado.tallas
            ) &&
            empleado.tallas.length > 0
        ) {

            empleado.tallas.forEach(
                function (talla) {

                    agregarFilaTalla(
                        talla.elemento ||
                        "Camisa Administrativos",

                        talla.talla ||
                        ""
                    );
                }
            );

        } else {

            if (empleado.talla) {

                agregarFilaTalla(
                    "Camisa Administrativos",
                    empleado.talla
                );
            }


            if (
                empleado.tallaPantalon
            ) {

                agregarFilaTalla(
                    "Pantalón",
                    empleado.tallaPantalon
                );
            }


            if (
                listaTallas.children.length === 0
            ) {

                agregarFilaTalla(
                    "Camisa Administrativos",
                    ""
                );
            }
        }

    } else {

        agregarFilaTalla(
            "Camisa Administrativos",
            ""
        );
    }


    modalEmpleado.classList.remove(
        "oculto"
    );
}


function cerrarEmpleadoModal() {

    modalEmpleado.classList.add(
        "oculto"
    );

    empleadoEditando = null;
}


/* =========================================================
   TALLAS DINAMICAS
========================================================= */

function obtenerTipoElemento(
    nombreElemento
) {

    var nombre =
        String(
            nombreElemento || ""
        ).toLowerCase();


    if (
        nombre.indexOf(
            "pantal"
        ) !== -1
    ) {

        return "Pantalón";
    }


    if (
        nombre.indexOf(
            "bota"
        ) !== -1
    ) {

        return "Botas";
    }


    if (
        nombre.indexOf(
            "gorra"
        ) !== -1
    ) {

        return "Gorra";
    }


    if (
        nombre.indexOf(
            "chaqueta"
        ) !== -1
    ) {

        return "Chaqueta";
    }


    if (
        nombre.indexOf(
            "camisa"
        ) !== -1 ||

        nombre.indexOf(
            "camisilla"
        ) !== -1 ||

        nombre.indexOf(
            "suéter"
        ) !== -1 ||

        nombre.indexOf(
            "sueter"
        ) !== -1 ||

        nombre.indexOf(
            "buso"
        ) !== -1
    ) {

        return "Camisa";
    }


    return "Otro";
}


function obtenerTallasParaElemento(
    nombreElemento
) {

    var tipo =
        obtenerTipoElemento(
            nombreElemento
        );


    return (
        tallasPorElemento[tipo] ||
        tallasCamisa
    );
}


function actualizarSelectTalla(
    selectElemento,
    selectTalla,
    tallaSeleccionada
) {

    var tallas =
        obtenerTallasParaElemento(
            selectElemento.value
        );


    var valorAnterior =
        tallaSeleccionada ||
        selectTalla.value ||
        "";


    selectTalla.innerHTML =
        "";


    var opcionInicial =
        document.createElement(
            "option"
        );

    opcionInicial.value = "";

    opcionInicial.textContent =
        "Seleccione talla";

    selectTalla.appendChild(
        opcionInicial
    );


    tallas.forEach(
        function (talla) {

            var opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                talla;

            opcion.textContent =
                talla;

            selectTalla.appendChild(
                opcion
            );
        }
    );


    if (
        valorAnterior &&
        !tallas.includes(
            String(valorAnterior)
        )
    ) {

        var opcionAntigua =
            document.createElement(
                "option"
            );

        opcionAntigua.value =
            valorAnterior;

        opcionAntigua.textContent =
            valorAnterior;

        selectTalla.appendChild(
            opcionAntigua
        );
    }


    selectTalla.value =
        valorAnterior;
}


function agregarFilaTalla(
    elementoSeleccionado,
    tallaSeleccionada
) {

    var fila =
        document.createElement(
            "div"
        );

    fila.className =
        "fila-talla";


    var campoElemento =
        document.createElement(
            "div"
        );

    campoElemento.className =
        "campo";


    var etiquetaElemento =
        document.createElement(
            "label"
        );

    etiquetaElemento.textContent =
        "Elemento";


    campoElemento.appendChild(
        etiquetaElemento
    );


    var selectElemento =
        document.createElement(
            "select"
        );

    selectElemento.className =
        "talla-elemento";


    elementosDotacion.forEach(
        function (elemento) {

            var opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                elemento;

            opcion.textContent =
                elemento;

            selectElemento.appendChild(
                opcion
            );
        }
    );


    selectElemento.value =
        elementoSeleccionado ||
        elementosDotacion[0];


    campoElemento.appendChild(
        selectElemento
    );


    var campoTalla =
        document.createElement(
            "div"
        );

    campoTalla.className =
        "campo";


    var etiquetaTalla =
        document.createElement(
            "label"
        );

    etiquetaTalla.textContent =
        "Talla";


    campoTalla.appendChild(
        etiquetaTalla
    );


    var selectTalla =
        document.createElement(
            "select"
        );

    selectTalla.className =
        "talla-valor";


    campoTalla.appendChild(
        selectTalla
    );


    actualizarSelectTalla(
        selectElemento,
        selectTalla,
        tallaSeleccionada || ""
    );


    selectElemento.addEventListener(
        "change",
        function () {

            actualizarSelectTalla(
                selectElemento,
                selectTalla,
                ""
            );
        }
    );


    var botonEliminar =
        document.createElement(
            "button"
        );

    botonEliminar.type =
        "button";

    botonEliminar.className =
        "btn-eliminar-talla";

    botonEliminar.textContent =
        "Eliminar";


    botonEliminar.addEventListener(
        "click",
        function () {

            fila.remove();
        }
    );


    fila.appendChild(
        campoElemento
    );

    fila.appendChild(
        campoTalla
    );

    fila.appendChild(
        botonEliminar
    );


    listaTallas.appendChild(
        fila
    );
}


if (agregarTalla) {

    agregarTalla.addEventListener(
        "click",
        function () {

            agregarFilaTalla(
                "Camisa Administrativos",
                ""
            );
        }
    );
}


/* =========================================================
   GUARDAR EMPLEADO
========================================================= */

if (formEmpleado) {

    formEmpleado.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            var filasTallas =
                listaTallas.querySelectorAll(
                    ".fila-talla"
                );


            var tallas = [];


            filasTallas.forEach(
                function (fila) {

                    var selectElemento =
                        fila.querySelector(
                            ".talla-elemento"
                        );

                    var selectTalla =
                        fila.querySelector(
                            ".talla-valor"
                        );


                    if (
                        selectElemento &&
                        selectTalla &&
                        selectElemento.value &&
                        selectTalla.value
                    ) {

                        tallas.push({

                            elemento:
                                selectElemento.value,

                            talla:
                                selectTalla.value
                        });
                    }
                }
            );


            var archivoFoto =
                empleadoFoto.files &&
                empleadoFoto.files.length > 0
                    ? empleadoFoto.files[0]
                    : null;


            var empleadoBase = {

                id:
                    empleadoEditando
                        ? empleadoEditando.id
                        : generarId(),

                codigo:
                    empleadoCodigo.value.trim(),

                nombre:
                    empleadoNombre.value.trim(),

                documento:
                    empleadoDocumento.value.trim(),

                cargo:
                    empleadoCargo.value.trim(),

                tallas:
                    tallas,

                talla:
                    "",

                tallaPantalon:
                    "",

                foto:
                    empleadoEditando
                        ? empleadoEditando.foto || ""
                        : ""
            };


            if (
                !empleadoBase.codigo ||
                !empleadoBase.nombre ||
                !empleadoBase.documento ||
                !empleadoBase.cargo
            ) {

                alert(
                    "Completa todos los datos obligatorios del empleado."
                );

                return;
            }


            if (archivoFoto) {

                leerArchivoComoDataURL(
                    archivoFoto,
                    function (fotoDataURL) {

                        if (!fotoDataURL) {
                            return;
                        }


                        empleadoBase.foto =
                            fotoDataURL;


                        guardarEmpleadoFinal(
                            empleadoBase
                        );
                    }
                );

            } else {

                guardarEmpleadoFinal(
                    empleadoBase
                );
            }

        }
    );
}


function guardarEmpleadoFinal(
    empleadoBase
) {

    if (empleadoEditando) {

        var indice =
            empleados.findIndex(
                function (empleado) {

                    return esMismoId(
                        empleado.id,
                        empleadoEditando.id
                    );
                }
            );


        if (indice !== -1) {

            empleados[indice] =
                empleadoBase;
        }

    } else {

        empleados.push(
            empleadoBase
        );
    }


    guardarDatos();

    cerrarEmpleadoModal();

    mostrarEmpleados();

    cargarSelectEmpleados();

    actualizarDashboard();
}


/* =========================================================
   MOSTRAR EMPLEADOS
========================================================= */

function mostrarEmpleados() {

    if (!tablaEmpleadosBody) {
        return;
    }


    tablaEmpleadosBody.innerHTML =
        "";


    var textoBusqueda =
        buscarEmpleado
            ? buscarEmpleado.value
                .trim()
                .toLowerCase()
            : "";


    var empleadosFiltrados =
        empleados.filter(
            function (empleado) {

                if (!textoBusqueda) {
                    return true;
                }


                return (

                    String(
                        empleado.codigo || ""
                    )
                        .toLowerCase()
                        .includes(
                            textoBusqueda
                        ) ||

                    String(
                        empleado.nombre || ""
                    )
                        .toLowerCase()
                        .includes(
                            textoBusqueda
                        ) ||

                    String(
                        empleado.documento || ""
                    )
                        .toLowerCase()
                        .includes(
                            textoBusqueda
                        ) ||

                    String(
                        empleado.cargo || ""
                    )
                        .toLowerCase()
                        .includes(
                            textoBusqueda
                        )
                );
            }
        );


    if (
        empleadosFiltrados.length === 0
    ) {

        tablaEmpleadosBody.innerHTML =
            '<tr>' +
            '<td colspan="7" class="sin-datos">' +
            "No hay empleados registrados." +
            "</td>" +
            "</tr>";

        return;
    }


    empleadosFiltrados.forEach(
        function (empleado) {

            var fila =
                document.createElement(
                    "tr"
                );


            var tallasTexto =
                "";


            if (
                Array.isArray(
                    empleado.tallas
                )
            ) {

                tallasTexto =
                    empleado.tallas
                        .map(
                            function (item) {

                                return (
                                    escaparHtml(
                                        item.elemento
                                    ) +
                                    ": " +
                                    escaparHtml(
                                        item.talla
                                    )
                                );
                            }
                        )
                        .join("<br>");
            }


            fila.innerHTML =

                "<td>" +
                escaparHtml(
                    empleado.codigo
                ) +
                "</td>" +

                "<td>" +
                obtenerFotoEmpleadoHtml(
                    empleado
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    empleado.nombre
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    empleado.documento
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    empleado.cargo
                ) +
                "</td>" +

                "<td>" +
                (
                    tallasTexto ||
                    "Sin talla"
                ) +
                "</td>" +

                '<td>' +
                '<div class="acciones-tabla">' +

                '<button type="button" class="btn-tabla btn-editar-empleado">' +
                "Editar" +
                "</button>" +

                '<button type="button" class="btn-tabla btn-eliminar-empleado">' +
                "Eliminar" +
                "</button>" +

                "</div>" +
                "</td>";


            fila
                .querySelector(
                    ".btn-editar-empleado"
                )
                .addEventListener(
                    "click",
                    function () {

                        abrirModalEmpleado(
                            empleado
                        );
                    }
                );


            fila
                .querySelector(
                    ".btn-eliminar-empleado"
                )
                .addEventListener(
                    "click",
                    function () {

                        var confirmar =
                            confirm(
                                "¿Está seguro de eliminar al empleado " +
                                empleado.nombre +
                                "?"
                            );


                        if (!confirmar) {
                            return;
                        }


                        empleados =
                            empleados.filter(
                                function (item) {

                                    return !esMismoId(
                                        item.id,
                                        empleado.id
                                    );
                                }
                            );


                        guardarDatos();

                        mostrarEmpleados();

                        cargarSelectEmpleados();

                        mostrarEntregas();

                        actualizarDashboard();

                        generarReporte();
                    }
                );


            tablaEmpleadosBody.appendChild(
                fila
            );
        }
    );
}


if (buscarEmpleado) {

    buscarEmpleado.addEventListener(
        "input",
        mostrarEmpleados
    );
}


/* =========================================================
   DOTACION
========================================================= */

if (nuevaEntrega) {

    nuevaEntrega.addEventListener(
        "click",
        function () {

            abrirModalEntrega();
        }
    );
}


if (cerrarModalEntrega) {

    cerrarModalEntrega.addEventListener(
        "click",
        cerrarEntregaModal
    );
}


if (cancelarEntrega) {

    cancelarEntrega.addEventListener(
        "click",
        cerrarEntregaModal
    );
}


function cargarSelectEmpleados() {

    if (!entregaEmpleado) {
        return;
    }


    entregaEmpleado.innerHTML =
        '<option value="">' +
        "Seleccione empleado" +
        "</option>";


    empleados.forEach(
        function (empleado) {

            var opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                empleado.id;

            opcion.textContent =
                (
                    empleado.codigo ||
                    ""
                ) +
                " - " +
                (
                    empleado.nombre ||
                    ""
                );

            entregaEmpleado.appendChild(
                opcion
            );
        }
    );
}


function cargarSelectElementos() {

    if (!entregaElemento) {
        return;
    }


    entregaElemento.innerHTML =
        '<option value="">' +
        "Seleccione elemento" +
        "</option>";


    elementosDotacion.forEach(
        function (elemento) {

            var opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                elemento;

            opcion.textContent =
                elemento;

            entregaElemento.appendChild(
                opcion
            );
        }
    );
}


function cargarSelectCentrosCosto() {

    if (!entregaCentroCosto) {
        return;
    }


    entregaCentroCosto.innerHTML =
        '<option value="">' +
        "Seleccione centro de costo" +
        "</option>";


    centrosCosto.forEach(
        function (centro) {

            var opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                centro;

            opcion.textContent =
                centro;

            entregaCentroCosto.appendChild(
                opcion
            );
        }
    );
}


function actualizarTallasEntrega() {

    if (
        !entregaElemento ||
        !entregaTalla
    ) {

        return;
    }


    var elemento =
        entregaElemento.value;


    var tallas =
        obtenerTallasParaElemento(
            elemento
        );


    var valorAnterior =
        entregaTalla.value;


    entregaTalla.innerHTML =
        '<option value="">' +
        "Seleccione talla" +
        "</option>";


    tallas.forEach(
        function (talla) {

            var opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                talla;

            opcion.textContent =
                talla;

            entregaTalla.appendChild(
                opcion
            );
        }
    );


    if (
        valorAnterior &&
        !tallas.includes(
            String(valorAnterior)
        )
    ) {

        var opcionAntigua =
            document.createElement(
                "option"
            );

        opcionAntigua.value =
            valorAnterior;

        opcionAntigua.textContent =
            valorAnterior;

        entregaTalla.appendChild(
            opcionAntigua
        );
    }


    entregaTalla.value =
        valorAnterior;
}


if (entregaElemento) {

    entregaElemento.addEventListener(
        "change",
        actualizarTallasEntrega
    );
}


/* =========================================================
   ABRIR MODAL DE ENTREGA
========================================================= */

function abrirModalEntrega(
    entrega
) {

    entregaEditando =
        entrega || null;


    tituloModalEntrega.textContent =
        entrega
            ? "Editar entrega"
            : "Nueva entrega";


    formEntrega.reset();


    cargarSelectEmpleados();

    cargarSelectElementos();

    cargarSelectCentrosCosto();


    if (entrega) {

        entregaId.value =
            entrega.id || "";

        entregaEmpleado.value =
            entrega.empleadoId || "";

        entregaElemento.value =
            entrega.elemento || "";

        entregaCentroCosto.value =
            entrega.centroCosto || "";

        entregaCantidad.value =
            entrega.cantidad || "";


        actualizarTallasEntrega();


        entregaTalla.value =
            entrega.talla || "";

        entregaFecha.value =
            entrega.fecha ||
            obtenerFechaActual();

        entregaEstado.value =
            entrega.estado ||
            "Pendiente";

        entregaObservaciones.value =
            entrega.observaciones ||
            "";

    } else {

        entregaId.value =
            "";

        entregaFecha.value =
            obtenerFechaActual();

        entregaEstado.value =
            "Pendiente";
    }


    modalEntrega.classList.remove(
        "oculto"
    );
}


function cerrarEntregaModal() {

    modalEntrega.classList.add(
        "oculto"
    );

    entregaEditando = null;
}


/* =========================================================
   GUARDAR ENTREGA
========================================================= */

if (formEntrega) {

    formEntrega.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            var empleadoSeleccionado =
                empleados.find(
                    function (empleado) {

                        return esMismoId(
                            empleado.id,
                            entregaEmpleado.value
                        );
                    }
                );


            if (
                !entregaEmpleado.value ||
                !entregaElemento.value ||
                !entregaCentroCosto.value ||
                !entregaCantidad.value ||
                !entregaFecha.value ||
                !entregaEstado.value
            ) {

                alert(
                    "Completa todos los datos obligatorios de la entrega."
                );

                return;
            }


            var nombreEmpleado =
                empleadoSeleccionado
                    ? empleadoSeleccionado.nombre
                    : entregaEditando
                        ? entregaEditando.empleadoNombre
                        : "Empleado eliminado";


            var codigoEmpleado =
                empleadoSeleccionado
                    ? empleadoSeleccionado.codigo
                    : entregaEditando
                        ? entregaEditando.empleadoCodigo
                        : "";


            var archivoEvidencia =
                entregaEvidencia.files &&
                entregaEvidencia.files.length > 0
                    ? entregaEvidencia.files[0]
                    : null;


            var entregaBase = {

                id:
                    entregaEditando
                        ? entregaEditando.id
                        : generarId(),

                empleadoId:
                    entregaEmpleado.value,

                empleadoNombre:
                    nombreEmpleado,

                empleadoCodigo:
                    codigoEmpleado,

                elemento:
                    entregaElemento.value,

                centroCosto:
                    entregaCentroCosto.value,

                cantidad:
                    entregaCantidad.value,

                talla:
                    entregaTalla.value,

                fecha:
                    entregaFecha.value,

                estado:
                    entregaEstado.value,

                observaciones:
                    entregaObservaciones.value,

                evidencia:
                    entregaEditando
                        ? entregaEditando.evidencia || ""
                        : ""
            };


            if (archivoEvidencia) {

                leerArchivoComoDataURL(
                    archivoEvidencia,
                    function (
                        evidenciaDataURL
                    ) {

                        if (
                            !evidenciaDataURL
                        ) {

                            return;
                        }


                        entregaBase.evidencia =
                            evidenciaDataURL;


                        guardarEntregaFinal(
                            entregaBase
                        );
                    }
                );

            } else {

                guardarEntregaFinal(
                    entregaBase
                );
            }

        }
    );
}


function guardarEntregaFinal(
    entregaBase
) {

    if (entregaEditando) {

        var indice =
            entregas.findIndex(
                function (entrega) {

                    return esMismoId(
                        entrega.id,
                        entregaEditando.id
                    );
                }
            );


        if (indice !== -1) {

            entregas[indice] =
                entregaBase;
        }


        historial.forEach(
            function (registro) {

                if (
                    esMismoId(
                        registro.entregaId,
                        entregaBase.id
                    )
                ) {

                    registro.empleadoId =
                        entregaBase.empleadoId;

                    registro.empleadoNombre =
                        entregaBase.empleadoNombre;

                    registro.empleadoCodigo =
                        entregaBase.empleadoCodigo;

                    registro.elemento =
                        entregaBase.elemento;

                    registro.centroCosto =
                        entregaBase.centroCosto;

                    registro.cantidad =
                        entregaBase.cantidad;

                    registro.talla =
                        entregaBase.talla;

                    registro.fecha =
                        entregaBase.fecha;

                    registro.estado =
                        entregaBase.estado;

                    registro.observaciones =
                        entregaBase.observaciones;

                    registro.evidencia =
                        entregaBase.evidencia;
                }
            }
        );

    } else {

        entregas.push(
            entregaBase
        );


        historial.push({

            id:
                generarId(),

            entregaId:
                entregaBase.id,

            empleadoId:
                entregaBase.empleadoId,

            empleadoNombre:
                entregaBase.empleadoNombre,

            empleadoCodigo:
                entregaBase.empleadoCodigo,

            elemento:
                entregaBase.elemento,

            centroCosto:
                entregaBase.centroCosto,

            cantidad:
                entregaBase.cantidad,

            talla:
                entregaBase.talla,

            fecha:
                entregaBase.fecha,

            estado:
                entregaBase.estado,

            observaciones:
                entregaBase.observaciones,

            evidencia:
                entregaBase.evidencia
        });
    }


    guardarDatos();

    cerrarEntregaModal();

    mostrarEntregas();

    mostrarHistorial();

    actualizarDashboard();

    generarReporte();
}


/* =========================================================
   EVIDENCIA
========================================================= */

function obtenerEvidenciaHtml(
    entrega
) {

    if (
        !entrega ||
        !entrega.evidencia
    ) {

        return "Sin evidencia";
    }


    var evidencia =
        String(
            entrega.evidencia
        ).trim();


    /*
       FOTO NUEVA GUARDADA COMO DATA URL
    */

    if (
        evidencia.indexOf(
            "data:image/"
        ) === 0
    ) {

        return (

            '<a href="' +
            evidencia +
            '" target="_blank" rel="noopener noreferrer" title="Ver evidencia en tamaño completo">' +

            '<img src="' +
            evidencia +
            '" alt="Evidencia" class="evidencia-foto">' +

            "</a>"
        );
    }


    /*
       COMPATIBILIDAD CON ENLACES WEB
    */

    if (
        evidencia.indexOf(
            "http://"
        ) === 0 ||

        evidencia.indexOf(
            "https://"
        ) === 0
    ) {

        return (

            '<a href="' +
            escaparHtml(evidencia) +
            '" target="_blank" rel="noopener noreferrer">' +

            "Ver evidencia" +

            "</a>"
        );
    }


    /*
       ARCHIVO ANTIGUO QUE YA NO ES ACCESIBLE
    */

    return "Evidencia no disponible";
}


/* =========================================================
   MOSTRAR ENTREGAS
========================================================= */

function mostrarEntregas() {

    if (!tablaDotacionBody) {
        return;
    }


    tablaDotacionBody.innerHTML =
        "";


    var textoBusqueda =
        buscarEntrega
            ? buscarEntrega.value
                .trim()
                .toLowerCase()
            : "";


    var entregasFiltradas =
        entregas.filter(
            function (entrega) {

                if (!textoBusqueda) {
                    return true;
                }


                return (

                    String(
                        entrega.empleadoNombre || ""
                    )
                        .toLowerCase()
                        .includes(
                            textoBusqueda
                        ) ||

                    String(
                        entrega.empleadoCodigo || ""
                    )
                        .toLowerCase()
                        .includes(
                            textoBusqueda
                        ) ||

                    String(
                        entrega.elemento || ""
                    )
                        .toLowerCase()
                        .includes(
                            textoBusqueda
                        ) ||

                    String(
                        entrega.centroCosto || ""
                    )
                        .toLowerCase()
                        .includes(
                            textoBusqueda
                        )
                );
            }
        );


    if (
        entregasFiltradas.length === 0
    ) {

        tablaDotacionBody.innerHTML =
            '<tr>' +
            '<td colspan="11" class="sin-datos">' +
            "No hay entregas registradas." +
            "</td>" +
            "</tr>";

        return;
    }


    entregasFiltradas.forEach(
        function (entrega) {

            var fila =
                document.createElement(
                    "tr"
                );


            fila.innerHTML =

                "<td>" +
                escaparHtml(
                    entrega.empleadoCodigo
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    entrega.empleadoNombre
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    entrega.elemento
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    entrega.centroCosto
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    entrega.cantidad
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    entrega.talla
                ) +
                "</td>" +

                "<td>" +
                formatearFecha(
                    entrega.fecha
                ) +
                "</td>" +

                "<td>" +
                obtenerEstadoHtml(
                    entrega.estado
                ) +
                "</td>" +

                "<td>" +
                obtenerEvidenciaHtml(
                    entrega
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    entrega.observaciones
                ) +
                "</td>" +

                "<td>" +

                '<div class="acciones-tabla">' +

                '<button type="button" class="btn-tabla btn-editar-entrega">' +
                "Editar" +
                "</button>" +

                '<button type="button" class="btn-tabla btn-eliminar-entrega">' +
                "Eliminar" +
                "</button>" +

                "</div>" +

                "</td>";


            fila
                .querySelector(
                    ".btn-editar-entrega"
                )
                .addEventListener(
                    "click",
                    function () {

                        abrirModalEntrega(
                            entrega
                        );
                    }
                );


            fila
                .querySelector(
                    ".btn-eliminar-entrega"
                )
                .addEventListener(
                    "click",
                    function () {

                        var confirmar =
                            confirm(
                                "¿Desea eliminar esta entrega?"
                            );


                        if (!confirmar) {
                            return;
                        }


                        entregas =
                            entregas.filter(
                                function (item) {

                                    return !esMismoId(
                                        item.id,
                                        entrega.id
                                    );
                                }
                            );


                        guardarDatos();

                        mostrarEntregas();

                        actualizarDashboard();

                        generarReporte();
                    }
                );


            tablaDotacionBody.appendChild(
                fila
            );
        }
    );
}


if (buscarEntrega) {

    buscarEntrega.addEventListener(
        "input",
        mostrarEntregas
    );
}


/* =========================================================
   HISTORIAL
========================================================= */

function mostrarHistorial() {

    if (!tablaHistorialBody) {
        return;
    }


    tablaHistorialBody.innerHTML =
        "";


    if (
        historial.length === 0
    ) {

        tablaHistorialBody.innerHTML =
            '<tr>' +
            '<td colspan="8" class="sin-datos">' +
            "No hay registros en el historial." +
            "</td>" +
            "</tr>";

        return;
    }


    historial.forEach(
        function (registro) {

            var fila =
                document.createElement(
                    "tr"
                );


            fila.innerHTML =

                "<td>" +
                formatearFecha(
                    registro.fecha
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    registro.empleadoCodigo
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    registro.empleadoNombre
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    registro.elemento
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    registro.centroCosto
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    registro.cantidad
                ) +
                "</td>" +

                "<td>" +
                escaparHtml(
                    registro.talla
                ) +
                "</td>" +

                "<td>" +
                obtenerEstadoHtml(
                    registro.estado
                ) +
                "</td>";


            tablaHistorialBody.appendChild(
                fila
            );
        }
    );
}


/* =========================================================
   DASHBOARD
========================================================= */

function actualizarDashboard() {

    if (totalEmpleados) {

        totalEmpleados.textContent =
            empleados.length;
    }


    if (totalEntregas) {

        totalEntregas.textContent =
            entregas.length;
    }


    var pendientes =
        entregas.filter(
            function (entrega) {

                return (
                    String(
                        entrega.estado || ""
                    )
                        .toLowerCase() ===
                    "pendiente"
                );
            }
        ).length;


    if (totalPendientes) {

        totalPendientes.textContent =
            pendientes;
    }


    var hoy =
        new Date();


    var mesActual =
        hoy.getMonth();


    var añoActual =
        hoy.getFullYear();


    var entregasMes =
        entregas.filter(
            function (entrega) {

                if (!entrega.fecha) {
                    return false;
                }


                var fecha =
                    new Date(
                        String(
                            entrega.fecha
                        ) +
                        "T00:00:00"
                    );


                return (

                    fecha.getMonth() ===
                    mesActual &&

                    fecha.getFullYear() ===
                    añoActual
                );
            }
        ).length;


    if (totalMes) {

        totalMes.textContent =
            entregasMes;
    }


    if (ultimasEntregasBody) {

        ultimasEntregasBody.innerHTML =
            "";


        var ultimas =
            entregas
                .slice()
                .sort(
                    function (a, b) {

                        return String(
                            b.fecha || ""
                        ).localeCompare(
                            String(
                                a.fecha || ""
                            )
                        );
                    }
                )
                .slice(
                    0,
                    5
                );


        if (
            ultimas.length === 0
        ) {

            ultimasEntregasBody.innerHTML =
                '<tr>' +
                '<td colspan="4" class="sin-datos">' +
                "No hay entregas registradas." +
                "</td>" +
                "</tr>";

            return;
        }


        ultimas.forEach(
            function (entrega) {

                var fila =
                    document.createElement(
                        "tr"
                    );


                fila.innerHTML =

                    "<td>" +
                    formatearFecha(
                        entrega.fecha
                    ) +
                    "</td>" +

                    "<td>" +
                    escaparHtml(
                        entrega.empleadoNombre
                    ) +
                    "</td>" +

                    "<td>" +
                    escaparHtml(
                        entrega.elemento
                    ) +
                    "</td>" +

                    "<td>" +
                    obtenerEstadoHtml(
                        entrega.estado
                    ) +
                    "</td>";


                ultimasEntregasBody.appendChild(
                    fila
                );
            }
        );
    }
}


/* =========================================================
   REPORTES
========================================================= */

function obtenerEntregasReporte() {

    var texto =
        reporteBuscar
            ? reporteBuscar.value
                .trim()
                .toLowerCase()
            : "";


    var estado =
        reporteEstado
            ? reporteEstado.value
            : "";


    var fechaInicio =
        reporteFechaInicio
            ? reporteFechaInicio.value
            : "";


    var fechaFin =
        reporteFechaFin
            ? reporteFechaFin.value
            : "";


    return entregas.filter(
        function (entrega) {

            if (texto) {

                var coincideTexto =

                    String(
                        entrega.empleadoCodigo || ""
                    )
                        .toLowerCase()
                        .includes(
                            texto
                        ) ||

                    String(
                        entrega.empleadoNombre || ""
                    )
                        .toLowerCase()
                        .includes(
                            texto
                        ) ||

                    String(
                        entrega.elemento || ""
                    )
                        .toLowerCase()
                        .includes(
                            texto
                        ) ||

                    String(
                        entrega.centroCosto || ""
                    )
                        .toLowerCase()
                        .includes(
                            texto
                        );


                if (!coincideTexto) {

                    return false;
                }
            }


            if (
                estado &&
                entrega.estado !==
                    estado
            ) {

                return false;
            }


            if (
                fechaInicio &&
                String(
                    entrega.fecha || ""
                ) < fechaInicio
            ) {

                return false;
            }


            if (
                fechaFin &&
                String(
                    entrega.fecha || ""
                ) > fechaFin
            ) {

                return false;
            }


            return true;
        }
    );
}


function generarReporte() {

    if (!tablaReporteBody) {
        return;
    }


    var datos =
        obtenerEntregasReporte();


    tablaReporteBody.innerHTML =
        "";


    if (
        datos.length === 0
    ) {

        tablaReporteBody.innerHTML =
            '<tr>' +
            '<td colspan="10" class="sin-datos">' +
            "No hay datos para el reporte." +
            "</td>" +
            "</tr>";

    } else {

        datos.forEach(
            function (entrega) {

                var fila =
                    document.createElement(
                        "tr"
                    );


                fila.innerHTML =

                    "<td>" +
                    escaparHtml(
                        entrega.empleadoCodigo
                    ) +
                    "</td>" +

                    "<td>" +
                    escaparHtml(
                        entrega.empleadoNombre
                    ) +
                    "</td>" +

                    "<td>" +
                    escaparHtml(
                        entrega.elemento
                    ) +
                    "</td>" +

                    "<td>" +
                    escaparHtml(
                        entrega.centroCosto
                    ) +
                    "</td>" +

                    "<td>" +
                    escaparHtml(
                        entrega.cantidad
                    ) +
                    "</td>" +

                    "<td>" +
                    escaparHtml(
                        entrega.talla
                    ) +
                    "</td>" +

                    "<td>" +
                    formatearFecha(
                        entrega.fecha
                    ) +
                    "</td>" +

                    "<td>" +
                    obtenerEstadoHtml(
                        entrega.estado
                    ) +
                    "</td>" +

                    "<td>" +
                    obtenerEvidenciaHtml(
                        entrega
                    ) +
                    "</td>" +

                    "<td>" +
                    escaparHtml(
                        entrega.observaciones
                    ) +
                    "</td>";


                tablaReporteBody.appendChild(
                    fila
                );
            }
        );
    }


    var entregadas =
        datos.filter(
            function (entrega) {

                return (
                    String(
                        entrega.estado || ""
                    )
                        .toLowerCase() ===
                    "entregada"
                );
            }
        ).length;


    var pendientesReporte =
        datos.filter(
            function (entrega) {

                return (
                    String(
                        entrega.estado || ""
                    )
                        .toLowerCase() ===
                    "pendiente"
                );
            }
        ).length;


    var empleadosUnicos = [];


    datos.forEach(
        function (entrega) {

            var identificador =
                String(

                    entrega.empleadoId ||

                    entrega.empleadoCodigo ||

                    entrega.empleadoNombre ||

                    ""
                );


            if (
                !empleadosUnicos.includes(
                    identificador
                )
            ) {

                empleadosUnicos.push(
                    identificador
                );
            }
        }
    );


    if (reporteTotalEntregas) {

        reporteTotalEntregas.textContent =
            datos.length;
    }


    if (reporteEntregadas) {

        reporteEntregadas.textContent =
            entregadas;
    }


    if (reportePendientes) {

        reportePendientes.textContent =
            pendientesReporte;
    }


    if (reporteEmpleados) {

        reporteEmpleados.textContent =
            empleadosUnicos.length;
    }
}


if (actualizarReporte) {

    actualizarReporte.addEventListener(
        "click",
        generarReporte
    );
}


if (limpiarReporte) {

    limpiarReporte.addEventListener(
        "click",
        function () {

            if (reporteBuscar) {
                reporteBuscar.value = "";
            }

            if (reporteEstado) {
                reporteEstado.value = "";
            }

            if (reporteFechaInicio) {
                reporteFechaInicio.value = "";
            }

            if (reporteFechaFin) {
                reporteFechaFin.value = "";
            }

            generarReporte();
        }
    );
}


/* =========================================================
   DESCARGAR CSV
========================================================= */

if (descargarReporte) {

    descargarReporte.addEventListener(
        "click",
        function () {

            var datos =
                obtenerEntregasReporte();


            if (
                datos.length === 0
            ) {

                alert(
                    "No hay datos para descargar."
                );

                return;
            }


            var filas = [

                [
                    "Código",
                    "Empleado",
                    "Elemento",
                    "Centro de costo",
                    "Cantidad",
                    "Talla",
                    "Fecha",
                    "Estado",
                    "Evidencia",
                    "Observaciones"
                ]

            ];


            datos.forEach(
                function (entrega) {

                    filas.push([

                        entrega.empleadoCodigo ||
                            "",

                        entrega.empleadoNombre ||
                            "",

                        entrega.elemento ||
                            "",

                        entrega.centroCosto ||
                            "",

                        entrega.cantidad ||
                            "",

                        entrega.talla ||
                            "",

                        entrega.fecha ||
                            "",

                        entrega.estado ||
                            "",

                        entrega.evidencia
                            ? "Sí"
                            : "No",

                        entrega.observaciones ||
                            ""
                    ]);
                }
            );


            var csv =
                filas
                    .map(
                        function (fila) {

                            return fila
                                .map(
                                    function (
                                        valor
                                    ) {

                                        return (
                                            '"' +
                                            String(
                                                valor
                                            )
                                                .replace(
                                                    /"/g,
                                                    '""'
                                                ) +
                                            '"'
                                        );
                                    }
                                )
                                .join(",");
                        }
                    )
                    .join("\n");


            var blob =
                new Blob(
                    [csv],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            var url =
                URL.createObjectURL(
                    blob
                );


            var enlace =
                document.createElement(
                    "a"
                );


            enlace.href =
                url;


            enlace.download =
                "reporte_dotacion.csv";


            document.body.appendChild(
                enlace
            );


            enlace.click();


            document.body.removeChild(
                enlace
            );


            URL.revokeObjectURL(
                url
            );
        }
    );
}


/* =========================================================
   IMPRIMIR
========================================================= */

if (imprimirReporte) {

    imprimirReporte.addEventListener(
        "click",
        function () {

            window.print();
        }
    );
}


/* =========================================================
   CARGAR TODO
========================================================= */

function cargarTodo() {

    actualizarDashboard();

    mostrarEmpleados();

    cargarSelectEmpleados();

    cargarSelectElementos();

    cargarSelectCentrosCosto();

    mostrarEntregas();

    mostrarHistorial();

    generarReporte();
}


/* =========================================================
   INICIALIZACION
========================================================= */

if (
    pantallaLogin &&
    dashboard
) {

    dashboard.classList.add(
        "oculto"
    );

    pantallaLogin.classList.remove(
        "oculto"
    );
}