const Messenger = require('messenger-node');

let client_config = {
    'page_token': process.env.PAGE_TOKEN,
    'app_token': process.env.APP_TOKEN,
    'api_version': process.env.API_VERSION
  }
  
const Client = new Messenger.Client(client_config);

function testMessage(){
    let recipient = {
        'id': '784572586'
      };
      
      // set the message to send
      let text = 'This is my amazing text message?!'
      
      // send the text message
      Client.sendText(recipient, text)
        .then(res => {
          // log the api response
          console.log(res);
        })
        .catch(e => {
          console.error(e);
        });
      
}

testMessage()
  
module.exports = {
    testMessage
}