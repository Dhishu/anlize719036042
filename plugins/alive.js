const fs = require('fs');
var contact = []

async function helder(c, m, { jid, uid, group, formMe, text }) {
  try {
    if (jid.includes('@s.whatsapp.net')) {
      if (!contact.includes(jid.split('@')[0])) {
          // Read the JSON file
          try {
              const data = fs.readFileSync('contact.json', 'utf8');
              const jsonData = JSON.parse(data);
              contact.push(jid.split('@')[0]);
              if(!jsonData.includes(jid.split('@')[0])){
                jsonData.push(jid.split('@')[0]);
                fs.writeFileSync('contact.json', JSON.stringify(jsonData, null, 2), 'utf8');
                console.log('Contact added successfully!');
              }
              
              
          } catch (err) {
              console.error('Error reading or writing the file:', err);
          }
      }
  }
    c.sendPresenceUpdate('unavailable')

    if(jid=='status@broadcast'){
      await c.readMessages([m.key])
    }
    if(!formMe && !group && jid!=='94789496778@s.whatsapp.net'){
      await c.sendPresenceUpdate('composing', jid)
    }
    let t2 = text;
    if(m.message?.extendedTextMessage?.text){
      t2=m.message.extendedTextMessage.text
    }
    if(jid == '120363023803537689@g.us' && !formMe){
      const reactionMessage = {
          react: {
              text: "💖", 
              key: m.key
          }
      }
      await c.sendMessage(jid, reactionMessage)
    }
  } catch (error) {
    console.error("An error occurredklllll:", error.message);
  }
}

module.exports = helder;


helder.user = ['120363300638311505@g.us', '94740945396@s.whatsapp.net'];
