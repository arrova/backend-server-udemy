// Importaciones
let express = require('express');
// Para subir archivos npm i express-fileupload --save
let fileUpload = require('express-fileupload');
let fs = require('fs');

// Inicializar variables
let app = express();

// default options
app.use(fileUpload());

let Usuario = require('../models/usuario');
let Medico = require('../models/medico');
let Hospital = require('../models/hospital');

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // Tipos de colección
    let tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensjae: 'El tipo de colección no es valido',
            errors: { message: 'Tipo de colección no es valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensjae: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    let archivo = req.files.imagen;
    let nombreCortado = archivo.name.split('.');
    let extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extenciones aceptamos
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensjae: 'Extensión no válida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensjae: 'Error al mover archivo',
                errors: err
            })
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Archivo movido'
    // });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existente',
                    errors: { message: 'Usuario no existente' }
                });
            }

            let pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usaurio actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    } else if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Médico no existente',
                    errors: { message: 'Médico no existente' }
                });
            }

            let pathViejo = './uploads/medicos/' + medico.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo) && medico.img !== '') {
                fs.unlinkSync(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    } else if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existente',
                    errors: { message: 'Hospital no existente' }
                });
            }

            let pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;