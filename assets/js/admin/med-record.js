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

    //DISABLE LETTERS IN BP INPUT
    bp.keypress(function(e){
        if(e.which >= 47 && e.which <= 57 || e.which == 8){
            return null
        }else {
            e.preventDefault()
        }
    });

    $("input#weight,input#height,input#temperature").keypress(function(e) {
        if((e.which >= 48 && e.which <= 57) || e.which == 8){
            return null
        }else{
            e.preventDefault()
        }
    })

    $("#back").click(function(e) {
        const previousPage = document.referrer.split('/')
        if(previousPage.indexOf("patients") <= -1){
            return window.close()
        }

        return location.href = `/admin/patients/${patient_id}`
    })

    //AUTO CALCULATE AGE
    birthdate.on("change", function (e) {
        age.val(getAge(birthdate.val()))
    })

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //UPDATE MEDICAL RECORD
    $("#save").click(function (e) {
        if(!temperature.val() || !bp.val() || !weight.val() || !height.val()) return showToast("❌ Complete required fields")
        const bpVal = bp.val().split("/")
        if(bpVal.length != 2 || !bpVal[0] || !bpVal[1] || bpVal[0].length > 3 || bpVal[1].length > 3) return showToast("❌ Invalid blood pressure")

        $(".confirmation-shadow").toggleClass("d-none")
    })
    $("#yes").click(function (e) {
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
                if (!res.operation) return showToast("❌ Something went wrong")
                showToast("✅ Updated Successfully")
                $(".confirmation-shadow").toggleClass("d-none")
                $(window).off('beforeunload');
                patient_history.prop("disabled", !patient_history.prop("disabled"))
                temperature.prop("disabled", !temperature.prop("disabled"))
                bp.prop("disabled", !bp.prop("disabled"))
                height.prop("disabled", !height.prop("disabled"))
                weight.prop("disabled", !weight.prop("disabled"))
                diagnosis.prop("disabled", !diagnosis.prop("disabled"))
                description.prop("disabled", !description.prop("disabled"))
                $("#edit").toggleClass("d-none")
                $("#save").toggleClass("d-none")
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
    $("#no").click(function (e) {
        $(".confirmation-shadow").toggleClass("d-none")
    })

    //ENABLE EDIT MODE
    $("#edit").click(function (e) {
        patient_history.prop("disabled", !patient_history.prop("disabled"))
        temperature.prop("disabled", !temperature.prop("disabled"))
        bp.prop("disabled", !bp.prop("disabled"))
        height.prop("disabled", !height.prop("disabled"))
        weight.prop("disabled", !weight.prop("disabled"))
        diagnosis.prop("disabled", !diagnosis.prop("disabled"))
        description.prop("disabled", !description.prop("disabled"))
        $(this).toggleClass("d-none")
        $("#save").toggleClass("d-none")
        $(window).on('beforeunload', function (e) {
            return "You have unsaved changes"
        });
    })

    //PRINT MEDICAL RECORD
    $("#print").click(function (e) {
        $(".patient-history").text(`${patient_history.val()}`)
        $(".patient-weight").text(`Weight: ${weight.val()} kg`)
        $(".patient-height").text(`Height: ${height.val()} cm`)
        $(".patient-temp").text(`Temeprature: ${temperature.val()} °C`)
        $(".patient-bp").text(`Blood Pressure: ${bp.val()}`)

        $(".diagnosis-title").text(diagnosis.val())
        $(".diagnosis-description").text(description.val())

        window.print()
    })
})