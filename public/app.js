let datosActuales = [];
let tipoActual = '';

function cargarPeliculas() {
    fetch('http://localhost:3000/catalogo?tipo=peliculas')
        .then(res => res.json())
        .then(data => {
            datosActuales = data;
            tipoActual = 'peliculas';
            mostrar(data);
        });
}

function cargarSeries() {
    fetch('http://localhost:3000/catalogo?tipo=series')
        .then(res => res.json())
        .then(data => {
            datosActuales = data;
            tipoActual = 'series';
            mostrar(data);
        });
}

function mostrar(lista) {
    const ul = document.getElementById('lista');
    ul.innerHTML = '';

    lista.forEach(item => {
        const li = document.createElement('li');

        if (tipoActual === 'peliculas') {
            li.textContent = `Nombre: ${item.nombre} | Director: ${item.director} | Año: ${item.anio}`;
        } else {
            li.textContent = `Nombre: ${item.nombre} | Año: ${item.anio} | Temporadas: ${item.temporadas}`;
        }

        ul.appendChild(li);
    });
}

function ordenar() {
    const criterio = document.getElementById('orden').value;

    datosActuales.sort((a, b) => {
        if (!a[criterio]) return 0;
        return a[criterio] > b[criterio] ? 1 : -1;
    });

    mostrar(datosActuales);
}

function agregarPelicula() {
    fetch('http://localhost:3000/catalogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tipo: 'pelicula',
            nombre: document.getElementById('pNombre').value,
            director: document.getElementById('pDirector').value,
            anio: document.getElementById('pAnio').value
        })
    }).then(() => cargarPeliculas());
}

function agregarSerie() {
    fetch('http://localhost:3000/catalogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tipo: 'serie',
            nombre: document.getElementById('sNombre').value,
            anio: document.getElementById('sAnio').value,
            temporadas: document.getElementById('sTemp').value
        })
    }).then(() => cargarSeries());
}
