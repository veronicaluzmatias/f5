import escapeRegExp from 'escape-string-regexp';
import express from 'express';
import gmaps from '@google/maps';
import configAuth from '../config/auth';
import { Bins } from '../models/Bins';
import { Orders } from '../models/Orders';
import { Organization } from '../models/Organization';
import { Places } from '../models/Places';

const router = express.Router();

router.get('/address', configAuth.ensureAuthenticated, (req, res) => {
    const query = req.query.q;
    if (process.env.USE_GOOGLE_PLACES_API) {
        const googleMapsClient = gmaps.createClient({
            key: process.env.GMAPS_API_KEY
        });
        googleMapsClient.places({
            query
        }, function (err, response) {
            if (err) {
                res.status(500);
                res.send(err);
                return;
            }
            res.send(response.json.results);
        });
    } else {
        const name = new RegExp(escapeRegExp(query));
        Places.find({ name }, (err, docs) => {
            res.send(docs);
        });
    }
});


router.post('/register', configAuth.ensureAuthenticated, (req, res) => {
    const { address, size } = req.body;
    if (!address) {
        res.status(402);
        res.send('Address field is required');
        return;
    }
    
    if (!size) {
        res.status(402);
        res.send('Size field is required');
        return;
    }

    let bin;
    let order;
    return Organization.findById(req.user.organization, (err, org) => {
        if (err) {
            res.render('login', err);

            return;
        }

        Places.findById(address, (err, place) => {
            if (err) {
                res.status(500);
                res.send(err);
                return;
            }
            if (!place) {
                res.status(404);
                res.send('Place not found');
                return;
            }
            bin = new Bins({
                coords: {
                    latitude: place.latitude,
                    longitude: place.longitude,
                    address: place.address
                },
                size: size.toUpperCase()
            });
            org.bins.push(bin);
            return bin.save();
        })
        .then(() => {
            order = new Orders({
                bin,
                organization: org
            });
            return order.save();
        })
        .then(() => org.save())
        .then(() => {
            res.status(201);
            res.send({
                orderId: order._id,
                address: bin.coords.address,
                size: bin.size
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500);
            res.send(err);
        });
    });
});

export default router;
