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
const action = document.querySelector(".todo_action");
const filter = document.querySelector(".todo_filter");

const set_options = function(callback, optionIndex = 0) {
    callback(optionIndex, "view", filter.options[filter.selectedIndex].value);

    [].forEach.call(options, function(option, index) {
        option.addEventListener("click", () => {
            if(index !== optionIndex) {
                option.className = "option active";
                options[optionIndex].className = "option";
                optionIndex = index;

                callback(optionIndex, "view", filter.options[filter.selectedIndex].value);
            }
        });
    });

    action.addEventListener("click", (e) => {
        callback(optionIndex, "create", filter.options[filter.selectedIndex].value);

        e.stopPropagation();
    });

    filter.addEventListener("change", (e) => {
        callback(optionIndex, "create", e.target.options[e.target.selectedIndex].value);

        e.stopPropagation();
    });
};

const set_bookmarks = function(callback, bookmarkIndex = 0) {
    [].forEach.call(bookmarks, function(bookmark, index) {
        bookmark.addEventListener("click", () => {
            if(index !== bookmarkIndex) {
                bookmark.className = "bookmark active";
                bookmarks[bookmarkIndex].className = "bookmark";
                bookmarkIndex = index;

                callback(bookmarkIndex);
            }
        });
    });
};

/* To-Do Functionality */
const workspace = document.querySelector(".workspace");

function getTodos() {
    // return fetch_requests["todos"].get_todos();
    return fetch("./../data/todos.json")
        .then(response => response.json());
}

function getUsers() {
    // return fetch_requests["users"].get_users();
    return fetch("./../data/users.json")
        .then(response => response.json());
}

function clearWorkspace(workspace) {
    while(workspace.firstChild) {
        workspace.removeChild(workspace.firstChild);
    }
}

function lerp(time1, time2) {
    return Math.min(Math.max((Date.now()-time1)/Math.abs(time2-time1)*100, 0), 100);
}

Date.prototype.monthDays = function(year, month) {
    return (new Date(year, month+1, 0)).getDate();
};

