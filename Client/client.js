const form = document.querySelector('form');
const API_URL = 'http://localhost:5000/allClients';
const filtered_API_URL = 'http://localhost:5000/filteredClients';
const delete_client_API_URL = 'http://localhost:5000/deleteClient';
const modify_client_API_URL = 'http://localhost:5000/modifyClient';
const clientsElement = document.querySelector('.clientsList');
const searchBox = document.getElementById('nameToSearch');

listClients();

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

function clientSelected(clientId, lastMonthClosed, name, adress, phone){
    console.log("cClient selected");
    sessionStorage.setItem('idClicked',clientId);
    sessionStorage.setItem('lastMonthClicked',lastMonthClosed);
    sessionStorage.setItem('nameClicked',name);
    sessionStorage.setItem('adressClicked',adress);
    sessionStorage.setItem('phoneClicked',phone);
    window.location.href = "sale.html";
}

searchBox.addEventListener('change', listClients);

function listClients(){
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
            clients.forEach(client => {
                const row = newTable.insertRow(-1);
                const nameCell = row.insertCell(0);
                const phoneCell = row.insertCell(1);
                const adressCell = row.insertCell(2);
                const lastMonthCell = row.insertCell(3);
                const modifyCell = row.insertCell(4);
                const deleteClientCell = row.insertCell(5);

                nameCell.innerHTML = client.name;
                phoneCell.innerHTML = client.phone;
                adressCell.innerHTML = client.adress;
                lastMonthCell.innerHTML = client.lastMonthClosed;

                modifyCell.style.backgroundColor = "cyan";
                deleteClientCell.style.backgroundColor = "red";

                nameCell.onclick = function(){ clientSelected(client._id, client.lastMonthClosed, client.name, client.phone, client.adress);}
                phoneCell.onclick = function(){ clientSelected(client._id, client.lastMonthClosed, client.name, client.phone, client.adress);}
                adressCell.onclick = function(){ clientSelected(client._id, client.lastMonthClosed, client.name, client.phone, client.adress);}
                lastMonthCell.onclick = function(){ clientSelected(client._id, client.lastMonthClosed, client.name, client.phone, client.adress);}
                modifyCell.onclick = function(){ modifyClient(client._id);}
                deleteClientCell.onclick = function(){ eliminateClient(client._id);}
            });
        });
    oldTable.parentNode.replaceChild(newTable, oldTable);
}

function modifyClient(clientId){
    if(confirm(`¿Estas seguro que deseas modificar el cliente con todas sus compras?`)) {
        const name = prompt("Nombre");
        const adress = prompt("Direccion");
        const phone = prompt("Telefono");

        const requestObject = {
            clientId,
            name,
            adress,
            phone
        }

        fetch(modify_client_API_URL, {
            method: 'POST',
            body: JSON.stringify(requestObject),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => response.json())
        .then(modifiedClient => {
            console.log(modifiedClient);
        })
        location.reload();
    }
    console.log("Modify");
}

function eliminateClient(clientId){
    if(confirm(`¿Estas seguro que deseas eliminar el cliente con todas sus compras?`)) {
        requestObject = {
            clientId
        }

        console.log("eliminate");
        fetch(delete_client_API_URL, {
            method: 'POST',
            body: JSON.stringify(requestObject),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => response.json())
        .then(deletedClient => {
            console.log(deletedClient);
        })
        location.reload();
    }
}