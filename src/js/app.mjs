import UserLoginForm from './UserLoginForm.mjs';
import ChatWidget from './ChatWidget.mjs';

const form = new UserLoginForm();
form.bindToDOM(document.body);
form.init();

const chat = new ChatWidget('socket-backend-hw.herokuapp.com/', form);
chat.bindToDOM(document.querySelector('#main-container'));
chat.init();
