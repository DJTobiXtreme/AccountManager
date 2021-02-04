const form = document.querySelector('form');
const API_URL = 'http://localhost:5000/allClients';
const clientsElement = document.querySelector('.clientsList');

listAllClients();

form.addEventListener('submit',(event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('newName');
    const phone = formData.get('newPhone');
    const adress = formData.get('newAdress');

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
});
/*
document.getElementById('btnSearchClient').addEventListener('click',(event)=>{
    document.getElementById('clientsTable').style.display = 'none';
});

/*
document.getElementById('btnSelectClient').addEventListener('click',(event)=>{
    console.log('works');
});
*/


function listAllClients(){
    fetch(API_URL)
        .then(response => response.json())
        .then(clients => {
            console.log(clients);
            clients.forEach(client => {
                const table = document.getElementById('clientsTable').getElementsByTagName('tbody')[0];
                const row = table.insertRow(0);
                const nameCell = row.insertCell(0);
                const phoneCell = row.insertCell(1);
                const adressCell = row.insertCell(2);

                nameCell.innerHTML = client.name;
                phoneCell.innerHTML = client.phone;
                adressCell.innerHTML = client.adress;

                row.onclick = function(){ clientSelected(client._id);}
            });
        });
}

function clientSelected(clientId){
    sessionStorage.setItem('idClicked',clientId);
    window.location.href = "sale.html";
}
