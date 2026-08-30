document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Capturamos los elementos del HTML
    const inputClave = document.getElementById("input-contrasena");
    const selectAtaque = document.getElementById("select-velocidad");
    const txtEntropia = document.getElementById("resultado-entropia");
    const txtEspacio = document.getElementById("resultado-espacio");
    const txtTiempo = document.getElementById("resultado-tiempo");
    const barraFortaleza = document.getElementById("barra-fortaleza");
    const txtEstado = document.getElementById("texto-fortaleza");

    // 2. Diccionario de velocidades (sin guiones bajos por compatibilidad universal)
    const velocidades = {
        "computadora": 100000000,
        "gpu": 50000000000,
        "supercomputadora": 1000000000000
    };

    // 3. Motor Matemático (Tu rol original)
    function calcularMatematicaContrasena(password) {
        if (!password || password.length === 0) {
            return { L: 0, N: 0, espacio: 0, entropia: 0 };
        }
        
        const L = password.length;
        let N = 0;
        
        if (/[a-z]/.test(password)) N += 26;
        if (/[A-Z]/.test(password)) N += 26;
        if (/[0-9]/.test(password)) N += 10;
        if (/[^a-zA-Z0-9]/.test(password)) N += 32;
        
        const espacio = Math.pow(N, L);
        const entropia = L * Math.log2(N);
        
        return { L, N, espacio, entropia };
    }

    // 4. Seguridad y Validaciones (Rol de Persona 3)
    function calcularPenalizaciones(password, entropiaBase) {
        if (entropiaBase === 0) return 0;
        
        let penalizacion = 0;
        const p = password.toLowerCase();
        
        const secuenciasDebiles = ["qwerty", "asdfgh", "12345", "123456", "987654", "password", "contraseña", "123123"];
        for (let i = 0; i < secuenciasDebiles.length; i++) {
            if (p.includes(secuenciasDebiles[i])) {
                penalizacion += 25;
                break;
            }
        }

        if (/(.)\1{2,}/.test(p)) penalizacion += 15;
        if (/^[0-9]+$/.test(p) || /^[a-z]+$/.test(p)) penalizacion += 10;

        return Math.max(0, entropiaBase - penalizacion);
    }

    // 5. Formatear Tiempo
    function formatearTiempo(segundos) {
        if (segundos === 0 || isNaN(segundos) || !isFinite(segundos)) return "0 segundos";
        if (segundos < 60) return segundos.toFixed(2) + " segundos";
        if (segundos < 3600) return (segundos / 60).toFixed(1) + " minutos";
        if (segundos < 86400) return (segundos / 3600).toFixed(1) + " horas";
        if (segundos < 31536000) return (segundos / 86400).toFixed(1) + " días";
        return (segundos / 31536000).toFixed(1) + " años";
    }

    // 6. Colores de la Barra
   // 6. Colores de la Barra y Efectos Globales
    function actualizarBarra(entropia) {
        // Capturamos el fondo de la página y la tarjeta principal
        const body = document.body;
        const contenedor = document.querySelector(".contenedor-principal");

        if (entropia === 0) {
            // Estado Neutro (Sin contraseña)
            barraFortaleza.style.backgroundColor = "#e0e0e0";
            barraFortaleza.style.width = "100%";
            txtEstado.textContent = "Esperando contraseña...";
            
            // Efectos globales neutros
            body.style.backgroundColor = "#f4f7f6"; // Color original del fondo (gris muy claro)
            contenedor.classList.remove("alerta-debil");
            contenedor.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)"; // Sombra normal
            
        } else if (entropia < 40) {
            // Estado Débil (Alerta)
            barraFortaleza.style.backgroundColor = "#ff4d4d";
            barraFortaleza.style.width = "33%";
            txtEstado.textContent = "Débil (Vulnerable)";
            
            // Efectos globales de peligro
            body.style.backgroundColor = "#ffe6e6"; // Fondo rojizo
            contenedor.classList.add("alerta-debil"); // Activa el temblor en CSS
            
        } else if (entropia < 70) {
            // Estado Moderado (Precaución)
            barraFortaleza.style.backgroundColor = "#ffd633";
            barraFortaleza.style.width = "66%";
            txtEstado.textContent = "Moderada";
            
            // Efectos globales de precaución
            body.style.backgroundColor = "#fffce6"; // Fondo amarillento
            contenedor.classList.remove("alerta-debil"); // Quitamos el temblor
            contenedor.style.boxShadow = "0 0 20px rgba(255, 214, 51, 0.5)"; // Resplandor amarillo
            
        } else {
            // Estado Fuerte (Seguro)
            barraFortaleza.style.backgroundColor = "#33cc33";
            barraFortaleza.style.width = "100%";
            txtEstado.textContent = "Fuerte (Segura)";
            
            // Efectos globales de éxito
            body.style.backgroundColor = "#e6ffe6"; // Fondo verdoso
            contenedor.classList.remove("alerta-debil");
            contenedor.style.boxShadow = "0 0 20px rgba(51, 204, 51, 0.5)"; // Resplandor verde
        }
    }

    // 7. Procesamiento Principal
    function procesarDatos() {
        const clave = inputClave.value;
        
        // Si borraron todo, reiniciamos la interfaz
        if (clave === "") {
            txtEntropia.textContent = "0 bits";
            txtEspacio.textContent = "0 combinaciones posibles";
            txtTiempo.textContent = "0 segundos";
            actualizarBarra(0);
            return;
        }

        const calculos = calcularMatematicaContrasena(clave);
        const entropiaReal = calcularPenalizaciones(clave, calculos.entropia);

        txtEntropia.textContent = entropiaReal.toFixed(2) + " bits";
        
        if (calculos.espacio > 1e21) {
            txtEspacio.textContent = calculos.espacio.toExponential(2) + " combinaciones";
        } else {
            txtEspacio.textContent = calculos.espacio.toLocaleString("es-ES") + " combinaciones";
        }

        const velocidadSeleccionada = selectAtaque.value;
        const velocidadNumerica = velocidades[velocidadSeleccionada];
        
        const combinacionesReales = Math.pow(2, entropiaReal); 
        const segundos = combinacionesReales / velocidadNumerica;
        
        txtTiempo.textContent = formatearTiempo(segundos);
        actualizarBarra(entropiaReal);
    }

    // 8. Listeners (¡Lo que activa todo!)
    inputClave.addEventListener("input", procesarDatos);
    selectAtaque.addEventListener("change", procesarDatos);
});