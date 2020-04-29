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

// Google
// Para instalar este servicio npm install google-auth-library --save
let CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ================================================
// Autenticación Google 
// ================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        correo: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.token;
    let googleUsr = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Tokn no valido'
            })
        });

    Usuario.findOne({ correo: googleUsr.correo }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usaurio',
                errors: err
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal',
                    errors: err
                });
            } else {
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
            }
        } else {
            // El usuario no existe... hay que crearlo
            let usuario = new Usuario();
            usuario.nombre = googleUsr.nombre;
            usuario.correo = googleUsr.correo;
            usuario.img = googleUsr.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usaurio',
                        errors: err
                    });
                }
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
            })
        }
    })

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!',
    //     googleUser: googleUsr
    // });
});

// ================================================
// Autenticación normal
// ================================================

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