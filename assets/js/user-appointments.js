$(document).ready(function (e) {
    const patient_id = $("meta[name=patient_id]").attr("content");
    const patient_type = $("#patient_type");
    const dateSched = $("#date-sched");
    const sortSatus = $("#sort");
    const showDate = $("#show");
    const medComplain = $("#med-complain");
    const timepicker = $("#timepicker")
    const chosenTime = $("#chosenTime")

    $("#show,#sort").select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center'
    })
    $("span.select2").addClass("border border-4 border-dark rounded text-center")

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
        $("#dateSched-container,#timeSched-container").addClass("d-none")
        patient_type.val("Choose")
        medComplain.val("")
        $("h5.valid").css("display", "none")
        $("h5.invalid").css("display", "none")
        localStorage.clear()
        timepicker.val("")
    }

    //INITIALIZE DATATABLE APPOINTMENTS
    const dataTables = $("table").DataTable({
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
            },
            {
                data: "apt_id",
                render: (apt_id, type, row) => {
                    const { status } = row
                    return status == "Pending" || status == "Approved" ? `<input type="submit" id="cancel" data-id="${apt_id}" value="CANCEL" class="btn btn-danger" />` : "N/A"
                }
            }
        ]
    })

    //ONCHANGE SORT STATUS & SHOW DATE
    $("#sort,#show").on("change", function (e) {
        dataTables.ajax.url(`/client/appointments/list?sort=${sortSatus.val()}&show=${showDate.val()}`).load()
    })

    $("table").on("click", "#cancel", function(e) {
        const apt_id = $(this).attr("data-id")

        $(".loading").css("display", "block")

        $.ajax({
            url: `/client/appointments/cancel`,
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                apt_id
            }),
            success: (res) => {
                if (!res.operation) return showToast(`❌ Something went wrong`)
                showToast(`✅ ${res.msg}`)
                dataTables.ajax.reload()
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
    dateSched.change(function() {
        if(!dateSched.val()) return null
        timepicker.empty()
        timepicker.attr("disabled", false)
        timepicker.select2({
            placeholder: "Select Time",
            minimumResultsForSearch: -1,
            dropdownCssClass: 'text-center',
            language: {
                noResults: function() {
                    return 'No Time Available';
                }
            },
            ajax: {
                url: '/admin/time/available',
                dataType: 'json',
                type: 'POST',
                data: function(params) {
                  return {
                    search: params.search,
                    dateSched: dateSched.val(),
                    patient_type: patient_type.val()
                  }
                },
                processResults: function(data) {
                    return {
                        results: data.results
                    };
                }
            }
        })
        $(".bg-shadow-dim").find("span.select2-selection").addClass("border border-4 border-dark rounded text-center w-100 h-100")
        $(".bg-shadow-dim").find(".selection,.select2-container").addClass("w-100")
    })
    timepicker.on("select2:select", function(e) {
        const { orig } = e.params.data
        chosenTime.val(orig)
    })

    //CHECK IF THE DATES ARE FULL OF APPOINTMENTS
    patient_type.change(function(e) {
        if(!$(this).val()) return null
        dateSched.val("")
        timepicker.empty()
        timepicker.attr("disabled", true)
        $("#dateSched-container,#timeSched-container").removeClass("d-none")
        $.ajax({
            url: `/admin/schedule_count?patient_type=${patient_type.val()}`,
            type: 'GET',
            success: ({ unavailable_dates, schedule:[ scheduledTime ] }) => {
                dateSched.flatpickr({
                    minDate: "today",
                    //maxDate: new Date(new Date().getFullYear(), new Date().getMonth() + 2, new Date().getDate()),
                    disable: [
                        function(date) {
                            return date.getDay() < scheduledTime.startDay || date.getDay() > scheduledTime.endDay
                        },
                        ...unavailable_dates
                    ],
                    altInput: true,
                    altFormat: "m/d/Y"
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
        if (!dateSched.val() || !timepicker.val() || !patient_type.val() || patient_type.val() == "Choose" || !medComplain.val()) return showToast("❌ Complete all fields")

        $(".loading").css("display", "block")

        $.ajax({
            url: `/client/appointments/${patient_id}`,
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                schedule: `${dateSched.val()} ${chosenTime.val()}`,
                patient_type: patient_type.val(),
                med_complain: medComplain.val(),
            }),
            success: (res) => {
                if (!res.operation) return showToast(`❌ ${res.msg}`)
                showToast("✅ Appointment successfully submitted")
                $("table").DataTable().ajax.reload()
                clearInput()
                $(".bg-shadow-dim").toggleClass("d-none")
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
})