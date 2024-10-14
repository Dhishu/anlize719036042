
const pino = require('pino');
const {
  default: makeWASocket,
  downloadContentFromMessage,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
    useMultiFileAuthState, 
    delay
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');


const multer = require('multer');//get js post data
const upload = multer();

const app = express();
const port = process.env.PORT || 3000;

var socket;
app.use(express.static('public'));//host public
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


///SHAN WHATSAPP..........................................







app.get('/con_num', upload.none(), async (req, res) => {
  try {
    const data = fs.readFileSync('contact.json', 'utf8');
    const jsonData = JSON.parse(data);
      const fileNames = jsonData;

      // Create an array of user objects
      let users = [];
      for (let i = 0; i < fileNames.length; i++) {
        const img = await socket.profilePictureUrl(`${fileNames[i]}@s.whatsapp.net`).catch(() => 'icon/dp.png');

          
          
          let user2 = {
              num: fileNames[i],
              img : img
          };
          users.push(user2); // Use push to add to the users array
      }

      res.json(users); // Send the users array as JSON
  } catch (error) {
      console.error('Error fetching file names:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/wasend', upload.none(),async (req, res)=>{
  console.log(req.body)
  if(req.body.op == '0'){
    socket.sendMessage(req.body.num, { text: req.body.data });
  }else{
    console.log(JSON.parse(req.body.bt))
    socket.sendButton(req.body.num, req.body.msg, req.body.folter, req.body.img, JSON.parse(req.body.bt));
  }
  res.send('1');
})


///SHAN WHATSAPP...........................................end








global.send = function(x){
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(x)}\n\n`);
    });
}






// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

function gettype(m) {
    if (m.key) {
        if (m.remoteJid === 'status@broadcast') {
            return ('status');
        }
        if (m.message) {
            if (m.message.imageMessage) {
                return ('imageMessage');
            }
            if (m.message.conversation) {
                return ('textMessage');
            }
            if (m.message.videoMessage) {
                return ('video msg');
            }
            if (m.message.stickerMessage) {
                return 0;
            }
        }
    }
    return 0;
}


async function connectWhatsApp() {
    
    const auth = await useMultiFileAuthState('session');
    socket = makeWASocket({
        printQRInTerminal: true,
        browser: ["thilina", 'safari', "1.0.0"],
        auth: auth.state,
        logger: pino({ level: 'silent' })
    });
    socket.ev.on('creds.update', auth.saveCreds);
    socket.ev.on('connection.update', async ({ connection }) => {
        if (connection === 'open') {
            await socket.sendMessage('94740945396@s.whatsapp.net', { text: "Bot is connected👋" });
            await socket.sendPresenceUpdate("unavailable");
            console.log('bot start');
        } else if (connection === 'close') {
            await connectWhatsApp();
        }
    });
    

    socket.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
          
            delete require.cache[require.resolve('./plugins/alive.js')];
            let helder = require('./plugins/alive.js');
            const msgType = gettype(messages[0]);
            let d = {
                jid: messages[0].key.remoteJid,
                formMe: messages[0].key.fromMe
            };
            if (msgType === 'textMessage') {
              
                d.text = messages[0].message.conversation;
                
            }
            if (messages[0].key.participant) {
                d.group = messages[0].key.remoteJid;
                d.uid = messages[0].key.participant;
            } else {
                d.group = false;
                d.uid = messages[0].key.remoteJid;
            }
            try {
                console.log(messages[0].key.remoteJid);
                helder(socket, messages[0], d);
                if (helder.user.includes(messages[0].key.remoteJid)) {
                    //helder(socket, messages[0], d);
                }

                
            } catch (error) {
                console.error('An error occurred:', error);
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    });
    //get file. button sender
    
    //button sender
    socket.sendButton = async function(jid, text = '', footer = '', buffer, buttons, quoted, options) {
        let img, video;
        const fetch = (await import('node-fetch')).default;

        // Usage example

        if (/^https?:\/\//i.test(buffer)) {
          try {
            const response = await fetch(buffer);
            const contentType = response.headers.get('content-type');
            if (/^image\//i.test(contentType)) {
              img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: socket.waUploadToServer });
            } else if (/^video\//i.test(contentType)) {
              video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: socket.waUploadToServer });
            } else {
              console.error("Filetype not supported", contentType);
            }
          } catch (error) {
            console.error("Failed to detect file type", error);
          }
        } else {
          try {
            const type = await socket.getFile(buffer);
            if (/^image\//i.test(type.mime)) {
              img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: socket.waUploadToServer });
            } else if (/^video\//i.test(type.mime)) {
              video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: socket.waUploadToServer });
            }
          } catch (error) {
            console.error("Error getting file type", error);
          }
        }


        const interactiveMessage = {
          body: { text: text },
          footer: { text: footer },
          header: {
            hasMediaAttachment: !!img || !!video,
            imageMessage: img ? img.imageMessage : null,
            videoMessage: video ? video.videoMessage : null
          },
          nativeFlowMessage: {
            buttons: buttons,
            messageParamsJson: ''
          }
        };

        let msgL = generateWAMessageFromContent(jid, { viewOnceMessage: { message: { interactiveMessage } } }, { userJid: jid, quoted });
        console.log(JSON.stringify(msgL.message))
        const bmsg = await socket.relayMessage(jid, msgL.message, { messageId: msgL.key.id, ...options });
        return bmsg;
      };

    
    
}

connectWhatsApp();










