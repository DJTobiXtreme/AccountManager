const clientId = sessionStorage.getItem('idClicked');
API_URL = 'http://localhost:5000/monthSales';
get_API_URL = 'http://localhost:5000/getMonthSales';
const addSale = document.getElementById('addSale');
const selectedMonth = document.getElementById('selectedMonth');
const closeMonth = document.getElementById('closeMonth');
const closeMonthPercentage = document.getElementById('closeMonthPercentage');
var auxActualBalance;

setCurrentMonthInputMonth();
listClientSales();

addSale.addEventListener('click',(event) => {
    event.preventDefault();

    const cost = document.getElementById('saleCost').value;

    if (cost===""){
        alert("La venta debe tener un costo");
    } else {
        let date = new Date();
        const year = selectedMonth.value.substr(0,4);
        date.setFullYear(year);
        const month = selectedMonth.value.substr(5,2)-1;
        date.setMonth(month);
        console.log(date);

        if (document.getElementById('nextMonthCheckbox').checked) date.setMonth(date.getMonth()+1); 

        sendSaleRequest(cost, date);
    }
});

closeMonth.addEventListener('click', (event) => {
    if (closeMonthPercentage.value==="") {
        alert("El porcentaje a aplicar no puede estar vacio");
    } else {
        const cost = -auxActualBalance;

        let date = new Date();
        const year = selectedMonth.value.substr(0,4);
        date.setFullYear(year);
        const month = selectedMonth.value.substr(5,2)-1;
        date.setMonth(month);

        sendSaleRequest(cost, date);

        date.setMonth(month+1);
        const percentageCost = -(cost*((parseFloat(closeMonthPercentage.value)/100)+1));

        sendSaleRequest(percentageCost, date);
    }
});

selectedMonth.addEventListener('change', (event) => {
    console.log("select event triggered");
    listClientSales();
});

function listClientSales(){
    const oldTable = document.getElementById('salesTable').getElementsByTagName('tbody')[0];
    const newTable = document.createElement('tbody');

    let actualBalance = 0;
    const year = selectedMonth.value.substr(0,4);
    const month = selectedMonth.value.substr(5,2);

    const requestObject = {
        month: month,
        year: year,
        clientId: clientId
    }

    setLastMonthBalance(month-1, year);

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
            document.getElementById('actualBalance').innerHTML = 'Saldo mes actual: '.concat(actualBalance);
            auxActualBalance = actualBalance;
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

function sendSaleRequest(cost, date){
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
}

function setLastMonthBalance(month, year){
    lastMonthSum = 0;

    newRequestObject = {
        month: month,
        year: year,
        clientId: clientId
    }

    fetch(get_API_URL, {
        method: 'POST',
        body: JSON.stringify(newRequestObject),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => response.json())
        .then(sales => {
            sales.forEach(sale => {
                lastMonthSum += parseFloat(sale.cost);
            });
            document.getElementById('lastMonthBalance').innerHTML = 'Saldo mes anterior: '.concat(lastMonthSum);
        });
}