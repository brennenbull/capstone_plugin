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

function printNotes(msg) {
  let dbNotes = document.getElementsByClassName('db-notes')[0];
  while(dbNotes.hasChildNodes()){
    dbNotes.removeChild(dbNotes.lastChild);
  }
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

let newNote = {
  title:'',
  content:'',
}

let newCat = {
  categorie: '',
}

port.onMessage.addListener(function(msg) {
  console.log(msg);
  if(msg.userNotes == 'true' && msg.categories){
    let categories = document.getElementsByClassName('categorie-menu')[0];
    for(let i = 0; i< msg.categories.length; i++){
      let newLi = document.createElement("li");
      let newA = document.createElement("a");
      newA.innerHTML = msg.categories[i].categorie;
      newLi.appendChild(newA);
      categories.appendChild(newLi);
    }
    printNotes(msg);
    return
  }else if(msg.userNotes == 'true' && !msg.categories){
    printNotes(msg);
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
    console.log(newNote);
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

  // NOTE: Get new category name;
  let cat = document.getElementsByClassName('new-cat')[0]
  cat.value='';
  cat.addEventListener('change', (e)=>{
    newCat.categorie = e.target.value;
  })
  // NOTE: Add new post request for category;
  let addCat = document.getElementsByClassName('add-cat')[0];
  addCat.addEventListener('click', ()=>{
    port.postMessage(
      {
        shouldPostCat:true,
        category: newCat
      }
    );
    newCat={
      categorie: '',
    };
    cat.value='';
  })
});
