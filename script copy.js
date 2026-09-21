/* =====================================================
   CONTROL DE DOTACIÓN
   ===================================================== */

/* ================= VARIABLES ================= */

let empleados = JSON.parse(localStorage.getItem("empleados")) || [];
let entregas = JSON.parse(localStorage.getItem("entregas")) || [];

let empleadoEditando = null;
let entregaEditando = null;


/* =====================================================
   FUNCIONES AUXILIARES
   ===================================================== */

/* Buscar empleado sin importar si el ID es texto o número */
function buscarEmpleadoPorId(id) {
    return empleados.find(function (empleado) {
        return String(empleado.id) === String(id);
    });
}


/* Formato de fecha */
function formatearFecha(fecha) {
    if (!fecha) return "-";

    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


/* Proteger texto HTML */
function escapeHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}


/* =====================================================
   RECUPERAR DATOS ANTIGUOS
   ===================================================== */

/*
   Si una entrega antigua todavía tiene un empleado válido,
   guardamos también su nombre y código.

   Esto evita depender únicamente del ID.
*/

entregas = entregas.map(function (entrega) {

    const empleado = buscarEmpleadoPorId(entrega.empleadoId);

    return {
        ...entrega,
        empleadoNombre:
            entrega.empleadoNombre ||
            (empleado ? empleado.nombre : ""),
        empleadoCodigo:
            entrega.empleadoCodigo ||
            (empleado ? empleado.codigo : "")
    };
});

localStorage.setItem(
    "entregas",
    JSON.stringify(entregas)
);


/* ================= ELEMENTOS LOGIN ================= */

const pantallaLogin = document.getElementById("pantallaLogin");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const usuario = document.getElementById("usuario");
const password = document.getElementById("password");
const mostrarPassword = document.getElementById("mostrarPassword");
const mensaje = document.getElementById("mensaje");


/* =====================================================
   MOSTRAR CONTRASEÑA
   ===================================================== */

mostrarPassword.addEventListener("click", function () {

    if (password.type === "password") {

        password.type = "text";
        mostrarPassword.textContent = "🙈";

    } else {

        password.type = "password";
        mostrarPassword.textContent = "👁️";
    }
});


/* =====================================================
   LOGIN
   ===================================================== */

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const usuarioIngresado = usuario.value.trim();
    const passwordIngresada = password.value;

    if (
        usuarioIngresado === "admin" &&
        passwordIngresada === "123456"
    ) {

        pantallaLogin.classList.add("oculto");
        dashboard.classList.remove("oculto");

        mensaje.textContent = "";

        actualizarDashboard();

    } else {

        mensaje.textContent =
            "Usuario o contraseña incorrectos.";

        mensaje.style.color = "#dc2626";
    }
});


/* =====================================================
   CERRAR SESIÓN
   ===================================================== */

document.getElementById("cerrarSesion").addEventListener(
    "click",
    function () {

        dashboard.classList.add("oculto");
        pantallaLogin.classList.remove("oculto");

        loginForm.reset();
    }
);


/* =====================================================
   NAVEGACIÓN
   ===================================================== */

const botonesMenu =
    document.querySelectorAll(".menu-item");

const secciones = {

    inicio: document.getElementById("seccionInicio"),

    empleados:
        document.getElementById("seccionEmpleados"),

    dotacion:
        document.getElementById("seccionDotacion"),

    historial:
        document.getElementById("seccionHistorial"),

    reportes:
        document.getElementById("seccionReportes"),

    configuracion:
        document.getElementById("seccionConfiguracion")
};


botonesMenu.forEach(function (boton) {

    boton.addEventListener("click", function () {

        const seccionSeleccionada =
            boton.dataset.seccion;

        botonesMenu.forEach(function (item) {
            item.classList.remove("activo");
        });

        boton.classList.add("activo");

        Object.values(secciones).forEach(
            function (seccion) {
                seccion.classList.add("oculto");
            }
        );

        secciones[seccionSeleccionada]
            .classList.remove("oculto");


        if (seccionSeleccionada === "empleados") {
            mostrarEmpleados();
        }


        if (seccionSeleccionada === "dotacion") {

            cargarEmpleadosEnSelect();
            mostrarEntregas();
        }


        if (seccionSeleccionada === "historial") {
            mostrarEntregas();
        }


        actualizarDashboard();
    });
});


