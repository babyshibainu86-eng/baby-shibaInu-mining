document.addEventListener("DOMContentLoaded", function () {

    console.log("BABY SHIBA APP LOADED");

    const startButton = document.getElementById("startGame");
    const introPage = document.getElementById("introPage");
    const gameApp = document.getElementById("gameApp");

    if (!startButton) {
        alert("ERROR: startGame not found");
        return;
    }

    startButton.addEventListener("click", function () {

        console.log("START CLICKED");

        introPage.classList.remove("active");
        gameApp.classList.remove("hidden");

    });

});
