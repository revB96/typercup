const Messenger = require('messenger-node');

let client_config = {
    'page_token': 'EAAMJvuJSZCIsBAIaUKbofl7pnxzAglzasKzoYv946ULiXEurJRkl2H0ZAaU7n9gRElhPrkYtTZB9xqlAessjx358NIUKGUcoYzXqMtPSJnhkoiTxvUYEoZBO1rv8PZCc3qi9aQyYjXIzb5a7M7HLZBqZCECjHLU3VStgvYEpEciWu8AHTMPumZAm',
    'app_token': '855140375657611',
    'api_version': 'v15.0'
  }
  
const Client = new Messenger.Client(client_config);

function testMessage(){
    let recipient = {
        'id': 'p_ambroziak@outlook.com'
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