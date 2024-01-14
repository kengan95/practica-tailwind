document.getElementById('registrationForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar el envío predeterminado
    submitForm();
});

async function submitForm() {
    const form = document.getElementById('registrationForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('http://localhost:2000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        if (response.ok) {
            const result = await response.text();
            alert(result); // Muestra el mensaje de éxito
            form.reset(); // Limpia el formulario si es necesario
        } else {
            const error = await response.text();
            alert(error); // Muestra el mensaje de error
        }
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
    }
}