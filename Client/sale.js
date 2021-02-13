const clientId = sessionStorage.getItem('idClicked');
const lastMonthClosed = sessionStorage.getItem('lastMonthClicked');
API_URL = 'http://localhost:5000/monthSales';
get_API_URL = 'http://localhost:5000/getMonthSales';
update_lastMonth_API_URL = 'http://localhost:5000/updateLastMonth';
delete_sale_API_URL = 'http://localhost:5000/deleteSale'
const btnAddSale = document.getElementById('addSale');
const selectedMonth = document.getElementById('selectedMonth');
const closeMonth = document.getElementById('closeMonth');
const closeMonthPercentage = document.getElementById('closeMonthPercentage');
const revertCloseMonth = document.getElementById('revertCloseMonth');
const costInput = document.getElementById('saleCost');
costInput.focus();
var auxActualBalance;
var lastMonthSum = 0;
var actualBalance = 0;

setCurrentMonthInputMonth();
listClientSales();

//onchange insgresarco sto vneta

btnAddSale.addEventListener('click',(event) => {
    event.preventDefault();
    addSale();
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
    lastMonthSum = 0;
    actualBalance = 0;
    listClientSales();
});

btnBack.addEventListener('click', (event) => {
    window.location.href = "index.html";
})

costInput.addEventListener('change', (event) => {
    addSale();
})

function addSale(){
    const cost = costInput.value;

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
}

function listClientSales(){
    const oldTable = document.getElementById('salesTable').getElementsByTagName('tbody')[0];
    const newTable = document.createElement('tbody');

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
                const deleteCell = row.insertCell(2);

                const date = new Date(sale.date);
                const saleToDisplay = ''.concat(date.getDate(),'/',date.getMonth()+1,'/',date.getFullYear());

                dateCell.innerHTML = saleToDisplay;
                costCell.innerHTML = sale.cost;

                deleteCell.style.backgroundColor = "red";
                
                deleteCell.onclick =  function() { eraseSale(sale.date);};

                actualBalance += parseFloat(sale.cost);
            });
            document.getElementById('actualBalance').innerHTML = 'Saldo mes actual: '.concat(actualBalance);
            auxActualBalance = actualBalance;
            setClientData();
        });
        oldTable.parentNode.replaceChild(newTable, oldTable);
}

function eraseSale(saleDate){
    console.log("a",saleDate);
    let date = new Date();
    const year = selectedMonth.value.substr(0,4);
    date.setFullYear(year);
    const month = selectedMonth.value.substr(5,2)-1;
    date.setMonth(month);
    requestObject = {
        periodDate: date,
        saleDate: saleDate
    }
    if(confirm('¿Estas seguro que quieres eliminar la venta?')){
        console.log("si");
        fetch(delete_sale_API_URL, {
            method: 'POST',
            body: JSON.stringify(requestObject),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => response.json())
            .then((deletedSale) => {
                console.log(deletedSale);
            });
        location.reload();
    } else{
        console.log("no");
    }
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

function setClientData(){
    const clientName = sessionStorage.getItem('nameClicked');
    const clientAdress = sessionStorage.getItem('adressClicked');
    const clientPhone = sessionStorage.getItem('phoneClicked');

    document.getElementById('clientName').innerHTML = clientName;
    document.getElementById('clientPhone').innerHTML = clientPhone;
    document.getElementById('clientAdress').innerHTML = clientAdress;
    document.getElementById('clientCloseMonth').innerHTML = lastMonthClosed;
    document.getElementById('totalBalance').innerHTML = `Saldo total: ${(lastMonthSum+actualBalance)}`;
    console.log(lastMonthSum+actualBalance);
}

revertCloseMonth.addEventListener('click', (event) => {
    const value = prompt("¿Estas seguro que deseas revertir el cambio? El nuevo cierre mes debe ser del formato AAAAMM sin separadores");
    console.log(value);
    if(value!==null && value.length===6 && !isNaN(value)){
        sendUpdateLastMonth(value);
        sessionStorage.setItem('lastMonthClicked',value);
        alert("Recuerda eliminar las ventas autogeneradas por el boton cerrar mes.");
        location.reload();
    }
})