const clientId = sessionStorage.getItem('idClicked');
API_URL = 'http://localhost:5000/monthSales';
get_API_URL = 'http://localhost:5000/getMonthSales';
const addSale = document.getElementById('addSale');
const selectMonth = document.getElementById('selectedMonth');

setCurrentMonthInputMonth();
listClientSales();

addSale.addEventListener('click',(event) => {
    event.preventDefault();

    const cost = document.getElementById('saleCost').value;
    let date = new Date();

    if (document.getElementById('nextMonthCheckbox').checked) date.setMonth(date.getMonth()+1); 

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

selectMonth.addEventListener('change', (event) => {
    console.log("select event triggered");
    listClientSales();
})

function listClientSales(){
    const oldTable = document.getElementById('salesTable').getElementsByTagName('tbody')[0];
    const newTable = document.createElement('tbody');

    let actualBalance = 0;
    const year = selectMonth.value.substr(0,4);
    const month = selectMonth.value.substr(5,2);

    const requestObject = {
        month: month,
        year: year,
        clientId: clientId
    }

    console.log(requestObject);

    fetch(get_API_URL, {
        method: 'POST',
        body: JSON.stringify(requestObject),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => response.json())
        .then(sales => {
            sales.forEach(sale => {
                const row = newTable.insertRow(0);
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
        oldTable.parentNode.replaceChild(newTable, oldTable);
}

function setCurrentMonthInputMonth(){
    const actualMonthElement = document.getElementById("selectedMonth");
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    actualMonthElement.value = `${year}-${month}`;
}