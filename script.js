const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const revealItems = [...document.querySelectorAll(".reveal")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "打开导航菜单");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
}

function toggleMenu() {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "打开导航菜单" : "关闭导航菜单");
    navigation.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
}

function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function setActiveLink(sectionId) {
    navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${sectionId}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

menuToggle.addEventListener("click", toggleMenu);

navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("is-open")) {
        closeMenu();
        menuToggle.focus();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
        closeMenu();
    }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const sectionObserver = new IntersectionObserver(
    (entries) => {
        const visibleEntries = entries
            .filter((entry) => entry.isIntersecting)
            .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        if (visibleEntries.length > 0) {
            setActiveLink(visibleEntries[0].target.id);
        }
    },
    {
        rootMargin: "-28% 0px -55% 0px",
        threshold: [0, 0.15, 0.35],
    },
);

sections.forEach((section) => sectionObserver.observe(section));

if (reducedMotion.matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelector("[data-year]").textContent = String(new Date().getFullYear());
