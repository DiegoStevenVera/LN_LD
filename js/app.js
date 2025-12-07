let claveGlobal = null;
let dataVolumen = null;


function insertImagesIntoText(text) {
    return text.replace(/\[img:(.*?)\]/g, (match, filename) => {
        return `<img src="images/${filename}" alt="${filename}">`;
    });
}

async function cargarActo(rutaJson, actoID) {
    // Cargar volumen
    if (!dataVolumen) {
        let resp = await fetch(rutaJson);
        dataVolumen = await resp.json();
    }

    let cifrado = dataVolumen[actoID];

    if (!claveGlobal) {
        claveGlobal = "";
    }

    // Desencriptar
    // Desencriptar
    let texto = "";
    try {
        let bytes = CryptoJS.AES.decrypt(cifrado, claveGlobal);
        texto = bytes.toString(CryptoJS.enc.Utf8);
        texto = insertImagesIntoText(texto);
    } catch (e) {
        console.error("Error de desencriptación:", e);
        texto = ""; // Forzar fallo
    }


    if (!texto) {
        document.getElementById("texto").innerHTML = cifrado;
        document.getElementById("titulo-acto").innerText = "-.-";
        document.getElementById("mensaje").innerHTML =
            "<span style='color:red;'>❌ Clave incorrecta</span>";
        return;
    }

    // Mostrar texto
    document.getElementById("mensaje").innerText = "";
    document.getElementById("titulo-acto").innerText = actoID.toUpperCase();
    document.getElementById("texto").innerHTML = texto;

    // Ocultar el div de autenticación
    document.getElementById("auth-container").style.display = "none";
}

async function intentarDesencriptar() {
    claveGlobal = document.getElementById("clave").value;

    if (!claveGlobal) {
        alert("Ingresa una clave.");
        return;
    }

    document.getElementById("mensaje").innerText =
        "Clave guardada. Ahora selecciona un Acto en el menú de la izquierda.";
}

// === RESPONSIVE MENU ===
document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }
});