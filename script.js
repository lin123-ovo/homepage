// Keep native anchor navigation; CSS handles smooth scrolling and reduced motion.
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];

document.documentElement.classList.remove("no-js");

function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "打开导航菜单");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
}

function toggleMenu() {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
        closeMenu();
        return;
    }
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "关闭导航菜单");
    navigation.classList.add("is-open");
    document.body.classList.add("menu-open");
}

function setActiveLink(sectionId) {
    navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${sectionId}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

function updateNavigation() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
    // Compare every section at a stable line below the fixed header, not only
    // entries that changed during an IntersectionObserver callback.
    const marker = header.getBoundingClientRect().bottom + 24;
    let current = sections[0];
    for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) {
            current = section;
        }
    }
    // The final section can be too short to cross the marker at the page end.
    const pageEnd = document.documentElement.scrollHeight;
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= pageEnd - 2) {
        current = sections[sections.length - 1];
    }
    if (current) setActiveLink(current.id);
}

let framePending = false;
function scheduleNavigationUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(() => {
        framePending = false;
        updateNavigation();
    });
}

menuToggle.addEventListener("click", toggleMenu);
navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        closeMenu();
        const target = document.getElementById(link.hash.slice(1));
        // Move keyboard focus out of the now-hidden menu without overriding
        // the browser's native anchor jump or URL history.
        target?.focus({ preventScroll: true });
        scheduleNavigationUpdate();
    });
});

document.addEventListener("keydown", (event) => {
    if (!navigation.classList.contains("is-open")) return;
    if (event.key === "Escape") {
        closeMenu();
        menuToggle.focus();
    } else if (event.key === "Tab") {
        const controls = [menuToggle, ...navLinks];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMenu();
    scheduleNavigationUpdate();
});
window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true });
window.addEventListener("hashchange", scheduleNavigationUpdate);
window.addEventListener("load", scheduleNavigationUpdate);
// Expanding a project changes all following section positions.
document.addEventListener("toggle", scheduleNavigationUpdate, true);
sections.forEach((section) => section.setAttribute("tabindex", "-1"));
document.querySelector("[data-year]").textContent = String(new Date().getFullYear());
updateNavigation();
