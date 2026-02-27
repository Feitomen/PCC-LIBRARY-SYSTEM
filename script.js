// ===============================
// STORAGE FUNCTIONS
// ===============================

function getData(key){
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key,value){
    localStorage.setItem(key, JSON.stringify(value));
}

function getLoggedUser(){
    return JSON.parse(localStorage.getItem("loggedInUser"));
}

function setLoggedUser(user){
    localStorage.setItem("loggedInUser", JSON.stringify(user));
}

function logout(){
    localStorage.removeItem("loggedInUser");
}

// ===============================
// AUTH PAGE (index.html)
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    if (!document.getElementById("loginForm")) return;

    // Get elements safely
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");

    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const loginRole = document.getElementById("loginRole");
    const registerRole = document.getElementById("registerRole");

    const loginUsername = document.getElementById("loginUsername");
    const loginPassword = document.getElementById("loginPassword");

    const regUsername = document.getElementById("regUsername");
    const regPassword = document.getElementById("regPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const program = document.getElementById("program");

    // Toggle forms
    showRegister.onclick = () => {
        loginSection.classList.remove("active");
        registerSection.classList.add("active");
    };

    showLogin.onclick = () => {
        registerSection.classList.remove("active");
        loginSection.classList.add("active");
    };

    // Role buttons
    document.querySelectorAll(".role-btn").forEach(btn => {
        btn.addEventListener("click", function () {

            const parent = this.closest(".form-section");

            parent.querySelectorAll(".role-btn")
                .forEach(b => b.classList.remove("active"));

            this.classList.add("active");

            if (parent.id === "loginSection") {
                loginRole.value = this.dataset.role;
            } else {
                registerRole.value = this.dataset.role;
            }
        });
    });

    // REGISTER
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = regUsername.value.trim();
        const password = regPassword.value;
        const confirm = confirmPassword.value;
        const role = registerRole.value;
        const prog = program.value;

        if (!role) return alert("Select role");
        if (password !== confirm) return alert("Passwords do not match");

        let users = getData("users");

        if (users.find(u => u.username === username)) {
            return alert("User already exists");
        }

        users.push({
            username: username,
            password: password,
            role: role,
            program: prog
        });

        setData("users", users);

        alert("Registration Successful!");
        showLogin.click();
        registerForm.reset();
    });

    // LOGIN
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = loginUsername.value.trim();
        const password = loginPassword.value;
        const role = loginRole.value;

        if (!role) return alert("Select role");

        const users = getData("users");

        const user = users.find(u =>
            u.username === username &&
            u.password === password &&
            u.role === role
        );

        if (!user) return alert("Invalid credentials");

        setLoggedUser(user);
        window.location.href = "dashboard.html";
    });

    // PASSWORD STRENGTH
    regPassword.addEventListener("input", function () {
        let val = this.value;
        let bar = document.querySelector(".strength-bar");
        let strength = 0;

        if (val.length > 5) strength++;
        if (/[A-Z]/.test(val)) strength++;
        if (/[0-9]/.test(val)) strength++;
        if (/[@$!%*?&]/.test(val)) strength++;

        if (strength <= 1) bar.style.cssText = "width:25%;background:red;";
        else if (strength == 2) bar.style.cssText = "width:50%;background:orange;";
        else if (strength == 3) bar.style.cssText = "width:75%;background:gold;";
        else bar.style.cssText = "width:100%;background:green;";
    });

});

// ===============================
// DASHBOARD PAGES
// ===============================

if (typeof $ !== "undefined") {

    $(document).ready(function(){

        const user = getLoggedUser();
        if(!user){
            window.location.href="index.html";
            return;
        }

        $("#userRoleBadge").text(user.role);

        const books = getData("books");
        const borrowed = getData("borrowed");
        const users = getData("users");

        if($("#totalBooks").length){
            $("#totalBooks").text(books.length);
            $("#borrowedCount").text(borrowed.length);
            $("#totalUsers").text(users.length);

            renderCharts();
        }

        $("#bookForm").submit(function(e){
            e.preventDefault();

            books.push({
                title: $("#bookTitle").val(),
                author: $("#bookAuthor").val(),
                category: $("#bookCategory").val()
            });

            setData("books",books);
            alert("Book Added!");
            this.reset();
        });

        if($("#borrowTable").length){
            borrowed.forEach(b=>{
                $("#borrowTable").append(`
                    <tr>
                        <td>${b.title}</td>
                        <td>${b.user}</td>
                    </tr>
                `);
            });
        }

        $("#logout").click(function(){
            logout();
            window.location.href="index.html";
        });

    });

}


// ===============================
// CHARTS
// ===============================

function renderCharts(){

    const books = getData("books");
    const borrowed = getData("borrowed");

    const categories = {};
    books.forEach(b=>{
        categories[b.category]=(categories[b.category]||0)+1;
    });

    const labels = Object.keys(categories);
    const values = Object.values(categories);

new Chart(document.getElementById("lineChart"), {
    type: "bar",
    data: {
        labels: labels,
        datasets: [{
            label: "Books per Category",
            data: values,
            backgroundColor: [
                "rgba(255, 99, 132, 0.5)",
                "rgba(255, 159, 64, 0.5)",
                "rgba(255, 205, 86, 0.5)",
                "rgba(75, 192, 192, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(153, 102, 255, 0.5)",
                "rgba(201, 203, 207, 0.5)"
            ],
            borderColor: [
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(201, 203, 207)"
            ],
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top"
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "#e5e5e5"
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});

    new Chart(document.getElementById("pieChart"),{
        type:"doughnut",
        data:{
            labels:["Available","Borrowed"],
            datasets:[{
                data:[books.length-borrowed.length,borrowed.length],
                backgroundColor:["#2ecc71","#e74c3c"]
            }]
        },
        options:{
            responsive:true
        }
    });

}
