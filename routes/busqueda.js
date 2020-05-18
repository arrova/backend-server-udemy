// Importaciones
let express = require('express');

// Inicializar variables
let app = express();

let Hospital = require('../models/hospital');
let Medico = require('../models/medico');
let Usuario = require('../models/usuario');

// Rutas
// ========================================
// Busqueda general
// ========================================
app.get('/todo/:busqeuda', (req, res, next) => {

    let busqueda = req.params.busqeuda;
    let regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

    // Hospital.find({ nombre: regex }, (err, hospitales) => {});

});

// ========================================
// Busqueda por colección
// ========================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    let tabla = req.params.tabla;
    let busqueda = req.params.busqueda;
    let regex = new RegExp(busqueda, 'i');

    let promesa;

    switch (tabla) {
        case 'hospital':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'medico':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al realizar la busqueda, revise los parámetros',
                errors: { message: 'Tipo de tabla/coleccion no válido' }
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })
});

function buscarHospitales(busqeuda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre correo')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqeuda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre correo')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqeuda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre correo role img')
            .or([{ nombre: regex }, { correo: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            })
    });
}

module.exports = app;