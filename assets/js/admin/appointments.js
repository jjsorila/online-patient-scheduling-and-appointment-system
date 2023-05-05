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

    //AUTO RELOAD
    setInterval(() => {
        $("table").DataTable().ajax.reload()
    }, 5000)

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
                render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}.`)
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
                    return (`
                    <div class="form-group d-flex gap-1 justify-content-center">
                        <input type="submit" data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='approve' data-val='Approved' class='btn btn-success' value='Approve'/>
                        <input type="submit" data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='cancel' data-val='Cancelled' class='btn btn-danger' value='Cancel'/>
                    </div>
                    `)
                }
            }
        ],
        ordering: false,
    });

    //CHANGE APPOINTMENTS TABLE SORT
    $("select").on("change", function (e) {

        $('table').DataTable({
            ajax: `/admin/list/appointments?show=${selectedSort.val()}`,
            lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
            columns: [
                { data: "schedule" },
                {
                    data: "fullname",
                    render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}.`)
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
                        return (`
                        <div class="form-group d-flex gap-1 justify-content-center">
                            <input type="submit" data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='approve' data-val='Approved' class='btn btn-success' value='Approve'/>
                            <input type="submit" data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='cancel' data-val='Cancelled' class='btn btn-danger' value='Cancel'/>
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
    $("table").on("click", "input#approve", function (e) {
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
                apt_id: current.attr("data-id"),
                email: current.attr("data-email"),
                schedule: current.attr("data-sched")
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
                            render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}.`)
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
                                return (`
                                <div class="form-group d-flex gap-1 justify-content-center">
                                    <input type="submit" data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='approve' data-val='Approved' class='btn btn-success' value='Approve'/>
                                    <input type="submit" data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='cancel' data-val='Cancelled' class='btn btn-danger' value='Cancel'/>
                                </div>
                                `)
                            }
                        }
                    ],
                    ordering: false,
                    destroy: true
                });
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

    //OPEN CANCEL REASON
    $("table").on("click", "input#cancel", function(e) {
        reasonId.val($(this).attr("data-id"))
        schedule.val($(this).attr("data-sched"))
        email.val($(this).attr("data-email"))
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
                            render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}.`)
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
                                return (`
                                <div class="form-group d-flex gap-1 justify-content-center">
                                    <input type="submit" data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='approve' data-val='Approved' class='btn btn-success' value='Approve'/>
                                    <input type="submit" data-sched=${data.schedule} data-email=${data.email} data-id=${data.id} id='cancel' data-val='Cancelled' class='btn btn-danger' value='Cancel'/>
                                </div>
                                `)
                            }
                        }
                    ],
                    ordering: false,
                    destroy: true
                });
                $(".reason-shadow").fadeToggle("fast")
                reason.val("")
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