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
        hiddenPatientId = $("#hidden-patient-id"),
        doctorList = $("#doctorList"),
        timeSched = $("#timeSched"),
        dateSched = $("#dateSched"),
        license_number_holder = null,
        selectedTimeHolder = null;

    $("#gender").select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center',
        placeholder: "Select option"
    })
    patient_type.select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center',
        placeholder: "Select Patient Type"
    })
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
    timeSched.select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center',
        placeholder: "Select Time",
        language: {
            noResults: function() {
                return 'No Time Available';
            }
        }
    })
    $("span.select2").addClass("border border-4 border-dark rounded text-center w-100")

    patient_type.change(function(e) {
        license_number_holder = null
        dateSched.val("")
        doctorList.empty()
        timeSched.empty()
        selectedTimeHolder = null
        dateSched.flatpickr().destroy()
        dateSched.attr("disabled", true)

        if(!$(this).val()) return null;

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
    })

    //GET AVAILABLE DATES WALK-IN PATIENT
    doctorList.on("select2:select", function(e) {
        const { license_number } = e.params.data
        license_number_holder = license_number
        timeSched.empty()
        selectedTimeHolder = null
        dateSched.val("")
        dateSched.flatpickr().destroy()
        dateSched.attr("disabled", false)
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

    //GET AVAILABLE TIME WALK-IN PATIENT
    dateSched.change(function(e) {
        const current = $(this)
        timeSched.empty()
        selectedTimeHolder = null

        if(!license_number_holder || !current.val()) return null;

        timeSched.select2({
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
                    doctor_license: license_number_holder,
                    dateSched: current.val()
                  }
                },
                processResults: function({ totalTimes }) {
                    return {
                        results: totalTimes
                    };
                }
            }
        })
    })
    timeSched.on("select2:select", function(e) {
        const { orig } = e.params.data
        selectedTimeHolder = orig
    })

    //CLEAR INPUT FORM
    function clearInput() {
        age.val("")
        mi.val("")
        lname.val("")
        fname.val("")
        birthday.val("")
        gender.val("").trigger("change")
        contact.val("")
        address.val("")
        gName.val("")
        gContact.val("")
        gAddress.val("")
        gRelationship.val("")
        patient_type.val("").trigger("change")
        doctorList.empty()
        timeSched.empty()
        dateSched.val("")
        license_number_holder = null
        selectedTimeHolder = null
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
                    return `${lname}, ${fname} ${mi}${mi ? "." : ""}`
                }
            },
            {
                data: "address",
                orderable: false,
                render: (addr) => (`${addr.slice(0, 7)}...`)
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
                <div class="from-group d-flex gap-1 justify-content-center">
                    <input type="submit" data-id=${data} class='btn btn-success' value='Open'/>
                    <input type="submit" data-id=${data} class='btn btn-primary' value='Schedule'/>
                </div>
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
        if (!patient_type.val() || !license_number_holder || !dateSched.val() || !selectedTimeHolder) return showToast("❌ Complete all fields")

        $(".loading").css("display", "block")
        $.ajax({
            url: '/admin/schedule/walk-in',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                patient_id: hiddenPatientId.val(),
                patient_type: patient_type.val(),
                license_number: license_number_holder,
                sched: `${dateSched.val()} ${selectedTimeHolder}`
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
        if (!fname.val() || !mi.val() || !lname.val() || !birthday.val() || !age.val() || !gender.val() || !contact.val() || !address.val()) return showToast("❌ Complete all fields")
        if (Number(age.val()) <= 0) return showToast("❌ Invalid age")

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