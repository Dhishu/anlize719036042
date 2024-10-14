function chat_open(id){
    localStorage.setItem('chat_id',id);
    window.location.assign('chat.html');
}



const send = async function(u) {
    return new Promise((resolve, reject) => {
        let xml = new XMLHttpRequest();
        xml.open('GET', u, true);
        xml.onreadystatechange = function() {
            if (xml.readyState === 4) {
                if (xml.status === 200) {
                    resolve(JSON.parse(xml.responseText)); // Parse the JSON response
                } else {
                    reject('Error: ' + xml.status); // Handle error
                }
            }
        };
        xml.send();
    });
};

var list = document.getElementById('list');
send('/con_num')
    .then(response => {
        for(let i = 0;i < response.length;i++){
            let d1 = document.createElement('div');
            d1.className = 'chat';
            d1.setAttribute("onclick","chat_open('"+response[i].num+"')")
            d1.innerHTML=`
                <img src="${response[i].img}">
                <div class="n">
                    <div class="n1">
                        <div>${response[i].num}</div>
                        <!--<span>7:29 pm</span>-->
                    </div>
                    <!--<div  class="n2"></div>-->
                </div>`;
            list.appendChild(d1);
        }
        console.log(response);// Show the file names in an alert
    })
    .catch(error => {
        console.error(error);
        alert('Failed to Number');
    });
