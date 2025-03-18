//image grid functoin
let images = ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg", "img6.jpg", "img7.jpg", "img8.jpg"];
let captions = ["Caption One", "Caption Two", "Caption Three", "Caption Four", "Caption Five", "Caption Six", "Caption Seven", "Caption Eight"];

document.addEventListener("DOMContentLoaded", function() {
    let imageGrid = document.getElementById("imageGrid");

    let gridHTML = '<div class="row">';
    for (let i = 0; i < images.length; i += 2) {
        gridHTML += '<div class="column">';
        gridHTML += `<img src="${images[i]}" alt="Thumbnail ${i + 1}" onclick="openLightbox('${images[i]}', '${captions[i]}')">`;
        if (images[i + 1]) {
            gridHTML += `<img src="${images[i + 1]}" alt="Thumbnail ${i + 2}" onclick="openLightbox('${images[i + 1]}', '${captions[i + 1]}')">`;
        }
        gridHTML += '</div>';
    }
    gridHTML += '</div>';

    imageGrid.innerHTML = gridHTML;
});

//open and close lightbox function
function openLightbox(imageSrc, caption) {
    let lightbox = document.getElementById("lightbox");
    let lightboxImg = document.getElementById("lightbox-img");
    let lightboxCaption = document.getElementById("lightbox-caption");

    lightbox.style.display = "flex";
    lightboxImg.src = imageSrc;
    lightboxCaption.innerText = caption;
}

function closeLightbox() {
    document.getElementById("lightbox").style.display = "none";
}