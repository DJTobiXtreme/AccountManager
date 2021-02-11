const form = document.querySelector('form');
const API_URL = 'http://localhost:5000/allClients';
const filtered_API_URL = 'http://localhost:5000/filteredClients';
const clientsElement = document.querySelector('.clientsList');
const searchBox = document.getElementById('nameToSearch');

listAllClients();

form.addEventListener('submit',(event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('newName');
    const phone = formData.get('newPhone');
    const adress = formData.get('newAdress');

    if (name==="" || phone==="" || adress===""){
        alert("Ningun campo puede estar vacio");
    } else {
        const client = {
            name,
            phone,
            adress
        };

        fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(client),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => response.json())
            .then(createdClient => {
                console.log(createdClient);
            });
    
        location.reload();
    }
});

function listAllClients(){
    fetch(API_URL)
        .then(response => response.json())
        .then(clients => {
            console.log(clients);
            clients.forEach(client => {
                const table = document.getElementById('clientsTable').getElementsByTagName('tbody')[0];
                const row = table.insertRow(-1);
                const nameCell = row.insertCell(0);
                const phoneCell = row.insertCell(1);
                const adressCell = row.insertCell(2);
                const lastMonthCell = row.insertCell(3);

                nameCell.innerHTML = client.name;
                phoneCell.innerHTML = client.phone;
                adressCell.innerHTML = client.adress;
                lastMonthCell.innerHTML = client.lastMonthClosed;

                console.log(client.lastMonthClosed);

                row.onclick = function(){ clientSelected(client._id, client.lastMonthClosed);}
            });
        });
}

function clientSelected(clientId, lastMonthClosed){
    sessionStorage.setItem('idClicked',clientId);
    sessionStorage.setItem('lastMonthClicked',lastMonthClosed);
    window.location.href = "sale.html";
}

searchBox.addEventListener('change', (event) => {
    const oldTable = document.getElementById('clientsTable').getElementsByTagName('tbody')[0];
    const newTable = document.createElement('tbody');

    const inputText = document.getElementById('nameToSearch').value;
    const inputClass = {
        inputText: inputText,
    };

    fetch(filtered_API_URL, {
        method: 'POST',
        body: JSON.stringify(inputClass),
        headers: {
            'content-type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(clients => {
            console.log(clients);
            clients.forEach(client => {
                const row = newTable.insertRow(-1);
                const nameCell = row.insertCell(0);
                const phoneCell = row.insertCell(1);
                const adressCell = row.insertCell(2);
                const lastMonthCell = row.insertCell(3);

                nameCell.innerHTML = client.name;
                phoneCell.innerHTML = client.phone;
                adressCell.innerHTML = client.adress;
                lastMonthCell.innerHTML = client.lastMonthClosed;

                console.log(row);

                row.onclick = function(){ clientSelected(client._id, client.lastMonthClosed);}
            });
        });
    oldTable.parentNode.replaceChild(newTable, oldTable);
});