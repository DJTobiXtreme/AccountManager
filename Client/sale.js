console.log(sessionStorage.getItem('idClicked'));
const API_URL = 'http://localhost:5000/monthSales';
const addSale = document.getElementById('addSale');

addSale.addEventListener('click',(event) => {
    event.preventDefault();

    const cost = document.getElementById('saleCost').value;
    const date = new Date();

    const sale = {
        cost,
        date
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
});