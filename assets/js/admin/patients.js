$(document).ready(function (e) {

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //INITIALIZE DATATABLE
    $("table").DataTable({
        ajax: `/admin/list/patients`,
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        columns: [
            { data: "fullname" },
            {
                data: "id",
                render: (data) => (`<input type="submit" data-id=${data} class='btn btn-success' value='Open'/>`)
            }
        ],
        ordering: false,
    });

    //RELOAD DATATABLE
    $("#reload").click(function(e) {
        $("table").DataTable().ajax.reload()
    })

    //LOGOUT ACCOUNT
    $("#logout").click(function (e) {
        $.ajax({
            url: '/admin/logout',
            type: 'POST',
            success: (res) => {
                if (!res.operation) return showToast("❌ Something went wrong")
                location.href = '/admin/login'
            },
            error: (err) => {
                console.log(err)
                showToast("❌ Something went wrong")
            }
        })
    })

    //OPEN PATIENT INFO
    $("table").on("click", "input[type=submit]", function(e) {
        let patient_id = $(this).attr("data-id")
        location.href = `/admin/patients/${patient_id}`
    })

    //ADD PATIENT BUTTON
    $("#add-patient").click(function(e) {
        $(".bg-shadow").toggleClass("d-none")
    })
})