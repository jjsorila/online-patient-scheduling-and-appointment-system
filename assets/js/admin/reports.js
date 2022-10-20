$(document).ready(function(e) {
    const year = $("#year")
    const month = $("#month")
    const day = $("#day")
    const selectContainer = $("div.select-container")

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //PATIENTS' MASTERLIST
    $("#patients_masterlist").DataTable({
        ajax: `/reports/patients`,
        dom: 'lBfrtip',
        buttons: [
            {
                extend: 'print',
                title: ''
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
                data: "address",
                orderable: false,
                render: (addr) => (`${addr.slice(0, 15)}...`)
            },
            {
                data: "contact",
                orderable: false
            },
            {
                data: "birthdate",
                orderable: false
            }
        ]
    })

    //PATIENTS' ACCOMMODATED
    $("#patients_accommodated").DataTable({
        ajax: `/reports/scheduled/done?year=${year.val()}&month=${month.val()}&day=${day.val()}`,
        dom: 'lBfrtip',
        buttons: [
            {
                extend: 'print',
                title: ''
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

    //CHANGE SORT FOR ACCOMMODATED PATIENTS
    selectContainer.on("change", "select", function(e) {
        $("#patients_accommodated").DataTable({
            ajax: `/reports/scheduled/done?year=${year.val()}&month=${month.val()}&day=${day.val()}`,
            dom: 'lBfrtip',
            buttons: [
                {
                    extend: 'print',
                    title: ''
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