// Particle canvas setup
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particles = [];

for (let i = 0; i < 100; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 5 + 2,
    dx: Math.random() * 2 - 1,
    dy: Math.random() * 2 - 1,
    color: `hsl(${Math.random() * 360}, 100%, 70%)`
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

// Mouse mask reveal
window.addEventListener('mousemove', e => {
  const reveal = document.getElementById('reveal');
  reveal.style.setProperty('--x', `${e.clientX}px`);
  reveal.style.setProperty('--y', `${e.clientY}px`);
});

// Page switch
function enterGallery() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('gallery').style.display = 'flex';
}

// Image gallery
const images = ["img/img1.jpg", "img/img2.jpg", "img/img3.jpg", "img/img4.jpg", "img/img5.jpg", "img/img6.jpg", "img/img7.jpg", "img/img8.jpg"];
const captions = ["Shinobi-Jonathon Gregory Bick", "Angel-Nick Murenets", "View of the island-Nick Murenets", "Emperors Corridor-Ian Smith", "Higher ground-Jonathon Gregory Bick", "we dont let number 7 out anymore-Col Price", "Sappheiros-Alec Tucker", "Artwork by zhou kun"];
const imageGrid = document.getElementById("imageGrid");

let gridHTML = '';
for (let i = 0; i < images.length; i += 2) {
  gridHTML += '<div class="column">';
  gridHTML += `<img src="${images[i]}" alt="Thumbnail ${i + 1}" onclick="openLightbox('${images[i]}', '${captions[i]}')">`;
  if (images[i + 1]) {
    gridHTML += `<img src="${images[i + 1]}" alt="Thumbnail ${i + 2}" onclick="openLightbox('${images[i + 1]}', '${captions[i + 1]}')">`;
  }
  gridHTML += '</div>';
}
imageGrid.innerHTML = gridHTML;

function openLightbox(imageSrc, caption) {
  document.getElementById("lightbox").style.display = "flex";
  document.getElementById("lightbox-img").src = imageSrc;
  document.getElementById("lightbox-caption").innerText = caption;
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
}