document.addEventListener("DOMContentLoaded", function () {

    const startButton = document.getElementById("startGame");
    const introPage = document.getElementById("introPage");
    const gameApp = document.getElementById("gameApp");

    startButton.addEventListener("click", function () {

        // حذف کامل صفحه Intro
        introPage.classList.remove("active");
        introPage.style.display = "none";
        introPage.style.visibility = "hidden";
        introPage.style.pointerEvents = "none";
        introPage.style.position = "absolute";

        // نمایش کامل بازی
        gameApp.classList.remove("hidden");
        gameApp.style.display = "block";
        gameApp.style.visibility = "visible";
        gameApp.style.pointerEvents = "auto";

        // Mining صفحه اول بازی
        const pages = document.querySelectorAll(".game-page");

        pages.forEach(function (page) {
            page.classList.remove("active");
            page.style.display = "none";
        });

        const mining = document.getElementById("miningPage");

        if (mining) {
            mining.classList.add("active");
            mining.style.display = "block";
            mining.style.visibility = "visible";
            mining.style.pointerEvents = "auto";
        }

        window.scrollTo(0, 0);
    });


    // Navigation
    window.showPage = function (pageId) {

        document.querySelectorAll(".game-page").forEach(function (page) {
            page.classList.remove("active");
            page.style.display = "none";
        });

        const page = document.getElementById(pageId);

        if (page) {
            page.classList.add("active");
            page.style.display = "block";
            page.style.visibility = "visible";
            page.style.pointerEvents = "auto";
        }

        document.querySelectorAll(".nav-item").forEach(function (button) {
            button.classList.remove("active");

            const code = button.getAttribute("onclick") || "";

            if (code.includes("'" + pageId + "'")) {
                button.classList.add("active");
            }
        });

        window.scrollTo(0, 0);
    };

});
