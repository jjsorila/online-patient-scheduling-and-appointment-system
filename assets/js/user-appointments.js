$(document).ready(function (e) {
    const patient_id = $("meta[name=patient_id]").attr("content");
    const patient_type = $("#patient_type");
    const dateSched = $("#date-sched");
    const sortSatus = $("#sort");
    const showDate = $("#show");
    const medComplain = $("#med-complain");

    $(window).on("unload", function(){
        localStorage.clear()
    });

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //CLEAR INPUT
    function clearInput() {
        dateSched.val("")
        $("#dateSched-container").addClass("d-none")
        patient_type.val("Choose")
        medComplain.val("")
        $("h5.valid").css("display", "none")
        $("h5.invalid").css("display", "none")
        localStorage.clear()
    }

    //ONCHANGE SHOW DATE
    showDate.on("change", function (e) {
        $("table").DataTable({
            ajax: `/client/appointments/list?sort=${sortSatus.val()}&show=${showDate.val()}`,
            lengthMenu: [[10, 25, 35, 50, -1], [10, 25, 35, 50, "All"]],
            ordering: false,
            columns: [
                {
                    data: "schedule"
                },
                {
                    data: "patient_type"
                },
                {
                    data: "status"
                }
            ],
            destroy: true
        })
    })

    //ONCHANGE SORT STATUS
    sortSatus.on("change", function (e) {

        $("table").DataTable({
            ajax: `/client/appointments/list?sort=${sortSatus.val()}&show=${showDate.val()}`,
            lengthMenu: [[10, 25, 35, 50, -1], [10, 25, 35, 50, "All"]],
            ordering: false,
            columns: [
                {
                    data: "schedule"
                },
                {
                    data: "patient_type"
                },
                {
                    data: "status"
                }
            ],
            destroy: true
        })

    })

    //INITIALIZE DATATABLE APPOINTMENTS
    $("table").DataTable({
        ajax: `/client/appointments/list?sort=${sortSatus.val()}&show=${showDate.val()}`,
        lengthMenu: [[10, 25, 35, 50, -1], [10, 25, 35, 50, "All"]],
        ordering: false,
        columns: [
            {
                data: "schedule"
            },
            {
                data: "patient_type"
            },
            {
                data: "status"
            }
        ]
    })

    //OPEN APPOINTMENT FORM
    $("#sched").click(function (e) {
        if (!$('input[type=hidden]').val()) return showToast("❌ Please update user information")

        $(".bg-shadow-dim").toggleClass("d-none")
    })

    //CLOSE APPOINTMENT FORM
    $(".bg-shadow-dim #close").click(function (e) {
        $(".bg-shadow-dim").toggleClass("d-none")
        clearInput()
    })

    //CHECK IF TIME IS VALID
    dateSched.change(function (e) {
        $.ajax({
            url: '/admin/time_check',
            type: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                chosenTime: dateSched.val(),
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


    //CHECK IF THE DATES ARE FULL OF APPOINTMENTS
    patient_type.change(function(e) {
        if(!patient_type.val()) return null

        $("#dateSched-container").removeClass("d-none")
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

    //SCHEDULE APPOINTMENT
    $("#submit-sched").click(function (e) {
        const isValid = JSON.parse(localStorage.getItem("isValid"))
        if(typeof(isValid) == "boolean" && !isValid) return showToast("❌ Chosen TIME is UNAVAILABLE")

        if (!dateSched.val() || !patient_type.val() || patient_type.val() == "Choose" || !medComplain.val()) return showToast("❌ Complete required fields")

        $(".loading").css("display", "block")

        $.ajax({
            url: `/client/appointments/${patient_id}`,
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                schedule: dateSched.val(),
                patient_type: patient_type.val(),
                med_complain: medComplain.val()
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Please update user information")
                showToast("✅ Appointment successfully submitted")
                $("table").DataTable().ajax.reload()
                clearInput()
            },
            error: (err) => {
                console.log(err)
                showToast("❌ Server error")
            },
            complete: () => {
                $(".loading").css("display", "none")
                $(".bg-shadow-dim").toggleClass("d-none")
            }
        })
    })
})