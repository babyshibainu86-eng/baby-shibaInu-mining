/* =========================================================
   BABY SHIBA INU
   STORAGE SYSTEM - V1
   Standalone Module
   ========================================================= */

const BabyShibaStorage = (() => {

    const STORAGE_KEY = "babyShibaPlayerData_v1";

    function save(player) {

        if (!player) {
            return false;
        }

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(player)
            );

            return true;

        } catch (error) {

            console.error(
                "Baby Shiba Storage Save Error:",
                error
            );

            return false;
        }
    }

    function load() {

        try {

            const savedData =
                localStorage.getItem(STORAGE_KEY);

            if (!savedData) {
                return null;
            }

            return JSON.parse(savedData);

        } catch (error) {

            console.error(
                "Baby Shiba Storage Load Error:",
                error
            );

            return null;
        }
    }

    function exists() {

        return localStorage.getItem(STORAGE_KEY) !== null;
    }

    function clear() {

        localStorage.removeItem(STORAGE_KEY);
    }

    function exportData(player) {

        if (!player) {
            return null;
        }

        return JSON.stringify(
            player,
            null,
            2
        );
    }

    return {

        save,
        load,
        exists,
        clear,
        exportData,

        key: STORAGE_KEY
    };

})();

/* Make module available globally */
window.BabyShibaStorage = BabyShibaStorage;
