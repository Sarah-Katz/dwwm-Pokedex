const url = "https://pokeapi.co/api/v2/";
const next = document.getElementById('btn-next');
const previous = document.getElementById('btn-previous');
next.addEventListener('click', nextPage);
previous.addEventListener('click', previousPage);

let page = 1;

function loadPage() {
    if (page == 1) {
        previous.style.display = 'none';
        // Charger les données page 1
    } else if (page == 51) {
        // Charger les données page 51
        next.style.display = 'none';
    } else {
        // Charger les données page n
        previous.style.display = 'block';
        next.style.display = 'block';
    }
}

function nextPage() {
    page ++;
    loadPage();
}

function previousPage() {
    page --;
    loadPage();
}

loadPage();