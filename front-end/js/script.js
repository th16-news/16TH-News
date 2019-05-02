// navbar
// show search-bar

function showSearchBar() {
    var searchbar = document.getElementById("search-bar");
    var toggle = document.getElementsByClassName("search-toggle")[0];

    if (searchbar.style.visibility === "hidden" || searchbar.style.visibility == "") {
        searchbar.style.visibility = "visible";
        toggle.innerHTML = '<i class="fas fa-times"></i>';
    } else {
        searchbar.style.visibility = "hidden";
        toggle.innerHTML = '<i class="fas fa-search"></i>';
    }
}
