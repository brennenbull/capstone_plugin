chrome.extension.onConnect.addListener(function(port){
  port.onMessage.addListener(function(msg, send){
    if(msg.shouldGet){
      fetch(`http://localhost:8380/notes/?host=${msg.message}`,{
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }})
        .then((resp) => resp.json())
        .then(function(data) {
          console.log('from server', data)
          port.postMessage(data);
      });
    }else if(msg.shouldPost){
      parser = msg.postParams;
      let name;
      if(parser.indexOf('com') === -1){
        name = parser;
      }else if (parser.indexOf('www') === -1){
        name = parser.substring(0, parser.indexOf('com')-1)
      }else{
        name = parser.substring(0, parser.indexOf('com')-1)
        name = name.substring(parser.indexOf('www')+4);
      }
      fetch(`http://localhost:8380/notes/${name}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(msg.note),
      })
      .then((resp) => resp.json())
      .then(function(data) {
        port.postMessage(data);
      });
    }
  });
});