$(document).ready(function(e) {
    const staff_id = $("#staff-id")
    const sFullname = $("#sFullname")
    const sRole = $("#sRole")
    const eRole = $("#eRole");
    const eFullname = $("#eFullname");

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //CLEAR INPUT
    function clearInput() {
        sFullname.val("")
        sRole.val("")
    }

    //INITIALIZE DATA
    $("table").DataTable({
        ajax: '/admin/staffs/list',
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]],
        order: [[0, 'asc']],
        columns: [
            {
                data: "fullname",
                orderable: false
            },
            {
                data: "role",
                orderable: false
            },
            {
                data: "staff_id",
                orderable: false,
                render: (id) => {
                    return (`
                        <div class="form-group d-flex justify-content-center gap-2">
                            <input type="submit" data-id=${id} class="btn btn-primary border border-3 border-dark rounded" id="edit" value="EDIT"/>
                            <input type="submit" data-id=${id} class="btn btn-danger border border-3 border-dark rounded" id="delete" value="DELETE"/>
                        </div>
                    `)
                }
            }
        ]
    })

    //SHOW ADD STAFF FORM
    $("#showForm").click(function (e) {
        $(".bg-shadow").toggleClass("d-none")
    })

    //CLOSE ADD STAFF FORM
    $(".bg-shadow").click(function (e) {
        $(this).toggleClass("d-none")
        clearInput()
    })
    $(".add-account-form").click(function (e) {
        e.stopPropagation()
    })

    //SUBMIT ADD STAFF FORM
    $("#add").click(function(e) {
        if(!sFullname.val() || !sRole.val()) return showToast("❌ Complete required fields")

        $("div.loading").css("display", "block")

        $.ajax({
            url: '/admin/staffs',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                fullname: sFullname.val(),
                role: sRole.val()
            }),
            success: (res) => {
                if(!res.operation) return showToast("❌ Something went wrong")
                $("table").DataTable().ajax.reload()
                $(".bg-shadow").toggleClass("d-none")
                showToast("✅ Added successfully")
                clearInput()
            },
            error: (err) => {
                showToast("❌ Server error")
                console.log(err)
            },
            complete: () => {
                $("div.loading").css("display", "none")
            }
        })
    })

    //DELETE STAFF
    $("table").on("click", "#delete", function(e) {
        $(".confirmation-shadow").toggleClass("d-none")
        staff_id.val($(this).attr("data-id"))
    })
    $("#yes").click(function(e) {
        const toDelete = staff_id.val()
        $(".loading").css("display", "block")

        $.ajax({
            url: `/admin/staffs?staff_id=${toDelete}`,
            type: 'DELETE',
            success: (res) => {
                if(!res.operation) return showToast("❌ Something went wrong")
                $("table").DataTable().ajax.reload()
                showToast("✅ Successfully deleted")
            },
            error: (err) => {
                showToast("❌ Server error")
                console.log(err)
            },
            complete: () => {
                $(".loading").css("display", "none")
                $(".confirmation-shadow").toggleClass("d-none")
            }
        })
    })
    $("#no").click(function (e) {
        $(".confirmation-shadow").toggleClass("d-none")
    })

    //CLOSE EDIT STAFF
    $(".edit-shadow").click(function (e) {
        $(this).toggleClass("d-none")
        clearInput()
    })

    //OPEN EDIT STAFF
    $("table").on("click", "#edit", function(e) {
        staff_id.val($(this).attr("data-id"))

        $(".loading").css("display", "block")

        $.ajax({
            url: `/admin/getinfostaff?staff_id=${staff_id.val()}`,
            type: 'GET',
            success: (res) => {
                eFullname.val(res.fullname)
                eRole.val(res.role)
                $(".edit-shadow").toggleClass("d-none")
            },
            error: (err) => {
                showToast("❌ Server error")
                console.log(err)
            },
            complete: () => {
                $(".loading").css("display", "none")
            }
        })
    })

    //EDIT STAFF
    $("#save").click(function(e) {
        if(!eRole.val() || !eFullname.val()) return showToast("❌ Complete required fields")

        $(".loading").css("display", "block")
        $.ajax({
            url: '/admin/staffs',
            type: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                staff_id: staff_id.val(),
                fullname: eFullname.val(),
                role: eRole.val()
            }),
            success: (res) => {
                if(!res.operation) return showToast("❌ Something went wrong")
                $("table").DataTable().ajax.reload()
                showToast("✅ Successfully updated")
            },
            error: (err) => {
                showToast("❌ Server error")
                console.log(err)
            },
            complete: () => {
                $(".loading").css("display", "none")
                $(".edit-shadow").toggleClass("d-none")
            }
        })
    })

})