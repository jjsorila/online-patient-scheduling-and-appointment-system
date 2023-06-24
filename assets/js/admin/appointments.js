$(document).ready(function (e) {
    const selectedSort = $("select")
    const reason = $("#reason")
    const reasonId = $("#reasonId")
    const email = $("#email")
    const schedule = $("#schedule")

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
    }

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //DATA TABLE OPTIONS (INITIALIZE)
    $("table").DataTable({
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
            // { data: "status" },
            {
                data: "apt_id",
                render: (data) => {
                    const { fullname } = data
                    const parsedName = `${fullname.lname}, ${fullname.fname} ${fullname.mi}${fullname.mi ? "." : ""}`
                    return (`
                    <div class="btn-group">
                        <input type="submit" data-name='${parsedName}' data-patient='${data.patient}' data-complain='${data.complain}' data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='view' class='btn btn-primary' value='View' />
                        <!-- <input type="submit" data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='approve' data-val='Approved' class='btn btn-success p-2' value='Approve'/>
                        <input type="submit" data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='cancel' data-val='Cancelled' class='btn btn-danger p-2' value='Disapprove'/> -->
                    </div>
                    `)
                }
            }
        ],
        ordering: false,
    });

    //OPEN VIEW APPOINTMENT
    $("table").on("click", "input#view", function(e) {
        const current = $(this)
        reasonId.val(current.attr("data-id"))
        schedule.val(current.attr("data-sched"))
        email.val(current.attr("data-email"))
        $(".view").html(`
            <h3 class="text-center">Name: ${current.attr("data-name")}</h3>
            <h3 class="text-center">Patient Type: ${current.attr("data-patient")}</h3>
            <h3 class="text-center">Medical Complain</h3>
            <textarea rows="5" disabled class="form-control text-center border border-dark border-4">${current.attr("data-complain")}</textarea>
            <div class="form-group d-flex justify-content-center gap-3">
                <input type="submit" class="btn btn-success border border-dark border-3" id="approve" value="Approve"/>
                <input type="submit" class="btn btn-danger border border-dark border-3" id="cancel" value="Disapprove"/>
            </div>
        `)
        $(".view-shadow").fadeToggle("fast")

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
    $("select").on("change", function (e) {

        $('table').DataTable({
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
                // { data: "status" },
                {
                    data: "apt_id",
                    render: (data) => {
                        const { fullname } = data
                        const parsedName = `${fullname.lname}, ${fullname.fname} ${fullname.mi}${fullname.mi ? "." : ""}`
                        return (`
                        <div class="btn-group">
                            <input type="submit" data-name='${parsedName}' data-patient='${data.patient}' data-complain='${data.complain}' data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='view' class='btn btn-primary' value='View' />
                        </div>
                        `)
                    }
                }
            ],
            ordering: false,
            destroy: true
        });
    })

    //APPROVE APPOINTMENT
    $(".view").on("click", "input#approve", function (e) {
        const current = $(this)

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
                schedule: schedule.val()
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                $('table').DataTable({
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
                        // { data: "status" },
                        {
                            data: "apt_id",
                            render: (data) => {
                                const { fullname } = data
                                const parsedName = `${fullname.lname}, ${fullname.fname} ${fullname.mi}${fullname.mi ? "." : ""}`
                                return (`
                                <div class="btn-group">
                                    <input type="submit" data-name='${parsedName}' data-patient='${data.patient}' data-complain='${data.complain}' data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='view' class='btn btn-primary' value='View' />
                                </div>
                                `)
                            }
                        }
                    ],
                    ordering: false,
                    destroy: true
                });
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
                schedule: schedule.val()
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                $('table').DataTable({
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
                        // { data: "status" },
                        {
                            data: "apt_id",
                            render: (data) => {
                                const { fullname } = data
                                const parsedName = `${fullname.lname}, ${fullname.fname} ${fullname.mi}${fullname.mi ? "." : ""}`
                                return (`
                                <div class="btn-group">
                                    <input type="submit" data-name='${parsedName}' data-patient='${data.patient}' data-complain='${data.complain}' data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='view' class='btn btn-primary' value='View' />
                                </div>
                                `)
                            }
                        }
                    ],
                    ordering: false,
                    destroy: true
                });
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