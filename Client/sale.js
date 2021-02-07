const clientId = sessionStorage.getItem('idClicked');
console.log(clientId);
API_URL = 'http://localhost:5000/monthSales';
get_API_URL = 'http://localhost:5000/getMonthSales';
const addSale = document.getElementById('addSale');

listClientSales();

addSale.addEventListener('click',(event) => {
    event.preventDefault();

    const cost = document.getElementById('saleCost').value;
    const date = new Date();

    const sale = {
        cost,
        date,
        clientId 
    };

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(sale),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => response.json())
        .then(createdSale => {
            console.log(createdSale);
        });
    
    location.reload();
});

function listClientSales(){
    let actualBalance = 0;
    const clientAux = {
        clientId: clientId
    }

    fetch(get_API_URL, {
        method: 'POST',
        body: JSON.stringify(clientAux),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => response.json())
        .then(sales => {
            sales.forEach(sale => {
                const table = document.getElementById('salesTable').getElementsByTagName('tbody')[0];
                const row = table.insertRow(0);
                const dateCell = row.insertCell(0);
                const costCell = row.insertCell(1);

                const date = new Date(sale.date);
                const saleToDisplay = ''.concat(date.getDate(),'/',date.getMonth()+1,'/',date.getFullYear());

                dateCell.innerHTML = saleToDisplay;
                costCell.innerHTML = sale.cost;

                actualBalance += parseFloat(sale.cost);
            });
            document.getElementById('actualBalance').innerHTML = 'Saldo actual: '.concat(actualBalance);
        });
}