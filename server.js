const http = require('http');
const fs = require('fs').promises;
const url = require('url');
const path = require('path');

const PORT = 3000;

const server = http.createServer(async (req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    res.setHeader('Content-Type', 'application/json');

    // SERVIR ARCHIVOS ESTÁTICOS
    if (req.method === 'GET' && pathname === '/') {
        const html = await fs.readFile('./public/index.html', 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        return res.end(html);
    }

    if (req.method === 'GET' && pathname === '/app.js') {
        const js = await fs.readFile('./public/app.js', 'utf8');
        res.setHeader('Content-Type', 'application/javascript');
        res.writeHead(200);
        return res.end(js);
    }

   
    // GET
   
    if (req.method === 'GET' && pathname === '/catalogo') {

        if (!query.tipo) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Debe indicar tipo=peliculas o tipo=series" }));
        }

        try {
            const archivo = query.tipo === 'peliculas'
                ? 'peliculas.txt'
                : 'series.txt';

            const data = await fs.readFile(archivo, 'utf8');

            const lineas = data.trim().split('\n');

            let resultado = [];

            if (query.tipo === 'peliculas') {
                resultado = lineas.map(linea => {
                    const [nombre, director, anio] = linea.split(',').map(e => e.trim());
                    return { nombre, director, anio: Number(anio) };
                });
            } else {
                resultado = lineas.map(linea => {
                    const [nombre, anio, temporadas] = linea.split(',').map(e => e.trim());
                    return { nombre, anio: Number(anio), temporadas: Number(temporadas) };
                });
            }

            res.writeHead(200);
            return res.end(JSON.stringify(resultado));

        } catch (error) {
            res.writeHead(500);
            return res.end(JSON.stringify({ error: "Error leyendo archivo" }));
        }
    }

   
    // POST
   
    if (req.method === 'POST' && pathname === '/catalogo') {

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {

            try {
                const datos = JSON.parse(body);

                if (!datos.tipo) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: "Debe indicar tipo" }));
                }

                const archivo = datos.tipo === 'pelicula'
                    ? 'peliculas.txt'
                    : 'series.txt';

                let nuevaLinea = '';

                if (datos.tipo === 'pelicula') {
                    nuevaLinea = `\n${datos.nombre}, ${datos.director}, ${datos.anio}`;
                } else {
                    nuevaLinea = `\n${datos.nombre}, ${datos.anio}, ${datos.temporadas}`;
                }

                await fs.appendFile(archivo, nuevaLinea);

                res.writeHead(201);
                res.end(JSON.stringify({ mensaje: "Agregado correctamente" }));

            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "JSON inválido" }));
            }
        });

        return;
    }

    // DELETE

    if (req.method === 'DELETE' && pathname === '/catalogo') {

        if (!query.tipo || !query.nombre) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "Debe indicar tipo y nombre" }));
        }

        try {
            const archivo = query.tipo === 'peliculas'
                ? 'peliculas.txt'
                : 'series.txt';

            const data = await fs.readFile(archivo, 'utf8');
            let lineas = data.trim().split('\n');

            lineas = lineas.filter(linea => !linea.startsWith(query.nombre));

            await fs.writeFile(archivo, lineas.join('\n'));

            res.writeHead(200);
            res.end(JSON.stringify({ mensaje: "Eliminado correctamente" }));

        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Error al eliminar" }));
        }

        return;
    }

    // MÉTODO NO PERMITIDO
    
    res.writeHead(405);
    res.end(JSON.stringify({ error: "Método no permitido" }));
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
