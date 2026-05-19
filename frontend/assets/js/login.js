const form = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const login = document.getElementById("login").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ login, password })
        });

        const data = await response.json();

        if (response.ok) {
            mensaje.textContent = "Login exitoso";
            mensaje.style.color = "green";

            localStorage.setItem("usuario", JSON.stringify(data.user));

            localStorage.setItem(
                "rol",
                data.user.rol
            );
            setTimeout(() => {

                if (
                    data.user.rol === "admin" ||
                    data.user.rol === "coordinador"
                ) {

                    window.location.href =
                        "dashboard.html";

                } else {

                    window.location.href =
                        "dashboard_voluntario.html";

                }

            }, 800);

        } else {

            mensaje.textContent =
                data.message;

            mensaje.style.color = "red";

            if (
                data.message ===
                "Tu cuenta está desactivada"
            ) {

                mensaje.innerHTML = `

                    Tu cuenta está desactivada.<br><br>

                    <button
                        id="btnSolicitarActivacion"
                    >
                        Solicitar activación
                    </button>

                `;

                const btn =
                    document.getElementById(
                        "btnSolicitarActivacion"
                    );

                btn.addEventListener(
                    "click",
                    solicitarActivacion
                );

            }

        }


    } catch (error) {

        console.error(error);

        mensaje.textContent =
            "No se pudo conectar con el servidor";

        mensaje.style.color = "red";

    }

});

async function solicitarActivacion() {

    alert(
        "Solicitud enviada correctamente"
    );

}