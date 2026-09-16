(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const smooth = (a, b, n) => {
    const t = clamp((n - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  const hero = document.querySelector(".hero");
  const hi = document.querySelector(".hero-hi");
  const name = document.querySelector(".hero-name-wrap");
  const portrait = document.querySelector(".hero-portrait");
  const cue = document.querySelector(".hero-scroll-cue");
  const sideNote = document.querySelector(".hero-side-note");
  const skills = document.querySelector(".skills-section");
  const stage = document.querySelector(".skills-stage");
  const box = document.querySelector(".skill-box");
  const tags = [...document.querySelectorAll(".skill-tag")];
  const targets = [
    [-370, -20, -11],
    [-90, -170, 10],
    [245, -145, -8],
    [305, 52, 8],
    [179, 193, -10],
    [-260, 175, 8],
  ];
  let ticking = false;

  function updateScrollScenes() {
    ticking = false;
    if (reduceMotion.matches) return;

    const heroTravel = Math.max(1, hero.offsetHeight - window.innerHeight);
    const hp = clamp(-hero.getBoundingClientRect().top / heroTravel);
    const hiOut = smooth(0.08, 0.32, hp);
    const nameIn = smooth(0.25, 0.56, hp);
    const portraitIn = smooth(0.33, 0.73, hp);
    hi.style.opacity = String(1 - hiOut);
    hi.style.transform = `translate(-50%,-50%) scale(${1 + hiOut * 0.36})`;
    name.style.opacity = String(nameIn);
    name.style.transform = `translate(-50%,${Math.round((1 - nameIn) * 55)}px)`;
    portrait.style.opacity = String(portraitIn);
    portrait.style.transform = `translate(-50%,${Math.round((1 - portraitIn) * 95)}px) scale(${(0.88 + portraitIn * 0.12).toFixed(3)})`;
    cue.style.opacity = String(1 - smooth(0.54, 0.83, hp));
    sideNote.style.opacity = String(smooth(0.55, 0.85, hp));

    const skillTravel = Math.max(1, skills.offsetHeight - window.innerHeight);
    const sp = clamp(-skills.getBoundingClientRect().top / skillTravel);
    const shake = Math.sin(sp * 85) * 6 * (smooth(0.10, 0.21, sp) - smooth(0.43, 0.66, sp));
    box.style.transform = `translate(-50%,-50%) rotate(${shake.toFixed(2)}deg) scale(${(1 - smooth(0.37, 0.82, sp) * 0.1).toFixed(3)})`;
    const xScale = stage.clientWidth < 620
      ? Math.min(0.3, (stage.clientWidth - 40) / 1050)
      : Math.min(1, (stage.clientWidth - 28) / 850);
    const yScale = stage.clientWidth < 620 ? 0.72 : 1;
    tags.forEach((tag, i) => {
      const [x, y, angle] = targets[i];
      const t = smooth(0.19 + i * 0.035, 0.74 + i * 0.025, sp);
      const lift = Math.sin(t * Math.PI) * -34;
      const mobileTagLift = stage.clientWidth < 620 && i === 5 ? -50 : 0;
      tag.style.opacity = String(smooth(0.13 + i * 0.03, 0.32 + i * 0.03, sp));
      tag.style.transform = `translate(calc(-50% + ${(x * xScale * t).toFixed(1)}px),calc(-50% + ${((y * yScale + mobileTagLift) * t + lift).toFixed(1)}px)) rotate(${(angle * t).toFixed(1)}deg) scale(${(0.55 + t * 0.45).toFixed(3)})`;
    });
  }
  const requestSceneUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollScenes);
    }
  };
  window.addEventListener("scroll", requestSceneUpdate, { passive: true });
  window.addEventListener("resize", requestSceneUpdate, { passive: true });
  reduceMotion.addEventListener?.("change", requestSceneUpdate);
  requestSceneUpdate();

  const frames = [...document.querySelectorAll(".preview-frame")];
  const sizeFrames = () => {
    frames.forEach((frame) => frame.style.setProperty("--iframe-scale", (frame.clientWidth / 1280).toFixed(5)));
  };
  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(sizeFrames);
    frames.forEach((frame) => resizeObserver.observe(frame));
  } else {
    window.addEventListener("resize", sizeFrames);
  }
  sizeFrames();

  const previews = [...document.querySelectorAll(".project-preview")];
  if ("IntersectionObserver" in window) {
    const previewObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = entry.target;
        const iframe = link.querySelector("iframe");
        iframe.addEventListener("load", () => link.classList.add("loaded"), { once: true });
        iframe.src = iframe.dataset.src;
        observer.unobserve(link);
      });
    }, { rootMargin: "400px 0px" });
    previews.forEach((preview) => previewObserver.observe(preview));
  } else {
    previews.forEach((preview) => {
      const iframe = preview.querySelector("iframe");
      iframe.addEventListener("load", () => preview.classList.add("loaded"), { once: true });
      iframe.src = iframe.dataset.src;
    });
  }

  const reveals = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((item) => revealObserver.observe(item));
    document.documentElement.classList.add("motion-ready");
  }

  const track = document.getElementById("x-track");
  const cards = [...track.querySelectorAll(".x-card")];
  const prev = document.getElementById("x-prev");
  const next = document.getElementById("x-next");
  const current = document.getElementById("x-current");
  const updateCarousel = () => {
    const left = track.scrollLeft;
    let nearest = 0;
    let distance = Infinity;
    cards.forEach((card, i) => {
      const d = Math.abs(card.offsetLeft - cards[0].offsetLeft - left);
      if (d < distance) { distance = d; nearest = i; }
    });
    current.textContent = String(nearest + 1).padStart(2, "0");
    prev.disabled = left <= 5;
    next.disabled = left + track.clientWidth >= track.scrollWidth - 5;
  };
  function moveCarousel(direction) {
    const cardWidth = cards[0].getBoundingClientRect().width + 22;
    track.scrollBy({ left: direction * cardWidth, behavior: reduceMotion.matches ? "instant" : "smooth" });
  }
  prev.addEventListener("click", () => moveCarousel(-1));
  next.addEventListener("click", () => moveCarousel(1));
  track.addEventListener("scroll", updateCarousel, { passive: true });
  window.addEventListener("resize", updateCarousel, { passive: true });
  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveCarousel(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  updateCarousel();
})();
