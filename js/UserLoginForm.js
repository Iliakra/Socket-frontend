export default class UserLoginForm {
  constructor() {
    this.container = null;
    this.element = null;
    this.inputEl = null;
    this.submitListener = null;
    this.validateListener = null;
  }

  init() {
    this.element = document.createElement('form');
    this.element.classList.add('login-form');
    this.element.id = 'login-form';
    this.element.innerHTML = `
        <div id="login-form-container">
            <p>Выберите псевдоним</p>
            <input type="text" class="login-input" name="login-input">
            <!--<span class="form_hint" aria-live="Пожалуйста, заполните правильно поле"></span>
            <span class="error" aria-live="Никнейм занят!"></span>-->
            <button type="submit" form="login-form" class="login-button">Продолжить</button>
        </div>
        `;
    this.container.appendChild(this.element);

    this.inputEl = this.element.querySelector('input');
    this.inputEl.addEventListener('input', this.validateInput.bind(this));

    /* this.closeButtons = this.element.querySelectorAll('.close');
        this.closeButtons.forEach((o) => o.addEventListener('click', this.onClose.bind(this)));
        */

    this.element.addEventListener('submit', this.onSubmit.bind(this));
  }

  async validateInput() {
    if (!(await this.validateListener(this.inputEl.value))) {
      this.inputEl.setCustomValidity('Никнейм занят');
      return false;
    }
    this.inputEl.setCustomValidity('');
    return true;
  }

  show(onSubmit, onValidate) {
    this.submitListener = onSubmit;
    this.validateListener = onValidate;
    // this.element.classList.add('show');
  }

  hide() {
    this.submitListener = null;
    // this.closeListener = null;
    this.element.classList.add('invisible');
  }

  async onSubmit(event) {
    event.preventDefault();
    const data = {
      name: this.inputEl.value,
    };
    const validated = await this.validateInput();
    if (validated && this.submitListener) {
      this.submitListener.call(null, data);
    }
  }

  bindToDOM(container) {
    this.container = container;
  }
}