/* =====================================================
   EMPLEADOS
   ===================================================== */

const nuevoEmpleado =
    document.getElementById("nuevoEmpleado");

const formularioEmpleado =
    document.getElementById("formularioEmpleado");

const formEmpleado =
    document.getElementById("formEmpleado");

const cancelarEmpleado =
    document.getElementById("cancelarEmpleado");

const tablaEmpleados =
    document.getElementById("tablaEmpleados");

const buscarEmpleado =
    document.getElementById("buscarEmpleado");


/* ================= NUEVO EMPLEADO ================= */

nuevoEmpleado.addEventListener("click", function () {

    empleadoEditando = null;

    document.getElementById("tituloFormulario")
        .textContent = "Nuevo empleado";

    formEmpleado.reset();

    formularioEmpleado.classList.remove("oculto");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


/* ================= CANCELAR EMPLEADO ================= */

cancelarEmpleado.addEventListener("click", function () {

    empleadoEditando = null;

    formEmpleado.reset();

    formularioEmpleado.classList.add("oculto");
});


/* ================= GUARDAR EMPLEADO ================= */

formEmpleado.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const codigo =
            document.getElementById("codigoEmpleado")
                .value.trim();

        const nombre =
            document.getElementById("nombreEmpleado")
                .value.trim();

        const cedula =
            document.getElementById("cedulaEmpleado")
                .value.trim();

        const cargo =
            document.getElementById("cargoEmpleado")
                .value.trim();

        const area =
            document.getElementById("areaEmpleado")
                .value.trim();

        const tallaCamisa =
            document.getElementById("tallaCamisa").value;

        const tallaPantalon =
            document.getElementById("tallaPantalon").value;

        const tallaCalzado =
            document.getElementById("tallaCalzado").value;

        const estado =
            document.getElementById("estadoEmpleado").value;

        const observaciones =
            document.getElementById(
                "observacionesEmpleado"
            ).value.trim();

        const archivoFoto =
            document.getElementById(
                "fotoEmpleado"
            ).files[0];


        /* VERIFICAR CÓDIGO DUPLICADO */

        const codigoDuplicado =
            empleados.some(function (empleado) {

                return (
                    String(empleado.codigo).toLowerCase() ===
                    codigo.toLowerCase() &&

                    String(empleado.id) !==
                    String(empleadoEditando)
                );
            });


        if (codigoDuplicado) {

            alert(
                "Ya existe un empleado con ese código."
            );

            return;
        }


        /* FUNCIÓN PARA GUARDAR */

        function guardarEmpleado(foto) {

            if (empleadoEditando) {

                const indice =
                    empleados.findIndex(
                        function (empleado) {

                            return (
                                String(empleado.id) ===
                                String(empleadoEditando)
                            );
                        }
                    );


                if (indice !== -1) {

                    empleados[indice] = {

                        ...empleados[indice],

                        codigo,
                        nombre,
                        cedula,
                        cargo,
                        area,
                        tallaCamisa,
                        tallaPantalon,
                        tallaCalzado,
                        estado,
                        observaciones
                    };


                    if (foto) {
                        empleados[indice].foto = foto;
                    }
                }

            } else {

                const nuevo = {

                    id: Date.now().toString(),

                    codigo,
                    nombre,
                    cedula,
                    cargo,
                    area,
                    tallaCamisa,
                    tallaPantalon,
                    tallaCalzado,
                    estado,
                    observaciones,

                    foto: foto || ""
                };

                empleados.push(nuevo);
            }


            localStorage.setItem(
                "empleados",
                JSON.stringify(empleados)
            );


            /*
               Actualizar también el nombre y código
               en las entregas de ese empleado.
            */

            empleados.forEach(function (empleado) {

                entregas.forEach(function (entrega) {

                    if (
                        String(entrega.empleadoId) ===
                        String(empleado.id)
                    ) {

                        entrega.empleadoNombre =
                            empleado.nombre;

                        entrega.empleadoCodigo =
                            empleado.codigo;
                    }
                });
            });


            localStorage.setItem(
                "entregas",
                JSON.stringify(entregas)
            );


            formEmpleado.reset();

            empleadoEditando = null;

            formularioEmpleado.classList.add(
                "oculto"
            );

            mostrarEmpleados();

            actualizarDashboard();

            cargarEmpleadosEnSelect();

            mostrarEntregas();

            alert(
                "Empleado guardado correctamente."
            );
        }


        /* SI HAY FOTO */

        if (archivoFoto) {

            const lector = new FileReader();

            lector.onload = function (event) {

                guardarEmpleado(
                    event.target.result
                );
            };

            lector.readAsDataURL(archivoFoto);

        } else {

            guardarEmpleado("");
        }
    }
);


