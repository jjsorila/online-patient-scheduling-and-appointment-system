$(document).ready(function (e) {

    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    $("input[type=submit]").click(function (e) {
        const newPassword = $("#password").val(),
            cPassword = $("#cPassword").val(),
            email = $("input[type=hidden]").val();

        if (!newPassword || !cPassword) return showToast("❌ Complete all fields")
        if (cPassword != newPassword) return showToast("❌ Password not matched")

        $(".loading").css("display", "block")

        $.ajax({
            url: '/client/reset',
            type: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                email,
                newPassword
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Old password matched")
                location.href = "/client/login"
            },
            error: (err) => {
                alert(err)
            },
            complete: () => {
                $(".loading").css("display", "none")
            }
        })
    })
})