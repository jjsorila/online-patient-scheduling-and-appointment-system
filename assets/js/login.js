$(document).ready(function (e) {

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    //GET QUERY STRINGS
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    if (params.auth) {
        showToast("✖ Invalid Credentials")
    }

    //CLEAR INPUT REGISTER
    function clearInput() {
        $("form.reg-form input").val("")
        $("form.login-form input").val("")
    }

    //GET INPUT REGISTER
    function getInputRegister() {
        return {
            email: $("form.reg-form input[type=email]").val(),
            password: $("form.reg-form input[type=password]").val(),
            cPassword: $("form.reg-form #confirmPassword").val()
        }
    }

    //GET INPUT LOGIN
    function getInputLogin() {
        return {
            email: $("form.login-form input[type=email]").val(),
            password: $("form.login-form input[type=password]").val()
        }
    }

    //SLIDE LOGIN <---> REGISTER
    $("form").on("click", "#slide", function (e) {
        $("form").toggleClass("slide")
    })

    //LOGIN ACCOUNT
    $("form.login-form").submit(function(e) {
        e.preventDefault()

        const { email, password } = getInputLogin()

        $.ajax({
            url: "/client/login",
            type: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                email,
                password
            }),
            success: (res) => {
                if(!res.operation) return showToast("✖ Invalid Credentials")
                location.href = "/user"
            },
            error: (err) => {
                alert(err)
            }
        })
    })

    //REGISTER ACCOUNT
    $("form.reg-form").submit(function (e) {
        e.preventDefault();

        const { email, password, cPassword } = getInputRegister()

        if (password != cPassword) return showToast("✖ Password not matched")

        $(".loading").css("display", "block")

        $.ajax({
            url: "/client/register",
            type: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                email,
                password
            }),
            success: (res) => {
                if (!res.operation) return showToast("✖ Email already exist")
                $("form").toggleClass("slide")
                showToast("✔ Registered Successfully. Check your Mail or Spam to verify your Email Address")
                clearInput()
            },
            error: (err) => {
                alert(err)
            },
            complete: () => {
                $(".loading").css("display", "none")
            }
        })
    })

    //SHOW RESET PASSWORD FORM
    $("#reset-pwd").click(function (e) {
        $(".forgot-password").dimBackground()
        $(".forgot-password").css("display", "flex")
    })

    //HIDE RESET PASSWORD FORM
    $("#close").click(function (e) {
        $(".forgot-password").undim()
        $(".forgot-password").css("display", "none")
    })
})