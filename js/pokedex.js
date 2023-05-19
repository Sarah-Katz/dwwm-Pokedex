// URL de l'api
const url = "https://pokeapi.co/api/v2/";
// Boutons suivant et précédent
const next = document.getElementById("btn-next");
const previous = document.getElementById("btn-previous");
next.addEventListener("click", nextPage);
previous.addEventListener("click", previousPage);
// Table
const table = document.getElementById("table-content");

let page = 1;

function loadPage() {
  if (page == 1) {
    previous.style.display = "none";
  } else if (page == 53) {
    next.style.display = "none";
  } else {
    previous.style.display = "block";
    next.style.display = "block";
  }
  clearList();
  getPokemon();
}

function nextPage() {
  page++;
  loadPage();
}

function previousPage() {
  page--;
  loadPage();
}

function clearList() {
  let rows = document.getElementsByClassName("row");
  let rowsArray = Array.from(rows);

  if (rowsArray.length > 0) {
    for (let i = 0; i < rowsArray.length; i++) {
      rowsArray[i].remove();
    }
  }
}

async function getPokemon() {
  let offset;
  if (page == 1) {
    offset = 0;
  } else {
    offset = (page - 1) * 19;
  }
  let limit = 20;

  const response = await fetch(url + `pokemon/?offset=${offset}&limit=${limit}`, { method: "GET" });
  const json = await response.json();
  const fetchPromises = json.results.map((result) => fetch(result.url, { method: "GET" }).then((response) => response.json()));
  const pokemonData = await Promise.all(fetchPromises);
  const pokemons = pokemonData.map((data, i) => ({
    name: json.results[i].name,
    id: data.id,
    types: data.types,
  }));

  populateList(pokemons);
}

function populateList(pokemons) {
  pokemons.forEach((pokemon) => {
    let tr = document.createElement("tr");
    tr.className = "row";
    tr.addEventListener("click", getDetail);
    table.append(tr);

    let numberCell = document.createElement("td");
    numberCell.className = "pokemonId";
    numberCell.innerText = "#" + pokemon.id;
    tr.append(numberCell);

    let nameCell = document.createElement("td");
    nameCell.className = "pokemonName";
    nameCell.innerText = pokemon.name;
    tr.append(nameCell);

    let typesCell = document.createElement("td");
    typesCell.className = "pokemonTypes";
    let typesString;
    if (pokemon.types.length > 1) {
      typesString = pokemon.types[0].type.name + " " + pokemon.types[1].type.name;
    } else {
      typesString = pokemon.types[0].type.name;
    }
    typesCell.innerText = typesString;
    tr.append(typesCell);
  });
}

loadPage();
