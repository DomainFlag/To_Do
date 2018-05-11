/* Settings Functionality */
const settings = document.querySelector(".settings");
const account = document.querySelector(".account");
const back = document.querySelector(".settings_back");

(function(flag) {
    document.addEventListener("click", (e) => {
        if(flag) {
            settings.className = "settings slide_left_out";
            flag = !flag;
        }
    });

    account.addEventListener("click", (e) => {
        if(!flag) {
            settings.className = "settings slide_left_in";
            flag = !flag;
        }
        e.stopPropagation();
    });

    back.addEventListener("click", (e) => {
        if(flag) {
            settings.className = "settings slide_left_out";
            flag = !flag;
        }
    });

    settings.addEventListener("click", (e) => {
        e.stopPropagation();
    });
})(false);