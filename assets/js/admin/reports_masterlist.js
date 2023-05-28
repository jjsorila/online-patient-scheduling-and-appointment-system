$(document).ready(function(e) {

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
                data: "birthdate",
                orderable: false
            }
        ]
    })
})