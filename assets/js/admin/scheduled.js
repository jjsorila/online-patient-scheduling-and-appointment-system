$(document).ready(function() {
    const from = $("#from")
    const to = $("#to")
    const apt_id = $("#apt_id")
    const schedule = $("#schedule")
    const email = $("#email")
    const reason = $("#reason")
    const selectSort = $("#selectSort")
    let doctor_license = null
    let initSort = `/admin/schedule/list?sort=DAY&type=${selectSort.val()}`

    //CLEAR SELECTED
    function clearSelected() {
        apt_id.val("")
        reason.val("")
        schedule.val("")
        email.val("")
        doctor_license = null
    }

    //INITIALIZE DATA TABLE
    const myDataTable = $("table").DataTable({
        ajax: initSort,
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        columns: [
            {
                data: "fullname",
                render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}${mi ? "." : ""}`)
            },
            {
                data: "patient_type"
            },
            {
                data: "doctor_name"
            },
            {
                data: "mod_schedule"
            },
            {
                data: "apt_id",
                render: (data, type, row) => {
                    if(!data.walkin) return (`
                        <div class="btn-group">
                            <input type="submit" class="btn btn-success" data-apt-id=${data.apt_id} id="open-record" value="Open"/>
                            <input type="submit" class="btn btn-danger" data-doctor=${row.doctor_license} data-id=${data.apt_id} data-schedule='${data.mod_schedule}' data-email='${data.email}' id="cancel" value="Cancel"/>
                        </div>
                    `)

                    return(`
                        <div class="btn-group">
                            <input type="submit" class="btn btn-success" data-apt-id=${data.apt_id} id="open-record" value="Open"/>
                        </div>
                    `)
                }
            }
        ],
        ordering: false
    });

    selectSort.select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center',
    })
    $("span.select2").addClass("border border-4 border-dark rounded text-center w-100")

    selectSort.change(function(e) {
        const myVal = $(this).val()
        if(initSort.includes("DAY")){
            initSort = `/admin/schedule/list?sort=DAY&type=${selectSort.val()}`
        }else{
            initSort = `/admin/schedule/list?from=${from.val()}&to=${to.val()}&type=${selectSort.val()}`
        }
        myDataTable.ajax.url(initSort).load();
    })

    //OPEN CANCEL REASON FORM
    $("table").on("click", "input#cancel", function(e) {
        doctor_license = null
        const current = $(this)
        apt_id.val(current.attr("data-id"))
        email.val(current.attr("data-email"))
        schedule.val(current.attr("data-schedule"))
        doctor_license = current.attr("data-doctor")
        $(".reason-shadow").fadeToggle("fast")
    })
    $(".reason").click(function(e) {
        e.stopPropagation()
    })
    $(".reason-shadow").click(function(e) {
        clearSelected()
        $(this).fadeToggle("fast")
    })

    $(`#from,#to`).click(function(e) {
        $("#custom").attr("checked", true)
    })

    $("span.select2").addClass("border border-4 border-dark rounded text-center w-100")

    $("#custom").change(function(e) {
        $(".date-wrapper").toggleClass("d-none")
        let currentSort = `/admin/schedule/list?from=${from.val()}&to=${to.val()}&type=${selectSort.val()}`
        myDataTable.ajax.url(currentSort).load();
        initSort = currentSort
        showToast("✅ Showing patients in range of dates")
    })

    $("#from,#to").change(function(e) {
        let currentSort = `/admin/schedule/list?from=${from.val()}&to=${to.val()}&type=${selectSort.val()}`
        myDataTable.ajax.url(currentSort).load();
        initSort = currentSort
        showToast("✅ Showing patients in range of dates")
    })

    $("#today").click(function(e) {
        $(".date-wrapper").addClass("d-none")
        let currentSort = `/admin/schedule/list?sort=DAY&type=${selectSort.val()}`
        myDataTable.ajax.url(currentSort).load();
        initSort = currentSort
        showToast("✅ Showing today scheduled patients")
    })

    //AUTO RELOAD TABLE
    setInterval(() => {
        $("table").DataTable().ajax.reload()
    }, 5000)

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //CREATE MEDICAL RECORD FOR SCHEDULED PATIENT
    $("table").on("click", "input#open-record", function(e) {
        const apt_id = $(this).attr("data-apt-id")
        location.href = `/admin/scheduled/${apt_id}`
    })

    //CANCEL CONFIRMATION
    $("#confirm-cancel").click(function(e) {
        if(!reason.val()) return showToast("❌ Reason required")

        $(".loading").css("display", "block")
        $.ajax({
            url: "/admin/action/appointments",
            type: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                action: "Cancelled",
                apt_id: apt_id.val(),
                reason: reason.val(),
                email: email.val(),
                schedule: schedule.val(),
                sudden: `Your approved appointment on ${schedule.val()} has been suddenly cancelled`,
                license_number: doctor_license
            }),
            success: (res) => {
                if(!res.operation) return showToast("❌ Something went wrong")
                $("table").DataTable().ajax.reload()
                $(".reason-shadow").fadeToggle("fast")
                clearSelected()
                showToast("✅ Success")
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