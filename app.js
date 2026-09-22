document.addEventListener("DOMContentLoaded", function () {

    const startButton = document.getElementById("startGame");
    const introPage = document.getElementById("introPage");
    const gameApp = document.getElementById("gameApp");

    /* ==========================================
       SHOW PAGE
    ========================================== */

    window.showPage = function (pageId) {

        const pages = document.querySelectorAll(".game-page");
        const navItems = document.querySelectorAll(".nav-item");

        // Hide ALL pages completely
        pages.forEach(function (page) {

            page.classList.remove("active");

            page.style.display = "none";
            page.style.visibility = "hidden";
            page.style.pointerEvents = "none";
        });

        // Find selected page
        const selectedPage = document.getElementById(pageId);

        if (selectedPage) {

            selectedPage.classList.add("active");

            // IMPORTANT:
            // Force selected page to become visible
            selectedPage.style.display = "block";
            selectedPage.style.visibility = "visible";
            selectedPage.style.pointerEvents = "auto";
        }

        // Update bottom navigation
        navItems.forEach(function (button) {

            button.classList.remove("active");

            const onclickCode =
                button.getAttribute("onclick") || "";

            if (
                onclickCode.includes(
                    "showPage('" + pageId + "')"
                ) ||
                onclickCode.includes(
                    'showPage("' + pageId + '")'
                )
            ) {
                button.classList.add("active");
            }
        });

        // Go to top
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    /* ==========================================
       START GAME
    ========================================== */

    if (startButton) {

        startButton.addEventListener("click", function () {

            // Hide Intro completely
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

            // Open Mining
            window.showPage("miningPage");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }


    /* ==========================================
       BOTTOM NAVIGATION
    ========================================== */

    document.querySelectorAll(".nav-item").forEach(function (button) {

        button.addEventListener("click", function (event) {

            event.preventDefault();

            const onclickCode =
                button.getAttribute("onclick") || "";

            const match =
                onclickCode.match(
                    /showPage\(['"]([^'"]+)['"]\)/
                );

            if (match && match[1]) {

                window.showPage(match[1]);

            }
        });
    });


    /* ==========================================
       INITIAL STATE
    ========================================== */

    // If game is already visible, open Mining
    if (
        gameApp &&
        !gameApp.classList.contains("hidden")
    ) {
        window.showPage("miningPage");
    }

});
