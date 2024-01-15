const $formRegister = document.getElementById('form-register');

$formRegister.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData($formRegister);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch('/register', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();
    if (!response.ok) {
      alert(responseData.error);
    } else {
      alert(responseData.message);
    }


    $formRegister.reset();
  } catch (error) {
    // Manejar errores de red u otros errores
    console.error('Error en la solicitud:', error);
  }
});