const show_todo = (function(flag, mode, action) {
    const form = document.querySelector(".form");

    const form_mode = form.querySelector("#form_mode");

    const title = form.querySelector("#title");
    const desc = form.querySelector("#description");

    const form_dates = form.getElementsByClassName("form_date");

    const creation = form.querySelector("#creation");

    const deadline = form.querySelector("#deadline");
    const deadline_calendar = form.getElementsByClassName("form_date_container")[1];
    const calendar = form.querySelector(".calendar");
    const calendar_header = form.querySelector(".calendar_header");
    const calendar_days = form.querySelector(".calendar_dn");
    const calendar_back = form.querySelector(".calendar_back");
    const calendar_next = form.querySelector(".calendar_next");

    const status = form.querySelector("#status");
    const people = form.querySelector("#people");
    const shared_with = form.querySelector(".people");

    const create_todo = form.querySelector(".create");
    const update_todo = form.querySelector(".update");
    const delete_todo = form.querySelector(".delete");

    const status_options = {
        "TODO" : 0,
        "DOING" : 1,
        "DONE" : 2
    };

    const months = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun",
        "Jul", "Aug", "Sept",
        "Oct", "Nov", "Dec"
    ];

    const days = [
        "Sunday", "Monday", "Tuesday",
        "Wednesday", "Thursday", "Friday",
        "Saturday"
    ];

    const status_options_arr = [
        "TODO", "DOING", "DONE"
    ];

    const form_event = function(data, flag, action, mode) {
        if(flag) {
            form.style.display = "none";
            calendar.style.display = "none";
            action([mode, data]);
        }

        return false;
    };

    const handle_calendar = function(date) {
        deadline.textContent = `${date.getFullYear()}-${('0' + (date.getMonth()+1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

        while(calendar_days.firstChild)
            calendar_days.removeChild(calendar_days.firstChild);

        calendar_header.textContent = (date.getDate()).toString() + " " + months[date.getMonth()] + " " + date.getFullYear().toString();

        const daysOffset = (new Date(Date.now())).getDay();
        for(let g = 0; g < daysOffset; g++) {
            calendar_days.appendChild(document.createElement("p"));
        }

        const daysInMonth = date.monthDays(date.getFullYear(), date.getMonth());
        for(let g = 1; g < daysInMonth+1; g++) {
            const day = document.createElement("p");
            day.textContent = g.toString();
            day.className = "selectable";
            day.addEventListener("click", () => {
                calendar_header.textContent = g.toString() + " " + months[date.getMonth()] + " " + date.getFullYear().toString();
                deadline.textContent = `${date.getFullYear()}-${('0' + (date.getMonth()+1)).slice(-2)}-${('0' + g).slice(-2)}`;
                calendar.style.display = "none";
            });
            calendar_days.appendChild(day);
        }
    };

    const add_person = function(person) {
        const fellow = document.createElement("div");
        const fellow_paragraph = document.createElement("p");
        const overlay = document.createElement("div");
        overlay.className = "person_overlay";
        const overlay_paragraph = document.createElement("p");
        overlay_paragraph.textContent = "X";
        overlay.appendChild(overlay_paragraph);

        fellow.className = "person";
        fellow_paragraph.textContent = person;
        fellow_paragraph.className = "person_paragraph";
        fellow.appendChild(fellow_paragraph);
        fellow.appendChild(overlay);
        shared_with.appendChild(fellow);

        fellow.addEventListener("click", (e) => {
            shared_with.removeChild(fellow);
        });
    };

    document.addEventListener("click", (e) => {
        flag = form_event(null, flag, action, "none");
    });

    form.addEventListener("click", (e) => {
        calendar.style.display = "none";

        e.stopPropagation();
    });

    form.querySelector(".form_close").addEventListener("click", (e) => {
        flag = form_event(null, flag, action, "none");
    });

    calendar_back.addEventListener("click", (e) => {
        const date = new Date(calendar_header.textContent);
        date.setMonth(date.getMonth()-1);

        handle_calendar(date);
    });

    calendar_next.addEventListener("click", (e) => {
        const date = new Date(calendar_header.textContent);
        date.setMonth(date.getMonth()+1);

        handle_calendar(date);
    });

    delete_todo.addEventListener("click", (e) => {
        flag = form_event(null, flag, action, "delete");
    });

    update_todo.addEventListener("click", (e) => {
        flag = form_event({
            "deadline": deadline.textContent,
            "title": title.value,
            "desc": desc.value,
            "status": status_options_arr[status.selectedIndex],
            "people": [].map.call(shared_with.getElementsByClassName("person_paragraph"), (person) => {
                return person.textContent;
            })
        }, flag, action, "update");
    });

    create_todo.addEventListener("click", (e) => {
        flag = form_event({
            "deadline": deadline.textContent,
            "title": title.value,
            "desc": desc.value,
            "status": status_options_arr[status.selectedIndex],
            "people": [].map.call(shared_with.getElementsByClassName("person_paragraph"), (person) => {
                return person.textContent;
            })
        }, flag, action, "create");
    });

    form.querySelector(".add_person").addEventListener("click", (e) => {
        const users = [].map.call(shared_with.getElementsByClassName("person_paragraph"), (person) => {
            return person.textContent;
        });

        if(users.every((user) => user !== people.value)) {
            add_person(people.value);
        }
    });

    deadline_calendar.addEventListener("click", (e) => {
        calendar.style.display = "flex";

        e.stopPropagation();
    });

    calendar.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    return (todo, users, mode) => {
        form.style.display = "flex";

        switch(mode) {
            case "Edit Mode" : {
                create_todo.style.display = "none";
                delete_todo.style.display = "initial";
                update_todo.style.display = "initial";

                form_dates[0].style.display = "flex";
                break;
            }
            case "Create Mode" : {
                create_todo.style.display = "initial";
                delete_todo.style.display = "none";
                update_todo.style.display = "none";

                form_dates[0].style.display = "none";
            }
        }

        form_mode.textContent = mode;

        if(todo.hasOwnProperty("title"))
            title.value = todo.title;
        else title.value = "";

        if(todo.hasOwnProperty("desc"))
            desc.value = todo.desc;
        else desc.value = "";

        if(todo.hasOwnProperty("creation"))
            creation.textContent = todo.creation;
        else creation.textContent = "";

        if(todo.hasOwnProperty("deadline")) {
            handle_calendar(new Date(todo.deadline));
        } else {
            deadline.textContent = "";
            handle_calendar(new Date(Date.now()));
        }

        if(todo.hasOwnProperty("status"))
            status.selectedIndex = status_options[todo.status];
        else status.selectedIndex = status_options["TODO"];

        if(users.length !== 0 ) {
            while(people.firstChild)
                people.removeChild(people.firstChild);

            people.value = users[0];

            users.forEach((user) => {
                const option = document.createElement("option");
                option.textContent = user;
                option.value = user;
                people.appendChild(option);
            });
        }

        while(shared_with.firstChild)
            shared_with.removeChild(shared_with.firstChild);

        if(todo.hasOwnProperty("people")) {
            todo.people.forEach((person) => {
                add_person(person);
            });
        }

        flag = true;

        let promise_action = new Promise((resolve, reject) => {
            action = resolve;
        });

        return promise_action;
    }
})(false, "create", null);

function get_current_date() {
    const date = new Date(Date.now());

    return `${date.getFullYear()}-${('0' + (date.getMonth()+1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
}

function date_compare(a, b) {
    if(a.hasOwnProperty("deadline") && b.hasOwnProperty("deadline")) {
        if (a.deadline < b.deadline)
            return -1;
        if (a.deadline > b.deadline)
            return 1;
        return 0;
    } else return -1;
}

function title_compare(a, b) {
    if(a.hasOwnProperty("title") && b.hasOwnProperty("title")) {
        if (a.title < b.title)
            return -1;
        if (a.title > b.title)
            return 1;
        return 0;
    } else return -1;
}

const manage_todos = function(todos, user, users) {
    const empty = document.querySelector(".empty");
    const task = document.querySelector(".task");

    const update_task = (task, todo) => {
        const done = (todo.hasOwnProperty("creation") && todo.hasOwnProperty("deadline")) ?
            lerp(
                (new Date(todo.creation)).getTime(),
                (new Date(todo.deadline)).getTime()
            )
            : todo.hasOwnProperty("creation") ?
                0 : 0;

        task.style.display = "flex";

        if(todo.hasOwnProperty("title"))
            task.querySelector(".task_title").textContent = todo.title;

        if(todo.hasOwnProperty("desc"))
            task.querySelector(".task_description").textContent = todo.desc;

        if(todo.hasOwnProperty("creation"))
            task.querySelector(".creation").textContent = todo.creation;
        else task.getElementsByClassName("timetable")[0].style.display = "none";

        if(todo.hasOwnProperty("deadline"))
            task.querySelector(".deadline").textContent = todo.deadline;
        else task.getElementsByClassName("timetable")[1].style.display = "none";

        task.querySelector(".task_progressbar").style.width = done + "%";
        task.querySelector(".task_progressbar").style.backgroundColor = "hsl(" + (120-(120-0)*done/100) + ", 75%, 50%)";

        if(done === 100) {
            task.querySelector(".task_progressbar").style.borderRadius = "0 0 4px 4px";
        }
    };

    const update_workspace = (optionIndex, filter) => {
        if(todos[optionIndex].length !== 0) {

            empty.style.display = "none";

            let filteredTodos = [];

            if(filter === "date") {
                filteredTodos = todos[optionIndex].sort(date_compare);
            } else if(filter === "nothing") {
                filteredTodos = todos[optionIndex];
            } else if(filter === "title") {
                filteredTodos = todos[optionIndex].sort(title_compare);
            } else {
                filteredTodos = todos[optionIndex].filter((todo) => todo.status === filter.toUpperCase());
            }

            filteredTodos.forEach((todo) => {
                const new_task = task.cloneNode(true);

                update_task(new_task, todo);

                new_task.addEventListener("click", (e) => {
                    show_todo(todo, users, "Edit Mode")
                        .then((data) => {
                            if(data[0] === "delete") {
                                workspace.removeChild(new_task);

                                todos[optionIndex].splice(todos[optionIndex].indexOf(todo), 1);

                                if(todos[optionIndex].length === 0)
                                    empty.style.display = "flex";
                            } else if(data[0] === "update") {
                                for(let property in data[1]) {
                                    if(todo.hasOwnProperty(property) && data[1].hasOwnProperty(property))
                                        todo[property] = data[1][property];
                                }

                                update_task(new_task, todo);
                            }
                        })
                        .catch((error) => console.error(error));

                    e.stopPropagation();
                });

                workspace.appendChild(new_task);
            });
        } else {
            empty.style.display = "flex";
        }
    };

    return (optionIndex, mode, filter) => {
        if(mode === "create") {
            show_todo({}, users, "Create Mode")
                .then((data) => {
                    if(data[0] === "create") {

                        todos[0].push({
                            "deadline": data[1].deadline,
                            "creation": get_current_date(),
                            "title": data[1].title,
                            "desc": data[1].desc,
                            "status": data[1].status,
                            "createdBy": user,
                            "people": data[1].people
                        });
                    }

                    clearWorkspace(workspace);

                    update_workspace(optionIndex, filter);
                })
                .catch((error) => console.error(error));
        } else {
            clearWorkspace(workspace);

            update_workspace(optionIndex, filter);
        }
    };
};

const account_name = document.querySelector(".account_name");
const account_email = document.querySelector(".account_email");

function parse_data(user, todos, users) {
    account_name.value = user._id;
    account_email.value = user.email;

    set_options(manage_todos([
        todos
            .filter((todo) => todo.createdBy === user._id),
        todos
            .filter((todo) => {
                if(todo.hasOwnProperty("people"))
                    return todo.people.some((person) => person === user._id);
                else return false;
            })
    ], user._id, users));
}

document.addEventListener('DOMContentLoaded', function () {
    Promise.all([getUsers(), getTodos()])
        .then((data) => {
            if(data[0].length !== 0) {
                parse_data(...[
                    data[0][Math.floor(Math.random()*data[0].length)],
                    data[1],
                    data[0].map((user) => user._id)
                ]);
            }
        })
        .catch(error => {
            console.error(error);
        });
});

/* Didn't finish in time, but ready to deploy it */
const fetch_requests = (function() {
    const authority = 'yourAuthorityhere';

    const api_header = 'X-API-KEY';
    const api_key_value = 'youAPIkeyhere';

    let headers = new Headers();
    headers.set(api_header, api_key_value);

    const fetch_requests = {
        "todos" : {
            "get_todo": null,
            "get_todos": null,
            "add_todo": null,
            "update_todo": null,
            "delete_todo": null
        },
        "users" : {
            "get_user" : null,
            "get_users" : null,
            "update_user" : null
        }
    };

    fetch_requests["todos"]["get_todo"] = function(_id) {
        const url = authority + 'todos/' + _id;

        return fetch(url, { method: 'GET', headers: headers })
            .then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    console.log(`Error while trying to fetch ${url}: ${response.code}`);
                }
            })
            .catch(reason => console.error(reason));
    };

    fetch_requests["todos"]["get_todos"] = function() {
        const url = authority + 'todos/';

        return fetch(url, { method: 'GET', headers: headers })
            .then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    console.log(`Error while trying to fetch ${url}: ${response.code}`);
                }
            })
            .catch(reason => console.error(reason));
    };

    fetch_requests["todos"]["add_todo"] = function(data) {
        const url = authority + 'todos/';

        return fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(data) })
            .then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    console.log(`Error while trying to fetch ${url}: ${response.code}`);
                }
            })
            .then(function(data) {
                return data;
            });
    };

    fetch_requests["todos"]["update_todo"] = function(data, _id) {
        const url = authority + 'todos/' + _id;

        return fetch(url, { method: 'PUT', headers: headers, body: JSON.stringify(data) })
            .then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    console.log(`Error while trying to fetch ${url}: ${response.code}`);
                }
            })
            .then(function(data) {
                return data;
            });
    };

    fetch_requests["todos"]["delete_todo"] = function(_id) {
        const url = authority + 'todos/' + _id;

        return fetch(url, { method: 'DELETE', headers: headers })
            .then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    console.log(`Error while trying to fetch ${url}: ${response.code}`);
                }
            })
            .then(function(data) {
                return data;
            });
    };

    fetch_requests["users"]["get_user"] = function(_id) {
        const url = authority + 'users/' + _id;

        return fetch(url, { method: 'GET', headers: headers })
            .then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    console.log(`Error while trying to fetch ${url}: ${response.code}`);
                }
            })
            .catch(reason => console.error(reason));
    };

    fetch_requests["users"]["get_users"] = function() {
        const url = authority + 'users/';

        return fetch(url, { method: 'GET', headers: headers })
            .then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    console.log(`Error while trying to fetch ${url}: ${response.code}`);
                }
            })
            .catch(reason => console.error(reason));
    };

    fetch_requests["users"]["update_user"] = function(data, _id) {
        const url = authority + 'users/' + _id;

        return fetch(url, { method: 'PUT', headers: headers, body: JSON.stringify(data) })
            .then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    console.log(`Error while trying to fetch ${url}: ${response.code}`);
                }
            })
            .catch(reason => console.error(reason));
    };

    return fetch_requests;
})();