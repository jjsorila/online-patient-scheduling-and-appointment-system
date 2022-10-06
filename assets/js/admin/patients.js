$(document).ready(function (e) {
    let age = $("#age"),
        mi = $("#mi"),
        lname = $("#lastname"),
        fname = $("#firstname"),
        birthday = $("#birthday"),
        gender = $("#gender"),
        contact = $("#contact"),
        address = $("#address");


    //CLEAR INPUT FORM
    function clearInput() {
        age.val("")
        mi.val("")
        lname.val("")
        fname.val("")
        birthday.val("")
        gender.val("")
        contact.val("")
        address.val("")
    }
    
    //AUTO CALCULATE AGE
    function getAge(dateString) {
        var ageInMilliseconds = new Date() - new Date(dateString);
        return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365); // convert to years
    }

    birthday.on("change", function (e) {
        age.val(getAge(birthday.val()))
    })

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //INITIALIZE DATATABLE
    $("table").DataTable({
        ajax: `/admin/list/patients`,
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        order: [[0, 'asc']],
        columns: [
            {
                data: "fullname",
                orderable: false,
                render: ({ fname, lname, mi }) => {
                    return `${lname}, ${fname} ${mi}.`
                }
            },
            {
                data: "id",
                orderable: false,
                render: (data) => (`<input type="submit" data-id=${data} class='btn btn-success' value='Open'/>`)
            }
        ]
    });

    //RELOAD DATATABLE
    $("#reload").click(function (e) {
        $("table").DataTable().ajax.reload()
    })

    //LOGOUT ACCOUNT
    $("#logout").click(function (e) {
        $.ajax({
            url: '/admin/logout',
            type: 'POST',
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                location.href = '/admin/login'
            },
            error: (err) => {
                console.log(err)
                showToast("❌ Something went wrong")
            }
        })
    })

    //OPEN PATIENT INFO
    $("table").on("click", "input[type=submit]", function (e) {
        let patient_id = $(this).attr("data-id")
        location.href = `/admin/patients/${patient_id}`
    })

    //OPEN ADD PATIENT FORM
    $("#add-patient").click(function (e) {
        $(".bg-shadow").toggleClass("d-none")
    })

    //CLOSE FORM ON BG-SHADOW CLICK
    $(".bg-shadow").click(function (e) {
        $(this).toggleClass("d-none")
        clearInput()
    })
    $(".patient-form").click(function (e) {
        e.stopPropagation()
    })

    //ADD&SCHEDULE PATIENT
    $("#submit").click(function (e) {
        if (!fname.val() || !mi.val() || !lname.val() || !birthday.val() || !age.val() || !gender.val() || !contact.val() || !address.val()) return showToast("❌ Complete required fields")

        $(".loading").css("display", "block")

        $.ajax({
            url: '/admin/schedule/walk-in',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                fullname: {
                    fname: fname.val(),
                    lname: lname.val(),
                    mi: mi.val()
                },
                age: age.val(),
                birthday: birthday.val(),
                gender: gender.val(),
                contact: contact.val(),
                address: address.val()
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                $("table").DataTable().ajax.reload()
                showToast("✅ Success!")
                clearInput()
            },
            error: (err) => {
                showToast("❌ Server Error")
                console.log(err)
            },
            complete: () => {
                $(".loading").css("display", "none")
                $(".bg-shadow").toggleClass("d-none")
            }
        })
    })




})