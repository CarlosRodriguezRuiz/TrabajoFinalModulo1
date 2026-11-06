const map = L.map("map").setView([40.67816, -3.9707], 6);

const grupoTerremotos = L.layerGroup();

// Capa satélite de Esri
const Esri_WorldImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 19,
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
);
Esri_WorldImagery.addTo(map);

//Popup que aparece las coords al clikar en el mapa
var popup = L.popup();
function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}

map.on("click", onMapClick);

//Obtener todos los terremotos de las ultimas 24 horas
async function getData() {
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
    );

    const data = await res.json();

    return data;
  } catch (error) {
    console.log(error);
  }
}

//Parte 1 del ejercicio, pintar terremotos
function painData(data) {
  data.features.forEach((pin) => {
    const coords = [pin.geometry.coordinates[1], pin.geometry.coordinates[0]];

    const lugar = pin.properties.title;
    const magnitud = pin.properties.mag;

    let color = "white";

    if (magnitud >= 0 && magnitud < 1) {
      color = "white";
    } else if (magnitud >= 1 && magnitud < 2) {
      color = "green";
    } else if (magnitud >= 2 && magnitud < 3) {
      color = "#3f4d29";
    } else if (magnitud >= 3 && magnitud < 4) {
      color = "yellow";
    } else if (magnitud >= 4 && magnitud < 5) {
      color = "#62620f";
    } else if (magnitud >= 5 && magnitud < 6) {
      color = "orange";
    } else if (magnitud >= 6 && magnitud < 7) {
      color = "red";
    } else if (magnitud >= 7) {
      color = "purple";
    }

    // Popup con botón de favoritos
    const contenidoPopup = document.createElement("div");
    contenidoPopup.innerHTML = `
        <p>Lugar: ${lugar}</p>
        <p>Magnitud: ${magnitud}</p>
      `;
    const botonFavorito = document.createElement("button");
    botonFavorito.innerText = "⭐ Añadir a favoritos";
    botonFavorito.addEventListener("click", () => {
      addToFavorites({ id: pin.id, lugar: lugar, magnitud: magnitud });
    });
    contenidoPopup.appendChild(botonFavorito);

    L.circleMarker(coords, {
      color: color,
      fillColor: color,
      fillOpacity: 0.8,
      radius: 8,
    })
      .addTo(grupoTerremotos)
      .bindPopup(contenidoPopup);
  });
}

//Boton para la primera parte del ejercicio
const boton1 = document.querySelector("#boton1");

let mostrandoTerremotos = false;
let cargandoTerremotos = false;

boton1.addEventListener("click", () => {
  if (mostrandoTerremotos) {
    map.removeLayer(grupoTerremotos);
    mostrandoTerremotos = false;

    grafica.data.labels = [];
    grafica.data.datasets[0].data = [];
    grafica.update();
  } else {
    if (cargandoTerremotos) {
      return;
    }
    cargandoTerremotos = true;
    getData()
      .then((data) => {
        if (data) {
          grupoTerremotos.clearLayers();
          painData(data);
          grupoTerremotos.addTo(map);
          mostrandoTerremotos = true;

          getDatosGraficaPorDia().then((resultado) => {
            grafica.data.labels = resultado.labels;
            grafica.data.datasets[0].data = resultado.arrayMagnitudCantidad;
            grafica.update();
          });
        }
      })
      .finally(() => {
        cargandoTerremotos = false;
      });
  }
});
//Bton para la 2ª parte del ejercicio
const boton2 = document.querySelector("#boton2");
//Descubrir la parte del formulario una vez le des al boton2
boton2.addEventListener("click", () => {
  const continentes = document.querySelector("#contenedorContinentes");
  continentes.hidden = !continentes.hidden;
  getData()
    .then((data) => {
      if (data) {
        grupoTerremotos.clearLayers();
        painData(data);
        grupoTerremotos.addTo(map);
        mostrandoTerremotos = true;
      }
    })
    .finally(() => {
      cargandoTerremotos = false;
    });
});

//Botones para los continentes
const botonEU = document.querySelector("#euButton");
const botonAS = document.querySelector("#asButton");
const botonAM = document.querySelector("#amButton");
const botonOC = document.querySelector("#ocButton");
const botonAF = document.querySelector("#afButton");

//Cerrar los formularios y parrafos
function cerrarTodos() {
  const parrafos = document.querySelectorAll("nav div p");
  const formularios = document.querySelectorAll("nav div form");

  parrafos.forEach((parrafo) => {
    parrafo.remove();
  });

  formularios.forEach((form) => {
    form.remove();
  });
}

