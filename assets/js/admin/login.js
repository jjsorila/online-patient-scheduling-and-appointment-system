$(document).ready(function(e) {
    const username = $("#username")
    const password = $("#password")

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //LOGIN ADMIN ACCOUNT
    $("form").submit(function(e) {
        e.preventDefault()

        if(!password.val() || !username.val()) return showToast("❌ Complete required fields!")

        $(".loading").css("display", "block")

        $.ajax({
            url: '/admin/login',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                username: username.val(),
                password: password.val()
            }),
            success: (res) => {
                if(!res.operation) return showToast("❌ Invalid credentials")
                location.href = '/admin/dashboard'
            },
            error: (err) => {
                console.log(err)
                showToast("❌ Something went wrong")
            },
            complete: () => {
                $(".loading").css("display", "none")
            }
        })
    })
})