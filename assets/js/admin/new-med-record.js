$(document).ready(function (e) {
    const apt_id = $("meta[name=apt_id]").attr("content");
    const patient_id = $("meta[name=patient_id]").attr("content");
    const status = $("meta[name=status]").attr("content");
    const link_to = $("meta[name=link_to]").attr("content");
    const med_complain = $("#med_complain");
    const patient_history = $("#patient_history");
    const temperature = $("#temperature");
    const bp = $("#bp");
    const weight = $("#weight");
    const patient_type = $("#patient_type");
    const height = $("#height");
    const dateSched = $("#date-sched");
    const diagnosis = $("#diagnosis");
    const description = $("#description");
    const followUp = $("#follow_up");
    function getAge(dateString) {
        var ageInMilliseconds = new Date() - new Date(dateString);
        return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365);
    }

    // $("#linked_checkup").DataTable({

    // })

    //CLEAR LOCAL STORAGE
    $(window).on("unload", function(){
        localStorage.clear()
    });

    //DETECT CHANGES
    $("input, textarea").on("change keyup paste", function(e) {
        $(window).on('beforeunload', function(e) {
            return "You have unsaved changes"
        });
    })

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //ADD NEW MEDICAL RECORD
    $("#save").click(function(e) {
        $(".confirmation-shadow").removeClass("d-none")
    })
    $("#yes").click(function(e) {
        $(".loading").css("display", "block")
        $.ajax({
            url: `/admin/med-record/add/${apt_id}`,
            type: 'POST',
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
                showToast("✅ Record Added Successfully")
                $(window).off('beforeunload')
                $(".confirmation-shadow").addClass("d-none")
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
    $("#no").click(function(e) {
        $(".confirmation-shadow").toggleClass("d-none")
    })

    //OPEN FOLLOW UP
    followUp.click(function(e) {
        $(".follow_up_shadow").toggleClass("d-none")
        $.ajax({
            url: `/admin/schedule_count?patient_type=${patient_type.val()}`,
            type: 'GET',
            success: (disabledDates) => {
                dateSched.flatpickr({
                    enableTime: true,
                    minTime: "14:00",
                    maxTime: "16:30",
                    minuteIncrement: 30,
                    defaultHour: 14,
                    defaultMinute: 00,
                    minDate: "today",
                    disable: [
                        function(date) {
                            return (date.getDay() === 0);
                        },
                        ...disabledDates
                    ],
                    altInput: true,
                    altFormat: "m/d/Y G:i K"
                });
            },
            error: (err) => {
                console.log(err)
                showToast("❌ Server error")
            }
        })
    })

    //CHECK IF TIME IS VALID
    dateSched.change(function (e) {
        if(!$(this).val()) return null
        $.ajax({
            url: '/admin/time_check',
            type: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                chosenTime: $(this).val(),
                patient_type: patient_type.val()
            }),
            success: (res) => {
                localStorage.setItem("isValid", res)
                if(res){
                    $("h5.valid").css("display", "block")
                    $("h5.invalid").css("display", "none")
                }else {
                    $("h5.valid").css("display", "none")
                    $("h5.invalid").css("display", "block")
                }
            },
            error: (err) => {
                console.log(err)
                showToast("❌ Server error")
            }
        })
    })

    //CLOSE FOLLOW
    $(".follow_up_shadow").click(function(e) {
        $(this).toggleClass("d-none")
        dateSched.val("")
        localStorage.clear()
        $("h5.valid").css("display", "none")
        $("h5.invalid").css("display", "none")
    })
    $(".follow_up_form").click(function(e) {
        e.stopPropagation()
    })

    //SUBMIT FOLLOW UP
    $("#submit_follow_up").click(function(e) {
        if(!dateSched.val() || !patient_type.val()) return showToast("❌ Complete required fields")
        const isValid = JSON.parse(localStorage.getItem("isValid"))
        if(typeof(isValid) == "boolean" && !isValid) return showToast("❌ Chosen TIME is UNAVAILABLE")

        $(".loading").css("display", "block")
        $.ajax({
            url: '/admin/follow-up',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                sched: dateSched.val(),
                apt_id: apt_id,
                link_to: link_to,
                patient_id: patient_id,
                patient_type: patient_type.val(),
                med_complain: med_complain.val()
            }),
            success: (res) => {
                if(!res.operation) return showToast("❌ Something went wrong")
                $("#yes").trigger("click")
            },
            error: (err) => {
                console.log(err)
                showToast("❌ Server error")
                $(".loading").css("display", "none")
            }
        })
    })
})