// Formulario de filtros
function buscadorFiltros() {
  const formBuscar = document.createElement("form");

  formBuscar.innerHTML = `
    <div class="grupoFiltro">
      <label for="dateFirst">Desde el día:</label>
      <input type="date" id="dateFirst" required />
    </div>

    <div class="grupoFiltro">
      <label for="dateLast">Hasta el día:</label>
      <input type="date" id="dateLast" required />
    </div>

    <div class="grupoFiltro">
      <label for="magnitud">Magnitud del terremoto:</label>

      <div class="contenedorMagnitud">
        <input
          type="range"
          id="magnitud"
          min="0"
          max="8"
          step="1"
          value="0"
        />
        <span id="valorMagnitud">0</span>
      </div>
    </div>

    <div class="grupoFiltro">
      <label>Tipo de búsqueda:</label>

      <div class="opcionesRadio">
        <label>
          <input type="radio" name="comparacion" value="mayor" checked />
          Mayor o igual
        </label>

        <label>
          <input type="radio" name="comparacion" value="menor" />
          Menor o igual
        </label>
      </div>
    </div>

    <button type="submit" class="btnBuscar">
      Buscar terremotos
    </button>
  `;

  // Actualizar el número del range
  const magnitud = formBuscar.querySelector("#magnitud");
  const valorMagnitud = formBuscar.querySelector("#valorMagnitud");

  magnitud.addEventListener("input", () => {
    valorMagnitud.textContent = magnitud.value;
  });

  // Obtener los datos al pulsar Buscar
  formBuscar.addEventListener("submit", (event) => {
    event.preventDefault();

    const dateFirst = formBuscar.querySelector("#dateFirst").value;
    const dateLast = formBuscar.querySelector("#dateLast").value;
    const magnitud = formBuscar.querySelector("#magnitud").value;
    const comparacion = formBuscar.querySelector(
      'input[name="comparacion"]:checked',
    ).value;

    console.log("Fecha inicial:", dateFirst);
    console.log("Fecha final:", dateLast);
    console.log("Magnitud:", magnitud);
    console.log("Comparación:", comparacion);
    if (dateFirst > dateLast) {
      alert("La fecha de inicio no puede ser posterior");
      return;
    }
    getDataFiltrados(dateFirst, dateLast, magnitud, comparacion);
    // getDataFiltrados(dateFirst, dateLast, magnitud, comparacion).then(
    //   (data) => {
    //     console.log("aaa", data);
    //   },
    // );

    getDatosTerremotoFechas(dateFirst, dateLast, magnitud, comparacion).then(
      (resultado) => {
        grafica.data.labels = resultado.labels;
        grafica.data.datasets[0].data = resultado.arrayMagnitudCantidad;
        grafica.update();
      },
    );
  });

  return formBuscar;
}

async function getDataFiltrados(date1, date2, magnitud, comp) {
  if (comp == "mayor") {
    comp = "minmagnitude";
  } else {
    comp = "maxmagnitude";
  }

  try {
    //Spinner//Cargando
    let cargando = document.querySelector("#cargando");
    cargando.src = "./assets/giphy.gif";
    const res = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${date1}&endtime=${date2}&${comp}=${magnitud}`,
    );
    if (!res.ok) {
      console.log(await res.text());
      cargando.src = "./assets/error.gif";
      return;
    }
    const data = await res.json();
    if (data.features.length == 0) {
      alert("No se han encontrado resultados");
    } else {
      cargando.src = "";
      grupoTerremotos.clearLayers();
      painData(data);
      grupoTerremotos.addTo(map);
    }
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
}

//Europa
botonEU.addEventListener("click", (event) => {
  const div = document.querySelector("#euDiv");

  if (div.querySelector("p")) {
    cerrarTodos();
  } else {
    cerrarTodos();

    map.flyTo([54.367759, 15.46875], 4.0, {
      animate: true,
      duration: 2,
    });

    const info = document.createElement("p");

    info.innerText = `🌍 Europa — 1.200 terremotos aprox.
La actividad sísmica se concentra principalmente en el Mediterráneo, especialmente en Italia, Grecia y Turquía.`;

    div.appendChild(info);
    div.appendChild(buscadorFiltros());
  }
});

//Asia
botonAS.addEventListener("click", (event) => {
  const div = document.querySelector("#asDiv");

  if (div.querySelector("p")) {
    cerrarTodos();
  } else {
    cerrarTodos();

    map.flyTo([54.059388, 102.65625], 3.6, {
      animate: true,
      duration: 2,
    });

    const info = document.createElement("p");

    info.innerText = `🌏 Asia — 7.600 terremotos aprox.
Es el continente con mayor actividad sísmica, especialmente en Japón, Indonesia y Nepal, debido al movimiento de las placas tectónicas.`;

    div.appendChild(info);
    div.appendChild(buscadorFiltros());
  }
});

//America
botonAM.addEventListener("click", (event) => {
  const div = document.querySelector("#amDiv");

  if (div.querySelector("p")) {
    cerrarTodos();
  } else {
    cerrarTodos();

    map.flyTo([18.312811, -93.867188], 3.0, {
      animate: true,
      duration: 2,
    });

    const info = document.createElement("p");

    info.innerText = `🌎 América — 5.000 terremotos aprox.
Presenta una elevada actividad sísmica, principalmente en la costa del Pacífico, desde Alaska hasta Chile, debido al Cinturón de Fuego.`;

    div.appendChild(info);
    div.appendChild(buscadorFiltros());
  }
});

//Oceania
botonOC.addEventListener("click", (event) => {
  const div = document.querySelector("#ocDiv");

  if (div.querySelector("p")) {
    cerrarTodos();
  } else {
    cerrarTodos();

    map.flyTo([-24.521297, 133.359264], 4.4, {
      animate: true,
      duration: 2,
    });

    const info = document.createElement("p");

    info.innerText = `🌏 Oceanía — 1.800 terremotos aprox.
Presenta una importante actividad sísmica, especialmente en Nueva Zelanda y Papúa Nueva Guinea, por su proximidad al Cinturón de Fuego.`;

    div.appendChild(info);
    div.appendChild(buscadorFiltros());
  }
});

//Africa
botonAF.addEventListener("click", (event) => {
  const div = document.querySelector("#afDiv");

  if (div.querySelector("p")) {
    cerrarTodos();
  } else {
    cerrarTodos();

    map.flyTo([4.039618, 16.083984], 4.0, {
      animate: true,
      duration: 2,
    });

    const info = document.createElement("p");

    info.innerText = `🌍 África — 400 terremotos aprox.
Registra una actividad sísmica relativamente baja, concentrada principalmente en el Valle del Rift y el norte del continente.`;

    div.appendChild(info);
    div.appendChild(buscadorFiltros());
  }
});
