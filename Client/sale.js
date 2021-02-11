const clientId = sessionStorage.getItem('idClicked');
const lastMonthClosed = sessionStorage.getItem('lastMonthClicked');
API_URL = 'http://localhost:5000/monthSales';
get_API_URL = 'http://localhost:5000/getMonthSales';
update_lastMonth_API_URL = 'http://localhost:5000/updateLastMonth';
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
    let date = new Date();
    const year = selectedMonth.value.substr(0,4);
    date.setFullYear(year);
    const month = selectedMonth.value.substr(5,2)-1;
    date.setMonth(month);

    const auxMonth = selectedMonth.value.substr(5,2);
    const monthYear = year+auxMonth;
    const aux = isValidCloseMonth(monthYear);
    if (aux===1) {
        alert("El porcentaje a aplicar no puede estar vacio");
    } else if (aux===2){
        alert("Este mes ya ha sido cerrado");
    } else if (aux===3){
        alert("El mes anterior a este no ha sido cerrado");
    } else {
        const cost = -auxActualBalance;

        sendSaleRequest(cost, date);

        date.setMonth(month+1);
        const percentageCost = -(cost*((parseFloat(closeMonthPercentage.value)/100)+1));

        sendSaleRequest(percentageCost, date);
        
        sessionStorage.setItem('lastMonthClicked', monthYear);
        sendUpdateLastMonth(monthYear);
    }
});

selectedMonth.addEventListener('change', (event) => {
    console.log("select event triggered");
    listClientSales();
});

btnBack.addEventListener('click', (event) => {
    window.location.href = "index.html";
})

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

function isValidCloseMonth(monthYear){
    console.log(lastMonthClosed, monthYear);
    const auxFrist = parseInt(lastMonthClosed,10)
    const auxSecond = parseInt(monthYear,10);
    const auxCheck =  auxFrist - auxSecond;
    console.log(auxFrist, auxSecond, auxCheck);
    if (closeMonthPercentage.value==="") return 1;
    if (auxCheck>-1) return 2;
    if (auxCheck!==-1 && auxCheck!==-89) return 3;
    return 0;
}

function setCurrentMonthInputMonth(){
    const actualMonthElement = document.getElementById("selectedMonth");
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    actualMonthElement.value = `${year}-${month}`;
}

function sendUpdateLastMonth(lastMonthClosed){
    const requestObject = {
        clientId: clientId,
        lastMonthClosed: lastMonthClosed
    }

    fetch(update_lastMonth_API_URL, {
        method: 'POST',
        body: JSON.stringify(requestObject),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => response.json())
        .then(updatedId => {
            console.log(updatedId);
        })
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