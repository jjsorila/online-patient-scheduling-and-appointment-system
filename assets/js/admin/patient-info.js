$(document).ready(function (e) {
    const patient_id = $("meta[name=patient_id]").attr("content")
    const fname = $("#fname")
    const lname = $("#lname")
    const mi = $("#mi")
    const contact = $("#contact")
    const address = $("#address")
    const birthdate = $("#birthdate")
    const age = $("#age")
    const patient_history = $("#patient_history")
    function getAge(dateString) {
        var ageInMilliseconds = new Date() - new Date(dateString);
        return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365);
    }

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //DETECT CHANGES
    $("input, textarea").on("change paste keyup", function (e) {
        $("#schedule").attr("disabled", true)
        $(".unsaved-changes").css("display", "block")
    })

    //AUTO CALCULATE AGE
    birthdate.on("change", function (e) {
        age.val(getAge(birthdate.val()))
    })

    //INITIALIZE DATA TABLE
    $("table").DataTable({
        ajax: `/admin/patient/medical-records/${patient_id}`,
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        columns: [
            {
                data: "ailment",
                orderable: false,
                render: ({ diagnosis, description }) => {
                    return `${diagnosis}`
                }
            },
            {
                data: "date_created",
                orderable: false,
            },
            {
                data: "mr_id",
                orderable: false,
                render: (mr_id) => (`<input type="submit" class="btn btn-success" data-id=${mr_id} id="open-record" value="Open"/>`)
            }
        ]
    });

    //SAVE/UPDATE USER INFORMATION
    $("#save").click(function (e) {
        if (!fname.val() || !mi.val() || !lname.val() || !contact.val() || !address.val() || !birthdate.val() || !age.val() || !patient_history.val()) return showToast("❌ Complete required fields")

        $(".loading").css("display", "block")

        $.ajax({
            url: '/admin/patient/update',
            type: 'PUT',
            header: {
                'Content-Type': 'application/json'
            },
            data: {
                fullname: {
                    fname: fname.val(),
                    mi: mi.val(),
                    lname: lname.val()
                },
                contact: contact.val(),
                address: address.val(),
                birthdate: birthdate.val(),
                age: age.val(),
                patient_history: patient_history.val(),
                id: patient_id
            },
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                showToast("✅ Updated Successfully")
            },
            error: (err) => {
                showToast("❌ Server error")
                console.log(err)
            },
            complete: () => {
                $(".loading").css("display", "none")
                $("#schedule").attr("disabled", false)
                $(".unsaved-changes").css("display", "none")
            }
        })
    })

    //SCHEDULE PATIENT
    $("#schedule").click(function(e) {
        if (!fname.val() || !mi.val() || !lname.val() || !contact.val() || !address.val() || !birthdate.val() || !age.val() || !patient_history.val()) return showToast("❌ Complete required fields")

        $(".loading").css("display", "block")

        $.ajax({
            url: `/admin/schedule/walk-in/${patient_id}`,
            type: 'PUT',
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                showToast("✅ Scheduled Successfully")
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