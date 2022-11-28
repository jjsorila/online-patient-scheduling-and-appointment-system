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
                customize: function(win) {
                    $(win.document.body).prepend(`
                    <style>
                        .bg-logo {
                            height: 100px;
                            width: 100px;
                            position: absolute;
                            right: 15px;
                            top: 2px;
                        }

                        .rmcc {
                            position: absolute;
                            left: 35px;
                            top: 30px;
                            font-size: 4vw;
                        }

                        .rmcc-label {
                            position: absolute;
                            left: 35px;
                            top: 70px;
                            font-size: 2vw;
                        }
                    </style>

                    <div class="border-bottom border-dark border-4 p-3 pb-5 mt-5 gap-3">
                        <label class="rmcc-label">#64 Rizal St. Brgy 3. Alfonso Cavite, Philippines 4123</label>
                        <h4 class="rmcc">Rodis Maternal and Childcare Clinic</h4>
                        <img class="bg-logo" src="https://live.staticflickr.com/65535/52528780717_e7d152ec00_o.png"/>
                    </div>
                    `)
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
                    customize: function(win) {
                        $(win.document.body).prepend(`
                        <style>
                            .bg-logo {
                                height: 100px;
                                width: 100px;
                                position: absolute;
                                right: 15px;
                                top: 2px;
                            }

                            .rmcc {
                                position: absolute;
                                left: 35px;
                                top: 30px;
                                font-size: 4vw;
                            }

                            .rmcc-label {
                                position: absolute;
                                left: 35px;
                                top: 70px;
                                font-size: 2vw;
                            }
                        </style>

                        <div class="border-bottom border-dark border-4 p-3 pb-5 mt-5 gap-3">
                            <label class="rmcc-label">#64 Rizal St. Brgy 3. Alfonso Cavite, Philippines 4123</label>
                            <h4 class="rmcc">Rodis Maternal and Childcare Clinic</h4>
                            <img class="bg-logo" src="https://live.staticflickr.com/65535/52528780717_e7d152ec00_o.png"/>
                        </div>
                        `)
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