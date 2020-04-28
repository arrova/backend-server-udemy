// Importaciones
let express = require('express');

// Llamadas locales
// let SEED = require('../config/config').SEED;
let mdAuth = require('../middlewares/authentication');

// Inicializar variables
let app = express();

// Schema de usuario
let Hospital = require('../models/hospital');

// Rutas
// ========================================
// Obtener todos los hospitales
// ========================================
app.get('/', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}) //, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre correo') // Para traer la información del usuario
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales,
                    totla: conteo
                });
            });

        });
});

// ========================================
// Crear un nuevo hospital
// ========================================
app.post('/', mdAuth.verificaToken, (req, res) => { // Pasar validaciones por arreglo si +1
    let body = req.body;
    let hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// ========================================
// Actualizar hospital
// ========================================
app.put('/:id', mdAuth.verificaToken, (req, res) => { //mdAuth.verificaToken
    let id = req.params.id;
    let body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { messag: 'No existe un hospital con ese ID' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// ========================================
// Borrar un hospital por el id
// ========================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => { // , mdAuth.verificaToken
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
});

// Exportando
module.exports = app;