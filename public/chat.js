const uname = localStorage.getItem('chat_id');
document.getElementById('name').innerText = uname;
var d = {
    op:0,
    bu:0,
    buttonhtml: {
        r:`<legend><button>Reply button</button> <button style="color: rgb(255, 154, 154);;">delete</button></legend>
            <label style="font-size: 15px;">display text:</label><br>
            <input placeholder="display text:" type="text"><br><br>
            <label style="font-size: 15px;">id:</label><br>
            <input placeholder="tpye id...:" type="text">`,
        u:`<legend><button>url button</button> <button style="color: rgb(255, 154, 154);">delete</button></legend>
           <label style="font-size: 15px;">display text:</label><br>
            <input placeholder="display text:" type="text"><br><br>
            <label style="font-size: 15px;">url:</label><br>
            <input placeholder="type url...:" type="text">`,
        c:`<legend><button>copy button</button> <button style="color: rgb(255, 154, 154);">delete</button></legend>
            <label style="font-size: 15px;">display text:</label><br>
            <input placeholder="display text:" type="text"><br><br>
            <label style="font-size: 15px;">id:</label><br>
            <input placeholder="tpye id...:" type="text">`,
        s:`<legend><button>Select button</button> <button style="color: rgb(255, 154, 154);">delete</button></legend>
            <label style="font-size: 15px;">display text:</label><br>
            <input placeholder="display text:" type="text"><br><br>
            <label style="font-size: 15px;">code:</label><br>
            <textarea style="height:220px" placeholder="type json code" name="" id="">{
title: 'title',
sections : [
 {
 title: 'Section 1',
 rows: [
    { title: 'Option 1',id:'0', description: 'Description for option 1' },
    { title: 'Option 2',id:'0', description: 'Description for option 2' }
 ]
 }
]
}</textarea>`
    },
    buttondata:{},
    button:[],
    buid:-1

}
var min = document.getElementById('in')
var chat = document.getElementById('chat')
function op(){
    let o1 = document.getElementById('o1').style
    if(d.op == 0){
    d.op = 1;
    min.placeholder = 'Fill the top box.'
    min.style.opacity='0.4'
    min.disabled = true;
    o1.display = 'flex'
    }
    else{
        d.op = 0;
        min.placeholder = 'Type massage...'
        min.style.opacity='1'
        min.disabled = false;
        o1.display = 'none'
    }
}
function addbu(){
    let bu = document.getElementById('bu').style
    if(d.bu == 0){
    d.bu = 1;op()
    bu.display = 'flex'}
    else{
        d.bu = 0;op()
        bu.display = 'none'
    }
}

function bua(t){
    let bulist = document.getElementById('bulist')
    let field = document.createElement('fieldset');
    field.innerHTML = d.buttonhtml[t]
    bulist.appendChild(field);
    addbu();
    d.buid =d.buid + 1;
    d.buttondata[d.buid]={
        type:t,
        doc:field
    }
    if(t=='r'){
        d.button.pop({
            name: 'quick_reply',
            buttonParamsJson: '{"display_text":"","id":""}'
          }
        )
    }
    if(t=='c'){
        d.button.pop({
            name: 'cta_copy',
            buttonParamsJson: '{"display_text":"","copy_code":""}'
          }
        )
    }
    if(t=='u'){
        d.button.pop({
              name: 'cta_url',
              buttonParamsJson: '{"display_text":"","url":""}'
            }
        )
    }
    if(t=='u'){
        d.button.pop({
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: 'title',
                sections : []
            })
                  
        })
    }
}
function send(){
    let div = document.createElement('div');
    div.className = 'right'
    if(d.op == 0){
        div.innerHTML = `<div class="cb">
                            <span>${min.value}</span>
                            <label><img class='w1' src="icon/w1.png"></label>
                        </div>`
        chat.appendChild(div)
        let r = new XMLHttpRequest()
        let f = new FormData();
        f.append('op',d.op);
        f.append('num',uname+'@s.whatsapp.net')
        f.append('data',min.value)
        min.value  = '';
        r.open('POST','/wasend',true)
        r.onreadystatechange = function(){
            if(r.status == 200 && r.readyState == 4){
                div.querySelector('.w1').src = "icon/w2.png"
            }
        }
        r.send(f);
    }else{
        
        let r = new XMLHttpRequest()
        let f = new FormData();
        f.append('op',d.op);
        f.append('num',uname+'@s.whatsapp.net')

        let bt = []
        for(let x=0;x<=d.buid;x++){
            let bt1 = {}
            console.log(d.buttondata[x].type)
            
            if(d.buttondata[x].type=='r'){
                let tags =d.buttondata[x].doc.querySelectorAll('input');
                bt1['name']='quick_reply'
                bt1['buttonParamsJson']=`{'display_text':'${tags[0].value}','id':'${tags[1].value}'}`
                bt.push(bt1);
                console.log('r bt1 data :',bt1)
                console.log('bt :',bt)

            }else if(d.buttondata[x].type=='u'){
                let tags =d.buttondata[x].doc.querySelectorAll('input');
                bt1['name']='cta_url'
                bt1['buttonParamsJson']=`{'display_text':'${tags[0].value}','url':'${tags[1].value}'}`
                bt.push(bt1);

            }else if(d.buttondata[x].type=='c'){
                let tags =d.buttondata[x].doc.querySelectorAll('input');
                bt1['name']='cta_copy'
                bt1['buttonParamsJson']=`{'display_text':'${tags[0].value}','copy_code':'${tags[1].value}'}`
                bt.push(bt1);
            }else{
                const validJson = (d.buttondata[x].doc.querySelector('textarea').value).replace(/\s{2,}/g, ' ').replace(/\n/g, '').replace(/ '"/g, '');
                //console.log(validJson)
                //console.log(JSON.parse(validJson))
                bt.push({
                    name: d.buttondata[x].doc.querySelector('input').value,
                    buttonParamsJson: validJson
                          
                })
            }
        }
        console.log(bt)
        let infild = [document.getElementById('imgin').value,document.getElementById('msgin').value,document.getElementById('foin').value]
        f.append('img',infild[0])
        f.append('msg',infild[1])
        f.append('folter',infild[2])
        let html = '<div class="cb">'
        if(infild[0]!=='') html = html + `<div style="background-image: url(${infild[0]})"></div>` ;
        if(infild[1]!=='') html = html + `<span>${infild[1]}</span>` ;
        if(infild[2]!=='') html = html + `<span style="opacity: 0.7;">${infild[2]}</span>` ;
        html = html + '<label><img class="w1" src="icon/w1.png"></label></div>'
        div.innerHTML = html
        chat.appendChild(div)
        f.append('bt',JSON.stringify(bt))
        r.open('POST','/wasend',true)
        r.onreadystatechange = function(){
            if(r.status == 200 && r.readyState == 4){
                div.querySelector('.w1').src = "icon/w2.png";
            }
        }
        r.send(f);
        if(d.op==1) op();
    }
}