/* ================= MOSTRAR EMPLEADOS ================= */

function mostrarEmpleados() {

    const textoBusqueda =
        buscarEmpleado.value.toLowerCase().trim();


    const filtrados =
        empleados.filter(function (empleado) {

            return (

                String(empleado.nombre || "")
                    .toLowerCase()
                    .includes(textoBusqueda)

                ||

                String(empleado.codigo || "")
                    .toLowerCase()
                    .includes(textoBusqueda)

                ||

                String(empleado.cedula || "")
                    .toLowerCase()
                    .includes(textoBusqueda)
            );
        });


    tablaEmpleados.innerHTML = "";


    if (filtrados.length === 0) {

        tablaEmpleados.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    No hay empleados registrados.
                </td>
            </tr>
        `;

        return;
    }


    filtrados.forEach(function (empleado) {

        const fila =
            document.createElement("tr");


        const foto = empleado.foto

            ? `<img
                    src="${empleado.foto}"
                    class="foto-miniatura"
                >`

            : "👤";


        const estadoClase =
            empleado.estado === "Activo"

                ? "estado-activo"

                : "estado-inactivo";


        fila.innerHTML = `

            <td>
                ${escapeHtml(empleado.codigo)}
            </td>

            <td>
                ${foto}
                ${escapeHtml(empleado.nombre)}
            </td>

            <td>
                ${escapeHtml(empleado.cedula)}
            </td>

            <td>
                ${escapeHtml(empleado.cargo || "-")}
            </td>

            <td>
                ${escapeHtml(empleado.area || "-")}
            </td>

            <td>

                Camisa:
                ${escapeHtml(
                    empleado.tallaCamisa || "-"
                )}

                <br>

                Pantalón:
                ${escapeHtml(
                    empleado.tallaPantalon || "-"
                )}

                <br>

                Calzado:
                ${escapeHtml(
                    empleado.tallaCalzado || "-"
                )}

            </td>

            <td>

                <span class="${estadoClase}">
                    ${escapeHtml(empleado.estado)}
                </span>

            </td>

            <td>

                <button
                    class="boton-editar"
                    onclick="editarEmpleado('${empleado.id}')"
                >
                    ✏️
                </button>

                <button
                    class="boton-eliminar"
                    onclick="eliminarEmpleado('${empleado.id}')"
                >
                    🗑️
                </button>

            </td>
        `;


        tablaEmpleados.appendChild(fila);
    });
}


/* ================= BUSCAR EMPLEADO ================= */

buscarEmpleado.addEventListener(
    "input",
    function () {
        mostrarEmpleados();
    }
);


/* ================= EDITAR EMPLEADO ================= */

function editarEmpleado(id) {

    const empleado =
        buscarEmpleadoPorId(id);


    if (!empleado) return;


    empleadoEditando = empleado.id;


    document.getElementById(
        "tituloFormulario"
    ).textContent = "Editar empleado";


    document.getElementById(
        "codigoEmpleado"
    ).value = empleado.codigo || "";


    document.getElementById(
        "nombreEmpleado"
    ).value = empleado.nombre || "";


    document.getElementById(
        "cedulaEmpleado"
    ).value = empleado.cedula || "";


    document.getElementById(
        "cargoEmpleado"
    ).value = empleado.cargo || "";


    document.getElementById(
        "areaEmpleado"
    ).value = empleado.area || "";


    document.getElementById(
        "tallaCamisa"
    ).value = empleado.tallaCamisa || "";


    document.getElementById(
        "tallaPantalon"
    ).value = empleado.tallaPantalon || "";


    document.getElementById(
        "tallaCalzado"
    ).value = empleado.tallaCalzado || "";


    document.getElementById(
        "estadoEmpleado"
    ).value = empleado.estado || "Activo";


    document.getElementById(
        "observacionesEmpleado"
    ).value =
        empleado.observaciones || "";


    formularioEmpleado.classList.remove(
        "oculto"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================= ELIMINAR EMPLEADO ================= */

function eliminarEmpleado(id) {

    const empleado =
        buscarEmpleadoPorId(id);


    if (!empleado) return;


    const confirmar = confirm(

        `¿Está seguro de eliminar al empleado ${empleado.nombre}?\n\n` +

        `Las entregas registradas se conservarán en el historial.`
    );


    if (!confirmar) return;


    /*
       IMPORTANTE:
       No eliminamos las entregas.
       Solo eliminamos al empleado.
    */

    empleados =
        empleados.filter(function (item) {

            return (
                String(item.id) !==
                String(id)
            );
        });


    localStorage.setItem(
        "empleados",
        JSON.stringify(empleados)
    );


    mostrarEmpleados();

    cargarEmpleadosEnSelect();

    actualizarDashboard();

    mostrarEntregas();
}


/* =====================================================
   DOTACIÓN
   ===================================================== */

const nuevaEntrega =
    document.getElementById("nuevaEntrega");

const formularioEntrega =
    document.getElementById(
        "formularioEntrega"
    );

const formEntrega =
    document.getElementById(
        "formEntrega"
    );

const cancelarEntrega =
    document.getElementById(
        "cancelarEntrega"
    );

const tablaEntregas =
    document.getElementById(
        "tablaEntregas"
    );

const buscarEntrega =
    document.getElementById(
        "buscarEntrega"
    );

const empleadoEntrega =
    document.getElementById(
        "empleadoEntrega"
    );

const elementoEntrega =
    document.getElementById(
        "elementoEntrega"
    );

const campoOtroElemento =
    document.getElementById(
        "campoOtroElemento"
    );


/* ================= FECHA ACTUAL ================= */

function establecerFechaActual() {

    const fecha = new Date();

    const año = fecha.getFullYear();

    const mes =
        String(fecha.getMonth() + 1)
            .padStart(2, "0");

    const dia =
        String(fecha.getDate())
            .padStart(2, "0");


    document.getElementById(
        "fechaEntrega"
    ).value =
        `${año}-${mes}-${dia}`;
}


/* ================= NUEVA ENTREGA ================= */

nuevaEntrega.addEventListener(
    "click",
    function () {

        if (empleados.length === 0) {

            alert(
                "Primero debe registrar al menos un empleado."
            );

            return;
        }


        entregaEditando = null;


        document.getElementById(
            "tituloEntrega"
        ).textContent =
            "Nueva entrega";


        formEntrega.reset();


        document.getElementById(
            "cantidadEntrega"
        ).value = 1;


        establecerFechaActual();


        cargarEmpleadosEnSelect();


        formularioEntrega.classList.remove(
            "oculto"
        );


        campoOtroElemento.classList.add(
            "oculto"
        );


        document.getElementById(
            "otroElemento"
        ).required = false;


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/* ================= CANCELAR ENTREGA ================= */

cancelarEntrega.addEventListener(
    "click",
    function () {

        entregaEditando = null;

        formEntrega.reset();

        formularioEntrega.classList.add(
            "oculto"
        );

        campoOtroElemento.classList.add(
            "oculto"
        );

        document.getElementById(
            "otroElemento"
        ).required = false;
    }
);


/* ================= MOSTRAR CAMPO OTRO ================= */

elementoEntrega.addEventListener(
    "change",
    function () {

        if (
            elementoEntrega.value ===
            "Otros elementos"
        ) {

            campoOtroElemento.classList.remove(
                "oculto"
            );

            document.getElementById(
                "otroElemento"
            ).required = true;

        } else {

            campoOtroElemento.classList.add(
                "oculto"
            );

            document.getElementById(
                "otroElemento"
            ).required = false;

            document.getElementById(
                "otroElemento"
            ).value = "";
        }
    }
);


/* ================= CARGAR EMPLEADOS ================= */

function cargarEmpleadosEnSelect() {

    empleadoEntrega.innerHTML = `
        <option value="">
            Seleccione un empleado
        </option>
    `;


    empleados.forEach(function (empleado) {

        const opcion =
            document.createElement("option");


        opcion.value = empleado.id;


        opcion.textContent =
            `${empleado.codigo} - ${empleado.nombre}`;


        empleadoEntrega.appendChild(opcion);
    });
}


/* =====================================================
   GUARDAR ENTREGA
   ===================================================== */

formEntrega.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const empleadoId =
            empleadoEntrega.value;


        const empleadoSeleccionado =
            buscarEmpleadoPorId(empleadoId);


        if (!empleadoSeleccionado) {

            alert(
                "El empleado seleccionado no existe."
            );

            return;
        }


        const elementoSeleccionado =
            elementoEntrega.value;


        const otroElemento =
            document.getElementById(
                "otroElemento"
            ).value.trim();


        const cantidad =
            document.getElementById(
                "cantidadEntrega"
            ).value;


        const talla =
            document.getElementById(
                "tallaEntrega"
            ).value.trim();


        const fecha =
            document.getElementById(
                "fechaEntrega"
            ).value;


        const estado =
            document.getElementById(
                "estadoEntrega"
            ).value;


        const observaciones =
            document.getElementById(
                "observacionesEntrega"
            ).value.trim();


        const archivo =
            document.getElementById(
                "evidenciaEntrega"
            ).files[0];


        let elemento =
            elementoSeleccionado;


        if (
            elementoSeleccionado ===
            "Otros elementos" &&
            otroElemento
        ) {

            elemento = otroElemento;
        }


        /* ================= GUARDAR ================= */

        function guardarEntrega(evidencia) {

            if (entregaEditando) {

                const indice =
                    entregas.findIndex(
                        function (entrega) {

                            return (
                                String(entrega.id) ===
                                String(entregaEditando)
                            );
                        }
                    );


                if (indice !== -1) {

                    entregas[indice] = {

                        ...entregas[indice],

                        empleadoId:
                            empleadoSeleccionado.id,

                        empleadoNombre:
                            empleadoSeleccionado.nombre,

                        empleadoCodigo:
                            empleadoSeleccionado.codigo,

                        elemento,
                        cantidad,
                        talla,
                        fecha,
                        estado,
                        observaciones
                    };


                    /*
                       Si se carga una nueva evidencia,
                       reemplazamos la anterior.
                    */

                    if (evidencia) {

                        entregas[indice].evidencia =
                            evidencia;
                    }
                }

            } else {

                /*
                   CADA ENTREGA TIENE SU PROPIO ID.
                   CADA MOVIMIENTO ES INDEPENDIENTE.
                */

                const nueva = {

                    id: Date.now().toString(),

                    empleadoId:
                        empleadoSeleccionado.id,

                    empleadoNombre:
                        empleadoSeleccionado.nombre,

                    empleadoCodigo:
                        empleadoSeleccionado.codigo,

                    elemento,

                    cantidad,

                    talla,

                    fecha,

                    estado,

                    observaciones,

                    evidencia:
                        evidencia || "",

                    fechaRegistro:
                        new Date().toISOString()
                };


                entregas.push(nueva);
            }


            localStorage.setItem(
                "entregas",
                JSON.stringify(entregas)
            );


            formEntrega.reset();

            entregaEditando = null;

            formularioEntrega.classList.add(
                "oculto"
            );

            campoOtroElemento.classList.add(
                "oculto"
            );


            mostrarEntregas();

            actualizarDashboard();


            alert(
                "Entrega guardada correctamente."
            );
        }


        /* ================= EVIDENCIA ================= */

        if (archivo) {

            const lector =
                new FileReader();


            lector.onload =
                function (event) {

                    guardarEntrega(
                        event.target.result
                    );
                };


            lector.readAsDataURL(archivo);

        } else {

            guardarEntrega("");
        }
    }
);


/* =====================================================
   MOSTRAR ENTREGAS
   ===================================================== */

function mostrarEntregas() {

    const textoBusqueda =
        buscarEntrega.value
            .toLowerCase()
            .trim();


    const filtradas =
        entregas.filter(function (entrega) {

            const empleado =
                buscarEmpleadoPorId(
                    entrega.empleadoId
                );


            /*
               Primero utilizamos la información guardada
               dentro de la entrega.

               Si no existe, buscamos al empleado actual.
            */

            const nombreEmpleado =
                String(
                    entrega.empleadoNombre ||
                    (empleado
                        ? empleado.nombre
                        : "")
                ).toLowerCase();


            const codigoEmpleado =
                String(
                    entrega.empleadoCodigo ||
                    (empleado
                        ? empleado.codigo
                        : "")
                ).toLowerCase();


            const elemento =
                String(
                    entrega.elemento || ""
                ).toLowerCase();


            const talla =
                String(
                    entrega.talla || ""
                ).toLowerCase();


            const estado =
                String(
                    entrega.estado || ""
                ).toLowerCase();


            return (

                nombreEmpleado.includes(
                    textoBusqueda
                )

                ||

                codigoEmpleado.includes(
                    textoBusqueda
                )

                ||

                elemento.includes(
                    textoBusqueda
                )

                ||

                talla.includes(
                    textoBusqueda
                )

                ||

                estado.includes(
                    textoBusqueda
                )
            );
        });


    tablaEntregas.innerHTML = "";


    if (filtradas.length === 0) {

        tablaEntregas.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    style="text-align:center;"
                >
                    No hay entregas registradas.
                </td>
            </tr>
        `;

        return;
    }


    /*
       Mostrar las más recientes primero.
       Usamos [...filtradas] para no modificar
       el arreglo original.
    */

    [...filtradas]
        .reverse()
        .forEach(function (entrega) {


            const empleado =
                buscarEmpleadoPorId(
                    entrega.empleadoId
                );


            const nombreEmpleado =
                entrega.empleadoNombre ||
                (empleado
                    ? empleado.nombre
                    : "Registro sin empleado");


            const codigoEmpleado =
                entrega.empleadoCodigo ||
                (empleado
                    ? empleado.codigo
                    : "");


            const estadoClase =
                entrega.estado === "Entregado"

                    ? "estado-entregado"

                    : "estado-pendiente";


            const evidencia =
                entrega.evidencia

                    ? `
                        <img
                            src="${entrega.evidencia}"
                            class="evidencia-miniatura"
                            title="Ver evidencia"
                        >
                    `

                    : `
                        <span class="sin-evidencia">
                            Sin evidencia
                        </span>
                    `;


            const fila =
                document.createElement("tr");


            fila.innerHTML = `

                <td>

                    <strong>
                        ${escapeHtml(nombreEmpleado)}
                    </strong>

                    ${
                        codigoEmpleado
                            ? `
                                <br>
                                <small>
                                    Código:
                                    ${escapeHtml(
                                        codigoEmpleado
                                    )}
                                </small>
                              `
                            : ""
                    }

                </td>


                <td>
                    ${escapeHtml(
                        entrega.elemento || "-"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        String(
                            entrega.cantidad || ""
                        )
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        entrega.talla || "-"
                    )}
                </td>


                <td>
                    ${formatearFecha(
                        entrega.fecha
                    )}
                </td>


                <td>

                    <span class="${estadoClase}">
                        ${escapeHtml(
                            entrega.estado || "-"
                        )}
                    </span>

                </td>


                <td>
                    ${evidencia}
                </td>


                <td>
                    ${escapeHtml(
                        entrega.observaciones || "-"
                    )}
                </td>


                <td>

                    <button
                        class="boton-editar"
                        onclick="editarEntrega('${entrega.id}')"
                    >
                        ✏️
                    </button>


                    <button
                        class="boton-eliminar"
                        onclick="eliminarEntrega('${entrega.id}')"
                    >
                        🗑️
                    </button>

                </td>
            `;


            tablaEntregas.appendChild(fila);
        });
}


