$(document).ready(function() {
    const selectedSort = $("select")

    selectedSort.select2({
        minimumResultsForSearch: -1,
        dropdownCssClass: 'text-center'
    })
    $("span.select2").addClass("border border-4 border-dark rounded text-center w-100")

    selectedSort.change(function(e) {
        $("table").DataTable({
            ajax: `/admin/schedule/list?sort=${selectedSort.val()}`,
            lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
            columns: [
                {
                    data: "id",
                    orderable: false,
                },
                {
                    data: "fullname",
                    orderable: false,
                    render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}.`)
                },
                {
                    data: "patient_type",
                    orderable: false,
                },
                {
                    data: "apt_id",
                    orderable: false,
                    render: (apt_id) => (`<input type="submit" class="btn btn-success" data-apt-id=${apt_id} id="open-record" value="Open"/>`)
                }
            ],
            ordering: false,
            destroy: true
        });
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

    //INITIALIZE DATA TABLE
    $("table").DataTable({
        ajax: `/admin/schedule/list?sort=${selectedSort.val()}`,
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        columns: [
            {
                data: "id",
                orderable: false,
            },
            {
                data: "fullname",
                orderable: false,
                render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}.`)
            },
            {
                data: "patient_type",
                orderable: false,
            },
            {
                data: "apt_id",
                orderable: false,
                render: (apt_id) => (`<input type="submit" class="btn btn-success" data-apt-id=${apt_id} id="open-record" value="Open"/>`)
            }
        ],
        ordering: false
    });

    //CREATE MEDICAL RECORD FOR SCHEDULED PATIENT
    $("table").on("click", "input[type=submit]", function(e) {
        const apt_id = $(this).attr("data-apt-id")
        location.href = `/admin/scheduled/${apt_id}`
    })
})