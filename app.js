document.addEventListener("DOMContentLoaded", function () {

    const startButton = document.getElementById("startGame");
    const introPage = document.getElementById("introPage");
    const gameApp = document.getElementById("gameApp");

    /* ==========================================
       START GAME
    ========================================== */

    if (startButton) {
        startButton.addEventListener("click", function () {

            // Hide Intro
            if (introPage) {
                introPage.classList.remove("active");
                introPage.style.display = "none";
                introPage.style.visibility = "hidden";
                introPage.style.pointerEvents = "none";
            }

            // Show Game
            if (gameApp) {
                gameApp.classList.remove("hidden");
                gameApp.style.display = "block";
                gameApp.style.visibility = "visible";
                gameApp.style.pointerEvents = "auto";
            }

            // Always start on Mining
            showPage("miningPage");

            window.scrollTo(0, 0);
        });
    }


    /* ==========================================
       PAGE NAVIGATION
    ========================================== */

    window.showPage = function (pageId) {

        const pages = document.querySelectorAll(".game-page");
        const navItems = document.querySelectorAll(".nav-item");

        // Hide every game page
        pages.forEach(function (page) {
            page.classList.remove("active");
        });

        // Show selected page
        const selectedPage = document.getElementById(pageId);

        if (selectedPage) {
            selectedPage.classList.add("active");
        }

        // Update bottom navigation
        navItems.forEach(function (button) {

            button.classList.remove("active");

            const code = button.getAttribute("onclick") || "";

            if (code.includes("'" + pageId + "'")) {
                button.classList.add("active");
            }
        });

        // Special guarantee for Mining tab
        if (pageId === "miningPage") {

            const miningPage = document.getElementById("miningPage");

            if (miningPage) {
                miningPage.classList.add("active");
            }

            navItems.forEach(function (button) {

                const code = button.getAttribute("onclick") || "";

                if (code.includes("'miningPage'")) {
                    button.classList.add("active");
                }
            });
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    /* ==========================================
       BOTTOM NAVIGATION
       ========================================== */

    document.querySelectorAll(".nav-item").forEach(function (button) {

        button.addEventListener("click", function (event) {

            event.preventDefault();

            const code = button.getAttribute("onclick") || "";

            const match = code.match(/showPage\(['"]([^'"]+)['"]\)/);

            if (match && match[1]) {
                showPage(match[1]);
            }

        });

    });


    /* ==========================================
       INITIAL GAME STATE
    ========================================== */

    if (gameApp && !gameApp.classList.contains("hidden")) {
        showPage("miningPage");
    }

});
