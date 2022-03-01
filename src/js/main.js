// START CHECK
if(!("indexedDB" in window)){
  alert("Your browser does not support IndexedDB");
}
// END CHECK

// START DB
let db;
const dbName = "vero_notes";
const dbVersion = 1;
const openDB = indexedDB.open(dbName, dbVersion);

openDB.onupgradeneeded = (e) => {
  db = e.target.result;
  const noteStore = db.createObjectStore("notes", {autoIncrement: true});
}

openDB.onsuccess = (e) => {
  db = e.target.result;
  getAllNotes();
}

openDB.onerror = (e) => {
  alert("Something went wrong, error : ", e.target.error);
}
// END DB


// START CRUD
function addNote(){
  const noteTitle = document.getElementById("noteNewTitle").value ? document.getElementById("noteNewTitle").value : "New title";
  const noteBody = document.getElementById("noteNewBody").value ? document.getElementById("noteNewBody").value : "New body";
  const noteDate = getTimeDate();

  const newNote = {
    title: noteTitle,
    body: noteBody,
    created: noteDate
  };

  const noteStore = db.transaction("notes", "readwrite").objectStore("notes");
  const noteAdd = noteStore.add(newNote);
  
  noteAdd.onsuccess = (e) => {
    document.getElementById("noteNewForm").reset();
    window.location.reload();
  }

  noteAdd.onerror = (e) => {
    alert("Something went wrong");
  }
}

function getAllNotes(){
  const noteStore = db.transaction("notes", "readonly").objectStore("notes");
  const openCursor = noteStore.openCursor(null, "prev");
  
  openCursor.onsuccess = (e) => {
    const cursor = e.target.result;

    if(cursor){
      makeNoteComponent({
        id: cursor.key,
        title: cursor.value.title,
        body: cursor.value.body,
        created: cursor.value.created
      });
      cursor.continue();
    }
  };

  openCursor.onerror = (e) => {
    alert("Something went wrong");
  }
}

function updateNote(){
  const noteId = document.getElementById("noteEditId").value;
  const noteTitle = document.getElementById("noteEditTitle").value;
  const noteBody = document.getElementById("noteEditBody").value;
  const noteDate = getTimeDate();

  let updNote = {
    title: noteTitle,
    body: noteBody,
    created: noteDate
  };

  const noteStore = db.transaction("notes", "readwrite").objectStore("notes");
  
  const updId = parseInt(noteId);
  const noteUpdate = noteStore.put(updNote, updId);
  
  noteUpdate.onsuccess = (e) => {
    window.location.reload();
  }

  noteUpdate.onerror = (e) => {
    alert("Something went wrong");
  }
}

function deleteNote(){
  const confirmed = confirm("Are you sure to remove this note ?");
  if(confirmed){
    const noteId = document.getElementById("noteEditId").value;
    const id = parseInt(noteId);
    const noteStore = db.transaction("notes", "readwrite").objectStore("notes");
    const noteDelete = noteStore.delete(id);
    
    noteDelete.onsuccess = (e) => {
      removeChildElement(noteId);
    }

    noteDelete.onerror = (e) => {
      alert("Something went wrong");
    }
  }
  return
}
// END CRUD


// START FUNCTIONS
function removeChildElement(id){
  const ele = document.getElementById(id);
  appContents.removeChild(ele);
}

function getValueEdit(obj){
  const currTitle = obj.firstElementChild.children[0].innerHTML;
  const currBody = obj.firstElementChild.children[2].innerHTML;
  
  document.getElementById("noteEditId").value = obj.id;
  document.getElementById("noteEditTitle").value = currTitle;
  document.getElementById("noteEditBody").value = currBody;
}

function makeNoteComponent(noteObj){
  appContents.innerHTML += `
  <div class="card w-auto" id="${noteObj.id}" onclick="getValueEdit(this)" data-bs-toggle="modal" data-bs-target="#editNote">
    <div class="card-body bg-warning rounded-3">
      <h5 class="card-title">${noteObj.title}</h5>
      <hr class="underline">
      <p class="card-text mb-1">${noteObj.body}</p>
      <p class="card-text-small float-end">${noteObj.created}</p>
    </div>
  </div>
  `
}

function getTimeDate(){
  const c = new Date();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const tm = getTimeAmPm(c);
  const d = c.getDate();
  const mn = months[c.getMonth()];
  const y = c.getFullYear();

  return `${tm} | ${d} ${mn} ${y}`;
}

function getTimeAmPm(date){
  let h = date.getHours();
  let m = date.getMinutes()

  let amPm = h <= 12 ? "am" : "pm";
  h = h % 12;
  h = h ? h : 12;
  m = m.toString().padStart(2, "0");
  
  return h + ':' + m + ' ' + amPm;
}
// END FUNCTIONS
