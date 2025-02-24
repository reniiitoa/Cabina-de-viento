let mediaRecorder
let recordedChunks = []

document.getElementById('btnImpulsar').addEventListener('click', function() {
    const ruleta = document.getElementById('ruleta')
    const espacios = []

    ruleta.innerHTML = ''

    fetch('/espacios')
        .then(response => response.json())
        .then(data => {
            data.forEach(espacio => {
                const img = document.createElement('img')
                img.src = `/static/uploads/${espacio.imagen}`
                img.classList.add('imagen-ruleta')

                // Posicionamiento inicial aleatorio dentro del círculo
                const angle = Math.random() * Math.PI * 2
                const radius = Math.random() * 100 + 40
                img.dataset.x = 200 + radius * Math.cos(angle)
                img.dataset.y = 200 + radius * Math.sin(angle)
                img.dataset.vx = (Math.random() - 0.5) * 5
                img.dataset.vy = (Math.random() - 0.5) * 5

                img.style.left = `${img.dataset.x}px`
                img.style.top = `${img.dataset.y}px`

                ruleta.appendChild(img)
                espacios.push(img)
            })

            moverRuleta(espacios)
        })
})

function moverRuleta(espacios) {
    const tiempoMovimiento = 5000; // 5 segundos
    const ruleta = document.getElementById('ruleta')
    let tiempoRestante = tiempoMovimiento

    const mover = setInterval(() => {
        espacios.forEach(img => {
            let x = parseFloat(img.dataset.x)
            let y = parseFloat(img.dataset.y)
            let vx = parseFloat(img.dataset.vx)
            let vy = parseFloat(img.dataset.vy)

            // Simulación de viento caótico (turbulencia)
            let vientoX = (Math.random() - 0.5) * 8
            let vientoY = (Math.random() - 0.5) * 8
            vx += vientoX
            vy += vientoY

            // Movimiento
            x += vx
            y += vy

            // Rebote en los bordes del círculo
            const dx = x - 200
            const dy = y - 200
            const distancia = Math.sqrt(dx * dx + dy * dy)

            if (distancia >= 190) {
                let angulo = Math.atan2(dy, dx)
                x = 200 + 140 * Math.cos(angulo)
                y = 200 + 140 * Math.sin(angulo)

                // Rebote con cambio de dirección
                vx *= -0.8
                vy *= -0.8
            }

            img.dataset.x = x
            img.dataset.y = y
            img.dataset.vx = vx
            img.dataset.vy = vy
            img.style.left = `${x}px`
            img.style.top = `${y}px`
        })

        tiempoRestante -= 16.67// 60 fps
        if (tiempoRestante <= 0) {
            clearInterval(mover)
            seleccionarGanador(espacios)
        }
    }, 16.67) // 60 fps
}

function seleccionarGanador(espacios) {
    const ganador = espacios[Math.floor(Math.random() * espacios.length)]
    
    // Añadir clase específica para el ganador
    ganador.classList.add('ganador')

    ganador.style.transition = 'transform 1.5s ease-in-out, left 1s ease-in-out, top 1s ease-in-out'
    ganador.style.transform = 'scale(6)'// Agrandar más el ganador
    ganador.style.left = 'calc(50% - 22px)'// Ajustar para centrar mejor
    ganador.style.top = 'calc(50% - 28px)'// Ajustar para centrar mejor
    ganador.style.transformOrigin = 'center center'

    // Perdedores caen al fondo del círculo sin desaparecer
    espacios.forEach(img => {
        if (img !== ganador) {
            img.style.transition = 'top 1.5s ease-in, opacity 1s ease-in'
            img.style.top = 'calc(100% - 50px)' // Caen hasta el fondo del círculo
            img.style.opacity = '0.7'
        }
    })

    setTimeout(() => {
        espacios.forEach(img => {
            if (img !== ganador) {
                img.style.transition = 'none'
                img.style.top = 'calc(100% - 50px)' // Mantener en el fondo del círculo
            }
        })
    }, 2000)
}
