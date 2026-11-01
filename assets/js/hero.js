/**
 * hero.js
 * -----------------------------------------------------------------------
 * Menggantikan logic carousel yang tadinya inline di versi Tailwind
 * (heroCarousel diisi lewat JS, prevSlide()/nextSlide(), carouselDots).
 *
 * Cara pakai:
 *  - Edit array HERO_SLIDES di bawah buat ganti gambar/caption
 *  - Slide & dot otomatis di-generate & dirender ke #heroCarousel /
 *    #carouselDots
 *  - Autoplay tiap 5 detik, jeda otomatis kalau user hover / klik manual
 * -----------------------------------------------------------------------
 */

const HERO_SLIDES = [
  {
    image: "assets/img/Fiay-img.png",
    eyebrow: "Your Teacher",
    title: "Ahmad Syafi'i S.Pd"
  },
  {
    image: "/assets/img/icons/Minat_dan_bakat.jpg",
    eyebrow: "Agenda Kampus",
    title: "Pekan Orientasi Mahasiswa Baru 2026"
  },
  {
    image: "/assets/img/icons/Jannata.png",
    eyebrow: "Info Beasiswa",
    title: "Pembukaan Pendaftaran Beasiswa KIP Kuliah"
  }
];

(function () {
  "use strict";

  let currentSlide = 0;
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 5000;

  function initHeroCarousel() {
    const carousel = document.getElementById("heroCarousel");
    const dotsWrap = document.getElementById("carouselDots");
    if (!carousel || !dotsWrap) return; // hero belum ada di halaman ini

    renderSlides(carousel);
    renderDots(dotsWrap);
    goToSlide(0);

    const prevBtn = document.getElementById("carouselPrev");
    const nextBtn = document.getElementById("carouselNext");
    if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); resetAutoplay(); });

    const visual = carousel.closest(".hero-visual");
    if (visual) {
      visual.addEventListener("mouseenter", stopAutoplay);
      visual.addEventListener("mouseleave", startAutoplay);
    }

    startAutoplay();
  }

  function renderSlides(carousel) {
    carousel.innerHTML = "";
    HERO_SLIDES.forEach((slide, index) => {
      const el = document.createElement("div");
      el.className = "hero-slide";
      el.dataset.index = String(index);
      el.style.backgroundImage = `url('${slide.image}')`;

      const caption = document.createElement("div");
      caption.className = "hero-slide-caption";

      const eyebrow = document.createElement("span");
      eyebrow.className = "hero-slide-eyebrow";
      eyebrow.textContent = slide.eyebrow;

      const title = document.createElement("p");
      title.className = "hero-slide-title";
      title.textContent = slide.title;

      caption.append(eyebrow, title);
      el.appendChild(caption);
      carousel.appendChild(el);
    });
  }

  function renderDots(dotsWrap) {
    dotsWrap.innerHTML = "";
    HERO_SLIDES.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot";
      dot.setAttribute("aria-label", `Ke slide ${index + 1}`);
      dot.addEventListener("click", () => {
        goToSlide(index);
        resetAutoplay();
      });
      dotsWrap.appendChild(dot);
    });
  }

  function goToSlide(index) {
    const slides = document.querySelectorAll("#heroCarousel .hero-slide");
    const dots = document.querySelectorAll("#carouselDots .hero-dot");
    if (!slides.length) return;

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === currentSlide);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentSlide);
    });
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // expose ke global scope (dipakai juga oleh atribut onclick di HTML)
  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;

  document.addEventListener("DOMContentLoaded", initHeroCarousel);
})();

/**
 * navigateTo(section)
 * -----------------------------------------------------------------------
 * Placeholder untuk tombol "Info Beasiswa" & "Agenda Kampus".
 * Di versi Tailwind aslinya ini dipakai buat switch antar section dalam
 * satu SPA. Karena struktur situsmu per-halaman (bukan SPA), paling
 * gampang diarahkan ke URL beneran. Sesuaikan path di bawah sesuai
 * halaman yang sudah/akan kamu buat.
 * -----------------------------------------------------------------------
 */
function navigateTo(section) {
  const routes = {
    beasiswa: "/pages/layanan/beasiswa.html",
    agenda: "/pages/agenda/agenda.html"
  };

  const target = routes[section];
  if (target) {
    window.location.href = target;
  } else {
    console.warn(`navigateTo: rute untuk "${section}" belum diatur.`);
  }
}
