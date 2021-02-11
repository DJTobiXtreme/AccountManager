const express  = require('express');
const cors = require('cors');
const monk = require('monk');

const app = express();

const db = monk('localhost/clientDb');
const clientData = db.get('clientData');
const salesData = db.get('salesData');

clientData.createIndex('name', function(err,result) {
    console.log(result);
});

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
        .find({},{limit: 20, sort: {lastMonthClosed: 1}})
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

    const date = new Date();
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth()-1)).slice(-2);
    if (month==='00') {
        month = '12';
        year = (parseInt(year, 10)-1).toString();
    }
    console.log(month, date.getMonth());
    const monthYear = year+month;
        

        const client = {
            name: req.body.name.toString(),
            phone: req.body.phone.toString(),
            adress: req.body.adress.toString(),
            lastMonthClosed: monthYear
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

app.post('/filteredClients', (req, res) => {
    const inputText = req.body.inputText.toString();
    console.log(inputText);
    clientData
        .find({"name": {$regex: inputText, $options: 'i'}}, {limit: 20, sort: {name: 1}})
        .then(allClients => {
            res.json(allClients);
        })
})

// sale.html

function isValidSale(data){
    return true;
}

app.post('/getMonthSales', (req, res) => {
    const date = new Date(`${req.body.year}/${req.body.month}`);
    const year = date.getFullYear();
    const month = date.getMonth();
    const clientId = req.body.clientId;


    salesData
        .findOne({year: year, month: month})
        .then(clientSales => {
            auxArray = [];
            if(clientSales!==null){
                clientSales.salesArray.forEach( function(sale) {
                    if (sale.clientId==clientId) auxArray.push(sale); 
                });
            }
            res.json(auxArray);
        });
});

app.post('/monthSales', (req, res) => {
    if(isValidSale(req.body)){

        const date = new Date(req.body.date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const cost = req.body.cost;
        const clientId = req.body.clientId;

        const sale = {
            cost: cost,
            date: new Date(),
            clientId: clientId
        };

        salesData
            .findOne({month: month, year: year})
            .then((period) => {
                if(period===null) {
                    const newPeriod = {
                        year: year,
                        month: month,
                        salesArray: [sale]
                    }
                    salesData.insert(newPeriod)
                        .then((createdNewPeriod) => {
                            console.log(createdNewPeriod);
                        });
                } else {
                    salesData.update({year: year, month: month}, {$push: {salesArray: sale}})
                        .then((updatedPeriod) => {
                            console.log(updatedPeriod);
                        });
                    }
            });

        res.json(req.body);
    } 
});

app.post('/updateLastMonth', (req,res) => {
    const clientId = req.body.clientId.toString();
    const lastMonthClosed = req.body.lastMonthClosed.toString();
    clientData
        .findOneAndUpdate({"_id": clientId}, {$set: {lastMonthClosed: lastMonthClosed}})
        .then((updatedClient) => {
            console.log(updatedClient);
        })
})