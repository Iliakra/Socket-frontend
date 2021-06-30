/* eslint-disable no-console */
import formatDate from './formatDate.js';

export default class ChatWidget {
  constructor(url, nickForm) {
    this.url = url;
    this.nickForm = nickForm;
    this.userID = null;
    this.userName = null;
    this.container = null;
    this.element = null;
    this.userEls = [];
    this.usersContainer = null;
    this.messageEls = [];
    this.messagesContainer = null;
  }

  init() {
    this.element = document.createElement('div');
    this.element.classList.add('chat_widget');
    this.element.id = 'chat_widget';
    this.container.appendChild(this.element);

    this.usersContainer = document.createElement('div');
    this.usersContainer.classList.add('users-list');
    this.element.appendChild(this.usersContainer);

    this.chatArea = document.createElement('div');
    this.chatArea.classList.add('chat-window');
    this.element.appendChild(this.chatArea);

    this.messagesContainer = document.createElement('div');
    this.messagesContainer.classList.add('messages-container');
    this.chatArea.appendChild(this.messagesContainer);

    this.inputMsgEl = document.createElement('input');
    this.inputMsgEl.type = 'text';
    this.inputMsgEl.classList.add('user-chat-input');
    this.inputMsgEl.placeholder = 'Type your message here';
    this.inputMsgEl.required = true;
    this.chatArea.appendChild(this.inputMsgEl);

    // Add event listeners
    this.inputMsgEl.addEventListener('keyup', this.onMessageInput.bind(this));

    this.nickForm.show(
      (data) => {
        this.userName = data.name;
        this.nickForm.hide();
        this.connect();
      },
      async (nickname) => {
        const names = await (await fetch(`https://${this.url}users`, { method: 'GET' })).json();
        return !names.includes(nickname);
      },
    );
  }

  connect() {
    this.ws = new WebSocket(`ws://${this.url}ws`);
    this.ws.addEventListener('open', this.onConnectionOpened.bind(this));
    this.ws.addEventListener('message', this.onMessageRecieved.bind(this));
    this.ws.addEventListener('close', this.onConnectionClose.bind(this));
  }

  reconnect() {
    if (this.ws.readyState !== WebSocket.OPEN) {
      // console.log('reconnect');
      this.connect();
      setTimeout(this.reconnect.bind(this), 1000);
    }
  }

  createUserEl(userName) {
    const me = userName === this.userName;
    const name = me ? `You (${this.userName})` : userName;
    const userEl = document.createElement('div');
    userEl.classList.add('user');
    userEl.setAttribute('data-name', userName);
    userEl.innerHTML = `
          <div class="circle"></div>
          <div class="list-title${me ? ' you' : ''}">${name}</div>
        `;
    if (me) {
      this.userEls.unshift(userEl);
    } else {
      this.userEls.push(userEl);
    }
    return userEl;
  }

  createMessageEl(msg) {
    const fromMe = msg.userName === this.userName;
    const messageEl = document.createElement('div');
    messageEl.classList.add(`${fromMe ? 'my-message-container' : 'message-container'}`);
    messageEl.setAttribute('data-name', msg.userName);
    messageEl.setAttribute('data-id', msg.id);
    const name = fromMe ? `You (${this.userName})` : msg.userName;
    messageEl.innerHTML = `
          <div class="message-title${fromMe ? ' you' : ''}">${name},&nbsp;&nbsp;${formatDate(msg.date)}</div>
          <div class="message-content">${msg.content}</div>
        `;
    this.messageEls.push(messageEl);
    return messageEl;
  }

  bindToDOM(container) {
    this.container = container;
  }

  updateUsers(users) {
    this.userEls.forEach((e) => e.remove());
    this.userEls.length = 0;
    users.forEach((user) => this.createUserEl(user));
    this.userEls.forEach((el) => this.usersContainer.appendChild(el));
    // this.setStaus();
  }

  updateMessages(messages) {
    const msgs = messages;
    if (this.messageEls.length) {
      const lastID = this.messageEls[this.messageEls.length - 1].getAttribute('data-id');
      const index = msgs.findIndex((m) => m.id === lastID);
      if (index !== -1) msgs.splice(0, index + 1);
    }
    msgs.forEach((m) => {
      this.messagesContainer.appendChild(this.createMessageEl(m));
    });
    this.messagesContainer.scrollTo(0, this.messagesContainer.scrollHeight);
    // this.setStaus();
  }

  onMessageInput(evt) {
    if (evt.key !== 'Enter') return;
    if (this.inputMsgEl.value === '') return;
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        userID: this.userID,
        content: this.inputMsgEl.value,
        type: 'message',
      }));
      this.inputMsgEl.value = '';
      return;
    }
    this.reconnect();
  }

  onConnectionOpened() {
    // console.log('connected');
    this.ws.send(JSON.stringify({ type: 'register', userName: this.userName }));
  }

  async onMessageRecieved(msg) {
    const data = JSON.parse(msg.data);
    if (!data) return;
    if (data.type === 'register') {
      this.userID = data.userID;
      this.updateUsers(
        await (await fetch(`https://${this.url}users`, { method: 'GET' })).json(),
      );
      this.ws.send(JSON.stringify({ type: 'getPrevious', count: 20 }));
    }
    if (data.type === 'message') {
      this.updateMessages([data.message]);
      // this.messagesContainer.appendChild(
      //   this.createMessageEl(data.message, data.message.userName === this.userName),
      // );
      return;
    }
    if (data.type === 'users') {
      this.updateUsers(data.users);
    }
    if (data.type === 'previous') {
      this.updateMessages(data.messages);
    }
  }

  onConnectionClose(evt) {
    if (evt.wasClean) {
      console.log('Соединение закрыто');
    } else {
      this.element.remove();
      this.init();
    }
  }
}
