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
        
        // 1. Repetición absoluta de un solo carácter (Destrucción total)
        if (/^(.)\1+$/.test(p)) return 0;

        // 2. Diccionario de Nombres, Secuencias y Contexto Local
        const diccionario = [
            "qwerty", "asdfgh", "zxcvbn", "password", "contraseña", "admin", 
            "123456789", "987654321", "12345", "54321", "67890", "09876", "abcdef", 
            "espol", "guayaquil", "ecuador", 
            "naomi", "valeria", "rafael", "pedro", "antonio", "jose", "manuel", 
            "francisco", "david", "juan", "luis", "carlos", "javier", "jesus", 
            "daniel", "alejandro", "miguel", "jorge", "angel", "pablo", "sergio", 
            "fernando", "andres", "santiago", "diego", "victor", "hugo", "ruben", 
            "ivan", "guillermo", "alvaro", "oscar", "mario", "roberto", "ramon", 
            "julian", "nicolas", "gabriel", "samuel", "martin", "sebastian", "lucas", 
            "mateo", "leonardo", "felipe", "hector", "ricardo", "raul", "arturo", 
            "enrique", "gerardo", "alberto", "emilio", "joaquin", "marcelo", "ignacio", 
            "rodrigo", "tomas", "matias", "maria", "carmen", "ana", "isabel", "laura", 
            "cristina", "marta", "rosa", "andrea", "paula", "elena", "teresa", 
            "raquel", "sofia", "pilar", "silvia", "lucia", "julia", "alba", "victoria", 
            "patricia", "alicia", "rocio", "beatriz", "natalia", "lorena", "claudia", 
            "eva", "mercedes", "susana", "leticia", "sandra", "camila", "valentina", 
            "isabella", "emma", "catalina", "martina", "julieta", "antonia"
        ];
        
        for (let i = 0; i < diccionario.length; i++) {
            if (p.includes(diccionario[i])) {
                penalizacion += 35;
                break; 
            }
        }

        // 3. Castigo Dinámico por Bloques (Intercepta bucles exactos)
        const repeticionBloque = p.match(/(.{2,})\1+/);
        if (repeticionBloque) {
            const tamañoTrampa = repeticionBloque[0].length;
            penalizacion += (tamañoTrampa * 5); 
        }

       // 4. Castigo dinámico por caracteres idénticos consecutivos (Parche del "9" oculto)
        // La 'g' al final busca TODAS las rachas de letras/números repetidos en la cadena
        const repeticionesSimples = p.match(/(.)\1{2,}/g); 
        if (repeticionesSimples) {
            repeticionesSimples.forEach(racha => {
                // Destruye 5 bits por cada carácter inútil ingresado en la racha
                penalizacion += (racha.length * 5); 
            });
        }

        // 5. Falta de variedad (Solo números o solo letras)
        if (/^[0-9]+$/.test(p) || /^[a-z]+$/.test(p)) penalizacion += 15;

        // Retornar asegurando que no existan valores negativos
        return Math.max(0, entropiaBase - penalizacion);
    }
    // 5. Formatear Tiempo
   function formatearTiempo(segundos) {
        if (segundos === 0 || isNaN(segundos) || !isFinite(segundos)) return "0 segundos";
        if (segundos < 60) return segundos.toFixed(2) + " segundos";
        if (segundos < 3600) return (segundos / 60).toFixed(1) + " minutos";
        if (segundos < 86400) return (segundos / 3600).toFixed(1) + " horas";
        if (segundos < 31536000) return (segundos / 86400).toFixed(1) + " días";
        if (segundos < 3153600000) return (segundos / 31536000).toFixed(1) + " años";
        return (segundos / 3153600000).toFixed(1) + " siglos";
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
        
        // Si borraron todo
        if (clave === "") {
            txtEntropia.textContent = "0 bits";
            txtEspacio.textContent = "0 combinaciones posibles";
            txtTiempo.textContent = "0 segundos";
            actualizarBarra(0);
            return;
        }

        // REGLA NUEVA: Consenso general de longitud mínima (8 caracteres)
        if (clave.length < 8) {
            txtEntropia.textContent = "0 bits";
            txtEspacio.textContent = "Longitud insuficiente";
            txtTiempo.textContent = "0 segundos";
            
            barraFortaleza.style.backgroundColor = "#ff4d4d";
            barraFortaleza.style.width = "10%";
            txtEstado.textContent = "Muy corta (Mínimo 8 caracteres)";
            
            document.body.style.backgroundColor = "#ffe6e6"; 
            document.querySelector(".contenedor-principal").classList.add("alerta-debil");
            return; // Detenemos los cálculos aquí
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