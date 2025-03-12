$(document).ready(function () {
    let rssUrl = "https://www.elmundotoday.com/feed";
    //let rssUrl = "https://www.sciencedaily.com/rss/all.xml";
    const itemsPerPage = 9; // Mostrar 9 noticias por página
    let newsItems = []; // Array para guardar las noticias
    let currentPage = 1; // Página inicial

    ////La cosecha del Oscar
    const btnBuscar = document.getElementById("btnBuscar");
    const buscaRss = document.getElementById("buscaRss");
    btnBuscar.addEventListener("click", () => {
        rssUrl = buscaRss.value;
        console.log(rssUrl);
        loadRSS();
    })

    //Selecctor de RSS
    const btnVerRss = document.getElementById("btnVerRss");

    function setRssUrl(url) {
        buscaRss.value = url;
        loadRSS();
    }

    //Enga a coger las url de los data-rss para mostrar las noticias:
    const cards = document.querySelectorAll("article.card");
    // console.log(cards);
    
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            const rssUrl = card.getAttribute("data-rss");
            console.log(`RSS seleccionado: ${rssUrl}`);
            mostrarNoticias(rssUrl);
        });
    });





    // const urlNews = document.querySelectorAll("article");
    // urlNews.forEach(news =>{
    //     news.addEventListener("click",(e)=>{
    //         console.log(e);
    //         console.log(e.ele);
            
    //         const link = e.target.getAttribute("data-rss").value;
    //         console.log(link);
            
    //         // mostrarNoticias(link);
    //         // alert(link)
    //     })
    // })
    
    
    // const newsNY = document.getElementById("newsNY")
    // newsNY.addEventListener("click", () => {
    //     mostrarNoticias('https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml');
    //     console.log(newsNY.getAttribute("data-rss"));
        
    // })



    function mostrarNoticias(url) {
        rssUrl = url;
        loadRSS();
    }






    function renderGallery(page) {
        $("#news-gallery").empty();

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = newsItems.slice(startIndex, endIndex);

        if (paginatedItems.length === 0) {
            $("#news-gallery").html("<p class='text-center'>No news found.</p>");
            return;
        }

        paginatedItems.forEach(item => {
            $("#news-gallery").append(item);
        });
    }

    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        $("#pagination").empty();

        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage ? "active" : "";
            const pageButton = `
                <li class="page-item ${isActive}">
                    <a href="#" class="page-link" data-page="${i}">${i}</a>
                </li>    
            `;
            $("#pagination").append(pageButton);
        }
    }

    function loadRSS() {
        $.ajax({
            url: rssUrl,
            method: 'GET',
            dataType: 'xml',
            success: function (xml) {
                const $xml = $(xml);
                const items = $xml.find("item");

                newsItems = items.map(function () {
                    const title = $(this).find("title").text();
                    const link = $(this).find("link").text();
                    const pubDate = new Date($(this).find("pubDate").text()).toLocaleString() || "Unknown Date";
                    const description = $(this).find("description").text().replace(/<[^>]+>/g, "").substring(0, 150) + "...";
                    const categories = $(this).find("category").map(function () {
                        return `<span class='badge bg-secondary me-1'>${$(this).text()}</span>`;
                    }).get().join(" ");

                    // Verificar la imagen en <media:content>
                    let imageUrl = "https://via.placeholder.com/150"; // Valor por defecto
                    const mediaContent = $(this).find("media\\:content, content");
                    if (mediaContent.length > 0 && mediaContent.attr("url")) {
                        imageUrl = mediaContent.attr("url");
                    }

                    return `
                        <div class="col-md-6 col-lg-4">
                            <div class="card h-100">
                                <img src="${imageUrl}" class="card-img-top" alt="${title}">
                                <div class="card-body">
                                    <h5 class="card-title">${title}</h5>
                                    <p class="card-text">${description}</p>
                                    <p><strong>Publicado:</strong> ${pubDate}</p>
                                    <div>${categories}</div>
                                </div>    
                                <div class="card-footer text-center">
                                    <a href="${link}" target="_blank" class="btn btn-primary">Read More</a>
                                    <button class="btn btn-warning favorite-btn" onclick="addToFavorites('${title}', '${description}', '${imageUrl}', '${link}')">⭐ Favorito</button>
                                    </div>    
                            </div>    
                        </div>    
                    `;
                }).get();

                renderPagination(newsItems.length);
                renderGallery(currentPage);
            },
            error: function () {
                alert("Failed to fetch RSS feed.");
            }
        });
    }

    // Manejar cambio de página
    $("#pagination").on("click", ".page-link", function (e) {
        e.preventDefault();
        currentPage = parseInt($(this).data("page"));
        renderGallery(currentPage);
        renderPagination(newsItems.length);
    });

    loadRSS();

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];





});
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function addToFavorites(title, description, imageUrl, link) {
    const newsItem = { title, description, imageUrl, link };

    // Evitar duplicados
    if (!favorites.some(fav => fav.title === title)) {
        favorites.push(newsItem);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    } else {
        alert("Esta noticia ya está en favoritos");
    }
}

function showFavorites() {
    const favoritesContainer = document.getElementById("favoritesContainer");
    favoritesContainer.innerHTML = ""; // Limpiar antes de mostrar

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = "<p>No hay favoritos aún.</p>";
        return;
    }

    favorites.forEach(news => {
        favoritesContainer.innerHTML += `
            <div class="card mb-3">
                <img src="${news.imageUrl}" class="card-img-top" alt="${news.title}">
                <div class="card-body">
                    <h5 class="card-title">${news.title}</h5>
                    <p class="card-text">${news.description}</p>
                    <a href="${news.link}" target="_blank" class="btn btn-primary">Leer más</a>
                </div>
            </div>
        `;
    });
}