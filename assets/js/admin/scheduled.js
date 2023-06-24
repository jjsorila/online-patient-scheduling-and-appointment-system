$(document).ready(function() {
    const from = $("#from")
    const to = $("#to")
    const apt_id = $("#apt_id")
    const schedule = $("#schedule")
    const email = $("#email")
    const reason = $("#reason")

    //CLEAR SELECTED
    function clearSelected() {
        apt_id.val("")
        reason.val("")
        schedule.val("")
        email.val("")
    }

    //INITIALIZE DATA TABLE
    $("table").DataTable({
        ajax: `/admin/schedule/list?sort=DAY`,
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        columns: [
            {
                data: "queue"
            },
            {
                data: "fullname",
                render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}${mi ? "." : ""}`)
            },
            {
                data: "patient_type"
            },
            {
                data: "mod_schedule"
            },
            {
                data: "apt_id",
                render: (data) => {
                    if(!data.walkin) return (`
                        <div class="btn-group">
                            <input type="submit" class="btn btn-success" data-apt-id=${data.apt_id} id="open-record" value="Open"/>
                            <input type="submit" class="btn btn-danger" data-id=${data.apt_id} data-schedule='${data.schedule}' data-email='${data.email}' id="cancel" value="Cancel"/>
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

    //OPEN CANCEL REASON FORM
    $("table").on("click", "input#cancel", function(e) {
        const current = $(this)
        apt_id.val(current.attr("data-id"))
        email.val(current.attr("data-email"))
        schedule.val(current.attr("data-schedule"))
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
        $("table").DataTable({
            ajax: `/admin/schedule/list?from=${from.val()}&to=${to.val()}`,
            lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
            columns: [
                {
                    data: "queue"
                },
                {
                    data: "fullname",
                    render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}${mi ? "." : ""}`)
                },
                {
                    data: "patient_type"
                },
                {
                    data: "mod_schedule"
                },
                {
                    data: "apt_id",
                    render: (data) => {
                        if(!data.walkin) return (`
                            <div class="btn-group">
                                <input type="submit" class="btn btn-success" data-apt-id=${data.apt_id} id="open-record" value="Open"/>
                                <input type="submit" class="btn btn-danger" data-id=${data.apt_id} data-schedule='${data.schedule}' data-email='${data.email}' id="cancel" value="Cancel"/>
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
            ordering: false,
            destroy: true
        });
    })

    $("#from,#to").change(function(e) {
        $("table").DataTable({
            ajax: `/admin/schedule/list?from=${from.val()}&to=${to.val()}`,
            lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
            columns: [
                {
                    data: "queue"
                },
                {
                    data: "fullname",
                    render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}${mi ? "." : ""}`)
                },
                {
                    data: "patient_type"
                },
                {
                    data: "mod_schedule"
                },
                {
                    data: "apt_id",
                    render: (data) => {
                        console.log(data)
                        if(!data.walkin) return (`
                            <div class="btn-group">
                                <input type="submit" class="btn btn-success" data-apt-id=${data.apt_id} id="open-record" value="Open"/>
                                <input type="submit" class="btn btn-danger" data-id=${data.apt_id} data-schedule='${data.schedule}' data-email='${data.email}' id="cancel" value="Cancel"/>
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
            ordering: false,
            destroy: true
        });
    })

    $("#today").click(function(e) {
        $(".date-wrapper").addClass("d-none")
        $("table").DataTable({
            ajax: `/admin/schedule/list?sort=DAY`,
            lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
            columns: [
                {
                    data: "queue"
                },
                {
                    data: "fullname",
                    render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}${mi ? "." : ""}`)
                },
                {
                    data: "patient_type"
                },
                {
                    data: "mod_schedule"
                },
                {
                    data: "apt_id",
                    render: (data) => {
                        if(!data.walkin) return (`
                            <div class="btn-group">
                                <input type="submit" class="btn btn-success" data-apt-id=${data.apt_id} id="open-record" value="Open"/>
                                <input type="submit" class="btn btn-danger" data-id=${data.apt_id} data-schedule='${data.schedule}' data-email='${data.email}' id="cancel" value="Cancel"/>
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
            ordering: false,
            destroy: true
        });
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
                sudden: `Your approved appointment on ${schedule.val()} has been suddenly cancelled`
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