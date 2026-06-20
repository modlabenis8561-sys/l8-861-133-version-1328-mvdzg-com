document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector("[data-menu-button]");
  const menuPanel = document.querySelector("[data-menu-panel]");

  if (menuButton && menuPanel) {
    menuButton.addEventListener("click", () => {
      menuPanel.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let activeSlide = 0;

  const showSlide = (index) => {
    activeSlide = index;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  if (slides.length > 1) {
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => showSlide(index));
    });
    window.setInterval(() => {
      showSlide((activeSlide + 1) % slides.length);
    }, 5600);
  }

  const form = document.querySelector("[data-filter-form]");
  const cards = Array.from(document.querySelectorAll("[data-movie-card]"));

  if (form && cards.length) {
    const keywordInput = form.querySelector("[data-filter-keyword]");
    const regionSelect = form.querySelector("[data-filter-region]");
    const typeSelect = form.querySelector("[data-filter-type]");
    const yearSelect = form.querySelector("[data-filter-year]");
    const countBox = form.querySelector("[data-filter-count]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");

    if (initialQuery && keywordInput) {
      keywordInput.value = initialQuery;
    }

    const normalize = (value) => (value || "").toString().trim().toLowerCase();

    const applyFilter = () => {
      const keyword = normalize(keywordInput && keywordInput.value);
      const region = normalize(regionSelect && regionSelect.value);
      const type = normalize(typeSelect && typeSelect.value);
      const year = normalize(yearSelect && yearSelect.value);
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.textContent
        ].join(" "));
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchRegion = !region || normalize(card.dataset.region).includes(region);
        const matchType = !type || normalize(card.dataset.type).includes(type);
        const matchYear = !year || normalize(card.dataset.year) === year;
        const matched = matchKeyword && matchRegion && matchType && matchYear;

        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (countBox) {
        countBox.textContent = `当前显示 ${visible} 部影片`;
      }
    };

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach((control) => {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }
});
