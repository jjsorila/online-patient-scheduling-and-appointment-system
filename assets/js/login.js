$(document).ready(function (e) {

    function clearInput() {
        $("form.reg-form input[type=email]").val("")
        $("form.reg-form input[type=password]").val("")
        $("form.reg-form #confirmPassword").val("")
    }

    function getInput() {
        return {
            email: $("form.reg-form input[type=email]").val(),
            password: $("form.reg-form input[type=password]").val(),
            cPassword: $("form.reg-form #confirmPassword").val()
        }
    }

    $("#to-reg-btn").click(function (e) {
        $("form").toggleClass("slide")
    })

    $("#to-login-btn").click(function (e) {
        $("form").toggleClass("slide")
    })


    //REGISTER ACCOUNT
    $("form.reg-form").submit(function (e) {
        e.preventDefault();

        const { email, password, cPassword } = getInput()

        if (password != cPassword) return alert("Password not matched!")

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
                alert(res.operation)
                clearInput()
            },
            fail: (err) => {
                alert(err)
                clearInput()
            }
        })
    })
})