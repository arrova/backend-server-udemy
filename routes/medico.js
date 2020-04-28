// Importaciones
let express = require('express');

// Llamadas locales
// let SEED = require('../config/config').SEED;
let mdAuth = require('../middlewares/authentication');

// Inicializar variables
let app = express();

// Schema de usuario
let Medico = require('../models/medico');

// Rutas
// ========================================
// Obtener todos los hospitales
// ========================================
app.get('/', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({}) //, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre correo')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo
                });
            })

        });
});

// ========================================
// Crear un nuevo hospital
// ========================================
app.post('/', mdAuth.verificaToken, (req, res) => { // Pasar validaciones por arreglo si +1
    let body = req.body;
    let medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

// ========================================
// Actualizar hospital
// ========================================
app.put('/:id', mdAuth.verificaToken, (req, res) => { //mdAuth.verificaToken
    let id = req.params.id;
    let body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { messag: 'No existe un medico con ese ID' }
            });
        }
        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// ========================================
// Borrar un hospital por el id
// ========================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => { // , mdAuth.verificaToken
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    })
});

// Exportando
module.exports = app;