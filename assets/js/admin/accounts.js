$(document).ready(function (e) {
    const dName = $("#dName")
    const dLicense = $("#dLicense")
    const dSpecialty = $("#dSpecialty")
    const dUsername = $("#dUsername")
    const dPassword = $("#dPassword")
    const doctorId = $("#doctor-id")
    const dGender = $("#dGender")

    $("#dGender,#dSpecialty").select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center',
        placeholder: "Select option"
    })
    $("span.select2").addClass("border border-4 border-dark rounded text-center w-100")

    //CLEAR INPUT
    function clearInput() {
        dName.val("")
        dLicense.val("")
        dUsername.val("")
        dPassword.val("")
        dSpecialty.val("").trigger("change")
        dGender.val("").trigger("change")
    }

    //INITIALIZE LIST OF DOCTORS TABLE
    $("table").DataTable({
        ajax: `/admin/doctors`,
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        order: [[0, 'asc']],
        columns: [
            {
                data: "fullname",
                orderable: false
            },
            {
                data: "license_number",
                orderable: false
            },
            {
                data: "specialty",
                orderable: false
            },
            {
                data: "admin_id",
                orderable: false,
                render: (id) => {
                    return `<input type="submit" data-id=${id} class="btn btn-danger" id="delete" value="DELETE"/>`
                }
            }
        ]
    });

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //CLOSE ADD ACCOUNT FORM
    $(".bg-shadow").click(function (e) {
        $(this).toggleClass("d-none")
        clearInput()
    })
    $(".add-account-form").click(function (e) {
        e.stopPropagation()
    })

    //SHOW ADD ACCOUNT FORM
    $("#showForm").click(function (e) {
        $(".bg-shadow").toggleClass("d-none")
    })

    //DELETE DOCTOR'S ACCOUNT
    $("table").on("click", "#delete", function (e) {
        $(".confirmation-shadow").toggleClass("d-none")
        doctorId.val($(this).attr("data-id"))
    })
    $("#yes").click(function (e) {
        const admin_id = doctorId.val()

        $(".loading").css("display", "block")

        $.ajax({
            url: '/admin/doctors',
            type: 'DELETE',
            headers: {
                "Content-Type": 'application/json'
            },
            data: JSON.stringify({
                admin_id: admin_id
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                $("table").DataTable().ajax.reload()
                showToast("✅ Deleted successfully")
            },
            error: (err) => {
                showToast("❌ Server error")
                console.log(err)
            },
            complete: () => {
                $(".loading").css("display", "none")
                $(".confirmation-shadow").toggleClass("d-none")
            }
        })
    })
    $("#no").click(function (e) {
        $(".confirmation-shadow").toggleClass("d-none")
    })

    //ADD DOCTOR ACCOUNT
    $("#add").click(function (e) {
        if (!dName.val() || !dLicense.val() || !dSpecialty.val() || !dGender.val() || !dUsername.val() || !dPassword.val()) return showToast("❌ Complete all fields")

        $(".loading").css("display", "block")

        $.ajax({
            url: '/admin/doctors',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                fullname: dName.val(),
                specialty: dSpecialty.val(),
                license_number: dLicense.val(),
                username: dUsername.val(),
                password: dPassword.val(),
                gender: dGender.val()
            }),
            success: (res) => {
                if (!res.operation) return showToast(res.msg)
                $("table").DataTable().ajax.reload()
                $(".bg-shadow").toggleClass("d-none")
                showToast("✅ Added successfully")
                clearInput()
            },
            error: (err) => {
                showToast("❌ Server error")
                console.log(err)
            },
            complete: () => {
                $(".loading").css("display", "none")
            }
        })
    })
})