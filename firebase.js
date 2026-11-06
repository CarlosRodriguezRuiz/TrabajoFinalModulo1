const firebaseConfig = {
  apiKey: "AIzaSyAMoWYwg46SCPQ47miZCWAlwNIZpPlxevg",
  authDomain: "fir-firebase-thebridge.firebaseapp.com",
  projectId: "fir-firebase-thebridge",
  storageBucket: "fir-firebase-thebridge.firebasestorage.app",
  messagingSenderId: "571845496919",
  appId: "1:571845496919:web:ea666a95dc662d6ccd1312",
};

firebase.initializeApp(firebaseConfig); // Inicializar app Firebase

const db = firebase.firestore(); // Inicializar Firestore

/**************Firebase Auth*****************/
const formLogin = document.querySelector("#formLogin");

// Registrarse con el correo y contraseña del formulario
document.querySelector("#registro").addEventListener("click", () => {
  const email = formLogin.elements.email.value;
  const password = formLogin.elements.password.value;

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      alert(`Se ha registrado ${user.email}`);

      // Guardar el usuario en Firestore con sus favoritos vacíos
      db.collection("users").doc(user.uid).set({
        email: user.email,
        favorites: [],
      });
    })
    .catch((error) => alert("Error: " + error.message));
});

// Iniciar sesión
formLogin.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = formLogin.elements.email.value;
  const password = formLogin.elements.password.value;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert(`Se ha logado ${userCredential.user.email}`);
    })
    .catch((error) => alert("Error: " + error.message));
});

// Cerrar sesión
document.querySelector("#salir").addEventListener("click", () => {
  firebase.auth().signOut();
});

// Controlar usuario logado: mostrar u ocultar cosas
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    document.querySelector("#message").innerText = `Está en el sistema: ${user.email}`;
    formLogin.hidden = true;
    document.querySelector("#salir").hidden = false;
    document.querySelector("#favoritos").hidden = false;
  } else {
    document.querySelector("#message").innerText = "No hay usuarios en el sistema";
    formLogin.hidden = false;
    document.querySelector("#salir").hidden = true;
    document.querySelector("#favoritos").hidden = true;
    document.querySelector("#listaFavoritos").innerHTML = "";
  }
});

/**************Favoritos*****************/
// Añadir favorito (se llama desde el popup del terremoto en script.js)
function addToFavorites(terremoto) {
  const user = firebase.auth().currentUser;

  if (!user) {
    alert("Debes estar logueado para añadir a favoritos.");
    return;
  }

  db.collection("users")
    .doc(user.uid)
    .set(
      {
        email: user.email,
        favorites: firebase.firestore.FieldValue.arrayUnion(terremoto),
      },
      { merge: true },
    )
    .then(() => {
      alert("Terremoto añadido a favoritos.");
      showFavorites();
    })
    .catch((error) => console.error("Error añadiendo a favoritos: ", error));
}

// Borrar favorito
function removeFromFavorites(id) {
  const user = firebase.auth().currentUser;
  const userRef = db.collection("users").doc(user.uid);

  userRef.get().then((doc) => {
    const favorites = doc.data().favorites || [];
    const updatedFavorites = favorites.filter((fav) => fav.id !== id);

    userRef.update({ favorites: updatedFavorites }).then(() => {
      showFavorites();
    });
  });
}

// Pintar favoritos
function showFavorites() {
  const user = firebase.auth().currentUser;
  const lista = document.querySelector("#listaFavoritos");

  db.collection("users")
    .doc(user.uid)
    .get()
    .then((doc) => {
      lista.innerHTML = "";
      const favorites = (doc.exists && doc.data().favorites) || [];

      if (favorites.length == 0) {
        lista.innerHTML = "<li>No tienes favoritos</li>";
      }

      favorites.forEach((fav) => {
        const li = document.createElement("li");
        li.innerText = `${fav.lugar} (Magnitud: ${fav.magnitud}) `;

        const botonQuitar = document.createElement("button");
        botonQuitar.innerText = "Quitar";
        botonQuitar.addEventListener("click", () => removeFromFavorites(fav.id));

        li.appendChild(botonQuitar);
        lista.appendChild(li);
      });
    })
    .catch((error) => console.error("Error obteniendo favoritos: ", error));
}

document.querySelector("#verFavoritos").addEventListener("click", showFavorites);
