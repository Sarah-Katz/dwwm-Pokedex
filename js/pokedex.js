document.addEventListener("DOMContentLoaded", () => {
  // URL de l'api
  const url = "https://pokeapi.co/api/v2/";
  // Boutons suivant et précédent
  const next = document.getElementById("btn-next");
  const previous = document.getElementById("btn-previous");
  next.addEventListener("click", nextPage);
  previous.addEventListener("click", previousPage);
  // Table
  const table = document.getElementById("table-content");
  // Liste des stats dans la modal de détail
  const ul = document.getElementById("modal-stats");

  let page = 1;

  function loadPage() {
    previous.style.display = page === 1 ? "none" : "block";
    next.style.display = page === 53 ? "none" : "block";
    table.innerHTML = "";
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
      const tr = document.createElement("tr");
      tr.className = "row";
      tr.innerHTML = `
        <td class="pokemonId">#${pokemon.id}</td>
        <td class="pokemonName">${pokemon.name}</td>
        <td class="pokemonTypes">${getTypesString(pokemon)}</td>
      `;
      for (let i = 0; i < tr.children.length; i++) {
        const td = tr.children[i];
        td.addEventListener("click", () => getDetail(pokemon.id));
      }
      table.appendChild(tr);
    });
  }

  function getTypesString(pokemon) {
    if (pokemon.types.length > 1) {
      return `${pokemon.types[0].type.name} / ${pokemon.types[1].type.name}`;
    }
    return pokemon.types[0].type.name;
  }

  // function populateList(pokemons) {
  //   pokemons.forEach((pokemon) => {
  //     let tr = document.createElement("tr");
  //     tr.className = "row";
  //     tr.addEventListener("click", getDetail);
  //     table.append(tr);

  //     let numberCell = document.createElement("td");
  //     numberCell.className = "pokemonId";
  //     numberCell.innerText = "#" + pokemon.id;
  //     tr.append(numberCell);

  //     let nameCell = document.createElement("td");
  //     nameCell.className = "pokemonName";
  //     nameCell.innerText = pokemon.name;
  //     tr.append(nameCell);

  //     let typesCell = document.createElement("td");
  //     typesCell.className = "pokemonTypes";
  //     let typesString;
  //     if (pokemon.types.length > 1) {
  //       typesString = pokemon.types[0].type.name + " / " + pokemon.types[1].type.name;
  //     } else {
  //       typesString = pokemon.types[0].type.name;
  //     }
  //     typesCell.innerText = typesString;
  //     tr.append(typesCell);
  //   });
  // }

  async function getDetail(id) {
    const response = await fetch(url + `pokemon/${id}`, { method: "GET" });
    const json = await response.json();
    let pokemonData = {
      img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${json.id}.png`,
      name: json.name,
      id: json.id,
      types: json.types,
      stats: json.stats,
    };
    showModal(pokemonData);
  }

  function showModal(pokemonData) {
    const modal = document.getElementById("modal-js-example");
    modal.classList.add("is-active");
    document.getElementById("modal-img").src = pokemonData.img;
    document.getElementById("modal-name").innerText = pokemonData.name;
    document.getElementById("modal-types").innerText = getTypesString(pokemonData);
    document.getElementById("modal-number").innerText = `#${pokemonData.id}`;

    ul.innerHTML = "";
    pokemonData.stats.forEach((stat) => {
      const li = document.createElement("li");
      li.className = "list-item";
      li.innerText = `${stat.stat.name} : ${stat.base_stat}`;
      ul.appendChild(li);
    });
  }

  loadPage();
});
