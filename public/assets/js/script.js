'use strict';



/**
 * add event on element
 */

const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
}
/**
 * navbar toggle
 */

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navLinks = document.querySelectorAll("[data-nav-link]");

const toggleNavbar = function () { navbar.classList.toggle("active"); }

addEventOnElem(navTogglers, "click", toggleNavbar);

const closeNavbar = function () { navbar.classList.remove("active"); }

addEventOnElem(navLinks, "click", closeNavbar);


/**
 * theme toggle
 */

const themeToggles = document.querySelectorAll("[data-theme-toggle]");
const THEME_KEY = "artovex-theme";

const setTheme = (theme) => {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
};

const storedTheme = localStorage.getItem(THEME_KEY);
if (storedTheme) {
  setTheme(storedTheme);
} else {
  setTheme("dark");
}

themeToggles.forEach((btn) => {
  btn.addEventListener("click", () => {
    const nextTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });
});


/**
 * Lightbox preview
 */

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImg = document.querySelector("[data-lightbox-img]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");

const openLightbox = (src, caption = "") => {
  if (!lightbox) return;
  lightboxImg.src = src;
  lightboxImg.alt = caption || "Artwork preview";
  lightboxCaption.textContent = caption;
  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-enlarge]");
  if (!trigger) return;
  event.preventDefault();
  const src = trigger.getAttribute("data-enlarge");
  const caption = (trigger.getAttribute("data-caption") || "").replace(/&quot;/g, '"');
  if (src) {
    openLightbox(src, caption);
  }
});



/**
 * header & back top btn active
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});
// ===============================
//  ARTOVEX GALLERY (DYNAMIC LOAD)
// ===============================

const galleryList = document.getElementById("gallery-list");

async function loadArtworks() {
  if (!galleryList) return; // safety check

  try {
    const response = await fetch("/api/artworks");
    if (!response.ok) {
      throw new Error("Failed to load artworks");
    }

    const artworks = await response.json();

    // Clear existing content (if any)
    galleryList.innerHTML = "";

    if (!artworks.length) {
      galleryList.innerHTML = `
        <li>
          <p style="text-align:center; width:100%;">
            No artworks available yet. Please check back later.
          </p>
        </li>
      `;
      return;
    }

    artworks.forEach((artwork) => {
      const title = artwork.title || "Untitled Artwork";
      const caption = artwork.description || title;
      const safeCaption = String(caption).replace(/"/g, "&quot;");

      const li = document.createElement("li");
      li.className = "scrollbar-item";

      li.innerHTML = `
        <div class="gallery-card">
          <figure class="card-banner img-holder" style="--width: 736; --height: 1040;"
            data-enlarge="${artwork.fileUrl}"
            data-caption="${safeCaption}">
            <img src="${artwork.fileUrl}"
                 loading="lazy"
                 alt="${title}"
                 class="img-cover">
          </figure>
          <div class="card-content">
            <h3 class="h3">
              <a href="#" class="card-title">${title}</a>
            </h3>
            <p class="card-text">
              ${artwork.description || "No description provided."}
            </p>
            <a href="#" class="btn-link has-before view-details-btn">View Details</a>

          </div>
        </div>
      `;

      galleryList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    galleryList.innerHTML = `
      <li>
        <p style="text-align:center; color:red; width:100%;">
          Failed to load artworks. Please try again later.
        </p>
      </li>
    `;
  }
}

// Load artworks when page is ready
window.addEventListener("DOMContentLoaded", loadArtworks);
// ===============================
//  VIEW DETAILS TOGGLE
// ===============================
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("view-details-btn")) {
    e.preventDefault();

    const card = e.target.closest(".gallery-card");
    const desc = card.querySelector(".card-text");

    desc.classList.toggle("expanded");

    // Change button text
    if (desc.classList.contains("expanded")) {
      e.target.textContent = "Hide Details";
    } else {
      e.target.textContent = "View Details";
    }
  }
});

