let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El	nombre	es	necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' }); // Para ponerle hospitales a la coleccion	

module.exports = mongoose.model('Hospital', hospitalSchema);