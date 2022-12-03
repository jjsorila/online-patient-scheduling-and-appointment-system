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