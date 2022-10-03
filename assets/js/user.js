$(document).ready(function (e) {
    const birthdate = $("#birthdate"),
        fullname = $("#fullname"),
        email = $("#email"),
        contact = $("#contact"),
        gender = $("#gender"),
        address = $("#address"),
        dateSched = $("#date-sched"),
        id = $("meta[name=id]").attr("content"),
        patientType = $("#patient_type"),
        age = $("#age"),
        weight = $("#weight"),
        height = $("#height"),
        temperature = $("#temperature"),
        guardian = $("#guardian"),
        bloodPressure = $("#bp"),
        patientHistory = $("#patient_history");

    function getAge(dateString) {
        var ageInMilliseconds = new Date() - new Date(dateString);
        return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365);
    }

    //CALCULATE AGE
    birthdate.on("change", function (e) {
        age.val(getAge(birthdate.val()))
    })

    //DETECT INPUT UNSAVED CHANGES
    $("form input, form textarea").on("change keyup paste", function (e) {
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
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]]
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

        if (!fullname.val() || !contact.val() || !address.val() || !gender.val() || !birthdate.val() || !height.val() || !weight.val() || !age.val()) return showToast("❌ Complete all user information")

        $(".user-info .loading").css("display", "block")

        $.ajax({
            url: `/client/update/user/${id}`,
            type: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                fullname: fullname.val(),
                contact: contact.val(),
                address: address.val(),
                gender: gender.val(),
                birthdate: birthdate.val(),
                height: height.val(),
                weight: weight.val(),
                age: age.val()
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
        if (!fullname.val() || !contact.val() || !address.val() || !gender.val() || !birthdate.val()) return showToast("❌ Complete all user information")
        $(".bg-shadow-dim").toggleClass("d-none")
    })

    //CLOSE APPOINTMENT FORM
    $(".bg-shadow-dim #close").click(function (e) {
        e.stopPropagation()
        $(".bg-shadow-dim").toggleClass("d-none")
    })

    //TOGGLE PEDIA/OB
    patientType.on("change", function (e) {
        if (patientType.val() == "Pedia") {
            $(".ob").addClass("d-none").removeClass("d-block")
            $(".pedia").addClass("d-block").removeClass("d-none")
        } else if (patientType.val() == "OB") {
            $(".ob").addClass("d-block").removeClass("d-none")
            $(".pedia").addClass("d-none").removeClass("d-block")
        }
    })

    //FUNCTION SEND APPOINT REQUEST
    function sendAppointmentRequest(data) {
        $.ajax({
            url: `/client/appointments/${id}`,
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                schedule: dateSched.val(),
                "patient_type": patientType.val(),
                ...data
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
                dateSched.val("")
                location.reload()
            }
        })
    }

    //SCHEDULE APPOINTMENT
    $("#submit-sched").click(function (e) {

        if (!dateSched.val() || !patientType.val()) return showToast("❌ Set all required fields!")

        if (patientType.val() == "OB") {
            if (!bloodPressure.val() || !patientHistory.val()) return showToast("❌ Set all required fields!")

            $(".bg-shadow-dim .loading").css("display", "block")

            sendAppointmentRequest({
                bp: bloodPressure.val(),
                "patient_history": patientHistory.val()
            })

        } else if (patientType.val() == "Pedia") {
            if (!guardian.val() || !temperature.val()) return showToast("❌ Set all required fields!")

            $(".bg-shadow-dim .loading").css("display", "block")

            sendAppointmentRequest({
                guardian: guardian.val(),
                temperature: temperature.val()
            })
        }
    })
})