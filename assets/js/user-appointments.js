$(document).ready(function (e) {
    const patient_id = $("meta[name=patient_id]").attr("content");
    const patient_type = $("#patient_type");
    const dateSched = $("#date-sched");
    const sortSatus = $("#sort");
    const showDate = $("#show");
    const medComplain = $("#med-complain");

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //CLEAR INPUT
    function clearInput() {
        dateSched.val("")
        patient_type.val("Choose")
        medComplain.val("")
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

    //DISABLE SCHEDULING ON PREVIOUS DATES
    document.getElementById("date-sched").min = new Date().toISOString().slice(0, 16);

    //OPEN APPOINTMENT FORM
    $("#sched").click(function (e) {
        if(!$('input[type=hidden]').val()) return showToast("❌ Please update user information")
        $(".bg-shadow-dim").toggleClass("d-none")
    })

    //CLOSE APPOINTMENT FORM
    $(".bg-shadow-dim #close").click(function (e) {
        $(".bg-shadow-dim").toggleClass("d-none")
        clearInput()
    })

    //SCHEDULE APPOINTMENT
    $("#submit-sched").click(function (e) {

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