let labels = [];

let data = {
  labels: labels,
  datasets: [
    {
      label: "Terremotos",
      data: [],
      backgroundColor: ["red", "orange", "yellow", "green", "blue", "black"],
    },
  ],
};

const config = {
  type: "polarArea",
  data: data,
  options: {
    responsive: true,
    scales: {
      r: {
        ticks: {
          display: true,
          stepSize: 5,
          showLabelBackdrop: true,
          backdropColor: "white",
          z: 5,
        },
        pointLabels: {
          display: true,
          centerPointLabels: true,
          font: {
            size: 18,
          },
        },
      },
    },
  },
};

const grafica = new Chart(document.getElementById("miGrafica"), config);

async function getDatosGraficaPorDia() {
  const magnitudes = new Map();
  const datosTerremotosDia = await getData();

  datosTerremotosDia.features.forEach((terremoto) => {
    let magnitud = Math.floor(terremoto.properties.mag);

    if (magnitud >= 1) {
      if (magnitudes.has(magnitud)) {
        magnitudes.set(magnitud, magnitudes.get(magnitud) + 1);
      } else {
        magnitudes.set(magnitud, 1);
      }
    }
  });

  let arrayMagnitudKey = [...magnitudes.keys()];
  let arrayMagnitudCantidad = [...magnitudes.values()];

  for (let i = 0; i < arrayMagnitudKey.length; i++) {
    labels[i] =
      `Escala de: ${arrayMagnitudKey[i]}, total: ${arrayMagnitudCantidad[i]}`;
  }

  return { labels, arrayMagnitudCantidad };
}

async function getDatosTerremotoFechas(date1, date2, magnitud, comp) {
  const magnitudes = new Map();

  const datosTerremotosFechas = await getDataFiltrados(
    date1,
    date2,
    magnitud,
    comp,
  );

  datosTerremotosFechas.features.forEach((terremoto) => {
    let magnitud = Math.floor(terremoto.properties.mag);

    if (magnitud >= 1) {
      if (magnitudes.has(magnitud)) {
        magnitudes.set(magnitud, magnitudes.get(magnitud) + 1);
      } else {
        magnitudes.set(magnitud, 1);
      }
    }
  });

  let arrayMagnitudKey = [...magnitudes.keys()];
  let arrayMagnitudCantidad = [...magnitudes.values()];

  for (let i = 0; i < arrayMagnitudKey.length; i++) {
    labels[i] =
      `Escala de: ${arrayMagnitudKey[i]}, total: ${arrayMagnitudCantidad[i]}`;
  }
  console.log(`funciona? ${magnitudes}`);

  return { labels, arrayMagnitudCantidad };
}
