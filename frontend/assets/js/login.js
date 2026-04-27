const form = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            mensaje.textContent = "Login exitoso";
            mensaje.style.color = "green";

            localStorage.setItem("usuario", JSON.stringify(data.user));

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);
        } else {
            mensaje.textContent = data.message || "Error al iniciar sesión";
            mensaje.style.color = "red";
        }
    } catch (error) {
        console.error(error);
        mensaje.textContent = "No se pudo conectar con el servidor";
        mensaje.style.color = "red";
    }
});