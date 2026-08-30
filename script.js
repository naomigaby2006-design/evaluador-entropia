/* =========================================
   EVALUADOR DE ENTROPÍA DE CONTRASEÑAS
   Lógica: combinatoria con repetición N^L
   ========================================= */

// Velocidades de ataque (intentos por segundo)
const VELOCIDADES = {
    computadora: 100_000_000,          // 100 Millones/seg
    gpu: 50_000_000_000,               // 50 Mil Millones/seg
    supercomputadora: 1_000_000_000_000 // 1 Billón/seg
};

// Tamaños de los subconjuntos de caracteres
const TAM_MINUSCULAS = 26;
const TAM_MAYUSCULAS = 26;
const TAM_DIGITOS = 10;
const TAM_SIMBOLOS = 32; // símbolos comunes de teclado: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~

// Referencias a elementos del DOM
const inputContrasena = document.getElementById('input-contrasena');
const selectVelocidad = document.getElementById('select-velocidad');
const resultadoEntropia = document.getElementById('resultado-entropia');
const resultadoEspacio = document.getElementById('resultado-espacio');
const resultadoTiempo = document.getElementById('resultado-tiempo');
const barraFortaleza = document.getElementById('barra-fortaleza');
const textoFortaleza = document.getElementById('texto-fortaleza');

/**
 * Determina el tamaño del alfabeto (N) usado según los tipos de
 * caracteres presentes en la contraseña.
 */
function calcularTamanoAlfabeto(contrasena) {
    let n = 0;
    if (/[a-z]/.test(contrasena)) n += TAM_MINUSCULAS;
    if (/[A-Z]/.test(contrasena)) n += TAM_MAYUSCULAS;
    if (/[0-9]/.test(contrasena)) n += TAM_DIGITOS;
    if (/[^a-zA-Z0-9]/.test(contrasena)) n += TAM_SIMBOLOS;
    return n;
}

/**
 * Formatea números muy grandes usando notación de sufijos en español
 * (mil, millón, mil millones, billón, trillón...) o notación científica
 * cuando el número es astronómicamente grande.
 */
function formatearNumeroGrande(numero) {
    if (!isFinite(numero) || numero === 0) return '0';

    if (numero < 1000) {
        return Math.round(numero).toString();
    }

    // Notación científica para números manejables por Number
    if (numero < 1e21) {
        const unidades = [
            { valor: 1e18, nombre: 'trillón' },   // 10^18 (escala larga)
            { valor: 1e15, nombre: 'mil billones' },
            { valor: 1e12, nombre: 'billón' },     // 10^12 (escala larga)
            { valor: 1e9, nombre: 'mil millones' },
            { valor: 1e6, nombre: 'millón' },
            { valor: 1e3, nombre: 'mil' }
        ];
        for (const u of unidades) {
            if (numero >= u.valor) {
                const cantidad = numero / u.valor;
                return `${cantidad.toLocaleString('es-ES', { maximumFractionDigits: 2 })} ${u.nombre}${cantidad >= 2 && !u.nombre.startsWith('mil ') && u.nombre !== 'mil' ? 'es' : ''}`;
            }
        }
    }

    // Para números astronómicos, notación científica
    return numero.toExponential(2).replace('+', '');
}

/**
 * Convierte un número de segundos en un texto legible en español,
 * eligiendo la unidad más adecuada (segundos, minutos, horas, días, años...).
 */
