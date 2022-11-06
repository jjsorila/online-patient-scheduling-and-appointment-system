$(document).ready(function(e) {
    const status = $("#status")
    const from = $("#from")
    const to = $("#to")

    $("#scheduled_patients").DataTable({
        ajax: `/reports/scheduled/all`,
        dom: 'lBfrtip',
        buttons: [
            {
                extend: 'print',
                title: '',
                className: 'btn btn-outline-dark text-uppercase',
            }
        ],
        columnDefs: [
            { className: "dt-center", targets: "_all" },
            { className: "text-break w-25", targets: 1 }
        ],
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        order: [[0, 'asc']],
        searching: false,
        columns: [
            {
                data: "fullname",
                orderable: false,
                render: ({ fname, lname, mi }) => {
                    return `${lname}, ${fname} ${mi}.`
                }
            },
            {
                data: "address",
                orderable: false
            },
            {
                data: "contact",
                orderable: false
            },
            {
                data: "patient_type",
                orderable: false
            },
            {
                data: "schedule",
                orderable: false
            }
        ]
    })

    $("#from,#to,#status").change(function(e) {
        $("#scheduled_patients").DataTable({
            ajax: `/reports/scheduled/all?status=${status.val()}&from=${from.val()}&to=${to.val()}`,
            dom: 'lBfrtip',
            buttons: [
                {
                    extend: 'print',
                    title: '',
                    className: 'btn btn-outline-dark text-uppercase',
                }
            ],
            columnDefs: [
                { className: "dt-center", targets: "_all" },
                { className: "text-break w-25", targets: 1 }
            ],
            lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
            order: [[0, 'asc']],
            searching: false,
            columns: [
                {
                    data: "fullname",
                    orderable: false,
                    render: ({ fname, lname, mi }) => {
                        return `${lname}, ${fname} ${mi}.`
                    }
                },
                {
                    data: "address",
                    orderable: false
                },
                {
                    data: "contact",
                    orderable: false
                },
                {
                    data: "patient_type",
                    orderable: false
                },
                {
                    data: "schedule",
                    orderable: false
                    
                }
            ],
            destroy: true
        })
    })
})