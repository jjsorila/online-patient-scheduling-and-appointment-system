$(document).ready(function(e) {
    const from = $("#from")
    const to = $("#to")

    //PATIENTS' ACCOMMODATED
    $("#patients_accommodated").DataTable({
        ajax: `/reports/scheduled/done`,
        dom: 'lBfrtip',
        buttons: [
            {
                extend: 'print',
                title: '',
                className: 'btn btn-outline-dark text-uppercase',
            }
        ],
        columnDefs: [
            { className: "dt-center", targets: "_all" }
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
                data: "ailment",
                orderable: false,
                render: ({ diagnosis }) => (diagnosis)
            },
            {
                data: "patient_type",
                orderable: false
            },
            {
                data: "date_created",
                orderable: false
            }
        ]
    })

    //CHANGE RANGE OF DATE
    $("#from,#to").change(function(e) {
        $("#patients_accommodated").DataTable({
            ajax: `/reports/scheduled/done?from=${from.val()}&to=${to.val()}`,
            dom: 'lBfrtip',
            buttons: [
                {
                    extend: 'print',
                    title: '',
                    className: 'btn btn-outline-dark text-uppercase',
                }
            ],
            columnDefs: [
                { className: "dt-center", targets: "_all" }
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
                    data: "ailment",
                    orderable: false,
                    render: ({ diagnosis }) => (diagnosis)
                },
                {
                    data: "patient_type",
                    orderable: false
                },
                {
                    data: "date_created",
                    orderable: false
                }
            ],
            destroy: true
        })
    })
})