$(document).ready(function(e) {

    $("div.doctor").click(function(e) {
        location.href = "/admin/accounts"
    })

    $("div.patient").click(function(e) {
        location.href = "/admin/patients"
    })

    $("div.scheduled").click(function(e) {
        location.href = "/admin/scheduled"
    })

    $("#calendar").fullCalendar({
        editable: false,
        header: {
            left: 'title',
            center: '',
            rigth: 'prev,next today'
        }
    })
})