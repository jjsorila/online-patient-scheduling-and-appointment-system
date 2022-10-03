$(document).ready(function (e) {

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //LOGOUT ACCOUNT
    $("button").click(function (e) {
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
})