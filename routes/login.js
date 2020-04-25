// Importaciones
let express = require('express');
// Para la encriptación de las contraseñas instalamos npm install bcryptjs --save
let bcrypt = require('bcryptjs');
// Para instalar los token que vamos a ocupar ponemos npm i jsonwebtoken --save
let jwt = require('jsonwebtoken');

// Llamadas locales
let SEED = require('../config/config').SEED;

// Inicializar variables
let app = express();

// Schema de usuario
let Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    let body = req.body;

    Usuario.findOne({ correo: body.correo }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usaurio',
                errors: err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token!!!
        usuarioDB.password = ':)';
        let token = jwt.sign({ usuario: usuarioDB }, // Contenido
            SEED, //'este-es-un-seed-dificil', // La semilla
            { expiresIn: 14400 } // 4 hrs // El intervalo de tiempo 
        );

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token,
            id: usuarioDB._id
        });
    });

});

module.exports = app;