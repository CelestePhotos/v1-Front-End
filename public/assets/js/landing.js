const cookies = document.cookie
if (cookies.includes("token=")) {
    const mainDiv = document.getElementById('mainDiv');
    const login = document.getElementById("login")
    const register = document.getElementById("register")
    const dashboard = document.getElementById("dashboard")
    mainDiv.removeChild(login);
    mainDiv.removeChild(register);
    dashboard.style.display = "inline";
}