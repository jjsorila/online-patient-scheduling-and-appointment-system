$(document).ready(function (e) {
    const mr_id = $("meta[name=mr_id]").attr("content");
    const patient_id = $("meta[name=patient_id]").attr("content");
    const birthdate = $("#birthdate");
    const age = $("#age");
    const patient_history = $("#patient_history");
    const temperature = $("#temperature");
    const bp = $("#bp");
    const weight = $("#weight");
    const height = $("#height");
    const diagnosis = $("#diagnosis");
    const description = $("#description");
    function getAge(dateString) {
        var ageInMilliseconds = new Date() - new Date(dateString);
        return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365);
    }


    //AUTO CALCULATE AGE
    birthdate.on("change", function (e) {
        age.val(getAge(birthdate.val()))
    })

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //DETECT CHANGES
    $("input, textarea").on("change keyup paste", function(e) {
        $(window).on('beforeunload', function(e) {
            return "You have unsaved changes"
        });
    })

    //UPDATE MEDICAL RECORD
    $("#save").click(function (e) {
        $(".confirmation-shadow").toggleClass("d-none")
    })
    $("#yes").click(function(e) {
        $(".loading").css("display", "block")

        $.ajax({
            url: `/admin/med-record/update/${mr_id}`,
            type: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                patient_history: patient_history.val(),
                patient_id: patient_id,
                temperature: temperature.val(),
                bp: bp.val(),
                height: height.val(),
                weight: weight.val(),
                ailment: {
                    diagnosis: diagnosis.val() || "Not Set",
                    description: description.val()
                }
            }),
            success: (res) => {
                if(!res.operation) return showToast("❌ Something went wrong")
                showToast("✅ Updated Successfully")
                $(".confirmation-shadow").toggleClass("d-none")
                $(window).off('beforeunload');
            },
            error: (err) => {
                console.log(err)
                showToast("❌ Server error")
            },
            complete: () => {
                $(".loading").css("display", "none")
            }
        })
    })
    $("#no").click(function(e) {
        $(".confirmation-shadow").toggleClass("d-none")
    })

    //PRINT MEDICAL RECORD
    $("#print").click(function(e) {
        $(".patient-history").text(`History: ${patient_history.val()}`)
        $(".patient-weight").text(`Weight: ${weight.val()}`)
        $(".patient-height").text(`Height: ${height.val()}`)
        $(".patient-temp").text(`Temeprature: ${temperature.val()}`)
        $(".patient-bp").text(`Blood Pressure ${bp.val()}`)

        $(".diagnosis-title").text(diagnosis.val())
        $(".diagnosis-description").text(description.val())

        window.print()
    })
})