(() => {
    "use strict";

    /*
     * MAYURESH KAHAR — EDITORIAL / SWISS PORTFOLIO
     * Interaction layer for the existing index.html + style.css.
     */

    const html = document.documentElement;
    const body = document.body;

    /* =========================================================
       HELPERS
    ========================================================= */

    const $ = (selector, scope = document) => {
        return scope.querySelector(selector);
    };

    const $$ = (selector, scope = document) => {
        return Array.from(scope.querySelectorAll(selector));
    };

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const finePointer = window.matchMedia(
        "(pointer: fine)"
    ).matches;

    /* =========================================================
       PAGE READY
    ========================================================= */

    html.classList.add("js-ready");

    if (prefersReducedMotion) {
        html.classList.add("reduced-motion");
    }

    if (finePointer) {
        html.classList.add("fine-pointer");
    }

    requestAnimationFrame(() => {
        html.classList.add("page-ready");
    });

    /* =========================================================
       MOBILE NAVIGATION
    ========================================================= */

    const navToggle = $("#nav-toggle");
    const mobileNav = $("#nav-menu");

    const closeMobileNav = () => {
        if (!navToggle || !mobileNav) return;

        navToggle.classList.remove("active");
        mobileNav.classList.remove("active");

        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");

        body.classList.remove("menu-open");
    };

    const openMobileNav = () => {
        if (!navToggle || !mobileNav) return;

        navToggle.classList.add("active");
        mobileNav.classList.add("active");

        navToggle.setAttribute("aria-expanded", "true");
        mobileNav.setAttribute("aria-hidden", "false");

        body.classList.add("menu-open");
    };

    if (navToggle && mobileNav) {
        navToggle.addEventListener("click", () => {
            const isOpen = mobileNav.classList.contains("active");

            if (isOpen) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });

        $$("a", mobileNav).forEach((link) => {
            link.addEventListener("click", closeMobileNav);
        });
    }

    /* =========================================================
       ESCAPE KEY
    ========================================================= */

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileNav();
            closeCommandPalette();
        }
    });

    /* =========================================================
       SCROLL PROGRESS
    ========================================================= */

    let ticking = false;

    const updateScrollUI = () => {
        const scrollTop = window.scrollY || window.pageYOffset;
        const documentHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress =
            documentHeight > 0
                ? Math.min(Math.max(scrollTop / documentHeight, 0), 1)
                : 0;

        html.style.setProperty(
            "--scroll-progress",
            `${progress * 100}%`
        );

        const navbar = $("#navbar");

        if (navbar) {
            navbar.classList.toggle("scrolled", scrollTop > 24);
        }

        ticking = false;
    };

    const requestScrollUpdate = () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollUI);
            ticking = true;
        }
    };

    window.addEventListener("scroll", requestScrollUpdate, {
        passive: true
    });

    updateScrollUI();

    /* =========================================================
       REVEAL ANIMATIONS
    ========================================================= */

    const revealElements = $$(".reveal");

    if (prefersReducedMotion) {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    } else if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -50px 0px"
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    }

    /* =========================================================
       ACTIVE NAVIGATION
    ========================================================= */

    const sections = $$("section[id]");
    const navLinks = $$(
        '.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]'
    );

    const updateActiveNavigation = () => {
        const scrollPosition = window.scrollY + 180;

        let currentSection = "";

        sections.forEach((section) => {
            if (scrollPosition >= section.offsetTop) {
                currentSection = section.id;
            }
        });

        navLinks.forEach((link) => {
            const target = link.getAttribute("href");

            link.classList.toggle(
                "active",
                target === `#${currentSection}`
            );
        });
    };

    window.addEventListener(
        "scroll",
        updateActiveNavigation,
        { passive: true }
    );

    updateActiveNavigation();

    /* =========================================================
       SMOOTH ANCHOR SCROLL
    ========================================================= */

    $$('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!href || href === "#") return;

            const target = document.querySelector(href);

            if (!target) return;

            event.preventDefault();

            const header = $("#navbar");
            const headerHeight = header
                ? header.offsetHeight
                : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                20;

            window.scrollTo({
                top: targetPosition,
                behavior: prefersReducedMotion
                    ? "auto"
                    : "smooth"
            });

            closeMobileNav();
        });
    });

    /* =========================================================
       CURSOR GLOW
    ========================================================= */

    let cursorGlow = $(".cursor-glow");

    if (finePointer && !cursorGlow) {
        cursorGlow = document.createElement("div");
        cursorGlow.className = "cursor-glow";

        body.appendChild(cursorGlow);
    }

    if (finePointer && cursorGlow && !prefersReducedMotion) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        let currentX = mouseX;
        let currentY = mouseY;

        document.addEventListener("pointermove", (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        const animateCursor = () => {
            currentX += (mouseX - currentX) * 0.12;
            currentY += (mouseY - currentY) * 0.12;

            cursorGlow.style.transform =
                `translate3d(${currentX}px, ${currentY}px, 0)`;

            requestAnimationFrame(animateCursor);
        };

        animateCursor();
    }

    /* =========================================================
       HERO 3D TILT
    ========================================================= */

    const heroVisual = $(".hero-visual");

    if (
        heroVisual &&
        finePointer &&
        !prefersReducedMotion
    ) {
        const maxRotate = 5;

        heroVisual.addEventListener("pointermove", (event) => {
            const rect = heroVisual.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) / rect.width;

            const y =
                (event.clientY - rect.top) / rect.height;

            const rotateY =
                (x - 0.5) * maxRotate * 2;

            const rotateX =
                (0.5 - y) * maxRotate * 2;

            heroVisual.style.setProperty(
                "--hero-mx",
                `${(x - 0.5) * 10}px`
            );

            heroVisual.style.setProperty(
                "--hero-my",
                `${(y - 0.5) * 10}px`
            );

            heroVisual.style.transform =
                `translate3d(var(--hero-mx), var(--hero-my), 0)
         perspective(1000px)
         rotateX(${rotateX}deg)
         rotateY(${rotateY}deg)`;
        });

        heroVisual.addEventListener("pointerleave", () => {
            heroVisual.style.setProperty(
                "--hero-mx",
                "0px"
            );

            heroVisual.style.setProperty(
                "--hero-my",
                "0px"
            );

            heroVisual.style.transform =
                "translate3d(0, 0, 0)";
        });
    }

    /* =========================================================
       MAGNETIC BUTTONS
    ========================================================= */

    const magneticElements = $$(".magnetic");

    if (
        finePointer &&
        !prefersReducedMotion
    ) {
        magneticElements.forEach((element) => {
            element.addEventListener("pointermove", (event) => {
                const rect =
                    element.getBoundingClientRect();

                const x =
                    event.clientX -
                    rect.left -
                    rect.width / 2;

                const y =
                    event.clientY -
                    rect.top -
                    rect.height / 2;

                const strength = 0.18;

                element.style.transform =
                    `translate3d(
            ${x * strength}px,
            ${y * strength}px,
            0
          )`;
            });

            element.addEventListener("pointerleave", () => {
                element.style.transform = "";
            });
        });
    }

    /* =========================================================
       PROJECT HOVER EFFECT
    ========================================================= */

    const projects = $$(".project");

    if (
        finePointer &&
        !prefersReducedMotion
    ) {
        projects.forEach((project) => {
            project.addEventListener("pointermove", (event) => {
                const rect =
                    project.getBoundingClientRect();

                const x =
                    ((event.clientX - rect.left) /
                        rect.width) *
                    100;

                const y =
                    ((event.clientY - rect.top) /
                        rect.height) *
                    100;

                project.style.setProperty(
                    "--mouse-x",
                    `${x}%`
                );

                project.style.setProperty(
                    "--mouse-y",
                    `${y}%`
                );
            });
        });
    }

    /* =========================================================
       STACK CARD SPOTLIGHT
    ========================================================= */

    const stackCards = $$(".stack-card");

    if (
        finePointer &&
        !prefersReducedMotion
    ) {
        stackCards.forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                const rect =
                    card.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                card.style.setProperty(
                    "--spotlight-x",
                    `${x}px`
                );

                card.style.setProperty(
                    "--spotlight-y",
                    `${y}px`
                );
            });
        });
    }

    /* =========================================================
       FLOATING CHIPS
    ========================================================= */

    const floatingChips = $$(".floating-chip");

    floatingChips.forEach((chip) => {
        chip.addEventListener("mouseenter", () => {
            chip.classList.add("is-hovered");
        });

        chip.addEventListener("mouseleave", () => {
            chip.classList.remove("is-hovered");
        });
    });

    /* =========================================================
       CLICK RIPPLE
    ========================================================= */

    document.addEventListener("click", (event) => {
        if (
            prefersReducedMotion ||
            !finePointer
        ) {
            return;
        }

        const target =
            event.target.closest(
                "a, button, .project, .stack-card"
            );

        if (!target) return;

        const ripple =
            document.createElement("span");

        ripple.className = "click-ripple";

        const rect =
            target.getBoundingClientRect();

        const size =
            Math.max(rect.width, rect.height);

        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;

        ripple.style.left =
            `${event.clientX - rect.left - size / 2}px`;

        ripple.style.top =
            `${event.clientY - rect.top - size / 2}px`;

        target.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 650);
    });

    /* =========================================================
       CONTACT FORM
    ========================================================= */

    const contactForm = $(".contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const nameInput =
                contactForm.querySelector(
                    '[name="name"]'
                );

            const emailInput =
                contactForm.querySelector(
                    '[name="email"]'
                );

            const messageInput =
                contactForm.querySelector(
                    '[name="message"]'
                );

            const name =
                nameInput?.value.trim() || "";

            const email =
                emailInput?.value.trim() || "";

            const message =
                messageInput?.value.trim() || "";

            if (!name || !email || !message) {
                showToast(
                    "Please fill in all fields."
                );

                return;
            }

            const subject =
                encodeURIComponent(
                    `Portfolio enquiry from ${name}`
                );

            const body =
                encodeURIComponent(
                    `Name: ${name}\n` +
                    `Email: ${email}\n\n` +
                    `${message}`
                );

            const mailto =
                `mailto:mayureshkahar777@gmail.com` +
                `?subject=${subject}` +
                `&body=${body}`;

            window.location.href = mailto;

            showToast(
                "Opening your email client..."
            );
        });
    }

    /* =========================================================
       TOAST
    ========================================================= */

    const toast = $("#toast");

    let toastTimer = null;

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3200);
    }

    /* =========================================================
       COMMAND PALETTE
    ========================================================= */

    const commandPalette =
        $("#command-palette");

    const commandInput =
        $("#command-input");

    const commandItems =
        $$(".command-item");

    let activeCommandIndex = 0;

    function openCommandPalette() {
        if (!commandPalette) return;

        commandPalette.classList.add("is-open");

        commandPalette.setAttribute(
            "aria-hidden",
            "false"
        );

        body.classList.add(
            "command-palette-open"
        );

        if (commandInput) {
            commandInput.value = "";

            setTimeout(() => {
                commandInput.focus();
            }, 50);
        }

        activeCommandIndex = 0;

        updateCommandSelection();
    }

    function closeCommandPalette() {
        if (!commandPalette) return;

        commandPalette.classList.remove(
            "is-open"
        );

        commandPalette.setAttribute(
            "aria-hidden",
            "true"
        );

        body.classList.remove(
            "command-palette-open"
        );
    }

    function updateCommandSelection() {
        commandItems.forEach((item, index) => {
            item.classList.toggle(
                "active",
                index === activeCommandIndex &&
                !item.hidden
            );
        });
    }

    function filterCommands(query) {
        const normalized =
            query.trim().toLowerCase();

        let visibleItems = [];

        commandItems.forEach((item) => {
            const text =
                item.textContent
                    .trim()
                    .toLowerCase();

            const matches =
                !normalized ||
                text.includes(normalized);

            item.hidden = !matches;

            if (matches) {
                visibleItems.push(item);
            }
        });

        activeCommandIndex = 0;

        if (visibleItems.length > 0) {
            commandItems.forEach((item) => {
                item.classList.remove("active");
            });

            visibleItems[0].classList.add(
                "active"
            );
        }
    }

    function executeCommand(item) {
        if (!item) return;

        const href =
            item.getAttribute("data-href") ||
            item.getAttribute("href");

        if (href) {
            closeCommandPalette();

            if (href.startsWith("#")) {
                const target =
                    document.querySelector(href);

                if (target) {
                    target.scrollIntoView({
                        behavior:
                            prefersReducedMotion
                                ? "auto"
                                : "smooth"
                    });
                }
            } else {
                window.location.href = href;
            }

            return;
        }

        const action =
            item.dataset.action;

        if (action) {
            closeCommandPalette();

            switch (action) {
                case "contact":
                    document
                        .querySelector("#contact")
                        ?.scrollIntoView({
                            behavior:
                                prefersReducedMotion
                                    ? "auto"
                                    : "smooth"
                        });
                    break;

                case "home":
                    window.scrollTo({
                        top: 0,
                        behavior:
                            prefersReducedMotion
                                ? "auto"
                                : "smooth"
                    });
                    break;

                default:
                    break;
            }
        }
    }

    if (commandPalette) {
        commandPalette.addEventListener(
            "click",
            (event) => {
                const closeButton =
                    event.target.closest(
                        "[data-command-close]"
                    );

                if (closeButton) {
                    closeCommandPalette();
                    return;
                }

                const item =
                    event.target.closest(
                        ".command-item"
                    );

                if (item && !item.hidden) {
                    executeCommand(item);
                }
            }
        );

        commandPalette.addEventListener(
            "click",
            (event) => {
                if (
                    event.target === commandPalette
                ) {
                    closeCommandPalette();
                }
            }
        );
    }

    if (commandInput) {
        commandInput.addEventListener(
            "input",
            () => {
                filterCommands(
                    commandInput.value
                );
            }
        );

        commandInput.addEventListener(
            "keydown",
            (event) => {
                const visibleItems =
                    commandItems.filter(
                        (item) => !item.hidden
                    );

                if (!visibleItems.length) {
                    return;
                }

                if (event.key === "ArrowDown") {
                    event.preventDefault();

                    activeCommandIndex =
                        (activeCommandIndex + 1) %
                        visibleItems.length;

                    visibleItems.forEach(
                        (item, index) => {
                            item.classList.toggle(
                                "active",
                                index ===
                                activeCommandIndex
                            );
                        }
                    );
                }

                if (event.key === "ArrowUp") {
                    event.preventDefault();

                    activeCommandIndex =
                        (activeCommandIndex -
                            1 +
                            visibleItems.length) %
                        visibleItems.length;

                    visibleItems.forEach(
                        (item, index) => {
                            item.classList.toggle(
                                "active",
                                index ===
                                activeCommandIndex
                            );
                        }
                    );
                }

                if (event.key === "Enter") {
                    event.preventDefault();

                    executeCommand(
                        visibleItems[
                        activeCommandIndex
                        ]
                    );
                }
            }
        );
    }

    document.addEventListener(
        "keydown",
        (event) => {
            const modifier =
                event.ctrlKey ||
                event.metaKey;

            if (
                modifier &&
                event.key.toLowerCase() === "k"
            ) {
                event.preventDefault();

                if (
                    commandPalette?.classList.contains(
                        "is-open"
                    )
                ) {
                    closeCommandPalette();
                } else {
                    openCommandPalette();
                }
            }
        }
    );

    /* =========================================================
       IMAGE LOADING
    ========================================================= */

    const images = $$("img");

    images.forEach((image) => {
        if (image.complete) {
            image.classList.add("loaded");
        } else {
            image.addEventListener(
                "load",
                () => {
                    image.classList.add("loaded");
                },
                { once: true }
            );

            image.addEventListener(
                "error",
                () => {
                    image.classList.add(
                        "load-error"
                    );
                },
                { once: true }
            );
        }
    });

    /* =========================================================
       EXTERNAL LINKS
    ========================================================= */

    $$("a").forEach((link) => {
        const href =
            link.getAttribute("href");

        if (!href) return;

        const isExternal =
            href.startsWith("http://") ||
            href.startsWith("https://");

        if (
            isExternal &&
            !href.includes(
                window.location.hostname
            )
        ) {
            link.setAttribute(
                "target",
                "_blank"
            );

            link.setAttribute(
                "rel",
                "noopener noreferrer"
            );
        }
    });

    /* =========================================================
       RESIZE CLEANUP
    ========================================================= */

    let resizeTimer;

    window.addEventListener(
        "resize",
        () => {
            clearTimeout(resizeTimer);

            resizeTimer = setTimeout(() => {
                if (
                    window.innerWidth > 900
                ) {
                    closeMobileNav();
                }

                updateScrollUI();
                updateActiveNavigation();
            }, 150);
        },
        { passive: true }
    );

    /* =========================================================
       INITIAL STATE
    ========================================================= */

    updateScrollUI();
    updateActiveNavigation();

})();