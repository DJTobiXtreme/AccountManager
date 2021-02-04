const express  = require('express');
const cors = require('cors');
const monk = require('monk');

const app = express();

const db = monk('localhost/clientDb');
const clientData = db.get('clientData');

app.use(cors());
app.use(express.json());

app.listen(5000, () => {
    console.log("Listeneing on http://localhost:5000");
});

db.then(() => {
  console.log('Connected correctly to server')
})

app.get('/', (req, res) => {
    res.json({
        message: 'works'
    });
});

app.get('/allClients', (req, res) => {
    clientData
        .find()
        .then(allClients => {
            res.json(allClients);
        })
})

function isValidClient(data){
    return data.name && data.name.toString().trim() !== '' &&
    data.phone && data.phone.toString().trim() !== '' &&
    data.adress && data.adress.toString().trim() !== '';
}

app.post('/allClients', (req, res) => {
    if (isValidClient(req.body)){

        const client = {
            name: req.body.name.toString(),
            phone: req.body.phone.toString(),
            adress: req.body.adress.toString(),
        };

        console.log(client);

        clientData
            .insert(client)
            .then((createdClient) => {
                res.json(createdClient);
            });
    } else {
        res.status(422);
        res.json({
            message: 'Data error'
        });
    }
});

// sale.html

function isValidSale(data){
    return true;
    console.log('sdfsdf');
}

app.post('/monthSales', (req, res) => {
    if(isValidSale(req.body)){
        console.log(req.body);

        res.json(req.body);
    } 
});