
import express, { static as static_ } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const app = express();
const port = 2000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(__dirname, 'database.json');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware para verificar la existencia de un usuario por ID
function userExists(req, res, next) {
  const userId = req.params.id;
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).send('Usuario no encontrado.');
  }

  req.user = user;
  next();
}

// Inicializar la base de datos en memoria desde el archivo JSON
let users = [];

async function initializeDatabase() {
  try {
    // Intentar leer el archivo de la base de datos
    const data = await fs.readFile(databasePath, 'utf-8');
    users = JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, crearlo con un array vacío
    console.error('Error al leer la base de datos:', error);
    console.log('Creando una nueva base de datos...');
    await saveDatabase(); // Crear archivo con array vacío
  }
}

async function saveDatabase() {
  try {
    // Guardar el array de usuarios en el archivo JSON
    await fs.writeFile(databasePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error al guardar la base de datos:', error);
  }
}

initializeDatabase();

// Ruta principal
app.use('/', static_('public'))

// Registro de un nuevo usuario
app.post('/register', async (req, res) => {
  const { nombre, usuario, email, password } = req.body;

  try {
    // Validaciones más robustas
    if (!nombre || !usuario || !email || !password) {
      return res.status(400).json({ error: 'Por favor, complete todos los campos.' });
    }

    // Verificar si el usuario o el correo electrónico ya están registrados
    const existingUser = users.find((user) => user.usuario === usuario || user.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Usuario o correo electrónico ya registrados.' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario con un ID único
    const newUser = {
      id: uuidv4(),
      nombre,
      usuario,
      email,
      password: hashedPassword,
    };

    // Agregar el nuevo usuario al array de usuarios
    users.push(newUser);

    // Guardar los cambios en la base de datos
    await saveDatabase();

    res.json({ message: 'Registro exitoso. Puedes iniciar sesión ahora.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Inicio de sesión
app.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const user = users.find((u) => u.usuario === usuario);

    // Validación más segura y manejo de errores mejorado
    if (user && (await bcrypt.compare(password, user.password))) {
      res.send('Inicio de sesión exitoso.');
    } else {
      res.status(401).send('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor.');
  }
});

// Actualizar un usuario
app.put('/user/:id', userExists, async (req, res) => {
  const userId = req.params.id;
  const { nombre, usuario, email, password } = req.body;

  try {
    // Validaciones y verificaciones más robustas
    if (!nombre || !usuario || !email || !password) {
      return res.status(400).send('Por favor, complete todos los campos.');
    }

    const existingUser = users.find((user) => user.usuario === usuario && user.id !== userId);
    if (existingUser) {
      return res.status(409).send('Nombre de usuario ya está en uso por otro usuario.');
    }

    // Actualizar los datos del usuario
    const updatedUser = { id: userId, nombre, usuario, email, password };
    const index = users.findIndex((user) => user.id === userId);
    users[index] = updatedUser;

    // Guardar los cambios en la base de datos
    await saveDatabase();

    res.send('Usuario actualizado exitosamente.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor.');
  }
});

// Eliminar un usuario
app.delete('/user/:id', userExists, async (req, res) => {
  const userId = req.params.id;

  try {
    const index = users.findIndex((user) => user.id === userId);

    if (index !== -1) {
      // Eliminar el usuario del array
      users.splice(index, 1);

      // Guardar los cambios en la base de datos
      await saveDatabase();

      res.send('Usuario eliminado exitosamente.');
    } else {
      res.status(404).send('Usuario no encontrado.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor.');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});







