$(document).ready(function (e) {
    const selectedSort = $("select")


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
                data: "address"
            },
            {
                data: "contact"
            },
            // { data: "status" },
            {
                data: "apt_id",
                render: (data) => {
                    return `<input type="submit" data-id=${data} data-val='Approved' class='btn btn-success' value='Approve'/> <input type="submit" data-id=${data} data-val='Cancelled' class='btn btn-danger' value='Cancel'/>`
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
                    data: "address"
                },
                {
                    data: "contact"
                },
                // { data: "status" },
                {
                    data: "apt_id",
                    render: (data) => {
                        return `<input type="submit" data-id=${data} data-val='Approved' class='btn btn-success' value='Approve'/> <input type="submit" data-id=${data} data-val='Cancelled' class='btn btn-danger' value='Cancel'/>`
                    }
                }
            ],
            ordering: false,
            destroy: true
        });
    })

    //APPROVE/CANCEL
    $("table").on("click", "input[type=submit]", function (e) {
        const current = $(this)

        $(".loading").css("display", "block")

        $.ajax({
            url: '/admin/action/appointments',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                action: current.attr("data-val"),
                apt_id: current.attr("data-id")
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
                            data: "address"
                        },
                        {
                            data: "contact"
                        },
                        // { data: "status" },
                        {
                            data: "apt_id",
                            render: (data) => {
                                return `<input type="submit" data-id=${data} data-val='Approved' class='btn btn-success' value='Approve'/> <input type="submit" data-id=${data} data-val='Cancelled' class='btn btn-danger' value='Cancel'/>`
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
})