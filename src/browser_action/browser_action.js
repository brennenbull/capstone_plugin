//Establishes port to background.js and sends a message to that port
var port = chrome.extension.connect({
      name: "database communication"
});

function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    console.log(url);
    callback(url);
  });
}

let newNote = {
  title:'',
  content:'',
}

port.onMessage.addListener(function(msg) {
  if(msg.userNotes == 'true'){
    document.getElementsByClassName('person')[0].innerHTML = msg.notes.title;
    document.getElementsByClassName('info')[0].innerHTML = msg.notes.content;
  }
  // console.log("message recieved " + msg.notes);
  // document.getElementsByClassName('notes')[0].innerHTML = "message recieved " + msg.notes.title + ": " + msg.notes.content

});


document.addEventListener('DOMContentLoaded', function() {
  // NOTE: Gets Current Tab When Popup is Triggered
  let parser;
  getCurrentTabUrl(function(url) {
    parser = document.createElement('a');
    parser.href= url;
    let name;
    if(parser.hostname.indexOf('com') === -1){
      name = url;
    }else if (parser.hostname.indexOf('www') === -1){
      name = parser.hostname.substring(0, parser.hostname.indexOf('com')-1)
    }else{
      name = parser.hostname.substring(0, parser.hostname.indexOf('com')-1)
      name = name.substring(parser.hostname.indexOf('www')+4);
    }
    var titleElement = document.getElementById('url')
    titleElement.innerText = name
    port.postMessage(
      {
        shouldGet: true,
        message: parser.hostname
      }
    );
  });

  // NOTE: Sets Note Content
  let title = document.getElementsByClassName('note-title')[0];
  title.value = "";
  let content = document.getElementsByClassName('note-content')[0];
  content.value = ""
  title.addEventListener('change', (e)=>{
    newNote.title = e.target.value;
  })
  content.addEventListener('change', (e)=>{
    newNote.content = e.target.value;
  })

  // NOTE: Adds Submit Listen and Sends to BG.js
  let button = document.getElementsByClassName('click')[0]
  button.addEventListener('click', ()=>{
    console.log('new note', newNote);
    port.postMessage(
      {
        postParams: parser.hostname,
        shouldPost: true,
        note: newNote
      }
    );
    newNote = {
      title:'',
      content:'',
    }
    content.value = "";
    title.value = "";
  }, false);
});
