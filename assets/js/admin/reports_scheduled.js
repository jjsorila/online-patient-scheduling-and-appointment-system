$(document).ready(function (e) {
    const status = $("#status")
    const from = $("#from")
    const to = $("#to")

    status.select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center'
    })
    $("span.select2").addClass("border border-4 border-dark rounded text-center")

    $("#scheduled_patients").DataTable({
        ajax: `/reports/scheduled/all`,
        dom: 'lBfrtip',
        buttons: [
            {
                extend: 'print',
                title: '',
                repeatingHead: {
                    title: `
                    <div class="m-0 d-flex ps-3 pe-3 justify-content-between align-items-center">
                        <img height="100px" width="100px" src="https://live.staticflickr.com/65535/52528780717_e7d152ec00_o.png"/>
                        <div>
                            <h4 style="font-size: 4vw;">Rodis Maternal and Childcare Clinic</h4>
                            <label style="font-size: 2vw;">#64 Rizal St. Brgy 3. Alfonso Cavite, Philippines 4123</label>
                        </div>
                    </div>
                `
                },
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
                render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}${mi ? "." : ""}`)
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

    $("#from,#to,#status").change(function (e) {
        $("#scheduled_patients").DataTable({
            ajax: `/reports/scheduled/all?status=${status.val()}&from=${from.val()}&to=${to.val()}`,
            dom: 'lBfrtip',
            buttons: [
                {
                    extend: 'print',
                    title: '',
                    repeatingHead: {
                        title: `
                        <div class="m-0 d-flex ps-3 pe-3 justify-content-between align-items-center">
                            <img height="100px" width="100px" src="https://live.staticflickr.com/65535/52528780717_e7d152ec00_o.png"/>
                            <div>
                                <h4 style="font-size: 4vw;">Rodis Maternal and Childcare Clinic</h4>
                                <label style="font-size: 2vw;">#64 Rizal St. Brgy 3. Alfonso Cavite, Philippines 4123</label>
                            </div>
                        </div>
                        `
                    },
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
                    render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}${mi ? "." : ""}`)
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