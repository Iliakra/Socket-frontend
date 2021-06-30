import UserLoginForm from './UserLoginForm.js';
import ChatWidget from './ChatWidget.js';

const form = new UserLoginForm();
form.bindToDOM(document.body);
form.init();

const chat = new ChatWidget('socket-backend-hw.herokuapp.com/', form);
chat.bindToDOM(document.querySelector('#main-container'));
chat.init();
