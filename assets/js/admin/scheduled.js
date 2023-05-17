$(document).ready(function() {
    const selectedSort = $("input[name=selectedSort]")
    const from = $("#from")
    const to = $("#to")

    //INITIALIZE DATA TABLE
    $("table").DataTable({
        ajax: `/admin/schedule/list?sort=DAY`,
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        columns: [
            {
                data: "id"
            },
            {
                data: "fullname",
                render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}.`)
            },
            {
                data: "patient_type"
            },
            {
                data: "schedule"
            },
            {
                data: "apt_id",
                render: (apt_id) => (`<input type="submit" class="btn btn-success" data-apt-id=${apt_id} id="open-record" value="Open"/>`)
            }
        ],
        ordering: false
    });

    // selectedSort.select2({
    //     minimumResultsForSearch: -1,
    //     dropdownCssClass: 'text-center'
    // })

    $(`#from,#to`).click(function(e) {
        $("#custom").attr("checked", true)
    })

    $("span.select2").addClass("border border-4 border-dark rounded text-center w-100")

    // selectedSort.change(function(e) {
    //     $("table").DataTable({
    //         ajax: `/admin/schedule/list?sort=${selectedSort.val()}`,
    //         lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
    //         columns: [
    //             {
    //                 data: "id"
    //             },
    //             {
    //                 data: "fullname",
    //                 render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}.`)
    //             },
    //             {
    //                 data: "patient_type"
    //             },
    //             {
    //                 data: "schedule"
    //             },
    //             {
    //                 data: "apt_id",
    //                 render: (apt_id) => (`<input type="submit" class="btn btn-success" data-apt-id=${apt_id} id="open-record" value="Open"/>`)
    //             }
    //         ],
    //         ordering: false,
    //         destroy: true
    //     });
    // })

    $("#custom").change(function(e) {
        $(".date-wrapper").toggleClass("d-none")
        $("table").DataTable({
            ajax: `/admin/schedule/list?from=${from.val()}&to=${to.val()}`,
            lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
            columns: [
                {
                    data: "id"
                },
                {
                    data: "fullname",
                    render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}.`)
                },
                {
                    data: "patient_type"
                },
                {
                    data: "schedule"
                },
                {
                    data: "apt_id",
                    render: (apt_id) => (`<input type="submit" class="btn btn-success" data-apt-id=${apt_id} id="open-record" value="Open"/>`)
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
                    data: "id"
                },
                {
                    data: "fullname",
                    render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}.`)
                },
                {
                    data: "patient_type"
                },
                {
                    data: "schedule"
                },
                {
                    data: "apt_id",
                    render: (apt_id) => (`<input type="submit" class="btn btn-success" data-apt-id=${apt_id} id="open-record" value="Open"/>`)
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
                    data: "id"
                },
                {
                    data: "fullname",
                    render: ({ fname, lname, mi }) => (`${lname}, ${fname} ${mi}.`)
                },
                {
                    data: "patient_type"
                },
                {
                    data: "schedule"
                },
                {
                    data: "apt_id",
                    render: (apt_id) => (`<input type="submit" class="btn btn-success" data-apt-id=${apt_id} id="open-record" value="Open"/>`)
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
    $("table").on("click", "input[type=submit]", function(e) {
        const apt_id = $(this).attr("data-apt-id")
        location.href = `/admin/scheduled/${apt_id}`
    })
})