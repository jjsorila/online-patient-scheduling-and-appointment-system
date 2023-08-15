$(document).ready(function (e) {
    const selectedSort = $("#selectSort")
    const reason = $("#reason")
    const reasonId = $("#reasonId")
    const email = $("#email")
    const schedule = $("#schedule")
    const doctorList = $("#doctorList");
    let license_number_holder = null;

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

    selectedSort.select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center'
    })
    $("span.select2").addClass("border border-4 border-dark rounded text-center w-100")

    //CLEAR SELECTED
    function clearSelected(){
        reason.val("")
        reasonId.val("")
        email.val("")
        schedule.val("")
        doctorList.empty()
        license_number_holder = null
    }

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //DATA TABLE OPTIONS (INITIALIZE)
    const myDataTable = $("table").DataTable({
        ajax: `/admin/list/appointments?show=${selectedSort.val()}`,
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        columns: [
            { data: "schedule" },
            {
                data: "fullname",
                render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}${mi ? "." : ""}`)
            },
            {
                data: "address",
                render: (addr) => (`${addr.slice(0, 7)}...`)
            },
            {
                data: "contact"
            },
            {
                data: "apt_id",
                render: (data, type, row) => {
                    const { fullname } = data
                    const parsedName = `${fullname.lname}, ${fullname.fname} ${fullname.mi}${fullname.mi ? "." : ""}`
                    return (`
                    <div class="btn-group">
                        <input type="submit" data-name='${parsedName}' data-patient='${data.patient}' data-complain='${data.complain}' data-sched="${row.schedule}" data-email=${data.email} data-id=${data.id} id='view' class='btn btn-primary' value='View' />
                    </div>
                    `)
                }
            }
        ],
        ordering: false,
    });

    //OPEN VIEW APPOINTMENT
    $("table").on("click", "input#view", function(e) {
        license_number_holder = null
        doctorList.empty()
        const current = $(this)
        reasonId.val(current.attr("data-id"))
        schedule.val(current.attr("data-sched"))
        email.val(current.attr("data-email"))

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
                    patient_type: current.attr("data-patient"),
                    type: "Online",
                    sched: current.attr("data-sched")
                  }
                },
                processResults: function(data) {
                    return {
                        results: data.availableDoctors
                    };
                }
            }
        })
        $("span.select2").addClass("border border-4 border-dark rounded text-center w-100")

        $(".view h4.data-sched").html(`Schedule: ${moment(current.attr("data-sched")).format("MMM DD, YYYY hh:mm A")}`)
        $(".view h4.data-name").html(`Name: ${current.attr("data-name")}`)
        $(".view h4.data-patient").html(`Patient Type: ${current.attr("data-patient")}`)
        $(".view textarea.data-complain").val(current.attr("data-complain"))
        $(".view-shadow").fadeToggle("fast")

    })
    //DOCTOR PICKED
    doctorList.on("select2:select", function(e) {
        const { license_number } = e.params.data
        license_number_holder = license_number
    })
    //CLOSE VIEW APPOINTMENT
    $(".view-shadow").click(function(e) {
        $(this).fadeToggle("fast")
        clearSelected()
    })
    $(".view").click(function(e) {
        e.stopPropagation()
    })

    //CHANGE APPOINTMENTS TABLE SORT
    selectedSort.on("change", function (e) {
        myDataTable.ajax.url(`/admin/list/appointments?show=${selectedSort.val()}`).load()
    })

    //APPROVE APPOINTMENT
    $(".view").on("click", "input#approve", function (e) {
        const current = $(this)

        if(!license_number_holder) return showToast("❌ Select a Doctor")

        $(".loading").css("display", "block")

        $.ajax({
            url: '/admin/action/appointments',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                action: "Approved",
                apt_id: reasonId.val(),
                email: email.val(),
                schedule: schedule.val(),
                license_number: license_number_holder
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                myDataTable.ajax.reload()
                showToast("✅ Success")
                clearSelected()
                $(".view-shadow").fadeToggle("fast")
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

    //OPEN CANCEL REASON
    $(".view").on("click", "input#cancel", function(e) {
        $(".reason-shadow").fadeToggle("fast")
    })
    $(".reason-shadow").click(function(e) {
        $(this).fadeToggle("fast")
    })
    $(".reason").click(function(e) {
        e.stopPropagation()
    })

    //CANCEL APPOINTMENT
    $("#confirm-cancel").click(function(e) {
        if(!reason.val()) return showToast("❌ Reason for cancelling appointment")

        $(".loading").css("display", "block")

        $.ajax({
            url: '/admin/action/appointments',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                action: "Cancelled",
                apt_id: reasonId.val(),
                reason: reason.val(),
                email: email.val(),
                schedule: schedule.val(),
                license_number: license_number_holder
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                myDataTable.ajax.reload()
                $(".reason-shadow,.view-shadow").fadeToggle("fast")
                clearSelected()
                showToast("✅ Success")
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