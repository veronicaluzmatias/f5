const mongoose = require('mongoose');

const bins = [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Bin' }
];

const OrganizationSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    cnpj: {
        type: String,
        required: true
    },
    tel: {
        type: String,
        required: false
    },
    payed: {
        type: Boolean,
        required: true,
        default: false
    },
    bins
});

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = { Organization, OrganizationSchema };  