/* ================= BUSCAR ENTREGA ================= */

buscarEntrega.addEventListener(
    "input",
    function () {
        mostrarEntregas();
    }
);


/* =====================================================
   EDITAR ENTREGA
   ===================================================== */

function editarEntrega(id) {

    const entrega =
        entregas.find(function (item) {

            return (
                String(item.id) ===
                String(id)
            );
        });


    if (!entrega) return;


    entregaEditando = entrega.id;


    document.getElementById(
        "tituloEntrega"
    ).textContent =
        "Editar entrega";


    cargarEmpleadosEnSelect();


    /*
       Convertimos a String para que funcione
       aunque el ID antiguo sea numérico.
    */

    empleadoEntrega.value =
        String(entrega.empleadoId);


    const opciones =
        Array.from(
            elementoEntrega.options
        ).map(function (opcion) {

            return opcion.value;
        });


    if (
        opciones.includes(
            entrega.elemento
        )
    ) {

        elementoEntrega.value =
            entrega.elemento;

        campoOtroElemento.classList.add(
            "oculto"
        );

        document.getElementById(
            "otroElemento"
        ).required = false;

    } else {

        elementoEntrega.value =
            "Otros elementos";

        campoOtroElemento.classList.remove(
            "oculto"
        );

        document.getElementById(
            "otroElemento"
        ).required = true;

        document.getElementById(
            "otroElemento"
        ).value =
            entrega.elemento || "";
    }


    document.getElementById(
        "cantidadEntrega"
    ).value =
        entrega.cantidad || 1;


    document.getElementById(
        "tallaEntrega"
    ).value =
        entrega.talla || "";


    document.getElementById(
        "fechaEntrega"
    ).value =
        entrega.fecha || "";


    document.getElementById(
        "estadoEntrega"
    ).value =
        entrega.estado || "Entregado";


    document.getElementById(
        "observacionesEntrega"
    ).value =
        entrega.observaciones || "";


    formularioEntrega.classList.remove(
        "oculto"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   ELIMINAR ENTREGA
   ===================================================== */

function eliminarEntrega(id) {

    const entrega =
        entregas.find(function (item) {

            return (
                String(item.id) ===
                String(id)
            );
        });


    if (!entrega) return;


    const empleado =
        buscarEmpleadoPorId(
            entrega.empleadoId
        );


    const nombreEmpleado =
        entrega.empleadoNombre ||

        (
            empleado
                ? empleado.nombre
                : "registro sin empleado"
        );


    const confirmar = confirm(

        `¿Está seguro de eliminar esta entrega de ${nombreEmpleado}?\n\n` +

        `Elemento: ${entrega.elemento}\n` +

        `Cantidad: ${entrega.cantidad}\n` +

        `Fecha: ${formatearFecha(
            entrega.fecha
        )}`
    );


    if (!confirmar) return;


    entregas =
        entregas.filter(function (item) {

            return (
                String(item.id) !==
                String(id)
            );
        });


    localStorage.setItem(
        "entregas",
        JSON.stringify(entregas)
    );


    mostrarEntregas();

    actualizarDashboard();
}


/* =====================================================
   DASHBOARD
   ===================================================== */

function actualizarDashboard() {

    document.getElementById(
        "totalEmpleados"
    ).textContent =
        empleados.length;


    document.getElementById(
        "totalEntregas"
    ).textContent =
        entregas.length;


    const pendientes =
        entregas.filter(function (entrega) {

            return entrega.estado ===
                "Pendiente";
        });


    document.getElementById(
        "totalPendientes"
    ).textContent =
        pendientes.length;


    const fechaActual =
        new Date();


    const mesActual =
        fechaActual.getMonth();


    const añoActual =
        fechaActual.getFullYear();


    const entregasDelMes =
        entregas.filter(function (entrega) {

            if (!entrega.fecha) {
                return false;
            }


            const fecha =
                new Date(
                    entrega.fecha +
                    "T00:00:00"
                );


            return (

                fecha.getMonth() ===
                mesActual

                &&

                fecha.getFullYear() ===
                añoActual
            );
        });


    document.getElementById(
        "entregasMes"
    ).textContent =
        entregasDelMes.length;
}


/* =====================================================
   HISTORIAL
   ===================================================== */

document.getElementById(
    "irDotacion"
).addEventListener(
    "click",
    function () {

        botonesMenu.forEach(
            function (item) {

                item.classList.remove(
                    "activo"
                );
            }
        );


        document
            .querySelector(
                '[data-seccion="dotacion"]'
            )
            .classList.add("activo");


        Object.values(secciones)
            .forEach(
                function (seccion) {

                    seccion.classList.add(
                        "oculto"
                    );
                }
            );


        secciones.dotacion
            .classList.remove("oculto");


        cargarEmpleadosEnSelect();

        mostrarEntregas();
    }
);


/* =====================================================
   INICIALIZACIÓN
   ===================================================== */

mostrarEmpleados();

cargarEmpleadosEnSelect();

actualizarDashboard();
