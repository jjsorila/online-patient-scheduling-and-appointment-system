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
    const timepicker = $("#timepicker");
    const doctorList = $("#doctorList");
    let chosenTime = null;
    let licenseNumberHolder = null;

    doctorList.select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center',
        placeholder: "Select a Doctor",
        language: {
            noResults: function() {
                return 'No Doctor Available';
            }
        }
    })
    timepicker.select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center',
        placeholder: "Select Time",
        language: {
            noResults: function() {
                return 'No Time Available';
            }
        }
    })

    $("#linked_checkup").DataTable({
        ajax: `/admin/linked-checkup?apt_id=${link_to}`,
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        columns: [
            {
                data: "ailment",
                render: ({ diagnosis, description }) => {
                    return `${diagnosis}`
                }
            },
            {
                data: "date_created"
            },
            {
                data: "mr_id",
                render: (id) => {
                    return `<button class="btn btn-primary border border-dark border-2 rounded" data-id="${id}" id="open_record">Open</button>`
                }
            }
        ],
        ordering: false
    })

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

    //CLEAR INPUT
    function clearInput() {
        dateSched.val("")
        dateSched.flatpickr().destroy()
        dateSched.attr("disabled", true)
        timepicker.empty()
        doctorList.empty()
        chosenTime = null;
        licenseNumberHolder = null
    }

    //OPEN RECORD
    $("#linked_checkup").on("click", "#open_record", function(e) {
        const data_id = $(this).attr("data-id")
        window.open(`/admin/patients/${patient_id}/${data_id}`)
    })

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
        if(!temperature.val() || !bp.val() || !weight.val() || !height.val()) return showToast("❌ Complete required fields")
        const bpVal = bp.val().split("/")
        if(bpVal.length != 2 || !bpVal[0] || !bpVal[1] || bpVal[0].length > 3 || bpVal[1].length > 3) return showToast("❌ Invalid blood pressure")

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
        if(!temperature.val() || !bp.val() || !weight.val() || !height.val()) return showToast("❌ Complete required fields")
        const bpVal = bp.val().split("/")
        if(bpVal.length != 2 || !bpVal[0] || !bpVal[1] || bpVal[0].length > 3 || bpVal[1].length > 3) return showToast("❌ Invalid blood pressure")

        doctorList.select2({
            placeholder: "Select a Doctor",
            minimumResultsForSearch: -1,
            dropdownCssClass: 'text-center',
            language: {
                noResults: function() {
                    return 'No Doctor Available';
                }
            },
            ajax: {
                url: '/admin/doctor/available',
                dataType: 'json',
                type: 'POST',
                data: function(params) {
                  return {
                    patient_type: patient_type.val()
                  }
                },
                processResults: function(data) {
                    return {
                        results: data.availableDoctors
                    };
                }
            }
        })
        $(".follow_up_shadow").find("span.select2-selection").addClass("border border-4 border-dark rounded text-center w-100 h-100")
        $(".follow_up_shadow").find(".selection,.select2-container").addClass("w-100")
        $(".follow_up_shadow").toggleClass("d-none")
    })

    //GET DOCTOR AVAILABLE DATES
    doctorList.on("select2:select", function(e) {
        const { license_number } = e.params.data
        licenseNumberHolder = license_number
        dateSched.val("")
        dateSched.flatpickr().destroy()
        dateSched.attr("disabled", false)
        timepicker.empty()
        chosenTime = null

        $.ajax({
            url: `/admin/schedule/walk-in/dates`,
            type: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify({
                doctor_license: license_number
            }),
            success: ({ unavailable_dates, schedule }) => {
                dateSched.flatpickr({
                    minDate: "today",
                    disable: [
                        function(date) {
                            const today = new Date();
                            return date.getFullYear() === today.getFullYear() &&
                                date.getMonth() === today.getMonth() &&
                                date.getDate() === today.getDate();
                        },
                        function(date) {
                            return date.getDay() < schedule.startDay || date.getDay() > schedule.endDay
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

    //CHECK IF TIME IS VALID
    dateSched.change(function() {
        if(!$(this).val() || !licenseNumberHolder) return null
        timepicker.empty()
        chosenTime = null

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
                url: '/admin/schedule/walk-in/time',
                dataType: 'json',
                type: 'POST',
                data: function(params) {
                  return {
                    doctor_license: licenseNumberHolder,
                    dateSched: $(this).val()
                  }
                },
                processResults: function({ totalTimes }) {
                    return {
                        results: totalTimes
                    };
                }
            }
        })
        $(".follow_up_shadow").find("span.select2-selection").addClass("border border-4 border-dark rounded text-center w-100 h-100")
        $(".follow_up_shadow").find(".selection,.select2-container").addClass("w-100")
    })
    timepicker.on("select2:select", function(e) {
        const { orig } = e.params.data
        chosenTime = orig
    })

    //CLOSE FOLLOW UP
    $(".follow_up_shadow").click(function(e) {
        $(this).toggleClass("d-none")
        clearInput()
    })
    $(".follow_up_form").click(function(e) {
        e.stopPropagation()
    })

    //SUBMIT FOLLOW UP
    $("#submit_follow_up").click(function(e) {
        if(!dateSched.val() || !patient_type.val() || !timepicker.val() || !chosenTime || !licenseNumberHolder) return showToast("❌ Complete required fields")

        $(".loading").css("display", "block")
        $.ajax({
            url: '/admin/follow-up',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                sched: `${dateSched.val()} ${chosenTime}`,
                apt_id: apt_id,
                link_to: link_to,
                patient_id: patient_id,
                patient_type: patient_type.val(),
                med_complain: med_complain.val(),
                doctor_license: licenseNumberHolder
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