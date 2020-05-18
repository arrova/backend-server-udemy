// Para instalar los token que vamos a ocupar ponemos npm i jsonwebtoken --save
let jwt = require('jsonwebtoken');

// Llamadas locales
let SEED = require('../config/config').SEED;

// ========================================
// Verificar token
// ========================================

exports.verificaToken = function(req, res, next) {
    let token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        // res.status(200).json({
        //     ok: true,
        //     decoded
        // });
        next();
    });
}

// ========================================
// Verificar ADMIN
// ========================================
exports.verificaADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });
    }
}

// ========================================
// Verificar ADMIN o Mismo usuario
// ========================================
exports.verificaADMIN_o_MismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni el mismo usuario',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });
    }
}