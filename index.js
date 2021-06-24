/* eslint-disable no-alert */
/* eslint-disable no-plusplus */
/* eslint-disable no-useless-concat */
/* eslint-disable no-console */
/* eslint-disable camelcase */
const mainContainer = document.getElementById('main-container');
const userInput = document.getElementsByClassName('login-input')[0];
const loginButton = document.getElementsByClassName('login-button')[0];
const loginForm = document.getElementsByClassName('login-form')[0];

let user = false;

function displayTime() {
  let str = '';

  const currentDate = new Date();
  let date = currentDate.getDate();
  let month = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  let hour = currentDate.getHours();
  let minutes = currentDate.getMinutes();

  if (date < 10) {
    date = `0${date}`;
  }
  if (month < 10) {
    month = `0${month}`;
  }
  if (hour < 10) {
    hour = `0${hour}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  str += `${hour}:${minutes} ${date}.${month}.${currentYear}`;
  return str;
}

const sendButton_handler = () => {
  const chatWindow_input = document.getElementsByClassName('user-chat-input')[0];
  const message = `${chatWindow_input.value}___clientNik${user}`;
  const ws = new WebSocket('ws://socket-backend-hw.herokuapp.com/');
  ws.binaryType = 'blob';

  ws.addEventListener('open', () => {
    ws.send(message);
  });

  ws.addEventListener('message', (evt) => {
    const messageText = evt.data;
    let userNik = messageText.split(/(___clientNik)/)[2];
    const userMessage = messageText.split(/(___clientNik)/)[0];

    const chatView = document.getElementsByClassName('chat-area')[0];

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');
    if (userNik === user) {
      messageContainer.classList.add('my-message-container');
    } else {
      messageContainer.classList.add('message-container');
    }
    const messageTitle = document.createElement('p');
    messageTitle.classList.add('message-title');
    if (userNik === user) {
      messageTitle.style.color = 'red';
      userNik = 'You';
    }
    messageTitle.textContent = `${userNik},  ` + `${displayTime()}`;
    const messageContent = document.createElement('p');
    messageContent.classList.add('message-content');
    messageContent.textContent = userMessage;

    messageContainer.appendChild(messageTitle);
    messageContainer.appendChild(messageContent);

    chatView.appendChild(messageContainer);
    chatView.scrollTo(0, chatView.scrollHeight);
  });

  ws.addEventListener('close', (evt) => {
    console.log('connection closed', evt);
  });

  ws.addEventListener('error', () => {
    console.log('error');
  });
};

function domBuild(data, userValue) {
  const list = document.createElement('ul');
  list.classList.add('users-list');
  for (let i = 0; i < data.length; i++) {
    const listItem = document.createElement('li');
    listItem.classList.add('user');
    const circle = document.createElement('div');
    const title = document.createElement('p');
    circle.classList.add('circle');
    title.classList.add('list-title');
    if (data[i] === userValue) {
      title.textContent = 'You';
      title.style.color = 'red';
    } else {
      title.textContent = data[i];
    }
    listItem.appendChild(circle);
    listItem.appendChild(title);
    list.appendChild(listItem);
  }
  mainContainer.appendChild(list);

  const chatWindow = document.createElement('div');
  chatWindow.classList.add('chat-window');
  const chatArea = document.createElement('div');
  chatArea.classList.add('chat-area');
  const user_chatInputContainer = document.createElement('div');
  user_chatInputContainer.classList.add('user-chat-input-container');
  const user_chatInput = document.createElement('input');
  user_chatInput.classList.add('user-chat-input');
  user_chatInput.type = 'text';
  user_chatInput.placeholder = 'Type your message here';
  user_chatInput.name = 'chat-input';

  const sendMessage_button = document.createElement('button');
  sendMessage_button.classList.add('send-message-button');
  sendMessage_button.textContent = 'send';
  sendMessage_button.addEventListener('click', sendButton_handler);

  user_chatInputContainer.appendChild(user_chatInput);
  user_chatInputContainer.appendChild(sendMessage_button);

  chatWindow.appendChild(chatArea);
  chatWindow.appendChild(user_chatInputContainer);

  mainContainer.appendChild(chatWindow);
}

const userLogin_handler = () => {
  (async () => {
    const userValue = userInput.value;
    user = userValue;
    const response = await fetch('https://socket-backend-hw.herokuapp.com/users', {
      body: userValue,
      method: 'POST',
    });
    if (response.status === 404) {
      alert('Выберите другое имя!');
    } else {
      loginForm.classList.add('invisible');
      const data = await response.json();
      domBuild(data, userValue);
    }
  })();
};

loginButton.addEventListener('click', userLogin_handler);
