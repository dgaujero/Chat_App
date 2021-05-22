
// used to create an event listener for this form
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// we have access to io because of the script tag in chat.html
const socket = io();

// join chatroom
socket.emit('joinRoom', { username, room });

// get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
// listen for a submit and pass in event param 
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();3

  // Get message text
  // e.target gives us the current el
  let msg = e.target.elements.msg.value;

  console.log(msg, e.target.elements)

  // msg = msg.trim();

  // if (!msg) {
  //   return false;
  // }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  // .focus focuses on the empty input
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class='meta'> ${message.username} <span>${message.time}</span> </p>
  <p class='text'>
    ${message.text}
    </p>`;
  document.querySelector('.chat-messages').appendChild(div);
  // const p = document.createElement('p');
  // p.classList.add('meta');
  // p.innerText = message.username;
  // p.innerHTML += `<span>${message.time}</span>`;
  // div.appendChild(p);
  // const para = document.createElement('p');
  // para.classList.add('text');
  // para.innerText = message.text;
  // div.appendChild(para);
  // document.querySelector('.chat-messages').appendChild(div);
}

// add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});