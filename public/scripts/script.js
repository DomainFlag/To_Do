/* Settings Functionality */
(function(settings, flag) {
    document.addEventListener("click", (e) => {
        if(flag) {
            settings.className = "settings slide_left_out";
            flag = !flag;
        }
    });

    document.querySelector(".account").addEventListener("click", (e) => {
        if(!flag) {
            settings.className = "settings slide_left_in";
            flag = !flag;
        }
        e.stopPropagation();
    });

    document.querySelector(".settings_back").addEventListener("click", (e) => {
        if(flag) {
            settings.className = "settings slide_left_out";
            flag = !flag;
        }
    });

    settings.addEventListener("click", (e) => {
        e.stopPropagation();
    });
})(document.querySelector(".settings"), false);

/* Header Functionality */
const options = document.getElementsByClassName("option");
const bookmarks = document.getElementsByClassName("bookmark");

(function(optionIndex, bookmarkIndex) {
    [].forEach.call(options, function(option, index) {
        option.addEventListener("click", () => {
            if(index !== optionIndex) {
                option.className = "option active";
                options[optionIndex].className = "option";
                optionIndex = index;
            }
        });
    });

    [].forEach.call(bookmarks, function(bookmark, index) {
        bookmark.addEventListener("click", () => {
            if(index !== bookmarkIndex) {
                bookmark.className = "bookmark active";
                bookmarks[bookmarkIndex].className = "bookmark";
                bookmarkIndex = index;
            }
        });
    });
})(...[0, 0]);

/* To-Do Functionality */
function getTodos() {
    return fetch("./../data/todos.json")
        .then(response => response.json())
}

function getUsers() {
    return fetch("./../data/users.json")
        .then(response => response.json())
}

function parse_data(user, todos) {
    console.log(
        todos
            .filter((todo) => todo.createdBy === user)
    );
}

document.addEventListener('DOMContentLoaded', function () {
    Promise.all([getUsers(), getTodos()])
        .then((data) => {
            if(data[0].length !== 0) {
                parse_data(...[
                    data[0][Math.floor(Math.random()*data[0].length)]._id.toLowerCase(),
                    data[1]
                ]);
            }
        })
        .catch(error => {
            console.error(error);
        });
});

