$(document).ready(function(e) {
    const startDay = $("#startDay")
    const endDay = $("#endDay")
    const startTime = $("#startTime")
    const endTime = $("#endTime")

    //SHOW TOAST
    function showToast(text) {
        $(".toast-body").text(text)
        $(".toast").toast("show")
    }

    $("div.doctor").click(function(e) {
        location.href = "/admin/accounts"
    })

    $("div.patient").click(function(e) {
        location.href = "/admin/patients"
    })

    $("div.scheduled").click(function(e) {
        location.href = "/admin/scheduled"
    })

    $("div.staffs").click(function(e) {
        location.href = "/admin/staffs"
    })

    $("#calendar").fullCalendar({
        editable: false,
        header: {
            left: 'title',
            center: '',
            rigth: 'prev,next today'
        }
    })

    $("#edit").click(function(e) {
        $(this).toggleClass("d-none")
        $("#save").toggleClass("d-none")
        $(window).on('beforeunload', function(){
            return 'Are you sure you want to leave?';
        });
        $("input[type=time],select").prop("disabled", false)
    })

    $("#save").click(function(e) {
        if(!startDay.val() || !endDay.val() || !startTime.val() || !endTime.val()) return showToast("❌ Complete all fields")

        $(this).toggleClass("d-none")
        $("#edit").toggleClass("d-none")
        $(window).off('beforeunload');
        $("input[type=time],select").prop("disabled", true)
        $(".loading").css({ display: "block" })

        $.ajax({
            type: "PUT",
            url: "/admin/timeslot",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                startDay: startDay.val(),
                endDay: endDay.val(),
                startTime: startTime.val(),
                endTime: endTime.val()
            }),
            success: (res) => {
                showToast(`✅ ${res.msg}`)
            },
            error: (err) => {
                console.log(err)
                showToast("❌ Server error")
            },
            complete: () => {
                $(".loading").css({ display: "none" })
            }
        })
    })
})