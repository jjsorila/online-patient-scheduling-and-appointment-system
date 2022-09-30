$(document).ready(function (e) {

    //DATA TABLE OPTIONS
    $('#appointments').DataTable({
        lengthMenu: [[10, 20, 30, 50, -1], [10, 20, 30, 50, "All"]]
    });

    //LOGOUT ACCOUNT
    $(".logout").click(function (e) {
        $.ajax({
            url: '/client/logout',
            type: 'POST',
            success: (res) => {
                if (!res.operation) return alert("Server error");
                location.href = "/client/login"
            },
            error: (err) => {
                alert(err)
            }
        })
    })
})