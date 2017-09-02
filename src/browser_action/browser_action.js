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
    callback(url);
  });
}

let newNote = {
  title:'',
  content:'',
}

port.onMessage.addListener(function(msg) {
  if(msg.userNotes == 'true'){
    for(let i = 0; i < msg.notes.length; i++){
      let newdiv = document.createElement("div");
      let newTitle = document.createElement("h3");
      newTitle.innerHTML = msg.notes[i].title;
      let newContent = document.createElement("p");
      newContent.innerHTML = msg.notes[i].content;
      newdiv.appendChild(newTitle)
      newdiv.appendChild(newContent)
      document.getElementsByClassName('db-notes')[0].appendChild(newdiv);
    }
  }
});


document.addEventListener('DOMContentLoaded', function() {
  // NOTE: Gets Current Tab When Popup is Triggered
  let parser;
  let name;
  getCurrentTabUrl(function(url) {
    parser = document.createElement('a');
    parser.href= url;
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
        message: name
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
    port.postMessage(
      {
        postParams: name,
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
