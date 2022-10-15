$(document).ready(function (e) {
    let age = $("#age"),
        mi = $("#mi"),
        lname = $("#lastname"),
        fname = $("#firstname"),
        birthday = $("#birthday"),
        gender = $("#gender"),
        contact = $("#contact"),
        address = $("#address"),
        gName = $("#g-name"),
        gContact = $("#g-contact"),
        gAddress = $("#g-address"),
        gRelationship = $("#g-relationship"),
        patient_type = $("#patient_type"),
        hiddenPatientId = $("#hidden-patient-id");

    setInterval(() => {
        $("table").DataTable().ajax.reload()
    }, 5000)

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
        gName.val("")
        gContact.val("")
        gAddress.val("")
        gRelationship.val("")
        patient_type.val("Choose")
        hiddenPatientId.val("")
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
                data: "address",
                orderable: false,
            },
            {
                data: "contact",
                orderable: false
            },
            {
                data: "birthdate",
                orderable: false
            },
            {
                data: "id",
                orderable: false,
                render: (data) => (`
                <input type="submit" data-id=${data} class='btn btn-success' value='Open'/>
                <input type="submit" data-id=${data} class='btn btn-primary' value='Schedule'/>
                `)
            }
        ]
    });

    //OPEN PATIENT INFO
    $("table").on("click", "input[value=Open]", function (e) {
        const patient_id = $(this).attr("data-id")
        location.href = `/admin/patients/${patient_id}`
    })

    //SCHEDULE PATIENT
    $("table").on("click", "input[value=Schedule]", function (e) {
        const patient_id = $(this).attr("data-id")
        hiddenPatientId.val(patient_id)
        $(".bg-shadow-sched").toggleClass("d-none")
    })
    $(".bg-shadow-sched").click(function (e) {
        $(".bg-shadow-sched").toggleClass("d-none")
        clearInput()
    })
    $(".schedule-form").click(function (e) {
        e.stopPropagation()
    })
    $("#schedule").click(function (e) {
        if (!patient_type.val() || patient_type.val() == "Choose") return showToast("❌ Choose patient type")

        $(".loading").css("display", "block")
        $.ajax({
            url: '/admin/schedule/walk-in',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                patient_id: hiddenPatientId.val(),
                patient_type: patient_type.val()
            }),
            success: (res) => {
                showToast("✅ Scheduled successfully")
                clearInput()
            },
            error: (err) => {
                console.log(err)
                showToast("❌ Server error")
            },
            complete: () => {
                $(".loading").css("display", "none")
                $(".bg-shadow-sched").toggleClass("d-none")
                clearInput()
            }
        })
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

    //ADD PATIENT
    $("#submit").click(function (e) {
        if (!fname.val() || !mi.val() || !lname.val() || !birthday.val() || !age.val() || !gender.val() || !contact.val() || !address.val()) return showToast("❌ Complete required fields")

        $(".loading").css("display", "block")

        $.ajax({
            url: '/admin/patients/new',
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
                address: address.val(),
                guardian: {
                    name: gName.val(),
                    address: gAddress.val(),
                    contact: gContact.val(),
                    relationship: gRelationship.val()
                }
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