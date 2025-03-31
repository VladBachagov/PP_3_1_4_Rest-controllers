const URL = "http://localhost:8080/api/admin/users";
const ROLES_URL = "http://localhost:8080/api/admin/roles";
let roleList = [];

$(document).ready(function () {
    loadRoles().then(() => {
        getAllUsers();
    });
});

function loadRoles() {
    return fetch(ROLES_URL)
        .then(response => response.json())
        .then(roles => {
            roleList = roles;
            initRoleSelects();
        })
        .catch(err => {
            console.error("Error loading roles:", err);
            showErrorAlert("Error loading roles. Please try again later.");
        });
}

function initRoleSelects() {
    $('select[name="roles"]').each(function () {
        $(this).empty();
        roleList.forEach(role => {
            const roleName = role.name.replace("ROLE_", "");
            $(this).append(`<option value="${role.id}">${roleName}</option>`);
        });
    });
}

function getAllUsers() {
    $('.users-table').empty();
    fetch(URL)
        .then(response => response.json())
        .then(users => {
            if (users.length === 0) {
                $('.users-table').html('<tr><td colspan="8">No users found</td></tr>');
                return;
            }
            users.forEach(user => {
                const roles = user.roles.map(r => r.name.replace('ROLE_', '')).join(", ");
                $('.users-table').append(`
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.firstname}</td>
                        <td>${user.lastname}</td>
                        <td>${user.age}</td>
                        <td>${user.email}</td>
                        <td>${roles}</td>
                        <td>
                            <button class="btn btn-info" onclick="showEditModal(${user.id})">Edit</button>
                        </td>
                        <td>
                            <button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                        </td>
                    </tr>
                `);
            });
        })
        .catch(err => {
            console.error("Error loading users:", err);
            showErrorAlert("Error loading users. Please try again later.");
        });
}

