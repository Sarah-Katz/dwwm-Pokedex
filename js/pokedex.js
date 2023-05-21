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
  // Barre de recherche
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("keypress", handleKeyPress);
  // Bouton de la barre de recherche
  const searchButton = document.getElementById("search-button");
  searchButton.addEventListener("click", handleSearch);
  // Filtre par type
  const typeFilter = document.getElementById("type-filter");
  typeFilter.addEventListener("change", handleTypeFilter);

  // Initialise le numéro de page à 1
  let page = 1;

  // Recharge la page
  function loadPage() {
    searchInput.value = "";
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

  // Fetech les 20 pokemons à afficher selon la page
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

  // Remplis le tableau avec les pokemon récupérés par le fetch
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

  // Fonction d'écriture des double types
  function getTypesString(pokemon) {
    if (pokemon.types.length > 1) {
      return `${pokemon.types[0].type.name} / ${pokemon.types[1].type.name}`;
    }
    return pokemon.types[0].type.name;
  }

  // Fetch du détail d'un pokemon
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

  // Remplis les infos de la modal de détail avant de l'afficher
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

  // Normalise la recherche de l'utilisateur (reset si vide)
  function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm === "") {
      loadPage();
    } else {
      searchPokemon(searchTerm);
    }
  }

  // Gère la touche entrée pour la recherche
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  // Fonction de recherche des pokemon
  async function searchPokemon(searchTerm) {
    try {
      const response = await fetch(`${url}pokemon/?limit=1008`);
      const data = await response.json();
      const pokemons = data.results;
      // Filtre si la recherche est un nom partiel
      const filteredPokemons = pokemons.filter((pokemon) => pokemon.name.startsWith(searchTerm));
      if (filteredPokemons.length === 0) {
        throw new Error("No Pokémon found.");
      }
      // Créer un objet de données pour chaque pokemons filtré
      const fetchPromises = filteredPokemons.map((result) => fetch(result.url).then((response) => response.json()));
      const pokemonData = await Promise.all(fetchPromises);
      const filteredResults = pokemonData.map((data, i) => ({
        name: filteredPokemons[i].name,
        id: data.id,
        types: data.types,
      }));
      table.innerHTML = "";
      populateList(filteredResults);
      createResetButton();
    } catch (error) {
      console.error("Error searching for Pokémon:", error);
      table.innerHTML = "";
      const errorRow = document.createElement("tr");
      errorRow.innerHTML = `<td colspan="3" class="has-text-centered">No Pokémon found.</td>`;
      table.appendChild(errorRow);
    }
  }

  // Créer un bouton reset en bas de page
  function createResetButton() {
    if (document.getElementById("reset-button")) {
      return;
    }
    const resetButton = document.createElement("button");
    resetButton.id = "reset-button";
    resetButton.innerText = "Reset";
    resetButton.classList.add("button", "is-danger", "is-small");
    resetButton.addEventListener("click", resetPage);
    table.insertAdjacentElement("afterend", resetButton);
  }

  // Reset de la page
  function resetPage() {
    loadPage();
    this.remove();
  }

  // Gère le bouton de filtrage
  function handleTypeFilter() {
    const selectedType = typeFilter.value;
    if (selectedType === "") {
      // If "All" is selected, load all Pokémon
      loadPage();
    } else {
      // Fetch Pokémon of the selected type
      searchByType(selectedType);
    }
  }

  // Affiche les pokemons par type
  async function searchByType(type) {
    try {
      const response = await fetch(`${url}type/${type}`);
      const data = await response.json();
      const pokemonUrls = data.pokemon.map((entry) => entry.pokemon.url);
      const fetchPromises = pokemonUrls.map((url) => fetch(url).then((response) => response.json()));
      const pokemonData = await Promise.all(fetchPromises);
      const filteredResults = pokemonData.map((data) => ({
        name: data.name,
        id: data.id,
        types: data.types,
      }));
      table.innerHTML = "";
      populateList(filteredResults);
      createResetButton();
    } catch (error) {
      console.error("Error searching Pokémon by type:", error);
      table.innerHTML = "";
      const errorRow = document.createElement("tr");
      errorRow.innerHTML = `<td colspan="3" class="has-text-centered">Something went wrong while filtering by type : ${type}.</td>`;
      table.appendChild(errorRow);
    }
  }

  // Initialise l'affichage de la liste au chargement de la page
  loadPage();
});
