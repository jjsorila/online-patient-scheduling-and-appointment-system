$(document).ready(function (e) {
    const patient_id = $("meta[name=patient_id]").attr("content")
    const fname = $("#fname")
    const lname = $("#lname")
    const gender = $("#gender")
    const mi = $("#mi")
    const contact = $("#contact")
    const address = $("#address")
    const birthdate = $("#birthdate")
    const gName = $("#g-name")
    const gContact = $("#g-contact")
    const gAddress = $("#g-address")
    const gRelationship = $("#g-relationship")
    const age = $("#age")
    const patient_history = $("#patient_history")
    function getAge(dateString) {
        var ageInMilliseconds = new Date() - new Date(dateString);
        return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365);
    }

    gender.select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center',
        placeholder: 'Select'
    })
    $("span.select2").addClass("border border-4 border-dark rounded text-center")

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

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
                render: ({ diagnosis, description }) => {
                    return `${diagnosis}`
                }
            },
            {
                data: "date_created",
            },
            {
                data: "mr_id",
                render: (mr_id) => (`<input type="submit" class="btn btn-success" data-id=${mr_id} id="open-record" value="Open"/>`)
            }
        ],
        ordering: false
    });

    //SAVE/UPDATE USER INFORMATION
    $("#save").click(function (e) {
        if (!fname.val() || !mi.val() || !lname.val() || !contact.val() || !address.val() || !birthdate.val() || !age.val()) return showToast("❌ Complete required fields")
        $(".confirmation-shadow").toggleClass("d-none")
    })
    $("#yes").click(function (e) {
        $(".loading").css("display", "block")

        $.ajax({
            url: '/admin/patient/update',
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
                birthdate: birthdate.val(),
                age: age.val(),
                patient_history: patient_history.val(),
                id: patient_id,
                gender: gender.val(),
                guardian: {
                    name: gName.val(),
                    address: gAddress.val(),
                    contact: gContact.val(),
                    relationship: gRelationship.val()
                }
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                showToast("✅ Updated Successfully")
                $(window).off('beforeunload');
                $("input:not(#email):not(#username),textarea,select").prop("disabled", true)
                $("#edit").toggleClass("d-none")
                $("#save").toggleClass("d-none")
            },
            error: (err) => {
                showToast("❌ Server error")
                console.log(err)
            },
            complete: () => {
                $(".confirmation-shadow").toggleClass("d-none")
                $(".loading").css("display", "none")
                $(".unsaved-changes").css("display", "none")
            }
        })
    })
    $("#no").click(function (e) {
        $(".confirmation-shadow").toggleClass("d-none")
    })


    //ENABLE EDIT MODE
    $("#edit").click(function (e) {
        $("input:not(#email):not(#username),textarea,select").prop("disabled", false)
        $("#edit").toggleClass("d-none")
        $("#save").toggleClass("d-none")
        $(window).on('beforeunload', function (e) {
            return "You have unsaved changes"
        });
    })

    //OPEN MEDICAL RECORD
    $("table").on("click", "input[type=submit]", function (e) {
        const mr_id = $(this).attr("data-id");
        location.href = `/admin/patients/${patient_id}/${mr_id}`
    })
})