function deleteUser(id) {
    // Получаем данные пользователя
    fetch(`${URL}/${id}`)
        .then(response => response.json())
        .then(user => {

            const deleteForm = document.getElementById('delete-form');

            deleteForm.querySelector('[name="id"]').value = user.id;
            deleteForm.querySelector('[name="firstname"]').value = user.firstname;
            deleteForm.querySelector('[name="lastname"]').value = user.lastname;
            deleteForm.querySelector('[name="age"]').value = user.age;
            deleteForm.querySelector('[name="email"]').value = user.email;

            const rolesSelect = deleteForm.querySelector('[name="roles"]');
            rolesSelect.innerHTML = '';
            user.roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.id;
                option.textContent = role.name.replace('ROLE_', '');
                rolesSelect.appendChild(option);
            });
            const deleteModal = new bootstrap.Modal(document.querySelector('.delete-modal'));
            deleteModal.show();
            document.getElementById('confirm-delete-btn').onclick = function () {
                fetch(`${URL}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                    .then(response => {
                        if (response.ok) {
                            showSuccessAlert("User deleted successfully");
                            getAllUsers(); // Обновляем таблицу
                        } else {
                            throw new Error("Error deleting user");
                        }
                    })
                    .catch(err => {
                        console.error("Error:", err);
                        showErrorAlert(err.message || "Error deleting user");
                    })
                    .finally(() => {
                        deleteModal.hide();
                    });
            };
        })
        .catch(err => {
            console.error("Error loading user data:", err);
            showErrorAlert("Error loading user data");
        });
}

function showEditModal(id) {
    fetch(`${URL}/${id}`)
        .then(response => response.json())
        .then(user => {
            $('#edit-form [name="id"]').val(user.id);
            $('#edit-form [name="firstname"]').val(user.firstname);
            $('#edit-form [name="lastname"]').val(user.lastname);
            $('#edit-form [name="age"]').val(user.age);
            $('#edit-form [name="email"]').val(user.email);
            $('#edit-form [name="password"]').val('');

            const rolesSelect = $('#edit-form [name="roles"]');
            rolesSelect.val(null);
            user.roles.forEach(role => {
                rolesSelect.find(`option[value="${role.id}"]`).prop('selected', true);
            });

            $('.edit-modal').modal('show');
        })
        .catch(err => {
            console.error("Error loading user:", err);
            showErrorAlert("Error loading user data");
        });
}


function validateUserForm(formData, isEdit = false) {
    const errors = [];
    resetValidation();

    if (!formData.firstname || formData.firstname.length < 2 || formData.firstname.length > 30) {
        errors.push("Firstname must be between 2 and 30 characters");
        $('#edit-form [name="firstname"], #new-user-form [name="firstname"]').addClass('is-invalid');
    }

    if (!formData.lastname || formData.lastname.length < 2 || formData.lastname.length > 30) {
        errors.push("Lastname must be between 2 and 30 characters");
        $('#edit-form [name="lastname"], #new-user-form [name="lastname"]').addClass('is-invalid');
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 0 || age > 120) {
        errors.push("Age must be between 0 and 120");
        $('#edit-form [name="age"], #new-user-form [name="age"]').addClass('is-invalid');
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push("Please enter a valid email");
        $('#edit-form [name="email"], #new-user-form [name="email"]').addClass('is-invalid');
    }

    if (!isEdit && (!formData.password || formData.password.length < 3)) {
        errors.push("Password must be at least 3 characters long");
        $('#edit-form [name="password"], #new-user-form [name="password"]').addClass('is-invalid');
    }

    if (!formData.roleIds || formData.roleIds.length === 0) {
        errors.push("Please select at least one role");
        $('#edit-form [name="roles"], #new-user-form [name="roles"]').addClass('is-invalid');
    }

    return errors;
}

function resetValidation() {
    $('.is-invalid').removeClass('is-invalid');
}

function showErrorAlert(message) {
    alert(`Error: ${message}`);
}

function showSuccessAlert(message) {
    alert(`Success: ${message}`);
}

$('#edit-form').submit(function (e) {
    e.preventDefault();

    const formData = {
        id: $(this).find('[name="id"]').val(),
        firstname: $(this).find('[name="firstname"]').val(),
        lastname: $(this).find('[name="lastname"]').val(),
        age: $(this).find('[name="age"]').val(),
        email: $(this).find('[name="email"]').val(),
        password: $(this).find('[name="password"]').val(),
        roleIds: $(this).find('[name="roles"]').val()
    };

    const errors = validateUserForm(formData, true);
    if (errors.length > 0) {
        showErrorAlert(errors.join("\n"));
        return;
    }

    fetch(URL, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (response.ok) {
                showSuccessAlert("User updated successfully");
                getAllUsers();
                $('.edit-modal').modal('hide');
            } else if (response.status === 400) {
                return response.json().then(err => {
                    throw new Error(err.message || "Validation error");
                });
            } else {
                throw new Error("Error updating user");
            }
        })
        .catch(err => {
            console.error("Error:", err);
            showErrorAlert(err.message || "An error occurred while updating user");
        });
});

$('#new-user-form').submit(function (e) {
    e.preventDefault();

    const formData = {
        firstname: $(this).find('[name="firstname"]').val(),
        lastname: $(this).find('[name="lastname"]').val(),
        age: $(this).find('[name="age"]').val(),
        email: $(this).find('[name="email"]').val(),
        password: $(this).find('[name="password"]').val(),
        roleIds: $(this).find('[name="roles"]').val()
    };

    const errors = validateUserForm(formData);
    if (errors.length > 0) {
        showErrorAlert(errors.join("\n"));
        return;
    }

    fetch(URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (response.ok) {
                showSuccessAlert("User created successfully");
                $(this)[0].reset();
                getAllUsers();
                $('#users-table-tab').tab('show');
            } else if (response.status === 400) {
                return response.json().then(err => {
                    throw new Error(err.message || "Validation error");
                });
            } else {
                throw new Error("Error creating user");
            }
        })
        .catch(err => {
            console.error("Error:", err);
            showErrorAlert(err.message || "An error occurred while creating user");
        });
});

function newUser() {
    $('#new-user-form')[0].reset();
    $('#new-user [name="roles"]').val(null);
    resetValidation();
    $('#new-user-tab').tab('show');
}