function formatearTiempo(segundos) {
    if (!isFinite(segundos)) {
        return 'Tiempo prácticamente infinito (mayor a la edad del universo)';
    }
    if (segundos < 1) {
        return 'Instantáneo (menos de 1 segundo)';
    }
    if (segundos < 60) {
        return `${Math.round(segundos)} segundos`;
    }

    const minutos = segundos / 60;
    if (minutos < 60) {
        return `${minutos.toFixed(1)} minutos`;
    }

    const horas = minutos / 60;
    if (horas < 24) {
        return `${horas.toFixed(1)} horas`;
    }

    const dias = horas / 24;
    if (dias < 365) {
        return `${dias.toFixed(1)} días`;
    }

    const anios = dias / 365.25;
    const EDAD_UNIVERSO_ANIOS = 1.38e10;

    if (anios >= EDAD_UNIVERSO_ANIOS * 1000) {
        return `${formatearNumeroGrande(anios)} años (esto es astronómicamente mayor que la edad del universo)`;
    }
    if (anios >= EDAD_UNIVERSO_ANIOS) {
        return `${formatearNumeroGrande(anios)} años (más que la edad del universo)`;
    }

    return `${formatearNumeroGrande(anios)} años`;
}

/**
 * Clasifica el nivel de fortaleza según la entropía en bits,
 * y devuelve el porcentaje de la barra, color y texto descriptivo.
 */
function clasificarFortaleza(entropia) {
    if (entropia === 0) {
        return { porcentaje: 0, color: '#e74c3c', texto: 'Esperando contraseña...' };
    }
    if (entropia < 28) {
        return { porcentaje: Math.max(5, (entropia / 28) * 20), color: '#e74c3c', texto: 'Muy débil' };
    }
    if (entropia < 36) {
        return { porcentaje: 20 + ((entropia - 28) / (36 - 28)) * 20, color: '#e67e22', texto: 'Débil' };
    }
    if (entropia < 60) {
        return { porcentaje: 40 + ((entropia - 36) / (60 - 36)) * 20, color: '#f1c40f', texto: 'Aceptable' };
    }
    if (entropia < 128) {
        return { porcentaje: 60 + ((entropia - 60) / (128 - 60)) * 25, color: '#2ecc71', texto: 'Fuerte' };
    }
    return { porcentaje: 100, color: '#27ae60', texto: 'Muy fuerte' };
}

/**
 * Función principal: recalcula y actualiza toda la interfaz
 * cada vez que cambia la contraseña o la velocidad de ataque seleccionada.
 */
function actualizarAnalisis() {
    const contrasena = inputContrasena.value;
    const velocidad = VELOCIDADES[selectVelocidad.value];

    if (contrasena.length === 0) {
        resultadoEntropia.textContent = '0 bits';
        resultadoEspacio.textContent = '0 combinaciones posibles';
        resultadoTiempo.textContent = '0 segundos';
        barraFortaleza.style.width = '0%';
        barraFortaleza.style.backgroundColor = '#e74c3c';
        textoFortaleza.textContent = 'Esperando contraseña...';
        return;
    }

    const n = calcularTamanoAlfabeto(contrasena);
    const l = contrasena.length;

    // Espacio muestral: N^L (combinatoria con repetición)
    const espacioMuestral = Math.pow(n, l);

    // Entropía en bits: L * log2(N)
    const entropia = l * Math.log2(n);

    // Tiempo estimado de descifrado (fuerza bruta, en promedio se prueba la mitad del espacio)
    const tiempoSegundos = (espacioMuestral / 2) / velocidad;

    // Actualizar textos de resultados
    resultadoEntropia.textContent = `${entropia.toFixed(2)} bits`;
    resultadoEspacio.textContent = `${formatearNumeroGrande(espacioMuestral)} combinaciones posibles`;
    resultadoTiempo.textContent = formatearTiempo(tiempoSegundos);

    // Actualizar barra visual de fortaleza
    const { porcentaje, color, texto } = clasificarFortaleza(entropia);
    barraFortaleza.style.width = `${porcentaje}%`;
    barraFortaleza.style.backgroundColor = color;
    textoFortaleza.textContent = texto;
}

// Escuchar cambios en tiempo real
inputContrasena.addEventListener('input', actualizarAnalisis);
selectVelocidad.addEventListener('change', actualizarAnalisis);

// Estado inicial
actualizarAnalisis();
