const SECRET_CODE = '133767';
const typed = [];

window.addEventListener('keydown', (event) => {
  if (!/^[0-9]$/.test(event.key)) {
    return;
  }

  typed.push(event.key);

  if (typed.length > SECRET_CODE.length) {
    typed.shift();
  }

  if (typed.join('') === SECRET_CODE) {
    window.location.href = 'secret.html';
  }
});
