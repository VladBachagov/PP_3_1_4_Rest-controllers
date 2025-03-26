const userurl = `http://localhost:8080/api/user`;

async function loadUserInfo() {
    try {
        const response = await fetch(userurl, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const user = await response.json();

        console.log("Полученные данные пользователя:", user);

        document.getElementById("navbar-username").textContent = user.email;
        document.getElementById("navbar-roles").textContent = user.roles.map(role => role.name.replace("ROLE_", "")).join(', ');

        getInformationAboutUser(user);

    } catch (error) {
        console.error("Ошибка при загрузке данных пользователя:", error);
    }
}

function getInformationAboutUser(user) {
    const tableBody = document.getElementById('usertbody');
    let roles = user.roles.map(role => role.name.replace("ROLE_", "")).join(', ');

    tableBody.innerHTML = `
        <tr>
            <td>${user.id}</td>
            <td>${user.firstname}</td>
            <td>${user.lastname}</td>
            <td>${user.age}</td>
            <td>${user.email}</td>
            <td>${roles}</td>
        </tr>`;
}

loadUserInfo();