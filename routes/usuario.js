// Importaciones
let express = require('express');
// Para la encriptación de las contraseñas instalamos npm install bcryptjs --save
let bcrypt = require('bcryptjs');
// Para instalar los token que vamos a ocupar ponemos npm i jsonwebtoken --save
let jwt = require('jsonwebtoken');

// Llamadas locales
// let SEED = require('../config/config').SEED;
let mdAuth = require('../middlewares/authentication');

// Inicializar variables
let app = express();

// Schema de usuario
let Usuario = require('../models/usuario');

// Rutas
// ========================================
// Obtener todos los usuarios
// ========================================
app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre correo img role google')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario',
                    errors: err
                });
            }

            Usuario.countDocuments({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    usuarios,
                    total: conteo
                });
            })

        });
});

// ========================================
// Verificar token Se paso al archivo de authentication
// ========================================
/*app.use('/', (req, res, next) => {
    let token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        next();
    });
});*/

// ========================================
// Crear un nuevo usaurio
// ========================================
app.post('/', (req, res) => { // Pasar validaciones por arreglo si +1 , mdAuth.verificaToken
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        correo: body.correo,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

// ========================================
// Actualizar usaurio
// ========================================
app.put('/:id', [mdAuth.verificaToken, mdAuth.verificaADMIN_o_MismoUsuario], (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { messag: 'No existe un usuario con ese ID' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.correo = body.correo;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

// ========================================
// Borrar un usaurio por el id
// ========================================
app.delete('/:id', [mdAuth.verificaToken, mdAuth.verificaADMIN_ROLE], (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
});

module.exports = app;