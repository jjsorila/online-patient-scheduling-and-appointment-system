$(document).ready(function (e) {


    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //CLEAR INPUT
    function clearInput() {
        $("form.reg-form input").val("")
        $("form.login-form input").val("")
        $(".forgot-password input").val("")
    }

    //GET INPUT REGISTER
    function getInputRegister() {
        return {
            email: $("form.reg-form input[type=email]").val(),
            password: $("form.reg-form input[type=password]").val(),
            cPassword: $("form.reg-form #confirmPassword").val(),
            username: $("form.reg-form #username").val()
        }
    }

    //GET INPUT LOGIN
    function getInputLogin() {
        return {
            email: $("form.login-form #email").val(),
            password: $("form.login-form input[type=password]").val()
        }
    }

    //SLIDE LOGIN <---> REGISTER
    $("form").on("click", "#slide", function (e) {
        $("form").toggleClass("slide")
    })

    //LOGIN ACCOUNT
    $("form.login-form").submit(function (e) {
        e.preventDefault()

        const { email, password } = getInputLogin()

        if (!email || !password) return showToast("❌ Complete all fields")

        $(".loading").css("display", "block")

        $.ajax({
            url: "/login",
            type: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                username: email,
                password
            }),
            success: (res) => {
                if (!res.operation) return showToast("❌ Invalid Credentials")
                sessionStorage.setItem("session", "true")
                location.reload(true)
            },
            error: (err) => {
                console.log(err)
            },
            complete: () => {
                $(".loading").css("display", "none")
            }
        })
    })

    //REGISTER ACCOUNT
    $("form.reg-form").submit(function (e) {
        e.preventDefault();

        const { email, password, cPassword, username } = getInputRegister()

        if (!email || !password || !cPassword || !username) return showToast("❌ Complete all fields")

        if (password != cPassword) return showToast("❌ Password not matched")

        $(".loading").css("display", "block")

        $.ajax({
            url: "/client/register",
            type: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                email,
                password,
                username
            }),
            success: (res) => {
                if (!res.operation) return showToast(`❌ ${res.msg}`)
                $("form").toggleClass("slide")
                showToast("✅ Registered Successfully")
                clearInput()
            },
            error: (err) => {
                console.log(err)
            },
            complete: () => {
                $(".loading").css("display", "none")
            }
        })
    })

    //SHOW RESET PASSWORD FORM
    $("#reset-pwd").click(function (e) {
        return showToast("❌ Mail server trial expired")
        $(".forgot-password").dimBackground()
        $(".forgot-password").css("display", "flex")
    })

    //HIDE RESET PASSWORD FORM
    $("#close").click(function (e) {
        $(".forgot-password").undim()
        $(".forgot-password").css("display", "none")
    })

    //SEND RESET PASSWORD LINK
    $(".forgot-password #btn-send-reset").click(function (e) {
        // return showToast("❌ Mail server trial expired")
        const email = $(".forgot-password input")
        if (!email.val()) return showToast("❌ Email Required")

        $('.loading').css("display", "block")

        $.ajax({
            url: "/client/reset",
            type: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                email: email.val()
            }),
            success: (res) => {
                if (!res.verified) return showToast("❌ Email not yet verified")
                if (!res.found) return showToast("❌ Email not found")

                showToast("✅ Link sent to your Email")
                email.val("")
                $(".forgot-password").undim()
                $(".forgot-password").css("display", "none")
            },
            error: (err) => {
                console.log(err)
            },
            complete: () => {
                $('.loading').css("display", "none")
            }
        })
    })
})