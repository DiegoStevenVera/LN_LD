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
    console.log(cifrado);

    if (!claveGlobal) {
        claveGlobal = "";
    }

    // Desencriptar
    let texto = "";
    try {
        let bytes = CryptoJS.AES.decrypt(cifrado.Content, claveGlobal);
        texto = bytes.toString(CryptoJS.enc.Utf8);
        texto = insertImagesIntoText(texto);
    } catch (e) {
        console.error("Error de desencriptación:", e);
        texto = ""; // Forzar fallo
    }


    if (!texto) {
        document.getElementById("texto").innerHTML = cifrado.Content;
        document.getElementById("titulo-acto").innerText = cifrado.Name;
        document.getElementById("mensaje").innerHTML =
            "<span style='color:red;'>❌ Clave incorrecta</span>";
        return;
    }

    // Mostrar texto
    document.getElementById("mensaje").innerText = "";
    document.getElementById("titulo-acto").innerText = cifrado.Name;
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
// === RESPONSIVE MENU & POPUP INIT ===
document.addEventListener("DOMContentLoaded", () => {
    // Menu
    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }

    // Popup Init
    initChristmasPopup();
});

function initChristmasPopup() {
    const popup = document.getElementById("christmas-popup");
    if (popup) {
        // Force display flex and remove hidden class
        popup.classList.remove("hidden");
        popup.style.display = "flex";

        // Focus input
        const inputClave = document.getElementById("popup-clave");
        if (inputClave) {
            setTimeout(() => inputClave.focus(), 100);
        }
    } else {
        console.warn("Christmas popup element not found!");
    }
}

function cerrarPopup() {
    const popup = document.getElementById("christmas-popup");
    if (popup) {
        popup.classList.add("hidden");
        popup.style.display = "none";
    }
}

async function abrirCarta() {
    const inputClave = document.getElementById("popup-clave");
    const clave = inputClave.value;
    const msgError = document.getElementById("popup-mensaje");

    if (!clave) {
        msgError.innerText = "Por favor ingresa una clave.";
        return;
    }

    // Fetch data if not already loaded
    if (!dataVolumen) {
        try {
            let resp = await fetch('data/vol1.json');
            dataVolumen = await resp.json();
        } catch (e) {
            console.error(e);
            msgError.innerText = "Error cargando datos.";
            return;
        }
    }

    // Get encrypted content
    const cartaData = dataVolumen["cartaNavidad"];
    if (!cartaData) {
        msgError.innerText = "No se encontró la carta.";
        return;
    }

    const cifrado = cartaData.Content;

    // Attempt decrypt
    let texto = "";
    try {
        let bytes = CryptoJS.AES.decrypt(cifrado, clave);
        texto = bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        texto = "";
    }

    if (!texto) {
        msgError.innerText = "❌ Clave incorrecta.";
        return;
    }

    // Success!
    claveGlobal = clave; // Save globally

    // Update Popup UI
    document.getElementById("popup-auth").classList.add("hidden");
    const letterDiv = document.getElementById("popup-letter");
    letterDiv.classList.remove("hidden");
    document.getElementById("popup-body").innerHTML = insertImagesIntoText(texto);

    // Also unlock main site UI for convenience
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("clave").value = clave; // Fill main input too
    document.getElementById("mensaje").innerText = "Clave aceptada desde la carta.";
}