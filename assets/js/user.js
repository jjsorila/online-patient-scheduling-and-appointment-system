$(document).ready(function (e) {
    const birthdate = $("#birthdate"),
        fname = $("#fname"),
        lname = $("#lname"),
        mi = $("#mi"),
        contact = $("#contact"),
        gender = $("#gender"),
        address = $("#address"),
        dateSched = $("#date-sched"),
        id = $("meta[name=id]").attr("content"),
        age = $("#age");

        const gName = $("#g-name")
        const gContact = $("#g-contact")
        const gAddress = $("#g-address")
        const gRelationship = $("#g-relationship")

    function getAge(dateString) {
        var ageInMilliseconds = new Date() - new Date(dateString);
        return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365);
    }

    //DISABLE SCHEDULING ON PREVIOUS DATES
    document.getElementById("date-sched").min = new Date().toISOString().slice(0, 16);

    //CALCULATE AGE
    birthdate.on("change", function (e) {
        age.val(getAge(birthdate.val()))
    })

    //DETECT INPUT UNSAVED CHANGES
    $("form input, form textarea, form select").on("change keyup paste", function (e) {
        $("#sched").attr("disabled", true)
        $("h5.text-center").css("display", "block")
    })

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //DATA TABLE OPTIONS
    $('#appointments').DataTable({
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        'columnDefs': [{
            'targets': [-1], // column index (start from 0, -1 means all)
            'orderable': false, // set orderable false for selected columns
        }],
        ordering: false
    });

    //DISABLE DEFAULT SUBMIT ACTION FOR USER INFORMATION
    $("form").submit(function (e) {
        e.preventDefault()
    })

    //LOGOUT ACCOUNT
    $(".logout").click(function (e) {
        $.ajax({
            url: '/client/logout',
            type: 'POST',
            success: (res) => {
                if (!res.operation) return alert("Server error");
                location.href = "/client/login"
            },
            error: (err) => {
                alert(err)
            }
        })
    })

    //SAVE/UPDATE INFORMATION
    $("#save").click(function (e) {

        if (!fname.val() || !mi.val() || !lname.val() || !contact.val() || !address.val() || !gender.val() || !birthdate.val() || !age.val() || !gName.val() || !gAddress.val() || !gContact.val() || !gRelationship.val()) return showToast("❌ Complete all user information")

        $(".user-info .loading").css("display", "block")

        $.ajax({
            url: `/client/update/user/${id}`,
            type: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                fullname: {
                    fname: fname.val(),
                    mi: mi.val(),
                    lname: lname.val()
                },
                contact: contact.val(),
                address: address.val(),
                gender: gender.val(),
                birthdate: birthdate.val(),
                age: age.val(),
                guardian: {
                    name: gName.val(),
                    address: gAddress.val(),
                    contact: gContact.val(),
                    relationship: gRelationship.val()
                }
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                showToast("✅ User updated!")
            },
            error: (err) => {
                console.log(err)
            },
            complete: () => {
                $("h5.text-center").css("display", "none")
                $("#sched").attr("disabled", false)
                $(".user-info .loading").css("display", "none")
            }
        })
    })

    //OPEN APPOINTMENT FORM
    $("#sched").click(function (e) {
        if (!fname.val() || !mi.val() || !lname.val() || !contact.val() || !address.val() || !gender.val() || !birthdate.val()) return showToast("❌ Complete all user information")
        $(".bg-shadow-dim").toggleClass("d-none")
    })

    //CLOSE APPOINTMENT FORM
    $(".bg-shadow-dim #close").click(function (e) {
        e.stopPropagation()
        $(".bg-shadow-dim").toggleClass("d-none")
    })

    //SCHEDULE APPOINTMENT
    $("#submit-sched").click(function (e) {

        if (!dateSched.val()) return showToast("❌ Set date field!")

        $(".bg-shadow-dim .loading").css("display", "block")

        $.ajax({
            url: `/client/appointments/${id}`,
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                schedule: dateSched.val()
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                showToast("✅ Appointment successfully submitted")
            },
            error: (err) => {
                console.log(err)
            },
            complete: () => {
                $(".bg-shadow-dim .loading").css("display", "none")
                $(".bg-shadow-dim").toggleClass("d-none")
                location.reload()
            }
        })
    })
})