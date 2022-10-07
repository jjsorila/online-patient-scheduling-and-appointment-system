$(document).ready(function (e) {
    const apt_id = $("meta[name=apt_id]").attr("content");
    const patient_id = $("meta[name=patient_id]").attr("content")
    const fname = $("#fname");
    const mi = $("#mi");
    const contact = $("#contact")
    const lname = $("#lname");
    const birthdate = $("#birthdate");
    const age = $("#age");
    const address = $("#address");
    const patient_history = $("#patient_history");
    const patient_type = $("#patient_type");
    const guardian = $("#guardian"); // NOT REQUIRED
    const temperature = $("#temperature"); // NOT REQUIRED
    const bp = $("#bp"); // NOT REQUIRED
    const weight = $("#weight"); // NOT REQUIRED
    const height = $("#height"); // NOT REQUIRED
    const diagnosis = $("#diagnosis");
    const description = $("#description");
    function getAge(dateString) {
        var ageInMilliseconds = new Date() - new Date(dateString);
        return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365);
    }

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    birthdate.on("change", function(e) {
        age.val(getAge(birthdate.val()))
    })

    //ADD NEW MEDICAL RECORD
    $("#save").click(function(e) {

        $(".loading").css("display", "block")
        $.ajax({
            url: `/admin/med-record/add/${apt_id}`,
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                fullname: {
                    fname: fname.val(),
                    mi: mi.val(),
                    lname: lname.val()
                },
                birthdate: birthdate.val(),
                age: age.val(),
                address: address.val(),
                contact: contact.val(),
                patient_history: patient_history.val(),
                patient_type: patient_type.val(),
                guardian: guardian.val(),
                temperature: temperature.val(),
                bp: bp.val(),
                height: height.val(),
                weight: weight.val(),
                ailment: {
                    diagnosis: diagnosis.val(),
                    description: description.val()
                },
                patient_id: patient_id
            }),
            success: (res) => {
                if(!res.operation) return showToast("❌ Something went wrong")
                showToast("✅ Record Added Successfully")
                location.href = "/admin/scheduled"
            },
            error: (err) => {
                console.log(err)
                return showToast("❌ Server error")
            },
            complete: () => {
                $(".loading").css("display", "none")
            }
        })

    })

})